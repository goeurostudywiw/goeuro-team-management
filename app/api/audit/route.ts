import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'report:view');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');

    const where: any = {};
    if (entityType) where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
