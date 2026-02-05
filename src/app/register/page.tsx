import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const defaultRole = searchParams.role === 'parent' ? 'parent' : 'student';
  return <RegisterForm defaultRole={defaultRole} />;
}
