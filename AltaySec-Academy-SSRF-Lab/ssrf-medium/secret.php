<?php
/**
 * NexusFeed — Internal Sync Configuration
 * ACCESS RESTRICTED: Internal network only (127.0.0.1)
 */
$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
if ($remoteAddr !== '127.0.0.1' && $remoteAddr !== '::1') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "403 Yasak\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Bu uç noktaya yalnızca dahili ağdan\n";
    echo "(127.0.0.1) erişilebilir.\n\n";
    echo "İpucu: Engel listesi yalnızca metin eşleşmesi yapar.\n";
    echo "Geri döngü adresinin farklı bir gösterimini deneyin.\n";
    exit;
}
header('Content-Type: text/plain; charset=utf-8');
echo "╔══════════════════════════════════════════╗\n";
echo "║      NEXUSFEED INTERNAL SYNC CONFIG      ║\n";
echo "╚══════════════════════════════════════════╝\n\n";
echo "Host:        internal.nexusfeed.local\n";
echo "Environment: production\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
echo "AltaySec{ssrf_lab_orta_tamamlandi}\n\n";
echo "sync_token:  nf_sync_prod_aB3cD4eF5g\n";
echo "db_host:     db-read-01.internal\n";
echo 'db_pass:     Feed$Sync!2024' . "\n";
echo "redis_url:   redis://cache-01.internal:6379\n";
