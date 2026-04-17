import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sessionId, setSessionId] = useState(localStorage.getItem('rh_paper_sessionId'));
  const [filename, setFilename] = useState(localStorage.getItem('rh_paper_filename'));
  const [isAIOnline, setIsAIOnline] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get('http://localhost:8000/health');
        setIsAIOnline(true);
      } catch (err) {
        setIsAIOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
    <div className="app-main">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isAIOnline={isAIOnline} 
        onReset={handleReset}
        hasSession={!!sessionId}
      />
      
      <main className="container">
        <AnimatePresence mode="wait">
          {!sessionId ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="center-content"
            >
              <div className="hero-text">
                <h1>Unlock Research Insights</h1>
                <p>Upload your research papers and chat with them using Advanced AI.</p>
              </div>
              <UploadPanel onUploadSuccess={handleUploadSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="chat-workspace"
            >
              <ChatWindow sessionId={sessionId} filename={filename} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

