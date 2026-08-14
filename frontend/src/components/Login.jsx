import React, { useState, useEffect, useRef } from 'react';

export default function Login({ apiBaseUrl, onLoginSuccess }) {
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
        // Panggil handler sukses login
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
          <img src="/newkotainter/ap2t.jpg" alt="Logo PLN AP2T" />
          <h2>NewKotainter</h2>
          <p>Masukkan kredensial Oracle untuk mengakses sistem workspace terpadu.</p>
        </div>

        {error && (
          <div id="login-error-alert" className="alert alert-danger" style={{ display: 'flex' }}>
            <i className="pi pi-exclamation-circle" style={{ marginRight: '8px' }}></i>
            <span id="login-error-msg">{error}</span>
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">ID User</label>
            <div className="input-wrapper">
              <i className="pi pi-user"></i>
              <input
                ref={usernameRef}
                type="text"
                id="username"
                placeholder="Contoh: PS.PUSAT.POLMA"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi (Password)</label>
            <div className="input-wrapper">
              <i className="pi pi-lock"></i>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
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
