<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AltaySec | Offensive Security Blog</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <div class="site-shell">
        <header>
            <div class="brand-row">
                <div class="logo">ALTAYSEC</div>
                <div class="status-pill">Threat Researcher</div>
            </div>
            <h1>AltaySec Offensive Security Notes</h1>
            <p class="subtitle">Kisisel pentest notlari, CTF cozumleri ve zafiyet egitim laboratuvarlari</p>
            <nav class="main-nav">
                <a href="?page=pages/home.php">Anasayfa</a>
                <a href="?page=pages/about.php">Hakkımızda</a>
                <a href="?page=pages/contact.php">Iletisim</a>
            </nav>
        </header>
        <section class="hero">
            <p class="hero-tag">LIVE LAB</p>
            <h2>Web Guvenligi Ogren, Test Et, Raporla</h2>
            <p>Bu alan bir portfolio sitesi gorunumu altinda egitim senaryolari sunar. Menuden bolumleri gez ve uygulamanin davranisini analiz et.</p>
        </section>
        <div class="layout-grid">
            <main class="content">
                <?php
                $page = $_GET['page'] ?? 'pages/home.php';
                include($page);
                ?>
            </main>
            <aside class="side-panel">
                <h3>Guncel Konular</h3>
                <ul>
                    <li>LFI / RFI temelleri</li>
                    <li>Bug bounty rapor yapisi</li>
                    <li>Log analizi ve IOC takibi</li>
                </ul>
                <h3>Son Yazi</h3>
                <p class="micro">"Input validation yoksa saldiri yuzeyi vardir."</p>
            </aside>
        </div>
        <footer class="site-footer">
            <p class="hint">Sistem kok dizinindeki (root) bayragi (flag.txt) bulabilir misin?</p>
            <p class="copyright">2026 AltaySec Labs</p>
        </footer>
    </div>
</body>
</html>
