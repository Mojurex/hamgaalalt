'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse } from '@/types';

interface Category {
  id: string;
  label: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'peer_bullying',
    label: 'Үе тэнгийн дээрэлхэлт',
    title: 'Үе тэнгийн дээрэлхэлт',
    emoji: '👥',
    description: 'Сургууль эсвэл интернетээр бусад оюутнуудаас хүүхэлтэлэх, дуугалах',
    color: 'yellow',
  },
  {
    id: 'relationship_abuse',
    label: 'Харилцааны зөрчил',
    title: 'Харилцааны зөрчил',
    emoji: '💔',
    description: 'Үйл ажиллагаа, үзүүлэлт нь үл сүвэглээ эсвэл гэмтэл',
    color: 'red',
  },
  {
    id: 'mental_stress',
    label: 'Сэтгэл түгших, стресс',
    title: 'Сэтгэл түгших, стресс',
    emoji: '😔',
    description: 'Сэтгэлийн эмгэг, уйлалт, сөргөлдөлт',
    color: 'yellow',
  },
  {
    id: 'family_violence',
    label: 'Гэр бүлийн асуудал / хүчирхийлэл',
    title: 'Гэр бүлийн асуудал / хүчирхийлэл',
    emoji: '🏠',
    description: 'Эцэг эхээс эсвэл гэр бүлийн гишүүдээс үл сүвэглээ',
    color: 'red',
  },
  {
    id: 'cyberbullying',
    label: 'Цахим дарамт',
    title: 'Цахим дарамт',
    emoji: '📱',
    description: 'Интернет эсвэл нийгмийн мэдээллийн сүлжээнээс дарамт',
    color: 'yellow',
  },
  {
    id: 'other',
    label: 'Бусад',
    title: 'Бусад асуудал',
    emoji: '❓',
    description: 'Дээрх категоригүй өөр нэг асуудал',
    color: 'green',
  },
];

interface ReportData {
  category: string;
  severity: string;
  description: string;
  isUrgent: boolean;
  attachments: string[];
}

export default function StudentDashboard() {
  const [step, setStep] = useState<'home' | 'form' | 'advice'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [evidence, setEvidence] = useState('');
  const [reportData, setReportData] = useState<ReportData>({
    category: '',
    severity: 'medium',
    description: '',
    isUrgent: false,
    attachments: [],
  });
  const [loading, setLoading] = useState(false);
  const maxDescriptionLength = 500;
  const router = useRouter();

  const steps = [
    { id: 'home', label: 'Юу болсон бэ?' },
    { id: 'form', label: 'Дэлгэрэнгүй' },
    { id: 'advice', label: 'Зөвлөмж/Мэдээлэх/Цаг/Чат' },
  ];

  const currentStepIndex = step === 'home' ? 0 : step === 'form' ? 1 : 2;

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await apiFetch<ApiResponse<{ role: string }>>('/api/auth/verify');
        if (res.data?.role !== 'student') {
          router.push('/auth/student');
        }
      } catch (error) {
        router.push('/auth/student');
      }
    };
    verify();
  }, [router]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setReportData((prev) => ({
      ...prev,
      category: category.id,
    }));
    setStep('form');
  };

  const handleSubmitReport = async () => {
    if (!reportData.description.trim()) {
      alert('Дэлгэрэнгүй мэдээлэл оруулна уу');
      return;
    }

    setLoading(true);
    try {
      const attachments = evidence
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      await apiFetch<ApiResponse>('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          isUrgent: reportData.isUrgent,
          attachments,
        }),
      });

      setStep('advice');
      setTimeout(() => {
        setStep('home');
        setReportData({
          category: '',
          severity: 'medium',
          description: '',
          isUrgent: false,
          attachments: [],
        });
        setEvidence('');
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Серверийн алдаа';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto pb-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/">
              <button className="mb-2 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
                ← Буцах
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Сурагчийн портал</h1>
          </div>
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-cyan-100">
            Нэвтэрсэн хэрэглэгч
          </span>
        </div>

        <div className="mb-8 bg-white rounded-xl border border-cyan-100 shadow-sm px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            {steps.map((item, index) => (
              <div key={item.id} className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStepIndex
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-semibold ${
                      index <= currentStepIndex ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mt-2 h-1 w-full bg-gray-100 rounded-full">
                    <div
                      className={`h-1 rounded-full ${
                        index < currentStepIndex ? 'bg-cyan-400' : 'bg-gray-100'
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Юу болсон бэ?
              </h2>
              <p className="text-gray-600 mb-6">
                Та ямар нэг асуудалтай тулгарч байвал доорх сонголтуудаас сонгоно уу.
              </p>
              <p className="text-sm text-gray-500">
                Тайлан илгээхэд нэвтэрсэн байх шаардлагатай.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-6 rounded-2xl text-left transition-all hover:shadow-lg ${
                    category.color === 'red'
                      ? 'bg-red-50 border-2 border-red-200 hover:border-red-300'
                      : category.color === 'yellow'
                        ? 'bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-300'
                        : 'bg-green-50 border-2 border-green-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{category.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{category.label}</h3>
                      <p className="text-gray-600 text-sm mt-2">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && selectedCategory && (
          <div>
            <button
              onClick={() => setStep('home')}
              className="mb-6 flex items-center text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              ← Буцах
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{selectedCategory.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedCategory.label}
                  </h2>
                  <p className="text-gray-600">{selectedCategory.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-cyan-800 mb-2">💡 Түр зөвлөмж</p>
                  <p className="text-sm text-cyan-700">
                    Та ганцаараа биш. Итгэж болох насанд хүрэгчидтэй ярилцах нь тус болно.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">🧭 Дараагийн алхам</p>
                  <p className="text-sm text-gray-600">
                    Доорх үйлдлүүдээс сонгож, тайлангаа илгээх эсвэл зөвлөмж уншиж болно.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                <button className="w-full bg-white hover:bg-cyan-50 border-2 border-cyan-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all">
                  ✅ Зөвлөмж унших
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Илгээж байна...' : 'Мэдээлэх'}
                </button>
                <button className="w-full bg-white hover:bg-cyan-50 border-2 border-cyan-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all">
                  📅 Цаг авах
                </button>
                <button className="w-full bg-white hover:bg-cyan-50 border-2 border-cyan-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all">
                  💬 Онлайн чат
                </button>
              </div>

              <form className="space-y-6">

                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Эрсдэлийн түвшин</p>
                    <p className="text-xs text-gray-500">
                      Таны үнэлгээ нь тусламжийн хурдыг тодорхойлоход тусална.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['high', 'medium', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setReportData((prev) => ({
                            ...prev,
                            severity: level,
                          }))
                        }
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          reportData.severity === level
                            ? 'border-cyan-400 bg-cyan-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-800">
                          {level === 'high' ? '🔴 Өндөр' : level === 'medium' ? '🟡 Дундаж' : '🟢 Бага'}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {level === 'high'
                            ? 'Яаралтай тусламж шаардлагатай'
                            : level === 'medium'
                              ? 'Хурдан тусламж хэрэгтэй'
                              : 'Дарааллын дагуу шийдэж болно'}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
                    Өнгөний тайлбар: 🔴 өндөр эрсдэл, 🟡 дундаж, 🟢 бага. Тод өнгө ашиглахгүй, уншигдах байдлыг хадгална.
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Асуудлын дэлгэрэнгүй</p>
                    <p className="text-xs text-gray-500">Яг юу болсон, хаана, хэзээ болсон талаар бичнэ үү.</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Дэлгэрэнгүй мэдээлэл
                      </label>
                      <span className="text-xs text-gray-500">
                        {reportData.description.length}/{maxDescriptionLength}
                      </span>
                    </div>
                    <textarea
                      value={reportData.description}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      maxLength={maxDescriptionLength}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-32"
                      placeholder="Юу болсон талаар бичнэ үү..."
                      required
                    />
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Нотлох баримт</p>
                    <p className="text-xs text-gray-500">Зураг, бичлэгийн холбоос байвал оруулна уу (сонголттой).</p>
                  </div>
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-24"
                    placeholder="Жишээ: https://... (мөр бүрт нэг холбоос)"
                  />
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Аюулгүй байдал</p>
                    <p className="text-xs text-gray-500">Яаралтай тохиолдолд тусламж авахыг зөвлөе.</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <label className="font-semibold text-gray-800">
                        Одоо аюултай юу?
                      </label>
                      <p className="text-sm text-gray-600">Тийм бол яаралтай тусламж дуудна уу.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={reportData.isUrgent}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          isUrgent: e.target.checked,
                        }))
                      }
                      className="w-6 h-6 text-red-600 cursor-pointer"
                    />
                  </div>

                  {reportData.isUrgent && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 font-semibold mb-2">
                        ⚠️ Өндөр эрсдэл илэрлээ. Дараах дугаарууд руу яаралтай холбогдоно уу:
                      </p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        <li>101 — Гал, онцгой байдал</li>
                        <li>102 — Цагдаа</li>
                        <li>103 — Түргэн тусламж</li>
                        <li>105 — Онцгой байдлын шуурхай</li>
                        <li>108 — Хүүхдийн тусламж</li>
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  )}
                  {loading ? 'Илгээж байна...' : 'Тайлан илгээх'}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'advice' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Хүлээн авлаа!
            </h2>
            <p className="text-gray-600 mb-6">
              Таны тайлан хүлээн авлаа. Мэргэжилтэн удахгүй таны тайланг үзэн судлах болно.
            </p>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
              <p className="text-green-800 font-semibold">
                💡 Санаа: Та анхааруулаххүнд холбогдох эсвэл өөрийнхөө эмгэгийг сэтгэл зүйчтэй хэлэлцэх боломжтой.
              </p>
            </div>
            <button
              onClick={() => setStep('home')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              Төлөв рүүг буцах
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-cyan-100 p-3">
        <div className="max-w-2xl mx-auto text-center text-xs md:text-sm text-gray-700">
          Яаралтай бол 102/103/101/105, Хүүхдийн тусламж 108
        </div>
      </div>
    </main>
  );
}
