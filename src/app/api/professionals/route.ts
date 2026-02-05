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

    const professionals = await User.find({
      role: { $in: ['psychologist', 'social_worker'] },
      status: 'active',
    }).select('name email phone availability role');

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

    const body = await req.json();
    const { email, password, name, role, phone, availability } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const professional = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      availability,
      status: 'active',
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: professional,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Professional creation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
