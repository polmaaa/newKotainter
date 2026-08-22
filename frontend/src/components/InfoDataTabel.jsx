import React, { useState } from 'react';

export default function InfoDataTabel({ user, apiBaseUrl, showToast, isPostgres = false, menuName = 'Informasi Data Tabel' }) {
  const [idpel, setIdpel] = useState('');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const dbPrefix = isPostgres ? 'api/InfoDataTabel_pg' : 'api/InfoDataTabel';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!idpel.trim()) {
      showToast('IDPEL wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    setDataList([]);
    setSearched(false);
    setCurrentPage(1);

    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_data?idpel=${encodeURIComponent(idpel.trim())}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setDataList(result.data || []);
        showToast(result.message || 'Pencarian selesai.', 'success');
      } else {
        showToast(result.message || 'Gagal mencari data.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = dataList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(dataList.length / rowsPerPage);

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
    <div className="info-data-tabel-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-table" style={{ color: '#0f766e' }}></i> {menuName}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mencari data permohonan pelanggan berdasarkan IDPEL pada view opharapp.vw_idpel_bermohon menggunakan koneksi {dbLabel}.
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

      {/* Search form card */}
      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="idpel-search" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>IDPEL</label>
            <input
              type="text"
              id="idpel-search"
              placeholder="Masukkan IDPEL (e.g. 542100...)"
              value={idpel}
              onChange={(e) => setIdpel(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.15s ease'
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
                <i className="pi pi-search"></i> Cari Data
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#0f766e' }}></i>
        </div>
      )}

      {/* Results table */}
      {searched && !loading && (
        <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="pi pi-list"></i> Hasil Pencarian Data
          </h3>
          
          {dataList.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(15, 118, 110, 0.05)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px' }}>IDPEL</th>
                      <th style={{ padding: '12px 14px' }}>No Agenda</th>
                      <th style={{ padding: '12px 14px' }}>Jenis Transaksi</th>
                      <th style={{ padding: '12px 14px' }}>JML</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid var(--border-light)',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.idpel}</td>
                        <td style={{ padding: '12px 14px' }}>{row.noagenda}</td>
                        <td style={{ padding: '12px 14px' }}>{row.jenis_transaksi}</td>
                        <td style={{ padding: '12px 14px' }}>{row.jml}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Menampilkan {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, dataList.length)} dari {dataList.length} data
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      Sebelumnya
                    </button>
                    {getPaginationGroup().map(page => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Data tidak ditemukan untuk IDPEL: {idpel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
