import React, { useEffect } from 'react';

export default function DetailModal({ log, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.remove('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!log) return null;

  const dbBadge = log.database === 'ORACLE' ? 'badge-oracle' : 'badge-postgres';
  let statusBadge = 'badge-success';
  if (log.status === 'WARNING') statusBadge = 'badge-warning';
  if (log.status === 'ERROR') statusBadge = 'badge-error';

  return (
    <div id="detail-modal" className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Detail Log Transaksi</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body" id="modal-details-container">
          <div className="modal-row">
            <span className="modal-label">No Tiket</span>
            <span className="modal-value" style={{ fontWeight: 600 }}>{log.no_tiket}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Jenis Transaksi</span>
            <span className="modal-value">{log.jenis_transaksi}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">No Pelanggan</span>
            <span className="modal-value">{log.no_pelanggan}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Tanggal Proses</span>
            <span className="modal-value">{log.tanggal_proses}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Database</span>
            <span className="modal-value"><span className={`badge ${dbBadge}`}>{log.database}</span></span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Status</span>
            <span className="modal-value"><span className={`badge ${statusBadge}`}>{log.status}</span></span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Petugas</span>
            <span className="modal-value">{log.petugas}</span>
          </div>
          <div className="modal-row last" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="modal-label">Kueri Database SQL</span>
            <pre className="code-block">{log.query}</pre>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
