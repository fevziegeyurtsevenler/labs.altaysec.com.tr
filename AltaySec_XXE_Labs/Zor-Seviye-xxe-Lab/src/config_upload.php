<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Powered-By: AltaySec-Engine/2.4');
header('Cache-Control: no-store');

error_reporting(0);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '0');

libxml_use_internal_errors(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'İşlem reddedildi', 'code' => 405]);
    exit;
}

$raw_input = file_get_contents('php://input');

if (empty($raw_input) || strlen($raw_input) < 10) {
    http_response_code(400);
    echo json_encode(['status' => 'İşlem reddedildi', 'code' => 400]);
    exit;
}

if (preg_match('/SYSTEM|PUBLIC/i', $raw_input)) {
    http_response_code(403);
    echo json_encode(['status' => 'İşlem reddedildi']);
    exit;
}

$looks_like_xml = (
    substr($raw_input, 0, 5) === '<?xml'
    || substr($raw_input, 0, 2) === "\xFF\xFE"
    || substr($raw_input, 0, 2) === "\xFE\xFF"
    || substr($raw_input, 0, 1) === '<'
);

if (!$looks_like_xml) {
    http_response_code(400);
    echo json_encode(['status' => 'İşlem reddedildi']);
    exit;
}

@libxml_disable_entity_loader(false);

$dom = new DOMDocument();
$dom->resolveExternals  = true;
$dom->substituteEntities = true;

@$dom->loadXML($raw_input, LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_DTDATTR);

libxml_clear_errors();
@libxml_use_internal_errors(false);

http_response_code(200);
echo json_encode(['status' => 'İşlem başarılı']);
exit;
