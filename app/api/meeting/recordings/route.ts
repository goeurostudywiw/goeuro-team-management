import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'recordings');

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create recordings upload directory:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const roomId = (formData.get('roomId') as string) || 'default-room';
    const leadId = (formData.get('leadId') as string) || null;
    const durationStr = formData.get('duration') as string;
    const duration = durationStr ? parseInt(durationStr, 10) : 0;
    const notes = (formData.get('notes') as string) || null;
    const counselorId = (formData.get('counselorId') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No recording file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `rec_${cleanRoomId}_${timestamp}.webm`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/recordings/${filename}`;
    const fileSize = buffer.byteLength;

    // Save to Database
    const recording = await prisma.meetingRecording.create({
      data: {
        roomId,
        leadId,
        filename,
        fileUrl,
        fileSize,
        duration,
        notes,
        counselorId,
      },
    });

    // If linked to a lead, log in Contact History
    if (leadId) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const formattedDuration = `${minutes}m ${seconds}s`;

      try {
        await prisma.leadContactHistory.create({
          data: {
            leadId,
            authorId: counselorId,
            contactType: 'MEETING',
            summary: `Online Consultation Recording archived (${formattedDuration}). Playback available in CRM dossier.`,
          },
        });
      } catch (logErr) {
        console.warn('Failed to log recording contact history:', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      recording,
      message: 'Consultation recording uploaded successfully',
    });
  } catch (error: any) {
    console.error('Recording upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload recording' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    const roomId = searchParams.get('roomId');

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (roomId) where.roomId = roomId;

    const recordings = await prisma.meetingRecording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: { id: true, fullName: true, stage: true },
        },
      },
    });

    return NextResponse.json(recordings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
