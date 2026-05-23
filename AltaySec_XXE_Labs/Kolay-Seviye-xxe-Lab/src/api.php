<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Powered-By: AltaySec-ThreatIntel/1.0');
header('Cache-Control: no-store');

function jsonResponse(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse([
        'status'  => 'error',
        'message' => 'Sadece POST kabul edilir. (XML gövde bekleniyor)',
    ], 405);
}

$rawBody = file_get_contents('php://input');

if ($rawBody === false || trim($rawBody) === '') {
    jsonResponse([
        'status'  => 'error',
        'message' => 'Boş istek gövdesi. XML verisi göndermelisiniz.',
    ], 400);
}

libxml_use_internal_errors(true);

if (function_exists('libxml_disable_entity_loader')) {
    @libxml_disable_entity_loader(false);
}
if (PHP_VERSION_ID < 80000 && function_exists('libxml_set_external_entity_loader')) {
    libxml_set_external_entity_loader(null);
}

$dom = new DOMDocument();
$loaded = @$dom->loadXML(
    $rawBody,
    LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_NOCDATA
);

if ($loaded === false) {
    $errors = array_map(static function ($e) {
        return trim($e->message);
    }, libxml_get_errors());
    libxml_clear_errors();

    jsonResponse([
        'status'  => 'error',
        'message' => 'XML ayrıştırma hatası.',
        'detail'  => $errors,
    ], 400);
}

$root = $dom->documentElement;
if ($root === null) {
    jsonResponse([
        'status'  => 'error',
        'message' => 'Geçersiz XML kök elementi.',
    ], 400);
}

$typeNode  = $root->getElementsByTagName('type')->item(0);
$valueNode = $root->getElementsByTagName('value')->item(0);

$type  = $typeNode  ? $typeNode->textContent  : '';
$value = $valueNode ? $valueNode->textContent : '';

if ($type === '' && $value === '') {
    jsonResponse([
        'status'  => 'error',
        'message' => 'Beklenen <type> ve <value> alanları bulunamadı.',
    ], 422);
}

$ticketId = strtoupper(bin2hex(random_bytes(4)));
$timestamp = date('Y-m-d H:i:s');

$message = sprintf(
    "Bildiriminiz işleme alındı: %s",
    $value !== '' ? $value : '(boş değer)'
);

jsonResponse([
    'status'    => 'ok',
    'ticket_id' => 'TI-' . $ticketId,
    'timestamp' => $timestamp,
    'type'      => $type,
    'message'   => $message,
], 200);
