import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth/password';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin1234';
const ADMIN_NAME = 'admin';

export async function ensureAdminSeed() {
  const normalizedUsername = ADMIN_USERNAME.toLowerCase();
  const existing = await User.findOne({ username: normalizedUsername });

  if (existing) {
    return { created: false, userId: existing._id.toString() };
  }

  const hashedPassword = await hashPassword(ADMIN_PASSWORD);
  const admin = await User.create({
    username: normalizedUsername,
    passwordHash: hashedPassword,
    fullName: ADMIN_NAME,
    role: 'admin',
    status: 'active',
  });

  return { created: true, userId: admin._id.toString() };
}
