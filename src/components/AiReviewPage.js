import React from 'react';
import DocumentUploader from './DocumentUploader';
import ReviewProgress from './ReviewProgress';
import ReviewResult from './ReviewResult';
import './SleekReviewPage.css';

// Main review page component
function AiReviewPage() {
  const [currentStep, setCurrentStep] = React.useState('upload'); // upload, progress, result
  const [reviewData, setReviewData] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleUploadStart = () => {
    setCurrentStep('progress');
    setError(null);
  };
  
  const handleUploadComplete = (result) => {
    const finalData = { ...result.data, documentName: result.fileName };
    setReviewData(finalData);
    setCurrentStep('result');
  };

  const handleUploadError = (err) => {
    setError(err);
    setCurrentStep('upload');
  };

  return (
    <div className="sleek-review-page">
      <header className="sleek-review-header">
        <h1>公安标准智能审核</h1>
        <p>上传案件文书或报告，AI将依据公安标准规范对文档进行审核并给出专业意见</p>
      </header>
      <main className="sleek-review-main">
        {currentStep === 'upload' && (
          <DocumentUploader 
            onUploadStart={handleUploadStart}
            onUploadComplete={handleUploadComplete} 
            onUploadError={handleUploadError}
          />
        )}
        {currentStep === 'progress' && <ReviewProgress />}
        {currentStep === 'result' && <ReviewResult data={reviewData} onReset={() => setCurrentStep('upload')} />}
        {error && currentStep === 'upload' && (
          <div className="sleek-error-message">
            审核失败: {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default AiReviewPage;
