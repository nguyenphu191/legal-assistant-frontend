'use client';

// Nhập các hook và thành phần từ React, cùng với AuthContext
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Message, Conversation, ConversationStats } from '../types'; // Adjusted path to match the correct location

// Định nghĩa giao diện cho context của cuộc trò chuyện
interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  stats: ConversationStats;
  createConversation: (title?: string, firstMessage?: Message) => string;
  updateConversation: (id: string, messages: Message[]) => void;
  updateConversationTitle: (id: string, newTitle: string) => void; // Hàm chỉnh sửa tiêu đề
  deleteConversation: (id: string) => void;
  toggleFavorite: (id: string) => void; // Hàm chuyển đổi trạng thái yêu thích
  getConversation: (id: string) => Conversation | undefined;
  setActiveConversation: (id: string | null) => void;
  searchConversations: (query: string) => Conversation[];
  exportConversations: () => void; // Hàm xuất cuộc trò chuyện
  importConversations: (data: string) => boolean; // Hàm nhập cuộc trò chuyện
  bulkDeleteConversations: (ids: string[]) => void; // Hàm xóa hàng loạt
}

// Tạo context cho cuộc trò chuyện
const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

// Hook để sử dụng ConversationsContext
export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations phải được sử dụng bên trong ConversationsProvider');
  }
  return context;
}

// Định nghĩa giao diện cho props của ConversationsProvider
interface ConversationsProviderProps {
  children: ReactNode;
}

// Thành phần cung cấp context cho cuộc trò chuyện
export function ConversationsProvider({ children }: ConversationsProviderProps) {
  // Lấy thông tin người dùng hiện tại từ AuthContext
  const { currentUser } = useAuth();
  // Quản lý danh sách các cuộc trò chuyện
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Quản lý ID của cuộc trò chuyện đang hoạt động
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // Quản lý trạng thái đang tải
  const [loading, setLoading] = useState(true);

  // Tính toán thống kê cuộc trò chuyện
  const calculateStats = (convs: Conversation[]): ConversationStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = convs.filter(c => c.createdAt >= today).length;
    const weekCount = convs.filter(c => c.createdAt >= thisWeek).length;
    const monthCount = convs.filter(c => c.createdAt >= thisMonth).length;
    const favoriteCount = convs.filter(c => c.isFavorite).length;
    const avgMessages = convs.length > 0 
      ? Math.round(convs.reduce((sum, c) => sum + c.messageCount, 0) / convs.length)
      : 0;

    return {
      total: convs.length,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      avgMessagesPerConversation: avgMessages,
      favoriteCount
    };
  };

  // Tính toán thống kê từ danh sách cuộc trò chuyện
  const stats = calculateStats(conversations);

  // Tạo khóa lưu trữ với ID người dùng
  const getStorageKey = () => {
    return currentUser ? `conversations_${currentUser.uid}` : 'conversations_guest';
  };

  // Tải cuộc trò chuyện từ localStorage
  const loadConversations = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          return conversationsWithDates;
        } catch (error) {
          console.error('Lỗi khi tải cuộc trò chuyện:', error);
        }
      }
    }
    return [];
  };

  // Lưu cuộc trò chuyện vào localStorage
  const saveConversations = (convs: Conversation[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(), JSON.stringify(convs));
    }
  };

  // Khởi tạo cuộc trò chuyện
  useEffect(() => {
    const loadedConversations = loadConversations();
    setConversations(loadedConversations);
    setLoading(false);
  }, [currentUser]);

  // Tạo tiêu đề cuộc trò chuyện từ tin nhắn đầu tiên
  const generateTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + '...'
        : firstUserMessage.content;
    }
    return `Cuộc trò chuyện ${new Date().toLocaleDateString('vi-VN')}`;
  };

  // Tạo nội dung xem trước từ tin nhắn
  const generatePreview = (messages: Message[]): string => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      return lastMessage.content.length > 100 
        ? lastMessage.content.substring(0, 100) + '...'
        : lastMessage.content;
    }
    return 'Cuộc trò chuyện trống';
  };

  // Tạo cuộc trò chuyện mới
  const createConversation = (title?: string, firstMessage?: Message): string => {
    const now = new Date();
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newConversation: Conversation = {
      id,
      title: title || `Cuộc trò chuyện mới`,
      messages: firstMessage ? [firstMessage] : [],
      createdAt: now,
      updatedAt: now,
      preview: firstMessage ? firstMessage.content.substring(0, 100) : 'Cuộc trò chuyện trống',
      messageCount: firstMessage ? 1 : 0,
      isFavorite: false,
      tags: []
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    return id;
  };

  // Cập nhật tin nhắn của cuộc trò chuyện
  const updateConversation = (id: string, messages: Message[]) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        const updatedConv = {
          ...conv,
          messages,
          title: conv.title === 'Cuộc trò chuyện mới' && messages.length > 0 
            ? generateTitle(messages) 
            : conv.title,
          updatedAt: new Date(),
          preview: generatePreview(messages),
          messageCount: messages.length
        };
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  // Cập nhật tiêu đề cuộc trò chuyện
  const updateConversationTitle = (id: string, newTitle: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        return { ...conv, title: newTitle, updatedAt: new Date() };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  // Chuyển đổi trạng thái yêu thích
  const toggleFavorite = (id: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        return { ...conv, isFavorite: !conv.isFavorite, updatedAt: new Date() };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  // Xóa cuộc trò chuyện
  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  // Xóa hàng loạt cuộc trò chuyện
  const bulkDeleteConversations = (ids: string[]) => {
    const updatedConversations = conversations.filter(conv => !ids.includes(conv.id));
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId && ids.includes(activeConversationId)) {
      setActiveConversationId(null);
    }
  };

  // Xuất cuộc trò chuyện
  const exportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversations_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Nhập cuộc trò chuyện
  const importConversations = (data: string): boolean => {
    try {
      const importedData = JSON.parse(data);
      if (!Array.isArray(importedData)) {
        throw new Error('Định dạng không hợp lệ');
      }

      // Kiểm tra cấu trúc dữ liệu
      const validConversations = importedData.filter(conv => 
        conv.id && conv.title && Array.isArray(conv.messages)
      );

      if (validConversations.length === 0) {
        throw new Error('Không tìm thấy cuộc trò chuyện hợp lệ');
      }

      // Chuyển đổi ngày tháng và hợp nhất với dữ liệu hiện tại
      const conversationsWithDates = validConversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        isFavorite: conv.isFavorite || false,
        tags: conv.tags || [],
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));

      const mergedConversations = [...conversations, ...conversationsWithDates];
      setConversations(mergedConversations);
      saveConversations(mergedConversations);

      return true;
    } catch (error) {
      console.error('Lỗi khi nhập cuộc trò chuyện:', error);
      return false;
    }
  };

  // Lấy thông tin một cuộc trò chuyện theo ID
  const getConversation = (id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  };

  // Đặt cuộc trò chuyện đang hoạt động
  const setActiveConversation = (id: string | null) => {
    setActiveConversationId(id);
  };

  // Tìm kiếm cuộc trò chuyện
  const searchConversations = (query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.preview.toLowerCase().includes(lowerQuery) ||
      conv.messages.some((msg: { content: string; }) => msg.content.toLowerCase().includes(lowerQuery)) ||
      conv.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  // Giá trị context cung cấp
  const value = {
    conversations,
    activeConversationId,
    loading,
    stats,
    createConversation,
    updateConversation,
    updateConversationTitle,
    toggleFavorite,
    deleteConversation,
    bulkDeleteConversations,
    getConversation,
    setActiveConversation,
    searchConversations,
    exportConversations,
    importConversations
  };

  // Giao diện người dùng của ConversationsProvider
  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}