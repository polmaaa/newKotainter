import React, { useState } from 'react';

export default function Sidebar({ user, activeTabId, onOpenTab, onLogout, sidebarOpen }) {
  const [openSubmenus, setOpenSubmenus] = useState({
    staging: false,
    config: false,
    users: false
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
      <div className="sidebar-logo">
        <img src="/newkotainter/ap2t.jpg" alt="Logo PLN AP2T" />
        <div>
          <h2>NewKotainter</h2>
          <span>v2.0 REST API</span>
        </div>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          <i className="pi pi-user-edit"></i>
        </div>
        <div className="user-meta">
          <span className="user-role">Pengguna Aktif</span>
          <h3 id="user-display-name">{user ? user.nama_user : ''}</h3>
        </div>
      </div>
      
      <nav className="sidebar-menu">
        {/* Dashboard Utama */}
        <div className="menu-group">
          <div 
            className={`menu-item ${activeTabId === 'dashboard' ? 'active' : ''}`} 
            onClick={() => onOpenTab('dashboard', 'Dashboard')}
          >
            <i className="pi pi-home"></i>
            <span>Dashboard Utama</span>
          </div>
        </div>

        {/* Modul Menu AP2T */}
        <div className="menu-group">
          <span className="menu-label">Modul Menu AP2T</span>
          
          <div 
            className={`menu-item has-child ${openSubmenus.staging ? 'expanded' : ''}`} 
            onClick={() => toggleSubmenu('staging')}
          >
            <i className="pi pi-desktop"></i>
            <span>AP2T Staging</span>
            <i className={`pi pi-chevron-down arrow ${openSubmenus.staging ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.staging ? 'rotate(180deg)' : 'none' }}></i>
          </div>
          <div className="submenu" style={{ display: openSubmenus.staging ? 'block' : 'none' }}>
            <div className={`submenu-item ${activeTabId === 'ap2t_staging' ? 'active' : ''}`} onClick={() => onOpenTab('ap2t_staging', 'AP2T Staging')}>Monitoring Antrian</div>
            <div className={`submenu-item ${activeTabId === 'ap2t_log_proses' ? 'active' : ''}`} onClick={() => onOpenTab('ap2t_log_proses', 'AP2T Log Proses')}>Log Transaksi</div>
          </div>

          <div 
            className={`menu-item has-child ${openSubmenus.config ? 'expanded' : ''}`} 
            onClick={() => toggleSubmenu('config')}
          >
            <i className="pi pi-sliders-h"></i>
            <span>Konfigurasi & Parameter</span>
            <i className={`pi pi-chevron-down arrow ${openSubmenus.config ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.config ? 'rotate(180deg)' : 'none' }}></i>
          </div>
          <div className="submenu" style={{ display: openSubmenus.config ? 'block' : 'none' }}>
            <div className={`submenu-item ${activeTabId === 'db_config' ? 'active' : ''}`} onClick={() => onOpenTab('db_config', 'Database Config')}>Konfigurasi DB</div>
            <div className={`submenu-item ${activeTabId === 'parameter_system' ? 'active' : ''}`} onClick={() => onOpenTab('parameter_system', 'Parameter Sistem')}>Parameter Umum</div>
          </div>
        </div>

        {/* Keamanan & Akses */}
        <div className="menu-group">
          <span className="menu-label">Keamanan & Akses</span>
          
          <div 
            className={`menu-item has-child ${openSubmenus.users ? 'expanded' : ''}`} 
            onClick={() => toggleSubmenu('users')}
          >
            <i className="pi pi-users"></i>
            <span>Manajemen User</span>
            <i className={`pi pi-chevron-down arrow ${openSubmenus.users ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: openSubmenus.users ? 'rotate(180deg)' : 'none' }}></i>
          </div>
          <div className="submenu" style={{ display: openSubmenus.users ? 'block' : 'none' }}>
            <div className={`submenu-item ${activeTabId === 'users_ap2t' ? 'active' : ''}`} onClick={() => onOpenTab('users_ap2t', 'User New AP2T')}>Daftar Pengguna</div>
            <div className={`submenu-item ${activeTabId === 'role_permissions' ? 'active' : ''}`} onClick={() => onOpenTab('role_permissions', 'Hak Akses & Role')}>Role & Permissions</div>
          </div>
        </div>

        {/* Layanan Tiket Log */}
        <div className="menu-group">
          <span className="menu-label">Layanan Tiket Log</span>
          <div 
            className={`menu-item ${activeTabId === 'save_log' ? 'active' : ''}`} 
            onClick={() => onOpenTab('save_log', 'Catat Tiket Baru')}
          >
            <i className="pi pi-plus-circle"></i>
            <span>Catat Tiket Baru</span>
          </div>
          <div 
            className={`menu-item ${activeTabId === 'bantuan' ? 'active' : ''}`} 
            onClick={() => onOpenTab('bantuan', 'FAQ Bantuan')}
          >
            <i className="pi pi-question-circle"></i>
            <span>FAQ Bantuan</span>
          </div>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={onLogout}>
          <i className="pi pi-sign-out"></i>
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
