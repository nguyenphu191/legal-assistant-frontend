'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useConversations } from '@/contexts/ConversationsContext';
import ConversationItem from '@/components/conversations/ConversationItem';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import styles from './conversations.module.css';

export default function ConversationsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'messages'>('date');
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    conversations, 
    loading, 
    createConversation, 
    deleteConversation,
    searchConversations
  } = useConversations();

  const filteredConversations = searchQuery.trim() 
    ? searchConversations(searchQuery)
    : conversations;

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'messages':
        return b.messageCount - a.messageCount;
      default:
        return 0;
    }
  });

  const handleNewConversation = () => {
    const conversationId = createConversation();
    router.push(`/chat?id=${conversationId}`);
  };

  const handleDeleteConversation = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
      deleteConversation(id);
    }
  };

  const handleViewConversation = (id: string) => {
    router.push(`/chat?id=${id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <ProtectedRoute>
      <div className={styles.conversationsContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.conversationsLayout}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className={styles.mainContent}>
            {/* Header */}
            <div className={styles.pageHeader}>
              <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Lịch sử trò chuyện</h1>
                <p className={styles.pageDescription}>
                  Quản lý và xem lại các cuộc trò chuyện của bạn với AI
                </p>
              </div>
              
              <button 
                className={styles.newConversationButton}
                onClick={handleNewConversation}
              >
                <PlusIcon />
                <span>Cuộc trò chuyện mới</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <MagnifyingGlassIcon className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className={styles.clearSearchButton}
                      onClick={handleClearSearch}
                    >
                      <XMarkIcon />
                    </button>
                  )}
                </div>

                <button 
                  className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FunnelIcon />
                  <span>Bộ lọc</span>
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className={styles.filtersPanel}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Sắp xếp theo:</label>
                    <select 
                      className={styles.filterSelect}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="date">Thời gian cập nhật</option>
                      <option value="title">Tiêu đề</option>
                      <option value="messages">Số tin nhắn</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className={styles.conversationsList}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Đang tải cuộc trò chuyện...</p>
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? (
                    <>
                      <MagnifyingGlassIcon className={styles.emptyIcon} />
                      <h3>Không tìm thấy kết quả</h3>
                      <p>Không có cuộc trò chuyện nào khớp với "{searchQuery}"</p>
                      <button 
                        className={styles.clearSearchButton}
                        onClick={handleClearSearch}
                      >
                        Xóa tìm kiếm
                      </button>
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftRightIcon className={styles.emptyIcon} />
                      <h3>Chưa có cuộc trò chuyện</h3>
                      <p>Bắt đầu cuộc trò chuyện đầu tiên của bạn với AI</p>
                      <button 
                        className={styles.startChatButton}
                        onClick={handleNewConversation}
                      >
                        <PlusIcon />
                        Bắt đầu trò chuyện
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.resultsHeader}>
                    <p className={styles.resultsCount}>
                      {searchQuery 
                        ? `${sortedConversations.length} kết quả cho "${searchQuery}"`
                        : `${sortedConversations.length} cuộc trò chuyện`
                      }
                    </p>
                  </div>

                  <div className={styles.conversationsGrid}>
                    {sortedConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onClick={() => handleViewConversation(conversation.id)}
                        onDelete={() => handleDeleteConversation(conversation.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}