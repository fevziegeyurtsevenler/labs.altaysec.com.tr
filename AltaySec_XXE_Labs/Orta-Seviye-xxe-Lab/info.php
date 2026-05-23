<?php
@ini_set('display_errors', '0');
error_reporting(0);

require_once __DIR__ . '/_log.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$logSize    = is_file(ALTAYSEC_LOG_FILE) ? @filesize(ALTAYSEC_LOG_FILE) : 0;
$logEntries = count(altaysec_log_read(500));

$uptime = '-';
if (is_readable('/proc/uptime')) {
    $u = (int) floor((float) strtok((string)@file_get_contents('/proc/uptime'), ' '));
    $d = intdiv($u, 86400);
    $h = intdiv($u % 86400, 3600);
    $m = intdiv($u % 3600, 60);
    $s = $u % 60;
    $uptime = sprintf('%dd %02dh %02dm %02ds', $d, $h, $m, $s);
}

echo json_encode([
    'status'   => 'ok',
    'platform' => [
        'name'         => 'AltaySec Data Sync',
        'codename'     => 'altaysec-data-sync',
        'version'      => '2.4.1',
        'build'        => 'b' . substr(sha1('altaysec-' . PHP_VERSION), 0, 7),
        'env'          => 'production-lab',
        'released'     => '2026-05-12',
    ],
    'runtime'  => [
        'php'             => PHP_VERSION,
        'sapi'            => php_sapi_name(),
        'libxml'          => LIBXML_DOTTED_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? '-',
        'server_name'     => gethostname() ?: '-',
        'os'              => PHP_OS_FAMILY . ' / ' . php_uname('s') . ' ' . php_uname('r'),
        'timezone'        => date_default_timezone_get(),
        'now'             => date('c'),
        'uptime'          => $uptime,
    ],
    'endpoints' => [
        ['method' => 'GET',  'path' => '/',            'desc' => 'Veri Entegrasyon Paneli UI'],
        ['method' => 'POST', 'path' => '/process.php', 'desc' => 'XML payload isleyici (multipart/form, raw)'],
        ['method' => 'GET',  'path' => '/logs.php',    'desc' => 'Son XML isleme loglari (JSON)'],
        ['method' => 'GET',  'path' => '/info.php',    'desc' => 'Platform metadata'],
    ],
    'audit' => [
        'log_file'    => ALTAYSEC_LOG_FILE,
        'log_size'    => $logSize,
        'log_entries' => $logEntries,
    ],
    'notes' => [
        'XML parser harici DTD yuklemesine acik (legacy entegrasyonlar icin geçici).',
        'Hata mesajlari mudahale gerektiren sistemler icin ekrana yansitilir.',
        'Basari durumunda dahili veri katmani guncellenir; payload icerigi UI\'ya donmez.',
    ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
