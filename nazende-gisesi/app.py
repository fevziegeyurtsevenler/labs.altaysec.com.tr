import os
import sqlite3
from pathlib import Path

from flask import Flask, g, jsonify, redirect, render_template, request, send_from_directory, session, url_for

APP_DIR = Path(__file__).resolve().parent
if os.environ.get("VERCEL"):
    DB_PATH = Path("/tmp/nazende.db")
else:
    DB_PATH = APP_DIR / "nazende.db"

app = Flask(__name__)
app.secret_key = "nazende-lab-demo-key"

ORDINALS = {
    1: "Birinci",
    2: "İkinci",
    3: "Üçüncü",
    4: "Dördüncü",
    5: "Beşinci",
    6: "Altıncı",
    7: "Yedinci",
    8: "Sekizinci",
    9: "Dokuzuncu",
    10: "Onuncu",
}

SEANSLAR = {
    2: {
        "id": 2,
        "oyun": "Kadife Akşam",
        "yazar": "bir semt hikâyesi",
        "gun": "Cuma",
        "saat": "20:30",
        "fiyat": 180,
        "ozet": "Fuayede unutulmuş bir eldiven, üç perde, tek loca.",
        "afis": "afis-kadife.svg",
    },
    3: {
        "id": 3,
        "oyun": "Son Perde Öncesi",
        "yazar": "eski bir prova notundan",
        "gun": "Pazar",
        "saat": "16:00",
        "fiyat": 150,
        "ozet": "Matine. Öğrenci koltukları önde, localar kapalı.",
        "afis": "afis-perde.svg",
    },
}


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        DROP TABLE IF EXISTS kuponlar;
        DROP TABLE IF EXISTS localar;
        DROP TABLE IF EXISTS biletler;

        CREATE TABLE kuponlar (
            kod TEXT PRIMARY KEY,
            indirim INTEGER NOT NULL,
            public INTEGER NOT NULL,
            aciklama TEXT NOT NULL
        );

        CREATE TABLE localar (
            id INTEGER PRIMARY KEY,
            ad TEXT NOT NULL,
            bilet_turu TEXT NOT NULL,
            not_metni TEXT,
            flag TEXT
        );

        CREATE TABLE biletler (
            id INTEGER PRIMARY KEY,
            ad TEXT NOT NULL,
            oyun TEXT NOT NULL,
            gun TEXT NOT NULL,
            saat TEXT NOT NULL,
            koltuk TEXT NOT NULL,
            tur TEXT NOT NULL,
            fiyat INTEGER NOT NULL,
            not_metni TEXT,
            flag TEXT
        );
        """
    )
    db.executemany(
        "INSERT INTO kuponlar (kod, indirim, public, aciklama) VALUES (?, ?, ?, ?)",
        [
            ("OGRENCI10", 10, 1, "Öğrenci indirimi. Vitrinde durur."),
            ("LOCA-7", 0, 0, "Yedinci loca düzeni. Gişe personeline."),
            ("SUFLOR", 15, 0, "Suflör ve teknik ekip."),
        ],
    )
    loca_rows = []
    kisiler = {
        1: ("Selim Arı", "seyirci"),
        2: ("Meral Koç", "öğrenci"),
        3: ("Barış Eren", "abonman"),
        4: ("Mehmet Kaya", "öğrenci"),
        5: ("Elif Tan", "abonman"),
        6: ("Canan Yıldız", "davetli"),
        7: ("Belediye Protokol", "protokol"),
        8: ("Harun Işık", "abonman"),
        9: ("İsim yazılmayacak", "prova"),
        10: ("Leyla Sönmez", "seyirci"),
    }
    for i in range(1, 11):
        ad, tur = kisiler[i]
        if i == 9:
            not_metni = None
            flag = "TUGA{DOKUZUNCU_LOCA_BOS_KALSIN}"
        elif i == 1:
            not_metni = "FLAG{stajyer_sildi}"
            flag = None
        elif i in (5, 6, 7, 8):
            not_metni = f"{ORDINALS[i]} loca boş kalsın."
            flag = None
        else:
            not_metni = None
            flag = None
        loca_rows.append((i, ad, tur, not_metni, flag))
    db.executemany(
        "INSERT INTO localar (id, ad, bilet_turu, not_metni, flag) VALUES (?, ?, ?, ?, ?)",
        loca_rows,
    )
    db.executemany(
        "INSERT INTO biletler (id, ad, oyun, gun, saat, koltuk, tur, fiyat, not_metni, flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                1004,
                "Misafir Seyirci",
                "Kadife Akşam",
                "Cuma",
                "20:30",
                "C7",
                "öğrenci",
                180,
                "Gişeden basıldı. Öğrenci kuponu kullanılabilir.",
                None,
            ),
            (
                1005,
                "Elif Tan",
                "Kadife Akşam",
                "Cuma",
                "20:30",
                "Loca 5",
                "abonman",
                0,
                "Abonman hakkı.",
                None,
            ),
            (
                1008,
                "İsim yazılmayacak",
                "Kadife Akşam — prova",
                "Perşembe",
                "23:00",
                "Loca 9",
                "prova",
                0,
                "Basına kapalı prova. Alkış yok.",
                "TUGA{PROVADA_ALKIS_YASAK}",
            ),
        ],
    )
    db.commit()
    db.close()


if not DB_PATH.exists():
    init_db()


@app.route("/")
def index():
    return render_template(
        "index.html",
        seanslar=list(SEANSLAR.values()),
        kupon=session.get("kupon"),
    )


@app.route("/seans/<int:seans_id>")
def seans(seans_id):
    s = SEANSLAR.get(seans_id)
    if not s:
        return render_template("not_found.html", ne="Seans"), 404
    koltuklar = [
        ("A1", True),
        ("A2", True),
        ("A3", False),
        ("B1", True),
        ("B2", False),
        ("C7", True),
        ("L5", False),
        ("L7", False),
    ]
    return render_template(
        "seans.html",
        seans=s,
        koltuklar=koltuklar,
        kupon=session.get("kupon"),
    )


@app.route("/api/kuponlar")
def api_kuponlar():
    # bilinçli olarak yetkisiz — lab zafiyeti
    rows = get_db().execute(
        "SELECT kod, indirim, public, aciklama FROM kuponlar ORDER BY kod"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/kupon", methods=["POST"])
def uygula_kupon():
    kod = (request.form.get("kod") or "").strip().upper()
    row = get_db().execute(
        "SELECT kod, indirim, aciklama FROM kuponlar WHERE kod = ?", (kod,)
    ).fetchone()
    if not row:
        session["kupon"] = None
        session["kupon_mesaj"] = "Bu kod gişede yok."
        return redirect(request.referrer or url_for("index"))
    session["kupon"] = {"kod": row["kod"], "indirim": row["indirim"]}
    if row["kod"] == "LOCA-7":
        session["kupon_mesaj"] = (
            "LOCA-7 kabul edildi. Gişe notu: yedinci loca defterine bakın (/loca/7)."
        )
    elif row["kod"] == "OGRENCI10":
        session["kupon_mesaj"] = "Öğrenci indirimi uygulandı."
    elif row["kod"] == "SUFLOR":
        session["kupon_mesaj"] = "Teknik ekip indirimi uygulandı."
    else:
        session["kupon_mesaj"] = row["aciklama"]
    return redirect(request.referrer or url_for("bilet", bilet_id=1004))


@app.route("/loca/<int:loca_id>")
def loca(loca_id):
    row = get_db().execute("SELECT * FROM localar WHERE id = ?", (loca_id,)).fetchone()
    if not row:
        return render_template("not_found.html", ne="Loca"), 404
    return render_template("loca.html", loca=row)


@app.route("/bilet/<int:bilet_id>")
def bilet(bilet_id):
    row = get_db().execute("SELECT * FROM biletler WHERE id = ?", (bilet_id,)).fetchone()
    if not row:
        return render_template("not_found.html", ne="Bilet"), 404
    fiyat = row["fiyat"]
    kupon = session.get("kupon")
    if kupon and fiyat:
        fiyat = int(fiyat * (100 - kupon["indirim"]) / 100)
    return render_template(
        "bilet.html",
        bilet=row,
        fiyat=fiyat,
        kupon=kupon,
        mesaj=session.pop("kupon_mesaj", None),
    )


@app.route("/biletlerim")
def biletlerim():
    return redirect(url_for("bilet", bilet_id=1004))


@app.route("/static/<path:filename>")
def static_dosya(filename):
    # Vercel paketinde Flask default static bazen düşüyor; açıkça servis et.
    return send_from_directory(APP_DIR / "static", filename)
