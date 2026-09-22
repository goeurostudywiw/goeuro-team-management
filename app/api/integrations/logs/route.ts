import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const logs = await prisma.ingestionLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const counts = await prisma.ingestionLog.groupBy({
      by: ['channel'],
      _count: { id: true },
    });

    const channelStats = counts.reduce((acc: any, curr) => {
      acc[curr.channel] = curr._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      logs,
      stats: channelStats,
      totalCount: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
