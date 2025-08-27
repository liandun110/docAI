import React from 'react';
import { Link } from 'react-router-dom';
import './ModernHomepage.css';

function ModernHomepage() {
    return (
        <div className="modern-homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">公安标准智能辅助平台</h1>
                    <p className="hero-subtitle">集智能审核、辅助编写、文档管理于一体，全面提升标准编制工作的效率与质量。</p>
                    <Link to="/editor" className="hero-cta-button">
                        开始使用
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="features-title">核心功能</h2>
                <div className="features-grid">
                    {/* Feature 1: Smart Editor */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3L3 12H7V20H11V14H13V20H17V12H21L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">智能编写工作室</h3>
                        <p className="feature-description">从零开始，在AI的辅助下高效创建、起草和编辑您的标准文档。</p>
                        <Link to="/editor" className="feature-link">
                            进入工作室
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>

                    {/* Feature 2: AI Review */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M12 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9M12 3L20 11M12 3V9H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">成品文档审核</h3>
                        <p className="feature-description">上传您的标准文稿，AI将依据规范进行全面、细致的合规性与质量审查。</p>
                        <Link to="/review" className="feature-link">
                            上传文档审核
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>

                    {/* Feature 3: Document Library */}
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M9 7H15M9 11H15M9 15H13M5 7H6M5 11H6M5 15H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">标准文档库</h3>
                        <p className="feature-description">集中管理、搜索和预览您的所有标准文档和参考资料。</p>
                        <Link to="/standards" className="feature-link">
                            查看文档库
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="modern-footer">
                <div className="footer-content">
                    <p className="footer-text">&copy; 2025 公安标准智能辅助平台. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default ModernHomepage;