import React, { useState, useEffect } from 'react';

export default function CrmUpdateRole({ user, apiBaseUrl, showToast, isPostgres = true, menuName = 'Update Role CRM' }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userData, setUserData] = useState(null);

  // Form inputs
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [noTiket, setNoTiket] = useState('');
  const [saving, setSaving] = useState(false);

  const dbPrefix = 'api/Crm_update_role';

  // Load crm roles on mount
  useEffect(() => {
    const fetchCrmRoles = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_roles`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setAvailableRoles(result.data || []);
        } else {
          showToast(result.message || 'Gagal memuat list role CRM.', 'error');
        }
      } catch (err) {
        console.error('Gagal memuat role CRM:', err);
      }
    };
    fetchCrmRoles();
  }, [apiBaseUrl]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Identifier (User ID / Email) wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    setUserData(null);
    setSearched(false);
    setSelectedRoleId('');

    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_user?identifier=${encodeURIComponent(identifier.trim())}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setUserData(result.data);
        setSelectedRoleId(result.data.role_id !== null && result.data.role_id !== undefined ? result.data.role_id.toString() : '');
        showToast(result.message || 'User CRM berhasil ditemukan.', 'success');
      } else {
        showToast(result.message || 'User CRM tidak ditemukan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userData) return;
    if (selectedRoleId === '') {
      showToast('Role Baru wajib dipilih!', 'warning');
      return;
    }
    if (!noTiket.trim()) {
      showToast('Nomor Tiket wajib diisi!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save_role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          identifier: userData.user_id,
          role_id: parseInt(selectedRoleId),
          no_tiket: noTiket.trim()
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Role user CRM berhasil diperbarui!', 'success');
        setUserData(prev => ({ ...prev, role_id: parseInt(selectedRoleId) }));
        setNoTiket('');
      } else {
        showToast(result.message || 'Gagal memperbarui role user.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleName = (roleId) => {
    const role = availableRoles.find(r => r.id.toString() === (roleId !== null && roleId !== undefined ? roleId.toString() : ''));
    return role ? role.name : `ROLE ID: ${roleId}`;
  };

  return (
    <div className="crm-role-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-key" style={{ color: '#0f766e' }}></i> {menuName}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mengubah dan memperbarui tingkatan hak akses (role_id) user CRM pada PostgreSQL.
          </p>
        </div>
        <span style={{ 
          padding: '6px 12px', 
          backgroundColor: '#1e3a8a', 
          color: '#ffffff', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 600 
        }}>
          Mode DB: PostgreSQL (CRM)
        </span>
      </div>

      {/* Search panel */}
      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="crm-identifier" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>User ID / User ID AP2T / Email</label>
            <input
              type="text"
              id="crm-identifier"
              placeholder="Masukkan User ID, AP2T ID, atau Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px'
            }}
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner"></i> Mencari...
              </>
            ) : (
              <>
                <i className="pi pi-search"></i> Cari User
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Form (Render when user found) */}
      {searched && !loading && userData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* User Details card */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="pi pi-user"></i> Profil User CRM
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>User ID</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userData.user_id || '-'}</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>User ID AP2T</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userData.user_id_ap2t || '-'}</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Nama User</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userData.fullname || '-'}</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userData.email || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Role Aktif Saat Ini</span>
                <span style={{ fontWeight: 600, color: '#0f766e', fontSize: '1.05rem' }}>{getRoleName(userData.role_id)}</span>
              </div>
            </div>
          </div>

          {/* Action form card */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="pi pi-pencil"></i> Proses Update Role
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Nomor Tiket</label>
                <input
                  type="text"
                  placeholder="Masukkan Nomor Tiket / Nota Dinas"
                  value={noTiket}
                  onChange={(e) => setNoTiket(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Pilih Role Baru</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    width: '100%'
                  }}
                >
                  <option value="">-- Pilih Role CRM --</option>
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id.toString()}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  marginTop: '8px'
                }}
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
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
