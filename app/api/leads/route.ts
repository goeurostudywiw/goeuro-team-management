import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'lead:read');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const ownerId = searchParams.get('ownerId');
    const pathwayId = searchParams.get('pathwayId');
    const search = searchParams.get('search');

    const where: any = {};
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    if (pathwayId) where.interestedPathwayId = pathwayId;

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { contactHandle: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        interestedPathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        contacts: { orderBy: { createdAt: 'desc' }, take: 5 },
        case: { select: { id: true, status: true } },
        recordings: { orderBy: { createdAt: 'desc' }, take: 10 },
        snapshots: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'lead:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      preferredContact,
      contactHandle,
      interestedPathwayId,
      educationStatus,
      sourceCampaignId,
      utmSource,
      notes,
      ownerId,
    } = body;

    if (!fullName || !contactHandle || !educationStatus) {
      return NextResponse.json({ error: 'Name, contact handle, and education status are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    // Check for duplicate lead by contactHandle, phone, or email
    let duplicateOfId: string | null = null;
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { contactHandle: { equals: contactHandle } },
          phone ? { phone: { equals: phone } } : {},
          email ? { email: { equals: email } } : {},
        ].filter((c) => Object.keys(c).length > 0),
      },
    });

    if (existing) {
      duplicateOfId = existing.id;
    }

    const lead = await prisma.lead.create({
      data: {
        orgId: org.id,
        fullName,
        phone: phone || null,
        email: email || null,
        preferredContact: preferredContact || 'TELEGRAM',
        contactHandle,
        interestedPathwayId: interestedPathwayId || null,
        educationStatus,
        sourceCampaignId: sourceCampaignId || null,
        utmSource: utmSource || 'manual_entry',
        notes: notes || null,
        ownerId: ownerId || auth.user?.id || null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        consentGiven: true,
        consentDate: new Date(),
      },
      include: {
        interestedPathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'CREATE',
      details: { fullName, preferredContact, utmSource, duplicateOfId },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'lead:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, stage, ownerId, nextAction, nextFollowUpDate, qualificationNotes, notes } = body;

    if (!id) return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });

    const updateData: any = {};
    if (stage !== undefined) updateData.stage = stage;
    if (ownerId !== undefined) updateData.ownerId = ownerId;
    if (nextAction !== undefined) updateData.nextAction = nextAction;
    if (nextFollowUpDate !== undefined) {
      updateData.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    }
    if (qualificationNotes !== undefined) updateData.qualificationNotes = qualificationNotes;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        interestedPathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'LEAD',
        entityId: id,
        action: stage ? `STAGE_${stage}` : (ownerId ? 'REASSIGN' : 'UPDATE'),
        details: updateData,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
