<?php
$page = $_GET['page'] ?? 'home';

// Intentionally weak single-pass filter for training purposes.
$filtered = str_replace(['../', '..\\'], '', $page);
$target = 'pages/' . $filtered . '.php';

// Training mode: allow wrappers and direct paths to demonstrate LFI behavior.
if (str_contains($filtered, '://') || str_contains($filtered, '/')) {
    $target = $filtered;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALTAYSEC BlackBoard Forum - Medium LFI Lab</title>
    <style>
        :root {
            --bg-main: #050914;
            --panel-bg: #0c1422;
            --panel-border: #ff4c5a;
            --text-main: #d8dde8;
            --text-muted: #9ba8bf;
            --accent: #ff4c5a;
            --accent-dark: #d73849;
        }

        * {
            box-sizing: border-box;
            font-family: "Consolas", "Courier New", monospace;
        }

        body {
            margin: 0;
            background: radial-gradient(circle at top, #0d1a33 0%, var(--bg-main) 45%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 48px 20px;
        }

        .container {
            width: 100%;
            max-width: 1080px;
        }

        h1 {
            color: var(--accent);
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-size: 30px;
        }

        .card {
            border: 2px solid var(--panel-border);
            background: linear-gradient(180deg, rgba(12, 20, 34, 0.95), rgba(6, 12, 22, 0.95));
            border-radius: 10px;
            padding: 22px;
            box-shadow: 0 0 0 1px rgba(255, 76, 90, 0.15), 0 12px 35px rgba(0, 0, 0, 0.45);
            margin-bottom: 20px;
        }

        .nav a {
            display: inline-block;
            color: var(--text-main);
            text-decoration: none;
            border: 1px solid var(--panel-border);
            padding: 8px 12px;
            margin-right: 8px;
            margin-bottom: 10px;
            border-radius: 4px;
            transition: 0.2s ease;
        }

        .nav a:hover {
            background: var(--accent);
            color: #101010;
        }

        .status {
            color: var(--text-muted);
            margin-top: 10px;
            line-height: 1.5;
            border-left: 3px solid #2f3b57;
            padding-left: 10px;
        }

        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }

        .badge {
            border: 1px solid #2f3b57;
            border-radius: 999px;
            padding: 6px 12px;
            color: var(--text-muted);
            font-size: 12px;
            background: #0a1220;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
            margin-top: 12px;
        }

        .stat {
            border: 1px solid #2f3b57;
            border-radius: 8px;
            padding: 10px;
            background: #0a1220;
        }

        .stat strong {
            color: var(--accent);
            display: block;
            font-size: 18px;
            margin-bottom: 4px;
        }

        .content {
            padding: 16px;
            border: 1px solid #2f3b57;
            background: #0a1220;
            border-left: 4px solid var(--accent);
            min-height: 280px;
        }

        .footer {
            color: var(--text-muted);
            text-align: center;
            font-size: 13px;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <main class="container">
        <section class="card">
            <div class="title-row">
                <h1>ALTAYSEC BlackBoard Forum</h1>
                <span class="badge">network: online / trust: verified</span>
            </div>
            <div class="nav">
                <a href="?page=home">home</a>
                <a href="?page=forum">forum</a>
                <a href="?page=intel">intel</a>
                <a href="?page=incidents">incidents</a>
                <a href="?page=ctf">ctf</a>
                <a href="?page=rules">rules</a>
                <a href="?page=lfi-lab">lfi-lab</a>
                <a href="?page=help">help</a>
                <a href="?page=contact">contact</a>
            </div>
            <p class="status">ALTAYSEC topluluk forumu aktif. Dinamik include laboratuvari medium seviyede test modunda.</p>
            <div class="stats-grid">
                <div class="stat">
                    <strong>3,842</strong>
                    aktif konu
                </div>
                <div class="stat">
                    <strong>219</strong>
                    bug bounty raporu
                </div>
                <div class="stat">
                    <strong>97</strong>
                    acik olay incelemesi
                </div>
                <div class="stat">
                    <strong>24/7</strong>
                    soc gozetim modulu
                </div>
            </div>
        </section>

        <section class="card content">
            <?php include $target; ?>
        </section>
        <p class="footer">BlackBoard Forum v2.6 - controlled LFI training environment</p>
    </main>
</body>
</html>
