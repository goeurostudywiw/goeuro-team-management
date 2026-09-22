import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth-server';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    const userId = user?.id;
    const userPermissions = user?.role?.permissions || '[]';

    const canViewLeads = hasPermission(userPermissions, 'lead:read');
    const canViewCases = hasPermission(userPermissions, 'case:read');
    const isManagerOrAdmin = hasPermission(userPermissions, 'team:manage') || hasPermission(userPermissions, '*');

    const now = new Date();

    // 1. User's Assigned Tasks
    const myTasks = userId
      ? await prisma.task.findMany({
          where: {
            assigneeId: userId,
            status: { not: 'DONE' },
          },
          include: { team: true },
          orderBy: { dueDate: 'asc' },
          take: 6,
        })
      : [];

    // 2. Overdue Tasks (for Manager / Org view)
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        team: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 6,
    });

    // 3. Pending Approvals for Me
    let pendingApprovalWhere: any = {};
    if (user?.email === 'nay@goeuro.de') {
      pendingApprovalWhere = { stage: 'FACTUAL_REVIEW' };
    } else if (user?.email === 'thn@goeuro.de' || isManagerOrAdmin) {
      pendingApprovalWhere = { stage: { in: ['FACTUAL_REVIEW', 'BRAND_APPROVAL'] } };
    } else {
      pendingApprovalWhere = {
        OR: [
          { factualReviewerId: userId, stage: 'FACTUAL_REVIEW' },
          { brandApproverId: userId, stage: 'BRAND_APPROVAL' },
        ],
      };
    }

    const pendingApprovals = await prisma.contentItem.findMany({
      where: pendingApprovalWhere,
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 4. Scheduled Content
    const scheduledContent = await prisma.contentItem.findMany({
      where: { stage: 'SCHEDULED' },
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { plannedDate: 'asc' },
      take: 5,
    });

    // 5. Leads Needing Follow-up (Only if user has lead:read permission!)
    let leadsNeedingFollowUp: any[] = [];
    let totalLeadsCount = 0;
    if (canViewLeads) {
      totalLeadsCount = await prisma.lead.count();
      leadsNeedingFollowUp = await prisma.lead.findMany({
        where: {
          stage: { notIn: ['CLOSED_LOST', 'CLOSED_WON'] },
          OR: [
            { ownerId: userId },
            { ownerId: null },
            ...(isManagerOrAdmin ? [{}] : []),
          ],
        },
        include: {
          interestedPathway: true,
          owner: { select: { id: true, name: true } },
        },
        orderBy: [
          { nextFollowUpDate: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 6,
      });
    }

    // 6. Case Milestones (Only if user has case:read permission!)
    let caseMilestones: any[] = [];
    let activeCasesCount = 0;
    if (canViewCases) {
      activeCasesCount = await prisma.studentCase.count({ where: { status: 'ACTIVE' } });
      caseMilestones = await prisma.caseMilestone.findMany({
        where: { status: { not: 'COMPLETED' } },
        include: {
          studentCase: {
            include: {
              pathway: true,
              owner: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });
    }

    // 7. Content Output KPIs (Slide 10 of PPTX)
    const publishedContentCount = await prisma.contentItem.count({
      where: { stage: { in: ['PUBLISHED', 'RESULTS_RECORDED'] } },
    });

    const germanyVideosCount = await prisma.contentItem.count({
      where: {
        format: 'REEL',
        channel: { in: ['TIKTOK', 'INSTAGRAM', 'FACEBOOK'] },
      },
    });

    const totalTasksCount = await prisma.task.count();
    const completedTasksCount = await prisma.task.count({ where: { status: 'DONE' } });
    const openTasksCount = await prisma.task.count({ where: { status: { not: 'DONE' } } });
    const newLeadsCount = await prisma.lead.count({ where: { stage: 'NEW' } });
    const pendingApprovalsCount = pendingApprovals.length;

    return NextResponse.json({
      user: {
        id: user?.id,
        name: user?.name,
        role: user?.role?.name,
        permissions: userPermissions,
      },
      isPreLaunchZeroLeads: totalLeadsCount === 0,
      totalLeadsCount,
      newLeadsCount,
      activeCasesCount,
      totalTasksCount,
      completedTasksCount,
      openTasksCount,
      pendingApprovalsCount,
      publishedContentCount,
      contentTargetMonth: '20–30',
      germanyVideosCount,
      germanyVideosTarget: '10–12',
      myTasks,
      overdueTasks,
      pendingApprovals,
      scheduledContent,
      leadsNeedingFollowUp,
      caseMilestones,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
