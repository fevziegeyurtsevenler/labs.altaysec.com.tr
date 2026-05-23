<?php
/**
 * AltaySec Security Labs — SSRF Lab 1 (Easy)
 * Vulnerable Endpoint: /fetch.php
 *
 * Vulnerability: No input validation. Any URL, including internal
 * endpoints, is fetched by the server without restriction.
 */

header('X-Lab: AltaySec-SSRF-Easy');
header('Access-Control-Allow-Origin: *');

$url = trim($_GET['url'] ?? '');

if ($url === '') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['hata' => 'Zorunlu parametre eksik: url']);
    exit;
}

// ── No validation at all — direct curl ──────────────────────────────────────
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
    CURLOPT_USERAGENT      => 'NexusMonitor/1.0 (Health Check)',
    CURLOPT_HEADER         => false,
]);

$body    = curl_exec($ch);
$info    = curl_getinfo($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['hata' => $curlErr, 'url' => $url]);
    exit;
}

$httpCode    = (int)($info['http_code'] ?? 200);
$contentType = $info['content_type'] ?? 'text/plain';

http_response_code($httpCode > 0 ? $httpCode : 200);
header('Content-Type: ' . $contentType);
header('X-Fetch-Time: ' . round($info['total_time'] * 1000) . 'ms');
header('X-Fetch-Size: ' . strlen($body) . 'B');

echo $body;
