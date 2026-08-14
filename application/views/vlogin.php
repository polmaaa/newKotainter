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
    
    <!-- Custom Vanilla CSS -->
    <style>
        :root {
            --primary: #0f766e; /* Deep Teal */
            --primary-hover: #115e59;
            --primary-light: #f0fdfa; /* Teal 50 */
            --bg-body: #f1f5f9; /* Cool Slate Gray */
            --bg-card: #ffffff;
            --text-main: #0f172a; /* Slate 900 */
            --text-muted: #475569; /* Slate 600 */
            --border-color: #cbd5e1; /* Slate 300 */
            --error: #e11d48; /* Rose 600 */
            --error-bg: #fff1f2;
            --error-border: #fecaca;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            font-size: 14px; /* Meningkatkan sedikit basis root rem */
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 16px;
            font-size: 1rem;
        }

        .login-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            width: 100%;
            max-width: 420px;
            padding: 40px 32px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .login-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
        }

        .logo-icon {
            width: 48px;
            height: 48px;
            background-color: var(--primary-light);
            color: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 8px;
        }

        .brand-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-main);
        }

        .brand-subtitle {
            font-size: 0.875rem;
            color: var(--text-muted);
        }

        /* Error Alert Styling */
        .error-alert {
            background-color: var(--error-bg);
            border: 1px solid var(--error-border);
            color: var(--error);
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }

        .form-group label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-main);
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-wrapper i {
            position: absolute;
            left: 14px;
            color: var(--text-muted);
            font-size: 0.95rem;
            pointer-events: none;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px 12px 40px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
            color: var(--text-main);
        }

        .form-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }

        .form-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.825rem;
            margin-bottom: 24px;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            color: var(--text-muted);
            user-select: none;
        }

        .remember-me input {
            cursor: pointer;
        }

        .forgot-link {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        .forgot-link:hover {
            text-decoration: underline;
        }

        .btn-submit {
            width: 100%;
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-submit:hover {
            background-color: var(--primary-hover);
        }

        .demo-credentials {
            text-align: center;
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 16px;
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="login-header">
            <div class="logo-icon">
                <i class="pi pi-database"></i>
            </div>
            <h1 class="brand-title">NewKotainter</h1>
            <p class="brand-subtitle">Silakan masuk menggunakan kredensial Anda.</p>
        </div>

        <?php if (isset($error) && !empty($error)): ?>
            <div class="error-alert">
                <i class="pi pi-exclamation-circle"></i>
                <span><?php echo htmlspecialchars($error); ?></span>
            </div>
        <?php endif; ?>

        <form action="<?php echo $action; ?>" method="POST" onsubmit="onSubmit(event)">
            <div class="form-group">
                <label for="username">Username</label>
                <div class="input-wrapper">
                    <i class="pi pi-user"></i>
                    <input type="text" id="username" name="username" class="form-input" placeholder="Masukkan username" required autofocus autocomplete="off">
                </div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <i class="pi pi-lock"></i>
                    <input type="password" id="password" name="password" class="form-input" placeholder="Masukkan password" required>
                </div>
            </div>

            <div class="form-actions">
                <label class="remember-me">
                    <input type="checkbox" name="remember" id="remember">
                    <span>Ingat saya</span>
                </label>
                <a href="#" class="forgot-link">Lupa password?</a>
            </div>

            <button type="submit" class="btn-submit" id="btn-login">
                <span>Masuk</span>
                <i class="pi pi-sign-in"></i>
            </button>
        </form>

        <div class="demo-credentials">
            Gunakan data default: <strong>admin</strong> / <strong>admin123</strong>
        </div>
    </div>

    <script>
        function onSubmit(e) {
            const btn = document.getElementById('btn-login');
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
            btn.innerHTML = '<span>Memproses...</span> <i class="pi pi-spin pi-spinner"></i>';
        }
    </script>
</body>
</html>
