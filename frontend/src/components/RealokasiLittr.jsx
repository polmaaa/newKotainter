import React, { useState, useEffect, useRef } from 'react';

export default function RealokasiLittr({ user, apiBaseUrl, showToast, isPostgres = false, menuName = 'Realokasi LITTR', pgRegion = 'ap2t', onPgRegionChange }) {
  const [noagenda, setNoagenda] = useState('');
  const [tiket, setTiket] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasData, setHasData] = useState(false);
  
  // Retrieved Data State
  const [currentData, setCurrentData] = useState(null);
  const [masterLittr, setMasterLittr] = useState([]);
  
  // Searchable Dropdown State
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLittrId, setSelectedLittrId] = useState('');
  const [selectedLittrName, setSelectedLittrName] = useState('');
  const dropdownRef = useRef(null);

  // PG Region dropdown state
  const [pgDropdownOpen, setPgDropdownOpen] = useState(false);
  const pgDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pgDropdownRef.current && !pgDropdownRef.current.contains(e.target)) {
        setPgDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dbPrefix = isPostgres ? 'api/RealokasiLITTR_pg' : 'api/RealokasiLITTR';
  const dbLabel = isPostgres ? 'PostgreSQL' : 'Oracle';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!noagenda.trim()) {
      showToast('No Agenda wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    setHasData(false);
    setCurrentData(null);
    setMasterLittr([]);
    setSelectedLittrId('');
    setSelectedLittrName('');
    setSearchTerm('');

    try {
      const response = await fetch(`${apiBaseUrl}/${dbPrefix}/get_data?noagenda=${encodeURIComponent(noagenda.trim())}`, {
        method: 'GET',
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'X-DB-Region': pgRegion
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const data = result.data || {};
        setCurrentData(data);
        setMasterLittr(data.master_littr || []);
        setHasData(true);
        showToast('Data agenda berhasil ditemukan!', 'success');
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

  const handleSaveRealokasi = async (e) => {
    e.preventDefault();
    if (!noagenda.trim()) {
      showToast('No Agenda wajib terisi!', 'warning');
      return;
    }
    if (!tiket.trim()) {
      showToast('Nomor Tiket / Log ID wajib terisi!', 'warning');
      return;
    }
    if (!selectedLittrId) {
      showToast('Silakan pilih ID LITTR Baru dari dropdown!', 'warning');
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
          noagenda: noagenda.trim(),
          new_id_littr: selectedLittrId
        })
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        showToast(result.message || 'Proses realokasi LITTR berhasil disimpan!', 'success');
        
        // Update current local values to reflect the newly saved ID_LITTR
        const updatedData = { ...currentData };
        if (updatedData.trans_101) updatedData.trans_101.id_littr = selectedLittrId;
        if (updatedData.trans_pdl) updatedData.trans_pdl.id_littr = selectedLittrId;
        
        const isPaket = String(currentData?.trans_101?.paketslo) === '1';
        if (isPaket) {
          if (updatedData.trans_kirim) {
            updatedData.trans_kirim.id_littr = selectedLittrId;
            updatedData.trans_kirim.tglkirim = null;
            updatedData.trans_kirim.rc_kirim = null;
            updatedData.trans_kirim.desc_kirim = null;
          }
          if (updatedData.trans_plnpay) updatedData.trans_plnpay.id_littr = selectedLittrId;
        }

        setCurrentData(updatedData);
      } else {
        showToast(result.message || 'Gagal menyimpan realokasi.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke API backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Determine if agenda is Paket or Non-Paket
  const isPaket = currentData?.trans_101 ? String(currentData.trans_101.paketslo) === '1' : false;

  // Filter master LITTR based on search query
  const filteredLittrList = masterLittr.filter(item => {
    const term = searchTerm.toLowerCase();
    const id = String(item.id_littr || '').toLowerCase();
    const name = String(item.nama || '').toLowerCase();
    return id.includes(term) || name.includes(term);
  });

  // Helper renderer for each source table with base styling
  const renderDetailTable = (title, headers, mappedRow) => {
    return (
      <div style={{ marginBottom: '24px' }}>
        {/* Table Title Block */}
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="pi pi-database" style={{ color: '#0f766e', fontSize: '0.85rem' }}></i> {title}
        </h4>
        {/* Table Content */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--bg-card)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(15, 118, 110, 0.05)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, width: '50px', textAlign: 'center' }}>No</th>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappedRow ? (
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>1</td>
                  {Object.keys(mappedRow).map((key, i) => (
                    <td key={i} style={{ padding: '10px 14px' }}>
                      {mappedRow[key] !== null && mappedRow[key] !== undefined ? String(mappedRow[key]) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>-</span>}
                    </td>
                  ))}
                </tr>
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Data Kosong / Tidak Ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* Title Header with Switch Info */}
      <div className="panel-title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 0 }}>
        <div>
          <h2 className="panel-title">{menuName}</h2>
          <p className="panel-subtitle">Proses pemindahan ID LITTR pada transaksi agenda pelanggan ({dbLabel})</p>
        </div>

        {/* Database Mode and Region selection */}
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
                zIndex: 99,
                overflow: 'hidden'
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

      {/* Search Input Form Card */}
      <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || saving}
            style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', height: '42px', flexShrink: 0 }}
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

      {/* Main Grid Content */}
      {hasData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary / Detail Card */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <i className="pi pi-info-circle"></i> Informasi Hasil Pencarian Agenda
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>No Agenda</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{currentData?.trans_101?.noagenda || '-'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ID Pelanggan (IDPEL)</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{currentData?.trans_pdl?.idpel || '-'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Nama Pelanggan</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{currentData?.trans_pdl?.nama || '-'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Tarif / Daya</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                  {currentData?.trans_101?.tarif || '-'}/{currentData?.trans_101?.daya ? `${currentData.trans_101.daya} VA` : '-'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Kategori Transaksi</span>
                <span style={{ 
                  padding: '4px 10px', 
                  backgroundColor: isPaket ? '#fef3c7' : '#d1fae5', 
                  color: isPaket ? '#d97706' : '#059669', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  {isPaket ? 'PAKET (PAKETSLO = 1)' : 'NON-PAKET (PAKETSLO = 0)'}
                </span>
              </div>
            </div>
          </div>

          {/* Individual tables displayed one by one with standard app styling */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <i className="pi pi-table"></i> Rincian Nilai per Sumber Tabel Database
            </h3>
            
            {/* 1. TRANS_KIRIM_KE_LITTR (Only if Paket) */}
            {isPaket && renderDetailTable(
              'TRANS_KIRIM_KE_LITTR',
              ['UNITUPI', 'UNITAP', 'UNITUP', 'NOAGENDA', 'ID_LITTR', 'NOREGSLO', 'KIRIM_KE', 'TGLCATAT', 'TGLKIRIM'],
              currentData?.trans_kirim ? {
                unitupi: currentData.trans_kirim.unitupi,
                unitap: currentData.trans_kirim.unitap,
                unitup: currentData.trans_kirim.unitup,
                noagenda: currentData.trans_kirim.noagenda,
                id_littr: currentData.trans_kirim.id_littr,
                noregslo: currentData.trans_kirim.noregslo,
                kirim_ke: currentData.trans_kirim.kirim_ke,
                tglcatat: currentData.trans_kirim.tglcatat,
                tglkirim: currentData.trans_kirim.tglkirim
              } : null
            )}

            {/* 2. TRANS_101 */}
            {renderDetailTable(
              'TRANS_101',
              ['NOAGENDA', 'TARIF', 'DAYA', 'NOREGSLO', 'ID_LITTR', 'PETUGASCATAT', 'TGLCATAT'],
              currentData?.trans_101 ? {
                noagenda: currentData.trans_101.noagenda,
                tarif: currentData.trans_101.tarif,
                daya: currentData.trans_101.daya,
                noregslo: currentData.trans_101.noregslo,
                id_littr: currentData.trans_101.id_littr,
                petugascatat: currentData.trans_101.petugascatat,
                tglcatat: currentData.trans_101.tglcatat
              } : null
            )}

            {/* 3. TRANS_PDL */}
            {renderDetailTable(
              'TRANS_PDL',
              ['NOAGENDA', 'IDPEL', 'NAMA', 'TARIF', 'DAYA', 'JENIS_TRANSAKSI', 'ID_LITTR', 'NOREGSLO', 'POSTINGPDL', 'MSG1'],
              currentData?.trans_pdl ? {
                noagenda: currentData.trans_pdl.noagenda,
                idpel: currentData.trans_pdl.idpel,
                nama: currentData.trans_pdl.nama,
                tarif: currentData.trans_pdl.tarif,
                daya: currentData.trans_pdl.daya,
                jenis_transaksi: currentData.trans_pdl.jenis_transaksi,
                id_littr: currentData.trans_pdl.id_littr,
                noregslo: currentData.trans_pdl.noregslo,
                postingpdl: currentData.trans_pdl.postingpdl,
                msg1: currentData.trans_pdl.msg1
              } : null
            )}

            {/* 4. MOHON_PLNPAY (Only if Paket) */}
            {isPaket && renderDetailTable(
              'MOHON_PLNPAY',
              ['NOAGENDA', 'NO_SIP', 'ID_LITTR', 'KDBOKING', 'TGLCATAT', 'TGLKIRIM', 'RC_KIRIM', 'KET_KIRIM'],
              currentData?.trans_plnpay ? {
                noagenda: currentData.trans_plnpay.noagenda,
                no_sip: currentData.trans_plnpay.no_sip,
                id_littr: currentData.trans_plnpay.id_littr,
                kdboking: currentData.trans_plnpay.kdboking,
                tglcatat: currentData.trans_plnpay.tglcatat,
                tglkirim: currentData.trans_plnpay.tglkirim,
                rc_kirim: currentData.trans_plnpay.rc_kirim,
                ket_kirim: currentData.trans_plnpay.ket_kirim
              } : null
            )}
          </div>

          {/* Form Action Realokasi */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <i className="pi pi-share-alt"></i> Eksekusi Realokasi ID LITTR Baru
            </h3>

            <form onSubmit={handleSaveRealokasi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Moved Nomor Tiket input here */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '500px' }}>
                <label htmlFor="tiket-save" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Nomor Tiket / Log ID (Proses Update)</label>
                <input
                  type="text"
                  id="tiket-save"
                  placeholder="Masukkan Nomor Tiket (e.g. TKT001...)"
                  value={tiket}
                  onChange={(e) => setTiket(e.target.value)}
                  disabled={saving}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', maxWidth: '500px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>ID LITTR Baru</label>
                
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ketik untuk mencari ID LITTR atau Nama..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setDropdownOpen(true);
                      if (selectedLittrId) {
                        setSelectedLittrId('');
                        setSelectedLittrName('');
                      }
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    disabled={saving}
                    style={{ 
                      width: '100%', 
                      padding: '10px 36px 10px 14px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--bg-input)', 
                      color: 'var(--text-main)', 
                      fontSize: '0.9rem' 
                    }}
                  />
                  <i 
                    className={`pi ${dropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`} 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  />
                </div>

                {/* Dropdown Options List */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 999
                  }}>
                    {filteredLittrList.length === 0 ? (
                      <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada data ditemukan</div>
                    ) : (
                      filteredLittrList.map((item) => (
                        <div
                          key={item.id_littr}
                          onClick={() => {
                            setSelectedLittrId(item.id_littr);
                            setSelectedLittrName(item.nama);
                            setSearchTerm(`${item.id_littr} - ${item.nama}`);
                            setDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: selectedLittrId === item.id_littr ? '#f0fdf4' : 'transparent',
                            color: selectedLittrId === item.id_littr ? '#15803d' : 'var(--text-main)',
                            fontWeight: selectedLittrId === item.id_littr ? 600 : 'normal'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedLittrId !== item.id_littr) {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedLittrId !== item.id_littr) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <strong style={{ color: '#0f766e' }}>{item.id_littr}</strong> - {item.nama}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedLittrId && (
                <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-check-circle" style={{ color: '#16a34a' }}></i>
                  <span style={{ fontSize: '0.85rem', color: '#166534' }}>
                    Terpilih: <strong>{selectedLittrId}</strong> ({selectedLittrName})
                  </span>
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !selectedLittrId || !tiket.trim()}
                  style={{ padding: '12px 28px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? (
                    <>
                      <i className="pi pi-spin pi-spinner"></i> Menyimpan Realokasi...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-save"></i> Eksekusi Simpan Realokasi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
