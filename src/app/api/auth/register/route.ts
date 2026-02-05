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
    const { username, password, role, fullName, grade, classSection, phone, childName } = body;

    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedName = String(fullName || '').trim();
    const normalizedRole = String(role || '').trim();
    const normalizedClassSection = String(classSection || '').trim();
    const allowedRoles = ['student', 'parent'];

    // Validation
    if (!normalizedUsername || !password || !normalizedName || !normalizedRole) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All fields are required' },
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

    if (normalizedRole === 'student') {
      const numericGrade = Number(grade);
      if (!numericGrade || numericGrade < 1 || numericGrade > 12) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid grade' },
          { status: 400 }
        );
      }
      if (!normalizedClassSection) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Class section is required' },
          { status: 400 }
        );
      }
    }

    if (normalizedRole === 'parent') {
      if (!normalizedClassSection) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Child class is required' },
          { status: 400 }
        );
      }
      if (!String(phone || '').trim()) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Phone is required' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: normalizedUsername });
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
      username: normalizedUsername,
      passwordHash: hashedPassword,
      fullName: normalizedName,
      role: normalizedRole,
      grade: normalizedRole === 'student' ? Number(grade) : null,
      classSection: normalizedClassSection || null,
      phone: phone || null,
      childName: childName || null,
      status: 'active',
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: newUser._id,
          username: newUser.username,
          name: newUser.fullName,
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
