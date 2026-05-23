<?php
/**
 * AltaySec Security Labs — SSRF Lab 2 (Medium)
 * Vulnerable Endpoint: /fetch.php
 *
 * Vulnerability: Naive string-based blocklist. Blocks "127.0.0.1" and
 * "localhost" literals, but alternative IP representations bypass the filter.
 *
 * Bypass examples:
 *   http://0.0.0.0/secret.php
 *   http://127.1/secret.php
 *   http://[::1]/secret.php
 *   http://2130706433/secret.php  (decimal)
 *   http://0177.0.0.1/secret.php  (octal)
 */

header('X-Lab: AltaySec-SSRF-Medium');
header('Access-Control-Allow-Origin: *');

$url = trim($_GET['url'] ?? '');

if ($url === '') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['hata' => 'Zorunlu parametre eksik: url']);
    exit;
}

// ── Naive blocklist — insufficient! ────────────────────────────────────────
$host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

$blocklist = ['127.0.0.1', 'localhost'];

foreach ($blocklist as $blocked) {
    if (str_contains($host, $blocked)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'hata'      => "Erişim reddedildi: '$blocked' engellendi.",
            'engellenen'=> $blocked,
            'host'      => $host,
        ]);
        exit;
    }
}

// ── Fetch (still vulnerable!) ───────────────────────────────────────────────
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 3,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_USERAGENT      => 'NexusFeed/2.1 (Feed Aggregator)',
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

$httpCode = (int)($info['http_code'] ?? 200);
http_response_code($httpCode > 0 ? $httpCode : 200);
header('Content-Type: ' . ($info['content_type'] ?? 'text/plain'));
header('X-Fetch-Time: ' . round($info['total_time'] * 1000) . 'ms');
echo $body;
