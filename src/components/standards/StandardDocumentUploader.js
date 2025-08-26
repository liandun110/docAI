import React, { useState } from 'react';

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
            <h3 className="mb-3">上传新的标准文档</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input className="form-control" type="file" onChange={handleFileChange} disabled={uploading} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span className="visually-hidden">Loading...</span>
                            <span style={{marginLeft: '5px'}}>上传中...</span>
                        </>
                    ) : '上传'}
                </button>
            </form>
            {message && <div className="alert alert-success mt-3">{message}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
}

export default StandardDocumentUploader;
