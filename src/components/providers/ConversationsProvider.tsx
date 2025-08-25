'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatConversation, ChatMessage } from '@/types';

interface ConversationsContextType {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  createConversation: (title?: string) => ChatConversation;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};

interface ConversationsProviderProps {
  children: ReactNode;
}

export const ConversationsProvider: React.FC<ConversationsProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);

  const createConversation = (title: string = 'Cuộc trò chuyện mới'): ChatConversation => {
    const newConversation: ChatConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  };

  const updateConversation = (id: string, updates: Partial<ChatConversation>) => {
    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === id
          ? { ...conversation, ...updates, updatedAt: new Date() }
          : conversation
      )
    );

    if (currentConversation?.id === id) {
      setCurrentConversation(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conversation => conversation.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const addMessage = (conversationId: string, message: ChatMessage) => {
    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: new Date(),
            }
          : conversation
      )
    );

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, message],
              updatedAt: new Date(),
            }
          : null
      );
    }
  };

  const value: ConversationsContextType = {
    conversations,
    currentConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    setCurrentConversation,
    addMessage,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};