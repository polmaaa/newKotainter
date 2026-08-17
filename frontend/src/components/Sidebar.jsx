import React, { useState } from 'react';

export default function Sidebar({ user, activeTabId, onOpenTab, onLogout, sidebarOpen, siteName, dynamicMenus = [] }) {
  const [openSubmenus, setOpenSubmenus] = useState({});

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

  const isRoleAllowed = (roleStr) => {
    if (!roleStr) return true;
    if (!user) return false;
    const allowed = roleStr.split(',').map(r => r.trim().toUpperCase());
    return allowed.includes(user.level_user.toUpperCase());
  };

  // Get all unique parent menu categories that have at least one allowed active child
  const categories = [];
  dynamicMenus.forEach(m => {
    if (m.parent_menu && m.aktive === 'Y' && isRoleAllowed(m.role_menu)) {
      const parentTrimmed = m.parent_menu.trim();
      if (!categories.includes(parentTrimmed)) {
        categories.push(parentTrimmed);
      }
    }
  });

  // Get all standalone active menus
  const standaloneMenus = dynamicMenus.filter(m => !m.parent_menu && m.aktive === 'Y' && isRoleAllowed(m.role_menu));

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

        {/* Dynamic Collapsible Categories */}
        {categories.map(categoryName => {
          const isOpen = !!openSubmenus[categoryName];
          return (
            <li key={categoryName}>
              <div 
                className="sidebar-menu-parent" 
                onClick={() => toggleSubmenu(categoryName)}
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
                  <i className="pi pi-folder"></i> {categoryName.toUpperCase()}
                </span>
                <i className={`pi pi-chevron-down toggle-icon ${isOpen ? 'rotated' : ''}`} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', fontSize: '0.8rem' }}></i>
              </div>
              <ul className={`sidebar-submenu ${isOpen ? 'open' : ''}`} style={{ display: isOpen ? 'block' : 'none', listStyle: 'none', paddingLeft: '32px', margin: 0 }}>
                {dynamicMenus
                  .filter(m => m.parent_menu && m.parent_menu.trim() === categoryName && m.aktive === 'Y' && isRoleAllowed(m.role_menu))
                  .map(menu => (
                    <li key={menu.id_menu} style={{ marginBottom: '4px' }}>
                      <div 
                        className={`sidebar-menu-item ${activeTabId === menu.oracle ? 'active' : ''}`} 
                        onClick={() => onOpenTab(menu.oracle, menu.menu_name)}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '6px' }}
                      >
                        {menu.menu_name}
                      </div>
                    </li>
                  ))
                }
              </ul>
            </li>
          );
        })}

        {/* Dynamic Standalone Menus */}
        {standaloneMenus.map(menu => (
          <li key={menu.id_menu}>
            <div 
              className={`sidebar-menu-item ${activeTabId === menu.oracle ? 'active' : ''}`} 
              onClick={() => onOpenTab(menu.oracle, menu.menu_name)}
            >
              <i className="pi pi-file"></i> {menu.menu_name}
            </div>
          </li>
        ))}

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
