import mongoose from 'mongoose';
import { ensureAdminSeed } from '@/lib/db/seed';

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'school-support-system';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: CachedConnection = (global as any).mongoose || { conn: null, promise: null };
let adminSeeded = (global as any).__adminSeeded || false;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

function getDbNameFromUri(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname || '';
    const normalized = pathname.replace('/', '').trim();
    return normalized ? decodeURIComponent(normalized) : null;
  } catch (error) {
    return null;
  }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const dbNameFromUri = getDbNameFromUri(MONGODB_URI!);
    const resolvedDbName = dbNameFromUri || DEFAULT_DB_NAME;

    const opts = {
      bufferCommands: false,
      ...(dbNameFromUri ? {} : { dbName: resolvedDbName }),
    };

    if (!dbNameFromUri) {
      console.log(`ℹ️ MongoDB URI missing db name. Using dbName="${resolvedDbName}".`);
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        const connectedDb = mongoose.connection?.db?.databaseName || resolvedDbName;
        console.log(`✅ MongoDB connected successfully (db: ${connectedDb})`);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;

    if (!adminSeeded) {
      try {
        const seedResult = await ensureAdminSeed();
        adminSeeded = true;
        (global as any).__adminSeeded = true;

        if (seedResult.created) {
          console.log('✅ Admin seed user created');
        }
      } catch (error) {
        console.error('❌ Admin seed failed:', error);
      }
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

declare global {
  var mongoose: CachedConnection | undefined;
  var __adminSeeded: boolean | undefined;
}
