import React, { useState, useEffect, useRef } from 'react';

export default function Header({ user, dbStatus, onLogout, onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.remove('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="flex align-items-center gap-3">
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <i className="pi pi-bars"></i>
        </button>
        <h1 className="header-title">Workspace Terpadu</h1>
        
        <div className="db-status-bar">
          <div 
            className="db-status-item" 
            title={dbStatus.oracle ? 'Database Oracle Terhubung' : 'Gagal terhubung ke Database Oracle (Menggunakan Data Simulasi)'}
          >
            <span className={`indicator-dot ${dbStatus.oracle ? 'online' : 'offline'}`}></span>
            <span>Oracle</span>
          </div>
          <div 
            className="db-status-item" 
            title={dbStatus.postgresql ? 'Database PostgreSQL Terhubung' : 'Gagal terhubung ke Database PostgreSQL (Menggunakan Data Simulasi)'}
          >
            <span className={`indicator-dot ${dbStatus.postgresql ? 'online' : 'offline'}`}></span>
            <span>Postgres</span>
          </div>
        </div>
      </div>
      
      <div className="user-profile-menu" ref={dropdownRef}>
        <div className="user-profile-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="avatar"><i className="pi pi-user"></i></div>
          <span id="header-user-display">{user ? user.nama_user : ''}</span>
          <i className="pi pi-angle-down"></i>
        </div>
        
        {dropdownOpen && (
          <div id="user-dropdown" className="user-dropdown-card show" style={{ display: 'block' }}>
            <div className="dropdown-header">
              <div className="dropdown-avatar"><i className="pi pi-user"></i></div>
              <div>
                <h4 id="dropdown-user-name">{user ? user.nama_user : ''}</h4>
                <span id="dropdown-user-role">{user ? user.level_user : ''}</span>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Profil Detail Pengguna...'); }} 
              className="dropdown-item"
            >
              <i className="pi pi-info-circle"></i> Info Detail Profil
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onLogout(); }} 
              className="dropdown-item logout"
            >
              <i className="pi pi-sign-out"></i> Keluar Sistem
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
