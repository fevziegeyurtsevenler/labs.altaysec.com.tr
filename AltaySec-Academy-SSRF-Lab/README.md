# AltaySec Akademi — SSRF Güvenlik Laboratuvarları

Bu proje, modern web uygulamalarındaki **Server-Side Request Forgery (SSRF)** zafiyetlerini uygulamalı olarak öğretmek amacıyla geliştirilmiş, profesyonel bir siber güvenlik eğitim setidir.

---

## 🏗️ Laboratuvar Yapısı

Sistem, gerçekçi bir portfolyo/blog tasarımı altında üç farklı zorluk seviyesinden oluşur:

| Seviye | Port | Senaryo | Teknik |
| :--- | :--- | :--- | :--- |
| **Kolay** | 8081 | Filtresiz cURL Kullanımı | Doğrudan Loopback Erişimi |
| **Orta** | 8082 | Metin Bazlı Engel Listesi (Blacklist) | IP Obfuscation (0.0.0.0, 127.1) |
| **Zor** | 8083 | Sıkı IP Kontrolü ve DNS Analizi | Protocol Wrappers (file://) |

---

## 🚀 Kurulum ve Çalıştırma

Proje tamamen Dockerize edilmiştir. Tek bir komutla tüm sistemi ayağa kaldırabilirsiniz:

```bash
docker compose up --build -d
```

Çalıştıktan sonra tarayıcınızdan şu adreslere erişebilirsiniz:
- **Kolay:** `http://localhost:8081`
- **Orta:** `http://localhost:8082`
- **Zor:** `http://localhost:8083`

---

## 🛡️ Güvenlik Notları
- Bu laboratuvarlar **kasıtlı olarak zafiyetli** bırakılmıştır.
- Sadece yerel ağda (localhost) veya izole eğitim ortamlarında çalıştırılmalıdır.

---

## 📧 İletişim

Sorularınız veya kurumsal eğitim talepleriniz için:
- **Web:** [akademi.altaysec.com.tr](https://akademi.altaysec.com.tr/)
- **E-Posta:** [info@altaysec.com.tr](mailto:info@altaysec.com.tr)

**AltaySec Akademi — Siber Güvenlik Laboratuvarları 2026**
