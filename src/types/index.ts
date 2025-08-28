
// Firebase User Types (extended from Firebase Auth User)
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  
  // Extended properties from Firestore
  company?: string;
  role: 'user' | 'admin';
  createdAt?: Date | any; // Firebase Timestamp or Date
  updatedAt?: Date | any; // Firebase Timestamp or Date
}

// Profile Update Types
export interface ProfileUpdateData {
  displayName?: string;
  company?: string;
  avatar?: File;
  photoURL?: string;
}

// Auth Context Types - UPDATED with refreshUser
export interface AuthContextType {
  currentUser: User | null;
  userProfile?: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string, company?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  loginWithFacebook: () => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: ProfileUpdateData) => Promise<void>;
  refreshUser?: () => Promise<User | null>; // NEW: Added refreshUser function
  getUserProfile?: (user: any) => Promise<User | null>;
  createUserDocument?: (user: any, additionalData?: any) => Promise<any>;
}

// Chat Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Legal Document Types
export interface LegalDocument {
  id: string;
  title: string;
  type: 'nghiquyet' | 'thongtu' | 'quyet_dinh' | 'luat';
  number: string;
  publishDate: Date;
  effectiveDate: Date;
  status: 'active' | 'expired' | 'draft';
  agency: string;
  category: LegalCategory;
  content?: string;
  summary?: string;
}

export interface LegalCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}

// Search Types
export interface SearchFilters {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  agency?: string;
}

export interface SearchResult {
  documents: LegalDocument[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  company?: string;
}

// Profile Form Types
export interface ProfileFormData {
  displayName: string;
  company: string;
  email: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  badge?: number;
}

// Firebase Error Types
export interface FirebaseAuthError {
  code: string;
  message: string;
}

// File Upload Types
export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface HeaderProps {
  onMenuToggle: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Alert Types
export interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
}

// Cloudinary Types
export interface CloudinaryUploadOptions {
  public_id?: string;
  tags?: string;
  overwrite?: boolean;
  context?: Record<string, string>;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  gravity?: string;
}

// Image File Validation
export interface ImageFileValidation {
  isValid: boolean;
  error: string | null;
}

export interface ImageFileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export default User;