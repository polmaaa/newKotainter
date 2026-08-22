import React from 'react';

export default function DeveloperInfo({ apiBaseUrl }) {
  const swaggerUrl = `${apiBaseUrl}/Api_docs`;

  const menusData = [
    {
      id: 1,
      name: 'Update PNJ',
      parent: 'Pelayanan Pelanggan',
      oracle: {
        controller: 'api/application/controllers/api/UpdatePnj.php',
        model: 'api/application/models/Mpnj.php',
        apis: [
          { method: 'GET', path: '/api/UpdatePnj/get_user', desc: 'Mencari user PNJ di database Oracle' },
          { method: 'POST', path: '/api/UpdatePnj/save_pnj', desc: 'Menyimpan pembaruan unit kerja PNJ di Oracle' }
        ]
      },
      postgres: {
        controller: 'api/application/controllers/api/UpdatePnj_pg.php',
        model: 'api/application/models/Mpnj.php',
        apis: [
          { method: 'GET', path: '/api/UpdatePnj_pg/get_user', desc: 'Mencari user PNJ di database PostgreSQL' },
          { method: 'POST', path: '/api/UpdatePnj_pg/save_pnj', desc: 'Menyimpan pembaruan unit kerja PNJ di PostgreSQL' }
        ]
      }
    },
    {
      id: 2,
      name: 'Update User',
      parent: 'Manajemen User',
      oracle: {
        controller: 'api/application/controllers/api/UpdateUser.php',
        model: 'api/application/models/Mmanajemenuser.php',
        apis: [
          { method: 'GET', path: '/api/UpdateUser/get_user', desc: 'Mencari user manajemen di database Oracle' },
          { method: 'POST', path: '/api/UpdateUser/save_user', desc: 'Update status / password user di Oracle' }
        ]
      },
      postgres: {
        controller: 'api/application/controllers/api/UpdateUser_pg.php',
        model: 'api/application/models/Mmanajemenuser.php',
        apis: [
          { method: 'GET', path: '/api/UpdateUser_pg/get_user', desc: 'Mencari user manajemen di database PostgreSQL' },
          { method: 'POST', path: '/api/UpdateUser_pg/save_user', desc: 'Update status / password user di PostgreSQL' }
        ]
      }
    },
    {
      id: 3,
      name: 'Update Role User',
      parent: 'Manajemen User',
      oracle: {
        controller: 'api/application/controllers/api/UpdateRoleUser.php',
        model: 'api/application/models/Mmanajemenuser.php',
        apis: [
          { method: 'GET', path: '/api/UpdateRoleUser/get_user', desc: 'Mencari detail role user di database Oracle' },
          { method: 'POST', path: '/api/UpdateRoleUser/save_role', desc: 'Menyimpan pembaruan level role user di Oracle' }
        ]
      },
      postgres: {
        controller: 'api/application/controllers/api/UpdateRoleUser_pg.php',
        model: 'api/application/models/Mmanajemenuser.php',
        apis: [
          { method: 'GET', path: '/api/UpdateRoleUser_pg/get_user', desc: 'Mencari detail role user di database PostgreSQL' },
          { method: 'POST', path: '/api/UpdateRoleUser_pg/save_role', desc: 'Menyimpan pembaruan level role user di PostgreSQL' }
        ]
      }
    },
    {
      id: 4,
      name: 'Informasi Data Tabel',
      parent: 'Back Office',
      oracle: {
        controller: 'api/application/controllers/api/InfoDataTabel.php',
        model: 'api/application/models/Mbackoffice.php',
        apis: [
          { method: 'GET', path: '/api/InfoDataTabel/get_data', desc: 'Mencari IDPEL pada view opharapp.vw_idpel_bermohon di Oracle' }
        ]
      },
      postgres: {
        controller: 'api/application/controllers/api/InfoDataTabel_pg.php',
        model: 'api/application/models/Mbackoffice.php',
        apis: [
          { method: 'GET', path: '/api/InfoDataTabel_pg/get_data', desc: 'Mencari IDPEL pada view opharapp.vw_idpel_bermohon di PostgreSQL' }
        ]
      }
    },
    {
      id: 5,
      name: 'Mutasi Unit CRM',
      parent: 'CRM',
      oracle: null,
      postgres: {
        controller: 'api/application/controllers/api/Crm_mutasi_unit.php',
        model: 'api/application/models/Mcrm.php',
        apis: [
          { method: 'GET', path: '/api/Crm_mutasi_unit/get_user', desc: 'Mencari user CRM di database PostgreSQL Produksi' },
          { method: 'POST', path: '/api/Crm_mutasi_unit/save_mutasi', desc: 'Menyimpan pembaruan unit kerja user CRM' }
        ]
      }
    },
    {
      id: 6,
      name: 'Update Role CRM',
      parent: 'CRM',
      oracle: null,
      postgres: {
        controller: 'api/application/controllers/api/Crm_update_role.php',
        model: 'api/application/models/Mcrm.php',
        apis: [
          { method: 'GET', path: '/api/Crm_update_role/get_user', desc: 'Mencari user CRM di database PostgreSQL Produksi' },
          { method: 'GET', path: '/api/Crm_update_role/get_roles', desc: 'Mengambil list master data role CRM aktif' },
          { method: 'POST', path: '/api/Crm_update_role/save_role', desc: 'Menyimpan pembaruan level role user CRM' }
        ]
      }
    }
  ];

  return (
    <div className="dev-info-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title block */}
      <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="pi pi-code" style={{ color: '#0f766e' }}></i> Developer Workspace & API Docs
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Informasi pemetaan struktur file koding Menu ↔️ Controller ↔️ Model ↔️ API Endpoint dan referensi Swagger.
          </p>
        </div>
        <a 
          href={swaggerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <i className="pi pi-external-link"></i> Buka Swagger API Docs
        </a>
      </div>

      {/* Main card grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {menusData.map((menu) => (
          <div 
            key={menu.id} 
            className="content-card" 
            style={{ 
              padding: '20px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Header Menu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f766e', textTransform: 'uppercase', tracking: 'wide' }}>
                  {menu.parent}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  {menu.id}. {menu.name}
                </h3>
              </div>
              <span style={{ padding: '4px 10px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Menu ID: {menu.id}
              </span>
            </div>

            {/* Columns Oracle vs Postgres */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Oracle block */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fdfbf7', border: '1px solid #f5efe6' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#b45309', borderRadius: '50%' }}></span>
                  Database Oracle Version
                </h4>
                {menu.oracle ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Controller:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#be123c', backgroundColor: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>{menu.oracle.controller}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Model:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>{menu.oracle.model}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>API Endpoints:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {menu.oracle.apis.map((api, idx) => (
                          <div key={idx} style={{ padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 700, color: api.method === 'GET' ? '#0d9488' : '#e11d48', marginRight: '6px' }}>{api.method}</span>
                            <code style={{ fontWeight: 600 }}>{api.path}</code>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{api.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Menu ini tidak memiliki alur kueri Oracle (PostgreSQL Only).
                  </span>
                )}
              </div>

              {/* PostgreSQL block */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#15803d', borderRadius: '50%' }}></span>
                  Database PostgreSQL Version
                </h4>
                {menu.postgres ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Controller:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#be123c', backgroundColor: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>{menu.postgres.controller}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>Model:</strong>
                      <code style={{ wordBreak: 'break-all', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>{menu.postgres.model}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>API Endpoints:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {menu.postgres.apis.map((api, idx) => (
                          <div key={idx} style={{ padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 700, color: api.method === 'GET' ? '#0d9488' : '#e11d48', marginRight: '6px' }}>{api.method}</span>
                            <code style={{ fontWeight: 600 }}>{api.path}</code>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{api.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Menu ini tidak memiliki alur kueri PostgreSQL (Oracle Only).
                  </span>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
