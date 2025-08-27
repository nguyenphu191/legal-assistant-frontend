'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  preview: string;
  messageCount: number;
  isFavorite?: boolean; // Thêm tính năng favorite
  tags?: string[]; // Thêm tags
}

// Thêm interface cho statistics
export interface ConversationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  avgMessagesPerConversation: number;
  favoriteCount: number;
}

interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  stats: ConversationStats;
  createConversation: (title?: string, firstMessage?: Message) => string;
  updateConversation: (id: string, messages: Message[]) => void;
  updateConversationTitle: (id: string, newTitle: string) => void; // Thêm function edit title
  deleteConversation: (id: string) => void;
  toggleFavorite: (id: string) => void; // Thêm function favorite
  getConversation: (id: string) => Conversation | undefined;
  setActiveConversation: (id: string | null) => void;
  searchConversations: (query: string) => Conversation[];
  exportConversations: () => void; // Thêm export
  importConversations: (data: string) => boolean; // Thêm import
  bulkDeleteConversations: (ids: string[]) => void; // Thêm bulk delete
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationsProvider');
  }
  return context;
}

interface ConversationsProviderProps {
  children: ReactNode;
}

export function ConversationsProvider({ children }: ConversationsProviderProps) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate statistics
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

  const stats = calculateStats(conversations);

  // Storage key with user ID
  const getStorageKey = () => {
    return currentUser ? `conversations_${currentUser.uid}` : 'conversations_guest';
  };

  // Load conversations from localStorage
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
          console.error('Error loading conversations:', error);
        }
      }
    }
    return [];
  };

  // Save conversations to localStorage
  const saveConversations = (convs: Conversation[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(), JSON.stringify(convs));
    }
  };

  // Initialize conversations
  useEffect(() => {
    const loadedConversations = loadConversations();
    setConversations(loadedConversations);
    setLoading(false);
  }, [currentUser]);

  // Generate conversation title from first message
  const generateTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + '...'
        : firstUserMessage.content;
    }
    return `Cuộc trò chuyện ${new Date().toLocaleDateString('vi-VN')}`;
  };

  // Generate preview from messages
  const generatePreview = (messages: Message[]): string => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      return lastMessage.content.length > 100 
        ? lastMessage.content.substring(0, 100) + '...'
        : lastMessage.content;
    }
    return 'Cuộc trò chuyện trống';
  };

  // Create new conversation
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

  // Update conversation messages
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

  // Update conversation title
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

  // Toggle favorite status
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

  // Delete conversation
  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  // Bulk delete conversations
  const bulkDeleteConversations = (ids: string[]) => {
    const updatedConversations = conversations.filter(conv => !ids.includes(conv.id));
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId && ids.includes(activeConversationId)) {
      setActiveConversationId(null);
    }
  };

  // Export conversations
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

  // Import conversations
  const importConversations = (data: string): boolean => {
    try {
      const importedData = JSON.parse(data);
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid format');
      }

      // Validate structure
      const validConversations = importedData.filter(conv => 
        conv.id && conv.title && Array.isArray(conv.messages)
      );

      if (validConversations.length === 0) {
        throw new Error('No valid conversations found');
      }

      // Convert dates and merge with existing
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
      console.error('Error importing conversations:', error);
      return false;
    }
  };

  const getConversation = (id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  };

  const setActiveConversation = (id: string | null) => {
    setActiveConversationId(id);
  };

  const searchConversations = (query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.preview.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery)) ||
      conv.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

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

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}