import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'role:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) return NextResponse.json({ error: 'Role name is required' }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const role = await prisma.role.create({
      data: {
        orgId: org.id,
        name,
        description,
        permissions: JSON.stringify(permissions || []),
        isSystem: false,
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'ROLE',
      entityId: role.id,
      action: 'CREATE',
      details: { name, permissions },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'role:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, name, description, permissions } = body;

    if (!id) return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);

    const updated = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'ROLE',
        entityId: id,
        action: 'UPDATE_PERMISSIONS',
        details: updateData,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
