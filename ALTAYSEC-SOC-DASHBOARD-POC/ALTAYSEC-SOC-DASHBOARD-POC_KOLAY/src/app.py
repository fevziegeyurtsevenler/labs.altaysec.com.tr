import base64
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

XOR_KEY = "V3nG4mxV1p3r_SOC_2026!"
ENCRYPTED_FLAG = "F386Bm0+PRVKIwMxAB9/JAB2A0YFQiICXilrIEwlRUNBDw=="

def get_decrypted_flag():
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
            "id": 1,
            "timestamp": "2026-05-28 00:10:15",
            "agent": "Altay-Proxy-Gateway",
            "event": "Firewall Inbound Traffic Allowed",
            "level": 3,
            "ip": "185.234.12.88",
            "full_log": "Inbound connection allowed from external untrusted zone. Protocol: TCP, Destination Port: 443, Action: ALLOW."
        },
        {
            "id": 2,
            "timestamp": "2026-05-28 00:11:42",
            "agent": "Altay-Web-Prod",
            "event": "HTTP GET Request Received",
            "level": 3,
            "ip": "185.234.12.88",
            "http_status": "200",
            "full_log": "Web server received standard HTTP GET request on URL: /index.php. User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)."
        },
        {
            "id": 3,
            "timestamp": "2026-05-28 00:12:05",
            "agent": "Altay-DB-Cluster",
            "event": "Database Session Initialized",
            "level": 5,
            "ip": "10.0.2.15"
        },
        {
            "id": 4,
            "timestamp": "2026-05-28 00:13:19",
            "agent": "Altay-Web-Prod",
            "event": "Automated Scanning Activity Detected",
            "level": 7,
            "ip": "185.234.12.88",
            "http_status": "404",
            "full_log": "Multiple HTTP 404 errors encountered during automated directory scanning. Attacker is searching for backup files or hidden endpoints."
        },
        {
            "id": 5,
            "timestamp": "2026-05-28 00:14:22",
            "agent": "Altay-Web-Prod",
            "event": "Web Application IDS Alert",
            "level": 12,
            "ip": "185.234.12.88",
            "rule_id": "100201",
            "full_log": "Critical Threat - Rule 100201 Triggered: Successful BOLA bypass on endpoint /api/v1/users/profile/1. Sensitive administrator object leaked to unauthorized session."
        },
        {
            "id": 6,
            "timestamp": "2026-05-28 00:15:00",
            "agent": "Altay-Proxy-Gateway",
            "event": "Suspicious Outbound Connection",
            "level": 9,
            "ip": "185.234.12.88",
            "full_log": "Outbound network connection initiated to a known threat-intel malicious C2 (Command and Control) server IP address."
        }
    ]
    return jsonify(forensic_logs)

@app.route('/api/v1/challenge/verify', methods=['POST'])
def verify_incident_report():
    data = request.get_json()
    ip = data.get('attacker_ip', '').strip()
    error_code = data.get('error_code', '').strip()
    rule_id = data.get('rule_id', '').strip()
    
    if ip == "185.234.12.88" and error_code == "404" and rule_id == "100201":
        return jsonify({
            "status": "success",
            "message": "OLAY RAPORU ONAYLANDI! Tehdit başarıyla analiz edildi ve izole edildi.",
            "flag": get_decrypted_flag()
        })
    
    return jsonify({
        "status": "error",
        "message": "ANALİZ HATALI! Girdiğiniz parametreler log kayıtları ile uyuşmuyor."
    }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)