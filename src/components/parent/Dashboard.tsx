'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse } from '@/types';

interface ReportData {
  category: string;
  description: string;
  isAnonymous: boolean;
  studentName: string;
}

export default function ParentDashboard() {
  const [step, setStep] = useState<'home' | 'form'>('home');
  const [reportData, setReportData] = useState<ReportData>({
    category: 'other',
    description: '',
    isAnonymous: false,
    studentName: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportData.description.trim() || !reportData.studentName.trim()) {
      alert('Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);
    try {
      await apiFetch<ApiResponse>('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      setStep('home');
      setReportData({
        category: 'other',
        description: '',
        isAnonymous: false,
        studentName: '',
      });
      alert('Мэдээлэл хүлээн авлаа. Баярлалаа!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Серверийн алдаа';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/">
              <button className="mb-2 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
                ← Буцах
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Эцэг эхийн портал</h1>
          </div>
          <button
            onClick={async () => {
              await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
              router.push('/');
            }}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            Гаралт
          </button>
        </div>

        {step === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Хүүхлийн талаарх мэдээлэл
              </h2>
              <p className="text-gray-600 mb-8">
                Хүүхлийнхөө асуудлын талаар сургууль болон мэргэжилтэнд мэдээлэх
              </p>
              <button
                onClick={() => setStep('form')}
                className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg w-full"
              >
                Мэдээлэл илгээх 📝
              </button>
            </div>

            {/* Other action buttons */}
            <div className="grid grid-cols-1 gap-4">
              <button className="bg-white hover:bg-cyan-50 border-2 border-cyan-300 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all">
                ✅ Санал хүсэлт илгээх
              </button>
              <button className="bg-white hover:bg-cyan-50 border-2 border-cyan-300 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all">
                💬 Мэргэжилтэнтэй холбогдох
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div>
            <button
              onClick={() => setStep('home')}
              className="mb-6 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              ← Буцах
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Хүүхлийн асуудлын талаар мэдээлэх
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Үндсэн мэдээлэл</p>
                    <p className="text-xs text-gray-500">Зөвхөн шаардлагатай мэдээллийг оруулна уу.</p>
                  </div>
                  {/* Student Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Хүүхлийнхөөний нэр
                    </label>
                    <input
                      type="text"
                      value={reportData.studentName}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          studentName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Хүүхлийн нэр"
                      required
                    />
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Асуудлын дэлгэрэнгүй</p>
                    <p className="text-xs text-gray-500">Ойлгомжтой, товч мэдээлэл оруулна уу.</p>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Асуудлын төрөл
                    </label>
                    <select
                      value={reportData.category}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="peer_bullying">Үе тэнгийн дээрэлхэлт</option>
                      <option value="family_violence">Гэр бүлийн асуудал</option>
                      <option value="mental_stress">Сэтгэлийн эмгэг</option>
                      <option value="academic">Сурлагын асуудал</option>
                      <option value="health">Эрүүл мэнд</option>
                      <option value="other">Бусад</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Дэлгэрэнгүй мэдээлэл
                    </label>
                    <textarea
                      value={reportData.description}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-32"
                      placeholder="Хүүхлийн асуудлын талаар дэлгэрэнгүй бичнэ үү..."
                      required
                    />
                  </div>
                </div>

                {/* Anonymous option */}
                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div>
                    <label className="font-semibold text-gray-800">Нэрээ нууцалж илгээх</label>
                    <p className="text-sm text-gray-600">Нэр ил гаргахгүйгээр дамжуулна.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reportData.isAnonymous}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        isAnonymous: e.target.checked,
                      }))
                    }
                    className="w-6 h-6 text-cyan-600 cursor-pointer"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  )}
                  {loading ? 'Илгээж байна...' : 'Мэдээлэл илгээх'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
