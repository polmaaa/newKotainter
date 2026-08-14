import React, { useState } from 'react';

export default function UsersGrid() {
  const [users, setUsers] = useState([
    { id: '1', username: 'polma_sihotang', nama: 'POLMA SIHOTANG', unit: 'DIVISI SISTEM INFORMASI', status: 'AKTIF' },
    { id: '2', username: 'lutfi_wirayuda', nama: 'LUTFI INDIARTO WIRAYUDA', unit: 'DIVISI INFRASTRUKTUR', status: 'AKTIF' },
    { id: '3', username: 'idham_sapala', nama: 'IDHAM RIZKY SAPALA', unit: 'UP3 BANDUNG', status: 'AKTIF' },
    { id: '4', username: 'akses_pembantu', nama: 'PEMBANTU SISTEM', unit: 'UP3 BEKASI', status: 'AKTIF' }
  ]);
  const [searchVal, setSearchVal] = useState('');

  const handleAddUser = () => {
    const username = prompt("Masukkan Username:");
    const nama = prompt("Masukkan Nama Lengkap:");
    const unit = prompt("Masukkan Unit Kerja:");
    if (username && nama && unit) {
      const newId = (users.length + 1).toString();
      setUsers(prev => [
        ...prev,
        { id: newId, username, nama, unit, status: 'AKTIF' }
      ]);
    }
  };

  const handleToggleStatus = (id) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'AKTIF' ? 'NON-AKTIF' : 'AKTIF' } : u
    ));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const nameStr = u.nama ? u.nama.toString() : '';
    const usernameStr = u.username ? u.username.toString() : '';
    const unitStr = u.unit ? u.unit.toString() : '';
    
    return (
      nameStr.toLowerCase().includes(searchVal.toLowerCase()) ||
      usernameStr.toLowerCase().includes(searchVal.toLowerCase()) ||
      unitStr.toLowerCase().includes(searchVal.toLowerCase())
    );
  });

  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Manajemen User New AP2T</h2>
        <p className="panel-subtitle">Kelola otorisasi hak akses pengguna sistem NewKotainter terpadu.</p>
      </div>

      <div className="filter-toolbar">
        <div className="filter-group">
          <div className="search-wrapper">
            <i className="pi pi-search"></i>
            <input
              type="text"
              className="input-text"
              placeholder="Cari user, unit..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <i className="pi pi-plus"></i> Tambah User Baru
        </button>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="log-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Unit Kerja</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Tidak ada data pengguna yang cocok.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><strong>{user.username}</strong></td>
                    <td>{user.nama}</td>
                    <td>{user.unit}</td>
                    <td>
                      <span className={`badge ${user.status === 'AKTIF' ? 'badge-success' : 'badge-error'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-action" 
                        onClick={() => handleToggleStatus(user.id)} 
                        title="Ubah Status"
                      >
                        <i className="pi pi-refresh"></i>
                      </button>
                      <button 
                        className="btn-action" 
                        style={{ color: 'var(--error)' }} 
                        onClick={() => handleDeleteUser(user.id)} 
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
    </div>
  );
}
