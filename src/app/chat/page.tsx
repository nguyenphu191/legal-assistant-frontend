'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import styles from './chat.module.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Tôi có thể giúp bạn tra cứu thông tin pháp luật này. Để cung cấp câu trả lời chính xác nhất, bạn có thể cho tôi biết thêm chi tiết về vấn đề cụ thể không?',
        'Dựa trên câu hỏi của bạn, tôi sẽ tham khảo các văn bản pháp luật liên quan và đưa ra phản hồi phù hợp.',
        'Đây là một câu hỏi hay về pháp luật. Tôi sẽ phân tích và cung cấp thông tin chi tiết từ cơ sở dữ liệu pháp luật Việt Nam.',
        'Cảm ơn bạn đã sử dụng AI Tra cứu Luật. Tôi sẽ hỗ trợ bạn tìm hiểu về vấn đề này một cách tốt nhất.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  const quickActions = [
    {
      title: 'Tra cứu Luật Lao động',
      description: 'Tìm hiểu về quyền và nghĩa vụ của người lao động',
      icon: DocumentTextIcon
    },
    {
      title: 'Soạn hợp đồng',
      description: 'Hỗ trợ soạn thảo các loại hợp đồng phổ biến',
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Thủ tục hành chính',
      description: 'Hướng dẫn các thủ tục cần thiết',
      icon: SparklesIcon
    },
    {
      title: 'Tư vấn pháp lý',
      description: 'Giải đáp các thắc mắc về pháp luật',
      icon: QuestionMarkCircleIcon
    }
  ];

  return (
    <ProtectedRoute>
      <div className={styles.chatContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.chatLayout}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className={styles.mainContent}>
            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                <div className={styles.welcomeScreen}>
                  <div className={styles.welcomeLogo}>
                    <span>LA</span>
                  </div>
                  
                  <h1 className={styles.welcomeTitle}>
                    Xin chào, {currentUser?.displayName || 'bạn'}!
                  </h1>
                  
                  <p className={styles.welcomeDescription}>
                    AI Tra cứu Luật có thể hỗ trợ gì cho bạn hôm nay?
                  </p>
                  
                  <div className={styles.quickActions}>
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={index}
                          className={styles.quickAction}
                          onClick={() => handleQuickAction(action.title)}
                        >
                          <Icon className={styles.actionIcon} />
                          <div>
                            <div className={styles.actionTitle}>{action.title}</div>
                            <div className={styles.actionDescription}>{action.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        message.type === 'user' ? styles.userMessage : styles.assistantMessage
                      }`}
                    >
                      <div className={styles.messageContent}>
                        {message.type === 'assistant' && (
                          <div className={styles.assistantAvatar}>
                            <span>AI</span>
                          </div>
                        )}
                        <div className={styles.messageText}>
                          {message.content}
                        </div>
                        {message.type === 'user' && (
                          <div className={styles.userAvatar}>
                            {currentUser?.photoURL ? (
                              <img src={currentUser.photoURL} alt="User" />
                            ) : (
                              <span>{currentUser?.displayName?.[0] || 'U'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                      <div className={styles.messageContent}>
                        <div className={styles.assistantAvatar}>
                          <span>AI</span>
                        </div>
                        <div className={styles.typingIndicator}>
                          <div className={styles.typingDots}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSendMessage}>
                <div className={styles.inputContainer}>
                  <button type="button" className={styles.attachButton}>
                    <PaperClipIcon />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi của bạn..."
                    className={styles.messageInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                  />
                  
                  <button type="button" className={styles.voiceButton}>
                    <MicrophoneIcon />
                  </button>
                  
                  <button 
                    type="submit" 
                    className={styles.sendButton}
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <PaperAirplaneIcon />
                  </button>
                </div>
              </form>
              
              <div className={styles.inputFooter}>
                <p>AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}