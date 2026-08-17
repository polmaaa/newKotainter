import React, { useState, useEffect } from 'react';

export default function SettingMenu({ apiBaseUrl, showToast, user, onRefreshMenus }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  
  // Form states
  const [menuId, setMenuId] = useState(''); // Numeric ID (used for editing only, generated in add mode)
  const [menuParent, setMenuParent] = useState(''); // Manual text input
  const [menuName, setMenuName] = useState('');
  const [menuOracle, setMenuOracle] = useState('');
  const [menuPostgre, setMenuPostgre] = useState('');
  const [menuAktive, setMenuAktive] = useState('Y');
  
  // Role access state (Category selection style)
  const [selectedRoles, setSelectedRoles] = useState(['DEVELOPER']);
  const allRoles = ['DEVELOPER', 'SUPERUSER', 'SENIOR', 'MIDDLE', 'JUNIOR'];

  // Tracking if user manually edited the oracle/postgre fields
  const [isOracleManuallyEdited, setIsOracleManuallyEdited] = useState(false);
  const [isPostgreManuallyEdited, setIsPostgreManuallyEdited] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/menu_config/get_menus?_=${Date.now()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setMenus(result.data || []);
      } else {
        showToast(result.message || 'Gagal memuat konfigurasi menu.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setMenuId('');
    setMenuParent('');
    setMenuName('');
    setMenuOracle('');
    setMenuPostgre('');
    setMenuAktive('Y');
    setSelectedRoles(['DEVELOPER']);
    setIsOracleManuallyEdited(false);
    setIsPostgreManuallyEdited(false);
    setShowModal(true);
  };

  const handleOpenEdit = (menu) => {
    setModalMode('edit');
    setMenuId(menu.id_menu);
    setMenuParent(menu.parent_menu || '');
    setMenuName(menu.menu_name);
    setMenuOracle(menu.oracle || '');
    setMenuPostgre(menu.postgre || '');
    setMenuAktive(menu.aktive || 'Y');
    
    // Parse roles from comma-separated string to array
    const roles = menu.role_menu 
      ? menu.role_menu.split(',').map(r => r.trim().toUpperCase()) 
      : [];
    setSelectedRoles(roles);
    
    setIsOracleManuallyEdited(true);
    setIsPostgreManuallyEdited(true);
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setMenuName(val);

    // Auto-generate Oracle and PostgreSQL controllers if in add mode and not manually changed
    if (modalMode === 'add') {
      const cleaned = val.replace(/[^a-zA-Z0-9]/g, '');
      
      if (!isOracleManuallyEdited) {
        setMenuOracle(cleaned);
      }
      if (!isPostgreManuallyEdited) {
        setMenuPostgre(cleaned ? `${cleaned}_pg` : '');
      }
    }
  };

  const toggleRoleSelection = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!menuName.trim()) {
      showToast('Nama Menu wajib diisi!', 'warning');
      return;
    }

    if (selectedRoles.length === 0) {
      showToast('Pilih minimal satu Role Pengakses!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/menu_config/save_menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id_menu: modalMode === 'edit' ? menuId : null,
          parent_menu: menuParent.trim() || null,
          menu_name: menuName.trim(),
          oracle: menuOracle.trim() || null,
          postgre: menuPostgre.trim() || null,
          aktive: menuAktive,
          role_menu: selectedRoles.join(',')
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Menu berhasil disimpan!', 'success');
        setShowModal(false);
        loadMenus();
        if (onRefreshMenus) onRefreshMenus();
      } else {
        showToast(result.message || 'Gagal menyimpan menu.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus menu ID ${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/menu_config/delete_menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id_menu: id })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Menu berhasil dihapus!', 'success');
        loadMenus();
        if (onRefreshMenus) onRefreshMenus();
      } else {
        showToast(result.message || 'Gagal menghapus menu.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    }
  };

  return (
    <div className="setting-menu-panel">
      <div className="panel-title-area" style={{ marginBottom: '20px' }}>
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f766e' }}>
          <i className="pi pi-sitemap"></i> Konfigurasi Dinamis Menu
        </h2>
        <p className="panel-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Mengelola menu, submenu, endpoint API Oracle/Postgre, serta role yang diizinkan untuk mengakses modul tersebut.
        </p>
      </div>

      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Daftar Menu (DTKS.DTKS_MENU)</span>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '8px 16px' }}
          >
            <i className="pi pi-plus-circle"></i> Tambah Menu Baru
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#0f766e' }}></i>
            <span>Memuat konfigurasi menu...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="log-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '80px' }}>ID Menu</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '200px' }}>Menu Induk (Parent)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Nama Menu</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Oracle (link/route)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Postgre (link/route)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '100px' }}>Status</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Akses Role</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center', width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textalign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      Belum ada data menu terkonfigurasi.
                    </td>
                  </tr>
                ) : (
                  menus.map(menu => (
                    <tr key={menu.id_menu} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>{menu.id_menu}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500, color: 'var(--text-main)' }}>
                        {menu.parent_menu ? (
                          <span style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {menu.parent_menu}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Utama / Standalone</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: '#0f766e' }}>{menu.menu_name}</td>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{menu.oracle || '-'}</td>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{menu.postgre || '-'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: menu.aktive === 'Y' ? '#ecfdf5' : '#fff1f2',
                          color: menu.aktive === 'Y' ? '#059669' : '#e11d48'
                        }}>
                          {menu.aktive === 'Y' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {menu.role_menu ? menu.role_menu.split(',').map((r, idx) => (
                            <span key={idx} style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {r}
                            </span>
                          )) : '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => handleOpenEdit(menu)}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
                          >
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => handleDelete(menu.id_menu)}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', color: 'var(--error)', borderColor: 'var(--error-bg)' }}
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <style>{`
            @keyframes modalScaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div 
            className="modal-content" 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              padding: '28px', 
              borderRadius: '16px', 
              width: '90%', 
              maxWidth: '500px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              border: '1px solid var(--border-light)',
              animation: 'modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e6f4f2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0f766e' }}>
                  <i className={`pi ${modalMode === 'add' ? 'pi-plus-circle' : 'pi-pencil'}`} style={{ fontSize: '1.1rem' }}></i>
                </div>
                <h3 style={{ margin: 0, color: '#0f766e', fontSize: '1.15rem', fontWeight: 700 }}>
                  {modalMode === 'add' ? 'Tambah Konfigurasi Menu' : 'Edit Konfigurasi Menu'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >
                <i className="pi pi-times" style={{ fontSize: '0.8rem' }}></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Menu Induk (Parent) - Manual Text Input */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label htmlFor="menu-parent-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Menu Induk</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-folder" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                  <input
                    type="text"
                    id="menu-parent-input"
                    className="form-input-text"
                    style={{ paddingLeft: '38px' }}
                    value={menuParent}
                    onChange={(e) => setMenuParent(e.target.value)}
                    placeholder="Contoh: PELAYANAN PELANGGAN (opsional)"
                  />
                </div>
              </div>

              {/* Nama Menu */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label htmlFor="menu-name-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Nama Menu</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-info-circle" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                  <input
                    type="text"
                    id="menu-name-input"
                    className="form-input-text"
                    style={{ paddingLeft: '38px' }}
                    required
                    value={menuName}
                    onChange={handleNameChange}
                    placeholder="Masukkan nama menu (contoh: Insert Data BLTHMUT)"
                  />
                </div>
              </div>

              {/* Oracle (link/route) */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label htmlFor="menu-oracle-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Oracle (link/route)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-link" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                  <input
                    type="text"
                    id="menu-oracle-input"
                    className="form-input-text"
                    style={{ paddingLeft: '38px', fontFamily: 'monospace' }}
                    value={menuOracle}
                    onChange={(e) => {
                      setMenuOracle(e.target.value);
                      setIsOracleManuallyEdited(true);
                    }}
                    placeholder="Contoh: InsertDataBLTHMUT"
                  />
                </div>
              </div>

              {/* Postgre (link/route) */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label htmlFor="menu-postgre-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Postgre (link/route)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <i className="pi pi-link" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                  <input
                    type="text"
                    id="menu-postgre-input"
                    className="form-input-text"
                    style={{ paddingLeft: '38px', fontFamily: 'monospace' }}
                    value={menuPostgre}
                    onChange={(e) => {
                      setMenuPostgre(e.target.value);
                      setIsPostgreManuallyEdited(true);
                    }}
                    placeholder="Contoh: InsertDataBLTHMUT_pg"
                  />
                </div>
              </div>

              {/* Role Pengakses (Category selection style) */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Role Pengakses</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {allRoles.map(role => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <div
                        key={role}
                        onClick={() => toggleRoleSelection(role)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: isSelected ? '1.5px solid #0f766e' : '1.5px solid var(--border-light)',
                          backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                          color: isSelected ? '#0f766e' : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          userSelect: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <i className={`pi ${isSelected ? 'pi-check-circle' : 'pi-circle'}`} style={{ fontSize: '0.85rem' }}></i>
                        <span>{role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Status Keaktifan Menu</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {menuAktive === 'Y' ? 'Menu aktif (Tampil di sidebar)' : 'Menu nonaktif (Disembunyikan)'}
                  </span>
                </div>
                <div 
                  onClick={() => setMenuAktive(prev => prev === 'Y' ? 'N' : 'Y')}
                  style={{
                    width: '46px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: menuAktive === 'Y' ? '#10b981' : '#ef4444',
                    padding: '2px',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: menuAktive === 'Y' ? 'flex-end' : 'flex-start',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.25s' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)} 
                  disabled={saving}
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? (
                    <>
                      <i className="pi pi-spin pi-spinner"></i>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-save"></i>
                      Simpan Menu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
