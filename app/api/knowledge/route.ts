import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'knowledge:read');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { contentEn: { contains: search } },
        { contentMm: { contains: search } },
      ];
    }

    const items = await prisma.knowledgeItem.findMany({
      where,
      include: { pathway: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'knowledge:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { category, title, contentEn, contentMm, pathwayId, status } = body;

    if (!category || !title || (!contentEn && !contentMm)) {
      return NextResponse.json({ error: 'Category, title, and content are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const item = await prisma.knowledgeItem.create({
      data: {
        orgId: org.id,
        category,
        title,
        contentEn: contentEn || '',
        contentMm: contentMm || '',
        pathwayId: pathwayId || null,
        ownerName: auth.user?.name || 'Staff Member',
        status: status || 'APPROVED',
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'KNOWLEDGE',
      entityId: item.id,
      action: 'CREATE',
      details: { title, category },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'knowledge:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, status, title, contentEn, contentMm } = body;

    if (!id) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    const updated = await prisma.knowledgeItem.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(contentEn !== undefined && { contentEn }),
        ...(contentMm !== undefined && { contentMm }),
        reviewerName: auth.user?.name || 'Reviewer',
        lastReviewDate: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
