/**
 * Database Initialization Script
 * 
 * This script initializes the MongoDB database with demo data including:
 * - Admin user
 * - Test professionals (psychologist, social workers)
 * - Demo reports
 * 
 * Run with: npm run init-db
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
  email: { type: String, unique: true, lowercase: true },
  password: String,
  name: String,
  role: { type: String, enum: ['admin', 'psychologist', 'social_worker', 'student', 'parent'] },
  phone: String,
  availability: [String],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  category: { type: String, enum: ['peer_bullying', 'relationship_abuse', 'mental_stress', 'family_violence', 'cyberbullying', 'other'] },
  severity: { type: String, enum: ['high', 'medium', 'low'] },
  description: String,
  isAnonymous: { type: Boolean, default: true },
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

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Cleared existing data');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin1234', 10);

    // Create admin user
    const admin = await User.create({
      email: 'admin',
      password: hashedPassword,
      name: 'admin',
      role: 'admin',
      status: 'active',
    });
    console.log('✅ Created admin user');

    // Create professionals
    const professionals = await User.insertMany([
      {
        email: 'psychologist1@school.mn',
        password: hashedPassword,
        name: 'Д. Энхбаяр - Сэтгэлзүйч',
        role: 'psychologist',
        phone: '+976-11-123-4567',
        availability: ['Monday 10:00-12:00', 'Wednesday 14:00-16:00', 'Friday 10:00-12:00'],
        status: 'active',
      },
      {
        email: 'psychologist2@school.mn',
        password: hashedPassword,
        name: 'Ц. Сарнай - Сэтгэлзүйч',
        role: 'psychologist',
        phone: '+976-11-234-5678',
        availability: ['Tuesday 10:00-12:00', 'Thursday 14:00-16:00'],
        status: 'active',
      },
      {
        email: 'social_worker@school.mn',
        password: hashedPassword,
        name: 'Б. Ганзориг - Нийгмийн ажилтан',
        role: 'social_worker',
        phone: '+976-11-345-6789',
        availability: ['Monday 14:00-16:00', 'Wednesday 10:00-12:00', 'Friday 14:00-16:00'],
        status: 'active',
      },
    ]);
    console.log('✅ Created professional users');

    // Create demo reports
    await Report.insertMany([
      {
        category: 'peer_bullying',
        severity: 'medium',
        description: 'Сургуулийн нөхөрсөд надаас сайн мэдэхгүй байна. Сургуулийн ангид дараа сургалтын үед надтай нөхөрлөхийг үлэмжүүлэн хүсэхгүй байна.',
        isAnonymous: true,
        isUrgent: false,
        status: 'new',
        attachments: [],
      },
      {
        category: 'mental_stress',
        severity: 'high',
        description: 'Сурлагын ачаалал их. Математик болон англи хэлэнд муу оноо авдаг. Эцэг эх ихээр сомоо босох болж байна.',
        isAnonymous: true,
        isUrgent: true,
        status: 'in-progress',
        assignedTo: professionals[0]._id,
      },
      {
        category: 'cyberbullying',
        severity: 'medium',
        description: 'Facebook, TikTok дээр өөрийн эсрэг урвалтай комментарууд байдаг. Ихэвчлэн эргүүлэмжийн үг ашигладаг хүмүүс байдаг.',
        isAnonymous: true,
        isUrgent: false,
        status: 'new',
      },
      {
        category: 'other',
        severity: 'low',
        description: 'Гэрийн даалгавар олн байна.',
        isAnonymous: true,
        isUrgent: false,
        status: 'resolved',
      },
    ]);
    console.log('✅ Created demo reports');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('==================');
    console.log('Admin:');
    console.log('  Email: admin');
    console.log('  Password: admin1234');
    console.log('\nPsychologists:');
    console.log('  Email: psychologist1@school.mn');
    console.log('  Email: psychologist2@school.mn');
    console.log('\nSocial Worker:');
    console.log('  Email: social_worker@school.mn');
    console.log('\nPassword for all: admin1234');
    console.log('==================\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
