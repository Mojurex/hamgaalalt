import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Report } from '@/lib/models/Report';
import { User } from '@/lib/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { ApiResponse } from '@/types';

// POST /api/reports - Create a new report
export async function POST(req: NextRequest) {
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

    if (payload.role !== 'student') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only students can create reports' },
        { status: 403 }
      );
    }

    const reporter = await User.findById(payload.userId);
    if (!reporter) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { category, description, isUrgent, attachments } = body;

    if (!category || !description) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Category and description are required' },
        { status: 400 }
      );
    }

    if (!reporter.fullName || !reporter.grade || !reporter.classSection) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Student profile is incomplete' },
        { status: 400 }
      );
    }

    // Determine severity based on category and urgency
    let severity = 'low';
    if (isUrgent) {
      severity = 'high';
    } else if (['relationship_abuse', 'family_violence', 'cyberbullying'].includes(category)) {
      severity = 'medium';
    } else if (['peer_bullying', 'mental_stress'].includes(category)) {
      severity = 'medium';
    }

    const report = await Report.create({
      category,
      severity,
      description,
      reporterId: payload.userId,
      reporterSnapshot: {
        fullName: reporter.fullName,
        grade: reporter.grade,
        classSection: reporter.classSection,
      },
      isUrgent: isUrgent === true,
      attachments: attachments || [],
      status: 'new',
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get all reports (admin only)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const filter: any = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .populate('reporterId', 'fullName grade classSection')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: reports,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
