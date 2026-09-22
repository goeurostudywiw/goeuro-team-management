import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-crypto';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, userId, isDemo } = body;

    let user: any = null;

    if (isDemo && userId) {
      if (process.env.NEXT_PUBLIC_ENABLE_DEMO === 'false') {
        return NextResponse.json(
          { error: 'Demo quick-login is disabled in this environment. Please sign in with your email and password.' },
          { status: 403 }
        );
      }
      // 1-Click quick demo login
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          teams: { include: { team: true } },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      // Standard credentials login
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          role: true,
          teams: { include: { team: true } },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check password
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This user account is inactive. Please contact an organization administrator.' },
        { status: 403 }
      );
    }

    // Prepare response data without sensitive hash
    const { passwordHash: _, ...safeUser } = user;

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome back, ${user.name}!`,
    });

    const cookieMaxAge = 60 * 60 * 24 * 7; // 7 days

    // Set cookie headers
    res.cookies.set('goeuro_user_id', user.id, {
      path: '/',
      maxAge: cookieMaxAge,
      sameSite: 'lax',
      httpOnly: false,
    });

    res.cookies.set('goeuro_session', `session_${user.id}_${Date.now()}`, {
      path: '/',
      maxAge: cookieMaxAge,
      sameSite: 'lax',
      httpOnly: true,
    });

    await logAudit({
      orgId: user.orgId,
      userId: user.id,
      entityType: 'USER',
      entityId: user.id,
      action: 'LOGIN',
      details: { email: user.email, method: isDemo ? 'DEMO_SWITCH' : 'CREDENTIALS' },
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal login error' }, { status: 500 });
  }
}
