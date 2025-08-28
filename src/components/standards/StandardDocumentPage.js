import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import StandardDocumentUploader from './StandardDocumentUploader';
import StandardDocumentList from './StandardDocumentList';
import './DocumentLibrary.css';

function StandardDocumentPage() {
    // This state will be used to trigger a refresh of the list after a successful upload.
    const [refreshKey, setRefreshKey] = useState(0);
    const location = useLocation();
    
    // 从URL state获取角色信息
    const role = location.state?.role || 'gongan'; // 默认为公安标准
    
    // 根据角色设置页面标题和描述
    const getPageTitle = () => {
        switch (role) {
            case 'patent':
                return '发明专利文档管理';
            case 'gongan':
                return '公安标准文档管理';
            case 'paper':
                return '科技论文文档管理';
            default:
                return '标准文档管理';
        }
    };
    
    const getPageDescription = () => {
        switch (role) {
            case 'patent':
                return '集中管理、搜索和预览您的所有发明专利文档和参考资料';
            case 'gongan':
                return '集中管理、搜索和预览您的所有公安标准文档和参考资料';
            case 'paper':
                return '集中管理、搜索和预览您的所有科技论文文档和参考资料';
            default:
                return '集中管理、搜索和预览您的所有标准文档和参考资料';
        }
    };

    const handleUploadSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div className="document-library-container">
            <header className="document-library-header">
                <h1>{getPageTitle()}</h1>
                <p>{getPageDescription()}</p>
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
