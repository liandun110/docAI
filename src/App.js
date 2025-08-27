import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentUploader from './components/DocumentUploader';
import ReviewProgress from './components/ReviewProgress';
import ReviewResult from './components/ReviewResult';
import StandardDocumentPage from './components/standards/StandardDocumentPage';
import StandardDocumentViewer from './components/standards/StandardDocumentViewer'; // Import the viewer
import EditorPage from './components/editor/EditorPage'; // Import the editor

import HomePage from './components/HomePage'; // Import the new HomePage
import AiReviewPage from './components/AiReviewPage'; // Import the extracted AiReviewPage
import AppleStyleNavbar from './components/AppleStyleNavbar'; // Import the Apple style navbar

function App() {
  return (
    <Router>
      <div className="app">
        <AppleStyleNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/review" element={<AiReviewPage />} />
          <Route path="/standards" element={<StandardDocumentPage />} />
          <Route path="/standards/preview/:filename" element={<StandardDocumentViewer />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;