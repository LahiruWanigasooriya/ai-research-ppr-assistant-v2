import React, { useState } from 'react';
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
      alert('Please select a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

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
    <div className="upload-container">
      <h2>Research Paper AI</h2>
      <p>Upload a PDF to start interacting with it.</p>
      
      <div className="upload-box">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          id="file-upload"
          className="file-input"
        />
        <label htmlFor="file-upload" className="file-label">
          {file ? file.name : "Select PDF File"}
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!file || status === 'uploading'}
          className="upload-button"
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload Paper'}
        </button>
      </div>

      <div className="status-container">
        {status === 'uploading' && <p className="status uploading">Uploading and indexing your paper...</p>}
        {status === 'success' && (
          <p className="status success">
            ✅ Ready! {chunkCount} chunks processed.
          </p>
        )}
        {status === 'error' && <p className="status error">❌ {message}</p>}
      </div>
    </div>
  );
};

export default UploadPanel;
