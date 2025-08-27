import React, { useState } from 'react';

const DocumentUploader = ({ onUploadStart, onUploadComplete, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false); // 添加上传状态

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    // 检查文件类型
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain' // .txt
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件格式。请上传 PDF、DOC、DOCX 或 TXT 文件。');
      return;
    }
    
    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小超过限制 (10MB)。');
      return;
    }
    
    setFile(file);
    setError('');
  };

  const handleSubmit = async () => { // 使用async函数
    if (!file) {
      setError('请选择一个文件');
      return;
    }

    setError(''); // 清除之前的错误
    onUploadStart(); // 通知父组件上传开始
    setUploading(true); // 设置上传状态

    const formData = new FormData();
    formData.append('document', file); // 将文件添加到FormData对象

    try {
      // 发送文件到后端API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json(); // 解析后端返回的JSON结果
      console.log('AI处理结果:', result);
      
      // 调用父组件传递的回调函数，并传递完整的AI处理结果
      onUploadComplete(result); 
    } catch (err) {
      console.error('上传或处理失败:', err);
      const errorMessage = err.message || '请检查后端服务是否正常运行。';
      setError('上传或处理文件时出错: ' + errorMessage);
      onUploadError(errorMessage); // 通知父组件发生了错误
    } finally {
      setUploading(false); // 重置上传状态
    }
  };

  return (
    <div className="sleek-uploader-container">
      <div 
        className={`sleek-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="sleek-upload-content">
          <div className="sleek-upload-icon">📄</div>
          <p className="sleek-upload-text">
            {file ? file.name : '拖拽文件到此处或点击上传'}
          </p>
          <p className="sleek-upload-hint">
            支持 PDF, DOC, DOCX, TXT 格式，文件大小不超过10MB
          </p>
          <input 
            type="file" 
            id="file-input"
            className="sleek-file-input"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.txt"
            disabled={uploading} // 上传时禁用文件选择
          />
          <label htmlFor="file-input" className="sleek-upload-button">
            选择文件
          </label>
        </div>
      </div>
      
      {error && <div className="sleek-error-message">{error}</div>}
      
      <div className="sleek-submit-section">
        <button 
          className="sleek-submit-button"
          onClick={handleSubmit}
          disabled={!file || uploading} // 文件未选择或正在上传时禁用按钮
        >
          {uploading ? '正在上传...' : '开始审核'} {/* 根据上传状态改变按钮文字 */}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploader;