import React from 'react';
import { Wallet, RefreshCw, Server } from 'lucide-react';

const Navbar = ({ isConnected, onRefresh, isRefreshing }) => {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-icon-box">
          <Wallet size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="brand-title">ExpenseTracker</h1>
            <span className="brand-badge">CodeNova Task 2</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Full-Stack Financial Dashboard & Transaction Manager
          </p>
        </div>
      </div>

      <div className="nav-actions">
        <div className="server-status-pill" title={isConnected ? 'Backend API and MongoDB are connected' : 'Connecting to backend...'}>
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span>{isConnected ? 'MongoDB Connected' : 'Connecting...'}</span>
        </div>

        <button
          onClick={onRefresh}
          className="server-status-pill"
          disabled={isRefreshing}
          style={{ cursor: 'pointer', background: 'var(--bg-surface-elevated)' }}
          title="Refresh transaction data from MongoDB"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
