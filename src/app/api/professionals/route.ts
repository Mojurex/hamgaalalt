import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponse } from '@/types';

// GET /api/professionals - Get list of available professionals
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const professionals: any[] = [];

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: professionals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Professionals fetch error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/professionals - Create a new professional (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Professionals are not supported in this setup' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Professional creation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
