# 🚀 Installation & Setup Guide

## System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **MongoDB**: 5.0 or later (local or Atlas)
- **Memory**: 2GB minimum
- **Disk Space**: 500MB minimum

## ✅ Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd school-support-system
npm install
```

### Step 2: Configure Environment
Create `.env` file in project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/school-support-system

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345678

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (cmd)
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `.env` with your Atlas URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-support-system
```

### Step 4: Initialize Database
```bash
npm run init-db
```

Output:
```
✅ Connected to MongoDB
✅ Cleared existing data
✅ Created admin user
✅ Created professional users
✅ Created demo reports

Database initialization completed successfully!

Demo Credentials:
==================
Admin:
  Email: admin
  Password: admin1234
...
```

### Step 5: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000 🎉

---

## 📋 System Check Validation

### MongoDB Connection
```bash
# Test connection
node -e "const m = require('mongoose'); m.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message))"
```

### Node Version
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

### Ports
```bash
# Check if port 3000 is available
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

---

## 🔐 First Login Test

### Access the Application

1. **Home Page**: http://localhost:3000
2. **Admin Login**: http://localhost:3000/admin/login
3. **Student Portal**: http://localhost:3000/student/login
4. **Parent Portal**: http://localhost:3000/parent/login

### Test Admin Access
```
Email: admin
Password: admin1234
```

### Navigate to Admin Dashboard
- After login, you'll see analytics, reports, and professional management
- Try filtering reports by severity
- Create a new report from student portal to test the full flow

---

## 🛠️ Development Commands

### Build for Production
```bash
npm run build
npm run start
```

### Type Check
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

### Reset Database
```bash
# Clear all data and reinitialize
npm run init-db
```

---

## 📊 Database Verification

### Check MongoDB Connection
```javascript
// In browser console or Node.js
const response = await fetch('/api/auth/verify', {
  headers: { 'Authorization': 'Bearer <your-token>' }
});
console.log(await response.json());
```

### View Database in MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Browse `school-support-system` database
4. Collections:
   - `users` - All user accounts
   - `reports` - Student/parent reports
   - `chatmessages` - Chat messages
   - `chatsessions` - Chat sessions

---

## 🔐 Secure Configuration for Production

### Change JWT Secret
```env
# Generate strong secret
JWT_SECRET=your-very-long-random-string-minimum-32-characters-recommended
```

### Use MongoDB Atlas (not local)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/school-support
```

### Enable HTTPS
- Deploy to hosting service (Netlify)
- Use environment-specific `.env.production.local`

### Rate Limiting (To be implemented)
- Add express-rate-limit middleware
- Limit: 100 requests per 15 minutes per IP

### Audit Logging (To be implemented)
- Log all admin actions
- Store in separate collection
- Enable for compliance

---

## 🐛 Troubleshooting

### MongoDB Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Start MongoDB: brew services start mongodb-community
2. Verify running: brew services list
3. Check URI in .env
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Use different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Module Not Found
```bash
# Ensure all dependencies installed
npm install

# Check imports are correct
npm run type-check
```

### Database Not Initialized
```bash
# Reinitialize database
npm run init-db

# Verify by checking admin exists
```

---

## 📚 Project Structure After Setup

```
school-support-system/
├── .next/                   # Build output
├── node_modules/            # Dependencies
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and models
│   └── types/               # TypeScript definitions
├── scripts/
│   └── init-db.js          # Database initialization
├── .env              # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
└── README.md               # Documentation
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MongoDB running locally or Atlas connected
- [ ] `.env` created with MONGODB_URI
- [ ] `npm run init-db` executed successfully
- [ ] `npm run dev` starts without errors
- [ ] Home page loads at http://localhost:3000
- [ ] Can login as admin / admin1234
- [ ] Admin dashboard shows analytics
- [ ] Student portal accessible
- [ ] Parent portal accessible
- [ ] Database contains collections

---

## 🚀 Next Steps

1. **Customize Demo Data**: Edit `scripts/init-db.js` to add your professionals
2. **Brand the App**: Change colors in Tailwind config
3. **Deploy**: Push to GitHub and deploy to Netlify
4. **Add Features**: Email notifications, SMS alerts, etc.
5. **Security**: Conduct security audit, set up monitoring

---

## 📞 Common Questions

**Q: Can I use a different database?**  
A: This project uses MongoDB. To use a different database, you'll need to rewrite the models and schemas.

**Q: How do I add more professionals?**  
A: Edit `scripts/init-db.js` and re-run `npm run init-db`, or use the admin dashboard.

**Q: How do I change the theme colors?**  
A: Edit `tailwind.config.ts` and the color variables in components.

**Q: Can I deploy to Netlify?**  
A: Yes! Connect your GitHub repo to Netlify and set environment variables in site settings.

**Q: Is the data encrypted?**  
A: Passwords are hashed with bcryptjs. Add TLS/SSL in production for data in transit.

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [README.md](./README.md) for overview
2. Review `.env` configuration
3. Check terminal output for error messages
4. Verify MongoDB is running
5. Clear cache: `rm -rf .next node_modules && npm install`

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
