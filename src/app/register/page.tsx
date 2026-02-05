import { redirect } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  if (searchParams.role === 'admin') {
    redirect('/admin/login');
  }

  const defaultRole = searchParams.role === 'parent' ? 'parent' : 'student';
  const lockRole = searchParams.role === 'parent' || searchParams.role === 'student';
  return <RegisterForm defaultRole={defaultRole} lockRole={lockRole} />;
}
