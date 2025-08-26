import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }

        if (document.type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: document.content }} />;
        } else {
            return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{document.content}</pre>;
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">文档预览</h3>
                <Link to="/standards" className="btn btn-secondary">返回列表</Link>
            </div>
            <div className="card p-4">
                <h5 className="card-title mb-3">{decodeURIComponent(filename)}</h5>
                <hr/>
                {renderContent()}
            </div>
        </div>
    );
}

export default StandardDocumentViewer;