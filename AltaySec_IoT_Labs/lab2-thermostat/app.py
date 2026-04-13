#!/usr/bin/env python3
"""
LAB 2: Rahatlığın Bedeli - Akıllı Termostat
Zafiyetler: Simüle Telnet Backdoor, Command Injection, Hardcoded Credentials
"""

from flask import Flask, request, jsonify, make_response, redirect
import os, subprocess, threading, socket, time, logging, json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [THERMO-SYS] %(message)s')
logger = logging.getLogger(__name__)

FLAG1 = "FLAG{t3ln3t_backd00r_supp0rt_acc3ss}"
FLAG2 = "FLAG{cmdi_h3at_th3_syst3m}"
FLAG3 = "FLAG{hardc0d3d_mqtt_cr3ds_1n_js}"

TEMPERATURE = {"current": 19.5, "target": 22.0, "mode": "heat", "away": False}

# Simüle Telnet server
def telnet_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(("0.0.0.0", 2323))
        server.listen(5)
        logger.info("Telnet server on :2323 (support backdoor active)")
        while True:
            try:
                client, addr = server.accept()
                logger.warning(f"TELNET CONNECTION from {addr}")
                threading.Thread(target=handle_telnet, args=(client, addr), daemon=True).start()
            except:
                pass
    except Exception as e:
        logger.error(f"Telnet server error: {e}")

def handle_telnet(client, addr):
    try:
        banner = (
            "\r\n"
            "╔═══════════════════════════════════════╗\r\n"
            "║   ThermoSmart Pro - Support Console   ║\r\n"
            "║   Firmware: v2.3.1 | Model: TS-500    ║\r\n"
            "╚═══════════════════════════════════════╝\r\n"
            "\r\nLogin: "
        )
        client.send(banner.encode())
        data = client.recv(256).decode(errors='ignore').strip()
        logger.warning(f"TELNET LOGIN ATTEMPT - input={data} ip={addr}")

        client.send(b"Password: ")
        pwd = client.recv(256).decode(errors='ignore').strip()
        logger.warning(f"TELNET PASSWORD - pwd={pwd} ip={addr}")

        # Backdoor credentials
        if ("support" in data or data == "") and (pwd == "support" or pwd == ""):
            logger.warning(f"TELNET BACKDOOR LOGIN SUCCESS from {addr}")
            response = (
                "\r\n[AUTH OK] Welcome, support user\r\n"
                f"[FLAG] {FLAG1}\r\n"
                "\r\nAvailable commands:\r\n"
                "  status    - Show device status\r\n"
                "  reboot    - Reboot device\r\n"
                "  exit      - Close session\r\n"
                "\r\n$ "
            )
            client.send(response.encode())
            while True:
                cmd = client.recv(256).decode(errors='ignore').strip()
                if cmd in ("exit", "quit", ""):
                    break
                elif cmd == "status":
                    client.send(f"Temp: {TEMPERATURE['current']}C | Target: {TEMPERATURE['target']}C\r\n$ ".encode())
                elif cmd == "reboot":
                    client.send(b"Rebooting... [simulated]\r\n")
                    break
                else:
                    client.send(f"Unknown command: {cmd}\r\n$ ".encode())
        else:
            client.send(b"\r\n[AUTH FAILED] Invalid credentials\r\n")
    except:
        pass
    finally:
        client.close()

@app.route("/")
def index():
    logger.info(f"GET / - ip={request.remote_addr}")
    with open("/app/index.html") as f:
        content = f.read()
    content = content.replace("{{FLAG3_HINT}}", FLAG3)
    return content

@app.route("/api/temperature", methods=["GET"])
def get_temp():
    logger.info(f"GET /api/temperature - ip={request.remote_addr}")
    return jsonify(TEMPERATURE)

@app.route("/api/temperature", methods=["POST"])
def set_temp():
    data = request.get_json(silent=True) or {}
    target = data.get("target", TEMPERATURE["target"])
    TEMPERATURE["target"] = float(target)
    logger.info(f"SET TEMPERATURE - target={target} ip={request.remote_addr}")
    return jsonify({"status": "ok", "target": TEMPERATURE["target"]})

# ZAFİYET #2: Command Injection
@app.route("/api/diagnostic", methods=["POST"])
def diagnostic():
    data = request.get_json(silent=True) or {}
    host = data.get("host", "localhost")
    logger.warning(f"DIAGNOSTIC REQUEST - host={host} ip={request.remote_addr}")

    # Güvensiz: kullanıcı girdisi direkt shell'e gidiyor
    try:
        # Sandbox ortamı - sadece echo simüle eder
        dangerous_chars = [";", "|", "&", "`", "$", "(", ")", "<", ">"]
        injected = any(c in str(host) for c in dangerous_chars)

        if injected:
            logger.warning(f"COMMAND INJECTION DETECTED - payload={host}")
            # Lab amaçlı: injection varsa flag döndür
            return jsonify({
                "status": "injection_detected",
                "flag": FLAG2,
                "message": f"Command injection payload detected in host parameter: {host}",
                "simulated_output": f"ping: bad address '{host}'\n{FLAG2}",
                "note": "Gerçekte bu komut sistem kabuğunda çalışırdı!"
            })
        else:
            return jsonify({
                "status": "ok",
                "host": host,
                "result": f"PING {host}: 64 bytes, time=1ms\nRound-trip: min/avg/max = 1/2/3 ms"
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route("/api/firmware", methods=["GET"])
def firmware_info():
    logger.info(f"FIRMWARE INFO REQUEST - ip={request.remote_addr}")
    return jsonify({
        "version": "v2.3.1",
        "build": "2021-03-15",
        "model": "ThermoSmart-500",
        "mqtt_broker": "mqtt.home.local",
        "mqtt_port": 1883,
        "mqtt_user": "thermo",
        "mqtt_pass": "thermo123",
        "update_url": "http://update.thermoserver.com/firmware"
    })

@app.route("/api/status")
def status():
    return jsonify({
        "device": "ThermoSmart Pro 500",
        "firmware": "v2.3.1",
        "telnet_port": 2323,
        "telnet_enabled": True,
        "support_account": "enabled"
    })

if __name__ == "__main__":
    t = threading.Thread(target=telnet_server, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=8082, debug=False)
