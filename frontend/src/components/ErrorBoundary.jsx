import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', color: '#b91c1c', backgroundColor: '#fef2f2', minHeight: '100vh', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Sistem Mengalami Kendala (Runtime Error)</h1>
          <p style={{ fontWeight: 'bold' }}>Pesan Error: {this.state.error && this.state.error.toString()}</p>
          {this.state.errorInfo && (
            <pre style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
          >
            Muat Ulang Halaman (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
