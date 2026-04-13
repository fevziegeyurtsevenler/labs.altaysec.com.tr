#!/usr/bin/env python3
"""
LAB 5: Sahte Güven - Evil Twin WiFi Simülasyonu
Zafiyetler: Captive Portal Phishing, Login Bypass, ARP Poisoning Session Hijack
"""

from flask import Flask, request, jsonify, make_response, redirect
import time, logging, hashlib, json, os

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [EVILTWIN-SYS] %(message)s')
logger = logging.getLogger(__name__)

FLAG1 = "FLAG{hum4n_3rr0r_b3st_vuln}"
FLAG2 = "FLAG{capt1v3_p0rtal_byp4ss}"
FLAG3 = "FLAG{arp_s3ss10n_h1jack}"

# Yakalanan kimlik bilgileri
CAPTURED_CREDS = []
ADMIN_SESSIONS = {
    "sess_admin_real": {"user": "admin", "role": "admin", "flag": FLAG3, "created": time.time() - 3600},
    "sess_router_1234": {"user": "router_admin", "role": "superadmin", "flag": FLAG3, "created": time.time() - 7200},
}

# Simüle ARP zehirleme logları
ARP_LOG = [
    {"time": "09:12:03", "type": "ARP_REPLY", "src": "192.168.1.1 (Router)", "dst": "broadcast", "note": "Gerçek router ARP yanıtı"},
    {"time": "09:12:04", "type": "ARP_SPOOF", "src": "192.168.1.100 (ATTACKER)", "dst": "192.168.1.50", "note": "⚠ Sahte ARP! Saldırgan router gibi davranıyor"},
    {"time": "09:12:05", "type": "ARP_SPOOF", "src": "192.168.1.100 (ATTACKER)", "dst": "192.168.1.51", "note": "⚠ Tüm ağa sahte ARP yayılıyor"},
    {"time": "09:12:06", "type": "HTTP_INTERCEPT", "src": "192.168.1.50", "dst": "192.168.1.100", "data": "GET /admin HTTP/1.1\nCookie: session=sess_router_1234", "note": "🔑 Session cookie yakalandı!"},
    {"time": "09:12:07", "type": "HTTP_INTERCEPT", "src": "192.168.1.51", "dst": "192.168.1.100", "data": "POST /login\nusername=admin&password=router123", "note": "🔑 Şifre açık yakalandı!"},
    {"time": "09:12:08", "type": "SESSION_STOLEN", "src": "ATTACKER", "data": "sess_router_1234", "note": f"✓ Session çalındı → FLAG: {FLAG3}"},
]

@app.route("/")
def index():
    with open("/app/index.html") as f:
        return f.read()

# ZAFİYET #1: Phishing Captive Portal - kurban kendi şifresini giriyor
@app.route("/portal/login", methods=["POST"])
def portal_login():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    logger.warning(f"PHISHING CREDENTIAL CAPTURED - user={username} pass={password} ip={request.remote_addr}")

    CAPTURED_CREDS.append({
        "timestamp": time.strftime("%H:%M:%S"),
        "username": username,
        "password": password,
        "ip": request.remote_addr,
        "user_agent": request.headers.get("User-Agent", "")[:50]
    })

    # Herkesi "başarılı" göster - sonra gerçek ağa yönlendir
    resp = make_response(redirect("/portal/success"))
    resp.set_cookie("portal_session", f"user_{username}_{int(time.time())}")
    return resp

@app.route("/portal/success")
def portal_success():
    with open("/app/success.html") as f:
        content = f.read()
    creds_html = ""
    for c in CAPTURED_CREDS[-5:]:
        creds_html += f'<div class="cred-row">⚡ {c["timestamp"]} — <b>{c["username"]}</b> / {c["password"]}</div>'
    content = content.replace("{{CAPTURED_CREDS}}", creds_html or "Henüz kimlik bilgisi yok")
    content = content.replace("{{FLAG1}}", FLAG1)
    return content

@app.route("/api/captured")
def get_captured():
    return jsonify({"captured": CAPTURED_CREDS, "flag": FLAG1 if CAPTURED_CREDS else None})

# ZAFİYET #2: Login bypass
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        with open("/app/admin.html") as f:
            return f.read()

    username = request.form.get("username", "")
    password = request.form.get("password", "")
    bypass = request.args.get("bypass", "")
    logger.warning(f"ADMIN LOGIN - user={username} bypass={bypass} ip={request.remote_addr}")

    # Bypass #1: URL parametresi
    if bypass == "true" or bypass == "1":
        logger.warning(f"LOGIN BYPASS via URL parameter - ip={request.remote_addr}")
        resp = make_response(redirect("/admin/panel?flag=" + FLAG2))
        resp.set_cookie("admin_session", "bypassed_session")
        return resp

    # Bypass #2: Boş şifre
    if username == "admin" and password == "":
        logger.warning(f"LOGIN BYPASS via empty password - ip={request.remote_addr}")
        resp = make_response(redirect("/admin/panel?flag=" + FLAG2))
        resp.set_cookie("admin_session", "empty_pass_session")
        return resp

    # Normal auth fail
    return redirect("/admin/login?error=1")

@app.route("/admin/panel")
def admin_panel():
    flag = request.args.get("flag", "")
    session = request.cookies.get("admin_session", "")

    # ZAFİYET #3: ARP poisoning session hijack
    stolen_session = request.args.get("session", "")
    hijacked = False
    hijack_data = None

    if stolen_session in ADMIN_SESSIONS:
        hijacked = True
        hijack_data = ADMIN_SESSIONS[stolen_session]
        logger.warning(f"SESSION HIJACK via stolen cookie - session={stolen_session} flag={FLAG3}")

    with open("/app/panel.html") as f:
        content = f.read()

    content = content.replace("{{FLAG2}}", flag or FLAG2 if session else "???")
    content = content.replace("{{FLAG3}}", hijack_data["flag"] if hijacked else "???")
    content = content.replace("{{ARP_LOG}}", json.dumps(ARP_LOG))
    content = content.replace("{{HIJACKED}}", "true" if hijacked else "false")
    content = content.replace("{{SESSION}}", stolen_session or session)
    return content

@app.route("/api/arp-log")
def arp_log():
    return jsonify({"logs": ARP_LOG, "stolen_session": "sess_router_1234", "hint": "Bu session'ı /admin/panel?session= ile kullan"})

@app.route("/api/networks")
def networks():
    return jsonify({
        "networks": [
            {"ssid": "HomeNetwork", "signal": -45, "security": "WPA2", "real": True},
            {"ssid": "HomeNetwork", "signal": -40, "security": "OPEN", "real": False, "note": "⚠ Evil Twin - daha güçlü sinyal!"},
            {"ssid": "Neighbor_5G", "signal": -70, "security": "WPA2", "real": True},
            {"ssid": "FREE_WIFI", "signal": -35, "security": "OPEN", "real": False, "note": "⚠ Başka bir tuzak"},
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8085, debug=False)
