import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Report } from '@/lib/models/Report';
import { verifyToken, getTokenFromRequest } from '@/lib/auth/jwt';
import { ApiResponse } from '@/types';

// GET /api/admin/analytics - Get dashboard analytics
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

    // Get reports count by severity
    const severityBreakdown = await Report.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get reports count by category
    const categoryBreakdown = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get reports count by status
    const statusBreakdown = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly report counts (last 12 months)
    const monthlyReports = await Report.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get total reports
    const totalReports = await Report.countDocuments();

    // Get urgent reports count
    const urgentReports = await Report.countDocuments({ isUrgent: true });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          totalReports,
          urgentReports,
          severityBreakdown,
          categoryBreakdown,
          statusBreakdown,
          monthlyReports,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
