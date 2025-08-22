// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'user' | 'business';
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
  
  // Navigation Types
  export interface NavigationItem {
    id: string;
    title: string;
    icon: string;
    href: string;
    badge?: number;
  }