import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function StudentLoginPage() {
  return (
    <>
      <div className="min-h-[40vh] bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-end justify-center px-4 pt-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Нэргүйгээр үргэлжлүүлэх</h2>
            <p className="text-sm text-gray-600 mb-4">
              Тайлан илгээхэд бүртгэл шаардлагагүй.
            </p>
            <Link href="/student/dashboard">
              <button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-all">
                Нэргүйгээр үргэлжлүүлэх
              </button>
            </Link>
          </div>
        </div>
      </div>
      <LoginForm role="student" />
    </>
  );
}
