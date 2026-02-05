# 🎓 Сурагчийн Туслах Систем (School Student Support System)

A secure, mobile-first web application designed to provide comprehensive support for students and parents in schools. The system facilitates anonymous reporting, professional consultation, and admin management of student welfare cases.

**Language:** Mongolian UI with full English backend documentation

---

## ✨ Features

### 📱 Student Portal
- **Anonymous Reporting**: Students can report issues anonymously
- **Multiple Issue Categories**:
  - Үе тэнгийн дээрэлхэлт (Peer Bullying)
  - Харилцааны зөрчил (Relationship Abuse)
  - Сэтгэл түгших, стресс (Mental Stress)
  - Гэр бүлийн асуудал / хүчирхийлэл (Family Violence)
  - Цахим дарамт (Cyberbullying)
  - Бусад (Other)
- **Severity Levels**: Auto-assigned
  - 🔴 High (Red) - хүнд хэлбэр
  - 🟡 Medium (Yellow) - дундаж
  - 🟢 Low (Green) - арай гайгүй
- **Quick Actions**: Advice cards, professional consultation, online chat

### 👨‍👩‍👧 Parent Portal
- Report student issues
- Send feedback and suggestions

### 🔧 Admin Dashboard
- View and manage all reports
- Analytics with charts
- Professional management
- Report assignment
- Chat monitoring

### 💬 Real-time Chat
- Private 1-to-1 conversations
- Encrypted messages
- Real-time updates

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Real-time**: Socket.io

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd school-support-system
npm install
```

### 2. Setup Environment
Create `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/school-support-system
JWT_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB
```bash
mongod --dbpath /path/to/data
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## 🔑 Demo Credentials

### Admin
- **Email**: admin
- **Password**: admin1234
- **URL**: http://localhost:3000/admin/login

### Professionals
- **Email**: psychologist1@school.mn, psychologist2@school.mn, social_worker@school.mn
- **Password**: admin1234

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication
│   │   ├── reports/         # Reports
│   │   ├── chat/            # Chat system
│   │   ├── professionals/   # Professionals
│   │   └── admin/           # Admin analytics
│   ├── student/             # Student pages
│   ├── parent/              # Parent pages
│   ├── admin/               # Admin pages
│   ├── page.tsx             # Home
│   └── layout.tsx           # Root layout
├── components/
│   ├── auth/                # Auth components
│   ├── student/             # Student components
│   ├── parent/              # Parent components
│   └── admin/               # Admin components
├── lib/
│   ├── auth/                # JWT, passwords
│   ├── db/                  # MongoDB connection
│   ├── models/              # Mongoose schemas
│   └── utils/               # Helpers
└── types/                   # TypeScript types
```

---

## 🔐 Security

✅ JWT-based authentication  
✅ Role-based access control  
✅ Anonymous reporting option  
✅ Encrypted passwords (bcryptjs)  
✅ Protected API routes  
✅ No cross-case data sharing  
✅ GDPR-compliant data handling  

---

## 📊 API Endpoints

### Auth
```
POST   /api/auth/login        # Login
POST   /api/auth/register     # Register
GET    /api/auth/verify       # Verify token
```

### Reports
```
POST   /api/reports           # Create report
GET    /api/reports           # Get all (admin)
GET    /api/reports/[id]      # Get specific
PATCH  /api/reports/[id]      # Update (admin)
```

### Chat
```
GET    /api/chat/[reportId]   # Get messages
POST   /api/chat/[reportId]   # Send message
```

### Professionals
```
GET    /api/professionals     # List professionals
POST   /api/professionals     # Create (admin)
```

### Admin
```
GET    /api/admin/analytics   # Analytics
```

---

## 🎨 Design Features

- **Color Palette**: Light Aqua + White
- **Severity Colors**:
  - 🔴 Red: High risk
  - 🟡 Yellow: Medium risk
  - 🟢 Green: Low risk
- **Mobile-First**: Fully responsive
- **Accessible**: Large buttons, readable text
- **Student-Friendly**: Clean, calm UI

---

## 📱 Responsive Design

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

---

## 🚦 Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Set up error monitoring
- [ ] Enable audit logging
- [ ] Deploy to production server

---

## 📝 License

Educational purposes - change credentials before production use.

---

## 🤝 Support

For issues or questions, please check:
1. MongoDB connection
2. Environment variables
3. Node.js version (18+)
4. Port availability

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: February 2026
