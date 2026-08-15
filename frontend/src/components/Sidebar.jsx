import React, { useState } from 'react';

export default function Sidebar({ user, activeTabId, onOpenTab, onLogout, sidebarOpen, siteName }) {
  const [openSubmenus, setOpenSubmenus] = useState({
    pelayanan: false,
    sistem: false
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
      <div>
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
          
          {/* Collapsible Parent Menu: Pelayanan Pelanggan */}
          <li>
            <div 
              className="sidebar-menu-parent" 
              onClick={() => toggleSubmenu('pelayanan')}
            >
              <span className="menu-label">
                <i className="pi pi-ticket"></i> Pelayanan Pelanggan
              </span>
              <i className={`pi pi-chevron-down toggle-icon ${openSubmenus.pelayanan ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.pelayanan ? 'rotate(180deg)' : 'none' }}></i>
            </div>
            <ul className={`sidebar-submenu ${openSubmenus.pelayanan ? 'open' : ''}`} style={{ display: openSubmenus.pelayanan ? 'block' : 'none' }}>
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'dashboard' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('dashboard', 'Dashboard')}
                >
                  Daftar Tiket Log
                </div>
              </li>
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'save_log' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('save_log', 'Catat Tiket Baru')}
                >
                  Buat Tiket Baru
                </div>
              </li>
            </ul>
          </li>

          {/* Collapsible Parent Menu: Analitik & Sistem */}
          <li>
            <div 
              className="sidebar-menu-parent" 
              onClick={() => toggleSubmenu('sistem')}
            >
              <span className="menu-label">
                <i className="pi pi-server"></i> Analitik & Sistem
              </span>
              <i className={`pi pi-chevron-down toggle-icon ${openSubmenus.sistem ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.sistem ? 'rotate(180deg)' : 'none' }}></i>
            </div>
            <ul className={`sidebar-submenu ${openSubmenus.sistem ? 'open' : ''}`} style={{ display: openSubmenus.sistem ? 'block' : 'none' }}>
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'crm' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('crm', 'CRM Analytics')}
                >
                  CRM Analytics
                </div>
              </li>
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'ap2t_staging' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('ap2t_staging', 'AP2T Staging')}
                >
                  AP2T Staging
                </div>
              </li>
              <li>
                <div 
                  className={`sidebar-menu-item ${activeTabId === 'fso' ? 'active' : ''}`} 
                  onClick={() => onOpenTab('fso', 'FSO Logs')}
                >
                  FSO Logs
                </div>
              </li>
            </ul>
          </li>

          {/* Single Item: Bantuan & FAQ */}
          <li>
            <div 
              className={`sidebar-menu-item ${activeTabId === 'bantuan' ? 'active' : ''}`} 
              onClick={() => onOpenTab('bantuan', 'Bantuan & FAQ')}
            >
              <i className="pi pi-question-circle"></i> Bantuan & FAQ
            </div>
          </li>

          {/* Single Item: Setting (Diletakkan di bagian paling bawah, di atas profil) */}
          <li>
            <div 
              className={`sidebar-menu-item ${activeTabId === 'setting' ? 'active' : ''}`} 
              onClick={() => onOpenTab('setting', 'Setting')}
            >
              <i className="pi pi-cog"></i> Setting
            </div>
          </li>
        </ul>
      </div>

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
