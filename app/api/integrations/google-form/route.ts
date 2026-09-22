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

    // Flexible extraction supporting varied Google Form question field names
    const fullName =
      payload.fullName ||
      payload['Full Name'] ||
      payload['Name'] ||
      payload.name ||
      payload['Student Name'] ||
      payload['နာမည်'] ||
      'Anonymous Student';

    const phone =
      payload.phone ||
      payload['Phone'] ||
      payload['Phone Number'] ||
      payload['Viber'] ||
      payload['Viber Number'] ||
      payload['ဖုန်းနံပါတ်'] ||
      null;

    const telegram =
      payload.telegram ||
      payload['Telegram'] ||
      payload['Telegram Handle'] ||
      payload['Telegram Username'] ||
      null;

    const email =
      payload.email ||
      payload['Email'] ||
      payload['Email Address'] ||
      null;

    let preferredContact = (
      payload.preferredContact ||
      payload['Preferred Contact Method'] ||
      payload['Contact Via'] ||
      (telegram ? 'TELEGRAM' : phone ? 'VIBER' : 'EMAIL')
    ).toUpperCase();

    if (!['TELEGRAM', 'VIBER', 'WHATSAPP', 'PHONE', 'EMAIL'].includes(preferredContact)) {
      preferredContact = telegram ? 'TELEGRAM' : phone ? 'VIBER' : 'EMAIL';
    }

    const contactHandle =
      telegram ||
      phone ||
      payload.contactHandle ||
      payload['Contact Handle'] ||
      email ||
      'No contact handle';

    // Pathway matching
    const pathwayInput = (
      payload.pathway ||
      payload['Interested Pathway'] ||
      payload['Program'] ||
      payload['Pathway'] ||
      ''
    ).toLowerCase();

    let matchedPathway = null;
    if (pathwayInput.includes('ausbildung') || pathwayInput.includes('vocational') || pathwayInput.includes('အလုပ်သင်')) {
      matchedPathway = await prisma.pathway.findFirst({ where: { code: 'AUSBILDUNG' } });
    } else if (pathwayInput.includes('uni') || pathwayInput.includes('master') || pathwayInput.includes('bachelor') || pathwayInput.includes('တက္ကသိုလ်')) {
      matchedPathway = await prisma.pathway.findFirst({ where: { code: 'PUBLIC_UNIVERSITY' } });
    }

    if (!matchedPathway) {
      matchedPathway = await prisma.pathway.findFirst();
    }

    // Education background normalization
    let educationStatus = (
      payload.educationStatus ||
      payload['Education Background'] ||
      payload['Current Education'] ||
      'HIGH_SCHOOL'
    ).toUpperCase();

    if (educationStatus.includes('BACHELOR') || educationStatus.includes('DEGREE')) educationStatus = 'BACHELOR';
    else if (educationStatus.includes('DIPLOMA')) educationStatus = 'DIPLOMA';
    else if (educationStatus.includes('WORK')) educationStatus = 'WORKING';
    else if (educationStatus.includes('GED')) educationStatus = 'GED';
    else educationStatus = 'HIGH_SCHOOL';

    const germanLevel = payload.germanLevel || payload['German Level'] || payload['German Proficiency'] || null;
    const userNotes = payload.notes || payload['Questions'] || payload['Message'] || payload['Additional Info'] || '';
    const combinedNotes = [
      germanLevel ? `German Level: ${germanLevel}` : null,
      userNotes ? `Student Message: ${userNotes}` : null,
      payload.formTitle ? `Form: ${payload.formTitle}` : null,
    ].filter(Boolean).join(' | ');

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
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        preferredContact,
        contactHandle: contactHandle.trim(),
        interestedPathwayId: matchedPathway ? matchedPathway.id : null,
        educationStatus,
        channel: 'GOOGLE_FORM',
        externalId: payload.responseId || payload.formId || `gform_${Date.now()}`,
        rawMetadata: JSON.stringify({
          formTitle: payload.formTitle || 'Google Form Inquiry',
          germanLevel,
          submittedAt: payload.timestamp || new Date().toISOString(),
        }),
        utmSource: payload.utmSource || 'google_forms',
        utmMedium: payload.utmMedium || 'organic_form',
        notes: combinedNotes,
        ownerId: counselorUser ? counselorUser.id : null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        nextAction: 'Review Google Form responses and contact via ' + preferredContact,
        nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        consentGiven: true,
      },
    });

    // Record Ingestion Log
    await prisma.ingestionLog.create({
      data: {
        orgId: org.id,
        channel: 'GOOGLE_FORM',
        status: duplicateOfId ? 'DUPLICATE' : 'SUCCESS',
        senderIp: req.headers.get('x-forwarded-for') || 'google-apps-script',
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
        channel: 'GOOGLE_FORM',
        fullName: lead.fullName,
        isDuplicate: !!duplicateOfId,
        assignedTo: counselorUser?.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Google Form submission ingested successfully into GOEURO CRM',
      leadId: lead.id,
      duplicate: !!duplicateOfId,
      assignedCounselor: counselorUser?.name || 'Unassigned',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Google Form ingestion error:', error);
    try {
      const org = await prisma.organization.findFirst();
      if (org) {
        await prisma.ingestionLog.create({
          data: {
            orgId: org.id,
            channel: 'GOOGLE_FORM',
            status: 'FAILED',
            senderIp: req.headers.get('x-forwarded-for') || 'unknown',
            payload: rawBodyText.slice(0, 4000),
            errorMessage: error.message,
          },
        });
      }
    } catch (e) {}

    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
