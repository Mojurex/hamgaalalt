import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth/password';

const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = 'admin1234';
const ADMIN_NAME = 'admin';

export async function ensureAdminSeed() {
  const normalizedEmail = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    return { created: false, userId: existing._id.toString() };
  }

  const hashedPassword = await hashPassword(ADMIN_PASSWORD);
  const admin = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    name: ADMIN_NAME,
    role: 'admin',
    status: 'active',
  });

  return { created: true, userId: admin._id.toString() };
}
