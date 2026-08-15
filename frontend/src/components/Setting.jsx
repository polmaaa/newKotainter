import React, { useState, useEffect } from 'react';

export default function Setting({ user, onCheckConnection, apiBaseUrl, onUpdateSystemSettings, showToast, checkingDb }) {
  const isPrivileged = user && (user.level_user === 'DEVELOPER' || user.level_user === 'SUPERUSER');
  const [activeSubTab, setActiveSubTab] = useState(isPrivileged ? 'general' : 'users');

  // Site config states
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  // 1. Oracle states
  const [oracleTns, setOracleTns] = useState('');
  const [oracleUsername, setOracleUsername] = useState('');
  const [oraclePassword, setOraclePassword] = useState('');
  const [oraclePreset, setOraclePreset] = useState('custom');
  
  // 2. Postgres states
  const [postgresHost, setPostgresHost] = useState('');
  const [postgresPort, setPostgresPort] = useState('5432');
  const [postgresUsername, setPostgresUsername] = useState('');
  const [postgresPassword, setPostgresPassword] = useState('');
  const [postgresDatabase, setPostgresDatabase] = useState('');

  // 3. FSO Oracle states
  const [fsoOracleTns, setFsoOracleTns] = useState('');
  const [fsoOracleUsername, setFsoOracleUsername] = useState('');
  const [fsoOraclePassword, setFsoOraclePassword] = useState('');
  const [fsoOraclePreset, setFsoOraclePreset] = useState('custom');

  // 4. FSO Postgres states
  const [fsoPostgresHost, setFsoPostgresHost] = useState('10.99.20.11');
  const [fsoPostgresPort, setFsoPostgresPort] = useState('5488');
  const [fsoPostgresUsername, setFsoPostgresUsername] = useState('fsm');
  const [fsoPostgresPassword, setFsoPostgresPassword] = useState('fsm@2026');
  const [fsoPostgresDatabase, setFsoPostgresDatabase] = useState('fsm');

  // Accordion & Password toggle states
  const [activeAccordion, setActiveAccordion] = useState(null); // 'oracle', 'postgres', 'fsoOracle', 'fsoPostgres', or null (all closed)
  const toggleAccordion = (key) => {
    setActiveAccordion(prev => prev === key ? null : key);
  };
  const [showOraclePass, setShowOraclePass] = useState(false);
  const [showPostgresPass, setShowPostgresPass] = useState(false);
  const [showFsoOraclePass, setShowFsoOraclePass] = useState(false);
  const [showFsoPostgresPass, setShowFsoPostgresPass] = useState(false);
  const [showModalPass, setShowModalPass] = useState(false);
  const [showSelfPass, setShowSelfPass] = useState(false);

  // User Management states (Superadmin / Developer)
  const [usersList, setUsersList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  // Modal user form states
  const [modalIdUser, setModalIdUser] = useState('');
  const [modalNamaUser, setModalNamaUser] = useState('');
  const [modalLevelUser, setModalLevelUser] = useState('JUNIOR');
  const [modalPasswd, setModalPasswd] = useState('');
  const [modalDisableUser, setModalDisableUser] = useState('N');

  // Self Profile states (Senior, Middle, Junior)
  const [selfIdUser, setSelfIdUser] = useState(user ? user.id_user : '');
  const [selfNamaUser, setSelfNamaUser] = useState(user ? user.nama_user : '');
  const [selfPasswd, setSelfPasswd] = useState('');

  // General loading & saving indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current configs on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        // 1. Load DB & Site Config (Only if privileged)
        if (isPrivileged) {
          const response = await fetch(`${apiBaseUrl}/api/db_config/get_config?_=${Date.now()}`, {
            method: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          const result = await response.json();
          if (response.ok && result.status === 'success') {
            const data = result.data;
            setSiteName(data.site_name || '');
            setSiteDescription(data.site_description || '');
            
            // Oracle
            const oTns = data.oracle_tns || '';
            setOracleTns(oTns);
            setOracleUsername(data.oracle_username || '');
            setOraclePassword(data.oracle_password || '');
            const oTnsLower = oTns.toLowerCase();
            if (oTnsLower.includes('ap2tdr') || oTnsLower.includes('10.14.159.10')) {
              setOraclePreset('truno');
            } else if (oTnsLower.includes('ap2t') || oTnsLower.includes('10.14.158.10')) {
              setOraclePreset('gandul');
            } else {
              setOraclePreset('custom');
            }
            
            // Postgres
            setPostgresHost(data.postgres_host || '');
            setPostgresPort(data.postgres_port ? data.postgres_port.toString() : '5432');
            setPostgresUsername(data.postgres_username || '');
            setPostgresPassword(data.postgres_password || '');
            setPostgresDatabase(data.postgres_database || '');

            // FSO Oracle
            const fsoTns = data.fso_oracle_tns || '';
            setFsoOracleTns(fsoTns);
            setFsoOracleUsername(data.fso_oracle_username || '');
            setFsoOraclePassword(data.fso_oracle_password || '');
            const fsoTnsLower = fsoTns.toLowerCase();
            if (fsoTnsLower.includes('fsodr') || fsoTnsLower.includes('10.14.212.11')) {
              setFsoOraclePreset('truno');
            } else if (fsoTnsLower.includes('fso') || fsoTnsLower.includes('10.14.211.11')) {
              setFsoOraclePreset('gandul');
            } else {
              setFsoOraclePreset('custom');
            }

            // FSO Postgres (fallback to defaults if empty)
            setFsoPostgresHost(data.fso_postgres_host || '10.99.20.11');
            setFsoPostgresPort(data.fso_postgres_port ? data.fso_postgres_port.toString() : '5488');
            setFsoPostgresUsername(data.fso_postgres_username || 'fsm');
            setFsoPostgresPassword(data.fso_postgres_password || 'fsm@2026');
            setFsoPostgresDatabase(data.fso_postgres_database || 'fsm');

          } else {
            setError(result.message || 'Gagal memuat konfigurasi.');
          }

          // Load users list
          await fetchUsers();
        } else {
          // Senior/Middle/Junior: initialize self form from session
          setSelfIdUser(user ? user.id_user : '');
          setSelfNamaUser(user ? user.nama_user : '');
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Gagal terhubung ke API backend.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [apiBaseUrl, isPrivileged, user]);

  // Handle preset selection for Oracle
  const handleOraclePresetChange = (preset) => {
    setOraclePreset(preset);
    if (preset === 'truno') {
      setOracleTns(`(DESCRIPTION=
    (LOAD_BALANCE=yes)
    (ADDRESS_LIST=
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.10)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.11)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.12)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.13)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.14)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.15)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.16)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.159.17)
        (PORT=1521)
      )
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=ap2tdr)
    )
  )`);
      setOracleUsername('POLMASIHOTANG');
      setOraclePassword('P@ssw0rd666');
    } else if (preset === 'gandul') {
      setOracleTns(`(DESCRIPTION=
    (ADDRESS_LIST=
      (LOAD_BALANCE=on)
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.10)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.11)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.12)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.13)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.14)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.15)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.16)
        (PORT=1521)
      )
      (ADDRESS=
        (PROTOCOL=TCP)
        (HOST=10.14.158.17)
        (PORT=1521)
      )
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=ap2t)
    )
  )`);
      setOracleUsername('POLMASIHOTANG');
      setOraclePassword('P@ssw0rd666');
    }
  };

  // Handle preset selection for FSO Oracle
  const handleFsoOraclePresetChange = (preset) => {
    setFsoOraclePreset(preset);
    if (preset === 'truno') {
      setFsoOracleTns(`(DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.14.212.11)(PORT = 1521))
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.14.212.12)(PORT = 1521))
    (LOAD_BALANCE = yes)
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = FSODR)
    )
  )`);
      setFsoOracleUsername('OPHARAPPFSO');
      setFsoOraclePassword('Opharapp@FSO');
    } else if (preset === 'gandul') {
      setFsoOracleTns(`(DESCRIPTION=
    (ADDRESS=
      (PROTOCOL=TCP)
      (HOST=10.14.211.11)
      (PORT=1521)
    )
    (CONNECT_DATA=
      (SERVER=dedicated)
      (SERVICE_NAME=FSO)
    )
  )`);
      setFsoOracleUsername('OPHARAPPFSO');
      setFsoOraclePassword('Opharapp@FSO');
    }
  };

  // Load user list
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/get_users`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setUsersList(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Save General & DB Connection settings
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/db_config/save_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          site_name: siteName,
          site_description: siteDescription,
          
          oracle_tns: oracleTns,
          oracle_username: oracleUsername,
          oracle_password: oraclePassword,
          
          postgres_host: postgresHost,
          postgres_port: parseInt(postgresPort) || 5432,
          postgres_username: postgresUsername,
          postgres_password: postgresPassword,
          postgres_database: postgresDatabase,
          
          fso_oracle_tns: fsoOracleTns,
          fso_oracle_username: fsoOracleUsername,
          fso_oracle_password: fsoOraclePassword,
          
          fso_postgres_host: fsoPostgresHost,
          fso_postgres_port: parseInt(fsoPostgresPort) || 5488,
          fso_postgres_username: fsoPostgresUsername,
          fso_postgres_password: fsoPostgresPassword,
          fso_postgres_database: fsoPostgresDatabase
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setSuccess('Pengaturan sistem dan 4 database berhasil disimpan!');
        if (showToast) {
          showToast('Pengaturan sistem dan 4 database berhasil disimpan!', 'success');
        }
        
        if (onUpdateSystemSettings) {
          onUpdateSystemSettings(siteName, siteDescription);
        }

        if (onCheckConnection) {
          onCheckConnection();
        }
      } else {
        setError(result.message || 'Gagal menyimpan konfigurasi.');
        if (showToast) {
          showToast(result.message || 'Gagal menyimpan konfigurasi.', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Gagal mengirim konfigurasi ke server.');
      if (showToast) {
        showToast('Gagal mengirim konfigurasi ke server.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // User list actions (Superadmin/Developer)
  const openAddUserModal = () => {
    setModalMode('add');
    setModalIdUser('');
    setModalNamaUser('');
    setModalLevelUser('JUNIOR');
    setModalPasswd('');
    setModalDisableUser('N');
    setError('');
    setSuccess('');
    setShowUserModal(true);
  };

  const openEditUserModal = (selectedUser) => {
    setModalMode('edit');
    setModalIdUser(selectedUser.id_user);
    setModalNamaUser(selectedUser.nama_user);
    setModalLevelUser(selectedUser.level_user);
    setModalPasswd('');
    setModalDisableUser(selectedUser.disable_user || 'N');
    setError('');
    setSuccess('');
    setShowUserModal(true);
  };

  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/save_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id_user: modalIdUser,
          nama_user: modalNamaUser,
          level_user: modalLevelUser,
          passwd: modalPasswd,
          disable_user: modalDisableUser
        })
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setSuccess(`User ${modalIdUser} berhasil disimpan!`);
        if (showToast) {
          showToast(`User ${modalIdUser} berhasil disimpan!`, 'success');
        }
        setShowUserModal(false);
        await fetchUsers();
      } else {
        setError(result.message || 'Gagal menyimpan user.');
        if (showToast) {
          showToast(result.message || 'Gagal menyimpan user.', 'error');
        }
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
      if (showToast) {
        showToast('Gagal terhubung ke server.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (idUser) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/toggle_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id_user: idUser })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setSuccess(`Status user ${idUser} berhasil diubah.`);
        if (showToast) {
          showToast(`Status user ${idUser} berhasil diubah.`, 'success');
        }
        await fetchUsers();
      } else {
        setError(result.message || 'Gagal mengubah status.');
        if (showToast) {
          showToast(result.message || 'Gagal mengubah status.', 'error');
        }
      }
    } catch (err) {
      setError('Gagal mengirim perintah ke server.');
      if (showToast) {
        showToast('Gagal mengirim perintah ke server.', 'error');
      }
    }
  };

  const handleDeleteUser = async (idUser) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${idUser} secara permanen dari Oracle?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/users/delete_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id_user: idUser })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setSuccess(`User ${idUser} berhasil dihapus.`);
        if (showToast) {
          showToast(`User ${idUser} berhasil dihapus.`, 'success');
        }
        await fetchUsers();
      } else {
        setError(result.message || 'Gagal menghapus user.');
        if (showToast) {
          showToast(result.message || 'Gagal menghapus user.', 'error');
        }
      }
    } catch (err) {
      setError('Gagal mengirim perintah ke server.');
      if (showToast) {
        showToast('Gagal mengirim perintah ke server.', 'error');
      }
    }
  };

  // Self profile updates (Senior, Middle, Junior)
  const handleSaveSelfProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/update_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id_user: selfIdUser,
          nama_user: selfNamaUser,
          passwd: selfPasswd
        })
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setSuccess('Profil Anda berhasil diperbarui!');
        setSelfPasswd('');
        if (showToast) {
          showToast('Profil Anda berhasil diperbarui!', 'success');
        }
        if (user) {
          user.id_user = selfIdUser;
          user.nama_user = selfNamaUser;
        }
      } else {
        setError(result.message || 'Gagal memperbarui profil.');
        if (showToast) {
          showToast(result.message || 'Gagal memperbarui profil.', 'error');
        }
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
      if (showToast) {
        showToast('Gagal terhubung ke server.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Filter users list based on query
  const filteredUsers = usersList.filter(u => {
    if (!u) return false;
    const nameStr = u.nama_user ? u.nama_user.toString() : '';
    const idStr = u.id_user ? u.id_user.toString() : '';
    const levelStr = u.level_user ? u.level_user.toString() : '';
    return (
      nameStr.toLowerCase().includes(searchVal.toLowerCase()) ||
      idStr.toLowerCase().includes(searchVal.toLowerCase()) ||
      levelStr.toLowerCase().includes(searchVal.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
        Memuat konfigurasi Setting...
      </div>
    );
  }

  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Setting & Konfigurasi Sistem</h2>
        <p className="panel-subtitle">Konfigurasikan informasi umum website, koneksi database, dan pengelolaan akun pengguna.</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '6px', color: '#b91c1c', maxWidth: '800px' }}>
          <i className="pi pi-exclamation-circle" style={{ marginRight: '8px', marginTop: '2px' }}></i>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" style={{ display: 'flex', marginBottom: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#16a34a', maxWidth: '800px' }}>
          <i className="pi pi-check-circle" style={{ marginRight: '8px', marginTop: '2px' }}></i>
          <span>{success}</span>
        </div>
      )}

      {/* Sub Tabs Navigation (Rendered only for Superadmin / Developer) */}
      {isPrivileged ? (
        <div className="sub-tabs-container" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
          <button 
            onClick={() => { setActiveSubTab('general'); setError(''); setSuccess(''); }}
            className={`sub-tab-btn ${activeSubTab === 'general' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              background: activeSubTab === 'general' ? '#0f766e' : 'transparent',
              color: activeSubTab === 'general' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="pi pi-desktop"></i> Profil Sistem
          </button>
          <button 
            onClick={() => { setActiveSubTab('database'); setError(''); setSuccess(''); }}
            className={`sub-tab-btn ${activeSubTab === 'database' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              background: activeSubTab === 'database' ? '#0f766e' : 'transparent',
              color: activeSubTab === 'database' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="pi pi-database"></i> Konfigurasi Database
          </button>
          <button 
            onClick={() => { setActiveSubTab('users'); setError(''); setSuccess(''); }}
            className={`sub-tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              background: activeSubTab === 'users' ? '#0f766e' : 'transparent',
              color: activeSubTab === 'users' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="pi pi-users"></i> Pengaturan User
          </button>
        </div>
      ) : null}

      {/* CONTENT SWITCH AREA */}
      
      {/* 1. GENERAL SITE INFO TAB */}
      {isPrivileged && activeSubTab === 'general' && (
        <div className="content-card" style={{ maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '16px', color: '#0f766e', fontSize: '1.1rem' }}>
            <i className="pi pi-desktop" style={{ marginRight: '8px' }}></i> Informasi Website & Identitas Sistem
          </h3>
          <form onSubmit={handleSaveConfig}>
            <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              <label htmlFor="site-name">Nama Website / Logo Brand</label>
              <input
                type="text"
                id="site-name"
                className="form-input-text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Misal: NewKotainter"
              />
            </div>

            <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
              <label htmlFor="site-desc">Deskripsi / Subtitle Website</label>
              <input
                type="text"
                id="site-desc"
                className="form-input-text"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="Misal: Workspace & REST API Terpadu"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="pi pi-save" style={{ marginRight: '8px' }}></i>
                  Simpan Identitas Sistem
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 2. DATABASE CONFIG TAB */}
      {isPrivileged && activeSubTab === 'database' && (
        <div className="content-card" style={{ maxWidth: '100%' }}>
          <form onSubmit={handleSaveConfig}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              
              {/* Grup 1: Database ORACLE */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div 
                  onClick={() => toggleAccordion('oracle')}
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    borderBottom: activeAccordion === 'oracle' ? '1px solid var(--border-light)' : 'none', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="pi pi-server" style={{ color: 'var(--oracle)', fontSize: '1.1rem' }}></i>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>Database ORACLE (UTAMA)</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: '#e0f2fe', 
                      color: '#0369a1',
                      fontWeight: 500
                    }}>
                      {oraclePreset === 'truno' ? 'Versi Truno' : (oraclePreset === 'gandul' ? 'Versi Gandul' : 'Kustom')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9', padding: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleOraclePresetChange('truno')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: oraclePreset === 'truno' ? '#ffffff' : 'transparent',
                          color: oraclePreset === 'truno' ? '#0f766e' : '#475569',
                          boxShadow: oraclePreset === 'truno' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Truno
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOraclePresetChange('gandul')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: oraclePreset === 'gandul' ? '#ffffff' : 'transparent',
                          color: oraclePreset === 'gandul' ? '#0f766e' : '#475569',
                          boxShadow: oraclePreset === 'gandul' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Gandul
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOraclePresetChange('custom')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: oraclePreset === 'custom' ? '#ffffff' : 'transparent',
                          color: oraclePreset === 'custom' ? '#0f766e' : '#475569',
                          boxShadow: oraclePreset === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Kustom
                      </button>
                    </div>
                    <i 
                      className={`pi ${activeAccordion === 'oracle' ? 'pi-chevron-down' : 'pi-chevron-right'}`} 
                      style={{ color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); toggleAccordion('oracle'); }}
                    />
                  </div>
                </div>
                
                {activeAccordion === 'oracle' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
                    <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="oracle-tns">Oracle TNS Connection String</label>
                      <textarea
                        id="oracle-tns"
                        className="form-input-text"
                        style={{ height: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                        required
                        value={oracleTns}
                        onChange={(e) => { setOracleTns(e.target.value); setOraclePreset('custom'); }}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="oracle-user">Username (Skema)</label>
                      <input
                        type="text"
                        id="oracle-user"
                        className="form-input-text"
                        required
                        value={oracleUsername}
                        onChange={(e) => setOracleUsername(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="oracle-pass">Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showOraclePass ? 'text' : 'password'}
                          id="oracle-pass"
                          className="form-input-text"
                          style={{ paddingRight: '40px', width: '100%' }}
                          required
                          value={oraclePassword}
                          onChange={(e) => setOraclePassword(e.target.value)}
                        />
                        <i 
                          className={`pi ${showOraclePass ? 'pi-eye-slash' : 'pi-eye'}`} 
                          style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                          onClick={() => setShowOraclePass(!showOraclePass)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grup 2: Database POSTGRE */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div 
                  onClick={() => toggleAccordion('postgres')}
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    borderBottom: activeAccordion === 'postgres' ? '1px solid var(--border-light)' : 'none', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="pi pi-server" style={{ color: 'var(--postgres)', fontSize: '1.1rem' }}></i>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>Database POSTGRE (UTAMA)</span>
                  </div>
                  <i className={`pi ${activeAccordion === 'postgres' ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{ color: '#64748b', fontSize: '0.85rem' }}></i>
                </div>

                {activeAccordion === 'postgres' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
                    <div className="form-row">
                      <label htmlFor="pg-host">Host / IP Address</label>
                      <input
                        type="text"
                        id="pg-host"
                        className="form-input-text"
                        required
                        value={postgresHost}
                        onChange={(e) => setPostgresHost(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="pg-port">Port</label>
                      <input
                        type="number"
                        id="pg-port"
                        className="form-input-text"
                        required
                        value={postgresPort}
                        onChange={(e) => setPostgresPort(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="pg-db">Database Name</label>
                      <input
                        type="text"
                        id="pg-db"
                        className="form-input-text"
                        required
                        value={postgresDatabase}
                        onChange={(e) => setPostgresDatabase(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="pg-user">Username</label>
                      <input
                        type="text"
                        id="pg-user"
                        className="form-input-text"
                        required
                        value={postgresUsername}
                        onChange={(e) => setPostgresUsername(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="pg-pass">Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showPostgresPass ? 'text' : 'password'}
                          id="pg-pass"
                          className="form-input-text"
                          style={{ paddingRight: '40px', width: '100%' }}
                          value={postgresPassword}
                          onChange={(e) => setPostgresPassword(e.target.value)}
                        />
                        <i 
                          className={`pi ${showPostgresPass ? 'pi-eye-slash' : 'pi-eye'}`} 
                          style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                          onClick={() => setShowPostgresPass(!showPostgresPass)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Grup 3: Database FSO ORACLE */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div 
                  onClick={() => toggleAccordion('fsoOracle')}
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    borderBottom: activeAccordion === 'fsoOracle' ? '1px solid var(--border-light)' : 'none', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="pi pi-server" style={{ color: '#047857', fontSize: '1.1rem' }}></i>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>Database FSO ORACLE</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: '#d1fae5', 
                      color: '#065f46',
                      fontWeight: 500
                    }}>
                      {fsoOraclePreset === 'truno' ? 'Versi Truno' : (fsoOraclePreset === 'gandul' ? 'Versi Gandul' : 'Kustom')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9', padding: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleFsoOraclePresetChange('truno')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: fsoOraclePreset === 'truno' ? '#ffffff' : 'transparent',
                          color: fsoOraclePreset === 'truno' ? '#065f46' : '#475569',
                          boxShadow: fsoOraclePreset === 'truno' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Truno
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFsoOraclePresetChange('gandul')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: fsoOraclePreset === 'gandul' ? '#ffffff' : 'transparent',
                          color: fsoOraclePreset === 'gandul' ? '#065f46' : '#475569',
                          boxShadow: fsoOraclePreset === 'gandul' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Gandul
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFsoOraclePresetChange('custom')}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: fsoOraclePreset === 'custom' ? '#ffffff' : 'transparent',
                          color: fsoOraclePreset === 'custom' ? '#065f46' : '#475569',
                          boxShadow: fsoOraclePreset === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        Kustom
                      </button>
                    </div>
                    <i 
                      className={`pi ${activeAccordion === 'fsoOracle' ? 'pi-chevron-down' : 'pi-chevron-right'}`} 
                      style={{ color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); toggleAccordion('fsoOracle'); }}
                    />
                  </div>
                </div>

                {activeAccordion === 'fsoOracle' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
                    <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="fso-oracle-tns">FSO Oracle TNS Connection String</label>
                      <textarea
                        id="fso-oracle-tns"
                        className="form-input-text"
                        style={{ height: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                        required
                        value={fsoOracleTns}
                        onChange={(e) => { setFsoOracleTns(e.target.value); setFsoOraclePreset('custom'); }}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-oracle-user">Username</label>
                      <input
                        type="text"
                        id="fso-oracle-user"
                        className="form-input-text"
                        required
                        value={fsoOracleUsername}
                        onChange={(e) => setFsoOracleUsername(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-oracle-pass">Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showFsoOraclePass ? 'text' : 'password'}
                          id="fso-oracle-pass"
                          className="form-input-text"
                          style={{ paddingRight: '40px', width: '100%' }}
                          required
                          value={fsoOraclePassword}
                          onChange={(e) => setFsoOraclePassword(e.target.value)}
                        />
                        <i 
                          className={`pi ${showFsoOraclePass ? 'pi-eye-slash' : 'pi-eye'}`} 
                          style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                          onClick={() => setShowFsoOraclePass(!showFsoOraclePass)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grup 4: Database FSO POSTGRE */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div 
                  onClick={() => toggleAccordion('fsoPostgres')}
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f8fafc', 
                    borderBottom: activeAccordion === 'fsoPostgres' ? '1px solid var(--border-light)' : 'none', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="pi pi-server" style={{ color: '#0f766e', fontSize: '1.1rem' }}></i>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>Database FSO POSTGRE</span>
                  </div>
                  <i className={`pi ${activeAccordion === 'fsoPostgres' ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{ color: '#64748b', fontSize: '0.85rem' }}></i>
                </div>

                {activeAccordion === 'fsoPostgres' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
                    <div className="form-row">
                      <label htmlFor="fso-pg-host">Host / IP Address</label>
                      <input
                        type="text"
                        id="fso-pg-host"
                        className="form-input-text"
                        required
                        value={fsoPostgresHost}
                        onChange={(e) => setFsoPostgresHost(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-pg-port">Port</label>
                      <input
                        type="number"
                        id="fso-pg-port"
                        className="form-input-text"
                        required
                        value={fsoPostgresPort}
                        onChange={(e) => setFsoPostgresPort(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-pg-db">Database Name</label>
                      <input
                        type="text"
                        id="fso-pg-db"
                        className="form-input-text"
                        required
                        value={fsoPostgresDatabase}
                        onChange={(e) => setFsoPostgresDatabase(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-pg-user">Username</label>
                      <input
                        type="text"
                        id="fso-pg-user"
                        className="form-input-text"
                        required
                        value={fsoPostgresUsername}
                        onChange={(e) => setFsoPostgresUsername(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="fso-pg-pass">Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showFsoPostgresPass ? 'text' : 'password'}
                          id="fso-pg-pass"
                          className="form-input-text"
                          required
                          value={fsoPostgresPassword}
                          onChange={(e) => setFsoPostgresPassword(e.target.value)}
                        />
                        <i 
                          className={`pi ${showFsoPostgresPass ? 'pi-eye-slash' : 'pi-eye'}`} 
                          style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                          onClick={() => setShowFsoPostgresPass(!showFsoPostgresPass)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="pi pi-save" style={{ marginRight: '8px' }}></i>
                    Simpan Semua Database
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={onCheckConnection} disabled={checkingDb || saving}>
                {checkingDb ? (
                  <>
                    <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <i className="pi pi-wifi" style={{ marginRight: '8px' }}></i>
                    Cek Koneksi Aktif
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. USER MANAGEMENT TAB (Superadmin / Developer) */}
      {isPrivileged && activeSubTab === 'users' && (
        <div>
          <div className="filter-toolbar" style={{ marginBottom: '16px' }}>
            <div className="filter-group">
              <div className="search-wrapper">
                <i className="pi pi-search"></i>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Cari user, unit, level..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={openAddUserModal}>
              <i className="pi pi-plus" style={{ marginRight: '8px' }}></i> Tambah User Baru
            </button>
          </div>

          <div className="content-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Username (ID User)</th>
                    <th>Nama Lengkap</th>
                    <th>Level Akses</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        Tidak ada data pengguna yang terdaftar di Oracle.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id_user}>
                        <td><strong>{u.id_user}</strong></td>
                        <td>{u.nama_user}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: u.level_user === 'DEVELOPER' ? '#7c3aed' : u.level_user === 'SUPERUSER' ? '#ea580c' : '#4b5563' }}>
                            {u.level_user}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.disable_user === 'Y' ? 'badge-error' : 'badge-success'}`}>
                            {u.disable_user === 'Y' ? 'NON-AKTIF' : 'AKTIF'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn-action" 
                            onClick={() => openEditUserModal(u)} 
                            title="Edit User"
                            style={{ color: 'var(--primary)' }}
                          >
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button 
                            className="btn-action" 
                            onClick={() => handleToggleUserStatus(u.id_user)} 
                            title="Ubah Status Aktif"
                            style={{ color: '#d97706' }}
                          >
                            <i className="pi pi-refresh"></i>
                          </button>
                          <button 
                            className="btn-action" 
                            style={{ color: 'var(--error)' }} 
                            onClick={() => handleDeleteUser(u.id_user)} 
                            title="Hapus User"
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Form Modal */}
          {showUserModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="modal-content" style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#0f766e' }}>
                    {modalMode === 'add' ? 'Tambah User Baru' : `Edit User ${modalIdUser}`}
                  </h3>
                  <button 
                    onClick={() => setShowUserModal(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSaveUserSubmit}>
                  <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <label htmlFor="modal-id">Username (ID USER)</label>
                    <input
                      type="text"
                      id="modal-id"
                      className="form-input-text"
                      required
                      disabled={modalMode === 'edit'}
                      value={modalIdUser}
                      onChange={(e) => setModalIdUser(e.target.value)}
                      placeholder="Contoh: PS.PUSAT.NAMA"
                    />
                  </div>

                  <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <label htmlFor="modal-name">Nama Lengkap</label>
                    <input
                      type="text"
                      id="modal-name"
                      className="form-input-text"
                      required
                      value={modalNamaUser}
                      onChange={(e) => setModalNamaUser(e.target.value)}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <label htmlFor="modal-level">Level User / Hak Akses</label>
                    <select
                      id="modal-level"
                      className="form-input-text"
                      style={{ height: '36px', padding: '0 8px' }}
                      value={modalLevelUser}
                      onChange={(e) => setModalLevelUser(e.target.value)}
                    >
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="SUPERUSER">SUPERUSER</option>
                      <option value="SENIOR">SENIOR</option>
                      <option value="MIDDLE">MIDDLE</option>
                      <option value="JUNIOR">JUNIOR</option>
                    </select>
                  </div>

                  <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <label htmlFor="modal-passwd">
                      {modalMode === 'add' ? 'Password' : 'Password Baru (Kosongkan jika tidak diubah)'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showModalPass ? 'text' : 'password'}
                        id="modal-passwd"
                        className="form-input-text"
                        style={{ paddingRight: '40px', width: '100%' }}
                        required={modalMode === 'add'}
                        value={modalPasswd}
                        onChange={(e) => setModalPasswd(e.target.value)}
                      />
                      <i 
                        className={`pi ${showModalPass ? 'pi-eye-slash' : 'pi-eye'}`} 
                        style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                        onClick={() => setShowModalPass(!showModalPass)}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <input
                      type="checkbox"
                      id="modal-disable"
                      checked={modalDisableUser === 'Y'}
                      onChange={(e) => setModalDisableUser(e.target.checked ? 'Y' : 'N')}
                    />
                    <label htmlFor="modal-disable">Nonaktifkan User (DISABLE_USER = Y)</label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)} disabled={saving}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan User'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SELF USER SETTINGS (Senior, Middle, Junior) */}
      {!isPrivileged && (
        <div className="content-card" style={{ maxWidth: '500px' }}>
          <h3 style={{ marginBottom: '16px', color: '#0f766e', fontSize: '1.1rem' }}>
            <i className="pi pi-user-edit" style={{ marginRight: '8px' }}></i> Pengaturan Profil Mandiri
          </h3>
          <form onSubmit={handleSaveSelfProfile}>
            <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              <label htmlFor="self-id">Username (ID USER)</label>
              <input
                type="text"
                id="self-id"
                className="form-input-text"
                required
                value={selfIdUser}
                onChange={(e) => setSelfIdUser(e.target.value)}
              />
            </div>

            <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              <label htmlFor="self-name">Nama Lengkap</label>
              <input
                type="text"
                id="self-name"
                className="form-input-text"
                required
                value={selfNamaUser}
                onChange={(e) => setSelfNamaUser(e.target.value)}
              />
            </div>

            <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
              <label htmlFor="self-passwd">Password Baru (Kosongkan jika tidak ingin diubah)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showSelfPass ? 'text' : 'password'}
                  id="self-passwd"
                  className="form-input-text"
                  style={{ paddingRight: '40px', width: '100%' }}
                  value={selfPasswd}
                  onChange={(e) => setSelfPasswd(e.target.value)}
                />
                <i 
                  className={`pi ${showSelfPass ? 'pi-eye-slash' : 'pi-eye'}`} 
                  style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                  onClick={() => setShowSelfPass(!showSelfPass)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="pi pi-save" style={{ marginRight: '8px' }}></i>
                  Simpan Profil Saya
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
