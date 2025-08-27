import React, { useState } from 'react';
import StandardDocumentUploader from './StandardDocumentUploader';
import StandardDocumentList from './StandardDocumentList';
import './DocumentLibrary.css';

function StandardDocumentPage() {
    // This state will be used to trigger a refresh of the list after a successful upload.
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div className="document-library-container">
            <header className="document-library-header">
                <h1>公安标准文档管理</h1>
                <p>集中管理、搜索和预览您的所有标准文档和参考资料</p>
            </header>
            <div className="document-library-card">
                <StandardDocumentUploader onUploadSuccess={handleUploadSuccess} />
            </div>
            <div className="document-library-card">
                <StandardDocumentList key={refreshKey} />
            </div>
        </div>
    );
}

export default StandardDocumentPage;
