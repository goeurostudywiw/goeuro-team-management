import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { hasPermission } from './permissions';

export async function getCurrentUserFromRequest(req: NextRequest) {
  // Check cookie or header
  const cookieUserId = req.cookies.get('goeuro_user_id')?.value;
  const headerUserId = req.headers.get('x-user-id');
  const userId = cookieUserId || headerUserId;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      teams: { include: { team: true } },
    },
  });

  return user;
}

export async function requirePermission(req: NextRequest, permission: string) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }

  if (user.status !== 'ACTIVE') {
    return { authorized: false, response: NextResponse.json({ error: 'User account is deactivated' }, { status: 403 }), user: null };
  }

  if (!hasPermission(user.role.permissions, permission)) {
    return {
      authorized: false,
      response: NextResponse.json({
        error: `Forbidden: Missing required permission [${permission}]. Your role (${user.role.name}) does not grant this action.`,
      }, { status: 403 }),
      user,
    };
  }

  return { authorized: true, response: null, user };
}
