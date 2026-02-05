import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';
import { ApiResponse } from '@/types';

// GET /api/health - API + Mongo health
export async function GET() {
  let mongoConnected = false;
  let dbName: string | null = null;
  let errorMessage: string | undefined;

  try {
    await connectDB();
    mongoConnected = mongoose.connection.readyState === 1;
    dbName = mongoose.connection.db?.databaseName || null;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Mongo connection failed';
    console.error('Health check error:', error);
  }

  return NextResponse.json<ApiResponse>(
    {
      success: true,
      data: {
        mongoConnected,
        dbName,
        error: errorMessage,
      },
    },
    { status: 200 }
  );
}
