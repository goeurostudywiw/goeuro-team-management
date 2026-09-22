import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'task:read');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const assigneeId = searchParams.get('assigneeId');
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const pathwayId = searchParams.get('pathwayId');

    const where: any = {};
    if (assigneeId) where.assigneeId = assigneeId;
    if (teamId) where.teamId = teamId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (pathwayId) where.pathwayId = pathwayId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, title: true, avatar: true } },
        team: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'task:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { title, description, assigneeId, teamId, priority, dueDate, isRecurring, recurringRule, pathwayId } = body;

    if (!title) return NextResponse.json({ error: 'Task title is required' }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const task = await prisma.task.create({
      data: {
        orgId: org.id,
        title,
        description,
        assigneeId: assigneeId || null,
        ownerId: auth.user?.id || null,
        teamId: teamId || null,
        pathwayId: pathwayId || null,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        isRecurring: !!isRecurring,
        recurringRule: recurringRule || null,
      },
      include: {
        assignee: { select: { id: true, name: true, title: true, avatar: true } },
        team: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'TASK',
      entityId: task.id,
      action: 'CREATE',
      details: { title, assigneeId, priority },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'task:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, status, assigneeId, priority, dueDate, comment } = body;

    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'DONE') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, title: true, avatar: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (comment && comment.trim()) {
      await prisma.taskComment.create({
        data: {
          taskId: id,
          authorName: auth.user?.name || 'Staff Member',
          content: comment.trim(),
        },
      });
    }

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'TASK',
        entityId: id,
        action: assigneeId ? 'REASSIGN' : (status ? 'STATUS_CHANGE' : 'UPDATE'),
        details: updateData,
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
