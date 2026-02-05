'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Сурагчийн
              <br />
              <span className="text-cyan-600">Туслах Систем</span>
            </h1>
            <p className="text-gray-600 text-lg mt-4">
              Сургууль, гэр бүл, сурагчдад зориулсан тусламжийн нэгдсэн сувгууд.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-full bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎓</span>
                <h2 className="text-2xl font-bold text-gray-800">Сурагч</h2>
              </div>
              <p className="text-gray-600 mb-5">
                Тусламж авах, мэдээлэх, зөвлөмж авах, чатлах боломжтой.
              </p>
              <Link href="/auth/student">
                <button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-all">
                  Сурагч — Тусламж авах
                </button>
              </Link>
            </div>

            <div className="h-full bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👨‍👩‍👧</span>
                <h2 className="text-2xl font-bold text-gray-800">Эцэг эх</h2>
              </div>
              <p className="text-gray-600 mb-5">
                Санал хүсэлт илгээж, асуудал мэдээлэх боломжтой.
              </p>
              <Link href="/auth/parent">
                <button className="w-full bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-all">
                  Эцэг эх — Санал/мэдээлэл
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Link href="/admin/login">
              <button className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all">
                Админ нэвтрэх
              </button>
            </Link>
          </div>

          <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-cyan-100">
            <p className="text-sm text-gray-600 text-center">
              🔒 Хувийн мэдээллийг зөвхөн шаардлагатай хэмжээнд авна. Нэвтэрснээр тайлангийн явцыг хянах боломжтой.
            </p>
          </div>

          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
            <p className="text-sm text-red-700 font-semibold">
              ⚠️ Яаралтай бол 101/102/103/105, Хүүхдийн тусламж 108
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
