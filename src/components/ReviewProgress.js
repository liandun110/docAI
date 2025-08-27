import React from 'react';

const ReviewProgress = () => {
  return (
    <div className="sleek-progress-container">
      <h2>文档审核中...</h2>
      <div className="sleek-progress-steps">
        <div className="sleek-step active">
          <div className="sleek-step-icon">1</div>
          <div className="sleek-step-text">文档解析</div>
        </div>
        <div className="sleek-step active">
          <div className="sleek-step-icon">2</div>
          <div className="sleek-step-text">格式审核</div>
        </div>
        <div className="sleek-step active">
          <div className="sleek-step-icon">3</div>
          <div className="sleek-step-text">逻辑分析</div>
        </div>
        <div className="sleek-step active">
          <div className="sleek-step-icon">4</div>
          <div className="sleek-step-text">内容评估</div>
        </div>
        <div className="sleek-step">
          <div className="sleek-step-icon">5</div>
          <div className="sleek-step-text">生成报告</div>
        </div>
      </div>
      <div className="sleek-progress-bar">
        <div className="sleek-progress-fill"></div>
      </div>
      <p className="sleek-progress-text">AI正在分析文档内容，请稍候...</p>
    </div>
  );
};

export default ReviewProgress;