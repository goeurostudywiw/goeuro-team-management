import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'content:read');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const pathwayId = searchParams.get('pathwayId');
    const stage = searchParams.get('stage');

    const where: any = {};
    if (pathwayId) where.pathwayId = pathwayId;
    if (stage) where.stage = stage;

    const items = await prisma.contentItem.findMany({
      where,
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        factualReviewer: { select: { id: true, name: true, avatar: true } },
        brandApprover: { select: { id: true, name: true, avatar: true } },
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'content:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const {
      topic,
      pathwayId,
      campaignId,
      pillar,
      channel,
      format,
      targetAudience,
      sourceLinks,
      assetUrl,
      callToAction,
      plannedDate,
      factualReviewerId,
      brandApproverId,
    } = body;

    if (!topic || !pillar || !channel || !format) {
      return NextResponse.json({ error: 'Topic, pillar, channel, and format are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const item = await prisma.contentItem.create({
      data: {
        orgId: org.id,
        topic,
        pathwayId: pathwayId || null,
        campaignId: campaignId || null,
        pillar,
        channel,
        format,
        targetAudience: targetAudience || null,
        ownerId: auth.user?.id || '',
        factualReviewerId: factualReviewerId || null,
        brandApproverId: brandApproverId || null,
        sourceLinks: sourceLinks ? JSON.stringify(sourceLinks) : '[]',
        assetUrl: assetUrl || null,
        callToAction: callToAction || null,
        plannedDate: plannedDate ? new Date(plannedDate) : null,
        stage: 'IDEA',
      },
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        factualReviewer: { select: { id: true, name: true, avatar: true } },
        brandApprover: { select: { id: true, name: true, avatar: true } },
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'CONTENT',
      entityId: item.id,
      action: 'CREATE',
      details: { topic, channel, format, pillar },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'content:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, stage, publishedUrl, metrics, assetUrl, callToAction, plannedDate } = body;

    if (!id) return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Content item not found' }, { status: 404 });

    // Validate approval permissions
    if (stage === 'BRAND_APPROVAL' && existing.stage === 'FACTUAL_REVIEW') {
      const factualAuth = await requirePermission(req, 'content:factual_review');
      if (!factualAuth.authorized) return factualAuth.response;
    }

    if (stage === 'SCHEDULED' && existing.stage === 'BRAND_APPROVAL') {
      const brandAuth = await requirePermission(req, 'content:brand_approve');
      if (!brandAuth.authorized) return brandAuth.response;
    }

    const updateData: any = {};
    if (stage !== undefined) updateData.stage = stage;
    if (publishedUrl !== undefined) {
      updateData.publishedUrl = publishedUrl;
      updateData.publishedAt = new Date();
    }
    if (metrics !== undefined) updateData.metrics = JSON.stringify(metrics);
    if (assetUrl !== undefined) updateData.assetUrl = assetUrl;
    if (callToAction !== undefined) updateData.callToAction = callToAction;
    if (plannedDate !== undefined) updateData.plannedDate = plannedDate ? new Date(plannedDate) : null;

    const updated = await prisma.contentItem.update({
      where: { id },
      data: updateData,
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        factualReviewer: { select: { id: true, name: true, avatar: true } },
        brandApprover: { select: { id: true, name: true, avatar: true } },
      },
    });

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'CONTENT',
        entityId: id,
        action: stage ? `STAGE_${stage}` : 'UPDATE',
        details: { stage, publishedUrl, metrics },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
