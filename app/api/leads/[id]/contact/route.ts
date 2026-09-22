import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission(req, 'lead:write');
    if (!auth.authorized) return auth.response;

    const leadId = params.id;
    const body = await req.json();
    const { contactType, summary, followUpDate, updateStage } = body;

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const contact = await prisma.leadContactHistory.create({
      data: {
        leadId,
        authorId: auth.user?.id || null,
        contactType: contactType || 'TELEGRAM_VIBER',
        summary,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    const leadUpdates: any = {};
    if (followUpDate) {
      leadUpdates.nextFollowUpDate = new Date(followUpDate);
    }
    if (updateStage) {
      leadUpdates.stage = updateStage;
    }

    if (Object.keys(leadUpdates).length > 0) {
      await prisma.lead.update({
        where: { id: leadId },
        data: leadUpdates,
      });
    }

    const org = await prisma.organization.findFirst();
    if (org) {
      await logAudit({
        orgId: org.id,
        userId: auth.user?.id,
        entityType: 'LEAD',
        entityId: leadId,
        action: 'LOG_CONTACT',
        details: { contactType, summary, updateStage, followUpDate },
      });
    }

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
