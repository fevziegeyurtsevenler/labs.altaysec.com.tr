# 📡 LAB 5: Sahte Güven — Evil Twin WiFi Simülasyonu

> **Zorluk:** ⭐⭐ Kolay-Orta  
> **Süre:** ~30 dakika  
> **Port:** 8085

---

## 📖 Hikaye

Her sabah bağlandığın o Wi-Fi ağı. Telefon açılıyor, otomatik bağlanıyor, hayat akıyor. Ama bugün aynı isimde iki ağ var. Cihazın daha güçlü sinyali seçiyor — ve o güçlü sinyal sana ait değil.

Bu lab donanımsal Wi-Fi manipülasyonu yerine **saldırının mantığını** simüle eder: Sahte portal, şifre toplama, oturum çalma.

---

## 🚀 Başlatma

```bash
cd lab5-evil-twin
docker build -t lab5-evil-twin .
docker run -d --name lab5-evil-twin -p 8085:8085 lab5-evil-twin
```

Tarayıcıda aç: **http://localhost:8085**

---

## 🔍 Çözüm Adımları

### FLAG 1 — Captive Portal Phishing (İnsan Zafiyeti)

**Konsept:** Saldırgan, gerçek ağla aynı isimde sahte bir Wi-Fi açar. Cihazlar otomatik bağlanır. Captive portal açılır, kullanıcı şifresini "doğrulama" için girer.

1. `http://localhost:8085` adresini aç
2. Gözlemle: Sayfa gerçek bir Wi-Fi giriş portalı gibi görünüyor
3. Herhangi bir kullanıcı adı ve şifre gir (örneğin: `ev_sahibi` / `aile2024`)
4. "Bağlan" butonuna bas
5. Karşına saldırganın paneli açılır — girdiğin şifreyi görürsün

```
FLAG{hum4n_3rr0r_b3st_vuln}
```

**Neden önemli?** Bu saldırıda teknik bir zafiyet yok. Zafiyet insanın güven duygusunda. Tanıdık bir ekran gördüğünde sorgulamadan giriş yapıyoruz.

---

### FLAG 2 — Captive Portal Login Bypass

**Konsept:** Admin panelinin kimlik doğrulaması kolayca atlatılıyor.

**Yöntem 1 — URL parametresi:**
```
http://localhost:8085/admin/login?bypass=true
```

**Yöntem 2 — Boş şifre:**
1. `http://localhost:8085/admin/login` adresine git
2. Kullanıcı adı: `admin`, şifre alanını boş bırak
3. Giriş yap

```
FLAG{capt1v3_p0rtal_byp4ss}
```

---

### FLAG 3 — ARP Zehirleme ile Session Hijack

**Konsept:** Saldırgan ağ trafiğini dinliyor (Man-in-the-Middle). HTTP üzerinden geçen session cookie'leri açıkta yakalıyor. Bu cookie ile admin paneline şifresiz giriyor.

1. `http://localhost:8085/api/arp-log` adresine git (veya paneldeki ARP tablosuna bak)
2. Loglarda `SESSION_STOLEN` satırını bul
3. Çalınan session: `sess_router_1234`
4. Bu session ile panele git:

```
http://localhost:8085/admin/panel?session=sess_router_1234
```

Veya paneldeki "Session Hijack" alanına yapıştır ve "Panele Gir" butonuna bas.

```
FLAG{arp_s3ss10n_h1jack}
```

**Neden önemli?** HTTP (S'siz) kullanan siteler ve uygulamalar, aynı ağdaki herkese oturumunu açık verir. Çözüm: Her zaman HTTPS, her yerde HTTPS.

---

## 🔵 Blue Team Notu

```bash
docker logs -f lab5-evil-twin
```

- `PHISHING CREDENTIAL CAPTURED` → Kurbanın girdiği şifre loglanır
- `LOGIN BYPASS via URL parameter` → Bypass girişimi görünür
- `SESSION HIJACK via stolen cookie` → Hangi session kullanıldı

---

## ⚠️ Korunma Yöntemleri

Evil Twin saldırısına karşı:
- Tanımadığın ağlara bağlanma
- VPN kullan (özellikle halka açık Wi-Fi'da)
- HTTPS olmayan sitelere şifre girme
- Tarayıcının "güvenli değil" uyarılarını dikkate al
- Mümkünse mobil veri kullan

---

---

# 🏁 TÜM LABLARI TAMAMLADIN

```
FLAG{d3fault_cr3ds_ar3_3v3rywh3r3}        ← Lab 1 - Kamera
FLAG{ssrf_0p3ns_1nn3r_w0rld}              ← Lab 1 - SSRF
FLAG{rtsp_str3am_unauth_acc3ss}           ← Lab 1 - RTSP
FLAG{t3ln3t_backd00r_supp0rt_acc3ss}     ← Lab 2 - Telnet
FLAG{cmdi_h3at_th3_syst3m}               ← Lab 2 - Cmd Injection
FLAG{hardc0d3d_mqtt_cr3ds_1n_js}         ← Lab 2 - Hardcoded
FLAG{ssrf_t0_mqtt_1nt3rn4l}              ← Lab 3 - SSRF→MQTT
FLAG{anon_mqtt_r3ads_3v3ryth1ng}         ← Lab 3 - MQTT
FLAG{buff3r_0v3rfl0w_f1rmw4r3}           ← Lab 3 - Overflow
FLAG{bl3_gatt_sn1ff_0p3n_s3sam3}        ← Lab 4 - BLE
FLAG{r3play_att4ck_byp4ss_l0ck}         ← Lab 4 - Replay
FLAG{sql1_1nj3ct10n_unl0cks_db}         ← Lab 4 - SQLi
FLAG{hum4n_3rr0r_b3st_vuln}             ← Lab 5 - Phishing
FLAG{capt1v3_p0rtal_byp4ss}             ← Lab 5 - Bypass
FLAG{arp_s3ss10n_h1jack}                ← Lab 5 - Hijack
```

---

## 💬 Son Söz — Bir Dakika Dur

Şu an 15 farklı güvenlik açığını buldun, sömürdün, anladın.

Kamerayı hacklediğinde gülümsemiş olabilirsin.
Kilidi replay saldırısıyla açtığında heyecanlanmış olabilirsin.
Captive portal'a kendi şifreni girip sonucu görünce belki ürperdin.

**Şimdi sana bir soru:**

Bu labdaki hiçbir güvenlik açığı kurgusal değil. Hepsi gerçek cihazlarda, gerçek protokollerde, gerçek hayatta var olmaya devam ediyor.

**Kendi evine bak:**

- Modeminin admin şifresini son ne zaman değiştirdin?
- Evindeki kamera, termostat veya akıllı ampulün varsayılan şifresini hiç değiştirdin mi?
- Evinin Wi-Fi'ı WPA2 mi, WPA3 mü — yoksa hâlâ WEP mi?
- Misafir ağın var mı? IoT cihazların oraya mı bağlı?

*Sistemi sana rahatlığı sundu. Sen de sorgulamadan aldın.*

*Bu labı çözdün — ama ev ağını da denetlemeyi unutma.*

---

*Güvenlik bir ürün değil, bir alışkanlıktır.*
