import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  let rawBodyText = '';
  try {
    rawBodyText = await req.text();
    const payload = rawBodyText ? JSON.parse(rawBodyText) : {};

    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const fullName = payload.fullName || payload.name || 'Live Webhook Inquirer';
    const contactHandle = payload.contactHandle || payload.phone || payload.email || payload.handle || 'Webhook Handle';
    const phone = payload.phone || null;
    const email = payload.email || null;
    const channel = (payload.channel || 'LIVE_WEBHOOK').toUpperCase();
    const preferredContact = (payload.preferredContact || (phone ? 'VIBER' : 'TELEGRAM')).toUpperCase();

    // Pathway matching
    let matchedPathway = null;
    if (payload.pathwayCode) {
      matchedPathway = await prisma.pathway.findFirst({ where: { code: payload.pathwayCode } });
    } else if (payload.pathwayId) {
      matchedPathway = await prisma.pathway.findUnique({ where: { id: payload.pathwayId } });
    } else {
      matchedPathway = await prisma.pathway.findFirst();
    }

    // Duplicate detection
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

    // Assign to active counselor
    const counselorUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'kmh@goeuro.de' },
          { role: { name: { contains: 'Counselor' } } },
        ],
        status: 'ACTIVE',
      },
    });

    const lead = await prisma.lead.create({
      data: {
        orgId: org.id,
        fullName: fullName.trim(),
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
        preferredContact,
        contactHandle: contactHandle.trim(),
        interestedPathwayId: matchedPathway ? matchedPathway.id : null,
        educationStatus: payload.educationStatus || 'HIGH_SCHOOL',
        channel: channel,
        externalId: payload.externalId || `live_${Date.now()}`,
        rawMetadata: JSON.stringify(payload),
        utmSource: payload.utmSource || 'live_webhook',
        utmMedium: payload.utmMedium || 'api',
        notes: payload.notes || 'Ingested via Universal Live Webhook',
        ownerId: counselorUser ? counselorUser.id : null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        nextAction: 'Profile screening & counselor contact',
        nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        consentGiven: true,
      },
    });

    // Record Ingestion Log
    await prisma.ingestionLog.create({
      data: {
        orgId: org.id,
        channel: channel,
        status: duplicateOfId ? 'DUPLICATE' : 'SUCCESS',
        senderIp: req.headers.get('x-forwarded-for') || 'live-api',
        leadId: lead.id,
        leadName: lead.fullName,
        payload: rawBodyText.slice(0, 4000),
      },
    });

    await logAudit({
      orgId: org.id,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'LIVE_DATA_INGESTED',
      details: {
        channel,
        fullName: lead.fullName,
        isDuplicate: !!duplicateOfId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Live data successfully ingested into GOEURO CRM',
      leadId: lead.id,
      duplicate: !!duplicateOfId,
      assignedCounselor: counselorUser?.name || 'Unassigned',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Live webhook error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
