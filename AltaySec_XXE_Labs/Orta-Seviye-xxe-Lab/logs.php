<?php
@ini_set('display_errors', '0');
error_reporting(0);

require_once __DIR__ . '/_log.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
if ($limit < 1)   $limit = 1;
if ($limit > 500) $limit = 500;

$entries = altaysec_log_read($limit);

$ok    = 0;
$err   = 0;
$bytes = 0;
foreach ($entries as $e) {
    if (($e['status'] ?? '') === 'ok') $ok++;
    else                                $err++;
    $bytes += (int)($e['bytes'] ?? 0);
}

echo json_encode([
    'status'  => 'ok',
    'count'   => count($entries),
    'summary' => [
        'ok'    => $ok,
        'error' => $err,
        'bytes' => $bytes,
    ],
    'entries' => $entries,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
