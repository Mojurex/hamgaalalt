import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Report } from '@/lib/models/Report';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { ApiResponse } from '@/types';
import { Types } from 'mongoose';

// GET /api/reports/[id] - Get a specific report
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id: reportId } = await params;

    if (!Types.ObjectId.isValid(reportId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[id] - Update a report
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: reportId } = await params;

    if (!Types.ObjectId.isValid(reportId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, assignedTo, notes, severity } = body;

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { status, assignedTo, notes, severity },
      { new: true }
    );

    if (!updatedReport) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedReport,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
