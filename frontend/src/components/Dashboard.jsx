import React, { useState, useEffect } from 'react';

export default function Dashboard({ logs, loading, onRefresh, onViewDetails }) {
  const [searchVal, setSearchVal] = useState('');
  const [dbVal, setDbVal] = useState('');
  const [statusVal, setStatusVal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const rowsPerPage = 5;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, dbVal, statusVal]);

  // Apply filters
  const filteredData = logs.filter(log => {
    const matchesSearch = 
      (log.no_tiket || '').toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      (log.no_pelanggan || '').toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      (log.jenis_transaksi || '').toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      (log.petugas || '').toLowerCase().includes(searchVal.toLowerCase().trim());
    
    const matchesDb = dbVal === '' || log.database === dbVal;
    const matchesStatus = statusVal === '' || log.status === statusVal;
    
    return matchesSearch && matchesDb && matchesStatus;
  });

  // Apply sorting
  const sortedData = [...filteredData];
  if (sortKey) {
    sortedData.sort((a, b) => {
      let valA = (a[sortKey] || '').toString().toLowerCase();
      let valB = (b[sortKey] || '').toString().toLowerCase();
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Stats calculation
  const totalLogs = filteredData.length;
  const oracleLogs = filteredData.filter(l => l.database === 'ORACLE').length;
  const postgresLogs = filteredData.filter(l => l.database === 'POSTGRESQL').length;
  const systemIssues = filteredData.filter(l => l.status === 'ERROR' || l.status === 'WARNING').length;

  // Pagination calculation
  const totalPages = Math.ceil(totalLogs / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalLogs);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const setPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setDbVal('');
    setStatusVal('');
    onRefresh();
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return <i className="pi pi-sort text-muted" style={{ marginLeft: '6px', fontSize: '0.8rem' }}></i>;
    return sortDirection === 'asc' 
      ? <i className="pi pi-sort-amount-up" style={{ marginLeft: '6px', color: 'var(--primary)', fontSize: '0.8rem' }}></i>
      : <i className="pi pi-sort-amount-down" style={{ marginLeft: '6px', color: 'var(--primary)', fontSize: '0.8rem' }}></i>;
  };

  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Dashboard Utama</h2>
        <p className="panel-subtitle">Pantau aktivitas integrasi database sinkronisasi data log transaksi secara real-time.</p>
      </div>

      {/* Widgets Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">TOTAL LOG DATA</span>
            <span className="stat-value" id="stat-total-logs">{totalLogs}</span>
          </div>
          <div className="stat-card-icon icon-teal"><i className="pi pi-database"></i></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">LOG ORACLE</span>
            <span className="stat-value" id="stat-oracle-logs">{oracleLogs}</span>
          </div>
          <div className="stat-card-icon icon-blue"><i className="pi pi-server"></i></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">LOG POSTGRESQL</span>
            <span className="stat-value" id="stat-postgres-logs">{postgresLogs}</span>
          </div>
          <div className="stat-card-icon icon-purple"><i className="pi pi-server"></i></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">SYSTEM ISSUES</span>
            <span className="stat-value" id="stat-system-issues">{systemIssues}</span>
          </div>
          <div className="stat-card-icon icon-red"><i className="pi pi-exclamation-triangle"></i></div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <div className="search-wrapper">
            <i className="pi pi-search"></i>
            <input
              type="text"
              id="dash-search-input"
              className="input-text"
              placeholder="Cari tiket, pelanggan..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          
          <select
            id="dash-filter-db"
            className="select-input"
            value={dbVal}
            onChange={(e) => setDbVal(e.target.value)}
          >
            <option value="">Semua Database</option>
            <option value="ORACLE">Oracle</option>
            <option value="POSTGRESQL">PostgreSQL</option>
          </select>
          
          <select
            id="dash-filter-status"
            className="select-input"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </select>
        </div>
        
        <button id="dash-btn-refresh" className="btn btn-outline" onClick={handleResetFilters}>
          <i className="pi pi-sync"></i> Segarkan Data
        </button>
      </div>

      {/* Content Card with Log Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="log-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('no_tiket')} style={{ cursor: 'pointer' }}>
                  No Tiket {getSortIcon('no_tiket')}
                </th>
                <th onClick={() => handleSort('jenis_transaksi')} style={{ cursor: 'pointer' }}>
                  Jenis Transaksi {getSortIcon('jenis_transaksi')}
                </th>
                <th onClick={() => handleSort('no_pelanggan')} style={{ cursor: 'pointer' }}>
                  No Pelanggan {getSortIcon('no_pelanggan')}
                </th>
                <th onClick={() => handleSort('tanggal_proses')} style={{ cursor: 'pointer' }}>
                  Tanggal Proses {getSortIcon('tanggal_proses')}
                </th>
                <th onClick={() => handleSort('database')} style={{ cursor: 'pointer' }}>
                  Database {getSortIcon('database')}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('petugas')} style={{ cursor: 'pointer' }}>
                  Petugas {getSortIcon('petugas')}
                </th>
                <th style={{ textAlign: 'center', width: '80px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody id="dashboard-table-body">
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                    Memuat log data dari API...
                  </td>
                </tr>
              ) : totalLogs === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Tidak ada log data yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedData.map((log, index) => {
                  const dbBadge = log.database === 'ORACLE' ? 'badge-oracle' : 'badge-postgres';
                  let statusBadge = 'badge-success';
                  if (log.status === 'WARNING') statusBadge = 'badge-warning';
                  if (log.status === 'ERROR') statusBadge = 'badge-error';

                  return (
                    <tr key={`${log.no_tiket}-${log.no_pelanggan}-${index}`}>
                      <td><strong>{log.no_tiket}</strong></td>
                      <td>{log.jenis_transaksi}</td>
                      <td>{log.no_pelanggan}</td>
                      <td>{log.tanggal_proses}</td>
                      <td><span className={`badge ${dbBadge}`}>{log.database}</span></td>
                      <td><span className={`badge ${statusBadge}`}>{log.status}</span></td>
                      <td>{log.petugas}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-action" 
                          onClick={() => onViewDetails(log)}
                          title="Lihat Detail SQL"
                        >
                          <i className="pi pi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!loading && totalLogs > 0 && (
          <div className="table-pagination">
            <span id="dash-pagination-info">
              Menampilkan log ke {startIndex + 1} - {endIndex} dari total {totalLogs}
            </span>
            <div className="pagination-controls-wrapper">
              <div id="dash-pagination-controls" style={{ display: 'flex', gap: '4px' }}>
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
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
          </div>
        )}
      </div>
    </div>
  );
}
