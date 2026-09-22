import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

const META_VERIFY_TOKEN = 'goeuro_fb_verify_token_2026';

// 1. Meta Webhook Verification Handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge || 'VERIFIED', { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// 2. Meta Lead Ad & Messenger Webhook Ingestion
export async function POST(req: NextRequest) {
  let rawBodyText = '';
  try {
    rawBodyText = await req.text();
    const payload = rawBodyText ? JSON.parse(rawBodyText) : {};

    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Extract lead attributes from Meta Lead Ads payload or direct format
    let fullName = payload.fullName || payload.name || '';
    let phone = payload.phone || payload.phoneNumber || null;
    let email = payload.email || null;
    let adId = payload.adId || payload.ad_id || null;
    let adName = payload.adName || payload.ad_name || 'Facebook Lead Ad';
    let campaignName = payload.campaignName || payload.campaign_name || 'Ausbildung Meta Campaign';
    let rawQuestions = '';

    // Handle nested Meta webhook structure: entry -> changes -> value -> field_data
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const val = change.value || {};
            adId = val.ad_id || adId;
            if (val.field_data && Array.isArray(val.field_data)) {
              for (const field of val.field_data) {
                const fName = (field.name || '').toLowerCase();
                const fVal = Array.isArray(field.values) ? field.values[0] : field.values;
                if (fName.includes('name') || fName.includes('full_name')) fullName = fVal;
                else if (fName.includes('phone') || fName.includes('number')) phone = fVal;
                else if (fName.includes('email')) email = fVal;
                else rawQuestions += `${field.name}: ${fVal} | `;
              }
            }
          }
        }
      }
    }

    fullName = fullName || 'Facebook Student Lead';
    const contactHandle = phone || email || payload.messengerId || 'FB Inquirer';
    const preferredContact = phone ? 'VIBER' : 'TELEGRAM';

    // Pathway matching from ad name or payload
    let matchedPathway = null;
    const searchTarget = (adName + ' ' + campaignName + ' ' + (payload.pathway || '')).toLowerCase();
    if (searchTarget.includes('uni') || searchTarget.includes('master') || searchTarget.includes('bachelor')) {
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
        channel: 'FACEBOOK',
        externalId: adId ? `fb_ad_${adId}` : `fb_${Date.now()}`,
        rawMetadata: JSON.stringify({
          adId,
          adName,
          campaignName,
          rawQuestions: rawQuestions || undefined,
        }),
        utmSource: 'facebook',
        utmMedium: 'lead_ad',
        notes: `Facebook Lead: ${adName} (${campaignName}). ${rawQuestions}`.trim(),
        ownerId: counselorUser ? counselorUser.id : null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        nextAction: 'Initiate 1-on-1 profile assessment on Viber/Telegram',
        nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        consentGiven: true,
      },
    });

    // Record Ingestion Log
    await prisma.ingestionLog.create({
      data: {
        orgId: org.id,
        channel: 'FACEBOOK',
        status: duplicateOfId ? 'DUPLICATE' : 'SUCCESS',
        senderIp: req.headers.get('x-forwarded-for') || 'meta-webhook',
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
        channel: 'FACEBOOK',
        fullName: lead.fullName,
        adName,
        isDuplicate: !!duplicateOfId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Facebook lead successfully ingested into GOEURO CRM',
      leadId: lead.id,
      duplicate: !!duplicateOfId,
      assignedCounselor: counselorUser?.name || 'Unassigned',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Facebook webhook error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
