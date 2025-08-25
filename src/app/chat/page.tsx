'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, Message } from '@/contexts/ConversationsContext';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import styles from './chat.module.css';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const conversationId = searchParams.get('id');
  
  const { 
    getConversation, 
    createConversation, 
    updateConversation,
    setActiveConversation 
  } = useConversations();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation on mount or when conversationId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        setIsLoadingConversation(true);
        const conversation = getConversation(conversationId);
        if (conversation) {
          setMessages(conversation.messages);
          setActiveConversation(conversationId);
          setCurrentConversationId(conversationId);
        } else {
          // Conversation not found, redirect to new chat
          router.push('/chat');
        }
        setIsLoadingConversation(false);
      } else {
        // No conversation ID, start fresh
        setMessages([]);
        setActiveConversation(null);
        setCurrentConversationId(null);
      }
    };

    loadConversation();
  }, [conversationId, getConversation, setActiveConversation, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update conversation when messages change
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      updateConversation(currentConversationId, messages);
    }
  }, [messages, currentConversationId, updateConversation]);

  // Simulate AI responses based on input
  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      'Tôi hiểu câu hỏi của bạn về pháp luật. Để cung cấp câu trả lời chính xác nhất, bạn có thể cho tôi biết thêm chi tiết về vấn đề cụ thể không?',
      'Dựa trên câu hỏi của bạn, tôi sẽ tham khảo các văn bản pháp luật liên quan và đưa ra phản hồi phù hợp. Đây là một chủ đề quan trọng trong luật pháp Việt Nam.',
      'Cảm ơn bạn đã sử dụng AI Tra cứu Luật. Tôi sẽ hỗ trợ bạn tìm hiểu về vấn đề này dựa trên cơ sở dữ liệu pháp luật cập nhật.',
      'Theo quy định của pháp luật Việt Nam, vấn đề bạn đề cập có những điểm cần lưu ý. Tôi sẽ phân tích chi tiết để cung cấp thông tin hữu ích nhất.',
      'Đây là một câu hỏi hay về pháp luật. Tôi sẽ tìm kiếm trong cơ sở dữ liệu gồm hơn 355,000 văn bản pháp luật để đưa ra câu trả lời phù hợp.'
    ];

    // Simple logic to vary responses based on input
    if (userMessage.toLowerCase().includes('luật lao động') || userMessage.toLowerCase().includes('lao động')) {
      return 'Về Luật Lao động, đây là một lĩnh vực quan trọng bảo vệ quyền lợi của người lao động. Luật Lao động 2019 có hiệu lực từ ngày 1/1/2021 với nhiều quy định mới. Bạn có thể cho tôi biết cụ thể bạn quan tâm đến vấn đề nào trong luật lao động?';
    }
    
    if (userMessage.toLowerCase().includes('hợp đồng') || userMessage.toLowerCase().includes('hop dong')) {
      return 'Về hợp đồng, đây là thỏa thuận giữa các bên nhằm xác lập, thay đổi hoặc chấm dứt quyền và nghĩa vụ dân sự. Tôi có thể hỗ trợ bạn về các loại hợp đồng khác nhau như hợp đồng mua bán, thuê nhà, lao động... Bạn cần tìm hiểu về loại hợp đồng nào?';
    }
    
    if (userMessage.toLowerCase().includes('thuế') || userMessage.toLowerCase().includes('thue')) {
      return 'Về thuế, Việt Nam có nhiều loại thuế khác nhau như thuế thu nhập cá nhân, thuế GTGT, thuế thu nhập doanh nghiệp... Luật Thuế được cập nhật thường xuyên để phù hợp với tình hình kinh tế. Bạn muốn tìm hiểu về loại thuế nào cụ thể?';
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    // Create conversation if this is the first message and no conversationId
    if (!currentConversationId && newMessages.length === 1) {
      const newConversationId = createConversation(undefined, userMessage);
      setCurrentConversationId(newConversationId);
      // Update URL without page reload
      window.history.replaceState(null, '', `/chat?id=${newConversationId}`);
    }

    // Simulate AI response with realistic delay
    const responseDelay = 1500 + Math.random() * 2000; // 1.5-3.5 seconds
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, responseDelay);
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  const handleNewConversation = () => {
    router.push('/chat');
  };

  const quickActions = [
    {
      title: 'Tra cứu Luật Lao động',
      description: 'Tìm hiểu về quyền và nghĩa vụ của người lao động',
      icon: DocumentTextIcon,
      query: 'Tôi muốn tìm hiểu về Luật Lao động mới nhất'
    },
    {
      title: 'Soạn hợp đồng',
      description: 'Hỗ trợ soạn thảo các loại hợp đồng phổ biến',
      icon: ClipboardDocumentListIcon,
      query: 'Tôi cần hỗ trợ soạn thảo hợp đồng'
    },
    {
      title: 'Thủ tục hành chính',
      description: 'Hướng dẫn các thủ tục cần thiết',
      icon: SparklesIcon,
      query: 'Hướng dẫn tôi về các thủ tục hành chính'
    },
    {
      title: 'Tư vấn pháp lý',
      description: 'Giải đáp các thắc mắc về pháp luật',
      icon: QuestionMarkCircleIcon,
      query: 'Tôi có một vấn đề pháp lý cần tư vấn'
    }
  ];

  if (isLoadingConversation) {
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
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                  <ArrowPathIcon />
                </div>
                <p>Đang tải cuộc trò chuyện...</p>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                    <span>AI</span>
                  </div>
                  
                  <h1 className={styles.welcomeTitle}>
                    Xin chào{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!
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
                          onClick={() => handleQuickAction(action.query)}
                        >
                          <Icon className={styles.actionIcon} />
                          <div className={styles.actionContent}>
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
                  {/* New conversation button */}
                  <div className={styles.conversationHeader}>
                    <button 
                      className={styles.newConversationBtn}
                      onClick={handleNewConversation}
                    >
                      <SparklesIcon />
                      <span>Cuộc trò chuyện mới</span>
                    </button>
                  </div>

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
                        <div className={styles.messageWrapper}>
                          {message.type === 'assistant' && (
                            <div className={styles.assistantHeader}>
                              <span className={styles.assistantName}>AI Tra cứu Luật</span>
                              <span className={styles.messageTime}>
                                {message.timestamp.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                          <div className={styles.messageText}>
                            {message.content}
                          </div>
                          {message.type === 'user' && (
                            <div className={styles.messageTime}>
                              {message.timestamp.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                        {message.type === 'user' && (
                          <div className={styles.userAvatar}>
                            {currentUser?.photoURL ? (
                              <img src={currentUser.photoURL} alt="User" />
                            ) : (
                              <span>{currentUser?.displayName?.[0]?.toUpperCase() || 'U'}</span>
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
                        <div className={styles.messageWrapper}>
                          <div className={styles.assistantHeader}>
                            <span className={styles.assistantName}>AI Tra cứu Luật</span>
                          </div>
                          <div className={styles.typingIndicator}>
                            <div className={styles.typingDots}>
                              <div className={styles.dot}></div>
                              <div className={styles.dot}></div>
                              <div className={styles.dot}></div>
                            </div>
                            <span className={styles.typingText}>Đang soạn trả lời...</span>
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
                  <button 
                    type="button" 
                    className={styles.attachButton}
                    title="Đính kèm file (sắp ra mắt)"
                    onClick={() => alert('Tính năng đính kèm file sẽ sớm ra mắt!')}
                  >
                    <PaperClipIcon />
                  </button>
                  
                  <input
                    type="text"
                    placeholder={isTyping ? "AI đang trả lời..." : "Nhập câu hỏi của bạn..."}
                    className={styles.messageInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                    maxLength={1000}
                  />
                  
                  <button 
                    type="button" 
                    className={styles.voiceButton}
                    title="Ghi âm (sắp ra mắt)"
                    onClick={() => alert('Tính năng ghi âm sẽ sớm ra mắt!')}
                  >
                    <MicrophoneIcon />
                  </button>
                  
                  <button 
                    type="submit" 
                    className={styles.sendButton}
                    disabled={!inputValue.trim() || isTyping}
                    title={!inputValue.trim() ? "Nhập tin nhắn để gửi" : "Gửi tin nhắn"}
                  >
                    <PaperAirplaneIcon />
                  </button>
                </div>
              </form>
              
              <div className={styles.inputFooter}>
                <p>
                  AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng. 
                  {inputValue.length > 0 && (
                    <span className={styles.characterCount}>
                      {inputValue.length}/1000
                    </span>
                  )}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}