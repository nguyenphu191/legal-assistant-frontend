'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useConversations } from '@/contexts/ConversationsContext';
import ConversationItem from '@/components/conversations/ConversationItem';
import ConversationStatsComponent from '@/components/conversations/ConversationStats';

import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import styles from './conversations.module.css';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'favorites' | 'recent' | 'today';

export default function ConversationsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'messages'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { 
    conversations, 
    loading, 
    stats,
    createConversation, 
    deleteConversation,
    bulkDeleteConversations,
    toggleFavorite,
    updateConversationTitle,
    searchConversations,
    exportConversations,
    importConversations
  } = useConversations();

  // Filter conversations based on filter type
  const getFilteredConversations = () => {
    let filtered = searchQuery.trim() 
      ? searchConversations(searchQuery)
      : conversations;

    switch (filterType) {
      case 'favorites':
        filtered = filtered.filter(conv => conv.isFavorite);
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(conv => conv.updatedAt >= weekAgo);
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(conv => conv.updatedAt >= today);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredConversations = getFilteredConversations();

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

  const handleViewConversation = (id: string) => {
    router.push(`/chat?id=${id}`);
  };

  const handleDeleteConversation = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
      deleteConversation(id);
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    updateConversationTitle(id, newTitle);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Bulk operations
  const handleSelectConversation = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedConversations(prev => [...prev, id]);
    } else {
      setSelectedConversations(prev => prev.filter(convId => convId !== id));
    }
  };

  const handleSelectAll = () => {
    setSelectedConversations(sortedConversations.map(conv => conv.id));
  };

  const handleDeselectAll = () => {
    setSelectedConversations([]);
  };

  const handleBulkDelete = () => {
    if (selectedConversations.length === 0) return;
    
    const count = selectedConversations.length;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${count} cuộc trò chuyện đã chọn?`)) {
      bulkDeleteConversations(selectedConversations);
      setSelectedConversations([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkFavorite = () => {
    selectedConversations.forEach(id => toggleFavorite(id));
    setSelectedConversations([]);
    setShowBulkActions(false);
  };

  const toggleBulkMode = () => {
    setShowBulkActions(!showBulkActions);
    setSelectedConversations([]);
  };

  // Import/Export
  const handleExport = () => {
    exportConversations();
  };

  const handleImport = (data: string) => {
    return importConversations(data);
  };

  const allSelected = selectedConversations.length === sortedConversations.length && sortedConversations.length > 0;

  return (
    <ProtectedRoute>
      <div className={styles.conversationsContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.conversationsLayout}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className={styles.mainContent}>
            {/* Stats Section */}
            <ConversationStatsComponent stats={stats} className={styles.statsSection} />

            {/* Page Header */}
            <div className={styles.pageHeader}>
              <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Lịch sử trò chuyện</h1>
                <p className={styles.pageDescription}>
                  Quản lý và tìm kiếm các cuộc trò chuyện của bạn
                </p>
              </div>

            </div>

            {/* Search and Filters */}
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <MagnifyingGlassIcon className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className={styles.clearSearchButton}
                    >
                      <XMarkIcon />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
                >
                  <FunnelIcon />
                  <span>Lọc</span>
                </button>

                {/* View Mode Toggle */}
                <div className={styles.viewModeToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  >
                    <Squares2X2Icon />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
                  >
                    <ListBulletIcon />
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={styles.filtersPanel}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Hiển thị:</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className={styles.filterSelect}
                    >
                      <option value="all">Tất cả</option>
                      <option value="favorites">Yêu thích</option>
                      <option value="recent">Gần đây (7 ngày)</option>
                      <option value="today">Hôm nay</option>
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Sắp xếp:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'messages')}
                      className={styles.filterSelect}
                    >
                      <option value="date">Ngày cập nhật</option>
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
                  <ChatBubbleLeftRightIcon className={styles.emptyIcon} />
                  <h3>
                    {searchQuery || filterType !== 'all' 
                      ? 'Không tìm thấy kết quả' 
                      : 'Chưa có cuộc trò chuyện nào'
                    }
                  </h3>
                  <p>
                    {searchQuery || filterType !== 'all'
                      ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                      : 'Bắt đầu cuộc trò chuyện đầu tiên với AI Tra cứu Luật'
                    }
                  </p>
                  {!searchQuery && filterType === 'all' && (
                    <button onClick={handleNewConversation} className={styles.startChatButton}>
                      <PlusIcon />
                      <span>Bắt đầu trò chuyện</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.resultsHeader}>
                    <p className={styles.resultsCount}>
                      {searchQuery || filterType !== 'all' 
                        ? `${sortedConversations.length} kết quả${searchQuery ? ` cho "${searchQuery}"` : ''}`
                        : `${sortedConversations.length} cuộc trò chuyện`
                      }
                    </p>
                  </div>

                  <div className={`${styles.conversationsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
                    {sortedConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onClick={() => handleViewConversation(conversation.id)}
                        onDelete={() => handleDeleteConversation(conversation.id)}
                        onToggleFavorite={() => handleToggleFavorite(conversation.id)}
                        onUpdateTitle={(newTitle) => handleUpdateTitle(conversation.id, newTitle)}
                        isSelected={showBulkActions && selectedConversations.includes(conversation.id)}
                        onSelect={showBulkActions ? (selected) => handleSelectConversation(conversation.id, selected) : undefined}
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