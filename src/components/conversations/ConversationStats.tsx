'use client';

import { ConversationStats } from '@/contexts/ConversationsContext';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import styles from './ConversationStats.module.css';

interface ConversationStatsProps {
  stats: ConversationStats;
  className?: string;
}

export default function ConversationStatsComponent({ stats, className = '' }: ConversationStatsProps) {
  const statsData = [
    {
      title: 'Tổng cuộc trò chuyện',
      value: stats.total,
      icon: ChatBubbleLeftRightIcon,
      color: '#0891b2'
    },
    {
      title: 'Hôm nay',
      value: stats.today,
      icon: CalendarIcon,
      color: '#14b8a6'
    },
    {
      title: 'Yêu thích',
      value: stats.favoriteCount,
      icon: HeartIcon,
      color: '#ec4899'
    },
    {
      title: 'TB tin nhắn/cuộc',
      value: stats.avgMessagesPerConversation,
      icon: ChartBarIcon,
      color: '#8b5cf6'
    }
  ];

  return (
    <div className={`${styles.statsContainer} ${className}`}>
      <div className={styles.statsGrid}>
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={styles.statCard}>
              <div 
                className={styles.statIcon}
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <IconComponent />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statTitle}>{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}