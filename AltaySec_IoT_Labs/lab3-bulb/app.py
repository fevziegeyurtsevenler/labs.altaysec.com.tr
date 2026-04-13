#!/usr/bin/env python3
"""
LAB 3: Karanlık Aydınlanma - Akıllı Ampul MQTT İhlali
Zafiyetler: SSRF, Anonim MQTT, Firmware Buffer Overflow Sim
"""

from flask import Flask, request, jsonify
import threading, socket, time, logging, json, random

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [BULB-SYS] %(message)s')
logger = logging.getLogger(__name__)

FLAG1 = "FLAG{ssrf_t0_mqtt_1nt3rn4l}"
FLAG2 = "FLAG{anon_mqtt_r3ads_3v3ryth1ng}"
FLAG3 = "FLAG{buff3r_0v3rfl0w_f1rmw4r3}"

# MQTT simüle mesajlar - diğer ev cihazlarının verileri
MQTT_MESSAGES = [
    {"topic": "home/thermostat/temp", "payload": "22.5", "retained": True},
    {"topic": "home/thermostat/target", "payload": "24.0"},
    {"topic": "home/camera/status", "payload": "RECORDING"},
    {"topic": "home/camera/rtsp_pass", "payload": "camera123"},
    {"topic": "home/lock/state", "payload": "LOCKED"},
    {"topic": "home/lock/pin", "payload": "1234"},
    {"topic": "home/wifi/ssid", "payload": "HomeNetwork"},
    {"topic": "home/wifi/password", "payload": "family2024"},
    {"topic": "home/bulb/state", "payload": "ON", "retained": True},
    {"topic": "home/bulb/color", "payload": "#FF5733"},
    {"topic": "home/flag", "payload": FLAG2},
]

BULB_STATE = {"on": True, "color": "#FF5733", "brightness": 80}

# Simüle MQTT broker
def mqtt_broker():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(("0.0.0.0", 1883))
        server.listen(10)
        logger.info("MQTT broker on :1883 (NO AUTH - anonymous access enabled)")
        while True:
            try:
                client, addr = server.accept()
                logger.warning(f"MQTT ANONYMOUS CONNECTION from {addr}")
                threading.Thread(target=handle_mqtt, args=(client, addr), daemon=True).start()
            except:
                pass
    except Exception as e:
        logger.error(f"MQTT broker error: {e}")

def handle_mqtt(client, addr):
    try:
        # MQTT CONNECT ACK (simplified)
        data = client.recv(256)
        # Send CONNACK - success, no auth required
        connack = bytes([0x20, 0x02, 0x00, 0x00])
        client.send(connack)
        logger.warning(f"MQTT CONNACK sent to {addr} - anonymous access granted")
        time.sleep(0.1)
        # Send all retained messages
        welcome = json.dumps({
            "broker": "HomeMQTT v1.0",
            "auth": "disabled",
            "flag": FLAG2,
            "topics": [m["topic"] for m in MQTT_MESSAGES],
            "messages": MQTT_MESSAGES
        })
        # MQTT PUBLISH simulation
        topic = "home/broker/welcome"
        payload = welcome.encode()
        topic_bytes = topic.encode()
        topic_len = len(topic_bytes).to_bytes(2, 'big')
        remaining = 2 + len(topic_bytes) + len(payload)
        publish = bytes([0x30]) + bytes([remaining]) + topic_len + topic_bytes + payload
        client.send(publish[:4096])
    except:
        pass
    finally:
        client.close()

@app.route("/")
def index():
    with open("/app/index.html") as f:
        return f.read()

@app.route("/api/bulb", methods=["GET"])
def get_bulb():
    return jsonify(BULB_STATE)

@app.route("/api/bulb", methods=["POST"])
def set_bulb():
    data = request.get_json(silent=True) or {}
    if "on" in data: BULB_STATE["on"] = bool(data["on"])
    if "color" in data: BULB_STATE["color"] = data["color"]
    if "brightness" in data: BULB_STATE["brightness"] = int(data["brightness"])
    logger.info(f"BULB SET - state={BULB_STATE} ip={request.remote_addr}")
    return jsonify({"status": "ok", **BULB_STATE})

# ZAFİYET #1: SSRF
@app.route("/api/fetch")
def fetch_url():
    url = request.args.get("url", "")
    logger.warning(f"SSRF ATTEMPT - url={url} ip={request.remote_addr}")

    if not url:
        return jsonify({"error": "url parameter required"})

    # Internal URL patterns
    if "mqtt" in url or "1883" in url or "localhost" in url or "127.0.0.1" in url or "internal" in url:
        logger.warning(f"SSRF INTERNAL ACCESS - url={url}")
        return jsonify({
            "status": "connected",
            "url": url,
            "flag": FLAG1,
            "internal_data": {
                "mqtt_broker": "mqtt.home.local",
                "mqtt_port": 1883,
                "auth": "disabled",
                "topics": [m["topic"] for m in MQTT_MESSAGES],
                "note": "SSRF ile iç MQTT broker'a eriştiniz!"
            }
        })
    return jsonify({"status": "fetched", "url": url, "data": "External resource (simulated)"})

# ZAFİYET #2: MQTT mesajlarını web üzerinden oku
@app.route("/api/mqtt/messages")
def mqtt_messages():
    logger.warning(f"MQTT MESSAGES READ - ip={request.remote_addr}")
    return jsonify({
        "broker": "mqtt.home.local:1883",
        "auth_required": False,
        "flag": FLAG2,
        "messages": MQTT_MESSAGES,
        "note": "Tüm ev cihazlarının mesajları anonim erişime açık!"
    })

# ZAFİYET #3: Firmware upload - Buffer overflow sim
@app.route("/api/firmware/upload", methods=["POST"])
def firmware_upload():
    data = request.get_data()
    size = len(data)
    logger.warning(f"FIRMWARE UPLOAD - size={size} bytes ip={request.remote_addr}")

    # Buffer overflow simulation: 1024 bytes'dan fazla = overflow
    BUFFER_SIZE = 1024
    if size > BUFFER_SIZE:
        overflow_amount = size - BUFFER_SIZE
        logger.warning(f"BUFFER OVERFLOW - overflow={overflow_amount} bytes!")
        return jsonify({
            "status": "buffer_overflow",
            "flag": FLAG3,
            "buffer_size": BUFFER_SIZE,
            "received": size,
            "overflow_bytes": overflow_amount,
            "message": f"OVERFLOW! {overflow_amount} bytes tampon belleği aştı. Gerçekte bu kod yürütmeye yol açabilir.",
            "simulated_crash": "Segmentation fault (core dumped)",
            "eip_overwrite": "0x41414141"
        })
    return jsonify({"status": "ok", "received": size, "message": "Firmware yüklendi"})

@app.route("/api/status")
def status():
    return jsonify({
        "device": "SmartBulb RGB Pro",
        "firmware": "v0.9.1-beta",
        "mqtt_broker": "mqtt.home.local",
        "mqtt_auth": False,
        "ssrf_endpoint": "/api/fetch?url=",
    })

if __name__ == "__main__":
    t = threading.Thread(target=mqtt_broker, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=8083, debug=False)
