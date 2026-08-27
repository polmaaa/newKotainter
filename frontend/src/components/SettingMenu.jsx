import React, { useState, useEffect } from 'react';

export default function SettingMenu({ apiBaseUrl, showToast, user, onRefreshMenus }) {
  const swaggerUrl = `${apiBaseUrl}/Api_docs`;

  const getSwaggerDeepLink = (apiName, parentName, method, path) => {
    let tag = '';
    const lowerName = apiName.trim().toLowerCase();
    const lowerParent = parentName ? parentName.trim().toLowerCase() : '';

    if (lowerName === 'update pnj') {
      tag = 'Update PNJ';
    } else if (lowerName === 'update user') {
      tag = 'Update User';
    } else if (lowerName === 'update role user') {
      tag = 'Update Role User';
    } else if (lowerName === 'posting pdl') {
      tag = 'Posting PDL';
    } else if (lowerParent === 'crm' || lowerName.includes('crm')) {
      tag = 'CRM';
    } else if (lowerName.includes('tabel') || lowerName.includes('table')) {
      tag = 'Informasi Data Tabel';
    } else if (lowerName.includes('user') && (lowerParent.includes('dev') || lowerParent.includes('manajemen'))) {
      tag = 'Developer User Management';
    } else if (lowerName.includes('menu') || lowerName.includes('db') || lowerName.includes('config') || lowerName.includes('setting')) {
      tag = 'System & Config';
    } else {
      tag = apiName;
    }

    if (path) {
      const cleanPath = path.replace(/^\//, '').replace(/\//g, '_');
      const lowerMethod = method.toLowerCase();
      return `${swaggerUrl}#/${encodeURIComponent(tag)}/${lowerMethod}_${cleanPath}`;
    }

    return `${swaggerUrl}#/${encodeURIComponent(tag)}`;
  };
  
  const [menus, setMenus] = useState([]);
  const [apisList, setApisList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states for Menu form
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // API Documentation & Generation States inside the Menu Modal
  const [enableApiDoc, setEnableApiDoc] = useState(false);
  const [hasOracle, setHasOracle] = useState(false);
  const [oracleController, setOracleController] = useState('');
  const [oracleModel, setOracleModel] = useState('');
  const [oracleApis, setOracleApis] = useState([{ method: 'GET', path: '', desc: '' }]);

  const [hasPostgres, setHasPostgres] = useState(false);
  const [postgresController, setPostgresController] = useState('');
  const [postgresModel, setPostgresModel] = useState('');
  const [postgresApis, setPostgresApis] = useState([{ method: 'GET', path: '', desc: '' }]);

  const [isOracleApiManuallyEdited, setIsOracleApiManuallyEdited] = useState(false);
  const [isPostgresApiManuallyEdited, setIsPostgresApiManuallyEdited] = useState(false);

  // Pop-up Detail Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApi, setSelectedApi] = useState(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      // 1. Fetch menus
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

      // 2. Fetch Developer APIs list
      const apisRes = await fetch(`${apiBaseUrl}/api/Developer_apis/get_apis?_=${Date.now()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const apisResult = await apisRes.json();
      if (apisRes.ok && apisResult.status === 'success') {
        setApisList(apisResult.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalRows = menus.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedData = menus.slice(startIndex, endIndex);

  const setPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageLimit = 5;
    let pages = [];
    if (totalPages <= pageLimit) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = pageLimit;
      } else if (end === totalPages) {
        start = totalPages - pageLimit + 1;
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
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

    // Reset API docs states
    setEnableApiDoc(false);
    setHasOracle(false);
    setOracleController('');
    setOracleModel('');
    setOracleApis([{ method: 'GET', path: '', desc: '' }]);
    setHasPostgres(false);
    setPostgresController('');
    setPostgresModel('');
    setPostgresApis([{ method: 'GET', path: '', desc: '' }]);
    setIsOracleApiManuallyEdited(false);
    setIsPostgresApiManuallyEdited(false);

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

    // Check if there is an existing API doc for this menu
    const existingApi = apisList.find(a => a.name.trim().toLowerCase() === menu.menu_name.trim().toLowerCase());
    if (existingApi) {
      setEnableApiDoc(true);
      if (existingApi.oracle) {
        setHasOracle(true);
        setOracleController(existingApi.oracle.controller || '');
        setOracleModel(existingApi.oracle.model || '');
        setOracleApis(existingApi.oracle.apis && existingApi.oracle.apis.length > 0 ? existingApi.oracle.apis : [{ method: 'GET', path: '', desc: '' }]);
      } else {
        setHasOracle(false);
        setOracleController('');
        setOracleModel('');
        setOracleApis([{ method: 'GET', path: '', desc: '' }]);
      }

      if (existingApi.postgres) {
        setHasPostgres(true);
        setPostgresController(existingApi.postgres.controller || '');
        setPostgresModel(existingApi.postgres.model || '');
        setPostgresApis(existingApi.postgres.apis && existingApi.postgres.apis.length > 0 ? existingApi.postgres.apis : [{ method: 'GET', path: '', desc: '' }]);
      } else {
        setHasPostgres(false);
        setPostgresController('');
        setPostgresModel('');
        setPostgresApis([{ method: 'GET', path: '', desc: '' }]);
      }
      setIsOracleApiManuallyEdited(true);
      setIsPostgresApiManuallyEdited(true);
    } else {
      setEnableApiDoc(false);
      setHasOracle(false);
      setOracleController('');
      setOracleModel('');
      setOracleApis([{ method: 'GET', path: '', desc: '' }]);
      setHasPostgres(false);
      setPostgresController('');
      setPostgresModel('');
      setPostgresApis([{ method: 'GET', path: '', desc: '' }]);
      setIsOracleApiManuallyEdited(false);
      setIsPostgresApiManuallyEdited(false);
    }

    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setMenuName(val);

    // Auto-generate routes and controller/model names
    if (modalMode === 'add') {
      const cleaned = val.replace(/[^a-zA-Z0-9]/g, '');
      const lowerCleaned = cleaned.toLowerCase();
      
      if (cleaned) {
        setEnableApiDoc(true);
      } else {
        setEnableApiDoc(false);
      }

      if (!isOracleManuallyEdited) {
        setMenuOracle(cleaned);
        if (cleaned) {
          setHasOracle(true);
        } else {
          setHasOracle(false);
        }
        if (!isOracleApiManuallyEdited && cleaned) {
          setOracleController(`api/application/controllers/api/${cleaned}.php`);
          setOracleModel(`api/application/models/M${lowerCleaned}.php`);
          setOracleApis([
            { method: 'GET', path: `/api/${cleaned}/get_data`, desc: `Mencari data ${val} di database Oracle.` },
            { method: 'POST', path: `/api/${cleaned}/save`, desc: `Menyimpan data ${val} di database Oracle.` }
          ]);
        }
      }
      if (!isPostgreManuallyEdited) {
        const pgName = cleaned ? `${cleaned}_pg` : '';
        setMenuPostgre(pgName);
        if (pgName) {
          setHasPostgres(true);
        } else {
          setHasPostgres(false);
        }
        if (!isPostgresApiManuallyEdited && pgName) {
          setPostgresController(`api/application/controllers/api/${pgName}.php`);
          setPostgresModel(`api/application/models/M${lowerCleaned}.php`);
          setPostgresApis([
            { method: 'GET', path: `/api/${pgName}/get_data`, desc: `Mencari data ${val} di database PostgreSQL.` },
            { method: 'POST', path: `/api/${pgName}/save`, desc: `Menyimpan data ${val} di database PostgreSQL.` }
          ]);
        }
      }
    }
  };

  const handleOracleRouteChange = (val) => {
    setMenuOracle(val);
    setIsOracleManuallyEdited(true);

    if (val) {
      setEnableApiDoc(true);
      setHasOracle(true);
    } else if (!menuPostgre) {
      setEnableApiDoc(false);
      setHasOracle(false);
    } else {
      setHasOracle(false);
    }

    if (val && !isOracleApiManuallyEdited) {
      setOracleController(`api/application/controllers/api/${val}.php`);
      const cleanVal = val.toLowerCase().replace('update', '').replace('_pg', '');
      setOracleModel(`api/application/models/M${cleanVal}.php`);
      
      setOracleApis([
        { method: 'GET', path: `/api/${val}/get_data`, desc: `Mencari data ${menuName || 'transaksi'} di database Oracle.` },
        { method: 'POST', path: `/api/${val}/save`, desc: `Menyimpan data ${menuName || 'transaksi'} di database Oracle.` }
      ]);
    }
  };

  const handlePostgreRouteChange = (val) => {
    setMenuPostgre(val);
    setIsPostgreManuallyEdited(true);

    if (val) {
      setEnableApiDoc(true);
      setHasPostgres(true);
    } else if (!menuOracle) {
      setEnableApiDoc(false);
      setHasPostgres(false);
    } else {
      setHasPostgres(false);
    }

    if (val && !isPostgresApiManuallyEdited) {
      setPostgresController(`api/application/controllers/api/${val}.php`);
      const cleanVal = val.toLowerCase().replace('update', '').replace('_pg', '');
      setPostgresModel(`api/application/models/M${cleanVal}.php`);

      setPostgresApis([
        { method: 'GET', path: `/api/${val}/get_data`, desc: `Mencari data ${menuName || 'transaksi'} di database PostgreSQL.` },
        { method: 'POST', path: `/api/${val}/save`, desc: `Menyimpan data ${menuName || 'transaksi'} di database PostgreSQL.` }
      ]);
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
      // 1. Save Menu in Database
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
      if (!response.ok || result.status !== 'success') {
        showToast(result.message || 'Gagal menyimpan menu.', 'error');
        setSaving(false);
        return;
      }

      // 2. Save API configuration & trigger file code skeletons generation
      if (enableApiDoc) {
        let apiIdToSave = null;
        const existingApi = apisList.find(a => a.name.trim().toLowerCase() === menuName.trim().toLowerCase());
        if (existingApi) {
          apiIdToSave = existingApi.id;
        }

        const apiPayload = {
          id: apiIdToSave,
          name: menuName.trim(),
          parent: menuParent.trim() || 'Utama',
          oracle: hasOracle ? {
            controller: oracleController,
            model: oracleModel,
            apis: oracleApis.filter(api => api.path.trim() !== '')
          } : null,
          postgres: hasPostgres ? {
            controller: postgresController,
            model: postgresModel,
            apis: postgresApis.filter(api => api.path.trim() !== '')
          } : null
        };

        const apiResponse = await fetch(`${apiBaseUrl}/api/Developer_apis/save_api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(apiPayload)
        });
        const apiResult = await apiResponse.json();
        if (!apiResponse.ok || apiResult.status !== 'success') {
          showToast(apiResult.message || 'Gagal menyimpan spesifikasi API / file generator.', 'error');
          loadMenus();
          setShowModal(false);
          if (onRefreshMenus) onRefreshMenus();
          setSaving(false);
          return;
        }
      }

      showToast('Menu dan Integrasi API berhasil disimpan!', 'success');
      setShowModal(false);
      loadMenus();
      if (onRefreshMenus) onRefreshMenus();
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus menu ID ${id}? (Dokumentasi API terkait juga akan dihapus)`)) {
      return;
    }

    try {
      const menuToDelete = menus.find(m => m.id_menu === id);
      if (menuToDelete) {
        const matchingApi = apisList.find(a => a.name.trim().toLowerCase() === menuToDelete.menu_name.trim().toLowerCase());
        if (matchingApi) {
          await fetch(`${apiBaseUrl}/api/Developer_apis/delete_api`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ id: matchingApi.id })
          });
        }
      }

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

  const handleOpenInfoApi = (menu) => {
    const matchingApi = apisList.find(a => a.name.trim().toLowerCase() === menu.menu_name.trim().toLowerCase());
    if (matchingApi) {
      setSelectedApi(matchingApi);
      setShowDetailModal(true);
    } else {
      if (window.confirm(`Dokumentasi API untuk menu "${menu.menu_name}" belum terkonfigurasi. Apakah Anda ingin mengonfigurasinya sekarang?`)) {
        handleOpenEdit(menu);
        setEnableApiDoc(true);
      }
    }
  };

  // Oracle Dynamic APIs fields helpers
  const handleAddOracleApiRow = () => {
    setOracleApis(prev => [...prev, { method: 'GET', path: '', desc: '' }]);
  };
  const handleRemoveOracleApiRow = (index) => {
    setOracleApis(prev => prev.filter((_, i) => i !== index));
  };
  const handleOracleApiChange = (index, field, value) => {
    setOracleApis(prev => prev.map((api, i) => i === index ? { ...api, [field]: value } : api));
    setIsOracleApiManuallyEdited(true);
  };

  // Postgres Dynamic APIs fields helpers
  const handleAddPostgresApiRow = () => {
    setPostgresApis(prev => [...prev, { method: 'GET', path: '', desc: '' }]);
  };
  const handleRemovePostgresApiRow = (index) => {
    setPostgresApis(prev => prev.filter((_, i) => i !== index));
  };
  const handlePostgresApiChange = (index, field, value) => {
    setPostgresApis(prev => prev.map((api, i) => i === index ? { ...api, [field]: value } : api));
    setIsPostgresApiManuallyEdited(true);
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

      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
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
          <>
          <div style={{ overflowX: 'auto' }}>
            <table className="log-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '80px' }}>ID Menu</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '180px' }}>Menu Induk (Parent)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Nama Menu</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Oracle (link/route)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Postgre (link/route)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, width: '80px' }}>Status</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Akses Role</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center', width: '160px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      Belum ada data menu terkonfigurasi.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(menu => (
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
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => handleOpenInfoApi(menu)}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Detail Endpoint API"
                          >
                            <i className="pi pi-code"></i> API
                          </button>
                          <button 
                            type="button" 
                            className="btn-action"
                            onClick={() => handleOpenEdit(menu)}
                            style={{ color: '#0369a1' }}
                            title="Edit"
                          >
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            className="btn-action"
                            onClick={() => handleDelete(menu.id_menu)}
                            style={{ color: 'var(--error)' }}
                            title="Hapus"
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

          {/* Table Pagination Controls */}
          {totalRows > rowsPerPage && (
            <div className="pagination-container" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="pagination-info" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Menampilkan menu ke {startIndex + 1} - {endIndex} dari total {totalRows}
              </div>
              <div className="pagination-controls" style={{ display: 'flex', gap: '4px' }}>
                <div 
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
                  onClick={() => setPage(1)}
                >
                  <i className="pi pi-angle-double-left"></i>
                </div>
                <div 
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
                  onClick={() => setPage(currentPage - 1)}
                >
                  <i className="pi pi-angle-left"></i>
                </div>
                {getPageNumbers().map(p => (
                  <div 
                    key={p} 
                    className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </div>
                ))}
                <div 
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} 
                  onClick={() => setPage(currentPage + 1)}
                >
                  <i className="pi pi-angle-right"></i>
                </div>
                <div 
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} 
                  onClick={() => setPage(totalPages)}
                >
                  <i className="pi pi-angle-double-right"></i>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* API INFO DETAIL MODAL */}
      {showDetailModal && selectedApi && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', borderRadius: '12px', width: '100%',
            maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f766e', textTransform: 'uppercase' }}>{selectedApi.parent}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.3rem', color: 'var(--text-main)' }}>Detail API: {selectedApi.name}</h3>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="pi pi-times"></i>
              </button>
            </div>

            {/* Split view Oracle vs Postgres */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              
              {/* Oracle */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fdfbf7', border: '1px solid #f5efe6' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#b45309', borderRadius: '50%' }}></span>
                  Database Oracle
                </h4>
                {selectedApi.oracle ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Controller:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#be123c', backgroundColor: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>{selectedApi.oracle.controller}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Model:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>{selectedApi.oracle.model}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Endpoints:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedApi.oracle.apis && selectedApi.oracle.apis.map((api, i) => (
                          <div key={i} style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontWeight: 800, color: api.method === 'GET' ? '#0d9488' : '#e11d48' }}>{api.method}</span>
                              <a 
                                href={getSwaggerDeepLink(selectedApi.name, selectedApi.parent, api.method, api.path)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ fontWeight: 600, color: '#0f766e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                title="Klik untuk menguji langsung di Swagger"
                              >
                                <code>{api.path}</code> <i className="pi pi-external-link" style={{ fontSize: '0.7rem' }}></i>
                              </a>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{api.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak memiliki versi Oracle.</span>
                )}
              </div>

              {/* PostgreSQL */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#15803d', borderRadius: '50%' }}></span>
                  Database PostgreSQL
                </h4>
                {selectedApi.postgres ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Controller:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#be123c', backgroundColor: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>{selectedApi.postgres.controller}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Model:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>{selectedApi.postgres.model}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Endpoints:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedApi.postgres.apis && selectedApi.postgres.apis.map((api, i) => (
                          <div key={i} style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontWeight: 800, color: api.method === 'GET' ? '#0d9488' : '#e11d48' }}>{api.method}</span>
                              <a 
                                href={getSwaggerDeepLink(selectedApi.name, selectedApi.parent, api.method, api.path)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ fontWeight: 600, color: '#0f766e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                title="Klik untuk menguji langsung di Swagger"
                              >
                                <code>{api.path}</code> <i className="pi pi-external-link" style={{ fontSize: '0.7rem' }}></i>
                              </a>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{api.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak memiliki versi PostgreSQL.</span>
                )}
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <a 
                href={swaggerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 16px' }}
              >
                <i className="pi pi-external-link"></i> Uji Semua API di Swagger
              </a>
              <button 
                className="btn btn-primary"
                onClick={() => setShowDetailModal(false)}
                style={{ padding: '8px 20px' }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MENU MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', borderRadius: '12px', width: '100%',
            maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)'
          }}>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  {modalMode === 'add' ? 'Tambah Menu Baru' : `Edit Menu (ID: ${menuId})`}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <i className="pi pi-times"></i>
                </button>
              </div>

              {/* Grid content for Menu Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="menu-parent-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Menu Induk (Parent)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <i className="pi pi-folder" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                    <input
                      type="text"
                      id="menu-parent-input"
                      className="form-input-text"
                      style={{ paddingLeft: '38px' }}
                      value={menuParent}
                      onChange={(e) => setMenuParent(e.target.value)}
                      placeholder="Contoh: Pelayanan Pelanggan (kosongkan jika utama)"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      placeholder="Masukkan nama menu (contoh: Update PNJ)"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="menu-oracle-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Oracle (link/route)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <i className="pi pi-link" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                    <input
                      type="text"
                      id="menu-oracle-input"
                      className="form-input-text"
                      style={{ paddingLeft: '38px', fontFamily: 'monospace' }}
                      value={menuOracle}
                      onChange={(e) => handleOracleRouteChange(e.target.value)}
                      placeholder="Contoh: UpdatePnj"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="menu-postgre-input" style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Postgre (link/route)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <i className="pi pi-link" style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.95rem' }}></i>
                    <input
                      type="text"
                      id="menu-postgre-input"
                      className="form-input-text"
                      style={{ paddingLeft: '38px', fontFamily: 'monospace' }}
                      value={menuPostgre}
                      onChange={(e) => handlePostgreRouteChange(e.target.value)}
                      placeholder="Contoh: UpdatePnj_pg"
                    />
                  </div>
                </div>
              </div>

              {/* Access Roles */}
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>Role Pengakses</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {allRoles.map(role => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <div
                        key={role}
                        onClick={() => toggleRoleSelection(role)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px',
                          border: isSelected ? '1.5px solid #0f766e' : '1.5px solid var(--border-light)',
                          backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                          color: isSelected ? '#0f766e' : 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, userSelect: 'none', transition: 'all 0.15s ease'
                        }}
                      >
                        <i className={`pi ${isSelected ? 'pi-check-circle' : 'pi-circle'}`} style={{ fontSize: '0.85rem' }}></i>
                        <span>{role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Switch active state */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Status Keaktifan Menu</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {menuAktive === 'Y' ? 'Menu aktif (Tampil di sidebar)' : 'Menu nonaktif (Disembunyikan)'}
                  </span>
                </div>
                <div 
                  onClick={() => setMenuAktive(prev => prev === 'Y' ? 'N' : 'Y')}
                  style={{
                    width: '46px', height: '24px', borderRadius: '12px',
                    backgroundColor: menuAktive === 'Y' ? '#10b981' : '#ef4444',
                    padding: '2px', cursor: 'pointer', transition: 'background-color 0.25s ease',
                    display: 'flex', alignItems: 'center', justifyContent: menuAktive === 'Y' ? 'flex-end' : 'flex-start',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.25s' }}></div>
                </div>
              </div>

              {/* API DOCS & GENERATOR INTEGRATION CHECKBOX */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#0f766e', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={enableApiDoc} 
                    onChange={e => setEnableApiDoc(e.target.checked)} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Aktifkan Dokumentasi API & File Generator
                </label>
                <p style={{ margin: '4px 0 0 26px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Jika dicentang, menyimpan menu akan memetakan endpoint API ke Swagger dan secara otomatis menghasilkan skeleton file Controller/Model PHP di server jika belum ada.
                </p>
              </div>

              {/* API CONFIG FIELDS */}
              {enableApiDoc && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#b45309', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={hasOracle} onChange={e => setHasOracle(e.target.checked)} disabled={!menuOracle} />
                      Oracle
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#15803d', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={hasPostgres} onChange={e => setHasPostgres(e.target.checked)} disabled={!menuPostgre} />
                      Postgre
                    </label>
                  </div>

                  {/* Oracle Config */}
                  {hasOracle && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fdfbf7', border: '1px solid #f5efe6' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#b45309' }}>Konfigurasi Controller & Model (Oracle)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Path Controller PHP</label>
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                            placeholder="api/application/controllers/api/UpdatePnj.php" 
                            value={oracleController}
                            onChange={e => { setOracleController(e.target.value); setIsOracleApiManuallyEdited(true); }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Path Model PHP</label>
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                            placeholder="api/application/models/Mpnj.php" 
                            value={oracleModel}
                            onChange={e => { setOracleModel(e.target.value); setIsOracleApiManuallyEdited(true); }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Endpoint APIs (Oracle):</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {oracleApis.map((api, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <select 
                                className="input-text" 
                                style={{ width: '90px', padding: '4px 6px', fontSize: '0.8rem' }}
                                value={api.method}
                                onChange={e => handleOracleApiChange(idx, 'method', e.target.value)}
                              >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                              </select>
                              <input 
                                type="text" 
                                className="input-text" 
                                style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem' }}
                                placeholder="/api/UpdatePnj/get_data" 
                                value={api.path}
                                onChange={e => handleOracleApiChange(idx, 'path', e.target.value)}
                                required={idx === 0}
                              />
                              <input 
                                type="text" 
                                className="input-text" 
                                style={{ flex: 2, padding: '4px 8px', fontSize: '0.8rem' }}
                                placeholder="Deskripsi..." 
                                value={api.desc}
                                onChange={e => handleOracleApiChange(idx, 'desc', e.target.value)}
                              />
                              <button 
                                type="button" 
                                className="btn-action" 
                                style={{ color: 'var(--error)' }}
                                onClick={() => handleRemoveOracleApiRow(idx)}
                                disabled={oracleApis.length === 1}
                              >
                                <i className="pi pi-trash" style={{ fontSize: '0.8rem' }}></i>
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={handleAddOracleApiRow}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="pi pi-plus"></i> Tambah Row
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Postgres Config */}
                  {hasPostgres && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#15803d' }}>Konfigurasi Controller & Model (PostgreSQL)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Path Controller PHP</label>
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                            placeholder="api/application/controllers/api/UpdatePnj_pg.php" 
                            value={postgresController}
                            onChange={e => { setPostgresController(e.target.value); setIsPostgresApiManuallyEdited(true); }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Path Model PHP</label>
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                            placeholder="api/application/models/Mpnj.php" 
                            value={postgresModel}
                            onChange={e => { setPostgresModel(e.target.value); setIsPostgresApiManuallyEdited(true); }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Endpoint APIs (PostgreSQL):</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {postgresApis.map((api, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <select 
                                className="input-text" 
                                style={{ width: '90px', padding: '4px 6px', fontSize: '0.8rem' }}
                                value={api.method}
                                onChange={e => handlePostgresApiChange(idx, 'method', e.target.value)}
                              >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                              </select>
                              <input 
                                type="text" 
                                className="input-text" 
                                style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem' }}
                                placeholder="/api/UpdatePnj_pg/get_data" 
                                value={api.path}
                                onChange={e => handlePostgresApiChange(idx, 'path', e.target.value)}
                                required={idx === 0}
                              />
                              <input 
                                type="text" 
                                className="input-text" 
                                style={{ flex: 2, padding: '4px 8px', fontSize: '0.8rem' }}
                                placeholder="Deskripsi..." 
                                value={api.desc}
                                onChange={e => handlePostgresApiChange(idx, 'desc', e.target.value)}
                              />
                              <button 
                                type="button" 
                                className="btn-action" 
                                style={{ color: 'var(--error)' }}
                                onClick={() => handlePostgresApiChange(idx)}
                                disabled={postgresApis.length === 1}
                              >
                                <i className="pi pi-trash" style={{ fontSize: '0.8rem' }}></i>
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={handleAddPostgresApiRow}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="pi pi-plus"></i> Tambah Row
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ padding: '8px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? (
                    <>
                      <i className="pi pi-spin pi-spinner"></i> Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-save"></i> Simpan Menu & API
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
