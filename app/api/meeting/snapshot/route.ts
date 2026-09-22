import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const SNAPSHOT_DIR = path.join(process.cwd(), 'public', 'uploads', 'snapshots');

async function ensureSnapshotDir() {
  try {
    await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create snapshots directory:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSnapshotDir();
    const body = await req.json();
    const { image, leadId, roomId, triggerType } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const timestamp = Date.now();
    const cleanRoomId = (roomId || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `snap_${cleanRoomId}_${timestamp}.jpg`;
    const filePath = path.join(SNAPSHOT_DIR, filename);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/snapshots/${filename}`;
    const cleanTrigger = triggerType === 'MANUAL' ? 'MANUAL' : 'AUTO';

    // 1. Create MeetingSnapshot record
    const snapshot = await prisma.meetingSnapshot.create({
      data: {
        roomId: roomId || 'default',
        leadId: leadId || null,
        fileUrl,
        triggerType: cleanTrigger,
      },
    });

    // 2. If leadId is provided, update Lead model with verified consultation attendance photo
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          consultationSnapshotUrl: fileUrl,
        },
      });

      // Also log in contact history
      try {
        await prisma.leadContactHistory.create({
          data: {
            leadId,
            contactType: 'MEETING',
            summary: `Verified Attendance Snapshot captured (${cleanTrigger === 'AUTO' ? 'Auto-detected full attendance' : 'Counselor manual snapshot'}). Photo proof saved.`,
          },
        });
      } catch (logErr) {
        console.warn('Failed to log snapshot contact history:', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      snapshot,
      message: 'Consultation attendance snapshot saved successfully',
    });
  } catch (error: any) {
    console.error('Snapshot upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save snapshot' }, { status: 500 });
  }
}
