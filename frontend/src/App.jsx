import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import Setting from './components/Setting';
import Help from './components/Help';
import DetailModal from './components/DetailModal';
import UpdatePnj from './components/UpdatePnj';

const API_BASE_URL = import.meta.env.DEV ? '/api' : '/newkotainter/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [transitionState, setTransitionState] = useState(''); // 'logging-in', 'logging-out', ''
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Workspace tabs management
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [tabs, setTabs] = useState([
    { id: 'dashboard', title: 'Dashboard', closable: false }
  ]);

  const tabsRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const checkForOverflow = () => {
    requestAnimationFrame(() => {
      if (tabsRef.current) {
        const { scrollWidth, clientWidth } = tabsRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    });
  };

  useEffect(() => {
    checkForOverflow();
    window.addEventListener('resize', checkForOverflow);
    return () => window.removeEventListener('resize', checkForOverflow);
  }, [tabs]);

  const handleScrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Database activities data
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [dbStatus, setDbStatus] = useState({ oracle: false, postgresql: false });
  const [selectedLog, setSelectedLog] = useState(null);
  const [dbStatusModal, setDbStatusModal] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    site_name: 'NewKotainter',
    site_description: 'v2.0 REST API & Workspace Terpadu'
  });
  const [dbConfig, setDbConfig] = useState(null);
  const [toast, setToast] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [dynamicMenus, setDynamicMenus] = useState([]);
  const [dbMode, setDbMode] = useState('oracle');

  const loadDynamicMenus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu_config/get_menus`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setDynamicMenus(result.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat menu dinamis:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => setToast(null), 4000);
  };

  const loadDbConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db_config/get_config?_=${Date.now()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setDbConfig(result.data);
      }
    } catch (err) {
      console.error('Gagal mengambil konfigurasi database:', err);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/system_info`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success' && result.data) {
        setSystemSettings(result.data);
      }
    } catch (err) {
      console.error('Gagal memuat info sistem publik:', err);
    }
  };

  useEffect(() => {
    if (systemSettings && systemSettings.site_name) {
      document.title = systemSettings.site_name;
    }
  }, [systemSettings]);



  // Check auth session on mount
  useEffect(() => {
    async function init() {
      await fetchSystemInfo();
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setUser(result.data.user || { id_user: 'User', nama_user: 'User', level_user: 'Visitor' });
          if (result.data.system_settings) {
            setSystemSettings(result.data.system_settings);
          }
          loadLogs();
          checkDbStatus();
          loadDbConfig();
          loadDynamicMenus();
        }
      } catch (err) {
        console.error('Sesi login belum aktif:', err);
      } finally {
        setCheckingAuth(false);
      }
    }
    init();
  }, []);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/get_logs`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const dataLogs = result.data && Array.isArray(result.data.logs) ? result.data.logs : [];
        const statusDb = result.data && result.data.db_status ? result.data.db_status : { oracle: false, postgresql: false };
        setLogs(dataLogs);
        setDbStatus(statusDb);
      }
    } catch (err) {
      console.error('Gagal mengambil data logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const checkDbStatus = async (alertUser = false) => {
    if (alertUser) setCheckingDb(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/get_db_status`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const statusDb = result.data ? result.data : { oracle: false, postgresql: false, fso_oracle: false, fso_postgres: false };
        setDbStatus(statusDb);
        if (alertUser) {
          setDbStatusModal(statusDb);
          showToast('Status koneksi database berhasil diverifikasi!', 'success');
        }
      } else {
        if (alertUser) showToast('Gagal memverifikasi status koneksi.', 'error');
      }
    } catch (err) {
      console.error('Gagal memverifikasi status koneksi DB:', err);
      if (alertUser) showToast('Gagal terhubung ke server API.', 'error');
    } finally {
      if (alertUser) setCheckingDb(false);
    }
  };

  const handleLoginSuccess = (loginData) => {
    setTransitionState('logging-in');
    setTimeout(() => {
      setUser(loginData.user || { id_user: 'User', nama_user: 'User', level_user: 'Visitor' });
      if (loginData.system_settings) {
        setSystemSettings(loginData.system_settings);
      }
      setTransitionState('');
      loadLogs();
      checkDbStatus();
      loadDbConfig();
      loadDynamicMenus();
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
    } catch (err) {
      console.error('Gagal logout API:', err);
    }

    setTransitionState('logging-out');
    setTimeout(() => {
      setUser(null);
      setTransitionState('');
      setTabs([{ id: 'dashboard', title: 'Dashboard', closable: false }]);
      setActiveTabId('dashboard');
    }, 300);
  };

  const handleOpenTab = (tabId, title) => {
    const exists = tabs.some(tab => tab.id === tabId);
    if (!exists) {
      setTabs(prev => [...prev, { id: tabId, title, closable: true }]);
    }
    setActiveTabId(tabId);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleCloseTab = (tabId) => {
    const targetTab = tabs.find(t => t.id === tabId);
    if (targetTab && !targetTab.closable) return;

    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);

    if (activeTabId === tabId) {
      const lastIndex = tabs.findIndex(t => t.id === tabId);
      const nextActiveIndex = Math.max(0, lastIndex - 1);
      setActiveTabId(filtered[nextActiveIndex].id);
    }
  };

  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'dashboard': return 'home';
      case 'save_log': return 'plus-circle';
      case 'role_permissions': return 'key';
      case 'crm': return 'chart-line';
      case 'ap2t_staging': return 'server';
      case 'fso': return 'folder';
      case 'setting': return 'cog';
      case 'bantuan': return 'question-circle';
      case 'UpdatePnj':
      case 'UpdatePNJ':
      case 'UpdatePnj_pg':
      case 'UpdatePNJ_pg': return 'user-edit';
      default: return 'folder';
    }
  };

  const getOraclePresetName = (tns) => {
    if (!tns) return 'Kustom';
    if (tns.indexOf('10.14.159.10') !== -1) return 'Truno';
    if (tns.indexOf('10.14.158.10') !== -1) return 'Gandul';
    return 'Kustom';
  };

  const getFsoOraclePresetName = (tns) => {
    if (!tns) return 'Kustom';
    if (tns.indexOf('10.14.212.11') !== -1) return 'Truno';
    if (tns.indexOf('10.14.211.11') !== -1) return 'Gandul';
    return 'Kustom';
  };

  const renderTabContent = (tabId) => {
    // 1. Check if it is a dynamic menu and see if it is configured for the current dbMode
    const menu = dynamicMenus.find(m => m.oracle === tabId || m.postgre === tabId);
    if (menu) {
      const isOracleAvailable = menu.oracle !== null && menu.oracle !== undefined && menu.oracle.trim() !== '';
      const isPostgreAvailable = menu.postgre !== null && menu.postgre !== undefined && menu.postgre.trim() !== '';
      const isCurrentAvailable = dbMode === 'oracle' ? isOracleAvailable : isPostgreAvailable;

      if (!isCurrentAvailable) {
        return (
          <div key={`not-available-${tabId}-${dbMode}`} style={{ padding: '24px' }}>
            <div className="panel-title-area">
              <h2 className="panel-title" style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="pi pi-exclamation-triangle"></i> Menu Tidak Tersedia
              </h2>
              <p className="panel-subtitle">Modul {menu.menu_name} tidak dikonfigurasi untuk database ini.</p>
            </div>
            <div className="content-card" style={{ borderLeft: '4px solid #ef4444', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Maaf, menu <strong>{menu.menu_name}</strong> saat ini tidak tersedia atau dinonaktifkan untuk koneksi database <strong>{dbMode === 'oracle' ? 'Oracle' : 'PostgreSQL'}</strong>.
              </p>
            </div>
          </div>
        );
      }
    }

    switch (tabId) {
      case 'dashboard':
        return (
          <Dashboard 
            key={`dashboard-${dbMode}`}
            logs={logs}
            dbStatus={dbStatus} 
            loading={loadingLogs} 
            onRefresh={loadLogs} 
            onViewDetails={setSelectedLog} 
            oraclePresetName={dbConfig ? getOraclePresetName(dbConfig.oracle_tns) : '...'}
            fsoOraclePresetName={dbConfig ? getFsoOraclePresetName(dbConfig.fso_oracle_tns) : '...'}
          />
        );
      case 'save_log':
        return (
          <TicketForm 
            key={`save_log-${dbMode}`}
            apiBaseUrl={API_BASE_URL} 
            onSuccess={loadLogs} 
            showToast={showToast}
          />
        );
      case 'setting':
        return (
          <Setting 
            key={`setting-${dbMode}`}
            user={user}
            onCheckConnection={() => {
              checkDbStatus(true);
              loadDbConfig();
            }} 
            apiBaseUrl={API_BASE_URL}
            onUpdateSystemSettings={(name, desc) => {
              setSystemSettings({ site_name: name, site_description: desc });
              loadDbConfig();
            }}
            showToast={showToast}
            checkingDb={checkingDb}
            onRefreshMenus={loadDynamicMenus}
          />
        );
      case 'bantuan':
        return <Help key={`help-${dbMode}`} />;
      case 'UpdatePnj':
      case 'UpdatePNJ':
      case 'UpdatePnj_pg':
      case 'UpdatePNJ_pg':
        return (
          <UpdatePnj 
            key={`updatepnj-${dbMode}`}
            user={user}
            apiBaseUrl={API_BASE_URL}
            showToast={showToast}
            isPostgres={dbMode === 'postgre'}
          />
        );
      default:
        // Submenu templates
        const activeTab = tabs.find(t => t.id === tabId);
        const title = activeTab ? activeTab.title : '';
        return (
          <div key={`fallback-${tabId}-${dbMode}`}>
            <div className="panel-title-area">
              <h2 className="panel-title">{title}</h2>
              <p className="panel-subtitle">Halaman fungsional untuk modul {title}.</p>
            </div>
            <div className="content-card">
              <p style={{ color: 'var(--text-muted)' }}>
                Modul <strong>{title}</strong> saat ini kosong dan akan dikembangkan di masa mendatang.
              </p>
            </div>
          </div>
        );
    }
  };

  const activeTabObj = tabs.find(t => t.id === activeTabId);
  const activeTabTitle = activeTabObj ? activeTabObj.title : 'Dashboard';

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#475569', fontFamily: 'system-ui, sans-serif' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', marginBottom: '12px', color: '#0f766e' }}></i>
        <div>Memeriksa status sesi NewKotainter...</div>
      </div>
    );
  }

  const showLogin = !user || transitionState === 'logging-out';
  const showApp = user || transitionState === 'logging-in';

  return (
    <>
      {showLogin && (
        <div className={transitionState === 'logging-out' ? 'fade-in-auth' : (transitionState === 'logging-in' ? 'fade-out-auth' : '')}>
          <Login apiBaseUrl={API_BASE_URL} onLoginSuccess={handleLoginSuccess} siteName={systemSettings.site_name} siteDescription={systemSettings.site_description} />
        </div>
      )}
      
      {showApp && (
        <div 
          id="app-container"
          className={`app-container ${transitionState === 'logging-in' ? 'fade-in-auth' : (transitionState === 'logging-out' ? 'fade-out-auth' : '')}`}
        >
          <Sidebar 
            user={user} 
            activeTabId={activeTabId} 
            onOpenTab={handleOpenTab} 
            onLogout={handleLogout} 
            sidebarOpen={sidebarOpen} 
            siteName={systemSettings.site_name}
            dynamicMenus={dynamicMenus}
            dbMode={dbMode}
          />
          
          <div className="workspace">
            <Header 
              user={user} 
              activeTabTitle={activeTabTitle}
              onLogout={handleLogout} 
              dbMode={dbMode}
              onDbModeChange={setDbMode}
            />
            
            {/* Dynamic Tabs Bar with Prev/Next buttons (conditional render & no margins) */}
            <div className="tabs-container" id="tabs-bar" style={{ display: 'flex', alignItems: 'center', padding: '0', overflow: 'hidden', gap: '0' }}>
              {showScrollButtons && (
                <button 
                  type="button" 
                  onClick={() => handleScrollTabs('left')}
                  style={{
                    border: 'none',
                    borderRight: '1px solid var(--border-color)',
                    background: '#e2e8f0',
                    height: '100%',
                    width: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    margin: 0,
                    padding: 0
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <i className="pi pi-chevron-left" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}></i>
                </button>
              )}

              <div 
                ref={tabsRef}
                style={{
                  display: 'flex',
                  flexGrow: 1,
                  overflowX: 'hidden',
                  scrollBehavior: 'smooth',
                  gap: '2px',
                  alignItems: 'flex-end',
                  height: '100%',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  padding: showScrollButtons ? '0 4px' : '0 16px'
                }}
              >
                <style>{`
                  #tabs-bar div::-webkit-scrollbar {
                    display: none !important;
                  }
                `}</style>
                {tabs.map(tab => (
                  <div 
                    key={tab.id} 
                    className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                    style={{ flexShrink: 0 }}
                  >
                    <span className="tab-icon"><i className={`pi pi-${getTabIcon(tab.id)}`}></i></span>
                    <span className="tab-title">{tab.title}</span>
                    {tab.closable && (
                      <span 
                        className="tab-close" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tab.id);
                        }}
                        style={{ marginLeft: '8px', cursor: 'pointer' }}
                      >
                        &times;
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {showScrollButtons && (
                <button 
                  type="button" 
                  onClick={() => handleScrollTabs('right')}
                  style={{
                    border: 'none',
                    borderLeft: '1px solid var(--border-color)',
                    background: '#e2e8f0',
                    height: '100%',
                    width: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    margin: 0,
                    padding: 0
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <i className="pi pi-chevron-right" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}></i>
                </button>
              )}
            </div>
            
            <main className="workspace-area" style={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
              {/* Tab Content Panels Container */}
              <div className="tab-panels" id="tab-panels" style={{ width: '100%', height: '100%' }}>
                {tabs.map(tab => (
                  <div 
                    key={tab.id} 
                    className={`tab-panel ${activeTabId === tab.id ? 'active' : ''}`}
                    style={{ display: activeTabId === tab.id ? 'block' : 'none', width: '100%', height: '100%' }}
                  >
                    {renderTabContent(tab.id)}
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      )}

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />

      {dbStatusModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '440px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="pi pi-wifi"></i> Status Koneksi Database
              </h3>
              <button 
                onClick={() => setDbStatusModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '500' }}>1. Oracle (Utama)</span>
                <span className={`badge ${dbStatusModal.oracle ? 'badge-success' : 'badge-error'}`} style={{ minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                  {dbStatusModal.oracle ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '500' }}>2. PostgreSQL (Utama)</span>
                <span className={`badge ${dbStatusModal.postgresql ? 'badge-success' : 'badge-error'}`} style={{ minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                  {dbStatusModal.postgresql ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '500' }}>3. FSO Oracle</span>
                <span className={`badge ${dbStatusModal.fso_oracle ? 'badge-success' : 'badge-error'}`} style={{ minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                  {dbStatusModal.fso_oracle ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '500' }}>4. FSO PostgreSQL</span>
                <span className={`badge ${dbStatusModal.fso_postgres ? 'badge-success' : 'badge-error'}`} style={{ minWidth: '85px', textAlign: 'center', display: 'inline-block' }}>
                  {dbStatusModal.fso_postgres ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <button className="btn btn-primary" onClick={() => setDbStatusModal(null)} style={{ padding: '8px 24px' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Toast Notification in Top-Right Corner */}
      {toast && (
        <>
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <div 
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              backgroundColor: toast.type === 'success' ? '#0f766e' : (toast.type === 'error' ? '#e11d48' : '#d97706'),
              color: '#ffffff',
              padding: '14px 20px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 500,
              minWidth: '300px',
              maxWidth: '450px',
              animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <i className={`pi ${toast.type === 'success' ? 'pi-check-circle' : (toast.type === 'error' ? 'pi-exclamation-circle' : 'pi-info-circle')}`} style={{ fontSize: '1.25rem' }}></i>
            <div style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</div>
            <i 
              className="pi pi-times" 
              style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: 0.7, padding: '4px' }} 
              onClick={() => setToast(null)}
            />
          </div>
        </>
      )}
    </>
  );
}
