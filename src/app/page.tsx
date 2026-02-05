'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Сурагчийн
              <br />
              <span className="text-cyan-600">Туслах Систем</span>
            </h1>
            <p className="text-gray-600 text-lg mt-4">
              Асуудлын үед туслах гар сунгах орон зай
            </p>
          </div>

          {/* Entry Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/student/login" className="group">
              <div className="h-full bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎓</span>
                  <h2 className="text-2xl font-bold text-gray-800">Сурагч</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Нууц мэдээлэх боломжтой. Аюулгүй байдлыг нэн тэргүүнд тавина.
                </p>
                <div className="inline-flex items-center gap-2 text-cyan-700 font-semibold">
                  Нэвтрэх
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>

            <Link href="/parent/login" className="group">
              <div className="h-full bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">👨‍👩‍👧</span>
                  <h2 className="text-2xl font-bold text-gray-800">Эцэг эх</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Санал хүсэлт илгээх, асуудал мэдээлэх боломжтой.
                </p>
                <div className="inline-flex items-center gap-2 text-cyan-700 font-semibold">
                  Нэвтрэх
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin entry */}
          <div className="mt-6 flex items-center justify-center">
            <Link href="/admin/login">
              <button className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all">
                Админ нэвтрэх
              </button>
            </Link>
          </div>

          {/* Privacy + Safety Reminder */}
          <div className="mt-10 p-6 bg-white rounded-xl shadow-md border border-cyan-100">
            <p className="text-sm text-gray-600 text-center">
              🔒 Хувийн мэдээллийг багасгаж, зөвхөн шаардлагатай мэдээллийг л авдаг.
              Хэрэв яаралтай аюул тулгарсан бол хамгийн ойрын насанд хүрэгчид болон
              онцгой байдлын дугаарт хандана уу.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
