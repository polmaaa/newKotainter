import React, { useState } from 'react';

export default function UbahKodeUnit({ user, apiBaseUrl, showToast, isPostgres = false, menuName = "Ubah Kode Unit" }) {
  const [searchIdUser, setSearchIdUser] = useState('');
  const [searchUnitup, setSearchUnitup] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Current search result
  const [userDataList, setUserDataList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit Form Fields
  const [kodeUnitBaru, setKodeUnitBaru] = useState('');
  const [levelUserBaru, setLevelUserBaru] = useState('');
  const [namaFile, setNamaFile] = useState('');

  const dbPrefix = isPostgres ? 'api/UbahKodeUnit_pg' : 'api/UbahKodeUnit';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchIdUser.trim() && !searchUnitup.trim()) {
      showToast('Masukkan ID User atau Kode Unit pencarian terlebih dahulu!', 'warning');
      return;
    }

    setLoading(true);
    setUserDataList([]);
    setSelectedUser(null);
    try {
      const url = `${apiBaseUrl}/${dbPrefix}/get_data?id_user=${encodeURIComponent(searchIdUser.trim())}&unitup=${encodeURIComponent(searchUnitup.trim())}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setUserDataList(result.data || []);
        showToast(`Berhasil menemukan ${result.data.length} user!`, 'success');
        
        // Auto-select first result if only one found
        if (result.data.length === 1) {
          handleSelectUser(result.data[0]);
        }
      } else {
        showToast(result.message || 'Data user tidak ditemukan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data dari server API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (usr) => {
    setSelectedUser(usr);
    setKodeUnitBaru(usr.kodeunit || '');
    setLevelUserBaru(usr.leveluser || '');
    setNamaFile('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Silakan cari dan pilih user terlebih dahulu!', 'warning');
      return;
    }
    if (!kodeUnitBaru.trim()) {
      showToast('Kode Unit Baru wajib diisi!', 'warning');
      return;
    }
    if (!levelUserBaru.trim()) {
      showToast('Level User wajib diisi!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id_user: selectedUser.id_user,
          kode_unit: kodeUnitBaru.trim(),
          leveluser: levelUserBaru.trim(),
          nama_file: namaFile.trim()
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Kode unit berhasil diperbarui!', 'success');
        
        // Update local state
        const updatedUser = {
          ...selectedUser,
          kodeunit: kodeUnitBaru.trim(),
          leveluser: levelUserBaru.trim()
        };
        setSelectedUser(updatedUser);
        setUserDataList(prev => prev.map(u => u.id_user === updatedUser.id_user ? updatedUser : u));
      } else {
        showToast(result.message || 'Gagal memperbarui kode unit.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ubah-kode-unit-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title area */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-user-edit" style={{ color: '#0f766e' }}></i> {menuName}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pencarian data profil user, perubahan kode unit kerja (unitup), dan level otorisasi akses menggunakan koneksi {dbLabel}.
          </p>
        </div>
        <span style={{ 
          padding: '6px 12px', 
          backgroundColor: isPostgres ? '#1e3a8a' : '#115e59', 
          color: '#ffffff', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 600 
        }}>
          Mode DB: {dbLabel}
        </span>
      </div>

      {/* Search card */}
      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="search-iduser" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>ID User</label>
            <input
              type="text"
              id="search-iduser"
              placeholder="Contoh: PS.PUSAT.POLMA"
              value={searchIdUser}
              onChange={(e) => setSearchIdUser(e.target.value)}
              disabled={loading || saving}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="search-unitup" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Kode Unit (Unitup)</label>
            <input
              type="text"
              id="search-unitup"
              placeholder="Contoh: 54110"
              value={searchUnitup}
              onChange={(e) => setSearchUnitup(e.target.value)}
              disabled={loading || saving}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', height: '42px', flexShrink: 0 }}
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner"></i> Searching...
              </>
            ) : (
              <>
                <i className="pi pi-search"></i> Cari User
              </>
            )}
          </button>
        </form>
      </div>

      {/* Grid of Results & Form */}
      {userDataList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* User Results Table */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <i className="pi pi-users"></i> Daftar Hasil Pencarian User
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(15, 118, 110, 0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Aksi</th>
                    <th style={{ padding: '10px 14px' }}>ID User</th>
                    <th style={{ padding: '10px 14px' }}>Nama Lengkap</th>
                    <th style={{ padding: '10px 14px' }}>Kode Unit</th>
                    <th style={{ padding: '10px 14px' }}>Level User</th>
                    <th style={{ padding: '10px 14px' }}>Role</th>
                    <th style={{ padding: '10px 14px' }}>Status Akun</th>
                  </tr>
                </thead>
                <tbody>
                  {userDataList.map((usr) => {
                    const isSelected = selectedUser && selectedUser.id_user === usr.id_user;
                    const statusText = usr.disable_user === 0 || usr.disable_user === '0' ? 'Aktif' : 'Nonaktif';
                    const statusColor = usr.disable_user === 0 || usr.disable_user === '0' ? '#10b981' : '#ef4444';
                    return (
                      <tr 
                        key={usr.id_user} 
                        style={{ 
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.08)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            type="button"
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleSelectUser(usr)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            {isSelected ? 'Terpilih' : 'Pilih'}
                          </button>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{usr.id_user}</td>
                        <td style={{ padding: '10px 14px' }}>{usr.nama_user}</td>
                        <td style={{ padding: '10px 14px' }}>{usr.kodeunit}</td>
                        <td style={{ padding: '10px 14px' }}>{usr.leveluser}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{usr.role || '-'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: statusColor + '20', color: statusColor }}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Pembaruan Unit */}
          {selectedUser && (
            <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                <i className="pi pi-pencil"></i> Form Ubah Kode Unit Kerja - {selectedUser.id_user}
              </h3>
              
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Kode Unit Baru</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={kodeUnitBaru}
                      onChange={(e) => setKodeUnitBaru(e.target.value)}
                      placeholder="Masukkan Kode Unit (e.g. 54210)"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Level User Baru</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {['UPI', 'AP', 'UP', 'PUSAT'].map((level) => {
                        const isSelected = levelUserBaru === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setLevelUserBaru(level)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 20px',
                              borderRadius: '24px',
                              border: isSelected ? '1px solid #0f766e' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-input)',
                              color: isSelected ? '#0f766e' : 'var(--text-main)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                          >
                            <i className={isSelected ? "pi pi-check-circle" : "pi pi-circle"} style={{ fontSize: '0.9rem', color: isSelected ? '#0f766e' : '#94a3b8' }}></i>
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Dokumen Pendukung (Log)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label 
                        htmlFor="file-upload-supporting" 
                        style={{ 
                          padding: '10px 16px', 
                          borderRadius: '8px', 
                          border: '1px dashed #0f766e', 
                          backgroundColor: 'rgba(15, 118, 110, 0.03)', 
                          color: '#0f766e', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="pi pi-upload"></i> Pilih File
                      </label>
                      <input 
                        type="file" 
                        id="file-upload-supporting" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setNamaFile(file.name);
                          }
                        }}
                        style={{ display: 'none' }} 
                      />
                      <span style={{ fontSize: '0.85rem', color: namaFile ? 'var(--text-main)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                        {namaFile || 'Belum ada file terpilih'}
                      </span>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
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
                        <i className="pi pi-save"></i> Simpan Perubahan Kode Unit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
