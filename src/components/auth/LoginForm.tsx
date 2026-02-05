'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse } from '@/types';

interface LoginProps {
  role: 'student' | 'parent' | 'admin';
}

export default function LoginForm({ role }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();
    const isEmailLike = trimmedEmail.includes('@');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      nextErrors.email = 'Нэвтрэх нэр эсвэл имэйл шаардлагатай';
    } else if (isEmailLike && !emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Имэйл формат буруу байна';
    }

    if (!password) {
      nextErrors.password = 'Нууц үг шаардлагатай';
    } else if (password.length < 8) {
      nextErrors.password = 'Нууц үг хамгийн багадаа 8 тэмдэгт байна';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<ApiResponse<{
        token: string;
        user: { id: string; email: string; name: string; role: string };
      }>>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const userRole = data.data?.user?.role;

      setSuccess('Амжилттай нэвтэрлээ. Түр хүлээнэ үү...');

      setTimeout(() => {
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'student' || userRole === 'parent') {
          router.push(`/${userRole}/dashboard`);
        } else {
          router.push('/');
        }
      }, 400);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const roleNames = {
    student: 'Сурагч',
    parent: 'Эцэг эх',
    admin: 'Администратор',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link href="/">
          <button className="mb-6 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
            ← Буцах
          </button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{roleNames[role]}</h1>
          <p className="text-gray-600 mb-8">Системд нэвтэрнэ үү</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Имэйл / Нэвтрэх нэр
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="admin эсвэл example@school.mn"
                required
              />
              {fieldErrors.email && (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Нууц үг
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              )}
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Шинэ бүртгэлтэй юу?{' '}
              <Link href={`/register?role=${role}`} className="text-cyan-600 hover:text-cyan-700 font-semibold">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        {role === 'admin' && (
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-900 font-semibold mb-2">Demo нэвтрэлт:</p>
            <p className="text-sm text-cyan-800">Email: admin</p>
            <p className="text-sm text-cyan-800">Password: admin1234</p>
          </div>
        )}
      </div>
    </main>
  );
}
