import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DocumentLibrary.css';

// Helper to create a download icon
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

function StandardDocumentList() {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        setError('');
        const url = searchTerm ? `/api/standards?search=${encodeURIComponent(searchTerm)}` : '/api/standards';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
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
            return <div className="document-list-loading"><div className="document-list-spinner"></div></div>;
        }
        if (error) {
            return <div className="document-list-error">{error}</div>;
        }
        if (documents.length === 0) {
            return <p className="document-list-empty">未找到任何文档。</p>;
        }

        return (
            <div className="book-grid">
                {documents.map((doc, index) => (
                    <Link key={doc} to={`/standards/preview/${encodeURIComponent(doc)}`} className="book-card-link">
                        <div className="book-card">
                            <div className={`book-card-cover book-color-${(index % 6) + 1}`}>
                                <h3 className="book-title">{decodeURIComponent(doc)}</h3>
                                <a 
                                    href={`/api/standards/${encodeURIComponent(doc)}`} 
                                    className="book-download-link" 
                                    onClick={(e) => e.stopPropagation()} // Prevent link navigation when clicking download
                                    aria-label="Download document"
                                >
                                    <DownloadIcon />
                                </a>
                            </div>
                            <div className="book-card-spine"></div>
                        </div>
                    </Link>
                ))}
            </div>
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
                        placeholder="在文库中搜索..."
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

// Add a wrapper style for the Link to remove default underline
const style = document.createElement('style');
style.innerHTML = `
  .book-card-link {
    text-decoration: none;
  }
`;
document.head.appendChild(style);

export default StandardDocumentList;