import React, { useState } from 'react';

export default function UpdatePnj({ user, apiBaseUrl, showToast, isPostgres = false }) {
  const [noagenda, setNoagenda] = useState('');
  const [tiket, setTiket] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingKoreksi, setSavingKoreksi] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  // Form Fields (Nilai Baru)
  const [pnj101, setPnj101] = useState('');
  const [pnjPemohon, setPnjPemohon] = useState('');
  const [pnj106, setPnj106] = useState('');
  const [nobang101, setNobang101] = useState('');
  const [nobangPemohon, setNobangPemohon] = useState('');
  const [nobang106, setNobang106] = useState('');
  const [ket101, setKet101] = useState('');
  const [ketPemohon, setKetPemohon] = useState('');
  const [ket106, setKet106] = useState('');

  const dbPrefix = isPostgres ? 'api/UpdatePnj_pg' : 'api/UpdatePnj';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!noagenda.trim()) {
      showToast('No Agenda wajib diisi!', 'warning');
      return;
    }
    if (!tiket.trim()) {
      showToast('No Tiket wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    setHasData(false);
    setCurrentData(null);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_data?noagenda=${encodeURIComponent(noagenda.trim())}&tiket=${encodeURIComponent(tiket.trim())}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const item = result.data && result.data[0] ? result.data[0] : {};
        
        setCurrentData(item);

        // Prepopulate update fields with retrieved database state
        setPnj101(item.pnj_101 || '');
        setPnjPemohon(item.pnj_pemohon || '');
        setPnj106(item.pnj_106 || '');
        setNobang101(item.nobang_101 || '');
        setNobangPemohon(item.nobang_pemohon || '');
        setNobang106(item.nobang_106 || '');
        setKet101(item.ketnobang_101 || '');
        setKetPemohon(item.ketnobang_pemohon || '');
        setKet106(item.ketnobang_106 || '');

        setHasData(true);
        showToast('Data PNJ berhasil ditemukan!', 'success');
      } else {
        showToast(result.message || 'Data tidak ditemukan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data dari server API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePnj = async (e) => {
    e.preventDefault();
    if (!noagenda.trim() || !tiket.trim()) {
      showToast('No Agenda dan No Tiket wajib terisi!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          tiket: tiket.trim(),
          noagenda: noagenda.trim(),
          pnj_101: pnj101.trim(),
          pnj_pemohon: pnjPemohon.trim(),
          pnj_106: pnj106.trim(),
          nobang_101: nobang101.trim(),
          nobang_pemohon: nobangPemohon.trim(),
          nobang_106: nobang106.trim(),
          ketnobang_101: ket101.trim(),
          ketnobang_pemohon: ketPemohon.trim(),
          ketnobang_106: ket106.trim()
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Pembaruan data PNJ berhasil disimpan!', 'success');
        
        // Refresh the visual table state with newly saved values
        setCurrentData({
          pnj_101: pnj101,
          pnj_pemohon: pnjPemohon,
          pnj_106: pnj106,
          nobang_101: nobang101,
          nobang_pemohon: nobangPemohon,
          nobang_106: nobang106,
          ketnobang_101: ket101,
          ketnobang_pemohon: ketPemohon,
          ketnobang_106: ket106,
          noagenda: noagenda
        });
      } else {
        showToast(result.message || 'Gagal memperbarui data PNJ.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKoreksiTarif = async () => {
    if (!noagenda.trim() || !tiket.trim()) {
      showToast('Cari data No Agenda dan No Tiket terlebih dahulu!', 'warning');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin memproses Remaja Koreksi Tarif untuk No Agenda ini?')) {
      return;
    }

    setSavingKoreksi(true);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save_koreksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          tiket: tiket.trim(),
          noagenda: noagenda.trim()
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Koreksi tarif berhasil disimpan!', 'success');
      } else {
        showToast(result.message || 'Gagal menyimpan koreksi tarif.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSavingKoreksi(false);
    }
  };

  return (
    <div className="update-pnj-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-user-edit" style={{ color: '#0f766e' }}></i> Update PNJ (Koreksi Penanggung Jawab)
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mencari, mengubah, dan membackup data PNJ / NOBANG NULL ke skema log menggunakan koneksi {dbLabel}.
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
            <label htmlFor="noagenda-search" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>No Agenda</label>
            <input
              type="text"
              id="noagenda-search"
              placeholder="Masukkan Nomor Agenda (e.g. 52123...)"
              value={noagenda}
              onChange={(e) => setNoagenda(e.target.value)}
              disabled={loading || saving}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="tiket-search" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Nomor Tiket / Log ID</label>
            <input
              type="text"
              id="tiket-search"
              placeholder="Masukkan Nomor Tiket (e.g. TKT001...)"
              value={tiket}
              onChange={(e) => setTiket(e.target.value)}
              disabled={loading || saving}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', height: '42px', flexShrink: 0 }}
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner"></i> Searching...
              </>
            ) : (
              <>
                <i className="pi pi-search"></i> Cari Data
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main content grid (shown only if search yields data) */}
      {hasData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. KONDISI DATA SAAT INI (Tabel State) */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <i className="pi pi-table"></i> Kondisi Data Saat Ini di Database (Sebelum Update)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(15, 118, 110, 0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Tabel Sumber</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Kolom PNJ</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Kolom NOBANG</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Kolom KETNOBANG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>TRANS_101</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.pnj_101 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.nobang_101 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.ketnobang_101 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>TRANS_101_PEMOHON</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.pnj_pemohon || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.nobang_pemohon || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.ketnobang_pemohon || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>TRANS_106</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.pnj_106 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.nobang_106 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                    <td style={{ padding: '10px 14px' }}>{currentData?.ketnobang_106 || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL / Kosong</span>}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 2. FORMULIR UPDATE DATA PNJ */}
          <form onSubmit={handleSavePnj} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                <i className="pi pi-pencil" style={{ color: '#0f766e', marginRight: '6px' }}></i> Masukkan Nilai Pembaruan Baru (Kondisi Baru)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ubah nilai pada field di bawah ini. Nilai default diambil dari data aktif di database saat pencarian.
              </p>
            </div>

            {/* Grid of 3 columns for 101, Pemohon, 106 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* TRANS_101 Section */}
              <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f766e', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', fontWeight: 600 }}>
                  <i className="pi pi-file"></i> Update TRANS_101
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNJ 101</label>
                    <input
                      type="text"
                      value={pnj101}
                      onChange={(e) => setPnj101(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NOBANG 101</label>
                    <input
                      type="text"
                      value={nobang101}
                      onChange={(e) => setNobang101(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KETNOBANG 101</label>
                    <input
                      type="text"
                      value={ket101}
                      onChange={(e) => setKet101(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* TRANS_101_PEMOHON Section */}
              <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f766e', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', fontWeight: 600 }}>
                  <i className="pi pi-user"></i> Update PEMOHON
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNJ PEMOHON</label>
                    <input
                      type="text"
                      value={pnjPemohon}
                      onChange={(e) => setPnjPemohon(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NOBANG PEMOHON</label>
                    <input
                      type="text"
                      value={nobangPemohon}
                      onChange={(e) => setNobangPemohon(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KETNOBANG PEMOHON</label>
                    <input
                      type="text"
                      value={ketPemohon}
                      onChange={(e) => setKetPemohon(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* TRANS_106 Section */}
              <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f766e', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', fontWeight: 600 }}>
                  <i className="pi pi-file-excel"></i> Update TRANS_106
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNJ 106</label>
                    <input
                      type="text"
                      value={pnj106}
                      onChange={(e) => setPnj106(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NOBANG 106</label>
                    <input
                      type="text"
                      value={nobang106}
                      onChange={(e) => setNobang106(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KETNOBANG 106</label>
                    <input
                      type="text"
                      value={ket106}
                      onChange={(e) => setKet106(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? (
                  <>
                    <i className="pi pi-spin pi-spinner"></i> Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="pi pi-save"></i> Simpan & Backup Data PNJ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
