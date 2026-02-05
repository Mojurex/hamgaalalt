// User roles
export type UserRole = 'admin' | 'psychologist' | 'social_worker' | 'student' | 'parent';

// Report severity levels
export type SeverityLevel = 'high' | 'medium' | 'low'; // RED, YELLOW, GREEN

// Report status
export type ReportStatus = 'new' | 'in-progress' | 'resolved' | 'archived';

// Report categories
export type ReportCategory =
  | 'peer_bullying' // Үе тэнгийн дээрэлхэлт
  | 'relationship_abuse' // Харилцааны зөрчил
  | 'mental_stress' // Сэтгэл түгших, стресс
  | 'family_violence' // Гэр бүлийн асуудал / хүчирхийлэл
  | 'cyberbullying' // Цахим дарамт
  | 'other'; // Бусад

// User interface
export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  availability?: string[];
  status?: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

// Report interface
export interface Report {
  _id?: string;
  category: ReportCategory;
  severity: SeverityLevel;
  description: string;
  isAnonymous: boolean;
  reportedBy?: string; // User ID (null if anonymous)
  isUrgent: boolean;
  attachments?: string[]; // URLs to uploaded files
  status: ReportStatus;
  assignedTo?: string; // Professional ID
  studentName?: string; // For parent reports
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Chat message interface
export interface ChatMessage {
  _id?: string;
  reportId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: Date;
  read?: boolean;
}

// Chat session interface
export interface ChatSession {
  _id?: string;
  reportId: string;
  participants: string[]; // User IDs
  messages: ChatMessage[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
