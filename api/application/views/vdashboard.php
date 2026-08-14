<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- PrimeIcons for icons -->
    <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css">
    
    <!-- Custom Design System (Teal & Slate Gray Premium Corporate Scheme) -->
    <style>
        :root {
            /* New Color Palette: Elegant Deep Teal & Cool Slate */
            --primary: #0f766e; /* Deep Teal */
            --primary-hover: #115e59;
            --primary-light: #f0fdfa; /* Teal 50 */
            --bg-body: #f1f5f9; /* Cool Slate Gray */
            --bg-card: #ffffff;
            --text-main: #0f172a; /* Slate 900 */
            --text-muted: #475569; /* Slate 600 */
            --border-color: #cbd5e1; /* Slate 300 */
            --border-light: #e2e8f0; /* Slate 200 */
            
            --success: #059669; /* Emerald 600 */
            --success-bg: #ecfdf5;
            --warning: #d97706;
            --warning-bg: #fffbeb;
            --error: #e11d48; /* Rose 600 */
            --error-bg: #fff1f2;
            
            --oracle: #0284c7;
            --oracle-bg: #f0f9ff;
            --postgres: #7c3aed;
            --postgres-bg: #f5f3ff;
            
            --sidebar-width: 260px;
            --header-height: 64px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
        }

        html {
            font-size: 14px; /* Meningkatkan sedikit basis root rem */
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            height: 100vh;
            overflow: hidden;
            font-size: 1rem;
        }

        /* Layout Structure */
        .app-container {
            display: flex;
            height: 100vh;
            width: 100vw;
        }

        /* Sidebar Styling */
        .sidebar {
            width: var(--sidebar-width);
            background-color: var(--bg-card);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 100;
        }

        .sidebar-brand {
            padding: 20px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border-light);
        }

        .brand-icon {
            width: 32px;
            height: 32px;
            background-color: var(--primary);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .brand-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--primary);
            letter-spacing: -0.025em;
        }

        .sidebar-menu {
            padding: 16px 12px;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex-grow: 1;
            overflow-y: auto;
        }

        /* Parent Menu Item */
        .sidebar-menu-parent {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            color: var(--text-muted);
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
            margin-top: 4px;
        }

        .sidebar-menu-parent:hover {
            background-color: var(--border-light);
            color: var(--text-main);
        }

        .sidebar-menu-parent .menu-label {
            display: flex;
            align-items: center;
        }

        .sidebar-menu-parent .menu-label i {
            margin-right: 12px;
            font-size: 1rem;
        }

        .sidebar-menu-parent .toggle-icon {
            font-size: 0.7rem;
            transition: transform 0.25s ease;
        }

        .sidebar-menu-parent.open {
            color: var(--text-main);
            background-color: var(--border-light);
        }

        .sidebar-menu-parent.open .toggle-icon {
            transform: rotate(180deg);
        }

        /* Submenu Container */
        .sidebar-submenu {
            list-style: none;
            padding-left: 28px;
            display: none; /* Hidden by default */
            flex-direction: column;
            gap: 2px;
            margin-top: 2px;
            margin-bottom: 4px;
            border-left: 1px dashed var(--border-color);
            margin-left: 22px;
        }

        .sidebar-submenu.open {
            display: flex;
        }

        /* Single Menu Item & Submenu Item */
        .sidebar-menu-item {
            display: flex;
            align-items: center;
            padding: 10px 14px;
            color: var(--text-muted);
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .sidebar-menu-item:hover {
            background-color: var(--border-light);
            color: var(--text-main);
        }

        .sidebar-submenu .sidebar-menu-item {
            padding: 8px 12px;
            font-size: 0.85rem;
        }

        .sidebar-menu-item.active {
            background-color: var(--primary-light);
            color: var(--primary);
            font-weight: 600;
        }

        .sidebar-menu-item i {
            margin-right: 12px;
            font-size: 1rem;
        }

        .sidebar-user {
            padding: 16px;
            border-top: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            background-color: var(--primary-light);
            color: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.85rem;
            border: 1px solid var(--border-color);
        }

        .user-info {
            display: flex;
            flex-direction: column;
            margin-left: 8px;
            flex-grow: 1;
        }

        .user-name {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--text-main);
        }

        .user-role {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .btn-logout-icon {
            color: var(--error);
            text-decoration: none;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            transition: background-color 0.2s;
        }
        .btn-logout-icon:hover {
            background-color: var(--error-bg);
        }

        /* Main Workspace Container */
        .workspace {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Header Bar Styling */
        .header {
            height: var(--header-height);
            background-color: var(--bg-card);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            flex-shrink: 0;
        }

        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
        }

        .breadcrumb-item {
            color: var(--text-muted);
            text-decoration: none;
        }
        .breadcrumb-item.active {
            color: var(--text-main);
            font-weight: 600;
        }
        .breadcrumb-separator {
            color: #94a3b8;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .btn-logout {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border: 1px solid #fecaca;
            background-color: var(--bg-card);
            color: var(--error);
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.85rem;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-logout:hover {
            background-color: var(--error-bg);
        }

        /* Dynamic Tabs Bar (PLN-style layout with Teal & Light Gray colors) */
        .tabs-container {
            background-color: #e2e8f0; /* Bodi abu-abu terang asli */
            border-bottom: 1px solid var(--border-color); /* Garis pembatas abu-abu terang asli */
            display: flex;
            align-items: flex-end;
            padding: 0 16px;
            gap: 2px;
            flex-shrink: 0;
            overflow: visible; /* Mencegah clipping agar tab aktif dapat melewati garis atas/bawah */
            height: 32px;
        }

        .tab-item {
            display: flex;
            align-items: center;
            height: 28px; /* Tab tidak aktif dibuat lebih pendek */
            background-color: #cbd5e1; /* Warna tab tidak aktif abu-abu sedang asli */
            color: var(--text-muted); /* Teks abu-abu gelap asli */
            padding: 0 16px;
            border-radius: 0; /* Sudut kotak tajam */
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            user-select: none;
            transition: none; /* Menghilangkan efek transisi saat diklik/dihover */
            white-space: nowrap;
            border: none;
            margin-bottom: 0;
        }

        .tab-item:hover {
            background-color: #d1d5db; /* Hover abu-abu asli */
            color: var(--text-main);
        }

        .tab-item.active {
            background-color: var(--bg-card); /* Latar belakang putih bersih asli */
            color: var(--primary); /* Teks berwarna Deep Teal asli */
            border-top: 4px solid var(--primary); /* Tanda Deep Teal melewati garis atas */
            border-right: 1px solid var(--border-color);
            border-left: 1px solid var(--border-color);
            border-bottom: none;
            height: 35px; /* Dibuat lebih tinggi agar melewati batas atas kontainer */
            margin-bottom: -1px; /* Menggeser 1px ke bawah untuk menutupi garis pembatas container */
            position: relative;
            z-index: 10;
            font-weight: 600;
        }

        .tab-icon {
            display: none; /* Menyembunyikan ikon */
        }

        .tab-close {
            margin-left: 8px;
            font-size: 0.8rem;
            line-height: 1;
            padding: 2px;
            border-radius: 2px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted); /* Kembali ke warna tombol tutup asli */
            transition: all 0.2s;
        }
        
        .tab-item.active .tab-close {
            color: var(--text-muted);
        }

        .tab-close:hover {
            background-color: var(--border-light);
            color: var(--error);
        }

        .tab-panels {
            flex-grow: 1;
            overflow-y: auto;
            position: relative;
            background-color: #f8fafc;
        }

        .tab-panel {
            display: none;
            padding: 24px;
            min-height: 100%;
        }

        .tab-panel.active {
            display: block;
        }

        /* Premium Components Styling */
        .panel-title-area {
            margin-bottom: 24px;
        }
        .panel-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--text-main);
        }
        .panel-subtitle {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-top: 4px;
        }

        /* Stat Grid Cards */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }

        .stat-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .stat-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .stat-label {
            font-size: 0.825rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-main);
        }
        .stat-card-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }
        .icon-teal { background-color: var(--primary-light); color: var(--primary); }
        .icon-blue { background-color: var(--oracle-bg); color: var(--oracle); }
        .icon-purple { background-color: var(--postgres-bg); color: var(--postgres); }
        .icon-red { background-color: var(--error-bg); color: var(--error); }

        /* Container Card style */
        .content-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.02);
            margin-bottom: 24px;
        }

        /* Filter Toolbar */
        .filter-toolbar {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
        }

        .filter-group {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }

        /* Custom UI Elements (Forms, Buttons) */
        .input-text {
            padding: 10px 14px 10px 36px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.875rem;
            width: 240px;
            outline: none;
            transition: border-color 0.2s;
        }
        .input-text:focus {
            border-color: var(--primary);
        }

        .search-wrapper {
            position: relative;
        }
        .search-wrapper i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .select-input {
            padding: 10px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.875rem;
            background-color: var(--bg-card);
            outline: none;
            cursor: pointer;
            min-width: 140px;
        }
        .select-input:focus {
            border-color: var(--primary);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 18px;
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.2s;
            text-decoration: none;
            gap: 8px;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }
        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-outline {
            border: 1px solid var(--border-color);
            background-color: var(--bg-card);
            color: var(--text-muted);
        }
        .btn-outline:hover {
            background-color: var(--border-light);
            color: var(--text-main);
        }

        /* Datatable Styling */
        .datatable-wrapper {
            overflow-x: auto;
            border: 1px solid var(--border-light);
            border-radius: 8px;
        }

        .custom-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
        }

        .custom-table th {
            background-color: #f8fafc;
            color: var(--text-muted);
            font-weight: 600;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-light);
            user-select: none;
            cursor: pointer;
        }
        .custom-table th:hover {
            color: var(--text-main);
        }
        .custom-table th i {
            margin-left: 6px;
            font-size: 0.75rem;
        }

        .custom-table td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-light);
            color: var(--text-main);
        }

        .custom-table tbody tr:hover {
            background-color: #f8fafc;
        }

        /* Badges */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-success { background-color: var(--success-bg); color: var(--success); }
        .badge-warning { background-color: var(--warning-bg); color: var(--warning); }
        .badge-error { background-color: var(--error-bg); color: var(--error); }
        
        .badge-oracle { background-color: var(--oracle-bg); color: var(--oracle); }
        .badge-postgres { background-color: var(--postgres-bg); color: var(--postgres); }

        /* Pagination Bar */
        .pagination-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .pagination-info {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .pagination-controls {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .pagination-btn {
            width: 36px;
            height: 36px;
            border: 1px solid var(--border-color);
            background-color: var(--bg-card);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.85rem;
            color: var(--text-main);
            transition: all 0.2s;
        }
        .pagination-btn:hover:not(.disabled) {
            background-color: var(--border-light);
            border-color: var(--text-muted);
        }
        .pagination-btn.active {
            background-color: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        .pagination-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Action Buttons */
        .btn-action {
            border: none;
            background: none;
            cursor: pointer;
            color: var(--primary);
            font-size: 1rem;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .btn-action:hover {
            background-color: var(--primary-light);
        }

        /* Custom Modal CSS */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(15, 23, 42, 0.4);
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .modal.show {
            display: flex;
        }
        .modal-content {
            background-color: var(--bg-card);
            border-radius: 12px;
            width: 100%;
            max-width: 600px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            animation: slideUp 0.25s ease-out;
            overflow: hidden;
        }
        @keyframes slideUp {
            from { transform: translateY(15px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .modal-title {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--text-main);
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-muted);
            line-height: 1;
        }
        .modal-close:hover {
            color: var(--text-main);
        }
        .modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid var(--border-light);
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            background-color: #f8fafc;
        }
        .modal-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            border-bottom: 1px solid var(--border-light);
            padding-bottom: 8px;
        }
        .modal-row.last {
            border-bottom: none;
            padding-bottom: 0;
        }
        .modal-label {
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.875rem;
        }
        .modal-value {
            color: var(--text-main);
            font-size: 0.875rem;
        }
        pre.code-block {
            background-color: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            overflow-x: auto;
            color: #334155;
            border: 1px solid var(--border-color);
        }

        /* Form elements for new tab view */
        .form-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }
        .form-row label {
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--text-main);
        }
        .form-input-text {
            padding: 10px 14px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.875rem;
            outline: none;
            width: 100%;
        }
        .form-input-text:focus {
            border-color: var(--primary);
        }

        /* CRM CSS Layout Elements */
        .crm-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .crm-chart-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 20px;
        }
        .chart-header {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 16px;
            color: var(--text-main);
        }
        .bar-chart-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .bar-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .bar-label-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.825rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        .bar-outer {
            height: 12px;
            background-color: #f1f5f9;
            border-radius: 6px;
            overflow: hidden;
            width: 100%;
        }
        .bar-inner {
            height: 100%;
            border-radius: 6px;
            transition: width 1s ease-out;
        }
    </style>
</head>
<body>

    <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div>
                <!-- Brand logo -->
                <div class="sidebar-brand">
                    <div class="brand-icon"><i class="pi pi-shield"></i></div>
                    <span class="brand-name">NewKotainter</span>
                </div>

                <!-- Menu Accordion / Tree (Collapsible Submenus Example) -->
                <ul class="sidebar-menu">
                    <!-- Standard Item -->
                    <li>
                        <div class="sidebar-menu-item active" data-tab-id="dashboard" data-tab-title="Dashboard" data-tab-icon="home">
                            <i class="pi pi-home"></i> Dashboard
                        </div>
                    </li>
                    
                    <!-- Collapsible Parent Menu: Pelayanan Pelanggan -->
                    <li>
                        <div class="sidebar-menu-parent" data-toggle="submenu-pelayanan">
                            <span class="menu-label"><i class="pi pi-ticket"></i> Pelayanan Pelanggan</span>
                            <i class="pi pi-chevron-down toggle-icon"></i>
                        </div>
                        <ul class="sidebar-submenu" id="submenu-pelayanan">
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="dashboard" data-tab-title="Dashboard" data-tab-icon="home">
                                    Daftar Tiket Log
                                </div>
                            </li>
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="pelayanan_pelanggan" data-tab-title="Pelayanan Pelanggan" data-tab-icon="plus-circle">
                                    Buat Tiket Baru
                                </div>
                            </li>
                        </ul>
                    </li>

                    <!-- Collapsible Parent Menu: Manajemen User -->
                    <li>
                        <div class="sidebar-menu-parent" data-toggle="submenu-user">
                            <span class="menu-label"><i class="pi pi-users"></i> Manajemen User</span>
                            <i class="pi pi-chevron-down toggle-icon"></i>
                        </div>
                        <ul class="sidebar-submenu" id="submenu-user">
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="user_ap2t" data-tab-title="User New AP2T" data-tab-icon="users">
                                    User New AP2T
                                </div>
                            </li>
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="hak_akses" data-tab-title="Hak Akses & Role" data-tab-icon="key">
                                    Hak Akses & Role
                                </div>
                            </li>
                        </ul>
                    </li>

                    <!-- Collapsible Parent Menu: Analitik & Sistem -->
                    <li>
                        <div class="sidebar-menu-parent" data-toggle="submenu-sistem">
                            <span class="menu-label"><i class="pi pi-server"></i> Analitik & Sistem</span>
                            <i class="pi pi-chevron-down toggle-icon"></i>
                        </div>
                        <ul class="sidebar-submenu" id="submenu-sistem">
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="crm" data-tab-title="CRM Analytics" data-tab-icon="chart-line">
                                    CRM Analytics
                                </div>
                            </li>
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="ap2t_staging" data-tab-title="AP2T Staging" data-tab-icon="server">
                                    AP2T Staging
                                </div>
                            </li>
                            <li>
                                <div class="sidebar-menu-item" data-tab-id="fso" data-tab-title="FSO" data-tab-icon="folder">
                                    FSO Logs
                                </div>
                            </li>
                        </ul>
                    </li>

                    <!-- Single Item without Children: Pengaturan DB -->
                    <li>
                        <div class="sidebar-menu-item" data-tab-id="db_config" data-tab-title="Pengaturan DB" data-tab-icon="cog">
                            <i class="pi pi-cog"></i> Pengaturan DB
                        </div>
                    </li>

                    <!-- Single Item without Children: Bantuan & FAQ -->
                    <li>
                        <div class="sidebar-menu-item" data-tab-id="bantuan" data-tab-title="Bantuan & FAQ" data-tab-icon="question-circle">
                            <i class="pi pi-question-circle"></i> Bantuan & FAQ
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Profile Info & Logout -->
            <div class="sidebar-user">
                <div class="user-avatar">PS</div>
                <div class="user-info">
                    <span class="user-name"><?php echo $nama_user; ?></span>
                    <span class="user-role">Administrator</span>
                </div>
                <a href="<?php echo site_url('auth/logout'); ?>" class="btn-logout-icon" title="Keluar">
                    <i class="pi pi-power-off"></i>
                </a>
            </div>
        </aside>

        <!-- Main Workspace -->
        <div class="workspace">
            <!-- Header Bar -->
            <header class="header">
                <div class="breadcrumbs">
                    <a href="#" class="breadcrumb-item">Home</a>
                    <span class="breadcrumb-separator">/</span>
                    <a href="#" class="breadcrumb-item active">Dashboard</a>
                </div>

                <div class="header-actions">
                    <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-muted);">
                        Selamat Datang, <strong><?php echo $nama_user; ?></strong>
                    </span>
                    <a href="<?php echo site_url('auth/logout'); ?>" class="btn-logout">
                        <i class="pi pi-sign-out" style="margin-right: 8px;"></i> Keluar
                    </a>
                </div>
            </header>

            <!-- Dynamic Tabs Bar -->
            <div class="tabs-container" id="tabs-bar">
                <div class="tab-item active" id="tab-header-dashboard" data-tab-id="dashboard">
                    <span class="tab-icon"><i class="pi pi-home"></i></span>
                    <span class="tab-title">Dashboard</span>
                </div>
            </div>

            <!-- Tab Content Panels Container -->
            <div class="tab-panels" id="tab-panels">
                
                <!-- DASHBOARD TAB (Active by default) -->
                <div class="tab-panel active" id="tab-panel-dashboard">
                    <div class="panel-title-area">
                        <h2 class="panel-title">Dashboard Logs</h2>
                        <p class="panel-subtitle">Menampilkan seluruh log proses. Gunakan filter di bawah untuk pencarian.</p>
                    </div>

                    <!-- Statistics Summary Widgets -->
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-label">Total Log Aktivitas</span>
                                <span class="stat-value" id="stat-total-logs">9</span>
                            </div>
                            <div class="stat-card-icon icon-teal">
                                <i class="pi pi-database"></i>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-label">Log Oracle</span>
                                <span class="stat-value" id="stat-oracle-logs" style="color: var(--oracle)">5</span>
                            </div>
                            <div class="stat-card-icon icon-blue">
                                <i class="pi pi-server"></i>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-label">Log PostgreSQL</span>
                                <span class="stat-value" id="stat-postgres-logs" style="color: var(--postgres)">4</span>
                            </div>
                            <div class="stat-card-icon icon-purple">
                                <i class="pi pi-server"></i>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-label">Masalah Sistem</span>
                                <span class="stat-value" id="stat-system-issues" style="color: var(--error)">2</span>
                            </div>
                            <div class="stat-card-icon icon-red">
                                <i class="pi pi-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Main Grid Card -->
                    <div class="content-card">
                        <!-- Datatable Filters Toolbar -->
                        <div class="filter-toolbar">
                            <div class="filter-group">
                                <div class="search-wrapper">
                                    <i class="pi pi-search"></i>
                                    <input type="text" id="dash-search-input" class="input-text" placeholder="Cari No Tiket / No Pelanggan...">
                                </div>
                                <select id="dash-filter-db" class="select-input">
                                    <option value="">Semua Database</option>
                                    <option value="ORACLE">Oracle</option>
                                    <option value="POSTGRESQL">PostgreSQL</option>
                                </select>
                                <select id="dash-filter-status" class="select-input">
                                    <option value="">Semua Status</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="ERROR">Error</option>
                                </select>
                                <button class="btn btn-outline" id="dash-btn-refresh">
                                    <i class="pi pi-refresh"></i> Refresh
                                </button>
                            </div>
                            <div>
                                <span id="dash-rows-count" style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">
                                    Menampilkan 9 dari 9 log
                                </span>
                            </div>
                        </div>

                        <!-- Table Area -->
                        <div class="datatable-wrapper">
                            <table class="custom-table" id="dashboard-table">
                                <thead>
                                    <tr>
                                        <th onclick="DashboardGrid.sort('no_tiket')">No Tiket <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('jenis_transaksi')">Jenis Transaksi <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('no_pelanggan')">No Pelanggan <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('tanggal_proses')">Tanggal Proses <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('database')">Database <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('status')">Status <i class="pi pi-sort"></i></th>
                                        <th onclick="DashboardGrid.sort('petugas')">Petugas <i class="pi pi-sort"></i></th>
                                        <th style="width: 80px; text-align: center;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="dashboard-table-body">
                                    <!-- Table content injected dynamically via JavaScript -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Table Pagination controls -->
                        <div class="pagination-container">
                            <div class="pagination-info" id="dash-pagination-info">
                                Menampilkan halaman 1 dari 1
                            </div>
                            <div class="pagination-controls" id="dash-pagination-controls">
                                <!-- Paginate buttons injected dynamically -->
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Detail Query Modal Dialog -->
    <div class="modal" id="detail-modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">Detail Log Transaksi</span>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body" id="modal-details-container">
                <!-- Dynamically injected log detail rows -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal()">Tutup</button>
            </div>
        </div>
    </div>

    <!-- Vanilla Javascript Logic -->
    <script>
        // Global simulation data store
        const globalData = {
            logs: [
                { no_tiket: '14082026', jenis_transaksi: 'UPDATE CRM WORKING UNIT', no_pelanggan: 'usersso.travel5@pln.co.id', tanggal_proses: '14-AUG-26', database: 'ORACLE', status: 'SUCCESS', petugas: 'PS.51.TITISANDREH', query: 'UPDATE CRM_USER_UNIT SET WORKING_UNIT = \'UP3_BDG\' WHERE EMAIL = \'usersso.travel5@pln.co.id\'' },
                { no_tiket: '14082026', jenis_transaksi: 'UPDATE CRM WORKING UNIT', no_pelanggan: 'usersso.travel5@pln.co.id', tanggal_proses: '14-AUG-26', database: 'ORACLE', status: 'SUCCESS', petugas: 'PS.51.TITISANDREH', query: 'UPDATE CRM_USER_UNIT SET LAST_LOGIN = SYSDATE WHERE EMAIL = \'usersso.travel5@pln.co.id\'' },
                { no_tiket: '4094798', jenis_transaksi: 'POSTING PDL', no_pelanggan: '546300561305282081', tanggal_proses: '14-AUG-26', database: 'POSTGRESQL', status: 'SUCCESS', petugas: 'PS.PUSAT.MARDIYANA2', query: 'INSERT INTO log_posting_pdl (id_pelanggan, action, posted_at) VALUES (\'546300561305282081\', \'POST\', NOW())' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240766', tanggal_proses: '14-AUG-26', database: 'POSTGRESQL', status: 'ERROR', petugas: 'UCU SURYA', query: 'UPDATE trans_106 SET status_pembayaran = \'LUNAS\' WHERE no_pelanggan = \'516750512607240766\';\n-- ERROR: relation "trans_106" does not exist' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240772', tanggal_proses: '14-AUG-26', database: 'ORACLE', status: 'WARNING', petugas: 'UCU SURYA', query: 'UPDATE TRANS_DATA SET STATUS = \'ACTIVE\' WHERE CUST_ID = \'516750512607240772\';\n-- WARNING: ORA-01006: bind variable does not exist' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240771', tanggal_proses: '14-AUG-26', database: 'POSTGRESQL', status: 'SUCCESS', petugas: 'UCU SURYA', query: 'UPDATE customer_transaction SET status = 1 WHERE cust_no = \'516750512607240771\'' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240770', tanggal_proses: '14-AUG-26', database: 'POSTGRESQL', status: 'SUCCESS', petugas: 'UCU SURYA', query: 'UPDATE customer_transaction SET status = 1 WHERE cust_no = \'516750512607240770\'' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240769', tanggal_proses: '14-AUG-26', database: 'ORACLE', status: 'SUCCESS', petugas: 'UCU SURYA', query: 'UPDATE CUST_INFO SET LEVEL_ID = 2 WHERE ID_PELANGGAN = \'516750512607240769\'' },
                { no_tiket: '4094492', jenis_transaksi: 'Update Trans 106', no_pelanggan: '516750512607240768', tanggal_proses: '14-AUG-26', database: 'ORACLE', status: 'SUCCESS', petugas: 'UCU SURYA', query: 'UPDATE CUST_INFO SET LEVEL_ID = 2 WHERE ID_PELANGGAN = \'516750512607240768\'' }
            ],
            users: [
                { id: '1', username: 'admin', nama: 'POLMA SIHOTANG', unit: 'KANTOR PUSAT', status: 'AKTIF' },
                { id: '2', username: 'titisandreh', nama: 'TITIS ANDREH', unit: 'UP3 BANDUNG', status: 'AKTIF' },
                { id: '3', username: 'ucusurya', nama: 'UCU SURYA', unit: 'UP3 BOGOR', status: 'AKTIF' },
                { id: '4', username: 'akses_pembantu', nama: 'PEMBANTU SISTEM', unit: 'UP3 BEKASI', status: 'AKTIF' }
            ]
        };

        // ----------------------------------------------------
        // TABS MANAGER
        // ----------------------------------------------------
        const TabManager = {
            activeTabId: 'dashboard',
            tabs: {
                'dashboard': { title: 'Dashboard', icon: 'home', closable: false }
            },
            
            init() {
                // Delegation click handler for Tabs Bar
                document.getElementById('tabs-bar').addEventListener('click', (e) => {
                    const closeBtn = e.target.closest('.tab-close');
                    if (closeBtn) {
                        e.stopPropagation();
                        const id = closeBtn.getAttribute('data-tab-id');
                        this.closeTab(id);
                        return;
                    }
                    
                    const tabHeader = e.target.closest('.tab-item');
                    if (tabHeader) {
                        const id = tabHeader.getAttribute('data-tab-id');
                        this.activateTab(id);
                    }
                });
                
                // Delegation click handler for Sidebar Menu
                const sidebarMenu = document.querySelector('.sidebar-menu');
                if (sidebarMenu) {
                    sidebarMenu.addEventListener('click', (e) => {
                        // Case A: Clicked a parent toggle menu
                        const parentMenu = e.target.closest('.sidebar-menu-parent');
                        if (parentMenu) {
                            e.preventDefault();
                            const toggleId = parentMenu.getAttribute('data-toggle');
                            const submenu = document.getElementById(toggleId);
                            if (submenu) {
                                const isOpening = !submenu.classList.contains('open');
                                
                                // Close all other submenus first (Accordion effect)
                                document.querySelectorAll('.sidebar-submenu').forEach(sub => {
                                    if (sub.id !== toggleId) {
                                        sub.classList.remove('open');
                                    }
                                });
                                document.querySelectorAll('.sidebar-menu-parent').forEach(p => {
                                    if (p !== parentMenu) {
                                        p.classList.remove('open');
                                    }
                                });

                                // Toggle current state
                                if (isOpening) {
                                    submenu.classList.add('open');
                                    parentMenu.classList.add('open');
                                } else {
                                    submenu.classList.remove('open');
                                    parentMenu.classList.remove('open');
                                }
                            }
                            return;
                        }

                        // Case B: Clicked a single menu item or child menu item
                        const menuItem = e.target.closest('.sidebar-menu-item');
                        if (menuItem) {
                            e.preventDefault();
                            const id = menuItem.getAttribute('data-tab-id');
                            const title = menuItem.getAttribute('data-tab-title') || menuItem.textContent.trim();
                            const icon = menuItem.getAttribute('data-tab-icon') || 'file';
                            if (id) {
                                this.openTab(id, title, icon);
                            }
                        }
                    });
                }
            },
            
            openTab(id, title, icon) {
                if (this.tabs[id]) {
                    this.activateTab(id);
                    return;
                }
                
                this.tabs[id] = { title, icon, closable: true };
                
                const tabsBar = document.getElementById('tabs-bar');
                const tabHeaderHtml = `
                    <div class="tab-item" id="tab-header-${id}" data-tab-id="${id}">
                        <span class="tab-icon"><i class="pi pi-${icon}"></i></span>
                        <span class="tab-title">${title}</span>
                        <span class="tab-close" data-tab-id="${id}"><i class="pi pi-times"></i></span>
                    </div>
                `;
                tabsBar.insertAdjacentHTML('beforeend', tabHeaderHtml);
                
                const tabPanels = document.getElementById('tab-panels');
                const panelContent = this.getTabContentTemplate(id, title);
                const panelHtml = `
                    <div class="tab-panel" id="tab-panel-${id}">
                        ${panelContent}
                    </div>
                `;
                tabPanels.insertAdjacentHTML('beforeend', panelHtml);
                
                this.initTabContentBehavior(id);
                
                this.activateTab(id);
            },
            
            activateTab(id) {
                this.activeTabId = id;
                
                // Clear active sidebar items
                document.querySelectorAll('.sidebar-menu-item').forEach(item => {
                    if (item.getAttribute('data-tab-id') === id) {
                        item.classList.add('active');
                        // Ensure parent submenu is open
                        const submenu = item.closest('.sidebar-submenu');
                        if (submenu) {
                            submenu.classList.add('open');
                            const parentToggle = document.querySelector(`[data-toggle="${submenu.id}"]`);
                            if (parentToggle) parentToggle.classList.add('open');
                        }
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                // Set active tab bar header
                document.querySelectorAll('.tab-item').forEach(tab => {
                    if (tab.getAttribute('data-tab-id') === id) {
                        tab.classList.add('active');
                    } else {
                        tab.classList.remove('active');
                    }
                });
                
                // Set active tab panel
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    if (panel.id === `tab-panel-${id}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                // Update Breadcrumb text
                const activeTab = this.tabs[id];
                document.querySelector('.breadcrumbs .breadcrumb-item.active').textContent = activeTab.title;
            },
            
            closeTab(id) {
                if (!this.tabs[id] || !this.tabs[id].closable) return;
                
                const header = document.getElementById(`tab-header-${id}`);
                const panel = document.getElementById(`tab-panel-${id}`);
                if (header) header.remove();
                if (panel) panel.remove();
                
                delete this.tabs[id];
                
                if (this.activeTabId === id) {
                    const remainingKeys = Object.keys(this.tabs);
                    const lastKey = remainingKeys[remainingKeys.length - 1];
                    this.activateTab(lastKey);
                }
            },
            
            getTabContentTemplate(id, title) {
                if (id === 'user_ap2t') {
                    return `
                        <div class="panel-title-area">
                            <h2 class="panel-title">${title}</h2>
                            <p class="panel-subtitle">Manajemen data pengguna sistem terdaftar.</p>
                        </div>
                        <div class="content-card">
                            <div class="filter-toolbar">
                                <div class="filter-group">
                                    <div class="search-wrapper">
                                        <i class="pi pi-search"></i>
                                        <input type="text" id="users-search-input" class="input-text" placeholder="Cari nama / username...">
                                    </div>
                                    <button class="btn btn-primary" id="users-btn-add">
                                        <i class="pi pi-user-plus"></i> Tambah User
                                    </button>
                                </div>
                            </div>
                            <div class="datatable-wrapper">
                                <table class="custom-table" id="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Nama Lengkap</th>
                                            <th>Unit Kerja</th>
                                            <th>Status</th>
                                            <th style="width: 80px; text-align: center;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-table-body">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                }
                
                if (id === 'crm') {
                    return `
                        <div class="panel-title-area">
                            <h2 class="panel-title">${title}</h2>
                            <p class="panel-subtitle">Grafik analisis performa database Oracle vs PostgreSQL.</p>
                        </div>
                        <div class="crm-grid">
                            <div class="crm-chart-card">
                                <div class="chart-header">Volume Transaksi Kueri Harian</div>
                                <div class="bar-chart-container">
                                    <div class="bar-item">
                                        <div class="bar-label-row">
                                            <span>Database Oracle (Master / Legacy)</span>
                                            <strong>1,842 Query (72.4%)</strong>
                                        </div>
                                        <div class="bar-outer">
                                            <div class="bar-inner" style="width: 72.4%; background-color: var(--oracle);"></div>
                                        </div>
                                    </div>
                                    <div class="bar-item">
                                        <div class="bar-label-row">
                                            <span>Database PostgreSQL (Transactional / New)</span>
                                            <strong>701 Query (27.6%)</strong>
                                        </div>
                                        <div class="bar-outer">
                                            <div class="bar-inner" style="width: 27.6%; background-color: var(--postgres);"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="crm-chart-card">
                                <div class="chart-header">Kesehatan kueri database</div>
                                <div class="bar-chart-container">
                                    <div class="bar-item">
                                        <div class="bar-label-row">
                                            <span>Kueri Sukses (Success)</span>
                                            <strong>2,529 Query (99.45%)</strong>
                                        </div>
                                        <div class="bar-outer">
                                            <div class="bar-inner" style="width: 99.45%; background-color: var(--success);"></div>
                                        </div>
                                    </div>
                                    <div class="bar-item">
                                        <div class="bar-label-row">
                                            <span>Peringatan (Warning)</span>
                                            <strong>12 Query (0.47%)</strong>
                                        </div>
                                        <div class="bar-outer">
                                            <div class="bar-inner" style="width: 10%; background-color: var(--warning);"></div>
                                        </div>
                                    </div>
                                    <div class="bar-item">
                                        <div class="bar-label-row">
                                            <span>Kueri Gagal (Error)</span>
                                            <strong>2 Query (0.08%)</strong>
                                        </div>
                                        <div class="bar-outer">
                                            <div class="bar-inner" style="width: 5%; background-color: var(--error);"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                if (id === 'pelayanan_pelanggan') {
                    return `
                        <div class="panel-title-area">
                            <h2 class="panel-title">${title}</h2>
                            <p class="panel-subtitle">Buat tiket log transaksi database baru di sini. Tiket log akan langsung masuk ke database log dashboard secara real-time.</p>
                        </div>
                        <div class="content-card" style="max-width: 600px;">
                            <form id="form-ticket" class="flex flex-column gap-3">
                                <div class="form-row">
                                    <label for="ticket-notrans">Nomor Tiket</label>
                                    <input type="text" id="ticket-notrans" class="form-input-text" placeholder="Contoh: 4095110" required>
                                </div>
                                <div class="form-row">
                                    <label for="ticket-cust">Nomor / Email Pelanggan</label>
                                    <input type="text" id="ticket-cust" class="form-input-text" placeholder="Contoh: 516750512607..." required>
                                </div>
                                <div class="form-row">
                                    <label for="ticket-type">Jenis Transaksi</label>
                                    <input type="text" id="ticket-type" class="form-input-text" placeholder="Contoh: UPDATE STATUS TIKET" required>
                                </div>
                                <div class="form-row">
                                    <label for="ticket-db">Database Target</label>
                                    <select id="ticket-db" class="select-input" style="width: 100%;">
                                        <option value="ORACLE">Oracle</option>
                                        <option value="POSTGRESQL">PostgreSQL</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <label for="ticket-status">Status Proses</label>
                                    <select id="ticket-status" class="select-input" style="width: 100%;">
                                        <option value="SUCCESS">Success</option>
                                        <option value="WARNING">Warning</option>
                                        <option value="ERROR">Error</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <label for="ticket-query">Perintah SQL Query</label>
                                    <textarea id="ticket-query" class="form-input-text" style="height: 100px; resize: vertical; font-family: monospace;" placeholder="Tuliskan query SQL yang dijalankan..." required></textarea>
                                </div>
                                <div style="margin-top: 12px; display: flex; gap: 8px;">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="pi pi-check"></i> Simpan Tiket Log
                                    </button>
                                    <button type="reset" class="btn btn-outline">Reset</button>
                                </div>
                            </form>
                        </div>
                    `;
                }

                if (id === 'db_config') {
                    return `
                        <div class="panel-title-area">
                            <h2 class="panel-title">Pengaturan Database Campuran</h2>
                            <p class="panel-subtitle">Konfigurasikan koneksi data untuk database Oracle dan PostgreSQL yang digunakan dalam sistem NewKotainter.</p>
                        </div>
                        <div class="content-card" style="max-width: 800px;">
                            <form id="form-db-config" class="flex flex-column gap-4" onsubmit="event.preventDefault(); alert('Konfigurasi database berhasil disimpan!');">
                                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 20px;">
                                    <!-- Oracle Config -->
                                    <div style="border-right: 1px solid var(--border-light); padding-right: 24px; display: flex; flex-direction: column; gap: 12px;">
                                        <h3 style="margin-bottom: 4px; color: var(--oracle); font-size: 1rem;"><i class="pi pi-server" style="margin-right: 8px;"></i> Database Oracle</h3>
                                        <div class="form-row">
                                            <label>Host / IP Address</label>
                                            <input type="text" class="form-input-text" value="10.71.1.173" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Port</label>
                                            <input type="text" class="form-input-text" value="1521" required>
                                        </div>
                                        <div class="form-row">
                                            <label>SID / Service Name</label>
                                            <input type="text" class="form-input-text" value="orcl" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Username</label>
                                            <input type="text" class="form-input-text" value="AP2T_DB" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Password</label>
                                            <input type="password" class="form-input-text" value="********" required>
                                        </div>
                                    </div>
                                    
                                    <!-- PostgreSQL Config -->
                                    <div style="display: flex; flex-direction: column; gap: 12px;">
                                        <h3 style="margin-bottom: 4px; color: var(--postgres); font-size: 1rem;"><i class="pi pi-server" style="margin-right: 8px;"></i> Database PostgreSQL</h3>
                                        <div class="form-row">
                                            <label>Host / IP Address</label>
                                            <input type="text" class="form-input-text" value="localhost" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Port</label>
                                            <input type="text" class="form-input-text" value="5432" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Database Name</label>
                                            <input type="text" class="form-input-text" value="newkotainter_db" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Username</label>
                                            <input type="text" class="form-input-text" value="postgres" required>
                                        </div>
                                        <div class="form-row">
                                            <label>Password</label>
                                            <input type="password" class="form-input-text" value="********" required>
                                        </div>
                                    </div>
                                </div>
                                <div style="border-top: 1px solid var(--border-light); padding-top: 16px; display: flex; gap: 8px;">
                                    <button type="submit" class="btn btn-primary"><i class="pi pi-save"></i> Simpan Konfigurasi</button>
                                    <button type="button" class="btn btn-outline" onclick="alert('Koneksi database berhasil terhubung!');"><i class="pi pi-wifi"></i> Tes Koneksi</button>
                                </div>
                            </form>
                        </div>
                    `;
                }

                if (id === 'bantuan') {
                    return `
                        <div class="panel-title-area">
                            <h2 class="panel-title">Pusat Bantuan & FAQ</h2>
                            <p class="panel-subtitle">Temukan informasi bantuan seputar penggunaan sistem NewKotainter.</p>
                        </div>
                        <div class="content-card">
                            <h3 style="margin-bottom: 12px; color: var(--primary);"><i class="pi pi-question-circle" style="margin-right: 8px;"></i> Pertanyaan Sering Diajukan (FAQ)</h3>
                            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
                                <div>
                                    <h4 style="font-weight: 600; margin-bottom: 4px;">1. Bagaimana cara kerja database campuran di NewKotainter?</h4>
                                    <p style="color: var(--text-muted); font-size: 0.9rem;">Sistem ini secara bersamaan terhubung ke database Oracle (untuk data lama / legacy) dan PostgreSQL (untuk penyimpanan transaksi log baru). Modul diatur agar dapat mengalihkan query kueri secara otomatis sesuai skema data target.</p>
                                </div>
                                <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
                                    <h4 style="font-weight: 600; margin-bottom: 4px;">2. Bagaimana cara melihat detail query log SQL?</h4>
                                    <p style="color: var(--text-muted); font-size: 0.9rem;">Buka tab Dashboard utama, temukan log yang diinginkan di tabel, lalu klik tombol bergambar mata (<i class="pi pi-eye" style="color: var(--primary)"></i>) di kolom Aksi. Dialog detail log query akan terbuka secara instan.</p>
                                </div>
                                <div style="border-top: 1px solid var(--border-light); padding-top: 12px;">
                                    <h4 style="font-weight: 600; margin-bottom: 4px;">3. Apakah saya bisa menambahkan data user baru?</h4>
                                    <p style="color: var(--text-muted); font-size: 0.9rem;">Ya, silakan masuk ke sub-menu "User New AP2T" (di bawah Manajemen User) lalu klik tombol "Tambah User".</p>
                                </div>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="panel-title-area">
                        <h2 class="panel-title">${title}</h2>
                        <p class="panel-subtitle">Halaman fungsional untuk menu ${title}.</p>
                    </div>
                    <div class="content-card">
                        <p style="color: var(--text-muted);">Modul <strong>${title}</strong> saat ini kosong dan akan dikembangkan di masa mendatang.</p>
                    </div>
                `;
            },
            
            initTabContentBehavior(id) {
                if (id === 'user_ap2t') {
                    UsersGrid.init();
                }
                if (id === 'pelayanan_pelanggan') {
                    TicketForm.init();
                }
            }
        };

        // ----------------------------------------------------
        // DASHBOARD DATAGRID
        // ----------------------------------------------------
        const DashboardGrid = {
            currentPage: 1,
            rowsPerPage: 5,
            sortColumn: 'no_tiket',
            sortDirection: 'desc',
            filteredData: [],
            
            init() {
                document.getElementById('dash-search-input').addEventListener('input', () => this.applyFiltersAndRender());
                document.getElementById('dash-filter-db').addEventListener('change', () => this.applyFiltersAndRender());
                document.getElementById('dash-filter-status').addEventListener('change', () => this.applyFiltersAndRender());
                document.getElementById('dash-btn-refresh').addEventListener('click', () => {
                    document.getElementById('dash-search-input').value = '';
                    document.getElementById('dash-filter-db').value = '';
                    document.getElementById('dash-filter-status').value = '';
                    this.applyFiltersAndRender();
                });
                
                this.applyFiltersAndRender();
            },
            
            applyFiltersAndRender() {
                const searchVal = document.getElementById('dash-search-input').value.toLowerCase();
                const dbVal = document.getElementById('dash-filter-db').value;
                const statusVal = document.getElementById('dash-filter-status').value;
                
                this.filteredData = globalData.logs.filter(log => {
                    const matchesSearch = !searchVal || 
                        log.no_tiket.toLowerCase().includes(searchVal) ||
                        log.no_pelanggan.toLowerCase().includes(searchVal) ||
                        log.jenis_transaksi.toLowerCase().includes(searchVal) ||
                        log.petugas.toLowerCase().includes(searchVal);
                        
                    const matchesDb = !dbVal || log.database === dbVal;
                    const matchesStatus = !statusVal || log.status === statusVal;
                    
                    return matchesSearch && matchesDb && matchesStatus;
                });
                
                this.sortData();
                this.currentPage = 1;
                this.render();
                this.updateStats();
            },
            
            sort(column) {
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.sortData();
                this.render();
            },
            
            sortData() {
                this.filteredData.sort((a, b) => {
                    let valA = a[this.sortColumn].toLowerCase();
                    let valB = b[this.sortColumn].toLowerCase();
                    
                    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                    return 0;
                });
            },
            
            updateStats() {
                const total = globalData.logs.length;
                const oracle = globalData.logs.filter(l => l.database === 'ORACLE').length;
                const postgres = globalData.logs.filter(l => l.database === 'POSTGRESQL').length;
                const issues = globalData.logs.filter(l => l.status === 'ERROR' || l.status === 'WARNING').length;
                
                document.getElementById('stat-total-logs').textContent = total;
                document.getElementById('stat-oracle-logs').textContent = oracle;
                document.getElementById('stat-postgres-logs').textContent = postgres;
                document.getElementById('stat-system-issues').textContent = issues;
            },
            
            render() {
                const tbody = document.getElementById('dashboard-table-body');
                tbody.innerHTML = '';
                
                const totalRows = this.filteredData.length;
                document.getElementById('dash-rows-count').textContent = `Menampilkan ${totalRows} log`;
                
                if (totalRows === 0) {
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Tidak ada log data yang cocok.</td></tr>`;
                    document.getElementById('dash-pagination-info').textContent = 'Halaman 0 dari 0';
                    document.getElementById('dash-pagination-controls').innerHTML = '';
                    return;
                }
                
                const totalPages = Math.ceil(totalRows / this.rowsPerPage);
                if (this.currentPage > totalPages) this.currentPage = totalPages;
                
                const startIndex = (this.currentPage - 1) * this.rowsPerPage;
                const endIndex = Math.min(startIndex + this.rowsPerPage, totalRows);
                const paginatedData = this.filteredData.slice(startIndex, endIndex);
                
                paginatedData.forEach(log => {
                    const dbBadge = log.database === 'ORACLE' ? 'badge-oracle' : 'badge-postgres';
                    
                    let statusBadge = 'badge-success';
                    if (log.status === 'WARNING') statusBadge = 'badge-warning';
                    if (log.status === 'ERROR') statusBadge = 'badge-error';
                    
                    const rowHtml = `
                        <tr>
                            <td><strong>${log.no_tiket}</strong></td>
                            <td>${log.jenis_transaksi}</td>
                            <td>${log.no_pelanggan}</td>
                            <td>${log.tanggal_proses}</td>
                            <td><span class="badge ${dbBadge}">${log.database}</span></td>
                            <td><span class="badge ${statusBadge}">${log.status}</span></td>
                            <td>${log.petugas}</td>
                            <td style="text-align: center;">
                                <button class="btn-action" onclick="showLogDetails('${log.no_tiket}', '${log.no_pelanggan}')">
                                    <i class="pi pi-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', rowHtml);
                });
                
                document.getElementById('dash-pagination-info').textContent = `Menampilkan log ke ${startIndex + 1} - ${endIndex} dari total ${totalRows}`;
                
                const controls = document.getElementById('dash-pagination-controls');
                controls.innerHTML = '';
                
                const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
                controls.insertAdjacentHTML('beforeend', `<div class="pagination-btn ${prevDisabled}" onclick="DashboardGrid.setPage(1)"><i class="pi pi-angle-double-left"></i></div>`);
                controls.insertAdjacentHTML('beforeend', `<div class="pagination-btn ${prevDisabled}" onclick="DashboardGrid.setPage(${this.currentPage - 1})"><i class="pi pi-angle-left"></i></div>`);
                
                for (let i = 1; i <= totalPages; i++) {
                    const activeClass = this.currentPage === i ? 'active' : '';
                    controls.insertAdjacentHTML('beforeend', `<div class="pagination-btn ${activeClass}" onclick="DashboardGrid.setPage(${i})">${i}</div>`);
                }
                
                const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
                controls.insertAdjacentHTML('beforeend', `<div class="pagination-btn ${nextDisabled}" onclick="DashboardGrid.setPage(${this.currentPage + 1})"><i class="pi pi-angle-right"></i></div>`);
                controls.insertAdjacentHTML('beforeend', `<div class="pagination-btn ${nextDisabled}" onclick="DashboardGrid.setPage(${totalPages})"><i class="pi pi-angle-double-right"></i></div>`);
            },
            
            setPage(page) {
                const totalPages = Math.ceil(this.filteredData.length / this.rowsPerPage);
                if (page < 1 || page > totalPages) return;
                this.currentPage = page;
                this.render();
            }
        };

        // ----------------------------------------------------
        // USERS DATAGRID BEHAVIOR
        // ----------------------------------------------------
        const UsersGrid = {
            init() {
                this.render();
                
                const searchInput = document.getElementById('users-search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        this.render(e.target.value.toLowerCase());
                    });
                }
                
                const addBtn = document.getElementById('users-btn-add');
                if (addBtn) {
                    addBtn.addEventListener('click', () => {
                        const username = prompt("Masukkan Username:");
                        const nama = prompt("Masukkan Nama Lengkap:");
                        const unit = prompt("Masukkan Unit Kerja:");
                        if (username && nama && unit) {
                            const newId = (globalData.users.length + 1).toString();
                            globalData.users.push({
                                id: newId,
                                username,
                                nama,
                                unit,
                                status: 'AKTIF'
                            });
                            this.render();
                        }
                    });
                }
            },
            
            render(searchFilter = '') {
                const tbody = document.getElementById('users-table-body');
                if (!tbody) return;
                tbody.innerHTML = '';
                
                const filtered = globalData.users.filter(u => 
                    u.nama.toLowerCase().includes(searchFilter) || 
                    u.username.toLowerCase().includes(searchFilter) ||
                    u.unit.toLowerCase().includes(searchFilter)
                );
                
                filtered.forEach(user => {
                    const statusClass = user.status === 'AKTIF' ? 'badge-success' : 'badge-error';
                    const row = `
                        <tr>
                            <td>${user.id}</td>
                            <td><strong>${user.username}</strong></td>
                            <td>${user.nama}</td>
                            <td>${user.unit}</td>
                            <td><span class="badge ${statusClass}">${user.status}</span></td>
                            <td style="text-align: center;">
                                <button class="btn-action" onclick="UsersGrid.toggleStatus('${user.id}')" title="Ubah Status">
                                    <i class="pi pi-refresh"></i>
                                </button>
                                <button class="btn-action" style="color: var(--error);" onclick="UsersGrid.deleteUser('${user.id}')" title="Hapus User">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            },
            
            toggleStatus(id) {
                const user = globalData.users.find(u => u.id === id);
                if (user) {
                    user.status = user.status === 'AKTIF' ? 'NON-AKTIF' : 'AKTIF';
                    this.render();
                }
            },
            
            deleteUser(id) {
                if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
                    globalData.users = globalData.users.filter(u => u.id !== id);
                    this.render();
                }
            }
        };

        // ----------------------------------------------------
        // TICKET FORM SUBMISSION LOGIC
        // ----------------------------------------------------
        const TicketForm = {
            init() {
                const form = document.getElementById('form-ticket');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        
                        const no_tiket = document.getElementById('ticket-notrans').value;
                        const no_pelanggan = document.getElementById('ticket-cust').value;
                        const jenis_transaksi = document.getElementById('ticket-type').value;
                        const database = document.getElementById('ticket-db').value;
                        const status = document.getElementById('ticket-status').value;
                        const query = document.getElementById('ticket-query').value;
                        
                        globalData.logs.unshift({
                            no_tiket,
                            jenis_transaksi,
                            no_pelanggan,
                            tanggal_proses: '14-AUG-26',
                            database,
                            status,
                            petugas: 'POLMA SIHOTANG',
                            query
                        });
                        
                        alert("Log Transaksi berhasil disimpan! Log telah ditambahkan ke tabel utama Dashboard.");
                        form.reset();
                        DashboardGrid.applyFiltersAndRender();
                        TabManager.activateTab('dashboard');
                    });
                }
            }
        };

        // ----------------------------------------------------
        // MODAL ACTION TRIGGERS
        // ----------------------------------------------------
        function showLogDetails(noTiket, noPelanggan) {
            const log = globalData.logs.find(l => l.no_tiket === noTiket && l.no_pelanggan === noPelanggan);
            if (!log) return;
            
            const container = document.getElementById('modal-details-container');
            
            const dbBadge = log.database === 'ORACLE' ? 'badge-oracle' : 'badge-postgres';
            let statusBadge = 'badge-success';
            if (log.status === 'WARNING') statusBadge = 'badge-warning';
            if (log.status === 'ERROR') statusBadge = 'badge-error';
            
            container.innerHTML = `
                <div class="modal-row">
                    <span class="modal-label">No Tiket</span>
                    <span class="modal-value font-semibold">${log.no_tiket}</span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">Jenis Transaksi</span>
                    <span class="modal-value">${log.jenis_transaksi}</span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">No Pelanggan</span>
                    <span class="modal-value">${log.no_pelanggan}</span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">Tanggal Proses</span>
                    <span class="modal-value">${log.tanggal_proses}</span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">Database</span>
                    <span class="modal-value"><span class="badge ${dbBadge}">${log.database}</span></span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">Status</span>
                    <span class="modal-value"><span class="badge ${statusBadge}">${log.status}</span></span>
                </div>
                <div class="modal-row">
                    <span class="modal-label">Petugas</span>
                    <span class="modal-value">${log.petugas}</span>
                </div>
                <div class="modal-row last" style="display: flex; flex-direction: column; gap: 8px;">
                    <span class="modal-label">Kueri Database SQL</span>
                    <pre class="code-block">${escapeHtml(log.query)}</pre>
                </div>
            `;
            
            document.getElementById('detail-modal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('detail-modal').classList.remove('show');
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('detail-modal');
            if (e.target === modal) {
                closeModal();
            }
        });

        // Initialize Core Modules on Load
        document.addEventListener('DOMContentLoaded', () => {
            TabManager.init();
            DashboardGrid.init();
        });
    </script>
</body>
</html>
