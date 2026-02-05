import { redirect } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  if (searchParams.role === 'admin') {
    redirect('/admin/login');
  }

  if (searchParams.role === 'parent') {
    redirect('/auth/parent');
  }

  redirect('/auth/student');
}
