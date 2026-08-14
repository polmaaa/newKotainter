import React, { useState, useEffect } from 'react';

export default function DbConfig({ onCheckConnection, apiBaseUrl }) {
  const [oracleTns, setOracleTns] = useState('');
  const [oracleUsername, setOracleUsername] = useState('');
  const [oraclePassword, setOraclePassword] = useState('');
  
  const [postgresHost, setPostgresHost] = useState('');
  const [postgresPort, setPostgresPort] = useState('5432');
  const [postgresUsername, setPostgresUsername] = useState('');
  const [postgresPassword, setPostgresPassword] = useState('');
  const [postgresDatabase, setPostgresDatabase] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/db_config/get_config`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          const data = result.data;
          setOracleTns(data.oracle_tns || '');
          setOracleUsername(data.oracle_username || '');
          setOraclePassword(data.oracle_password || '');
          
          setPostgresHost(data.postgres_host || '');
          setPostgresPort(data.postgres_port ? data.postgres_port.toString() : '5432');
          setPostgresUsername(data.postgres_username || '');
          setPostgresPassword(data.postgres_password || '');
          setPostgresDatabase(data.postgres_database || '');
        } else {
          setError(result.message || 'Gagal memuat konfigurasi database.');
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Gagal terhubung ke API backend.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [apiBaseUrl]);

  const handleSave = async (e) => {
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
          oracle_tns: oracleTns,
          oracle_username: oracleUsername,
          oracle_password: oraclePassword,
          postgres_host: postgresHost,
          postgres_port: parseInt(postgresPort) || 5432,
          postgres_username: postgresUsername,
          postgres_password: postgresPassword,
          postgres_database: postgresDatabase
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setSuccess('Konfigurasi database.php berhasil diperbarui!');
        alert('Konfigurasi database.php berhasil diperbarui! Menjalankan tes koneksi otomatis...');
        if (onCheckConnection) {
          onCheckConnection();
        }
      } else {
        setError(result.message || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Gagal mengirim konfigurasi ke server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
        Memuat konfigurasi database dari database.php...
      </div>
    );
  }

  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Pengaturan Database Campuran</h2>
        <p className="panel-subtitle">Konfigurasikan koneksi data untuk database Oracle dan PostgreSQL yang digunakan dalam sistem NewKotainter.</p>
      </div>

      <div className="content-card" style={{ maxWidth: '800px' }}>
        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '6px', color: '#b91c1c' }}>
            <i className="pi pi-exclamation-circle" style={{ marginRight: '8px', marginTop: '2px' }}></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{ display: 'flex', marginBottom: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#16a34a' }}>
            <i className="pi pi-check-circle" style={{ marginRight: '8px', marginTop: '2px' }}></i>
            <span>{success}</span>
          </div>
        )}

        <form id="form-db-config" onSubmit={handleSave}>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '20px' }}>
            {/* Oracle Config */}
            <div style={{ borderRight: '1px solid var(--border-light)', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ marginBottom: '4px', color: 'var(--oracle)', fontSize: '1rem' }}>
                <i className="pi pi-server" style={{ marginRight: '8px' }}></i> Database Oracle
              </h3>
              
              <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="oracle-tns">Oracle TNS Connection String / Host</label>
                <textarea
                  id="oracle-tns"
                  className="form-input-text"
                  style={{ height: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  required
                  value={oracleTns}
                  onChange={(e) => setOracleTns(e.target.value)}
                  placeholder="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.14.159.10)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=ap2tdr)))"
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
                <input
                  type="text"
                  id="oracle-pass"
                  className="form-input-text"
                  required
                  value={oraclePassword}
                  onChange={(e) => setOraclePassword(e.target.value)}
                />
              </div>
            </div>
            
            {/* PostgreSQL Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ marginBottom: '4px', color: 'var(--postgres)', fontSize: '1rem' }}>
                <i className="pi pi-server" style={{ marginRight: '8px' }}></i> Database PostgreSQL
              </h3>

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
                <input
                  type="text"
                  id="pg-pass"
                  className="form-input-text"
                  value={postgresPassword}
                  onChange={(e) => setPostgresPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="pi pi-save" style={{ marginRight: '8px' }}></i>
                  Simpan Perubahan
                </>
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onCheckConnection}
            >
              <i className="pi pi-wifi" style={{ marginRight: '8px' }}></i> Cek Koneksi Aktif
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
