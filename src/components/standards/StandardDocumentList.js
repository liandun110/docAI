import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DocumentLibrary.css';

function StandardDocumentList() {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    
    // 从URL state获取角色信息
    const role = location.state?.role || 'gongan'; // 默认为公安标准

    useEffect(() => {
        fetchDocuments();
    }, [role]);

    const fetchDocuments = async () => {
        setLoading(true);
        setError('');
        // 构建URL参数
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        params.append('role', role);
        
        const url = `/api/standards?${params.toString()}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDocuments(data);
        } catch (err) {
            setError("无法获取文档列表，请稍后重试。");
            console.error("Failed to fetch documents:", err);
        }
        setLoading(false);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        fetchDocuments();
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="document-list-loading">
                    <div className="document-list-spinner"></div>
                </div>
            );
        }

        if (error) {
            return <div className="document-list-error">{error}</div>;
        }

        if (documents.length === 0) {
            return <p className="document-list-empty">未找到任何文档。</p>;
        }

        return (
            <ul className="document-list-items">
                {documents.map(doc => (
                    <li key={doc} className="document-list-item">
                        <Link to={`/standards/preview/${encodeURIComponent(doc)}`} className="document-list-item-link">
                            {decodeURIComponent(doc)}
                        </Link>
                        <a href={`/api/standards/${encodeURIComponent(doc)}`} className="document-list-item-download">下载</a>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <h3 className="document-library-section-title">已上传的标准文档</h3>
            <div className="document-list-search-container">
                <form onSubmit={handleSearch} className="document-list-search-form">
                    <input
                        type="text"
                        className="document-list-search-input"
                        placeholder="搜索文档..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="document-list-search-button" type="submit">搜索</button>
                </form>
            </div>
            <div className="document-list-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default StandardDocumentList;
