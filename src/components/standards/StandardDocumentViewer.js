import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DocumentLibrary.css';

function StandardDocumentViewer() {
    const { filename } = useParams();
    const [document, setDocument] = useState({ type: 'text', content: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocumentContent = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/standards/content/${encodeURIComponent(filename)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDocument(data);
            } catch (err) {
                setError('无法加载文档预览。');
                console.error("Failed to fetch document content:", err);
            }
            setLoading(false);
        };

        fetchDocumentContent();
    }, [filename]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="document-viewer-content-loading">
                    <div className="document-viewer-spinner"></div>
                </div>
            );
        }

        if (error) {
            return <div className="document-viewer-error">{error}</div>;
        }

        if (document.type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: document.content }} />;
        } else {
            return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{document.content}</pre>;
        }
    };

    return (
        <div className="document-viewer-container">
            <div className="document-viewer-header">
                <h3 className="document-viewer-title">文档预览</h3>
                <Link to="/standards" className="document-viewer-back-button">返回列表</Link>
            </div>
            <div className="document-viewer-card">
                <h5 className="document-viewer-filename">{decodeURIComponent(filename)}</h5>
                <hr/>
                <div className="document-viewer-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default StandardDocumentViewer;