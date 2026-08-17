import React, { useState } from 'react';

export default function Sidebar({ user, activeTabId, onOpenTab, onLogout, sidebarOpen, siteName }) {
  const [openSubmenus, setOpenSubmenus] = useState({
    setting: false
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
      {/* Brand logo */}
      <div className="sidebar-brand">
        <div className="brand-icon"><i className="pi pi-shield"></i></div>
        <span className="brand-name">{siteName || 'NewKotainter'}</span>
      </div>

      {/* Menu Accordion / Tree */}
      <ul className="sidebar-menu">
        {/* Dashboard Utama */}
        <li>
          <div 
            className={`sidebar-menu-item ${activeTabId === 'dashboard' ? 'active' : ''}`} 
            onClick={() => onOpenTab('dashboard', 'Dashboard')}
          >
            <i className="pi pi-home"></i> Dashboard
          </div>
        </li>

        {/* Single Item: Setting (Diletakkan di bagian paling bawah, di atas profil) */}
        <li style={{ marginTop: 'auto' }}>
          <div 
            className={`sidebar-menu-item ${activeTabId === 'setting' ? 'active' : ''}`} 
            onClick={() => onOpenTab('setting', 'Setting')}
          >
            <i className="pi pi-cog"></i> Setting
          </div>
        </li>
      </ul>

      {/* Profile Info & Logout */}
      <div className="sidebar-user">
        <div className="user-avatar">{user ? getInitials(user.nama_user) : 'US'}</div>
        <div className="user-info">
          <span className="user-name" id="user-display-name">{user ? user.nama_user : 'Guest'}</span>
          <span className="user-role">{user ? user.level_user : 'Visitor'}</span>
        </div>
        <div 
          id="btn-logout-sidebar" 
          className="btn-logout-icon" 
          title="Keluar"
          onClick={onLogout}
        >
          <i className="pi pi-power-off"></i>
        </div>
      </div>
    </aside>
  );
}
