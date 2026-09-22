import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission(req, 'case:write');
    if (!auth.authorized) return auth.response;

    const caseId = params.id;
    const body = await req.json();
    const { documentName, documentType, fileUrl, notes } = body;

    if (!documentName || !documentType) {
      return NextResponse.json({ error: 'Document name and type are required' }, { status: 400 });
    }

    const doc = await prisma.caseDocument.create({
      data: {
        caseId,
        documentName,
        documentType,
        fileUrl: fileUrl || null,
        notes: notes || null,
        status: 'REQUESTED',
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requirePermission(req, 'case:write');
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { documentId, status, fileUrl, notes } = body;

    if (!documentId) return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });

    const updated = await prisma.caseDocument.update({
      where: { id: documentId },
      data: {
        ...(status && { status }),
        ...(fileUrl && { fileUrl }),
        ...(notes && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
