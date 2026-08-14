import React from 'react';

export default function Help() {
  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Pusat Bantuan & FAQ</h2>
        <p className="panel-subtitle">Temukan informasi bantuan seputar penggunaan sistem NewKotainter.</p>
      </div>
      
      <div className="content-card">
        <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>
          <i className="pi pi-question-circle" style={{ marginRight: '8px' }}></i> Pertanyaan Sering Diajukan (FAQ)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>1. Bagaimana cara kerja database campuran di NewKotainter?</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sistem ini secara bersamaan terhubung ke database Oracle (untuk data transaksi/legacy) dan PostgreSQL (untuk data pendukung/log lokal). Modul API diatur agar dapat mengalihkan query kueri secara otomatis ke database target yang sesuai.
            </p>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>2. Bagaimana cara melihat detail query log SQL?</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Buka tab Dashboard utama, temukan log yang diinginkan di tabel, lalu klik tombol bergambar mata (<i className="pi pi-eye" style={{ color: 'var(--primary)' }}></i>) di kolom Aksi. Dialog detail log query akan terbuka secara instan.
            </p>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>3. Apakah saya bisa menambahkan data user baru?</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Ya, Anda dapat masuk ke sub-menu "User New AP2T" (di bawah Manajemen User) lalu klik tombol "Tambah User" untuk menambah data pengguna secara dinamis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
