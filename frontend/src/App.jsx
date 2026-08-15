import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import Setting from './components/Setting';
import Help from './components/Help';
import DetailModal from './components/DetailModal';

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

  // Database activities data
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [dbStatus, setDbStatus] = useState({ oracle: false, postgresql: false });
  const [selectedLog, setSelectedLog] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    site_name: 'NewKotainter',
    site_description: 'v2.0 REST API & Workspace Terpadu'
  });
  const [dbConfig, setDbConfig] = useState(null);

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
          const statusText = `📡 STATUS KONEKSI DATABASE TERKINI:
------------------------------------------
1. Oracle (Utama): ${statusDb.oracle ? '🟢 ONLINE' : '🔴 OFFLINE'}
2. PostgreSQL (Utama): ${statusDb.postgresql ? '🟢 ONLINE' : '🔴 OFFLINE'}
3. FSO Oracle: ${statusDb.fso_oracle ? '🟢 ONLINE' : '🔴 OFFLINE'}
4. FSO PostgreSQL: ${statusDb.fso_postgres ? '🟢 ONLINE' : '🔴 OFFLINE'}
------------------------------------------
Semua konfigurasi database aktif telah divalidasi.`;
          alert(statusText);
        }
      }
    } catch (err) {
      console.error('Gagal memverifikasi status koneksi DB:', err);
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

  const renderTabContent = () => {
    switch (activeTabId) {
      case 'dashboard':
        return (
          <Dashboard 
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
            apiBaseUrl={API_BASE_URL} 
            onSuccess={loadLogs} 
          />
        );
      case 'setting':
        return (
          <Setting 
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
          />
        );
      case 'bantuan':
        return <Help />;
      default:
        // Submenu templates
        const activeTab = tabs.find(t => t.id === activeTabId);
        const title = activeTab ? activeTab.title : '';
        return (
          <div>
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
          />
          
          <div className="workspace">
            <Header 
              user={user} 
              activeTabTitle={activeTabTitle}
              onLogout={handleLogout} 
            />
            
            {/* Dynamic Tabs Bar */}
            <div className="tabs-container" id="tabs-bar">
              {tabs.map(tab => (
                <div 
                  key={tab.id} 
                  className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
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
            
            <main className="workspace-area" style={{ flexGrow: 1, overflowY: 'auto' }}>
              {/* Tab Content Panels Container */}
              <div className="tab-panels" id="tab-panels">
                <div className="tab-panel active">
                  {renderTabContent()}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
