# 🚩 ALTAYSEC SSTI LAB: The Art of Injection

<div align="center">

```
 █████╗ ██╗  ████████╗ █████╗ ██╗   ██╗███████╗███████╗ ██████╗
██╔══██╗██║  ╚══██╔══╝██╔══██╗╚██╗ ██╔╝██╔════╝██╔════╝██╔════╝
███████║██║     ██║   ███████║ ╚████╔╝ ███████╗█████╗  ██║     
██╔══██║██║     ██║   ██╔══██║  ╚██╔╝  ╚════██║██╔══╝  ██║     
██║  ██║███████╗██║   ██║  ██║   ██║   ███████║███████╗╚██████╗
╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝ ╚═════╝
```

**SSTI LAB — The Art of Injection**

*Server-Side Template Injection · 3 Seviye · CTF Tarzı · Docker Tabanlı*

[![Docker](https://img.shields.io/badge/Docker-Required-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

Modern web uygulamalarında sıkça karşılaşılan **Server-Side Template Injection (SSTI)** zafiyetlerini anlamak ve pratik yapmak için hazırlanmış, **3 seviyeli (CTF tarzı)** bir laboratuvardır.

Bu lab, katılımcının basitten ileri seviyeye doğru ilerleyerek SSTI açıklarını keşfetmesini ve sömürmesini hedefler.

---

## 🎯 Amaç

Bu laboratuvar sayesinde:

- SSTI zafiyetlerini tanıyabilir
- Farklı template engine davranışlarını gözlemleyebilir
- WAF bypass tekniklerini deneyimleyebilir
- Gerçek hayata yakın exploitation senaryoları çözebilirsin

---

## 🛠 Mimari Yapı

Proje tamamen **Docker** tabanlıdır ve her seviye **izole container** içinde çalışır.

- Her level ayrı bir servis olarak çalışır
- Portlar **manuel karışıklık olmayacak şekilde sabitlenmiştir**
- Tüm sistem `docker-compose` ile tek komutla ayağa kalkar

---

## ⚙️ Gereksinimler

Labı çalıştırmak için:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Kurulum

### 1. Projeyi Klonla

```bash
git clone <repo-link>
cd <repo-klasörü>
```

### 2. Sistemi Başlat

```bash
docker-compose up --build
```

Bu komut:

- Tüm container'ları build eder
- Gerekli bağımlılıkları yükler
- 3 farklı lab ortamını aynı anda başlatır

---

## 🌐 Laboratuvar Erişim Adresleri

Kurulum tamamlandıktan sonra tarayıcıdan direkt erişebilirsin:

| Seviye | Adres | Açıklama |
|--------|-------|----------|
| Level 1 | http://localhost:5000 | 🟢 |
| Level 2 | http://localhost:5001 | 🟡 |
| Level 3 | http://localhost:5002 | 🔴 |

---

## 🧠 Lab Mantığı

- Her level bağımsızdır
- Her seviyede bir flag bulunur
- Doğru exploit yapıldığında `ACCESS GRANTED` çıktısı alınır

---

## 👩‍💻 Geliştirici

**Meryem Betül Çelik**  2026
