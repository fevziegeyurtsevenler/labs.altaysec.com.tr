import base64
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

XOR_KEY = "V3nG4mxV1p3r_HARD_2026_x!!"
ENCRYPTED_FLAG = "F386Bm0+PRVKMWMmABpxYjAUA0RtfioWVUAJfxgrBzI1YkIEAAAi"

def get_decrypted_flag():
    """Şifrelenmiş flag'i sorular doğru bilindiğinde RAM üzerinde çözer"""
    try:
        enc_bytes = base64.b64decode(ENCRYPTED_FLAG.encode('utf-8'))
        key_bytes = XOR_KEY.encode('utf-8')
        dec_bytes = bytes(b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(enc_bytes))
        return dec_bytes.decode('utf-8')
    except Exception:
        return "ALTAYSEC{log_cozme_hatasi}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/v1/logs', methods=['GET'])
def get_logs():
    forensic_logs = [
        {"id": 1, "timestamp": "2026-05-28 10:00:15", "agent": "Altay-Web-Prod", "event": "Standard Web Traffic Allowed", "level": 3, "ip": "203.0.113.45"},
        {"id": 2, "timestamp": "2026-05-28 10:01:22", "agent": "Altay-DB-Cluster", "event": "Automated Database Backup Started", "level": 4, "ip": "10.0.5.10"},
        {"id": 3, "timestamp": "2026-05-28 10:03:00", "agent": "Altay-Web-Prod", "event": "WAF Block: Command Injection Attempt", "level": 8, "ip": "185.234.12.88", "rule_id": "100305"},
        {"id": 4, "timestamp": "2026-05-28 10:05:45", "agent": "Altay-Web-Prod", "event": "WAF Bypass Detected", "level": 11, "ip": "185.234.12.88", "payload_encoded": "Y2F0IC9ldGMvc2hhZG93IHwgbmMgMTkyLjE2OC40NS4yMiA5MDAx"},
        {"id": 5, "timestamp": "2026-05-28 10:05:50", "agent": "Altay-Proxy-Gateway", "event": "Unauthorized Outbound Connection", "level": 12, "ip": "10.0.2.15", "dest_port": "9001", "dest_ip": "192.168.45.22"},
        {"id": 6, "timestamp": "2026-05-28 10:06:15", "agent": "Altay-Auth-Node", "event": "Successful Administrator Login", "level": 3, "ip": "10.0.0.50", "full_log": "User 'sysadmin' logged in successfully via SSH."},
        
        {
            "id": 7, "timestamp": "2026-05-28 10:12:33", "agent": "Altay-Web-Prod",
            "event": "Privilege Escalation Warning", "level": 12, "ip": "127.0.0.1",
            "full_log": "Process 'sudo' executed by www-data. Unexpected privilege escalation pattern detected via PwnKit vulnerability (CVE-2021-4034)."
        },
        {
            "id": 8, "timestamp": "2026-05-28 10:13:05", "agent": "Altay-Web-Prod",
            "event": "Anomalous File Download", "level": 9, "ip": "127.0.0.1",
            "full_log": "Process 'wget' initiated by root user. Target IP: 45.33.12.9 (Known Malicious Subnet). Downloading 'update.tar.gz'."
        },
        {
            "id": 9, "timestamp": "2026-05-28 10:13:45", "agent": "Altay-Web-Prod",
            "event": "FIM Alert: File Modified", "level": 7, "ip": "127.0.0.1",
            "file_accessed": "/var/log/nginx/access.log",
            "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", # Boş dosya hash'i (Yanıltıcı)
            "full_log": "Syscheck detected modification in log file. This is likely normal application behavior (log rotation)."
        },
        {
            "id": 10, "timestamp": "2026-05-28 10:14:00", "agent": "Altay-Web-Prod",
            "event": "Service Stopped", "level": 5, "ip": "127.0.0.1",
            "full_log": "SSH Daemon (sshd) was gracefully stopped."
        },
        {
            "id": 11, "timestamp": "2026-05-28 10:14:05", "agent": "Altay-Web-Prod",
            "event": "FIM CRITICAL: System Binary Replaced", "level": 14, "ip": "127.0.0.1",
            "file_accessed": "/usr/sbin/sshd",
            "full_log": "Syscheck detected modification in critical system binary. Original SSH daemon replaced with an untrusted executable."
        },
        {
            "id": 12, "timestamp": "2026-05-28 10:14:08", "agent": "Altay-Web-Prod",
            "event": "Malware Indicator: APT Rootkit Hash", "level": 15, "ip": "127.0.0.1",
            "sha256": "a3b4c5d6e7f8901234567890abcdef1234567890abcdef1234567890abcdef12",
            "full_log": "Integrity check failed. The newly dropped /usr/sbin/sshd matches a known advanced persistent threat (APT) rootkit signature associated with 'HiddenWasp'."
        },
        {
            "id": 13, "timestamp": "2026-05-28 10:14:15", "agent": "Altay-Web-Prod",
            "event": "Service Started", "level": 5, "ip": "127.0.0.1",
            "full_log": "SSH Daemon (sshd) started with modified binary."
        },
        {
            "id": 14, "timestamp": "2026-05-28 10:14:30", "agent": "Altay-Web-Prod",
            "event": "Hidden Process Detected", "level": 13, "ip": "127.0.0.1",
            "full_log": "Kernel module unlinked a process from task_struct. Process ID 4452 (sshd) is attempting to hide itself from 'ps' and 'top'."
        },
        {
            "id": 15, "timestamp": "2026-05-28 10:15:22", "agent": "Altay-Web-Prod",
            "event": "Suspicious Bind Shell Opened", "level": 14, "ip": "127.0.0.1",
            "bind_port": "1337",
            "full_log": "System network stack monitoring detects a hidden listening port established by the modified SSH daemon. Awaiting remote attacker connection."
        },
        # DAHA FAZLA GÜRÜLTÜ
        {"id": 16, "timestamp": "2026-05-28 10:16:00", "agent": "Altay-DB-Cluster", "event": "PostgreSQL Service Restarted", "level": 3, "ip": "10.0.5.10"},
        {"id": 17, "timestamp": "2026-05-28 10:16:45", "agent": "Altay-Proxy-Gateway", "event": "Firewall Rule Updated", "level": 5, "ip": "10.0.0.1"},
        {"id": 18, "timestamp": "2026-05-28 10:18:00", "agent": "Altay-Web-Prod", "event": "Cron Job Executed", "level": 3, "ip": "127.0.0.1", "full_log": "Logrotate script executed successfully."},
        {"id": 19, "timestamp": "2026-05-28 10:19:15", "agent": "Altay-Auth-Node", "event": "SSH Session Closed", "level": 3, "ip": "10.0.0.50"},
        {"id": 20, "timestamp": "2026-05-28 10:20:00", "agent": "Altay-Web-Prod", "event": "Standard Web Traffic Allowed", "level": 3, "ip": "198.51.100.22"}
    ]
    return jsonify(forensic_logs)

@app.route('/api/v1/challenge/verify', methods=['POST'])
def verify_incident_report():
    data = request.get_json()
    
    filepath = data.get('q1_filepath', '').strip()
    filehash = data.get('q2_hash', '').strip().lower()
    bindport = data.get('q3_port', '').strip()
    
    if filepath == "/usr/sbin/sshd" and filehash == "a3b4c5d6e7f8901234567890abcdef1234567890abcdef1234567890abcdef12" and bindport == "1337":
        return jsonify({
            "status": "success",
            "message": "SİSTEM BÜTÜNLÜĞÜ SAĞLANDI! Rootkit tespit edildi ve arka kapı (Bind Shell) kapatıldı. Usta seviyesinde analiz!",
            "flag": get_decrypted_flag()
        })
    
    return jsonify({
        "status": "error",
        "message": "ANALİZ HATALI! Dosya yolu, SHA256 değeri veya arka kapı portu eşleşmiyor. Gürültü (Noise) loglarına dikkat edin."
    }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)