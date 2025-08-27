import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="container-fluid p-0">
            {/* Hero Section */}
            <section className="bg-primary text-white text-center py-5 mb-5">
                <div className="container">
                    <h1 className="display-4 mb-3">公安标准智能辅助平台</h1>
                    <p className="lead mb-4">集智能审核、辅助编写、文档管理于一体，全面提升标准编制工作的效率与质量。</p>
                    <Link to="/editor" className="btn btn-light btn-lg">开始使用 <i className="bi bi-arrow-right"></i></Link>
                </div>
            </section>

            {/* Feature Showcase Section */}
            <section className="container mb-5">
                <div className="row justify-content-center g-4">
                    {/* Card 1: Smart Editor */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm text-center">
                            <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                                <i className="bi bi-pencil-square display-4 text-primary mb-3"></i>
                                <h5 className="card-title">智能编写工作室</h5>
                                <p className="card-text flex-grow-1">从零开始，在AI的辅助下高效创建、起草和编辑您的标准文档。</p>
                                <Link to="/editor" className="btn btn-outline-primary mt-3">进入工作室 <i className="bi bi-chevron-right"></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: AI Review */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm text-center">
                            <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                                <i className="bi bi-journal-check display-4 text-success mb-3"></i>
                                <h5 className="card-title">成品文档审核</h5>
                                <p className="card-text flex-grow-1">上传您的标准文稿，AI将依据规范进行全面、细致的合规性与质量审查。</p>
                                <Link to="/review" className="btn btn-outline-success mt-3">上传文档审核 <i className="bi bi-chevron-right"></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Document Library */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm text-center">
                            <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                                <i className="bi bi-folder-fill display-4 text-info mb-3"></i>
                                <h5 className="card-title">标准文档库</h5>
                                <p className="card-text flex-grow-1">集中管理、搜索和预览您的所有标准文档和参考资料。</p>
                                <Link to="/standards" className="btn btn-outline-info mt-3">查看文档库 <i className="bi bi-chevron-right"></i></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Optional: Footer or other sections */}
            <footer className="bg-light text-center py-3 mt-5">
                <div className="container">
                    <p className="text-muted mb-0">&copy; 2025 公安标准智能辅助平台. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
