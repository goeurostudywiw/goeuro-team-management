import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'content:read');
    if (!auth.authorized) return auth.response;

    const campaigns = await prisma.campaign.findMany({
      include: {
        pathway: true,
        _count: {
          select: { content: true, leads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'content:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { name, pathwayId, objective, budget } = body;

    if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const campaign = await prisma.campaign.create({
      data: {
        orgId: org.id,
        name,
        pathwayId: pathwayId || null,
        objective,
        budget: budget ? parseFloat(budget) : 0,
        status: 'ACTIVE',
      },
      include: { pathway: true },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'CAMPAIGN',
      entityId: campaign.id,
      action: 'CREATE',
      details: { name, budget },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
