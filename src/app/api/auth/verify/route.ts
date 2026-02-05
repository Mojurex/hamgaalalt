import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { ApiResponse } from '@/types';

// GET /api/auth/verify
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: payload },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
