import React, { useState, useEffect, useRef } from 'react';

export default function Login({ apiBaseUrl, onLoginSuccess, siteName, siteDescription }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setPassword('');
        onLoginSuccess(result.data);
      } else {
        setError(result.message || 'Username atau password salah.');
      }
    } catch (err) {
      console.error('Gagal login:', err);
      setError('Gagal terhubung ke server API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo"><i className="pi pi-shield"></i></div>
          <h1 className="login-title">{siteName || 'NewKotainter'}</h1>
          <p className="login-subtitle">{siteDescription || 'Masuk ke API & Workspace Terpadu'}</p>
        </div>

        {error && (
          <div id="login-error-alert" className="login-alert" style={{ display: 'flex' }}>
            <i className="pi pi-exclamation-circle" style={{ marginRight: '8px', marginTop: '2px' }}></i>
            <span id="login-error-msg">{error}</span>
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="username">Username</label>
            <input
              ref={usernameRef}
              type="text"
              id="username"
              className="form-input-text"
              placeholder="Masukkan username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-row" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input-text"
              placeholder="Masukkan password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner" style={{ marginRight: '8px' }}></i>
                Memproses...
              </>
            ) : (
              <>
                <i className="pi pi-sign-in" style={{ marginRight: '8px' }}></i>
                Masuk Sistem
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
