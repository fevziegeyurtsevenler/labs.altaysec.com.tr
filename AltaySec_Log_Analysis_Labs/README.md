# 🛡️ AltaySec Blue Team Interactive Labs - Proof of Concept (PoC)

Bu repository, siber güvenlik eğitim platformları için tasarlanmış, **sıfır kurulum gerektiren (zero-setup)**, tarayıcı üzerinden çalışan ve CTF mantığıyla kodlanmış bir Blue Team / Olay Müdahale (Incident Response) laboratuvar konseptidir.

## 🎯 Konsept: "Interactive Log Detective"
Kullanıcılar, zafiyetli bir makineyi ayağa kaldırmak yerine, daha önceden saldırıya uğramış bir makinenin loglarını analiz ederek siber tehdit avcılığı (**Threat Hunting**) yaparlar. Yeni nesil eğitim platformlarında (**TryHackMe vb.**) olduğu gibi, analizciler bulgularını sistemdeki interaktif doğrulama scriptine girerek bayrağı (**Flag**) elde ederler.

### ✨ Öne Çıkan Özellikler:
* **Tarayıcı Tabanlı Terminal:** Gotty aracı kullanılarak Docker içindeki bash terminali doğrudan web tarayıcısına yansıtılır. SSH bağlantısı gerektirmez.
* **Anti-Cheat (Hile Koruması):** Bayrakları (Flag) veren bash scriptleri `shc` ile derlenerek okunamaz makine kodu (Binary) haline getirilmiştir. Analizci, logları gerçekten analiz etmeden bayrağa ulaşamaz.
* **Tam İzolasyon:** Her seviye kendi `docker-compose` ağı içinde yalıtılmış olarak çalışır.

---

## 🚀 Lab Nasıl Çalıştırılır?

Herhangi bir Docker yüklü sistemde, çözmek istediğiniz seviyenin klasörüne girip şu komutları çalıştırmak yeterlidir:

**Konteyneri inşa edin ve başlatın:**
```bash
docker-compose up -d --build
```
* Tarayıcınızdan terminale erişin (İlgili port üzerinden, örn: http://localhost:8080).

* Analizi bitirdiğinizde terminale `./submit` yazarak interaktif sınav sistemini başlatın!

## 🟢 Level 1: Recon & Brute Force (Kolay)
**Odak Noktası:** Web Trafiği Analizi, Kaba Kuvvet Saldırıları.

## 📝 Senaryo:
Şirketin ana web sunucusuna yönelik bir dizin taraması ve ardından yönetici paneline kaba kuvvet (`Brute Force`) saldırısı gerçekleştirildi.

## 🎯 Görevler
`access.log` dosyasını analiz et.

* Saldırganın IP adresini bul.

* **Başarılı (HTTP 302) giriş yaparken kullandığı Brute-Force aracını tespit et.**

* `./submit` çalıştır ve Flag'i kap.

---

## 🟡 Level 2: Shellshock CVE-2014-6271 (Orta)
**Odak Noktası:** Zafiyet Sömürüsü, Payload Deobfuscation, Anomali Tespiti.

## 📝 Senaryo:
Gürültülü web trafiği (**Nikto taramaları**) arasında gizlenen bir saldırgan, eski bir CGI scripti üzerinden "**Shellshock**" zafiyetini sömürerek sisteme sızmaya çalışıyor.

## 🎯 Görevler
`access.log` içindeki kalabalığı filtrele.

* **Shellshock** zafiyetinin imzasını (desenini) bul.

* Zafiyeti sömürmek için hedef alınan dosya yolunu tespit et.

* İşletim sisteminde çalıştırılan zararlı payload'u deşifre et.

---

## 🔴 Level 3: Stealth Mode & DFIR (Zor)
**Odak Noktası:** Olay Müdahale (**DFIR**), Log Korelasyonu, Web'den OS'e Sıçrama Analizi.

## 📝 Senaryo:
Gelişmiş bir tehdit aktörü, sisteme ters bağlantı (**reverse shell**) açmak için resim dosyası görünümünde gizli bir web shell yükler.

## 🎯 Görevler
**L7** (Web) ve **L4/L3** (Sistem) loglarını birbirleriyle ilişkilendirerek (korelasyon) büyük resmi gör.

* `access.log` üzerinden saldırıyı başlatan aracı ve yüklenen zararlı dosyayı bul.

* `system_audit.log` dosyasına geçerek saldırganın sistemdeki ayak izlerini takip et.

* Veri sızıntısını (**Exfiltration**) yakala ve C2 sunucusuna gönderilen **Base64** şifreli veriyi tespit et.

---


Terminal açıldığında tshark -r evidence.pcap komutuyla analizine başla. Tüm parçaları birleştirdiğinde `./submit` komutunu çalıştırarak bulgularını doğrula ve bayrağı (Flag) ele geçir!

*Developed by Emir - Information Security Specialist / Lab Researcher*
