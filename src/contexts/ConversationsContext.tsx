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
  preview: string; // First message or summary
  messageCount: number;
}

interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  createConversation: (title?: string, firstMessage?: Message) => string;
  updateConversation: (id: string, messages: Message[]) => void;
  deleteConversation: (id: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  setActiveConversation: (id: string | null) => void;
  searchConversations: (query: string) => Conversation[];
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
    return 'Chưa có tin nhắn';
  };

  // Load conversations from localStorage
  useEffect(() => {
    const loadConversations = () => {
      if (currentUser) {
        try {
          const storedConversations = localStorage.getItem(`conversations_${currentUser.uid}`);
          if (storedConversations) {
            const parsed = JSON.parse(storedConversations);
            // Convert string dates back to Date objects
            const conversationsWithDates = parsed.map((conv: any) => ({
              ...conv,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
              messages: conv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }));
            setConversations(conversationsWithDates);
          }
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
      setLoading(false);
    };

    loadConversations();
  }, [currentUser]);

  // Save conversations to localStorage
  const saveConversations = (updatedConversations: Conversation[]) => {
    if (currentUser) {
      try {
        localStorage.setItem(
          `conversations_${currentUser.uid}`,
          JSON.stringify(updatedConversations)
        );
      } catch (error) {
        console.error('Error saving conversations:', error);
      }
    }
  };

  const createConversation = (title?: string, firstMessage?: Message): string => {
    const id = Date.now().toString();
    const now = new Date();
    const messages = firstMessage ? [firstMessage] : [];
    
    const newConversation: Conversation = {
      id,
      title: title || (firstMessage ? generateTitle(messages) : `Cuộc trò chuyện mới`),
      messages,
      createdAt: now,
      updatedAt: now,
      preview: firstMessage ? generatePreview(messages) : 'Cuộc trò chuyện mới',
      messageCount: messages.length
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setActiveConversationId(id);
    
    return id;
  };

  const updateConversation = (id: string, messages: Message[]) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        const updatedConv = {
          ...conv,
          messages,
          title: messages.length > 0 && conv.title.includes('Cuộc trò chuyện') 
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

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    if (activeConversationId === id) {
      setActiveConversationId(null);
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
      conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    conversations,
    activeConversationId,
    loading,
    createConversation,
    updateConversation,
    deleteConversation,
    getConversation,
    setActiveConversation,
    searchConversations
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}