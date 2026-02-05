import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';

export const runtime = 'nodejs';

// GET /api/health - API + Mongo health
export async function GET() {
  try {
    await connectDB();
    const mongoConnected = mongoose.connection.readyState === 1;
    const dbName = mongoose.connection.db?.databaseName || null;

    return NextResponse.json(
      {
        ok: mongoConnected,
        mongo: mongoConnected ? 'connected' : 'disconnected',
        dbName,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mongo connection failed';
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        ok: false,
        mongo: 'disconnected',
        reason: message,
      },
      { status: 500 }
    );
  }
}
