import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/auth-crypto';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        teams: {
          include: {
            team: true,
          },
        },
        manager: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'user:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { name, email, title, roleId, teamIds, managerId, password } = body;

    if (!name || !email || !roleId) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        orgId: org.id,
        name,
        email,
        title: title || 'Team Member',
        roleId,
        managerId: managerId || null,
        passwordHash: hashPassword(password || 'Goeuro2026!'),
        status: 'ACTIVE',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      await prisma.userTeam.createMany({
        data: teamIds.map((tId: string) => ({
          userId: newUser.id,
          teamId: tId,
        })),
      });
    }

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'USER',
      entityId: newUser.id,
      action: 'CREATE',
      details: { name, email, roleId, teamIds },
    });

    const created = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        role: true,
        teams: { include: { team: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'user:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, status, title, roleId, teamIds, managerId } = body;

    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (managerId !== undefined) updateData.managerId = managerId;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (teamIds && Array.isArray(teamIds)) {
      await prisma.userTeam.deleteMany({ where: { userId: id } });
      await prisma.userTeam.createMany({
        data: teamIds.map((tId: string) => ({
          userId: id,
          teamId: tId,
        })),
      });
    }

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'USER',
        entityId: id,
        action: status === 'INACTIVE' ? 'DEACTIVATE' : 'UPDATE',
        details: updateData,
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        teams: { include: { team: true } },
      },
    });

    return NextResponse.json(finalUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
