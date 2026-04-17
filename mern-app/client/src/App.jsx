import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadPanel from './components/UploadPanel';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('rh_paper_sessionId'));
  const [filename, setFilename] = useState(localStorage.getItem('rh_paper_filename'));
  const [isAIOnline, setIsAIOnline] = useState(null); // null = checking, true = online, false = offline

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get('http://localhost:8000/health');
        setIsAIOnline(true);
      } catch (err) {
        console.warn('AI API Health Check failed:', err.message);
        setIsAIOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (id, name) => {
    setSessionId(id);
    setFilename(name);
    localStorage.setItem('rh_paper_sessionId', id);
    localStorage.setItem('rh_paper_filename', name);
  };

  const handleReset = () => {
    setSessionId(null);
    setFilename(null);
    localStorage.removeItem('rh_paper_sessionId');
    localStorage.removeItem('rh_paper_filename');
  };

  return (
    <div className="app-container">
      {/* 🟢 Connectivity Status Banner */}
      <div className={`status-banner ${isAIOnline === true ? 'online' : 'offline'}`}>
        {isAIOnline === true ? (
          <span>🟢 AI API Connected</span>
        ) : isAIOnline === false ? (
          <span>🔴 AI API Offline — please run the notebook first</span>
        ) : (
          <span>⚪ Checking AI API Status...</span>
        )}
      </div>

      <div className="app-content">
        {!sessionId ? (
          <div className="sidebar">
            <UploadPanel onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="main-layout">
            <div className="header-nav">
              <button onClick={handleReset} className="back-btn">
                ← Upload New Paper
              </button>
            </div>
            <ChatWindow sessionId={sessionId} filename={filename} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
