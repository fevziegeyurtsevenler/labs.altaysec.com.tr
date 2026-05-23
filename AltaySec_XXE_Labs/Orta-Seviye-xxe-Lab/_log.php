<?php

if (!defined('ALTAYSEC_LOG_FILE')) {
    define('ALTAYSEC_LOG_FILE', '/tmp/altaysec_data_sync.log');
}

if (!function_exists('altaysec_log_event')) {
    function altaysec_log_event(array $entry): void
    {
        $entry['message'] = mb_substr((string)($entry['message'] ?? ''), 0, 400);
        $line = json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($line === false) {
            return;
        }
        @file_put_contents(ALTAYSEC_LOG_FILE, $line . "\n", FILE_APPEND | LOCK_EX);
    }
}

if (!function_exists('altaysec_log_read')) {
    function altaysec_log_read(int $limit = 100): array
    {
        if (!is_file(ALTAYSEC_LOG_FILE) || !is_readable(ALTAYSEC_LOG_FILE)) {
            return [];
        }
        $lines = @file(ALTAYSEC_LOG_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!is_array($lines)) {
            return [];
        }
        $lines = array_slice($lines, -max(1, $limit));
        $rows  = [];
        foreach ($lines as $ln) {
            $r = json_decode($ln, true);
            if (is_array($r)) {
                $rows[] = $r;
            }
        }
        return array_reverse($rows);
    }
}
