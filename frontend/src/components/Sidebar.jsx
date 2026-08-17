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

        {/* Collapsible Parent Menu: Setting */}
        <li style={{ marginTop: 'auto' }}>
          <div 
            className="sidebar-menu-parent" 
            onClick={() => toggleSubmenu('setting')}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px 16px', 
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="pi pi-cog"></i> Setting
            </span>
            <i className={`pi pi-chevron-down toggle-icon ${openSubmenus.setting ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.setting ? 'rotate(180deg)' : 'none', fontSize: '0.8rem' }}></i>
          </div>
          <ul className={`sidebar-submenu ${openSubmenus.setting ? 'open' : ''}`} style={{ display: openSubmenus.setting ? 'block' : 'none', listStyle: 'none', paddingLeft: '32px', margin: 0 }}>
            <li style={{ marginBottom: '4px' }}>
              <div 
                className={`sidebar-menu-item ${activeTabId === 'setting' ? 'active' : ''}`} 
                onClick={() => onOpenTab('setting', 'Konfigurasi Sistem')}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '6px' }}
              >
                Konfigurasi Sistem
              </div>
            </li>
            {(user && (user.level_user === 'DEVELOPER' || user.level_user === 'SUPERUSER')) && (
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'setting_menu' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('setting_menu', 'Setting Menu')}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '6px' }}
                >
                  Setting Menu
                </div>
              </li>
            )}
          </ul>
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
