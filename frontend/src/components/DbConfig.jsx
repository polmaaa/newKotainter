import React from 'react';

export default function DbConfig({ onCheckConnection }) {
  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Pengaturan Database Campuran</h2>
        <p className="panel-subtitle">Konfigurasikan koneksi data untuk database Oracle dan PostgreSQL yang digunakan dalam sistem NewKotainter.</p>
      </div>

      <div className="content-card" style={{ maxWidth: '800px' }}>
        <form id="form-db-config" className="flex flex-column gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '20px' }}>
            {/* Oracle Config */}
            <div style={{ borderRight: '1px solid var(--border-light)', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ marginBottom: '4px', color: 'var(--oracle)', fontSize: '1rem' }}>
                <i className="pi pi-server" style={{ marginRight: '8px' }}></i> Database Oracle
              </h3>
              <div className="form-row">
                <label>Hosts Cluster</label>
                <input type="text" className="form-input-text" value="10.14.159.10 - 17" required readOnly />
              </div>
              <div className="form-row">
                <label>Port</label>
                <input type="text" className="form-input-text" value="1521" required readOnly />
              </div>
              <div className="form-row">
                <label>Service Name (TNS)</label>
                <input type="text" className="form-input-text" value="ap2tdr (Load Balanced)" required readOnly />
              </div>
              <div className="form-row">
                <label>Username (Skema)</label>
                <input type="text" className="form-input-text" value="DTKS" required readOnly />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input type="password" className="form-input-text" value="********" required readOnly />
              </div>
            </div>
            
            {/* PostgreSQL Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ marginBottom: '4px', color: 'var(--postgres)', fontSize: '1rem' }}>
                <i className="pi pi-server" style={{ marginRight: '8px' }}></i> Database PostgreSQL
              </h3>
              <div className="form-row">
                <label>Host / IP Address</label>
                <input type="text" className="form-input-text" value="10.1.50.167" required readOnly />
              </div>
              <div className="form-row">
                <label>Port</label>
                <input type="text" className="form-input-text" value="5432" required readOnly />
              </div>
              <div className="form-row">
                <label>Database Name</label>
                <input type="text" className="form-input-text" value="ap2t_db" required readOnly />
              </div>
              <div className="form-row">
                <label>Username</label>
                <input type="text" className="form-input-text" value="dev_ap2t" required readOnly />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input type="password" className="form-input-text" value="********" required readOnly />
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => alert('Konfigurasi database dikunci di dalam backend database.php untuk keamanan.')}
            >
              <i className="pi pi-lock" style={{ marginRight: '8px' }}></i> Konfigurasi Dikunci
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
