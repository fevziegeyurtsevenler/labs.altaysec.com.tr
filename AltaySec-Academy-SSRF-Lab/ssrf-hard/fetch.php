<?php
/**
 * AltaySec Security Labs — SSRF Lab 3 (Hard)
 * Vulnerable Endpoint: /fetch.php
 *
 * Vulnerability: Comprehensive IP blocklist is applied for http/https, but
 * the developer forgot to restrict the protocols cURL can use.
 * The file:// protocol has no host, so IP validation is skipped entirely.
 *
 * Bypass:
 *   /fetch.php?url=file:///var/www/html/secret.txt
 *
 * Notes:
 *   - Direct HTTP access to /secret.txt returns 403 (.htaccess)
 *   - file:// bypasses both the IP check AND Apache .htaccess
 *   - CURLOPT_PROTOCOLS is not restricted — all protocols are allowed
 */

header('X-Lab: AltaySec-SSRF-Hard');
header('Access-Control-Allow-Origin: *');

$url = trim($_GET['url'] ?? '');

if ($url === '') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['hata' => 'Zorunlu parametre eksik: url']);
    exit;
}

$parsed = parse_url($url);
$scheme = strtolower($parsed['scheme'] ?? '');
$host   = strtolower($parsed['host'] ?? '');

// ── Comprehensive IP blocklist (http/https only) ────────────────────────────
// file:// has no host → $host is empty → IP check is SKIPPED
if (in_array($scheme, ['http', 'https'])) {

    // Blocked hostnames
    $blockedHosts = ['localhost', 'metadata.google.internal', 'instance-data'];
    foreach ($blockedHosts as $bh) {
        if (str_contains($host, $bh)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['hata' => "Engellendi: '$bh' host"]);
            exit;
        }
    }

    // Resolve and validate IP
    $resolvedIP = gethostbyname($host);

    $privatePatterns = [
        '/^127\.\d+\.\d+\.\d+$/',     // 127.0.0.0/8
        '/^10\.\d+\.\d+\.\d+$/',      // 10.0.0.0/8
        '/^192\.168\.\d+\.\d+$/',     // 192.168.0.0/16
        '/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/', // 172.16.0.0/12
        '/^169\.254\.\d+\.\d+$/',     // link-local
        '/^0\.\d+\.\d+\.\d+$/',       // 0.0.0.0/8
        '/^::1$/',                     // IPv6 loopback
    ];

    foreach ($privatePatterns as $pattern) {
        if (preg_match($pattern, $resolvedIP)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'hata'      => 'Engellendi: özel veya ayrılmış IP aralığı.',
                'cozumlenen'=> $resolvedIP,
                'host'      => $host,
            ]);
            exit;
        }
    }
}

// ── cURL fetch — protocols NOT restricted! ──────────────────────────────────
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT      => 'NexusHook/3.0 (Webhook Validator)',
    // CURLOPT_PROTOCOLS not set — file:// works!
]);

$body    = curl_exec($ch);
$info    = curl_getinfo($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => $curlErr]);
    exit;
}

http_response_code(200);
header('Content-Type: text/plain');
header('X-Fetch-Time: ' . round(($info['total_time'] ?? 0) * 1000) . 'ms');
header('X-Fetch-Size: ' . strlen($body) . 'B');
echo $body;
