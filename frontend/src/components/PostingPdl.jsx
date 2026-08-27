import React, { useState, useEffect, useRef } from 'react';

export default function PostingPdl({ user, apiBaseUrl, showToast, isPostgres = false, menuName = 'Posting PDL', pgRegion = 'ap2t', onPgRegionChange }) {
  const [idpel, setIdpel] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listData, setListData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailData, setDetailData] = useState(null);
  
  const [pgDropdownOpen, setPgDropdownOpen] = useState(false);
  const pgDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pgDropdownRef.current && !pgDropdownRef.current.contains(e.target)) {
        setPgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form Fields (Nilai Baru)
  const [tiket, setTiket] = useState('');
  const [unitUpiBaru, setUnitUpiBaru] = useState('');
  const [unitApBaru, setUnitApBaru] = useState('');
  const [unitUpBaru, setUnitUpBaru] = useState('');
  const [postingPDLBaru, setPostingPDLBaru] = useState('');
  const [pnjBaru, setPnjBaru] = useState('');
  const [namaPNJBaru, setNamaPNJBaru] = useState('');
  const [kdProvBaru, setKdProvBaru] = useState('');
  const [kdKabBaru, setKdKabBaru] = useState('');
  const [kdKecBaru, setKdKecBaru] = useState('');
  const [kdKelBaru, setKdKelBaru] = useState('');
  const [pemdaBaru, setPemdaBaru] = useState('');
  const [noBangBaru, setNoBangBaru] = useState('');
  const [ketNoBangBaru, setKetNoBangBaru] = useState('');
  const [thbLangS1ABaru, setThbLangS1ABaru] = useState('');

  const dbPrefix = isPostgres ? 'api/PostingPDL_pg' : 'api/PostingPDL';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!idpel.trim()) {
      showToast('ID Pelanggan wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    setListData([]);
    setSelectedRecord(null);
    setDetailData(null);
    setTiket('');

    try {
      // Pass a dummy or empty ticket for search if required by the controller, 
      // but our get_data controller only requires it to check.
      // Wait! In the controller `get_data`, it expects:
      // `$tiket = $this->input->get('tiket');` and `if (empty($idpel) || empty($tiket))` returning error.
      // Ah! Let's check: did we make `tiket` mandatory in the backend `get_data`?
      // Yes! `if (empty($idpel) || empty($tiket)) { return $this->response(400, 'error', 'Parameter idpel dan tiket wajib diisi!'); }`
      // Wait, if the user wants only IDPEL in search form, we can either:
      // 1. Pass a dummy/fixed ticket value (like 'SEARCH') in the GET request, or
      // 2. Modify the backend controller to not require `tiket` for `get_data`!
      // Let's modify the backend controllers `PostingPDL.php` and `PostingPDL_pg.php` to NOT require `tiket` in `get_data()`!
      // This is much cleaner and matches exactly what the user is asking.
      
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_data?idpel=${encodeURIComponent(idpel.trim())}&tiket=SEARCH`, {
        method: 'GET',
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setListData(result.data || []);
        showToast('Data PDL berhasil ditemukan!', 'success');
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

  const handleSelectRecord = async (record) => {
    setSelectedRecord(record);
    setLoadingDetail(true);
    setDetailData(null);
    setTiket('');

    try {
      const nomorpdl = record.nomorpdl || '';
      const recIdpel = record.idpel || '';
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_detail?noagenda=${encodeURIComponent(nomorpdl)}&idpel=${encodeURIComponent(recIdpel)}`, {
        method: 'GET',
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const item = result.data && result.data[0] ? result.data[0] : {};
        setDetailData(item);

        // Prepopulate update fields with retrieved database state
        setUnitUpiBaru(item.unitupi || '');
        setUnitApBaru(item.unitap || '');
        setUnitUpBaru(item.unitup || '');
        setPostingPDLBaru(item.postingpdl || '');
        setPnjBaru(item.pnj || '');
        setNamaPNJBaru(item.namapnj || '');
        setKdProvBaru(item.kd_prov || '');
        setKdKabBaru(item.kd_kab || '');
        setKdKecBaru(item.kd_kec || '');
        setKdKelBaru(item.kd_kel || '');
        setPemdaBaru(item.pemda || '');
        setNoBangBaru(item.nobang || '');
        setKetNoBangBaru(item.ketnobang || '');
        setThbLangS1ABaru(item.thblangs1a || '');

        showToast('Detail data PDL berhasil dimuat!', 'success');
      } else {
        showToast(result.message || 'Gagal memuat detail data PDL.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSavePdl = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!tiket.trim()) {
      showToast('Nomor Tiket ITSM wajib diisi saat update data!', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        },
        body: JSON.stringify({
          tiket: tiket.trim(),
          idpel: selectedRecord.idpel,
          p_noagenda: selectedRecord.noagenda || '',
          postingPDLBaru: postingPDLBaru,
          THBLangS1ABaru: thbLangS1ABaru,
          PNJBaru: pnjBaru,
          namaPNJBaru: namaPNJBaru,
          KDPROVBaru: kdProvBaru,
          KDKABBaru: kdKabBaru,
          KDKECBaru: kdKecBaru,
          KDKELBaru: kdKelBaru,
          PEMDABaru: pemdaBaru,
          noBangBaru: noBangBaru,
          ketNoBangBaru: ketNoBangBaru,
          thblmut: selectedRecord.thblmut || '',
          unitUpiBaru: unitUpiBaru,
          unitApBaru: unitApBaru,
          unitUpBaru: unitUpBaru,
          NopostingPDLBaru: selectedRecord.nomorpdl
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Pembaruan data Posting PDL berhasil disimpan!', 'success');
        
        // Hide update panel and clear selected state
        setSelectedRecord(null);
        setDetailData(null);
        setTiket('');

        // Refresh list
        handleSearch(new Event('submit'));
      } else {
        showToast(result.message || 'Gagal memperbarui data Posting PDL.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="posting-pdl-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-envelope" style={{ color: '#0f766e' }}></i> {menuName}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mencari, menampilkan, dan memperbarui informasi transaksi Posting PDL menggunakan koneksi {dbLabel}.
          </p>
        </div>
        {isPostgres ? (
          <div ref={pgDropdownRef} style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '20px',
            padding: '2px 8px 2px 4px',
            gap: '8px',
            position: 'relative'
          }}>
            <span style={{ 
              padding: '4px 10px', 
              backgroundColor: '#1e3a8a', 
              color: '#ffffff', 
              borderRadius: '16px', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <i className="pi pi-database" style={{ fontSize: '0.7rem' }}></i> Mode DB: PostgreSQL
            </span>
            <div 
              onClick={() => setPgDropdownOpen(!pgDropdownOpen)}
              style={{
                flex: 1,
                padding: '4px 24px 4px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#1e3a8a',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e3a8a\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 4px center',
                backgroundSize: '12px'
              }}
            >
              {pgRegion === 'ap2t' && 'AP2T (10.99.20.11)'}
              {pgRegion === 'jateng' && 'JATENG & DIY (10.99.20.12)'}
              {pgRegion === 'jatim' && 'JATIM (10.99.20.13)'}
              {pgRegion === 'jakban' && 'JAKARTA & BANTEN (10.99.20.13)'}
              {pgRegion === 'jabar' && 'JABAR (10.99.20.14)'}
            </div>

            {pgDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 999,
                overflow: 'hidden',
                padding: '4px 0'
              }}>
                {[
                  { value: 'ap2t', label: 'AP2T (10.99.20.11)' },
                  { value: 'jateng', label: 'JATENG & DIY (10.99.20.12)' },
                  { value: 'jatim', label: 'JATIM (10.99.20.13)' },
                  { value: 'jakban', label: 'JAKARTA & BANTEN (10.99.20.13)' },
                  { value: 'jabar', label: 'JABAR (10.99.20.14)' }
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      onPgRegionChange(item.value);
                      setPgDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      fontWeight: pgRegion === item.value ? '600' : '500',
                      color: pgRegion === item.value ? '#1e3a8a' : '#475569',
                      backgroundColor: pgRegion === item.value ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (pgRegion !== item.value) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pgRegion !== item.value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {pgRegion === item.value && (
                      <i className="pi pi-check" style={{ color: '#1e3a8a', fontSize: '0.75rem' }}></i>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{ 
            padding: '6px 12px', 
            backgroundColor: '#115e59', 
            color: '#ffffff', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <i className="pi pi-database" style={{ fontSize: '0.75rem' }}></i> Mode DB: Oracle
          </span>
        )}
      </div>

      {/* Search form card */}
      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="idpel-search" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>ID Pelanggan</label>
            <input
              type="text"
              id="idpel-search"
              placeholder="Masukkan ID Pelanggan (e.g. 54630...)"
              value={idpel}
              onChange={(e) => setIdpel(e.target.value)}
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

      {/* Grid result table (always shown if search yields records) */}
      {listData.length > 0 && (
        <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            <i className="pi pi-list"></i> Hasil Pencarian Data Transaksi PDL
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(15, 118, 110, 0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Unit UPI</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Unit AP</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Unit UP</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>No Agenda</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ID Pelanggan</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>THBL Mutasi</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Nomor PDL</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Posting PDL</th>
                </tr>
              </thead>
              <tbody>
                {listData.map((row, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: selectedRecord?.nomorpdl === row.nomorpdl ? 'rgba(15, 118, 110, 0.08)' : 'transparent'
                  }}>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleSelectRecord(row)}
                        className="btn" 
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem', 
                          backgroundColor: selectedRecord?.nomorpdl === row.nomorpdl ? '#115e59' : '#0f766e', 
                          color: '#ffffff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer' 
                        }}
                      >
                        {selectedRecord?.nomorpdl === row.nomorpdl ? 'Dipilih' : 'Pilih'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{row.unitupi}</td>
                    <td style={{ padding: '10px 14px' }}>{row.unitap}</td>
                    <td style={{ padding: '10px 14px' }}>{row.unitup}</td>
                    <td style={{ padding: '10px 14px' }}>{row.noagenda || '-'}</td>
                    <td style={{ padding: '10px 14px' }}>{row.idpel}</td>
                    <td style={{ padding: '10px 14px' }}>{row.thblmut}</td>
                    <td style={{ padding: '10px 14px' }}>{row.nomorpdl}</td>
                    <td style={{ padding: '10px 14px' }}>{row.postingpdl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail focused view */}
      {selectedRecord && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadingDetail && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f766e' }}></i>
              <div>Memuat rincian data PDL...</div>
            </div>
          )}

          {detailData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              
              {/* Data Lama View */}
              <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', fontWeight: 600 }}>
                  <i className="pi pi-eye"></i> Data Lama (Saat Ini)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Unit UPI</span>
                    <span>{detailData.unitupi || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Unit AP</span>
                    <span>{detailData.unitap || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Unit UP</span>
                    <span>{detailData.unitup || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Nomor PDL</span>
                    <span>{detailData.nomorpdl || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Posting PDL</span>
                    <span>{detailData.postingpdl}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>PNJ</span>
                    <span>{detailData.pnj || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Nama PNJ</span>
                    <span>{detailData.namapnj || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>KD Provinsi</span>
                    <span>{detailData.kd_prov || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>KD Kabupaten</span>
                    <span>{detailData.kd_kab || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>KD Kecamatan</span>
                    <span>{detailData.kd_kec || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>KD Kelurahan</span>
                    <span>{detailData.kd_kel || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>PEMDA</span>
                    <span>{detailData.pemda || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Nobang</span>
                    <span>{detailData.nobang || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Ketnobang</span>
                    <span>{detailData.ketnobang || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>KD Jenis SL</span>
                    <span>{detailData.kdjenis_sl || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>THBLangS1A</span>
                    <span>{detailData.thblangs1a || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Data Baru Form */}
              <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', fontWeight: 600 }}>
                  <i className="pi pi-pencil"></i> Data Baru (Update)
                </h3>
                <form onSubmit={handleSavePdl} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                  
                  {/* Ticket ITSM Input Field inside the Update Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(15, 118, 110, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(15, 118, 110, 0.15)' }}>
                    <label style={{ fontWeight: 600, color: '#0f766e' }}>Nomor Tiket ITSM</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan Nomor Tiket (e.g. 4094798)"
                      value={tiket} 
                      onChange={(e) => setTiket(e.target.value)} 
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Unit UPI</label>
                      <input type="text" value={unitUpiBaru} onChange={(e) => setUnitUpiBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Unit AP</label>
                      <input type="text" value={unitApBaru} onChange={(e) => setUnitApBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Unit UP</label>
                      <input type="text" value={unitUpBaru} onChange={(e) => setUnitUpBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Posting PDL</label>
                      <input type="text" value={postingPDLBaru} onChange={(e) => setPostingPDLBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>PNJ</label>
                      <input type="text" value={pnjBaru} onChange={(e) => setPnjBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Nama PNJ</label>
                      <input type="text" value={namaPNJBaru} onChange={(e) => setNamaPNJBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>KD Provinsi</label>
                      <input type="text" value={kdProvBaru} onChange={(e) => setKdProvBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>KD Kabupaten</label>
                      <input type="text" value={kdKabBaru} onChange={(e) => setKdKabBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>KD Kecamatan</label>
                      <input type="text" value={kdKecBaru} onChange={(e) => setKdKecBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>KD Kelurahan</label>
                      <input type="text" value={kdKelBaru} onChange={(e) => setKdKelBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 600 }}>PEMDA</label>
                    <input type="text" value={pemdaBaru} onChange={(e) => setPemdaBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Nobang</label>
                      <input type="text" value={noBangBaru} onChange={(e) => setNoBangBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: 600 }}>Ketnobang</label>
                      <input type="text" value={ketNoBangBaru} onChange={(e) => setKetNoBangBaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: 600 }}>THBLangS1A</label>
                    <input type="text" value={thbLangS1ABaru} onChange={(e) => setThbLangS1ABaru(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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
                          <i className="pi pi-save"></i> Simpan Transaksi PDL
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
