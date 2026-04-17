import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getSummary, getKeyPoints, getChatHistory } from '../api/api';

const ChatWindow = ({ sessionId, filename }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getChatHistory(sessionId);
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(sessionId, input);
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Sorry, I encountered an error.';
      const errorMessage = { 
        role: 'assistant', 
        content: `❌ Error: ${errorMsg}`,
        isError: true 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type) => {
    if (loading) return;
    setLoading(true);
    try {
      let response;
      let content = '';
      if (type === 'summary') {
        response = await getSummary(sessionId);
        content = `Summary: ${response.data.summary}`;
      } else if (type === 'keypoints') {
        response = await getKeyPoints(sessionId);
        content = `Key Points:\n${Array.isArray(response.data.key_points) ? response.data.key_points.join('\n') : response.data.key_points}`;
      }
      
      const assistantMessage = { role: 'assistant', content };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(`Error getting ${type}:`, error);
      const errorMsg = error.response?.data?.error || error.message || 'Action failed.';
      const errorMessage = { 
        role: 'assistant', 
        content: `❌ ${type.toUpperCase()} Error: ${errorMsg}`,
        isError: true 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>📄 {filename}</h3>
      </div>
      
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-label">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
            <div className={`message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper assistant">
            <div className="message-label">Assistant</div>
            <div className="message-bubble assistant thinking">
              <span>.</span><span>.</span><span>.</span> Thinking
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="controls">
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="send-btn">
            Send
          </button>
        </div>
        
        <div className="action-buttons">
          <button onClick={() => handleAction('summary')} disabled={loading} className="btn-summarize">
            Summarize Paper
          </button>
          <button onClick={() => handleAction('keypoints')} disabled={loading} className="btn-keypoints">
            Key Points
          </button>
          <button onClick={clearChat} disabled={loading} className="btn-clear">
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
