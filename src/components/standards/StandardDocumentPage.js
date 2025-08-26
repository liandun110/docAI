import React, { useState } from 'react';
import StandardDocumentUploader from './StandardDocumentUploader';
import StandardDocumentList from './StandardDocumentList';

function StandardDocumentPage() {
    // This state will be used to trigger a refresh of the list after a successful upload.
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">公安标准文档管理</h2>
            <div className="card p-4 mb-4">
                <StandardDocumentUploader onUploadSuccess={handleUploadSuccess} />
            </div>
            <div className="card p-4">
                <StandardDocumentList key={refreshKey} />
            </div>
        </div>
    );
}

export default StandardDocumentPage;
