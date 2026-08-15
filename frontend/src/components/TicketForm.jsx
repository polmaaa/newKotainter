import React, { useState } from 'react';

export default function TicketForm({ apiBaseUrl, onSuccess, showToast }) {
  const [noTiket, setNoTiket] = useState('');
  const [noPelanggan, setNoPelanggan] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState('TRANSAKSI BARU');
  const [database, setDatabase] = useState('ORACLE');
  const [status, setStatus] = useState('SUCCESS');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/logs/save_log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          no_tiket: noTiket,
          no_pelanggan: noPelanggan,
          jenis_transaksi: jenisTransaksi,
          database,
          status,
          query
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        if (showToast) {
          showToast("Tiket log transaksi berhasil disimpan via API Backend!", "success");
        }
        // Reset form
        setNoTiket('');
        setNoPelanggan('');
        setQuery('');
        onSuccess();
      } else {
        setError(result.message || 'Gagal menyimpan tiket log.');
        if (showToast) {
          showToast(result.message || 'Gagal menyimpan tiket log.', "error");
        }
      }
    } catch (err) {
      console.error('Gagal mengirim log:', err);
      setError('Gagal menghubungkan ke server API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel-title-area">
        <h2 className="panel-title">Catat Tiket Baru</h2>
        <p className="panel-subtitle">Catat log kueri kustom baru untuk proses transaksi integrasi ke database Oracle atau PostgreSQL.</p>
      </div>

      <div className="content-card" style={{ maxWidth: '600px' }}>
        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', marginBottom: '16px' }}>
            <i className="pi pi-exclamation-circle" style={{ marginRight: '8px' }}></i>
            <span>{error}</span>
          </div>
        )}

        <form id="form-ticket" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="ticket-notrans">No. Transaksi (No. Tiket)</label>
            <input
              type="text"
              id="ticket-notrans"
              className="form-input-text"
              placeholder="Contoh: TKT-2026-0001"
              required
              value={noTiket}
              onChange={(e) => setNoTiket(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="ticket-cust">No. Pelanggan (IDPEL)</label>
            <input
              type="text"
              id="ticket-cust"
              className="form-input-text"
              placeholder="Contoh: 531234567890"
              required
              value={noPelanggan}
              onChange={(e) => setNoPelanggan(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="ticket-type">Jenis Transaksi</label>
            <input
              type="text"
              id="ticket-type"
              className="form-input-text"
              placeholder="Contoh: TRANSAKSI BARU, REKOR KOREKSI"
              required
              value={jenisTransaksi}
              onChange={(e) => setJenisTransaksi(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="ticket-db">Database Target</label>
            <select
              id="ticket-db"
              className="select-input"
              style={{ width: '100%' }}
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
            >
              <option value="ORACLE">Oracle</option>
              <option value="POSTGRESQL">PostgreSQL</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="ticket-status">Status Proses</label>
            <select
              id="ticket-status"
              className="select-input"
              style={{ width: '100%' }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="ticket-query">Perintah SQL Query</label>
            <textarea
              id="ticket-query"
              className="form-input-text"
              style={{ height: '100px', resize: 'vertical', fontFamily: 'monospace' }}
              placeholder="Tuliskan query SQL yang dijalankan..."
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></textarea>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="pi pi-check" style={{ marginRight: '8px' }}></i>
                  Simpan Tiket Log
                </>
              )}
            </button>
            <button type="reset" className="btn btn-outline" onClick={() => { setNoTiket(''); setNoPelanggan(''); setQuery(''); }}>Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
