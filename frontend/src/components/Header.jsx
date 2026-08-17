import React from 'react';

export default function Header({ user, activeTabTitle, onLogout, dbMode, onDbModeChange }) {
  return (
    <header className="header">
      <div className="breadcrumbs">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active" id="breadcrumb-active-tab">
          {activeTabTitle || 'Dashboard'}
        </span>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* DB Mode Toggle Switch */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0, 0, 0, 0.05)', 
          borderRadius: '20px', 
          padding: '3px', 
          border: '1px solid var(--border-color)', 
          userSelect: 'none' 
        }}>
          <div 
            onClick={() => onDbModeChange('oracle')}
            style={{
              padding: '6px 16px',
              borderRadius: '18px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: dbMode === 'oracle' ? '#0f766e' : 'transparent',
              color: dbMode === 'oracle' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Oracle
          </div>
          <div 
            onClick={() => onDbModeChange('postgre')}
            style={{
              padding: '6px 16px',
              borderRadius: '18px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: dbMode === 'postgre' ? '#1e3a8a' : 'transparent',
              color: dbMode === 'postgre' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Postgres
          </div>
        </div>

        <div 
          id="btn-logout-header" 
          className="btn-logout"
          onClick={onLogout}
          style={{ cursor: 'pointer' }}
        >
          <i className="pi pi-sign-out" style={{ marginRight: '8px' }}></i> Keluar
        </div>
      </div>
    </header>
  );
}
