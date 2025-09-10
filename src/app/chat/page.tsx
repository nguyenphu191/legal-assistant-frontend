'use client';

// Nhập các hook từ React và các thành phần, biểu tượng cần thiết
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

// Định nghĩa giao diện cho tin nhắn
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Thành phần chính của trang Chat
export default function ChatPage() {
  // Lấy thông tin người dùng hiện tại từ AuthContext
  const { currentUser } = useAuth();
  // Quản lý trạng thái mở/đóng của thanh bên
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Quản lý danh sách tin nhắn
  const [messages, setMessages] = useState<Message[]>([]);
  // Quản lý giá trị của ô nhập liệu
  const [inputValue, setInputValue] = useState('');
  // Quản lý trạng thái đang nhập liệu (AI đang trả lời)
  const [isTyping, setIsTyping] = useState(false);
  // Tham chiếu đến phần tử cuối danh sách tin nhắn để cuộn tự động
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hàm cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cuộn xuống cuối mỗi khi danh sách tin nhắn thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Xử lý gửi tin nhắn từ người dùng
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Tạo tin nhắn người dùng mới
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Thêm tin nhắn người dùng vào danh sách
    setMessages(prev => [...prev, userMessage]);
    // Xóa nội dung ô nhập liệu
    setInputValue('');
    // Đặt trạng thái đang nhập liệu
    setIsTyping(true);

    // Mô phỏng phản hồi của AI
    setTimeout(() => {
      const responses = [
        'Tôi có thể giúp bạn tra cứu thông tin pháp luật này. Để cung cấp câu trả lời chính xác nhất, bạn có thể cho tôi biết thêm chi tiết về vấn đề cụ thể không?',
        'Dựa trên câu hỏi của bạn, tôi sẽ tham khảo các văn bản pháp luật liên quan và đưa ra phản hồi phù hợp.',
        'Đây là một câu hỏi hay về pháp luật. Tôi sẽ phân tích và cung cấp thông tin chi tiết từ cơ sở dữ liệu pháp luật Việt Nam.',
        'Cảm ơn bạn đã sử dụng AI Tra cứu Luật. Tôi sẽ hỗ trợ bạn tìm hiểu về vấn đề này một cách tốt nhất.'
      ];

      // Chọn ngẫu nhiên một phản hồi
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Tạo tin nhắn AI mới
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };
      
      // Thêm tin nhắn AI vào danh sách
      setMessages(prev => [...prev, assistantMessage]);
      // Tắt trạng thái đang nhập liệu
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Xử lý hành động nhanh (gợi ý câu hỏi)
  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  // Danh sách các hành động nhanh
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

  // Giao diện người dùng của trang Chat
  return (
    <ProtectedRoute>
      <div className={styles.chatContainer}>
        {/* Thanh tiêu đề */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.chatLayout}>
          {/* Thanh bên */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Nội dung chính */}
          <main className={styles.mainContent}>
            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                // Màn hình chào mừng khi chưa có tin nhắn
                <div className={styles.welcomeScreen}>
                  <div className={styles.welcomeLogo}>
                    <img src="/chatbot.png" alt="AI Logo" className={styles.logoImage} />
                  </div>
                  
                  <h1 className={styles.welcomeTitle}>
                    Xin chào, {currentUser?.displayName || 'bạn'}!
                  </h1>
                  
                  <p className={styles.welcomeDescription}>
                    AI Tra cứu Luật có thể hỗ trợ gì cho bạn hôm nay?
                  </p>
                  
                  {/* Hành động nhanh */}
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
                // Danh sách tin nhắn
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
                          // Hình đại diện của AI
                          <div className={styles.assistantAvatar}>
                            <img src="/chatbot.png" alt="AI" className={styles.avatarImage} />
                          </div>
                        )}
                        <div className={styles.messageText}>
                          {message.content}
                        </div>
                        {message.type === 'user' && (
                          // Hình đại diện của người dùng
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
                  
                  {/* Chỉ báo AI đang nhập liệu */}
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

            {/* Khu vực nhập liệu */}
            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSendMessage}>
                <div className={styles.inputContainer}>
                  {/* Nút đính kèm */}
                  <button type="button" className={styles.attachButton}>
                    <PaperClipIcon />
                  </button>
                  
                  {/* Ô nhập câu hỏi */}
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi của bạn..."
                    className={styles.messageInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                  />
                  
                  {/* Nút ghi âm */}
                  <button type="button" className={styles.voiceButton}>
                    <MicrophoneIcon />
                  </button>
                  
                  {/* Nút gửi tin nhắn */}
                  <button 
                    type="submit" 
                    className={styles.sendButton}
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <PaperAirplaneIcon />
                  </button>
                </div>
              </form>
              
              {/* Chân trang khu vực nhập liệu */}
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