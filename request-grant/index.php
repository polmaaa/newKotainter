<?php
$jsonPath = '../api/application/config/table_privileges.json';

// Handle POST request to save changes
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $rawInput = file_get_contents('php://input');
    $decoded = json_decode($rawInput, true);

    if (!is_array($decoded)) {
        echo json_encode(['status' => 'error', 'message' => 'Format data tidak valid.']);
        exit;
    }

    $dir = dirname($jsonPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $success = file_put_contents($jsonPath, json_encode($decoded, JSON_PRETTY_PRINT));
    if ($success !== false) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menulis ke berkas json di server.']);
    }
    exit;
}

// Load data
$mappings = [];
if (is_file($jsonPath)) {
    $content = file_get_contents($jsonPath);
    $mappings = json_decode($content, true);
}
if (!is_array($mappings)) {
    $mappings = [];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pemetaan Hak Akses Tabel & Grants</title>
    <!-- Fonts and Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css">
    
    <style>
        :root {
            --primary: #0f766e;
            --primary-hover: #0d5c56;
            --bg: #f8fafc;
            --text: #1e293b;
            --border: #e2e8f0;
            --error: #ef4444;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            padding: 24px;
            line-height: 1.5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid var(--border);
            padding: 24px;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--border);
            padding-bottom: 16px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 16px;
        }
        h1 {
            color: var(--primary);
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            user-select: none;
        }
        .btn-primary {
            background-color: var(--primary);
            color: #ffffff;
        }
        .btn-primary:hover {
            background-color: var(--primary-hover);
        }
        .btn-outline {
            background-color: transparent;
            border: 1.5px solid var(--border);
            color: var(--text);
        }
        .btn-outline:hover {
            background-color: #f1f5f9;
        }
        .btn-icon {
            background: transparent;
            border: none;
            padding: 4px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
        }
        .btn-icon:hover {
            background-color: #e2e8f0;
            color: var(--primary) !important;
        }
        .btn-icon.active {
            background-color: #ccfbf1 !important;
            color: var(--primary) !important;
        }
        .text-red {
            color: var(--error);
        }
        .text-teal {
            color: var(--primary);
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 12px;
        }
        .search-container {
            position: relative;
            flex: 1;
            max-width: 400px;
        }
        .search-input {
            width: 100%;
            padding: 8px 12px 8px 36px;
            border: 1.5px solid var(--border);
            border-radius: 6px;
            outline: none;
            font-size: 0.875rem;
        }
        .search-input:focus {
            border-color: var(--primary);
        }
        .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
        }
        .table-container {
            overflow: auto;
            border: 1px solid var(--border);
            border-radius: 8px;
            max-height: 68vh;
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.8rem;
        }
        th, td {
            padding: 1px 3px;
            border-bottom: 1px solid var(--border);
        }
        th {
            background-color: #f8fafc;
            font-weight: 600;
            text-align: left;
            position: sticky;
            top: 0;
            z-index: 10;
            border-bottom: 2px solid var(--border);
        }
        td {
            background-color: #ffffff;
        }
        tr:hover td {
            background-color: #f8fafc;
        }
        .table-input {
            width: 100%;
            border: 1px solid transparent;
            background: transparent;
            padding: 1px 3px;
            font-size: 0.8rem;
            font-family: inherit;
            border-radius: 4px;
            outline: none;
            transition: all 0.1s;
            box-sizing: border-box;
        }
        .table-input:focus {
            border-color: var(--primary);
            background-color: #ffffff;
            box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
        }
        textarea.table-input {
            resize: none;
            min-height: 16px;
            height: auto;
            padding: 1px 3px;
            font-family: inherit;
            line-height: 1.2;
            overflow-y: hidden;
            display: block;
            box-sizing: border-box;
        }
        .resize-handle {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 4px;
            cursor: col-resize;
            user-select: none;
            background-color: transparent;
            z-index: 2;
            transition: background-color 0.2s;
        }
        .resize-handle:hover, .resize-handle.resizing {
            background-color: var(--primary);
        }
        
        /* Styled col-db and col-status as colored badges with NO icon/chevron */
        .col-db, .col-status {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            text-align: center;
            font-weight: 700;
            font-size: 0.75rem !important;
            padding: 2px 8px !important;
            border-radius: 6px;
            border: 1.5px solid transparent;
            cursor: pointer;
            width: fit-content;
            display: inline-block;
            outline: none;
            transition: all 0.15s;
            text-align-last: center; /* Center select option text on Windows */
        }
        .col-db:focus, .col-status:focus {
            box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
        }
        .db-oracle {
            background-color: #fffbeb !important; /* light yellow/amber */
            color: #b45309 !important;
            border-color: #fde68a !important;
        }
        .db-postgresql {
            background-color: #eff6ff !important; /* light blue */
            color: #1d4ed8 !important;
            border-color: #bfdbfe !important;
        }
        .status-done {
            background-color: #ecfdf5 !important; /* light green */
            color: #047857 !important;
            border-color: #a7f3d0 !important;
        }
        .status-request {
            background-color: #faf5ff !important; /* light purple */
            color: #7e22ce !important;
            border-color: #e9d5ff !important;
        }
        .status-pending {
            background-color: #fffbeb !important; /* light amber/orange */
            color: #d97706 !important;
            border-color: #fde68a !important;
        }
        .status-blank {
            background-color: #f1f5f9 !important; /* light grey */
            color: #64748b !important;
            border-color: #cbd5e1 !important;
        }
        /* Popover filter menu styling */
        .popover-item {
            padding: 8px 12px;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #334155;
            user-select: none;
        }
        .popover-item:hover {
            background-color: #f1f5f9;
            color: var(--primary);
        }
        .popover-item.active {
            background-color: #eff6ff;
            color: #1d4ed8;
            font-weight: 600;
        }
        .popover-item i {
            font-size: 0.75rem;
            width: 12px;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <h1><i class="pi pi-shield"></i> Pemetaan Hak Akses Tabel & Grants</h1>
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline" onclick="addRow()"><i class="pi pi-plus"></i> Tambah Baris</button>
            <button class="btn btn-primary" id="save-btn" onclick="saveChanges()"><i class="pi pi-save"></i> Simpan Pemetaan</button>
        </div>
    </header>

    <div class="toolbar">
        <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input type="text" id="search-input" class="search-input" placeholder="Cari berdasarkan menu, tabel, atau keterangan..." oninput="filterTable()">
        </div>
        <span id="row-count" style="font-size: 0.85rem; color: #64748b;">
            Menampilkan <?php echo count($mappings); ?> dari <?php echo count($mappings); ?> baris data
        </span>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;">No</th>
                    <th style="width: 180px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span style="font-weight: 600;">Nama Menu</span>
                            <button id="filter-menu-btn" class="btn-icon" style="color: #94a3b8; font-size: 0.8rem;" onclick="toggleFilterPopover(event, 'menu')" title="Filter Menu">
                                <i class="pi pi-filter"></i>
                            </button>
                        </div>
                    </th>
                    <th style="width: 120px;">Database</th>
                    <th style="width: 240px;">Nama Tabel</th>
                    <th style="width: 180px; min-width: 160px;">Grant (Privilege)</th>
                    <th style="width: 420px;">Keterangan / Deskripsi Penggunaan</th>
                    <th style="width: 110px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <span style="font-weight: 600;">Status</span>
                            <button id="filter-status-btn" class="btn-icon" style="color: #94a3b8; font-size: 0.8rem;" onclick="toggleFilterPopover(event, 'status')" title="Filter Status">
                                <i class="pi pi-filter"></i>
                            </button>
                        </div>
                    </th>
                    <th style="width: 65px; text-align: center;">Aksi</th>
                </tr>
            </thead>
            <tbody id="table-body">
                <?php if (empty($mappings)): ?>
                    <tr>
                        <td class="row-number" style="text-align: center;">1</td>
                        <td><input type="text" class="table-input col-menu" value="Update PNJ" onchange="updateHeaderFilters()"></td>
                        <td style="text-align: center;">
                            <select class="col-db db-oracle" onchange="updateDbClass(this); filterTable();">
                                <option value="ORACLE" selected>ORACLE</option>
                                <option value="POSTGRESQL">POSTGRESQL</option>
                            </select>
                        </td>
                        <td><input type="text" class="table-input col-tabel" style="font-family: monospace;" value="BILL52.TRANS_101"></td>
                        <td><input type="text" class="table-input col-grant" style="font-family: monospace;" value="SELECT"></td>
                        <td><textarea class="table-input col-ket" rows="1">Membaca data pelanggan lama</textarea></td>
                        <td style="text-align: center;">
                            <select class="col-status status-blank" onchange="updateStatusClass(this); filterTable();">
                                <option value="" selected>-</option>
                                <option value="DONE">DONE</option>
                                <option value="REQUEST">REQUEST</option>
                                <option value="PENDING">PENDING</option>
                            </select>
                        </td>
                        <td style="text-align: center;">
                            <button class="btn btn-icon text-teal" onclick="duplicateRow(this)" title="Duplikat"><i class="pi pi-copy"></i></button>
                            <button class="btn btn-icon text-red" onclick="deleteRow(this)" title="Hapus"><i class="pi pi-trash"></i></button>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($mappings as $index => $item): 
                        $menuVal = isset($item['NAMA_MENU']) ? $item['NAMA_MENU'] : '';
                        $dbVal = isset($item['DATABASE']) ? $item['DATABASE'] : 'ORACLE';
                        $tabelVal = isset($item['NAMA_TABEL']) ? $item['NAMA_TABEL'] : '';
                        $grantVal = isset($item['GRANT']) ? $item['GRANT'] : '';
                        $ketVal = isset($item['KETERANGAN']) ? $item['KETERANGAN'] : '';
                        $statusVal = isset($item['STATUS']) ? $item['STATUS'] : '';
                        
                        $dbClass = $dbVal === 'ORACLE' ? 'db-oracle' : 'db-postgresql';
                        $statusClass = $statusVal === 'DONE' ? 'status-done' : ($statusVal === 'REQUEST' ? 'status-request' : ($statusVal === 'PENDING' ? 'status-pending' : 'status-blank'));
                    ?>
                        <tr>
                            <td class="row-number" style="text-align: center; font-family: monospace; font-weight: 600; color: #64748b;"><?php echo $index + 1; ?></td>
                            <td><input type="text" class="table-input col-menu" value="<?php echo htmlspecialchars($menuVal); ?>" onchange="updateHeaderFilters()"></td>
                            <td style="text-align: center;">
                                <select class="col-db <?php echo $dbClass; ?>" onchange="updateDbClass(this); filterTable();">
                                    <option value="ORACLE" <?php echo $dbVal === 'ORACLE' ? 'selected' : ''; ?>>ORACLE</option>
                                    <option value="POSTGRESQL" <?php echo $dbVal === 'POSTGRESQL' ? 'selected' : ''; ?>>POSTGRESQL</option>
                                </select>
                            </td>
                            <td><input type="text" class="table-input col-tabel" style="font-family: monospace;" value="<?php echo htmlspecialchars($tabelVal); ?>"></td>
                            <td><input type="text" class="table-input col-grant" style="font-family: monospace;" value="<?php echo htmlspecialchars($grantVal); ?>"></td>
                            <td><textarea class="table-input col-ket" rows="1"><?php echo htmlspecialchars($ketVal); ?></textarea></td>
                            <td style="text-align: center;">
                                <select class="col-status <?php echo $statusClass; ?>" onchange="updateStatusClass(this); filterTable();">
                                    <option value="" <?php echo empty($statusVal) ? 'selected' : ''; ?>>-</option>
                                    <option value="DONE" <?php echo $statusVal === 'DONE' ? 'selected' : ''; ?>>DONE</option>
                                    <option value="REQUEST" <?php echo $statusVal === 'REQUEST' ? 'selected' : ''; ?>>REQUEST</option>
                                    <option value="PENDING" <?php echo $statusVal === 'PENDING' ? 'selected' : ''; ?>>PENDING</option>
                                </select>
                            </td>
                            <td style="text-align: center;">
                                <button class="btn btn-icon text-teal" onclick="duplicateRow(this)" title="Duplikat"><i class="pi pi-copy"></i></button>
                                <button class="btn btn-icon text-red" onclick="deleteRow(this)" title="Hapus"><i class="pi pi-trash"></i></button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- DYNAMIC FLOATING FILTER POPOVER -->
<div id="filter-popover" style="display: none; position: absolute; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); z-index: 1000; min-width: 180px; padding: 6px 0;" onclick="event.stopPropagation()"></div>

<!-- STYLED CUSTOM CONFIRM MODAL -->
<div id="confirm-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
    <div style="background: #ffffff; border-radius: 12px; width: 420px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--border); text-align: center; animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
        <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem; color: var(--error); margin-bottom: 12px; display: block;"></i>
        <h3 style="margin-bottom: 8px; font-size: 1.15rem; color: #1e293b; font-weight: 700;">Hapus Baris Pemetaan?</h3>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 20px; line-height: 1.4;">Apakah Anda yakin ingin menghapus baris ini dari pemetaan hak akses tabel? Perubahan ini baru permanen setelah Anda menyimpan data.</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-outline" onclick="closeConfirmModal()" style="padding: 8px 20px; border-radius: 8px;">Batal</button>
            <button class="btn btn-primary" onclick="confirmDelete()" style="background-color: var(--error); padding: 8px 20px; border-radius: 8px;">Hapus</button>
        </div>
    </div>
</div>

<!-- TOAST NOTIFICATION CONTAINER -->
<div id="toast-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 8px;"></div>

<script>
    let rowToDelete = null;
    let activeMenuFilters = new Set();
    let activeStatusFilters = new Set();

    // Database & Status select class updating helpers
    function updateDbClass(select) {
        if (select.value === 'ORACLE') {
            select.className = 'col-db db-oracle';
        } else {
            select.className = 'col-db db-postgresql';
        }
    }

    function updateStatusClass(select) {
        if (select.value === 'DONE') {
            select.className = 'col-status status-done';
        } else if (select.value === 'REQUEST') {
            select.className = 'col-status status-request';
        } else if (select.value === 'PENDING') {
            select.className = 'col-status status-pending';
        } else {
            select.className = 'col-status status-blank';
        }
    }

    // HTML escape helper
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Single quotes escape helper
    function escapeQuotes(str) {
        return str.replace(/'/g, "\\'");
    }

    // Toast Notification generator
    function showToastNotification(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const isSuccess = type === 'success';
        const bgColor = isSuccess ? '#ecfdf5' : '#fef2f2';
        const borderColor = isSuccess ? '#10b981' : '#ef4444';
        const textColor = isSuccess ? '#065f46' : '#991b1b';
        const icon = isSuccess ? 'pi pi-check-circle' : 'pi pi-exclamation-circle';
        
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: ${bgColor};
            border: 1px solid ${borderColor};
            color: ${textColor};
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 280px;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        toast.innerHTML = `<i class="${icon}" style="font-size: 1.1rem; color: ${borderColor}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Modal action helpers
    function openConfirmModal() {
        document.getElementById('confirm-modal').style.display = 'flex';
    }

    function closeConfirmModal() {
        document.getElementById('confirm-modal').style.display = 'none';
        rowToDelete = null;
    }

    function confirmDelete() {
        if (rowToDelete) {
            rowToDelete.remove();
            updateRowNumbers();
            filterTable();
            updateHeaderFilters();
            showToastNotification('Baris pemetaan berhasil dihapus.', 'success');
        }
        closeConfirmModal();
    }

    // Toggle filter dropdown menu card
    function toggleFilterPopover(event, filterType) {
        event.stopPropagation();
        const popover = document.getElementById('filter-popover');
        
        if (popover.style.display === 'block' && popover.dataset.type === filterType) {
            popover.style.display = 'none';
            return;
        }
        
        popover.dataset.type = filterType;
        refreshPopoverContent(filterType);
        
        popover.style.display = 'block';
        
        // Dynamic positioning below the funnel button
        const btnRect = event.currentTarget.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        popover.style.left = (btnRect.left + scrollLeft) + 'px';
        popover.style.top = (btnRect.bottom + scrollTop + 4) + 'px';
    }

    // Refresh menu choices and checkbox states in the popover dynamically
    function refreshPopoverContent(filterType) {
        const popover = document.getElementById('filter-popover');
        let html = '';
        
        if (filterType === 'menu') {
            const uniqueMenus = new Set();
            document.querySelectorAll('#table-body tr').forEach(tr => {
                const val = tr.querySelector('.col-menu').value.trim();
                if (val) {
                    uniqueMenus.add(val);
                }
            });
            
            const sortedMenus = Array.from(uniqueMenus).sort();
            const isAllSelected = activeMenuFilters.size === 0;
            
            html += `<div class="popover-item ${isAllSelected ? 'active' : ''}" onclick="toggleFilter('menu', '')">
                <i class="${isAllSelected ? 'pi pi-check-square text-teal' : 'pi pi-square'}" style="color: ${isAllSelected ? 'var(--primary)' : '#94a3b8'}"></i> <span>Semua Menu</span>
            </div>`;
            
            sortedMenus.forEach(menu => {
                const isSelected = activeMenuFilters.has(menu);
                const iconClass = isSelected ? 'pi pi-check-square text-teal' : 'pi pi-square';
                html += `<div class="popover-item ${isSelected ? 'active' : ''}" onclick="toggleFilter('menu', '${escapeQuotes(menu)}')">
                    <i class="${iconClass}" style="color: ${isSelected ? 'var(--primary)' : '#94a3b8'}"></i> <span>${escapeHtml(menu)}</span>
                </div>`;
            });
        } else if (filterType === 'status') {
            const isAllSelected = activeStatusFilters.size === 0;
            const options = [
                { value: 'DONE', label: 'DONE' },
                { value: 'REQUEST', label: 'REQUEST' },
                { value: 'PENDING', label: 'PENDING' },
                { value: 'BLANK', label: 'Blank (-)' }
            ];
            
            html += `<div class="popover-item ${isAllSelected ? 'active' : ''}" onclick="toggleFilter('status', '')">
                <i class="${isAllSelected ? 'pi pi-check-square text-teal' : 'pi pi-square'}" style="color: ${isAllSelected ? 'var(--primary)' : '#94a3b8'}"></i> <span>Semua Status</span>
            </div>`;
            
            options.forEach(opt => {
                const isSelected = activeStatusFilters.has(opt.value);
                const iconClass = isSelected ? 'pi pi-check-square text-teal' : 'pi pi-square';
                html += `<div class="popover-item ${isSelected ? 'active' : ''}" onclick="toggleFilter('status', '${opt.value}')">
                    <i class="${iconClass}" style="color: ${isSelected ? 'var(--primary)' : '#94a3b8'}"></i> <span>${opt.label}</span>
                </div>`;
            });
        }
        
        popover.innerHTML = html;
    }

    // Toggle filter item state and update filter button visual highlight
    function toggleFilter(type, value) {
        if (type === 'menu') {
            if (value === '') {
                activeMenuFilters.clear();
            } else {
                if (activeMenuFilters.has(value)) {
                    activeMenuFilters.delete(value);
                } else {
                    activeMenuFilters.add(value);
                }
            }
            
            const btn = document.getElementById('filter-menu-btn');
            if (activeMenuFilters.size > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
            refreshPopoverContent('menu');
        } else if (type === 'status') {
            if (value === '') {
                activeStatusFilters.clear();
            } else {
                if (activeStatusFilters.has(value)) {
                    activeStatusFilters.delete(value);
                } else {
                    activeStatusFilters.add(value);
                }
            }
            
            const btn = document.getElementById('filter-status-btn');
            if (activeStatusFilters.size > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
            refreshPopoverContent('status');
        }
        
        filterTable();
    }

    // Close popover when clicking anywhere else
    window.addEventListener('click', () => {
        const popover = document.getElementById('filter-popover');
        if (popover) {
            popover.style.display = 'none';
        }
    });

    function addRow() {
        const tbody = document.getElementById('table-body');
        const rows = tbody.querySelectorAll('tr');
        const nextNo = rows.length + 1;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="row-number" style="text-align: center; font-family: monospace; font-weight: 600; color: #64748b;">${nextNo}</td>
            <td><input type="text" class="table-input col-menu" value="Menu Baru" onchange="updateHeaderFilters()"></td>
            <td style="text-align: center;">
                <select class="col-db db-oracle" onchange="updateDbClass(this); filterTable();">
                    <option value="ORACLE" selected>ORACLE</option>
                    <option value="POSTGRESQL">POSTGRESQL</option>
                </select>
            </td>
            <td><input type="text" class="table-input col-tabel" style="font-family: monospace;" value="SKEMA.TABEL"></td>
            <td><input type="text" class="table-input col-grant" style="font-family: monospace;" value="SELECT"></td>
            <td><textarea class="table-input col-ket" rows="1">Keterangan...</textarea></td>
            <td style="text-align: center;">
                <select class="col-status status-blank" onchange="updateStatusClass(this); filterTable();">
                    <option value="" selected>-</option>
                    <option value="DONE">DONE</option>
                    <option value="REQUEST">REQUEST</option>
                    <option value="PENDING">PENDING</option>
                </select>
            </td>
            <td style="text-align: center;">
                <button class="btn btn-icon text-teal" onclick="duplicateRow(this)" title="Duplikat"><i class="pi pi-copy"></i></button>
                <button class="btn btn-icon text-red" onclick="deleteRow(this)" title="Hapus"><i class="pi pi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
        updateRowNumbers();
        filterTable();
        updateHeaderFilters();
        autoResizeTextareas();
        showToastNotification('Baris kosong baru berhasil ditambahkan.', 'success');
    }

    function duplicateRow(btn) {
        const tr = btn.closest('tr');
        const clone = tr.cloneNode(true);
        
        // Copy correct select elements values
        const dbSelect = clone.querySelector('.col-db');
        const statusSelect = clone.querySelector('.col-status');
        dbSelect.value = tr.querySelector('.col-db').value;
        statusSelect.value = tr.querySelector('.col-status').value;
        
        // Update styling classes on clone
        updateDbClass(dbSelect);
        updateStatusClass(statusSelect);

        // Insert cloned row after original row
        tr.after(clone);
        updateRowNumbers();
        filterTable();
        updateHeaderFilters();
        autoResizeTextareas();
        showToastNotification('Baris berhasil diduplikasi.', 'success');
    }

    function deleteRow(btn) {
        const tbody = document.getElementById('table-body');
        const rows = tbody.querySelectorAll('tr');
        if (rows.length <= 1) {
            showToastNotification('Harus tersisa minimal satu baris data!', 'error');
            return;
        }
        
        rowToDelete = btn.closest('tr');
        openConfirmModal();
    }

    function updateRowNumbers() {
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach((tr, index) => {
            tr.querySelector('.row-number').innerText = index + 1;
        });
        document.getElementById('row-count').innerText = `Menampilkan ${rows.length} dari ${rows.length} baris data`;
    }

    function filterTable() {
        const q = document.getElementById('search-input').value.toLowerCase();
        
        const rows = document.querySelectorAll('#table-body tr');
        let visibleCount = 0;

        rows.forEach(tr => {
            const menu = tr.querySelector('.col-menu').value;
            const db = tr.querySelector('.col-db').value.toLowerCase();
            const tabel = tr.querySelector('.col-tabel').value.toLowerCase();
            const grant = tr.querySelector('.col-grant').value.toLowerCase();
            const ket = tr.querySelector('.col-ket').value.toLowerCase();
            const status = tr.querySelector('.col-status').value;

            // 1. General search check
            const matchSearch = q ? (
                menu.toLowerCase().includes(q) || 
                db.includes(q) || 
                tabel.includes(q) || 
                grant.includes(q) || 
                ket.includes(q) || 
                status.toLowerCase().includes(q)
            ) : true;

            // 2. Menu header filter check (multi-select)
            const matchMenu = activeMenuFilters.size > 0 ? activeMenuFilters.has(menu) : true;

            // 3. Status header filter check (multi-select)
            let matchStatus = true;
            if (activeStatusFilters.size > 0) {
                const checkStatus = status === '' ? 'BLANK' : status;
                matchStatus = activeStatusFilters.has(checkStatus);
            }

            if (matchSearch && matchMenu && matchStatus) {
                tr.style.display = '';
                visibleCount++;
            } else {
                tr.style.display = 'none';
            }
        });

        document.getElementById('row-count').innerText = `Menampilkan ${visibleCount} dari ${rows.length} baris data`;
    }

    function updateHeaderFilters() {
        // Updates the available list, currently handled inside toggleFilterPopover dynamically.
    }

    async function saveChanges() {
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Menyimpan...';

        const rows = document.querySelectorAll('#table-body tr');
        const payload = [];

        rows.forEach((tr, index) => {
            const menu = tr.querySelector('.col-menu').value;
            const db = tr.querySelector('.col-db').value;
            const tabel = tr.querySelector('.col-tabel').value;
            const grant = tr.querySelector('.col-grant').value;
            const ket = tr.querySelector('.col-ket').value;
            const status = tr.querySelector('.col-status').value;

            payload.push({
                NO: String(index + 1),
                NAMA_MENU: menu,
                DATABASE: db,
                NAMA_TABEL: tabel,
                GRANT: grant,
                KETERANGAN: ket,
                STATUS: status
            });
        });

        try {
            const res = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const result = await res.json();
                if (result.status === 'success') {
                    showToastNotification('Pemetaan hak akses tabel berhasil disimpan ke server!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showToastNotification('Gagal menyimpan: ' + (result.message || 'Error tidak dikenal'), 'error');
                }
            } else {
                showToastNotification('Gagal berkomunikasi dengan server backend.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToastNotification('Gagal menghubungi server.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="pi pi-save"></i> Simpan Pemetaan';
        }
    }

    function autoResizeTextareas() {
        document.querySelectorAll('textarea.col-ket').forEach(ta => {
            ta.style.height = 'auto';
            // Set height to scrollHeight, adding a tiny margin to prevent scrollbars
            ta.style.height = (ta.scrollHeight) + 'px';
            
            // Attach event listener so it auto-resizes as user types
            if (!ta.dataset.listenerAttached) {
                ta.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = this.scrollHeight + 'px';
                });
                ta.dataset.listenerAttached = 'true';
            }
        });
    }

    function initResizableColumns() {
        const headers = document.querySelectorAll('table thead th');
        headers.forEach(th => {
            const index = Array.from(th.parentNode.children).indexOf(th);
            // Skip No (0) and Aksi (last column)
            if (index === 0 || index === headers.length - 1) return;
            
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            th.appendChild(handle);
            
            let startX, startWidth;
            
            handle.addEventListener('mousedown', e => {
                startX = e.pageX;
                startWidth = th.offsetWidth;
                handle.classList.add('resizing');
                
                const onMouseMove = e => {
                    const width = startWidth + (e.pageX - startX);
                    th.style.width = width + 'px';
                    th.style.minWidth = width + 'px';
                };
                
                const onMouseUp = () => {
                    handle.classList.remove('resizing');
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                e.preventDefault();
            });
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        filterTable();
        initResizableColumns();
        autoResizeTextareas();
    });
</script>

<style>
    @keyframes modalFadeIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>
</body>
</html>
