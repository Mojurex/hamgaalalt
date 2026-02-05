'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse } from '@/types';

export default function StudentAuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [classSection, setClassSection] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await apiFetch<ApiResponse>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      setSuccess('Амжилттай нэвтэрлээ. Түр хүлээнэ үү...');
      setTimeout(() => {
        window.location.href = '/student/dashboard';
      }, 400);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Нэвтрэхэд алдаа гарлаа.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!fullName.trim() || !grade || !classSection.trim() || !username.trim() || !password) {
      setError('Бүх шаардлагатай талбарыг бөглөнө үү.');
      return;
    }

    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байна.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch<ApiResponse>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          fullName,
          grade: Number(grade),
          classSection,
          username,
          password,
          phone: phone || undefined,
        }),
      });

      setSuccess('Бүртгэл амжилттай. Нэвтрэх таб руу шилжинэ...');
      setTab('login');
      setLoginUsername(username);
      setLoginPassword('');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Бүртгэл амжилтгүй.';
      const message = raw.toLowerCase().includes('exists') ? 'Энэ хэрэглэгчийн нэр бүртгэлтэй байна.' : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/">
          <button className="mb-6 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
            ← Буцах
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Сурагчийн нэвтрэлт</h1>
          <p className="text-gray-600 mb-6">Нэвтрэх эсвэл бүртгүүлэх</p>

          <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`py-2 rounded-md text-sm font-semibold ${
                tab === 'login' ? 'bg-white shadow text-cyan-700' : 'text-gray-600'
              }`}
            >
              Нэвтрэх
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2 rounded-md text-sm font-semibold ${
                tab === 'register' ? 'bg-white shadow text-cyan-700' : 'text-gray-600'
              }`}
            >
              Бүртгүүлэх
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Нэвтрэх нэр</label>
                <input
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Нэвтрэх нэр"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Нууц үг</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {loading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                Нэвтрэх
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Овог нэр</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Овог нэр"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Анги</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Сонгох</option>
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Бүлэг / анги</label>
                  <input
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="5A"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Нэвтрэх нэр</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Нэвтрэх нэр"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Нууц үг</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Утас (сонголттой)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="99112233"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {loading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                Бүртгүүлэх
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
