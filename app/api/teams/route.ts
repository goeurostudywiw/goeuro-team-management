import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, title: true, avatar: true } },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(teams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'team:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { name, description, managerId } = body;

    if (!name) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const team = await prisma.team.create({
      data: {
        orgId: org.id,
        name,
        description,
        managerId: managerId || null,
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'TEAM',
      entityId: team.id,
      action: 'CREATE',
      details: { name, description, managerId },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
