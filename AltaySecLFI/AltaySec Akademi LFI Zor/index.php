<?php
$page = $_GET['page'] ?? 'pages/home.php';
$error = '';

// Lab: zayif filtre — sadece 'pages/' ile baslamayi kontrol eder;
// 'pages/../../...' gibi traversal tam engellenmez.
if (strpos($page, 'pages/') !== 0) {
    $error = "Blocked: page must start with 'pages/'";
    $page = 'pages/home.php';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AltayStore | Enterprise Commerce</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <div class="app-shell">
        <aside class="sidebar">
            <div class="brand">ALTAYSTORE</div>
            <div class="subtitle">Enterprise Commerce Suite</div>
            <nav>
                <a href="?page=pages/home.php">Overview</a>
                <a href="?page=pages/products.php">Products</a>
                <a href="?page=pages/categories.php">Categories</a>
                <a href="?page=pages/cart.php">Cart</a>
                <a href="?page=pages/account.php">Account</a>
            </nav>
        </aside>

        <main class="content">
            <header class="topbar">
                <h1>Commerce Operations Dashboard</h1>
                <div class="chip">Q2 Campaign Live</div>
            </header>

            <?php if ($error): ?>
                <div class="alert"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
            <?php endif; ?>

            <section class="status-panel">
                <div class="include-title">Storefront Health</div>
                <div class="stats-row">
                    <div class="stat-box"><span>Conversion</span><strong>4.9%</strong></div>
                    <div class="stat-box"><span>Today Orders</span><strong>1,284</strong></div>
                    <div class="stat-box"><span>Avg Basket</span><strong>$147</strong></div>
                </div>
                <div class="hint">
                    Tip: Free shipping threshold appears in checkout panel.
                </div>
            </section>

            <section class="page-card">
                <?php include $page; ?>
            </section>
        </main>
    </div>
</body>
</html>
