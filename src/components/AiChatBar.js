import React, { useState, useRef, useEffect } from 'react';
import './AiChatBar.css';

const AiChatBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // For file upload
  const [fileId, setFileId] = useState(null); // To store the uploaded file ID
  const [fileName, setFileName] = useState(''); // To display the uploaded file name
  const [ossFiles, setOssFiles] = useState([]); // To store the list of OSS files
  const [isOssModalOpen, setIsOssModalOpen] = useState(false); // To control the OSS file selection modal
  const [isFetchingOssFiles, setIsFetchingOssFiles] = useState(false); // Loading state for fetching OSS files

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/api/ai/upload-for-chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      setFileId(data.fileId);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `文件 "${file.name}" 已上传成功，现在可以开始提问了。`,
        sender: 'system'
      }]);
    } catch (error) {
      console.error('File upload error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `文件 "${file.name}" 上传失败，请重试。`,
        sender: 'system',
        isError: true
      }]);
      setFileName('');
    } finally {
      setIsUploading(false);
      // Reset file input value to allow re-uploading the same file
      e.target.value = null;
    }
  };

  const handleRemoveFile = () => {
    setFileId(null);
    setFileName('');
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `已移除文件上下文。`,
      sender: 'system'
    }]);
  };

  // NEW: Fetch list of files from OSS
  const fetchOssFiles = async () => {
    setIsFetchingOssFiles(true);
    try {
      const response = await fetch('/api/ai/list-oss-files');
      if (!response.ok) {
        throw new Error('Failed to fetch OSS files');
      }
      const files = await response.json();
      setOssFiles(files);
    } catch (error) {
      console.error('Error fetching OSS files:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `获取OSS文件列表失败: ${error.message}`,
        sender: 'system',
        isError: true
      }]);
    } finally {
      setIsFetchingOssFiles(false);
    }
  };

  // NEW: Handle selection of an OSS file
  const handleSelectOssFile = async (filename) => {
    setIsOssModalOpen(false); // Close the modal
    setIsUploading(true); // Reuse the uploading state for visual feedback
    setFileName(filename); // Temporarily show the filename

    try {
      const response = await fetch('/api/ai/select-oss-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFileId(data.fileId); // Set the BaiLian fileId
      setFileName(data.filename); // Ensure filename is set (should be the same)
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `OSS文件 "${data.filename}" 已选择并处理完成，现在可以开始提问了。`,
        sender: 'system'
      }]);
    } catch (error) {
      console.error('Error selecting OSS file:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `选择OSS文件 "${filename}" 失败: ${error.message}`,
        sender: 'system',
        isError: true
      }]);
      setFileName(''); // Clear filename on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading || isUploading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    const newMessages = [...messages, { id: Date.now(), text: userMessage, sender: 'user' }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include fileId if it exists
        body: JSON.stringify({ conversationHistory: newMessages, fileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || '抱歉，我没有理解您的问题。';

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: `抱歉，我无法处理您的请求：${error.message}` , sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      <button className="ai-chat-toggle-button" onClick={toggleChat} aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}>
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 16.5C15.95 16.5 15.5 16.05 15.5 15.5V14.5C15.5 13.95 15.95 13.5 16.5 13.5H17.5C18.05 13.5 18.5 13.95 18.5 14.5V15.5C18.5 16.05 18.05 16.5 17.5 16.5H16.5ZM12 18C11.45 18 11 17.55 11 17V7C11 6.45 11.45 6 12 6C12.55 6 13 6.45 13 7V17C13 17.55 12.55 18 12 18ZM6.5 16.5C5.95 16.5 5.5 16.05 5.5 15.5V14.5C5.5 13.95 5.95 13.5 6.5 13.5H7.5C8.05 13.5 8.5 13.95 8.5 14.5V15.5C8.5 16.05 8.05 16.5 7.5 16.5H6.5Z" fill="currentColor"/></svg>
      </button>

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <h3>AI 助手</h3>
            <button className="ai-chat-close-button" onClick={toggleChat} aria-label="关闭聊天">×</button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="ai-chat-welcome">
                <p>您好！我是您的AI助手。</p>
                <p>您可以直接向我提问，或上传一份文档，让我基于文档内容回答您的问题。</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`ai-chat-message ${message.sender} ${message.isError ? 'error' : ''}`}>
                  <div className="ai-chat-message-content">{message.text}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="ai-chat-message ai">
                <div className="ai-chat-message-content">
                  <div className="ai-chat-typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-section">
            {fileName && (
              <div className="ai-chat-file-attachment">
                <span className="file-name">上下文: {fileName}</span>
                <button onClick={handleRemoveFile} className="remove-file-btn" aria-label="移除文件">×</button>
              </div>
            )}
            <div className="ai-chat-input-container">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".txt,.pdf,.docx,.md" />
              {/* NEW: Container for both attach buttons */}
              <div className="ai-chat-attach-button-group">
                <button 
                  className="ai-chat-attach-button" 
                  onClick={() => fileInputRef.current.click()} 
                  disabled={isLoading || isUploading || fileId} 
                  aria-label="上传本地文件"
                  title="上传本地文件"
                >
                  {isUploading ? <div className="ai-chat-loader"></div> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21.58 16.09l-1.18-1.18-1.96-1.96c-.39-.39-1.02-.39-1.41 0L16 14.05l-4.95-4.95 1.1-1.1c.39-.39.39-1.02 0-1.41L10.18 4.6c-.39-.39-1.02-.39-1.41 0L2.42 10.95c-.39.39-.39 1.02 0 1.41l1.96 1.96 1.18 1.18c.39.39 1.02.39 1.41 0l1.1-1.1 4.95 4.95-1.1 1.1c-.39.39-.39 1.02 0 1.41l1.96 1.96c.39.39 1.02.39 1.41 0l6.36-6.36c.39-.39.39-1.03 0-1.42z" fill="currentColor"/></svg>}
                </button>
                <button 
                  className="ai-chat-attach-button ai-chat-oss-button" 
                  onClick={() => { setIsOssModalOpen(true); fetchOssFiles(); }} 
                  disabled={isLoading || isUploading || fileId} 
                  aria-label="从OSS选择文件"
                  title="从OSS选择文件"
                >
                  {isFetchingOssFiles ? <div className="ai-chat-loader"></div> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor"/></svg>}
                </button>
              </div>
              <textarea
                className="ai-chat-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={fileId ? '基于文件提问...' : '输入您的问题...'}
                rows="1"
                disabled={isLoading || isUploading}
              />
              <button className="ai-chat-send-button" onClick={handleSubmit} disabled={!inputValue.trim() || isLoading || isUploading} aria-label="发送消息">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Modal for selecting OSS files */}
      {isOssModalOpen && (
        <div className="ai-chat-oss-modal-overlay">
          <div className="ai-chat-oss-modal">
            <div className="ai-chat-oss-modal-header">
              <h3>选择OSS文件</h3>
              <button className="ai-chat-oss-modal-close" onClick={() => setIsOssModalOpen(false)} aria-label="关闭">×</button>
            </div>
            <div className="ai-chat-oss-modal-content">
              {isFetchingOssFiles ? (
                <div className="ai-chat-oss-loading">正在加载文件列表...</div>
              ) : ossFiles.length > 0 ? (
                <ul className="ai-chat-oss-file-list">
                  {ossFiles.map((file, index) => (
                    <li key={index} className="ai-chat-oss-file-item">
                      <button 
                        className="ai-chat-oss-file-button"
                        onClick={() => handleSelectOssFile(file)}
                      >
                        {file}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>暂无可用文件。</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatBar;