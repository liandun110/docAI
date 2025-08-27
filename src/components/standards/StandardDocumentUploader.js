import React, { useState } from 'react';
import './DocumentLibrary.css';

function StandardDocumentUploader({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setError('请选择一个文件');
            return;
        }

        setUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('/api/standards/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`文件上传成功: ${result.filename}`);
                if(onUploadSuccess) {
                    onUploadSuccess();
                }
                setFile(null); // Reset file input
                event.target.reset(); // Reset form
            } else {
                setError(`上传失败: ${result.message || '未知错误'}`);
            }
        } catch (err) {
            setError(`上传出错: ${err.message}`);
        }
        setUploading(false);
    };

    return (
        <div>
            <h3 className="document-library-section-title">上传新的标准文档</h3>
            <form onSubmit={handleSubmit} className="document-uploader-form">
                <div className="document-uploader-input-container">
                    <input 
                        className="document-uploader-input" 
                        type="file" 
                        onChange={handleFileChange} 
                        disabled={uploading} 
                    />
                </div>
                <button 
                    type="submit" 
                    className="document-uploader-button" 
                    disabled={uploading}
                >
                    {uploading ? (
                        <div className="document-uploader-button-loading">
                            <div className="document-uploader-spinner"></div>
                            <span>上传中...</span>
                        </div>
                    ) : '上传'}
                </button>
            </form>
            {message && <div className="document-uploader-message document-uploader-message-success">{message}</div>}
            {error && <div className="document-uploader-message document-uploader-message-error">{error}</div>}
        </div>
    );
}

export default StandardDocumentUploader;
