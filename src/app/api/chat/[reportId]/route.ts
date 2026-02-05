import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { ChatMessage } from '@/lib/models/ChatMessage';
import { ChatSession } from '@/lib/models/ChatSession';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { ApiResponse } from '@/types';
import { Types } from 'mongoose';

// GET /api/chat/[reportId] - Get chat messages for a report
export async function GET(req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    if (!Types.ObjectId.isValid(reportId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const messages = await ChatMessage.find({ reportId }).sort({ timestamp: 1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat fetch error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/[reportId] - Send a chat message
export async function POST(req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;
    const body = await req.json();
    const { message, senderName } = body;

    if (!message || !senderName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message and sender name are required' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(reportId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Create message
    const newMessage = await ChatMessage.create({
      reportId,
      senderId: payload.userId,
      senderName,
      senderRole: payload.role,
      message,
      timestamp: new Date(),
    });

    // Ensure chat session exists
    let session = await ChatSession.findOne({ reportId });
    if (!session) {
      session = await ChatSession.create({
        reportId,
        participants: [payload.userId],
        messages: [newMessage._id],
        isActive: true,
      });
    } else {
      // Add message to session if not already there
      if (!session.messages.includes(newMessage._id)) {
        session.messages.push(newMessage._id);
        await session.save();
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
