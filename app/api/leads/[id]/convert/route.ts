import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission(req, 'case:write');
    if (!auth.authorized) return auth.response;

    const leadId = params.id;
    const body = await req.json();
    const { agreedScope, targetIntake, currentGermanLevel, targetGermanLevel, ownerId } = body;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { interestedPathway: true },
    });

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const existingCase = await prisma.studentCase.findUnique({
      where: { leadId },
    });
    if (existingCase) {
      return NextResponse.json({ error: 'This lead has already been converted to a student case', caseId: existingCase.id }, { status: 400 });
    }

    // Get default pathway if lead did not have one
    let pathwayId = lead.interestedPathwayId;
    let checklistTemplate = '[]';

    if (pathwayId) {
      const pathway = await prisma.pathway.findUnique({ where: { id: pathwayId } });
      if (pathway) checklistTemplate = pathway.checklists;
    } else {
      const firstPathway = await prisma.pathway.findFirst();
      if (firstPathway) {
        pathwayId = firstPathway.id;
        checklistTemplate = firstPathway.checklists;
      }
    }

    if (!pathwayId) {
      return NextResponse.json({ error: 'No active pathway available for student case' }, { status: 400 });
    }

    // Parse checklist template and set default state
    let initialChecklist: any[] = [];
    try {
      const parsed = JSON.parse(checklistTemplate);
      if (Array.isArray(parsed)) {
        initialChecklist = parsed.map((item: any) => ({
          ...item,
          isCompleted: false,
          verifiedAt: null,
          verifiedBy: null,
        }));
      }
    } catch (e) {
      initialChecklist = [];
    }

    const contactInfo = `Handle: ${lead.contactHandle} | Method: ${lead.preferredContact}${lead.phone ? ` | Phone: ${lead.phone}` : ''}${lead.email ? ` | Email: ${lead.email}` : ''}`;

    const studentCase = await prisma.studentCase.create({
      data: {
        orgId: lead.orgId,
        leadId: lead.id,
        studentName: lead.fullName,
        contactInfo,
        pathwayId,
        agreedScope: agreedScope || 'Full Guidance & Placement Support',
        ownerId: ownerId || auth.user?.id || '',
        status: 'ACTIVE',
        targetIntake: targetIntake || 'Winter 2026',
        currentGermanLevel: currentGermanLevel || 'A1',
        targetGermanLevel: targetGermanLevel || 'B2',
        checklist: JSON.stringify(initialChecklist),
      },
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create default milestones
    await prisma.caseMilestone.createMany({
      data: [
        {
          caseId: studentCase.id,
          title: 'German Language B1/B2 Examination Verification',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
        {
          caseId: studentCase.id,
          title: 'Academic Translation & Notarization Complete',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          caseId: studentCase.id,
          title: 'Ausbildung Contract Signed / University VPD Issued',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        {
          caseId: studentCase.id,
          title: 'German Visa Application Submission',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Mark lead as CLOSED_WON
    await prisma.lead.update({
      where: { id: leadId },
      data: { stage: 'CLOSED_WON' },
    });

    await logAudit({
      orgId: lead.orgId,
      userId: auth.user?.id,
      entityType: 'STUDENT_CASE',
      entityId: studentCase.id,
      action: 'CONVERT_FROM_LEAD',
      details: { leadId, studentName: lead.fullName, pathwayId },
    });

    return NextResponse.json(studentCase, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
