import React from 'react';
import { Microscope, Activity, ChevronLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

const Navbar = ({ theme, toggleTheme, isAIOnline, onReset, hasSession }) => {
  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <motion.div
          whileHover={{ rotate: 15 }}
          style={{
            background: 'var(--accent-primary)',
            padding: '8px',
            borderRadius: '12px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Microscope size={24} />
        </motion.div>
        <div>
          <h1 style={{ fontSize: '1.25rem', lineHeight: 1 }}>Research AI</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Advanced Paper Assistant</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-tertiary)',
          fontSize: '0.85rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isAIOnline === true ? '#22c55e' : isAIOnline === false ? '#ef4444' : '#94a3b8'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            AI Engine: {isAIOnline === true ? 'Online' : isAIOnline === false ? 'Offline' : 'Checking...'}
          </span>
        </div>

        {hasSession && (
          <button
            onClick={onReset}
            className="glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              transition: 'var(--transition-base)'
            }}
          >
            <ChevronLeft size={18} />
            New Research
          </button>
        )}

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
};

export default Navbar;
