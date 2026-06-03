import base64
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

XOR_KEY = "V3nG4mxV1p3r_MED_2026!"
ENCRYPTED_FLAG = "F386Bm0+PRVKJwc0AA88NGtBQ217FSVHXTVrIQ46Aw0="

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
        {
            "id": 1, "timestamp": "2026-05-28 10:00:15", "agent": "Altay-Web-Prod",
            "event": "Standard Web Traffic Allowed", "level": 3, "ip": "203.0.113.45",
            "full_log": "Standard HTTP GET request on /assets/css/style.css. Action: ALLOW."
        },
        {
            "id": 2, "timestamp": "2026-05-28 10:01:22", "agent": "Altay-DB-Cluster",
            "event": "Automated Database Backup Started", "level": 4, "ip": "10.0.5.10",
            "full_log": "Routine PostgreSQL backup job started by crontab user postgres."
        },
        {
            "id": 3, "timestamp": "2026-05-28 10:03:00", "agent": "Altay-Web-Prod",
            "event": "WAF Block: Command Injection Attempt", "level": 8, "ip": "185.234.12.88",
            "full_log": "Web Application Firewall intercepted raw command injection payload: '; cat /etc/passwd'. Request dropped."
        },
        {
            "id": 4, "timestamp": "2026-05-28 10:04:15", "agent": "Altay-Auth-Node",
            "event": "SSH Authentication Failed", "level": 5, "ip": "112.55.44.33",
            "full_log": "Failed password for root from 112.55.44.33 port 54322 ssh2."
        },
        {
            "id": 5, "timestamp": "2026-05-28 10:05:45", "agent": "Altay-Web-Prod",
            "event": "WAF Bypass Detected: Encoded Payload", "level": 11, "ip": "185.234.12.88",
            "payload_encoded": "Y2F0IC9ldGMvc2hhZG93IHwgbmMgMTkyLjE2OC40NS4yMiA5MDAx",
            "full_log": "Suspicious HTTP POST request containing heavily obfuscated base64 string in 'cmd' parameter. Bypass suspected."
        },
        {
            "id": 6, "timestamp": "2026-05-28 10:05:47", "agent": "Altay-Web-Prod",
            "event": "Anomalous Process Creation", "level": 10, "ip": "127.0.0.1",
            "full_log": "Process 'sh -c' spawned by www-data user. Parent Process ID: 1045 (nginx)."
        },
        {
            "id": 7, "timestamp": "2026-05-28 10:05:48", "agent": "Altay-Web-Prod",
            "event": "File Integrity Monitor Alert", "level": 12, "ip": "127.0.0.1",
            "file_accessed": "/etc/shadow",
            "full_log": "Critical system file read access by unauthorized non-root process (www-data). Potential credential dumping."
        },
        {
            "id": 8, "timestamp": "2026-05-28 10:05:50", "agent": "Altay-Proxy-Gateway",
            "event": "Unauthorized Outbound Connection", "level": 12, "ip": "10.0.2.15",
            "dest_port": "9001",
            "dest_ip": "192.168.45.22",
            "full_log": "Internal server initiated an outbound TCP connection to an external untrusted IP on a non-standard high port. Exfiltration likely."
        },
        {
            "id": 9, "timestamp": "2026-05-28 10:06:10", "agent": "Altay-Auth-Node",
            "event": "SSH Authentication Failed", "level": 5, "ip": "112.55.44.33",
            "full_log": "Failed password for admin from 112.55.44.33 port 58911 ssh2."
        },
        {
            "id": 10, "timestamp": "2026-05-28 10:08:20", "agent": "Altay-Web-Prod",
            "event": "Standard Web Traffic Allowed", "level": 3, "ip": "88.24.55.101",
            "full_log": "Standard HTTP GET request on /index.html. Action: ALLOW."
        },
        {
            "id": 11, "timestamp": "2026-05-28 10:09:15", "agent": "Altay-DB-Cluster",
            "event": "Automated Database Backup Completed", "level": 3, "ip": "10.0.5.10",
            "full_log": "Routine PostgreSQL backup job successfully finished."
        },
        {
            "id": 12, "timestamp": "2026-05-28 10:11:00", "agent": "Altay-Proxy-Gateway",
            "event": "Firewall Health Check Ping", "level": 2, "ip": "10.0.0.1",
            "full_log": "Internal monitoring service executed standard ICMP echo request."
        }
    ]
    return jsonify(forensic_logs)

@app.route('/api/v1/challenge/verify', methods=['POST'])
def verify_incident_report():
    data = request.get_json()
    
    payload = data.get('q1_payload', '').strip()
    filepath = data.get('q2_filepath', '').strip()
    dest_port = data.get('q3_port', '').strip()
    
    if payload == "Y2F0IC9ldGMvc2hhZG93IHwgbmMgMTkyLjE2OC40NS4yMiA5MDAx" and filepath == "/etc/shadow" and dest_port == "9001":
        return jsonify({
            "status": "success",
            "message": "SEVİYE-2 ANALİZ TAMAMLANDI! WAF atlatma tekniği ve sızıntı noktası tespit edildi.",
            "flag": get_decrypted_flag()
        })
    
    return jsonify({
        "status": "error",
        "message": "ANALİZ HATALI! Payload, hedef dosya veya sızdırma portu eşleşmiyor. Log detaylarını daha dikkatli inceleyin."
    }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)