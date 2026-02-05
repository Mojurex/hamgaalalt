import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json<ApiResponse>(
    { success: true, message: 'Logged out' },
    { status: 200 }
  );

  response.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
