'use client';

import { useSearchParams } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const defaultRole = roleParam === 'parent' ? 'parent' : 'student';

  return <RegisterForm defaultRole={defaultRole} />;
}
