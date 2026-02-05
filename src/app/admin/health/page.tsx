'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse, JWTPayload } from '@/types';

interface HealthData {
  mongoConnected: boolean;
  dbName: string | null;
  error?: string;
}

export default function AdminHealthPage() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState<HealthData | null>(null);
  const router = useRouter();

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    setLoading(true);
    setError('');

    try {
      const verify = await apiFetch<ApiResponse<JWTPayload>>('/api/auth/verify');
      if (verify.data?.role !== 'admin') {
        setError('Unauthorized');
        router.push('/admin/login');
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unauthorized');
      router.push('/admin/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setTesting(true);
    setError('');
    try {
      const data = await apiFetch<ApiResponse<HealthData>>('/api/health');
      setHealth(data.data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Health check failed';
      setError(message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Шалгаж байна...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">API Health Check</h1>
          <Link href="/admin/dashboard">
            <button className="text-cyan-600 hover:text-cyan-700 font-semibold">← Буцах</button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-gray-600 mb-6">
            Сервер болон MongoDB холболтыг шалгана.
          </p>

          <button
            onClick={runHealthCheck}
            disabled={testing}
            className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Шалгаж байна...' : 'Test API'}
          </button>

          {health && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3">
                <span className="text-gray-700 font-semibold">MongoDB статус</span>
                <span className={health.mongoConnected ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {health.mongoConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3">
                <span className="text-gray-700 font-semibold">DB нэр</span>
                <span className="text-gray-900 font-bold">{health.dbName || 'Unknown'}</span>
              </div>
              {health.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-red-700 text-sm">{health.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
