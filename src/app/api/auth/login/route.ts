import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import { ApiResponse } from '@/types';

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { username, password } = body;

    const identifier = String(username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username: identifier });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordHash = user.passwordHash || (user as any).password || '';
    const passwordMatch = await comparePassword(password, passwordHash);

    if (!passwordMatch) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          token,
      user: {
            id: user._id,
            username: user.username,
            name: user.fullName || user.name,
            role: user.role,
          },
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
