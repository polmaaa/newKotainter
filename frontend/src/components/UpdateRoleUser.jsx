import React, { useState, useEffect, useRef } from 'react';

export default function UpdateRoleUser({ user, isPostgres, apiBaseUrl, showToast, pgRegion = 'ap2t', onPgRegionChange }) {
  const [searchIdUser, setSearchIdUser] = useState('');
  const [searchUnitUp, setSearchUnitUp] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('id_user'); // 'id_user' or 'unitup'
  const [userDataList, setUserDataList] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Available roles & search
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]); // array of role IDs
  const [roleSearchKeyword, setRoleSearchKeyword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Document attachment
  const [namaFile, setNamaFile] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  const dropdownRef = useRef(null);
  const pgDropdownRef = useRef(null);
  const [pgDropdownOpen, setPgDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pgDropdownRef.current && !pgDropdownRef.current.contains(e.target)) {
        setPgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dbPrefix = isPostgres ? 'api/UpdateRoleUser_pg' : 'api/UpdateRoleUser';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  // Fetch all available roles on mount/isPostgres change
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/users/get_all_roles?is_postgres=${isPostgres}`, {
          method: 'GET',
          headers: { 
            'X-Requested-With': 'XMLHttpRequest',
            'X-DB-Region': pgRegion
          }
        });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          const rawRoles = result.data || [];
          const normalized = rawRoles.map(r => ({
            id_group: r.id_group || r.ID_GROUP || '',
            nama_group: r.nama_group || r.NAMA_GROUP || ''
          }));
          setAvailableRoles(normalized);
        } else {
          showToast('Gagal memuat daftar role master.', 'error');
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    }
    fetchRoles();
  }, [apiBaseUrl, isPostgres]);

  // Click outside listener for custom dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchCriteria === 'id_user' && !searchIdUser.trim()) {
      showToast('Masukkan ID User untuk melakukan pencarian!', 'warning');
      return;
    }
    if (searchCriteria === 'unitup' && !searchUnitUp.trim()) {
      showToast('Masukkan Kode Unit untuk melakukan pencarian!', 'warning');
      return;
    }

    setLoadingSearch(true);
    setSelectedUser(null);
    setUserDataList([]);
    setCurrentPage(1);

    try {
      const params = new URLSearchParams();
      if (searchIdUser.trim()) params.append('id_user', searchIdUser.trim());
      if (searchUnitUp.trim()) params.append('unitup', searchUnitUp.trim());

      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_data?${params.toString()}`, {
        method: 'GET',
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        }
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const data = Array.isArray(result.data) ? result.data : [result.data];
        setUserDataList(data);
        if (data.length === 0) {
          showToast('Data user tidak ditemukan.', 'info');
        } else {
          showToast(`Berhasil memuat ${data.length} data user.`, 'success');
        }
      } else {
        showToast(result.message || 'Gagal memuat data user.', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectUser = (usr) => {
    setSelectedUser(usr);
    
    // Parse roles string (e.g. "ADMINF1,WASKIT") into selectedRoles array
    if (usr.role) {
      const parsedRoles = usr.role.split(',')
        .map(r => r.trim())
        .filter(r => r !== '');
      setSelectedRoles(parsedRoles);
    } else {
      setSelectedRoles([]);
    }
    
    setNamaFile('');
    setRoleSearchKeyword('');
    setIsDropdownOpen(false);
  };

  const toggleRoleSelection = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleRemoveRole = (roleId) => {
    setSelectedRoles(prev => prev.filter(r => r !== roleId));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Silakan cari dan pilih user terlebih dahulu!', 'warning');
      return;
    }
    // Dokumen pendukung is optional now

    setSaving(true);
    try {
      const rolesString = selectedRoles.join(',');
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save_role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        },
        body: JSON.stringify({
          id_user: selectedUser.id_user,
          roles: rolesString,
          nama_file: namaFile.trim()
        })
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Role user berhasil diperbarui!', 'success');
        
        // Update role locally in list
        const updatedUser = {
          ...selectedUser,
          role: rolesString
        };
        setUserDataList(prev => prev.map(u => u.id_user === updatedUser.id_user ? updatedUser : u));
        setSelectedUser(null);
      } else {
        showToast(result.message || 'Gagal memperbarui role user.', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke API server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter roles based on keyword
  const filteredRoles = availableRoles.filter(role => {
    const keyword = roleSearchKeyword.toLowerCase().trim();
    if (!keyword) return true;
    return (
      (role.id_group && role.id_group.toLowerCase().includes(keyword)) ||
      (role.nama_group && role.nama_group.toLowerCase().includes(keyword))
    );
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = userDataList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(userDataList.length / rowsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="update-role-user-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-user-edit" style={{ color: '#0f766e' }}></i> Update Role User
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Kelola dan perbarui penugasan peran (role/group) user pada tabel SECMAN.usrgroup menggunakan koneksi {dbLabel}.
          </p>
        </div>
        {isPostgres ? (
          <div ref={pgDropdownRef} style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '20px',
            padding: '2px 8px 2px 4px',
            gap: '8px',
            position: 'relative'
          }}>
            <span style={{ 
              padding: '4px 10px', 
              backgroundColor: '#1e3a8a', 
              color: '#ffffff', 
              borderRadius: '16px', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <i className="pi pi-database" style={{ fontSize: '0.7rem' }}></i> Mode DB: PostgreSQL
            </span>
            <div 
              onClick={() => setPgDropdownOpen(!pgDropdownOpen)}
              style={{
                flex: 1,
                padding: '4px 24px 4px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#1e3a8a',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e3a8a\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 4px center',
                backgroundSize: '12px'
              }}
            >
              {pgRegion === 'ap2t' && 'AP2T (10.99.20.11)'}
              {pgRegion === 'jateng' && 'JATENG & DIY (10.99.20.12)'}
              {pgRegion === 'jatim' && 'JATIM (10.99.20.13)'}
              {pgRegion === 'jakban' && 'JAKARTA & BANTEN (10.99.20.13)'}
              {pgRegion === 'jabar' && 'JABAR (10.99.20.14)'}
            </div>

            {pgDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 999,
                overflow: 'hidden',
                padding: '4px 0'
              }}>
                {[
                  { value: 'ap2t', label: 'AP2T (10.99.20.11)' },
                  { value: 'jateng', label: 'JATENG & DIY (10.99.20.12)' },
                  { value: 'jatim', label: 'JATIM (10.99.20.13)' },
                  { value: 'jakban', label: 'JAKARTA & BANTEN (10.99.20.13)' },
                  { value: 'jabar', label: 'JABAR (10.99.20.14)' }
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      onPgRegionChange(item.value);
                      setPgDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      fontWeight: pgRegion === item.value ? '600' : '500',
                      color: pgRegion === item.value ? '#1e3a8a' : '#475569',
                      backgroundColor: pgRegion === item.value ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (pgRegion !== item.value) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pgRegion !== item.value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {pgRegion === item.value && (
                      <i className="pi pi-check" style={{ color: '#1e3a8a', fontSize: '0.75rem' }}></i>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{ 
            padding: '6px 12px', 
            backgroundColor: '#115e59', 
            color: '#ffffff', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <i className="pi pi-database" style={{ fontSize: '0.75rem' }}></i> Mode DB: Oracle
          </span>
        )}
      </div>

      {/* SEARCH PANEL */}
      <div className="search-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="search-criteria" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Cari Berdasarkan</label>
            <select
              id="search-criteria"
              className="select-input"
              value={searchCriteria}
              onChange={(e) => {
                setSearchCriteria(e.target.value);
                if (e.target.value === 'id_user') setSearchUnitUp('');
                else setSearchIdUser('');
              }}
              disabled={loadingSearch || saving}
              style={{ 
                padding: '10px 36px 10px 14px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-input)', 
                color: 'var(--text-main)', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                height: '42px',
                width: '100%',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '16px'
              }}
            >
              <option value="id_user">ID User</option>
              <option value="unitup">Kode Unit</option>
            </select>
          </div>

          {searchCriteria === 'id_user' ? (
            <div className="form-group" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>ID User</label>
              <input
                type="text"
                value={searchIdUser}
                onChange={(e) => setSearchIdUser(e.target.value)}
                placeholder="Masukkan ID User (e.g. PS.PUSAT.POLMA)"
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>
          ) : (
            <div className="form-group" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Kode Unit (Maks 6 digit)</label>
              <input
                type="text"
                maxLength={6}
                value={searchUnitUp}
                onChange={(e) => setSearchUnitUp(e.target.value)}
                placeholder="Masukkan Kode Unit (e.g. 54210)"
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loadingSearch}
            style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}
          >
            {loadingSearch ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-search"></i>}
            Cari User
          </button>
        </form>
      </div>

      {/* SEARCH RESULTS LIST */}
      {userDataList.length > 0 && (
        <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="pi pi-list"></i> Hasil Pencarian User
          </h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Aksi</th>
                  <th style={{ padding: '12px' }}>ID User</th>
                  <th style={{ padding: '12px' }}>Nama User</th>
                  <th style={{ padding: '12px' }}>Kode Unit</th>
                  <th style={{ padding: '12px' }}>Level User</th>
                  <th style={{ padding: '12px' }}>Role/Group Aktif</th>
                  <th style={{ padding: '12px' }}>Status Akun</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((usr) => {
                  const isSelected = selectedUser && selectedUser.id_user === usr.id_user;
                  return (
                    <tr key={usr.id_user} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.05)' : 'transparent' }}>
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectUser(usr)}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          {!isSelected && <i className="pi pi-user-edit"></i>}
                          {isSelected ? 'Terpilih' : 'Pilih'}
                        </button>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>{usr.id_user}</td>
                      <td style={{ padding: '12px', color: 'var(--text-main)' }}>{usr.nama_user}</td>
                      <td style={{ padding: '12px', color: 'var(--text-main)' }}>{usr.kodeunit}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(15, 118, 110, 0.1)', color: '#0f766e' }}>
                          {usr.leveluser}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-main)' }}>
                        {usr.role ? (
                          usr.role.split(',').map((r, i) => (
                            <span key={i} style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', marginRight: '4px', marginBottom: '2px' }}>
                              {r}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak Ada Role</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: parseInt(usr.disable_user) === 1 ? '#fee2e2' : '#d1fae5',
                          color: parseInt(usr.disable_user) === 1 ? '#ef4444' : '#10b981'
                        }}>
                          {parseInt(usr.disable_user) === 1 ? 'Nonaktif' : 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Menampilkan {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, userDataList.length)} dari {userDataList.length} user
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-input)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Prev
                </button>
                {getPaginationGroup().map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: currentPage === page ? '1px solid #0f766e' : '1px solid var(--border-color)',
                      backgroundColor: currentPage === page ? '#0f766e' : 'var(--bg-input)',
                      color: currentPage === page ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-input)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SELECTED USER FORM PANEL */}
      {selectedUser && (
        <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            <i className="pi pi-pencil"></i> Form Update Role User - {selectedUser.id_user}
          </h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* COLUMN 1 & 2: User Profil Info (Read Only) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', fontWeight: 600 }}>Informasi User</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID User</label>
                  <input
                    type="text"
                    disabled
                    value={selectedUser.id_user}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.03)', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nama Lengkap</label>
                  <input
                    type="text"
                    disabled
                    value={selectedUser.nama_user || ''}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.03)', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kode Unit</label>
                  <input
                    type="text"
                    disabled
                    value={selectedUser.kodeunit || ''}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.03)', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Level User</label>
                  <input
                    type="text"
                    disabled
                    value={selectedUser.leveluser || ''}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.03)', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {/* COLUMN 3: Searchable Multi-Select Dropdown & Document Attachment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', fontWeight: 600 }}>Penugasan Role / Group</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={dropdownRef}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Pilih Role (Multi-select)</label>
                  
                  {/* Dropdown Toggle Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      minHeight: '42px',
                      transition: 'border 0.2s'
                    }}
                  >
                    <span>
                      {selectedRoles.length > 0 
                        ? `${selectedRoles.length} Role Terpilih` 
                        : '-- Pilih Role / Group --'}
                    </span>
                    <i className={isDropdownOpen ? "pi pi-chevron-up" : "pi pi-chevron-down"} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}></i>
                  </button>

                  {/* Dropdown Menu Panel with Search Input */}
                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 100,
                      marginTop: '4px',
                      padding: '8px',
                      maxHeight: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {/* Search input field */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <i className="pi pi-search" style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                        <input
                          type="text"
                          value={roleSearchKeyword}
                          onChange={(e) => setRoleSearchKeyword(e.target.value)}
                          placeholder="Cari role..."
                          style={{
                            width: '100%',
                            padding: '8px 8px 8px 28px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Filtered roles items list */}
                      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {filteredRoles.length > 0 ? (
                          filteredRoles.map(role => {
                            const isChecked = selectedRoles.includes(role.id_group);
                            return (
                              <div
                                key={role.id_group}
                                onClick={() => toggleRoleSelection(role.id_group)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: isChecked ? 'rgba(15, 118, 110, 0.06)' : 'transparent',
                                  transition: 'background-color 0.2s',
                                  userSelect: 'none'
                                }}
                                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'; }}
                                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{role.id_group}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role.nama_group}</span>
                                </div>
                                {isChecked && <i className="pi pi-check" style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: 'bold' }}></i>}
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Tidak ada role yang cocok
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Roles Badges/Chips Container */}
                  {selectedRoles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {selectedRoles.map(roleId => {
                        const label = roleId;
                        return (
                          <span
                            key={roleId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '16px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(15, 118, 110, 0.08)',
                              color: '#0f766e',
                              border: '1px solid rgba(15, 118, 110, 0.15)'
                            }}
                          >
                            {label}
                            <i
                              className="pi pi-times"
                              onClick={() => handleRemoveRole(roleId)}
                              style={{ fontSize: '0.65rem', cursor: 'pointer', hover: { color: '#b91c1c' } }}
                            ></i>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Log File / Supporting Document Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Dokumen Pendukung (Log File) (Opsional)</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setNamaFile(file.name);
                      }
                    }}
                    onClick={() => document.getElementById('role-file-upload').click()}
                    style={{
                      borderRadius: '12px',
                      border: isDragging ? '2px dashed #0f766e' : '2px dashed var(--border-color)',
                      backgroundColor: isDragging ? 'rgba(15, 118, 110, 0.06)' : 'rgba(0, 0, 0, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '16px',
                      textAlign: 'center',
                      minHeight: '100px',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <input 
                      type="file" 
                      id="role-file-upload" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNamaFile(file.name);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <i className="pi pi-cloud-upload" style={{ fontSize: '1.6rem', color: '#0f766e' }}></i>
                    {namaFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>{namaFile}</span>
                        <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <i className="pi pi-check-circle"></i> Loaded
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Drop file support here</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>or click to browse</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* BUTTON CONTROLS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
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
                    <i className="pi pi-spin pi-spinner"></i> Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="pi pi-save"></i> Simpan Perubahan Role
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
