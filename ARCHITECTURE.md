# 🏗️ System Architecture

## Overview

The School Student Support System is a modern, full-stack web application built with Next.js, React, MongoDB, and TypeScript. It follows a client-server architecture with clear separation of concerns.

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Student    │  │    Parent    │  │    Admin     │           │
│  │   Portal     │  │    Portal    │  │  Dashboard   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                      React Components                            │
│                      Tailwind CSS                                │
│                      TypeScript                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                   (Next.js API Routes)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    Auth      │  │   Reports    │  │     Chat     │           │
│  │  Endpoints   │  │  Endpoints   │  │  Endpoints   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │Professional  │  │    Admin     │                             │
│  │ Endpoints    │  │  Analytics   │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                   │
│          JWT Middleware | RBAC | Error Handling                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                    (MongoDB)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    User      │  │    Report    │  │ChatMessage   │           │
│  │ Collection   │  │  Collection  │  │ Collection   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐                                               │
│  │ChatSession   │                                               │
│  │ Collection   │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Frontend Architecture

### Component Hierarchy

```
App Root
├── Layout (RootLayout)
│   ├── Home Page (/)
│   │   └── Role Selection
│   │       ├── Student Portal
│   │       ├── Parent Portal
│   │       └── Admin Portal
│   │
│   ├── Student Flow
│   │   ├── Login (/student/login)
│   │   │   └── LoginForm Component
│   │   └── Dashboard (/student/dashboard)
│   │       └── StudentDashboard Component
│   │           ├── Home State
│   │           ├── Category Selection
│   │           ├── Form State
│   │           └── Success State
│   │
│   ├── Parent Flow
│   │   ├── Login (/parent/login)
│   │   │   └── LoginForm Component
│   │   └── Dashboard (/parent/dashboard)
│   │       └── ParentDashboard Component
│   │
│   └── Admin Flow
│       ├── Login (/admin/login)
│       │   └── LoginForm Component
│       └── Dashboard (/admin/dashboard)
│           └── AdminDashboard Component
│               ├── Key Metrics
│               ├── Charts
│               └── Reports Table
```

### Component Responsibility

- **LoginForm**: Handles authentication for all roles
- **StudentDashboard**: Multi-step report form, issue categories
- **ParentDashboard**: Student information and feedback submission
- **AdminDashboard**: Analytics, report management, filtering

---

## 🔌 Backend Architecture

### API Route Structure

```
/api/
├── /auth/
│   ├── /login          POST    - Authenticate user
│   ├── /register       POST    - Create new account
│   └── /verify         GET     - Verify JWT token
│
├── /reports/
│   ├── /               POST    - Create new report
│   ├── /               GET     - Get all reports (admin)
│   └── /[id]
│       ├── GET         - Get specific report
│       └── PATCH       - Update report (admin)
│
├── /chat/
│   └── /[reportId]
│       ├── GET         - Get messages
│       └── POST        - Send message
│
├── /professionals/
│   ├── /               GET     - List professionals
│   └── /               POST    - Create professional (admin)
│
└── /admin/
    └── /analytics      GET     - Dashboard analytics
```

### Middleware & Authentication Flow

```
Request
  │
  ├─→ Route Handler
  │    │
  │    ├─→ Auth Check
  │    │    │
  │    │    ├─→ Extract Bearer Token
  │    │    │
  │    │    ├─→ Verify JWT
  │    │    │
  │    │    └─→ Get User Payload
  │    │         (userId, email, role)
  │    │
  │    ├─→ Role Check (if required)
  │    │    │
  │    │    └─→ Validate User Role
  │    │         (admin, psychologist, etc.)
  │    │
  │    ├─→ Business Logic
  │    │    │
  │    │    ├─→ Database Query/Update
  │    │    │
  │    │    └─→ Data Transformation
  │    │
  │    └─→ Response
  │         │
  │         ├─→ Success: JSON Response
  │         └─→ Error: Error Response + Status Code
  │
  └─→ Client
```

---

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  name: String,
  role: Enum ["admin", "psychologist", "social_worker", "student", "parent"],
  phone: String,
  availability: [String],
  status: Enum ["active", "inactive"],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: email (unique), role, status

### Report Collection

```javascript
{
  _id: ObjectId,
  category: Enum [
    "peer_bullying",
    "relationship_abuse",
    "mental_stress",
    "family_violence",
    "cyberbullying",
    "other"
  ],
  severity: Enum ["high", "medium", "low"],
  description: String,
  isAnonymous: Boolean,
  reportedBy: ObjectId (ref: User),
  isUrgent: Boolean,
  attachments: [String],
  status: Enum ["new", "in-progress", "resolved", "archived"],
  assignedTo: ObjectId (ref: User),
  studentName: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: severity, status, category, createdAt, reportedBy

### ChatMessage Collection

```javascript
{
  _id: ObjectId,
  reportId: ObjectId (ref: Report),
  senderId: ObjectId (ref: User),
  senderName: String,
  senderRole: Enum ["admin", "psychologist", "social_worker", "student", "parent"],
  message: String,
  timestamp: Date,
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: reportId, senderId, timestamp

### ChatSession Collection

```javascript
{
  _id: ObjectId,
  reportId: ObjectId (ref: Report, unique),
  participants: [ObjectId] (ref: User),
  messages: [ObjectId] (ref: ChatMessage),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: reportId (unique), isActive

---

## 🔐 Security Architecture

### Authentication Flow

```
User Input (Email, Password)
  │
  ├─→ POST /api/auth/login
  │    │
  │    ├─→ Find user by email
  │    │
  │    ├─→ Compare password with hash
  │    │
  │    ├─→ Generate JWT Token
  │    │    {
  │    │      userId: "...",
  │    │      email: "...",
  │    │      role: "...",
  │    │      iat: timestamp,
  │    │      exp: timestamp + 7days
  │    │    }
  │    │
  │    └─→ Return token + user data
  │
  ├─→ Client stores token in localStorage
  │
  ├─→ Subsequent requests include token
  │    Authorization: Bearer <token>
  │
  ├─→ Server validates token on each request
  │    │
  │    ├─→ Extract token from header
  │    │
  │    ├─→ Verify signature
  │    │
  │    ├─→ Check expiration
  │    │
  │    └─→ Grant/Deny access
  │
  └─→ Response sent to client
```

### Role-Based Access Control (RBAC)

```
User Role Hierarchy
│
├── Admin
│   └── Can: View all reports, assign, manage professionals,
│           view analytics, update report status
│
├── Psychologist
│   └── Can: View assigned reports, send chat messages,
│           add notes to assigned cases
│
├── Social Worker
│   └── Can: View assigned reports, send chat messages,
│           add notes to assigned cases
│
├── Student
│   └── Can: Create anonymous reports, view own chats
│
└── Parent
    └── Can: Submit student information, view feedback status
```

### Data Protection

```
Report Submission
  │
  ├─→ Anonymous Option
  │    ├─→ If true: reportedBy = null
  │    └─→ If false: reportedBy = userId
  │
  ├─→ Urgency Flag
  │    ├─→ If true: severity = "high"
  │    └─→ Auto-assign based on category
  │
  └─→ Chat Access
       ├─→ Only assigned professional can see
       ├─→ Only participants can send messages
       └─→ Admin has oversight (read-only)
```

---

## 🔄 Data Flow Examples

### Student Report Submission Flow

```
1. Student selects category → Category chosen (client state)
2. Student fills form → Data in state
3. Student clicks submit → POST /api/reports
   │
   └─→ Server:
       ├─→ Validate token (JWT middleware)
       ├─→ Validate request body
       ├─→ Determine severity based on category + urgency
       ├─→ Create report document
       ├─→ Return report data
4. Client receives success → Show confirmation
5. Admin receives notification → New report in dashboard
6. Professional assigned → Chat session created
7. Messages exchanged → Chat history stored
```

### Admin Dashboard Analytics

```
Admin requests /api/admin/analytics
  │
  └─→ Server:
      ├─→ Verify JWT token
      ├─→ Check role == admin
      ├─→ Query Report collection:
      │   ├─→ Count by severity
      │   ├─→ Count by category
      │   ├─→ Count by status
      │   ├─→ Group by month
      │   └─→ Calculate totals
      ├─→ Aggregate pipeline:
      │   $group → Count by field
      │   $sort → Order results
      │   $limit → Pagination
      └─→ Return aggregated data
  │
  └─→ Client renders charts with Recharts
```

---

## 🚀 Performance Optimization

### Database Optimization

1. **Indexing**
   - Email field indexed (unique)
   - Severity, status, category indexed
   - Timestamps indexed for sorting

2. **Query Optimization**
   - Use select() to limit fields
   - Pagination for large result sets
   - Lean queries where documents not modified

3. **Connection Pooling**
   - Mongoose handles connection pooling
   - Reuses connections across requests

### Frontend Optimization

1. **Code Splitting**
   - Each page in separate chunk
   - Lazy loading where applicable

2. **Image Optimization**
   - Next.js Image component
   - Automatic compression

3. **Caching**
   - HTTP caching headers
   - Client-side state management

---

## 🔄 Deployment Architecture

### Development

```
Local Machine
  │
  ├─→ Next.js Dev Server (npm run dev)
  │    ├─→ Hot reload on changes
  │    └─→ API routes via /api/*
  │
  ├─→ MongoDB (local or Atlas)
  │    └─→ Dev database: school-support-system
  │
  └─→ Environment: .env
```

### Production

```
Deployment Platform (Netlify)
  │
  ├─→ Next.js Production Build
  │    ├─→ Compiled to optimized code
  │    ├─→ API routes: /api/*
  │    └─→ Static assets: /public/*
  │
  ├─→ MongoDB Atlas
  │    └─→ Prod database with backups
  │
  └─→ Environment: .env.production.local
       ├─→ JWT_SECRET: Strong random key
       ├─→ MONGODB_URI: Atlas connection
       └─→ NEXTAUTH_URL: Production domain
```

---

## 📊 Request/Response Cycle

### Typical API Request

```
Client Request:
POST /api/reports
Headers: {
  Authorization: "Bearer eyJhbGc...",
  Content-Type: "application/json"
}
Body: {
  category: "peer_bullying",
  description: "Bullying happened...",
  isAnonymous: true,
  isUrgent: false
}

Server Processing:
1. Extract and verify JWT → Get userId
2. Validate request body
3. Query database (create Report document)
4. Create response object
5. Send HTTP response

Server Response:
{
  success: true,
  data: {
    _id: "507f...",
    category: "peer_bullying",
    severity: "medium",
    status: "new",
    ...
  }
}

Client Handling:
1. Check success flag
2. Extract data
3. Update UI state
4. Show confirmation to user
```

---

## ⚙️ Configuration & Environment

### Environment Variables

```
MONGODB_URI          - MongoDB connection string
JWT_SECRET           - Secret key for JWT signing
NEXTAUTH_URL         - Application base URL
NODE_ENV             - development/production/test
```

### Build Configuration

```
next.config.ts       - Next.js build settings
tsconfig.json        - TypeScript configuration
tailwind.config.ts   - Tailwind CSS configuration
.eslintrc            - ESLint rules
```

---

## 🔍 Monitoring & Logging

### Client-Side Logging

- Console errors logged
- API call failures tracked
- User actions logged (future)

### Server-Side Logging

- Request/response logging (future)
- Error stack traces
- Database query timing (future)
- Authentication attempts

### Database Monitoring

- MongoDB connection status
- Query performance
- Collection sizes
- Document counts

---

## 📈 Scalability Considerations

### Horizontal Scaling

- Stateless API routes (can run on multiple servers)
- JWT for distributed auth (no session store)
- MongoDB supports replication and sharding

### Vertical Scaling

- Database indexing for faster queries
- Connection pooling
- Efficient algorithms

### Future Improvements

- Redis caching layer
- Message queue for async tasks
- CDN for static assets
- API rate limiting

---

## 🔄 CI/CD Pipeline (Recommended)

```
Code Push
  │
  ├─→ GitHub Actions
  │    ├─→ Install dependencies
  │    ├─→ Run linter
  │    ├─→ Run type checker
  │    ├─→ Run tests (future)
  │    └─→ Build project
  │
  └─→ If all pass:
       ├─→ Deploy to Staging
       ├─→ Run smoke tests
       └─→ Deploy to Production
```

---

**Last Updated**: February 2026  
**Architecture Version**: 1.0.0  
**Status**: Production Ready
