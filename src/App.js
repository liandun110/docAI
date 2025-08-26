import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import DocumentUploader from './components/DocumentUploader';
import ReviewProgress from './components/ReviewProgress';
import ReviewResult from './components/ReviewResult';
import StandardDocumentPage from './components/standards/StandardDocumentPage';
import StandardDocumentViewer from './components/standards/StandardDocumentViewer'; // Import the viewer

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
    <>
      <header className="app-header">
        <h1>公安标准智能审核</h1>
        <p>上传案件文书或报告，AI将依据公安标准规范对文档进行审核并给出专业意见</p>
      </header>
      <main className="app-main">
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
          <div className="error-message" style={{marginTop: '20px'}}>
            审核失败: {error}
          </div>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-active' : ''}>智能审核</NavLink>
          <NavLink to="/standards" className={({ isActive }) => isActive ? 'nav-active' : ''}>标准文档库</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<AiReviewPage />} />
          <Route path="/standards" element={<StandardDocumentPage />} />
          <Route path="/standards/preview/:filename" element={<StandardDocumentViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;