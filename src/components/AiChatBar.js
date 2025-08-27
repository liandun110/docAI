import React, { useState, useRef, useEffect } from 'react';
import './AiChatBar.css';

const AiChatBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // 添加用户消息
    const newMessages = [...messages, { 
      id: Date.now(), 
      text: userMessage, 
      sender: 'user' 
    }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 调用后端AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || '抱歉，我没有理解您的问题。';

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: aiResponse, 
        sender: 'ai' 
      }]);
    } catch (error) {
      console.error('AI聊天错误:', error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: '抱歉，我无法处理您的请求。请稍后再试。', 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      {/* 聊天图标按钮 */}
      <button 
        className="ai-chat-toggle-button"
        onClick={toggleChat}
        aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 17C7.45 17 7 16.55 7 16V15C7 14.45 7.45 14 8 14H16C16.55 14 17 14.45 17 15V16C17 16.55 16.55 17 16 17H8ZM17 12C17 12.55 16.55 13 16 13H8C7.45 13 7 12.55 7 12V8C7 7.45 7.45 7 8 7H16C16.55 7 17 7.45 17 8V12Z" fill="currentColor"/>
        </svg>
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <h3>AI 助手</h3>
            <button 
              className="ai-chat-close-button"
              onClick={toggleChat}
              aria-label="关闭聊天"
            >
              ×
            </button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="ai-chat-welcome">
                <p>您好！我是您的AI助手，可以帮您解答关于公安标准文档的问题。</p>
                <p>您可以询问关于标准编写、格式要求、术语定义等方面的问题。</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`ai-chat-message ${message.sender}`}
                >
                  <div className="ai-chat-message-content">
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="ai-chat-message ai">
                <div className="ai-chat-message-content">
                  <div className="ai-chat-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="ai-chat-input-container">
            <textarea
              className="ai-chat-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题... (按Enter发送)"
              rows="1"
              disabled={isLoading}
            />
            <button 
              className="ai-chat-send-button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              aria-label="发送消息"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatBar;