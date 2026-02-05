import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from './jwt';
import { JWTPayload, UserRole } from '@/types';

export function withAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    try {
      const token = getTokenFromRequest(req);

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }

      // Add payload to request context
      (context as any).user = payload;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function withRole(
  allowedRoles: UserRole[],
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    try {
      const token = getTokenFromRequest(req);

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }

      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      (context as any).user = payload;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
