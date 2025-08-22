'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon 
} from '@heroicons/react/24/outline';
import styles from './chat.module.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

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
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Xin chào! Tôi là AI Tra cứu Luật. Tôi có thể giúp bạn giải đáp các thắc mắc về pháp luật, soạn thảo hợp đồng, tra cứu văn bản pháp luật và nhiều hơn nữa. Bạn có câu hỏi gì cần tôi hỗ trợ không?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className={styles.chatContainer}>
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        user={{ name: 'Người dùng' }}
      />
      
      <div className={styles.chatLayout}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className={styles.mainContent}>
          {/* Chat messages area */}
          <div className={styles.messagesArea}>
            {messages.length === 0 ? (
              /* Welcome screen */
              <div className={styles.welcomeScreen}>
                <div className={styles.welcomeLogo}>
                  <span>AI</span>
                </div>
                
                <h1 className={styles.welcomeTitle}>
                  AI Tra cứu Luật có thể hỗ trợ gì cho bạn?
                </h1>
                
                <p className={styles.welcomeDescription}>
                  Tôi có thể giúp bạn tra cứu văn bản pháp luật, giải đáp thắc mắc pháp lý, 
                  soạn thảo hợp đồng và nhiều hơn nữa.
                </p>

                {/* Quick actions */}
                <div className={styles.quickActions}>
                  <button
                    onClick={() => handleQuickAction('Tra cứu Nghị quyết về thuế nhập khẩu 2024')}
                    className={styles.quickAction}
                  >
                    <div className={styles.actionTitle}>📋 Tra cứu văn bản</div>
                    <div className={styles.actionDescription}>Tìm kiếm nghị quyết, thông tư, quyết định...</div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction('Hướng dẫn tính thuế nhập khẩu hàng hóa')}
                    className={styles.quickAction}
                  >
                    <div className={styles.actionTitle}>💡 Tư vấn pháp lý</div>
                    <div className={styles.actionDescription}>Giải đáp thắc mắc về pháp luật</div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction('Soạn hợp đồng mua bán hàng hóa')}
                    className={styles.quickAction}
                  >
                    <div className={styles.actionTitle}>📝 Soạn hợp đồng</div>
                    <div className={styles.actionDescription}>Tạo các loại hợp đồng phổ biến</div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction('Thủ tục đăng ký kinh doanh')}
                    className={styles.quickAction}
                  >
                    <div className={styles.actionTitle}>🏢 Thủ tục hành chính</div>
                    <div className={styles.actionDescription}>Hướng dẫn các thủ tục cần thiết</div>
                  </button>
                </div>
              </div>
            ) : (
              /* Chat messages */
              <div className={styles.chatMessages}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageRow} ${styles[message.type]}`}
                  >
                    <div className={`${styles.message} ${styles[message.type]}`}>
                      {message.type === 'assistant' && (
                        <div className={styles.assistantHeader}>
                          <div className={styles.assistantLogo}>
                            <span>AI</span>
                          </div>
                          <span className={styles.assistantName}>AI Tra cứu Luật</span>
                        </div>
                      )}
                      <div className={styles.messageContent}>{message.content}</div>
                      <div className={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingMessage}>
                      <div className={styles.typingHeader}>
                        <div className={styles.typingLogo}>
                          <span>AI</span>
                        </div>
                        <div className={styles.typingDots}>
                          <div className={styles.typingDot} />
                          <div className={styles.typingDot} />
                          <div className={styles.typingDot} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={styles.inputArea}>
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
              <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn tại đây..."
                    className={styles.textInput}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  
                  <div className={styles.inputActions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                    >
                      <PaperClipIcon />
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                    >
                      <MicrophoneIcon />
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className={styles.sendButton}
                >
                  <PaperAirplaneIcon />
                </button>
              </div>
              
              <div className={styles.inputFooter}>
                <span className={styles.charCount}>{inputValue.length}/2000</span>
                <span className={styles.disclaimer}>
                  Thông tin được tạo ra bằng AI. Hãy luôn cẩn trọng với việc sử dụng thông tin AI một cách có trách nhiệm.{' '}
                  <button>
                    Xem thêm về Quyền riêng tư của bạn và ứng dụng AI Tra Cứu Luật.
                  </button>
                </span>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}