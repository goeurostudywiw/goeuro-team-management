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

    const caseId = params.id;
    const body = await req.json();
    const { toUserId, reason, handoverNotes } = body;

    if (!toUserId || !reason) {
      return NextResponse.json({ error: 'Target user (toUserId) and reason are required' }, { status: 400 });
    }

    const currentCase = await prisma.studentCase.findUnique({ where: { id: caseId } });
    if (!currentCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    const fromUserId = currentCase.ownerId;

    const handover = await prisma.caseHandover.create({
      data: {
        caseId,
        fromUserId,
        toUserId,
        reason,
        handoverNotes: handoverNotes || null,
      },
    });

    await prisma.studentCase.update({
      where: { id: caseId },
      data: { ownerId: toUserId },
    });

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'STUDENT_CASE',
        entityId: caseId,
        action: 'HANDOVER',
        details: { fromUserId, toUserId, reason, handoverNotes },
      });
    }

    return NextResponse.json(handover, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
