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

    const fullName = payload.fullName || payload.name || payload['name'] || 'TikTok Student Inquirer';
    const phone = payload.phone || payload.phoneNumber || null;
    const email = payload.email || null;
    const tiktokHandle = payload.tiktokHandle || payload.tiktokUser || null;
    const contactHandle = payload.contactHandle || tiktokHandle || phone || email || 'TikTok Inquirer';
    const preferredContact = (payload.preferredContact || (phone ? 'VIBER' : 'TELEGRAM')).toUpperCase();

    const videoId = payload.videoId || payload.video_id || null;
    const videoTitle = payload.videoTitle || 'Hamburg Living POV / Ausbildung Reality';
    const campaignName = payload.campaignName || 'TikTok Organic Hamburg Reel';

    // Pathway matching
    let matchedPathway = null;
    const pathwayText = (payload.pathway || payload.interest || '').toLowerCase();
    if (pathwayText.includes('uni') || pathwayText.includes('master') || pathwayText.includes('bachelor')) {
      matchedPathway = await prisma.pathway.findFirst({ where: { code: 'PUBLIC_UNIVERSITY' } });
    } else {
      matchedPathway = await prisma.pathway.findFirst({ where: { code: 'AUSBILDUNG' } });
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

    // Assign to active counselor (KMH by default)
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
        channel: 'TIKTOK',
        externalId: payload.leadId || payload.lead_id || `tt_${Date.now()}`,
        rawMetadata: JSON.stringify({
          videoId,
          videoTitle,
          tiktokHandle,
          campaignName,
        }),
        utmSource: 'tiktok',
        utmMedium: payload.utmMedium || 'bio_link',
        notes: `TikTok Inquiry from ${videoTitle} (@${tiktokHandle || 'anonymous'}). Notes: ${payload.notes || 'None'}`.trim(),
        ownerId: counselorUser ? counselorUser.id : null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        nextAction: 'Counselor review TikTok student background & reach out',
        nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        consentGiven: true,
      },
    });

    // Record Ingestion Log
    await prisma.ingestionLog.create({
      data: {
        orgId: org.id,
        channel: 'TIKTOK',
        status: duplicateOfId ? 'DUPLICATE' : 'SUCCESS',
        senderIp: req.headers.get('x-forwarded-for') || 'tiktok-webhook',
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
        channel: 'TIKTOK',
        fullName: lead.fullName,
        videoTitle,
        isDuplicate: !!duplicateOfId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'TikTok lead successfully ingested into GOEURO CRM',
      leadId: lead.id,
      duplicate: !!duplicateOfId,
      assignedCounselor: counselorUser?.name || 'Unassigned',
    }, { status: 201 });
  } catch (error: any) {
    console.error('TikTok webhook error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
