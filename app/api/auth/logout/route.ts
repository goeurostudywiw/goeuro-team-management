import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear auth cookies
  res.cookies.set('goeuro_user_id', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  res.cookies.set('goeuro_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
}
