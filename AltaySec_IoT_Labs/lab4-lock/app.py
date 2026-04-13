#!/usr/bin/env python3
"""
LAB 4: Fiziksel İllüzyon - Akıllı Kilit Replay Saldırısı
Zafiyetler: BLE GATT Sniff Sim, Replay Attack, SQL Injection
"""

from flask import Flask, request, jsonify
import threading, socket, time, logging, json, base64, hashlib, sqlite3, os

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [LOCK-SYS] %(message)s')
logger = logging.getLogger(__name__)

FLAG1 = "FLAG{bl3_gatt_sn1ff_0p3n_s3sam3}"
FLAG2 = "FLAG{r3play_att4ck_byp4ss_l0ck}"
FLAG3 = "FLAG{sql1_1nj3ct10n_unl0cks_db}"

LOCK_STATE = {"locked": True, "last_unlock": None, "attempts": 0}

# Simüle BLE paketleri - zayıf şifreli
BLE_PACKETS = [
    {"handle": "0x002a", "opcode": "WRITE", "data": base64.b64encode(b"UNLOCK:home:1234").decode(), "encrypted": False},
    {"handle": "0x002b", "opcode": "READ", "data": base64.b64encode(b"STATUS:LOCKED").decode()},
    {"handle": "0x002a", "opcode": "WRITE", "data": base64.b64encode(b"UNLOCK:home:1234").decode(), "encrypted": False, "flag": FLAG1},
    {"handle": "0x002c", "opcode": "READ", "data": base64.b64encode(b"DEVICE:SmartLock-Pro-v1").decode()},
]

# Kaydedilmiş geçerli unlock paketi (replay için)
VALID_UNLOCK_PACKET = base64.b64encode(b"UNLOCK:home:1234").decode()

# SQLite veritabanı kur
DB_PATH = "/tmp/lock.db"
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        pin TEXT,
        role TEXT,
        flag TEXT
    )""")
    c.execute("DELETE FROM users")
    c.executemany("INSERT INTO users VALUES (?,?,?,?,?)", [
        (1, "admin", "1234", "owner", FLAG3),
        (2, "guest", "0000", "guest", ""),
        (3, "cleaner", "5678", "limited", ""),
    ])
    conn.commit()
    conn.close()

init_db()

# BLE GATT Simülasyon Server
def ble_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(("0.0.0.0", 9001))
        server.listen(5)
        logger.info("BLE GATT sim on :9001 (unencrypted packets!)")
        while True:
            try:
                client, addr = server.accept()
                logger.warning(f"BLE GATT CONNECTION from {addr}")
                threading.Thread(target=handle_ble, args=(client, addr), daemon=True).start()
            except:
                pass
    except Exception as e:
        logger.error(f"BLE server error: {e}")

def handle_ble(client, addr):
    try:
        welcome = json.dumps({
            "service": "SmartLock BLE GATT",
            "uuid": "00001234-0000-1000-8000-00805f9b34fb",
            "encryption": "NONE",
            "note": "Paketler şifrelenmemiş! Havadan yakalanabilir.",
            "flag": FLAG1,
            "packets": BLE_PACKETS
        })
        client.send(welcome.encode())
    except:
        pass
    finally:
        client.close()

@app.route("/")
def index():
    with open("/app/index.html") as f:
        return f.read()

@app.route("/api/lock/status")
def lock_status():
    return jsonify({**LOCK_STATE, "device": "SmartLock Pro v1", "ble_port": 9001})

# ZAFİYET #1: BLE paketleri açıkta
@app.route("/api/ble/scan")
def ble_scan():
    logger.warning(f"BLE SCAN - ip={request.remote_addr}")
    return jsonify({
        "found_devices": [{
            "name": "SmartLock-Pro",
            "mac": "AA:BB:CC:DD:EE:FF",
            "rssi": -45,
            "encryption": False,
            "flag": FLAG1,
            "packets": BLE_PACKETS,
            "vulnerability": "Paketler şifrelenmemiş, herkes dinleyebilir"
        }]
    })

# ZAFİYET #2: Replay Attack
@app.route("/api/lock/unlock", methods=["POST"])
def unlock():
    data = request.get_json(silent=True) or {}
    packet = data.get("packet", "")
    method = data.get("method", "normal")

    logger.warning(f"UNLOCK ATTEMPT - method={method} packet_len={len(packet)} ip={request.remote_addr}")

    if packet == VALID_UNLOCK_PACKET:
        LOCK_STATE["locked"] = False
        LOCK_STATE["last_unlock"] = time.strftime("%H:%M:%S")
        logger.warning(f"REPLAY ATTACK SUCCESS - lock opened! ip={request.remote_addr}")
        return jsonify({
            "status": "UNLOCKED",
            "method": "replay_attack",
            "flag": FLAG2,
            "message": "Kilit açıldı! Geçerli paket tekrar oynatıldı (Replay Attack)",
            "packet_used": packet
        })

    LOCK_STATE["attempts"] += 1
    return jsonify({"status": "DENIED", "attempts": LOCK_STATE["attempts"]})

@app.route("/api/lock/lock", methods=["POST"])
def lock():
    LOCK_STATE["locked"] = True
    return jsonify({"status": "LOCKED"})

# ZAFİYET #3: SQL Injection
@app.route("/api/users/lookup")
def lookup_user():
    username = request.args.get("username", "")
    logger.warning(f"USER LOOKUP - username={username} ip={request.remote_addr}")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    try:
        # Güvensiz SQL - injection açığı
        query = f"SELECT id, username, role, flag FROM users WHERE username = '{username}'"
        logger.warning(f"SQL QUERY: {query}")
        c.execute(query)
        rows = c.fetchall()

        if rows:
            results = [{"id": r[0], "username": r[1], "role": r[2], "flag": r[3]} for r in rows]
            # Flag varsa logla
            for r in results:
                if r.get("flag"):
                    logger.warning(f"SQL INJECTION FLAG LEAKED - flag={r['flag']}")
            return jsonify({"status": "found", "results": results, "query": query})
        return jsonify({"status": "not_found", "query": query})
    except Exception as e:
        logger.error(f"SQL ERROR: {e} - query={query}")
        return jsonify({"status": "error", "message": str(e), "query": query})
    finally:
        conn.close()

@app.route("/api/status")
def status():
    return jsonify({
        "device": "SmartLock Pro v1",
        "ble_encryption": False,
        "replay_protection": False,
        "sql_prepared_statements": False
    })

if __name__ == "__main__":
    t = threading.Thread(target=ble_server, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=8084, debug=False)
