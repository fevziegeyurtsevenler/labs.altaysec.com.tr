# 🏠 Akıllı Ev IoT Red Team Lab

> **Zorluk:** Başlangıç (Giriş Seviyesi)  
> **Amaç:** IoT cihazların gerçek güvenlik açıklarını, çalışan simülasyonlar üzerinde ellerin kirletilerek öğrenmek.  
> **Gereksinim:** Sadece Docker

---

## ⚡ Hızlı Başlangıç

```bash
chmod +x deploy.sh
./deploy.sh
```

Bu kadar. 5 lab saniyeler içinde ayağa kalkar.

---

## 🗺 Lab Haritası

| Lab | Cihaz | Port | Konu | Zorluk |
|-----|-------|------|------|--------|
| 1 | 📷 IP Kamera | 8081 | Default şifre, SSRF, RTSP | ⭐ |
| 2 | 🌡 Termostat | 8082 | Telnet backdoor, Cmd Injection, Hardcoded | ⭐⭐ |
| 3 | 💡 Akıllı Ampul | 8083 | SSRF→MQTT, Anonim broker, Buffer Overflow | ⭐⭐ |
| 4 | 🔐 Akıllı Kilit | 8084 | BLE sniff, Replay Attack, SQL Injection | ⭐⭐ |
| 5 | 📡 Evil Twin WiFi | 8085 | Phishing, Login Bypass, ARP Hijack | ⭐⭐ |

---

## 📋 Komutlar

```bash
./deploy.sh              # Tüm labları başlat
./deploy.sh stop         # Tüm labları durdur
./deploy.sh status       # Çalışan container'ları listele
./deploy.sh logs lab1-camera   # Lab 1 loglarını izle
./deploy.sh rebuild      # Sıfırdan yeniden kur
```

---

## 🏁 Toplam Flag Listesi (15 Flag)

```
Lab 1:  FLAG{d3fault_cr3ds_ar3_3v3rywh3r3}
Lab 1:  FLAG{ssrf_0p3ns_1nn3r_w0rld}
Lab 1:  FLAG{rtsp_str3am_unauth_acc3ss}
Lab 2:  FLAG{t3ln3t_backd00r_supp0rt_acc3ss}
Lab 2:  FLAG{cmdi_h3at_th3_syst3m}
Lab 2:  FLAG{hardc0d3d_mqtt_cr3ds_1n_js}
Lab 3:  FLAG{ssrf_t0_mqtt_1nt3rn4l}
Lab 3:  FLAG{anon_mqtt_r3ads_3v3ryth1ng}
Lab 3:  FLAG{buff3r_0v3rfl0w_f1rmw4r3}
Lab 4:  FLAG{bl3_gatt_sn1ff_0p3n_s3sam3}
Lab 4:  FLAG{r3play_att4ck_byp4ss_l0ck}
Lab 4:  FLAG{sql1_1nj3ct10n_unl0cks_db}
Lab 5:  FLAG{hum4n_3rr0r_b3st_vuln}
Lab 5:  FLAG{capt1v3_p0rtal_byp4ss}
Lab 5:  FLAG{arp_s3ss10n_h1jack}
```

---

## ⚠️ Yasal Uyarı

Bu lablar **yalnızca eğitim amaçlıdır.** Burada öğrendiklerini gerçek sistemlere izinsiz uygulamak yasadışıdır. Sadece kendi sahip olduğun veya yazılı izin aldığın sistemlerde test yap.
