import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, List, Trash2, FileText, SendHorizontal, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { sendMessage, getSummary, getKeyPoints, getChatHistory } from '../api/api';

const ChatWindow = ({ sessionId, filename }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'typing', 'summarizing', 'extracting'
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
  }, [messages, activeAction]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setActiveAction('typing');

    try {
      const response = await sendMessage(sessionId, currentInput);
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Sorry, I encountered an error.';
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `**Error:** ${errorMsg}`,
        isError: true 
      }]);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleAction = async (type) => {
    if (loading) return;
    setLoading(true);
    setActiveAction(type === 'summary' ? 'summarizing' : 'extracting');
    
    try {
      let response;
      let content = '';
      if (type === 'summary') {
        response = await getSummary(sessionId);
        content = `### Summary\n\n${response.data.summary}`;
      } else if (type === 'keypoints') {
        response = await getKeyPoints(sessionId);
        const points = Array.isArray(response.data.key_points) 
          ? response.data.key_points.map(p => `- ${p}`).join('\n') 
          : response.data.key_points;
        content = `### Key Insights\n\n${points}`;
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      console.error(`Error getting ${type}:`, error);
      const errorMsg = error.response?.data?.error || error.message || 'Action failed.';
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `**${type.toUpperCase()} Error:** ${errorMsg}`,
        isError: true 
      }]);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const clearChat = () => {
    if (loading) return;
    if (window.confirm('Clear conversation history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="card glass chat-workspace" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '6px', background: 'var(--accent-glow)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {filename}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Analysis Session</div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-base)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && !activeAction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}
            >
              <Sparkles size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Start your analysis by asking a question or using the quick actions below.</p>
            </motion.div>
          )}
          
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                marginBottom: '0.4rem', 
                color: 'var(--text-muted)',
                padding: '0 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {msg.role === 'user' ? (
                  <>
                    <User size={12} />
                    You
                  </>
                ) : 'Assistant'}
              </div>
              <div 
                className="glass"
                style={{ 
                  padding: '1rem 1.25rem', 
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  maxWidth: '85%',
                  border: msg.isError ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}

          {activeAction && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
                Assistant
              </div>
              <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '20px 20px 20px 4px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {activeAction === 'typing' && 'Thinking...'}
                  {activeAction === 'summarizing' && 'Synthesizing summary...'}
                  {activeAction === 'extracting' && 'Extracting key insights...'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about the paper..."
            style={{ 
              flex: 1, 
              padding: '0.75rem 1.25rem', 
              borderRadius: 'var(--radius-full)', 
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.95rem',
              transition: 'var(--transition-base)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            disabled={loading}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="btn-primary"
            style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
          >
            <SendHorizontal size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleAction('summary')} 
            disabled={loading} 
            className="glass"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '6px 12px', borderRadius: 'var(--radius-md)', 
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              color: 'var(--text-secondary)', transition: 'var(--transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Sparkles size={14} /> Summarize
          </button>
          <button 
            onClick={() => handleAction('keypoints')} 
            disabled={loading}
            className="glass"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '6px 12px', borderRadius: 'var(--radius-md)', 
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              color: 'var(--text-secondary)', transition: 'var(--transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <List size={14} /> Key Insights
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ChatWindow;
