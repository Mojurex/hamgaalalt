'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { apiFetch } from '@/lib/utils/api';

export default function AdminLoginPage() {
  const [status, setStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [dbName, setDbName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch<{ ok: boolean; mongo: string; dbName?: string | null }>('/api/health');
        if (res.ok) {
          setStatus('ok');
          setDbName(res.dbName || null);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm role="admin" />
        <div className="mt-4 text-xs text-gray-600 text-center">
          System status:{' '}
          {status === 'loading' && 'Шалгаж байна...'}
          {status === 'ok' && `MongoDB холбогдсон${dbName ? ` (${dbName})` : ''}`}
          {status === 'error' && 'MongoDB холбогдоогүй'}
        </div>
      </div>
    </div>
  );
}
