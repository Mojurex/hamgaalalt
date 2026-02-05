'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse } from '@/types';

type RoleOption = 'student' | 'parent';

interface RegisterFormProps {
  defaultRole?: RoleOption;
  lockRole?: boolean;
}

export default function RegisterForm({ defaultRole = 'student', lockRole = false }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleOption>(defaultRole);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  const validate = () => {
    const nextErrors: { name?: string; email?: string; password?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      nextErrors.name = 'Нэр шаардлагатай';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Имэйл шаардлагатай';
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Имэйл формат буруу байна';
    }

    if (!password) {
      nextErrors.password = 'Нууц үг шаардлагатай';
    } else if (password.length < 6) {
      nextErrors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байна';
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
        id: string;
        email: string;
        name: string;
        role: string;
      }>>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      setSuccess('Бүртгэл амжилттай. Нэвтрэх хуудас руу шилжинэ...');

      const userRole = data.data?.role;
      if (userRole === 'student' || userRole === 'parent') {
        setTimeout(() => {
          router.push(`/${userRole}/login`);
        }, 800);
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Бүртгэл амжилтгүй. Дахин оролдоно уу.';
      const message = raw.toLowerCase().includes('exists')
        ? 'Энэ имэйл бүртгэлтэй байна.'
        : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <button className="mb-6 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
            ← Буцах
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Бүртгүүлэх</h1>
          <p className="text-gray-600 mb-8">Шинэ бүртгэл үүсгэнэ үү</p>

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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Овог нэр
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Таны нэр"
                required
              />
              {fieldErrors.name && (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Имэйл
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="example@school.mn"
                required
              />
              {fieldErrors.email && (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

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
                minLength={6}
                required
              />
              {fieldErrors.password && (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {!lockRole && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Бүртгэлийн төрөл
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleOption)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="student">Сурагч</option>
                  <option value="parent">Эцэг эх</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              )}
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Аль хэдийн бүртгэлтэй юу?{' '}
              <Link href={`/${role}/login`} className="text-cyan-600 hover:text-cyan-700 font-semibold">
                Нэвтрэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
