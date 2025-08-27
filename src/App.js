import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import DocumentUploader from './components/DocumentUploader';
import ReviewProgress from './components/ReviewProgress';
import ReviewResult from './components/ReviewResult';
import StandardDocumentPage from './components/standards/StandardDocumentPage';
import StandardDocumentViewer from './components/standards/StandardDocumentViewer'; // Import the viewer
import EditorPage from './components/editor/EditorPage'; // Import the editor

import HomePage from './components/HomePage'; // Import the new HomePage
import AiReviewPage from './components/AiReviewPage'; // Import the extracted AiReviewPage

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-active' : ''}>首页</NavLink>
          <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-active' : ''}>智能审核</NavLink>
          <NavLink to="/standards" className={({ isActive }) => isActive ? 'nav-active' : ''}>标准文档库</NavLink>
          <NavLink to="/editor" className={({ isActive }) => isActive ? 'nav-active' : ''}>智能编写</NavLink>
        </nav>
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