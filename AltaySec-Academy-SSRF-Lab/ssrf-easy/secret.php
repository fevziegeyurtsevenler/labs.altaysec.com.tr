<?php
/**
 * NexusMonitor — Internal Configuration Endpoint
 *
 * ACCESS RESTRICTED: Internal network only (127.0.0.1)
 * Direct external access returns 403 Forbidden.
 *
 * Objective: Reach this endpoint via SSRF to capture the flag.
 * Exploit:   /fetch.php?url=http://127.0.0.1/secret.php
 */

$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
$forwarded  = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';

// Only allow loopback
if ($remoteAddr !== '127.0.0.1' && $remoteAddr !== '::1') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "403 Yasak\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Bu uç noktaya yalnızca dahili ağdan\n";
    echo "(127.0.0.1) erişilebilir.\n\n";
    echo "Doğrudan dış erişime izin verilmemektedir.\n";
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
echo "╔══════════════════════════════════════════╗\n";
echo "║     NEXUSMONITOR INTERNAL CONFIG API     ║\n";
echo "╚══════════════════════════════════════════╝\n\n";
echo "Host:        internal.nexusmonitor.local\n";
echo "Environment: production\n";
echo "Access:      internal-only\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
echo "AltaySec{ssrf_lab_kolay_tamamlandi}\n\n";
echo "api_key:     nm_sk_prod_xK9mN2pQ8rT4vW6yZ1a\n";
echo "db_host:     db-prod-01.internal\n";
echo 'db_pass:     Nx$P@ss!2024' . "\n";
echo "jwt_secret:  nexus_jwt_sk_do_not_expose\n";
