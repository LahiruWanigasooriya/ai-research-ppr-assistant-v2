import React, { useState } from 'react';
import { FileUp, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadPaper } from '../api/api';

const UploadPanel = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [chunkCount, setChunkCount] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    } else {
      setStatus('error');
      setMessage('Please select a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadPaper(formData);
      const { sessionId, filename, total_chunks } = response.data;
      
      setStatus('success');
      setChunkCount(total_chunks);
      onUploadSuccess(sessionId, filename);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card" 
      style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--accent-glow)', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1rem',
          color: 'var(--accent-primary)'
        }}>
          <FileUp size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload Paper</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select a research paper in PDF format to begin your analysis.
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          id="file-upload"
          style={{ display: 'none' }}
        />
        <label 
          htmlFor="file-upload" 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '2rem',
            border: '2px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'var(--transition-base)',
            background: 'var(--bg-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.background = 'var(--bg-primary)';
          }}
        >
          {file ? (
            <>
              <FileText size={40} color="var(--accent-primary)" />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <FileUp size={24} />
              </div>
              <span style={{ fontWeight: 500 }}>Click to browse or drag and drop</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF up to 10MB</span>
            </>
          )}
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!file || status === 'uploading'}
          className="btn-primary"
          style={{ width: '100%', height: '50px' }}
        >
          {status === 'uploading' ? (
            <>
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Indexing Paper...
            </>
          ) : (
            'Start Analysis'
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {status !== 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            background: status === 'success' ? 'rgba(34, 197, 94, 0.1)' : status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'center',
            fontSize: '0.9rem',
            color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : 'var(--text-secondary)'
          }}
        >
          {status === 'success' && <CheckCircle size={18} />}
          {status === 'error' && <AlertCircle size={18} />}
          {status === 'success' ? `Ready! Processed ${chunkCount} sections.` : message}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadPanel;
