import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const pathways = await prisma.pathway.findMany({
      include: {
        _count: {
          select: { content: true, leads: true, cases: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(pathways);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'org:manage');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { name, code, description, checklists } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and unique code are required' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const pathway = await prisma.pathway.create({
      data: {
        orgId: org.id,
        name,
        code: code.toUpperCase().replace(/\s+/g, '_'),
        description,
        checklists: JSON.stringify(checklists || [
          { id: 'c1', label: 'Initial Profile Screening', category: 'SCREENING' },
          { id: 'c2', label: 'Language Verification', category: 'LANGUAGE' },
          { id: 'c3', label: 'Document Portfolio & Certified Translation', category: 'ACADEMIC_DOCS' },
          { id: 'c4', label: 'Contract / Admission Verification', category: 'ADMISSION' },
          { id: 'c5', label: 'Visa Execution & Relocation Preparation', category: 'VISA' },
        ]),
      },
    });

    await logAudit({
      orgId: org.id,
      userId: auth.user?.id,
      entityType: 'PATHWAY',
      entityId: pathway.id,
      action: 'CREATE',
      details: { name, code },
    });

    return NextResponse.json(pathway, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
