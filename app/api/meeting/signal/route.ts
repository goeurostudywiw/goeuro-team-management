import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RoomMessage {
  id: string;
  sender: 'counselor' | 'student';
  type: 'offer' | 'answer' | 'candidate' | 'chat' | 'user-joined' | 'user-left';
  payload: any;
  timestamp: number;
}

interface RoomState {
  roomId: string;
  leadId?: string;
  counselorActive: boolean;
  studentActive: boolean;
  messages: RoomMessage[];
  createdAt: number;
  lastActiveAt: number;
}

// Global in-memory signaling store for sub-millisecond local latency
const rooms = new Map<string, RoomState>();

// Periodic cleanup of stale rooms older than 2 hours
function cleanupStaleRooms() {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (now - room.lastActiveAt > 2 * 60 * 60 * 1000) {
      rooms.delete(roomId);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    cleanupStaleRooms();
    const body = await req.json();
    const { roomId, role, action, payload, leadId } = body;

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const calculatedLeadId = leadId || (roomId.startsWith('consult-') ? roomId.replace('consult-', '') : undefined);

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        leadId: calculatedLeadId,
        counselorActive: false,
        studentActive: false,
        messages: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      rooms.set(roomId, room);
    }

    room.lastActiveAt = Date.now();

    // 1. Handle Join Action
    if (action === 'join') {
      if (role === 'counselor') {
        room.counselorActive = true;
      } else {
        room.studentActive = true;
      }

      const joinMsg: RoomMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: role,
        type: 'user-joined',
        payload: { role },
        timestamp: Date.now(),
      };
      room.messages.push(joinMsg);

      // Async DB session sync (non-blocking for ultra-fast response)
      prisma.meetingRoomSession.upsert({
        where: { id: roomId },
        update: {
          leadId: calculatedLeadId,
          counselorActive: room.counselorActive,
          studentActive: room.studentActive,
          updatedAt: new Date(),
        },
        create: {
          id: roomId,
          leadId: calculatedLeadId,
          counselorActive: room.counselorActive,
          studentActive: room.studentActive,
        },
      }).catch((e) => console.warn('Prisma room upsert note:', e.message));

      prisma.meetingSignal.create({
        data: {
          sessionId: roomId,
          sender: role,
          type: 'user-joined',
          payload: JSON.stringify({ role }),
          timestamp: joinMsg.timestamp,
        },
      }).catch(() => {});

      // If room has associated leadId, fetch student details
      let leadInfo = null;
      if (room.leadId) {
        try {
          leadInfo = await prisma.lead.findUnique({
            where: { id: room.leadId },
            include: {
              interestedPathway: true,
              owner: { select: { id: true, name: true } },
              recordings: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          });
        } catch (e) {
          // ignore if leadId is just a custom string
        }
      }

      return NextResponse.json({
        success: true,
        counselorActive: room.counselorActive,
        studentActive: room.studentActive,
        lead: leadInfo,
      });
    }

    // 2. Handle WebRTC Signal (Offer / Answer / ICE Candidate)
    if (action === 'signal') {
      const signalMsg: RoomMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: role,
        type: payload.type,
        payload: payload.data,
        timestamp: Date.now(),
      };
      room.messages.push(signalMsg);

      // Persist to DB for multi-instance/serverless public hosts
      prisma.meetingSignal.create({
        data: {
          sessionId: roomId,
          sender: role,
          type: payload.type,
          payload: JSON.stringify(payload.data),
          timestamp: signalMsg.timestamp,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    // 3. Handle Leave Action
    if (action === 'leave') {
      if (role === 'counselor') {
        room.counselorActive = false;
      } else {
        room.studentActive = false;
      }

      const leaveMsg: RoomMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: role,
        type: 'user-left',
        payload: { role },
        timestamp: Date.now(),
      };
      room.messages.push(leaveMsg);

      prisma.meetingRoomSession.update({
        where: { id: roomId },
        data: {
          counselorActive: room.counselorActive,
          studentActive: room.studentActive,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const role = searchParams.get('role') as 'counselor' | 'student';
    const lastTimestamp = parseFloat(searchParams.get('since') || '0');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId query param required' }, { status: 400 });
    }

    const room = rooms.get(roomId);

    // Fast path: In-memory store
    if (room) {
      room.lastActiveAt = Date.now();
      const targetMessages = room.messages.filter(
        (m) => m.sender !== role && m.timestamp > lastTimestamp
      );

      return NextResponse.json({
        counselorActive: room.counselorActive,
        studentActive: room.studentActive,
        messages: targetMessages,
        serverTime: Date.now(),
      });
    }

    // Resilient fallback: Query database (essential for Serverless / Multi-instance public web hosts)
    const dbSession = await prisma.meetingRoomSession.findUnique({
      where: { id: roomId },
      include: {
        signals: {
          where: {
            sender: { not: role },
            timestamp: { gt: lastTimestamp },
          },
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (dbSession) {
      const messages: RoomMessage[] = dbSession.signals.map((s) => ({
        id: s.id,
        sender: s.sender as any,
        type: s.type as any,
        payload: JSON.parse(s.payload),
        timestamp: s.timestamp,
      }));

      return NextResponse.json({
        counselorActive: dbSession.counselorActive,
        studentActive: dbSession.studentActive,
        messages,
        serverTime: Date.now(),
      });
    }

    return NextResponse.json({
      messages: [],
      counselorActive: false,
      studentActive: false,
      serverTime: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
