<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AltaySec | Offensive Security Notes</title>
    <link rel="stylesheet" href="assets/style.css">
    <style>:root{--accent:#fb923c;--accent-glow:rgba(251,146,60,.15);}</style>
</head>
<body>
    <div class="site-shell">
        <header>
            <div class="brand-row">
                <div class="logo">ALTAYSEC</div>
                <div class="status-pill">Threat Researcher</div>
                <div style="margin-left:auto;font-size:11px;font-weight:700;letter-spacing:1px;background:var(--accent);color:#000;padding:2px 8px;border-radius:4px;">ZOR</div>
            </div>
            <nav class="main-nav">
                <a href="?page=pages/home.php">Anasayfa</a>
                <a href="?page=pages/about.php">Hakkımızda</a>
                <a href="?page=pages/contact.php">İletişim</a>
            </nav>
        </header>

        <section class="hero">
            <h2>Web Güvenliği Öğren, Test Et, Raporla</h2>
            <p>Bu alan bir portfolio sitesi görünümü altında eğitim senaryoları sunar. Menüden bölümleri gez ve uygulamanın davranışını analiz et.</p>
        </section>

        <div class="layout-grid" style="grid-template-columns: 1fr;">
            <main class="content">
                <?php
                $page = $_GET['page'] ?? 'pages/home.php';
                $allowed = ['pages/home.php', 'pages/about.php', 'pages/contact.php'];
                if (in_array($page, $allowed)) {
                    include($page);
                } else {
                    include('pages/home.php');
                }
                ?>
            </main>
        </div>

        <footer class="site-footer">
            <div style="margin-bottom:20px;">
                <details style="cursor:pointer; background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px; max-width:400px; margin:0 auto;">
                    <summary style="font-size:13px; color:var(--accent); font-weight:600;">💡 Analiz İpucu (Hint)</summary>
                    <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">IP filtreleri çok sıkıysa, farklı protokolleri (file://, gopher:// vb.) deneyin. Dosya sistemini okumak bazen sunucuyu hacklemekten daha kolaydır.</p>
                </details>
            </div>
            <p class="copyright">© 2026 AltaySec Labs — Tüm Hakları Saklıdır.</p>
        </footer>
    </div>
</body>
</html>
