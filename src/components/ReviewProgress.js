import React from 'react';

const ReviewProgress = () => {
  return (
    <div className="progress-container">
      <h2>文档审核中...</h2>
      <div className="progress-steps">
        <div className="step active">
          <div className="step-icon">1</div>
          <div className="step-text">文档解析</div>
        </div>
        <div className="step active">
          <div className="step-icon">2</div>
          <div className="step-text">格式审核</div>
        </div>
        <div className="step active">
          <div className="step-icon">3</div>
          <div className="step-text">逻辑分析</div>
        </div>
        <div className="step active">
          <div className="step-icon">4</div>
          <div className="step-text">内容评估</div>
        </div>
        <div className="step">
          <div className="step-icon">5</div>
          <div className="step-text">生成报告</div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
      <p className="progress-text">AI正在分析文档内容，请稍候...</p>
    </div>
  );
};

export default ReviewProgress;