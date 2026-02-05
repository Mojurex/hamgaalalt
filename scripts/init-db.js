/**
 * Database Initialization Script
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'school-support-system';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Add it to .env.');
}

function getDbNameFromUri(uri) {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname || '';
    const normalized = pathname.replace('/', '').trim();
    return normalized ? decodeURIComponent(normalized) : null;
  } catch (error) {
    return null;
  }
}

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  fullName: String,
  role: { type: String, enum: ['admin', 'student', 'parent'] },
  grade: Number,
  classSection: String,
  phone: String,
  email: String,
  childName: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  category: { type: String, enum: ['peer_bullying', 'relationship_abuse', 'mental_stress', 'family_violence', 'cyberbullying', 'other'] },
  severity: { type: String, enum: ['high', 'medium', 'low'] },
  description: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isUrgent: { type: Boolean, default: false },
  attachments: [String],
  status: { type: String, enum: ['new', 'in-progress', 'resolved', 'archived'], default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  notes: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Report = mongoose.model('Report', reportSchema);

async function initDB() {
  try {
    const dbNameFromUri = getDbNameFromUri(MONGODB_URI);
    const resolvedDbName = dbNameFromUri || DEFAULT_DB_NAME;
    const opts = dbNameFromUri ? {} : { dbName: resolvedDbName };

    if (!dbNameFromUri) {
      console.log(`ℹ️ MongoDB URI missing db name. Using dbName="${resolvedDbName}".`);
    }

    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin1234', 10);

    await User.create({
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: 'admin',
      role: 'admin',
      status: 'active',
    });
    console.log('✅ Created admin user');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('==================');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin1234');
    console.log('==================\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
