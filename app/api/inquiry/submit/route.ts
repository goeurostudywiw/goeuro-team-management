import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Normalize input fields from both landing page and notion inquiry form
    const fullName = (body.fullName || body.name || '').trim();
    const phone = body.phone ? body.phone.trim() : null;
    const email = body.email ? body.email.trim() : null;
    const preferredContact = body.preferredContact || (phone ? 'PHONE' : 'EMAIL');
    const contactHandle = (body.contactHandle || phone || email || '').trim();
    const educationStatus = body.educationStatus || body.educationLevel || 'High School graduate';
    const pathwayId = body.pathwayId || null;
    const utmSource = body.utmSource || 'public_landing_web';
    const utmMedium = body.utmMedium || null;
    const utmCampaign = body.utmCampaign || null;
    const consent = body.consent !== undefined ? body.consent : true;

    // Combine notes, german level, pathway if present
    let combinedNotes = body.notes ? body.notes.trim() : '';
    if (body.germanLevel) {
      combinedNotes = `[German Level: ${body.germanLevel}] ${combinedNotes}`.trim();
    }
    if (body.pathway && !pathwayId) {
      combinedNotes = `[Target Pathway: ${body.pathway}] ${combinedNotes}`.trim();
    }

    if (!fullName || !contactHandle) {
      return NextResponse.json(
        { error: 'Full name and contact information (phone or email) are required.' },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

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

    // Assign to KMH (Student Relations Lead) by default if available, or first counselor
    const counselorUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'kmh@goeuro.de' },
          { email: 'counselor@goeuro.de' },
          { role: { name: { contains: 'Counselor' } } },
        ],
        status: 'ACTIVE',
      },
    });

    const lead = await prisma.lead.create({
      data: {
        orgId: org.id,
        fullName,
        phone,
        email,
        preferredContact,
        contactHandle,
        interestedPathwayId: pathwayId || null,
        educationStatus,
        utmSource,
        utmMedium,
        notes: combinedNotes || null,
        ownerId: counselorUser ? counselorUser.id : null,
        isDuplicateOfId: duplicateOfId,
        stage: 'NEW',
        nextAction: 'Review profile assessment & reply on preferred channel',
        nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
        consentGiven: consent,
        consentDate: new Date(),
      },
      include: {
        interestedPathway: true,
        owner: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      orgId: org.id,
      entityType: 'LEAD',
      entityId: lead.id,
      action: 'PUBLIC_INQUIRY_SUBMITTED',
      details: {
        fullName: lead.fullName,
        preferredContact: lead.preferredContact,
        pathwayId,
        isDuplicate: !!duplicateOfId,
        assignedTo: counselorUser?.name,
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Inquiry received successfully. A GOEURO advisor will contact you within 24 hours.',
    });
  } catch (error: any) {
    console.error('Error in inquiry submission:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
