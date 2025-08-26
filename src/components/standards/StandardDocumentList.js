import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }

        if (documents.length === 0) {
            return <p>未找到任何文档。</p>;
        }

        return (
            <ul className="list-group">
                {documents.map(doc => (
                    <li key={doc} className="list-group-item d-flex justify-content-between align-items-center">
                        <Link to={`/standards/preview/${encodeURIComponent(doc)}`}>
                            {decodeURIComponent(doc)}
                        </Link>
                        <a href={`/api/standards/${encodeURIComponent(doc)}`} className="btn btn-sm btn-outline-secondary">下载</a>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <h3 className="mb-3">已上传的标准文档</h3>
            <form onSubmit={handleSearch} className="mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="搜索文档..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="submit">搜索</button>
                </div>
            </form>
            {renderContent()}
        </div>
    );
}

export default StandardDocumentList;
