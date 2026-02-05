import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponse, User as UserType } from '@/types';

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, name, role } = body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedRole = String(role || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedRoles = ['student', 'parent'];

    // Validation
    if (!normalizedEmail || !password || !normalizedName || !normalizedRole) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: normalizedName,
      role: normalizedRole,
      status: 'active',
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    if ((error as any)?.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
