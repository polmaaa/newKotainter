import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import DbConfig from './components/DbConfig';
import Help from './components/Help';
import DetailModal from './components/DetailModal';
import UsersGrid from './components/UsersGrid';

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

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setUser(result.data);
          loadLogs();
          checkDbStatus();
        }
      } catch (err) {
        console.error('Sesi login belum aktif:', err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
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
        setLogs(result.data.logs);
        setDbStatus(result.data.db_status);
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
        setDbStatus(result.data);
        if (alertUser) {
          alert(`Status Database Terkini:\n- Oracle: ${result.data.oracle ? 'ONLINE' : 'OFFLINE'}\n- PostgreSQL: ${result.data.postgresql ? 'ONLINE' : 'OFFLINE'}`);
        }
      }
    } catch (err) {
      console.error('Gagal memverifikasi status koneksi DB:', err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setTransitionState('logging-in');
    setTimeout(() => {
      setUser(userData);
      setTransitionState('');
      loadLogs();
      checkDbStatus();
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
    // Check if tab already exists
    const exists = tabs.some(tab => tab.id === tabId);
    if (!exists) {
      setTabs(prev => [...prev, { id: tabId, title, closable: true }]);
    }
    setActiveTabId(tabId);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleCloseTab = (tabId) => {
    // Do not close non-closable tabs
    const targetTab = tabs.find(t => t.id === tabId);
    if (targetTab && !targetTab.closable) return;

    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);

    // If closed tab was active, switch to nearest remaining tab
    if (activeTabId === tabId) {
      const lastIndex = tabs.findIndex(t => t.id === tabId);
      const nextActiveIndex = Math.max(0, lastIndex - 1);
      setActiveTabId(filtered[nextActiveIndex].id);
    }
  };

  const renderTabContent = () => {
    switch (activeTabId) {
      case 'dashboard':
        return (
          <Dashboard 
            logs={logs} 
            loading={loadingLogs} 
            onRefresh={loadLogs} 
            onViewDetails={setSelectedLog} 
          />
        );
      case 'save_log':
        return (
          <TicketForm 
            apiBaseUrl={API_BASE_URL} 
            onSuccess={loadLogs} 
          />
        );
      case 'db_config':
        return (
          <DbConfig 
            onCheckConnection={() => checkDbStatus(true)} 
          />
        );
      case 'bantuan':
        return <Help />;
      case 'users_ap2t':
        return <UsersGrid />;
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
          <Login apiBaseUrl={API_BASE_URL} onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
      
      {showApp && (
        <div 
          className={`app-layout-wrapper ${transitionState === 'logging-in' ? 'fade-in-auth' : (transitionState === 'logging-out' ? 'fade-out-auth' : '')}`}
          style={{ display: 'flex', width: '100%', minHeight: '100vh' }}
        >
          <Sidebar 
            user={user} 
            activeTabId={activeTabId} 
            onOpenTab={handleOpenTab} 
            onLogout={handleLogout} 
            sidebarOpen={sidebarOpen} 
          />
          
          <div className="main-viewport">
            <Header 
              user={user} 
              dbStatus={dbStatus} 
              onLogout={handleLogout} 
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            />
            
            <main className="workspace-area">
              {/* Workspace Tab Bar */}
              <div className="tab-bar">
                {tabs.map(tab => (
                  <div 
                    key={tab.id} 
                    className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <span>{tab.title}</span>
                    {tab.closable && (
                      <button 
                        className="tab-close" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tab.id);
                        }}
                      >
                        <i className="pi pi-times" style={{ fontSize: '0.6rem' }}></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Workspace Workspace view content */}
              <div style={{ marginTop: '16px' }}>
                {renderTabContent()}
              </div>
            </main>
          </div>
        </div>
      )}

      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
