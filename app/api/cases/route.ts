import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'case:read');
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const pathwayId = searchParams.get('pathwayId');

    const where: any = {};
    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;
    if (pathwayId) where.pathwayId = pathwayId;

    const cases = await prisma.studentCase.findMany({
      where,
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        lead: {
          select: {
            id: true,
            fullName: true,
            contactHandle: true,
            preferredContact: true,
            educationStatus: true,
          },
        },
        milestones: { orderBy: { dueDate: 'asc' } },
        documents: true,
        handovers: {
          include: {
            fromUser: { select: { id: true, name: true } },
            toUser: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'case:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { id, status, currentGermanLevel, targetIntake, agreedScope, notes, checklist } = body;

    if (!id) return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (currentGermanLevel !== undefined) updateData.currentGermanLevel = currentGermanLevel;
    if (targetIntake !== undefined) updateData.targetIntake = targetIntake;
    if (agreedScope !== undefined) updateData.agreedScope = agreedScope;
    if (notes !== undefined) updateData.notes = notes;
    if (checklist !== undefined) updateData.checklist = JSON.stringify(checklist);

    const updated = await prisma.studentCase.update({
      where: { id },
      data: updateData,
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
        documents: true,
        handovers: true,
      },
    });

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'STUDENT_CASE',
        entityId: id,
        action: 'UPDATE',
        details: updateData,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'case:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const {
      studentName,
      contactInfo,
      pathwayId,
      ownerId,
      currentGermanLevel,
      targetIntake,
      agreedScope,
      notes,
    } = body;

    if (!studentName || !pathwayId) {
      return NextResponse.json({ error: 'Student Name and Pathway are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    let effectiveOwnerId = ownerId || auth.user?.id;
    if (!effectiveOwnerId) {
      const fallbackUser = await prisma.user.findFirst({ where: { orgId: org.id } });
      if (!fallbackUser) {
        return NextResponse.json({ error: 'No user found in organization to assign case' }, { status: 400 });
      }
      effectiveOwnerId = fallbackUser.id;
    }

    const pathway = await prisma.pathway.findUnique({ where: { id: pathwayId } });
    if (!pathway) return NextResponse.json({ error: 'Pathway not found' }, { status: 404 });

    // Initialize pathway checklist
    let initialChecklist: any[] = [];
    try {
      const parsed = JSON.parse(pathway.checklists || '[]');
      initialChecklist = parsed.map((item: any) => ({
        id: item.id,
        label: item.label,
        category: item.category,
        verified: false,
        verifiedAt: null,
      }));
    } catch (e) {
      initialChecklist = [];
    }

    const effectiveContactInfo = contactInfo?.trim() || 'Direct Intake / Enrolled Walk-in';

    // Create an intake Lead for this direct enrollment
    const intakeLead = await prisma.lead.create({
      data: {
        orgId: org.id,
        fullName: studentName.trim(),
        contactHandle: effectiveContactInfo,
        preferredContact: 'TELEGRAM',
        educationStatus: 'OTHER',
        channel: 'DIRECT_ENROLLMENT',
        stage: 'APPLICATION_READY',
        ownerId: effectiveOwnerId,
        interestedPathwayId: pathwayId,
        notes: `Direct Enrollment created. Notes: ${notes || 'None'}`,
      },
    });

    const studentCase = await prisma.studentCase.create({
      data: {
        orgId: org.id,
        leadId: intakeLead.id,
        studentName: studentName.trim(),
        contactInfo: effectiveContactInfo,
        pathwayId,
        ownerId: effectiveOwnerId,
        status: 'ACTIVE',
        currentGermanLevel: currentGermanLevel || 'A1',
        targetIntake: targetIntake || 'Winter 2026',
        agreedScope: agreedScope || 'Full Admission & Visa Guidance',
        notes: notes || null,
        checklist: JSON.stringify(initialChecklist),
      },
      include: {
        pathway: true,
        owner: { select: { id: true, name: true, avatar: true } },
        milestones: true,
        documents: true,
        handovers: true,
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'STUDENT_CASE',
      entityId: studentCase.id,
      action: 'DIRECT_ENROLL',
      details: { studentName, pathway: pathway.name, targetIntake },
    });

    return NextResponse.json(studentCase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

