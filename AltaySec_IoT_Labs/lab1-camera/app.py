#!/usr/bin/env python3
"""
LAB 1: Ucuz Gözetleyici - Apartman IP Kamerası
Zafiyetler: Default Credentials, SSRF, Unauthenticated RTSP Simulation
"""

from flask import Flask, request, jsonify, render_template, redirect, make_response
import os, threading, socket, time, logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [CAMERA-SYS] %(message)s')
logger = logging.getLogger(__name__)

# Hardcoded default credentials (zafiyet #1)
USERS = {"admin": "123456", "guest": "guest"}
FLAG1 = "FLAG{d3fault_cr3ds_ar3_3v3rywh3r3}"
FLAG2 = "FLAG{ssrf_0p3ns_1nn3r_w0rld}"
FLAG3 = "FLAG{rtsp_str3am_unauth_acc3ss}"

# Simüle edilmiş iç ağ dosyaları
INTERNAL_FILES = {
    "../flag.txt": FLAG2,
    "flag.txt": FLAG2,
    "/etc/passwd": "root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n",
    "/etc/camera.conf": f"[system]\nrtsp_pass=camera123\nmqtt_broker=192.168.1.1\nflag={FLAG3}\n",
    "config.txt": "camera_id=CAM-001\nrtsp_port=8554\ndefault_pass=123456\n",
}

sessions = {}

def check_auth():
    token = request.cookies.get("session")
    return token in sessions

@app.route("/")
def index():
    logger.info(f"GET / - IP: {request.remote_addr}")
    with open("/app/index.html") as f:
        return f.read()

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    logger.warning(f"LOGIN ATTEMPT - user={username} pass={password} ip={request.remote_addr}")
    
    if username in USERS and USERS[username] == password:
        token = f"sess_{username}_{int(time.time())}"
        sessions[token] = username
        logger.info(f"LOGIN SUCCESS - user={username}")
        resp = make_response(redirect("/dashboard"))
        resp.set_cookie("session", token)
        return resp
    
    logger.warning(f"LOGIN FAILED - user={username} ip={request.remote_addr}")
    return redirect("/?error=1")

@app.route("/dashboard")
def dashboard():
    if not check_auth():
        return redirect("/")
    username = sessions.get(request.cookies.get("session"), "unknown")
    logger.info(f"DASHBOARD ACCESS - user={username}")
    with open("/app/dashboard.html") as f:
        content = f.read()
    content = content.replace("{{FLAG1}}", FLAG1).replace("{{USERNAME}}", username)
    return content

@app.route("/logout")
def logout():
    token = request.cookies.get("session")
    if token in sessions:
        del sessions[token]
    return redirect("/")

# ZAFİYET #2: SSRF - path traversal
@app.route("/proxy")
def proxy():
    path = request.args.get("path", "")
    logger.warning(f"PROXY REQUEST - path={path} ip={request.remote_addr}")
    
    if not check_auth():
        # Bazı kameralarda auth yoktur bile!
        logger.warning(f"UNAUTHENTICATED PROXY ACCESS - path={path}")
    
    # Normalize path
    clean_path = path.replace("//", "/")
    
    for key in INTERNAL_FILES:
        if key in clean_path or clean_path == key:
            logger.warning(f"SENSITIVE FILE ACCESSED via SSRF - path={path}")
            return jsonify({"status": "ok", "content": INTERNAL_FILES[key], "path": path})
    
    return jsonify({"status": "error", "content": "File not found", "path": path})

# ZAFİYET #3: RTSP info leak
@app.route("/rtsp/info")
def rtsp_info():
    logger.warning(f"RTSP INFO ACCESSED - ip={request.remote_addr} auth={check_auth()}")
    return jsonify({
        "rtsp_url": "rtsp://0.0.0.0:8554/stream",
        "auth_required": False,  # Kasıtlı zafiyet
        "codec": "H.264",
        "resolution": "1920x1080",
        "flag": FLAG3,
        "note": "Auth bypass - stream is publicly accessible"
    })

@app.route("/api/status")
def status():
    logger.info(f"STATUS CHECK - ip={request.remote_addr}")
    return jsonify({
        "device": "CheapCam Pro 2000",
        "firmware": "v1.0.2-2019",
        "uptime": "312 days",
        "rtsp_port": 8554,
        "web_port": 8081,
        "auth_enabled": True,
        "rtsp_auth_enabled": False  # Zafiyet ipucu
    })

@app.route("/api/snapshot")
def snapshot():
    if not check_auth():
        return jsonify({"error": "unauthorized"}), 401
    return jsonify({
        "timestamp": time.time(),
        "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiMwZjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPltDQU1FUkEgRkVFRF08L3RleHQ+PC9zdmc+",
        "status": "live"
    })

# RTSP Simülasyon Server
def rtsp_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(("0.0.0.0", 8554))
        server.listen(5)
        logger.info("RTSP server listening on :8554 (NO AUTH)")
        while True:
            try:
                client, addr = server.accept()
                logger.warning(f"RTSP CONNECTION from {addr} - NO AUTH REQUIRED")
                response = (
                    "RTSP/1.0 200 OK\r\n"
                    "CSeq: 1\r\n"
                    "Server: CheapCam-RTSP/1.0\r\n"
                    f"X-Flag: {FLAG3}\r\n"
                    "Content-Type: application/sdp\r\n\r\n"
                    "v=0\r\no=- 0 0 IN IP4 0.0.0.0\r\n"
                    "s=CheapCam Live Stream\r\n"
                    "m=video 0 RTP/AVP 96\r\n"
                    "a=rtpmap:96 H264/90000\r\n"
                )
                client.send(response.encode())
                client.close()
            except:
                pass
    except Exception as e:
        logger.error(f"RTSP server error: {e}")

if __name__ == "__main__":
    t = threading.Thread(target=rtsp_server, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=8081, debug=False)
