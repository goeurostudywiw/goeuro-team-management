import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'user:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const {
      fromUserId,
      toUserId,
      reassignTasks = true,
      reassignLeads = true,
      reassignContent = true,
      reassignCases = true,
      deactivateDepartingUser = true,
      reason = 'Staff departure / role reorganization',
    } = body;

    if (!fromUserId || !toUserId) {
      return NextResponse.json({ error: 'Both fromUserId and toUserId are required' }, { status: 400 });
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Cannot reassign items to the same user' }, { status: 400 });
    }

    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } });
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } });

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'One or both users not found' }, { status: 404 });
    }

    const stats = {
      tasksReassigned: 0,
      leadsReassigned: 0,
      contentReassigned: 0,
      casesReassigned: 0,
    };

    // 1. Reassign Open Tasks
    if (reassignTasks) {
      const taskResult = await prisma.task.updateMany({
        where: {
          assigneeId: fromUserId,
          status: { not: 'DONE' },
        },
        data: { assigneeId: toUserId },
      });
      stats.tasksReassigned = taskResult.count;
    }

    // 2. Reassign Open Leads
    if (reassignLeads) {
      const leadResult = await prisma.lead.updateMany({
        where: {
          ownerId: fromUserId,
          stage: { notIn: ['CLOSED_LOST', 'CLOSED_WON'] },
        },
        data: { ownerId: toUserId },
      });
      stats.leadsReassigned = leadResult.count;
    }

    // 3. Reassign In-Progress Content
    if (reassignContent) {
      const contentResult = await prisma.contentItem.updateMany({
        where: {
          ownerId: fromUserId,
          stage: { notIn: ['PUBLISHED', 'RESULTS_RECORDED'] },
        },
        data: { ownerId: toUserId },
      });
      stats.contentReassigned = contentResult.count;
    }

    // 4. Reassign Active Student Cases + create handover records
    if (reassignCases) {
      const activeCases = await prisma.studentCase.findMany({
        where: {
          ownerId: fromUserId,
          status: 'ACTIVE',
        },
      });

      for (const c of activeCases) {
        await prisma.studentCase.update({
          where: { id: c.id },
          data: { ownerId: toUserId },
        });

        await prisma.caseHandover.create({
          data: {
            caseId: c.id,
            fromUserId,
            toUserId,
            reason,
            handoverNotes: `Bulk reassignment via offboarding wizard from ${fromUser.name} to ${toUser.name}`,
          },
        });
      }
      stats.casesReassigned = activeCases.length;
    }

    // 5. Deactivate departing user if requested
    if (deactivateDepartingUser) {
      await prisma.user.update({
        where: { id: fromUserId },
        data: { status: 'INACTIVE' },
      });
    }

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'USER',
        entityId: fromUserId,
        action: 'STAFF_OFFBOARDING_REASSIGNMENT',
        details: {
          fromUser: { id: fromUser.id, name: fromUser.name },
          toUser: { id: toUser.id, name: toUser.name },
          stats,
          deactivated: deactivateDepartingUser,
          reason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      fromUser: { id: fromUser.id, name: fromUser.name },
      toUser: { id: toUser.id, name: toUser.name },
      stats,
      deactivated: deactivateDepartingUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
