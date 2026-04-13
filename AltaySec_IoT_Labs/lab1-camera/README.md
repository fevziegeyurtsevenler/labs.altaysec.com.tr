# 🏠 LAB 1: Ucuz Gözetleyici — Apartman IP Kamerası

> **Zorluk:** ⭐ Kolay (Başlangıç)  
> **Süre:** ~20 dakika  
> **Portlar:** 8081 (Web UI), 8554 (Simüle RTSP)

---

## 📖 Hikaye

2019 yılında Çin'den 20 dolara alınan bir bebek kamerası. Kutusundan çıktığı gibi prize takılmış, hiçbir ayar değiştirilmemiş. Artık evin Wi-Fi'ına bağlı, 7/24 yayın yapıyor.

Şimdi soru şu: **Bu kameraya kim erişebilir?**

---

## 🎯 Öğrenme Hedefleri

Bu lab sonunda şunları anlayacaksın:
- Varsayılan (default) kimlik bilgileri neden tehlikelidir
- SSRF (Server-Side Request Forgery) nedir, nasıl çalışır
- Kimlik doğrulaması olmayan servis portları ne kadar tehlikelidir

---

## 🚀 Başlatma

```bash
cd lab1-camera
docker build -t lab1-camera .
docker run -d --name lab1-camera -p 8081:8081 -p 8554:8554 lab1-camera
```

Tarayıcıda aç: **http://localhost:8081**

Logları izle:
```bash
docker logs -f lab1-camera
```

---

## 🔍 Çözüm Adımları (Writeup)

### FLAG 1 — Default Credentials (Varsayılan Şifre)

**Ne yapıyoruz?** Kameranın web arayüzüne giriş yapıyoruz.

1. `http://localhost:8081` adresine git
2. Login formunu gör. Şimdi düşün: Bu kamera 2019'da üretilmiş, kutusundan çıkmış, şifre hiç değiştirilmemiş.
3. Fabrika çıkışı varsayılan bilgileri dene:
   - Kullanıcı adı: `admin`
   - Şifre: `123456`
4. Giriş yaptın! Dashboard'da FLAG1 görünür.

```
FLAG{d3fault_cr3ds_ar3_3v3rywh3r3}
```

**Neden önemli?** Milyonlarca IoT cihaz bu varsayılan şifrelerle internete açık. [Shodan.io](https://shodan.io) gibi arama motorları bu cihazları saniyeler içinde bulur.

---

### FLAG 2 — SSRF (Sunucu Taraflı İstek Sahteciliği)

**Ne yapıyoruz?** Kameranın kendi iç dosya sistemine erişiyoruz.

1. Dashboard'a giriş yaptıktan sonra **FLAG 2 - SSRF Tester** panelini bul
2. Kameranın `/proxy?path=` endpoint'i var. Bu endpoint, verilen yoldaki dosyayı okuyor.
3. Input alanına `../flag.txt` yaz ve "Test Et" butonuna bas
4. Ya da direkt URL ile dene:

```bash
curl "http://localhost:8081/proxy?path=../flag.txt"
```

Diğer ilginç dosyalar:
```bash
curl "http://localhost:8081/proxy?path=/etc/camera.conf"
curl "http://localhost:8081/proxy?path=/etc/passwd"
```

```
FLAG{ssrf_0p3ns_1nn3r_w0rld}
```

**Neden önemli?** Cihaz, dışarıdan gelen bir isteği kendi adına iç ağda çalıştırıyor. Bu sayede normalde erişilemeyen dosyalara ve servislere ulaşılabilir.

---

### FLAG 3 — Kimlik Doğrulamasız RTSP Portu

**Ne yapıyoruz?** Kamera akışına şifresiz bağlanıyoruz.

1. Dashboard'daki **FLAG 3 - RTSP Bilgileri** paneline bak
2. "RTSP Bilgilerini Çek" butonuna bas veya:

```bash
curl "http://localhost:8081/rtsp/info"
```

3. `auth_required: false` olduğunu gör. Şimdi doğrudan bağlan:

```bash
# RTSP portuna ham bağlantı (netcat ile)
echo "OPTIONS * RTSP/1.0\r\nCSeq: 1\r\n\r\n" | nc localhost 8554
```

Dönen cevaptaki `X-Flag` header'ında FLAG3 bulunur.

```
FLAG{rtsp_str3am_unauth_acc3ss}
```

**Neden önemli?** RTSP (Real Time Streaming Protocol) kamera yayın protokolüdür. Auth olmadan açık olan bu port, eve bağlı herhangi birinin kamera görüntüsüne erişmesine izin verir.

---

## 🔵 Blue Team Notu

Saldırı sırasında logları izle:
```bash
docker logs -f lab1-camera
```

Şunları göreceksin:
- `LOGIN ATTEMPT - user=admin pass=123456` → Brute force tespiti böyle yapılır
- `PROXY REQUEST - path=../flag.txt` → SSRF girişimi logda belli olur
- `RTSP CONNECTION from ... - NO AUTH REQUIRED` → Yetkisiz bağlantı

---

## 💭 Düşünce Sorusu

Bu labı bitirdin. Şimdi dur ve düşün:

**Evinde kaç tane kamera, bebek monitörü veya güvenlik sistemi var? Son ne zaman şifrelerini değiştirdin?**

---

*Sonraki Lab → [LAB 2: Rahatlığın Bedeli - Akıllı Termostat](../lab2-thermostat/README.md)*
