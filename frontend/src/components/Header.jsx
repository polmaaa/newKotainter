import React from 'react';

export default function Header({ user, activeTabTitle, onLogout }) {
  return (
    <header className="header">
      <div className="breadcrumbs">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active" id="breadcrumb-active-tab">
          {activeTabTitle || 'Dashboard'}
        </span>
      </div>

      <div className="header-actions">
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          Selamat Datang, <strong id="header-user-display">{user ? user.nama_user : 'Guest'}</strong>
        </span>
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
