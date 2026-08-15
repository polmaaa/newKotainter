import React, { useState, useEffect } from 'react';

export default function Dashboard({ logs, dbStatus, loading, onRefresh, onViewDetails, oraclePresetName, fsoOraclePresetName }) {
  const [searchVal, setSearchVal] = useState('');
  const [dbVal, setDbVal] = useState('');
  const [statusVal, setStatusVal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const rowsPerPage = 5;

  const safeLogs = Array.isArray(logs) ? logs.filter(Boolean) : [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, dbVal, statusVal]);

  // Apply filters
  const filteredData = safeLogs.filter(log => {
    if (!log) return false;
    
    const noTiketStr = (log.no_tiket !== null && log.no_tiket !== undefined) ? log.no_tiket.toString() : '';
    const noPelangganStr = (log.no_pelanggan !== null && log.no_pelanggan !== undefined) ? log.no_pelanggan.toString() : '';
    const jenisTransaksiStr = (log.jenis_transaksi !== null && log.jenis_transaksi !== undefined) ? log.jenis_transaksi.toString() : '';
    const petugasStr = (log.petugas !== null && log.petugas !== undefined) ? log.petugas.toString() : '';
    
    const matchesSearch = 
      noTiketStr.toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      noPelangganStr.toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      jenisTransaksiStr.toLowerCase().includes(searchVal.toLowerCase().trim()) ||
      petugasStr.toLowerCase().includes(searchVal.toLowerCase().trim());
    
    const logDb = log.database ? log.database.toString() : '';
    const logStatus = log.status ? log.status.toString() : '';

    const matchesDb = dbVal === '' || logDb === dbVal;
    const matchesStatus = statusVal === '' || logStatus === statusVal;
    
    return matchesSearch && matchesDb && matchesStatus;
  });

  // Apply sorting
  const sortedData = [...filteredData];
  if (sortKey) {
    sortedData.sort((a, b) => {
      let valA = a && a[sortKey] !== undefined && a[sortKey] !== null ? a[sortKey].toString().toLowerCase() : '';
      let valB = b && b[sortKey] !== undefined && b[sortKey] !== null ? b[sortKey].toString().toLowerCase() : '';
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Stats calculation
  const totalLogs = filteredData.length;
  const oracleLogs = filteredData.filter(l => l && l.database && l.database.toString() === 'ORACLE').length;
  const postgresLogs = filteredData.filter(l => l && l.database && l.database.toString() === 'POSTGRESQL').length;
  const systemIssues = filteredData.filter(l => l && l.status && (l.status.toString() === 'ERROR' || l.status.toString() === 'WARNING')).length;

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
    if (sortKey !== key) return <i className="pi pi-sort" style={{ marginLeft: '6px', fontSize: '0.8rem' }}></i>;
    return sortDirection === 'asc' 
      ? <i className="pi pi-sort-amount-up" style={{ marginLeft: '6px', color: 'var(--primary)', fontSize: '0.8rem' }}></i>
      : <i className="pi pi-sort-amount-down" style={{ marginLeft: '6px', color: 'var(--primary)', fontSize: '0.8rem' }}></i>;
  };

  return (
    <div>
      <div className="panel-title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="panel-title">Dashboard Logs</h2>
          <p className="panel-subtitle">Menampilkan seluruh log proses database campuran Oracle & PostgreSQL.</p>
        </div>
        
        {/* Status Koneksi DB Aktif */}
        <div className="db-status-bar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="db-indicator" title="Database Utama Oracle">
            <span className={`indicator-dot ${(dbStatus && dbStatus.oracle) ? 'online' : 'offline'}`} id="status-dot-oracle"></span>
            <span>Oracle: {oraclePresetName || '...'}</span>
          </div>
          <div className="db-indicator" title="Database Utama PostgreSQL">
            <span className={`indicator-dot ${(dbStatus && dbStatus.postgresql) ? 'online' : 'offline'}`} id="status-dot-postgres"></span>
            <span>Postgre</span>
          </div>
          <div className="db-indicator" title="Database FSO Oracle">
            <span className={`indicator-dot ${(dbStatus && dbStatus.fso_oracle) ? 'online' : 'offline'}`} id="status-dot-fso-oracle"></span>
            <span>FSO Oracle: {fsoOraclePresetName || '...'}</span>
          </div>
          <div className="db-indicator" title="Database FSO PostgreSQL">
            <span className={`indicator-dot ${(dbStatus && dbStatus.fso_postgres) ? 'online' : 'offline'}`} id="status-dot-fso-postgres"></span>
            <span>FSO Postgre</span>
          </div>
        </div>
      </div>

      {/* Statistics Summary Widgets */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Log Aktivitas</span>
            <span className="stat-value" id="stat-total-logs">{totalLogs}</span>
          </div>
          <div className="stat-card-icon icon-teal">
            <i className="pi pi-database"></i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Log Oracle</span>
            <span className="stat-value" id="stat-oracle-logs" style={{ color: 'var(--oracle)' }}>{oracleLogs}</span>
          </div>
          <div className="stat-card-icon icon-blue">
            <i className="pi pi-server"></i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Log PostgreSQL</span>
            <span className="stat-value" id="stat-postgres-logs" style={{ color: 'var(--postgres)' }}>{postgresLogs}</span>
          </div>
          <div className="stat-card-icon icon-purple">
            <i className="pi pi-server"></i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Masalah Sistem</span>
            <span className="stat-value" id="stat-system-issues" style={{ color: 'var(--error)' }}>{systemIssues}</span>
          </div>
          <div className="stat-card-icon icon-red">
            <i className="pi pi-exclamation-triangle"></i>
          </div>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="content-card">
        {/* Datatable Filters Toolbar */}
        <div className="filter-toolbar">
          <div className="filter-group">
            <div className="search-wrapper">
              <i className="pi pi-search"></i>
              <input
                type="text"
                id="dash-search-input"
                className="input-text"
                placeholder="Cari No Tiket / No Pelanggan..."
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
            
            <button className="btn btn-outline" id="dash-btn-refresh" onClick={handleResetFilters}>
              <i className="pi pi-refresh"></i> Refresh
            </button>
          </div>
          <div>
            <span id="dash-rows-count" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {loading ? 'Memuat data log...' : `Menampilkan ${totalLogs} log`}
            </span>
          </div>
        </div>

        {/* Table Area */}
        <div className="datatable-wrapper">
          <table className="custom-table" id="dashboard-table">
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
                <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
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
                  const logDb = log.database ? log.database.toString() : '';
                  const logStatus = log.status ? log.status.toString() : '';
                  const dbBadge = logDb === 'ORACLE' ? 'badge-oracle' : 'badge-postgres';
                  
                  let statusBadge = 'badge-success';
                  if (logStatus === 'WARNING') statusBadge = 'badge-warning';
                  if (logStatus === 'ERROR') statusBadge = 'badge-error';

                  return (
                    <tr key={`${log.no_tiket}-${log.no_pelanggan}-${index}`}>
                      <td><strong>{log.no_tiket}</strong></td>
                      <td>{log.jenis_transaksi}</td>
                      <td>{log.no_pelanggan}</td>
                      <td>{log.tanggal_proses}</td>
                      <td><span className={`badge ${dbBadge}`}>{logDb}</span></td>
                      <td><span className={`badge ${statusBadge}`}>{logStatus}</span></td>
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

        {/* Table Pagination controls */}
        {!loading && totalLogs > 0 && (
          <div className="pagination-container">
            <div className="pagination-info" id="dash-pagination-info">
              Menampilkan log ke {startIndex + 1} - {endIndex} dari total {totalLogs}
            </div>
            <div className="pagination-controls" id="dash-pagination-controls" style={{ display: 'flex', gap: '4px' }}>
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
        )}
      </div>
    </div>
  );
}
