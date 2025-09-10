// Định nghĩa kiểu dữ liệu cho người dùng Firebase (mở rộng từ Firebase Auth User)
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  
  // Thuộc tính mở rộng từ Firestore
  company?: string;
  role: 'user' | 'admin';
  createdAt?: Date | any; // Firebase Timestamp hoặc Date
  updatedAt?: Date | any; // Firebase Timestamp hoặc Date
}

// Định nghĩa kiểu dữ liệu cho cập nhật hồ sơ
export interface ProfileUpdateData {
  displayName?: string;
  company?: string;
  avatar?: File;
  photoURL?: string;
}

// Định nghĩa kiểu dữ liệu cho Auth Context - Cập nhật với refreshUser
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
  refreshUser?: () => Promise<User | null>; // Hàm làm mới dữ liệu người dùng
  getUserProfile?: (user: any) => Promise<User | null>;
  createUserDocument?: (user: any, additionalData?: any) => Promise<any>;
}

// Định nghĩa kiểu dữ liệu cho tin nhắn
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

// Định nghĩa kiểu dữ liệu cho tệp đính kèm trong chat
export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
}

// Định nghĩa kiểu dữ liệu cho cuộc trò chuyện
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  preview: string;
  messageCount: number;
  isFavorite?: boolean; // Tính năng yêu thích
  tags?: string[]; // Nhãn
}

// Định nghĩa kiểu dữ liệu cho thống kê cuộc trò chuyện
export interface ConversationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgMessagesPerConversation: number;
  favoriteCount: number;
}

// Định nghĩa kiểu dữ liệu cho tài liệu pháp luật
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

// Định nghĩa kiểu dữ liệu cho danh mục pháp luật
export interface LegalCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}

// Định nghĩa kiểu dữ liệu cho bộ lọc tìm kiếm
export interface SearchFilters {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  agency?: string;
}

// Định nghĩa kiểu dữ liệu cho kết quả tìm kiếm
export interface SearchResult {
  documents: LegalDocument[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Định nghĩa kiểu dữ liệu cho biểu mẫu đăng nhập
export interface LoginForm {
  email: string;
  password: string;
}

// Định nghĩa kiểu dữ liệu cho biểu mẫu đăng ký
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  company?: string;
}

// Định nghĩa kiểu dữ liệu cho biểu mẫu hồ sơ
export interface ProfileFormData {
  displayName: string;
  company: string;
  email: string;
}

// Định nghĩa kiểu dữ liệu cho mục điều hướng
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  badge?: number;
}

// Định nghĩa kiểu dữ liệu cho lỗi Firebase
export interface FirebaseAuthError {
  code: string;
  message: string;
}

// Định nghĩa kiểu dữ liệu cho kết quả tải lên tệp
export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

// Định nghĩa kiểu dữ liệu cho props của các thành phần
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

// Định nghĩa kiểu dữ liệu cho phản hồi API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Định nghĩa kiểu trạng thái tải
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Định nghĩa kiểu dữ liệu cho trạng thái thông báo
export interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
}

// Định nghĩa kiểu dữ liệu cho tùy chọn tải lên Cloudinary
export interface CloudinaryUploadOptions {
  public_id?: string;
  tags?: string;
  overwrite?: boolean;
  context?: Record<string, string>;
}

// Định nghĩa kiểu dữ liệu cho tùy chọn chuyển đổi Cloudinary
export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  gravity?: string;
}

// Định nghĩa kiểu dữ liệu cho kết quả xác thực tệp ảnh
export interface ImageFileValidation {
  isValid: boolean;
  error: string | null;
}

// Định nghĩa kiểu dữ liệu cho tùy chọn xác thực tệp ảnh
export interface ImageFileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

// Xuất mặc định interface User
export default User;