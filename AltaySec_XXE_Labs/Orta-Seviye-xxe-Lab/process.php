<?php

require_once __DIR__ . '/_log.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$t0 = microtime(true);

function altaysec_respond(array $payload, int $code = 200): void {
    global $t0;
    http_response_code($code);
    $ms = (int) round((microtime(true) - $t0) * 1000);
    altaysec_log_event([
        'ts'      => date('c'),
        'ip'      => $_SERVER['REMOTE_ADDR'] ?? '-',
        'ua'      => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? '-'), 0, 120),
        'status'  => $payload['status'] ?? '-',
        'message' => (string)($payload['message'] ?? ''),
        'bytes'   => $GLOBALS['__rawXmlLen'] ?? 0,
        'nodes'   => $payload['processed']['nodes'] ?? 0,
        'ms'      => $ms,
    ]);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    altaysec_respond([
        'status'  => 'error',
        'message' => 'Sistem hatasi: Sadece POST istekleri kabul edilmektedir.'
    ], 405);
}

$rawXml = '';

if (!empty($_POST['xml_data'])) {
    $rawXml = (string) $_POST['xml_data'];
} elseif (!empty($_FILES['xml_file']['tmp_name']) && is_uploaded_file($_FILES['xml_file']['tmp_name'])) {
    $rawXml = file_get_contents($_FILES['xml_file']['tmp_name']);
} else {
    $rawXml = file_get_contents('php://input');
}

$GLOBALS['__rawXmlLen'] = strlen((string)$rawXml);

if (trim($rawXml) === '') {
    altaysec_respond([
        'status'  => 'error',
        'message' => 'Sistem hatasi: Bos XML payload reddedildi.'
    ], 400);
}

if (PHP_VERSION_ID < 80000 && function_exists('libxml_disable_entity_loader')) {
    @libxml_disable_entity_loader(false);
}

libxml_use_internal_errors(true);
libxml_clear_errors();

$parserOptions = LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_DTDATTR;

$doc = new DOMDocument('1.0', 'UTF-8');
$doc->resolveExternals = true;
$doc->substituteEntities = true;
$doc->validateOnParse   = false;

$ok = @$doc->loadXML($rawXml, $parserOptions);

if ($ok === false) {
    $errors = libxml_get_errors();
    libxml_clear_errors();

    $msg = 'Bilinmeyen XML hatasi';
    if (!empty($errors)) {
        $err = $errors[0];
        $msg = trim($err->message) . ' (satir: ' . $err->line . ')';
    }

    altaysec_respond([
        'status'  => 'error',
        'message' => 'Sistem hatasi: ' . $msg
    ]);
}

$libxmlErrors = libxml_get_errors();
libxml_clear_errors();

if (!empty($libxmlErrors)) {
    $err = $libxmlErrors[0];
    $msg = trim($err->message) . ' (satir: ' . $err->line . ')';
    altaysec_respond([
        'status'  => 'error',
        'message' => 'Sistem hatasi: ' . $msg
    ]);
}

$root = $doc->documentElement;
$nodeCount = 0;
if ($root !== null) {
    $xpath = new DOMXPath($doc);
    $nodeCount = $xpath->query('//*')->length;
}

altaysec_respond([
    'status'    => 'ok',
    'message'   => 'Veri islendi.',
    'processed' => [
        'nodes'    => $nodeCount,
        'received' => strlen($rawXml)
    ]
]);
