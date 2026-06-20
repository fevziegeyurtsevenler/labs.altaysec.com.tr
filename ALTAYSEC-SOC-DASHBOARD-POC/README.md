# ALTAYSEC-MEMORY-FORENSICS-POC

Bu repository, siber güvenlik eğitim platformları için tasarlanmış, sıfır kurulum gerektiren (zero-setup), tarayıcı üzerinden çalışan ve CTF mantığıyla kodlanmış bir Blue Team / Olay Müdahale (Incident Response) bellek analizi laboratuvar konseptidir.

### 🎯 Konsept: "Interactive Memory Detective"

Kullanıcılar, devasa boyutlardaki RAM imajlarını indirip sanal makine kurmakla uğraşmazlar. AltaySec'in özel geliştirdiği **Mock Volatility 3** simülatörü sayesinde, öğrenci doğrudan tarayıcı üzerinden bellek içi analiz, tehdit avcılığı ve zararlı yazılım tespiti yapar. Yeni nesil eğitim platformlarında olduğu gibi, analizciler bulgularını sistemdeki interaktif doğrulama scriptine girerek bayrağı (Flag) elde ederler.

### ✨ Öne Çıkan Özellikler

* **Tarayıcı Tabanlı Özel Terminal:** `ttyd` aracı kullanılarak Docker içindeki bash terminali doğrudan web tarayıcısına yansıtılır. SSH bağlantısı gerektirmez.
* **Mock Volatility Simülatörü:** GB'larca RAM imajı indirmeye gerek bırakmayan, Python ile kodlanmış ve gerçek Volatility 3 çıktıları üreten optimize edilmiş simülatör altyapısı.
* **Anti-Cheat (Hile Koruması):** Bayrakları (Flag) veren doğrulama scriptleri ve backend mantığı, şifreli (XOR + Base64) ve dinamik çözümlü olarak kurgulanmıştır. Analiz yapmadan bayrağa ulaşmak imkansızdır.
* **Tam İzolasyon:** Her seviye kendi `docker-compose` ağı içinde yalıtılmış olarak çalışır.

### 🧩 Laboratuvar Seviyeleri

Laboratuvar, artan zorluk derecesiyle üç farklı aşamadan oluşur:

1. **Easy (Level 1):** BOLA/IDOR zafiyet tespiti ve temel log analizi.
2. **Medium (Level 2):** WAF atlatma, Base64 obfuscated payload analizi ve veri sızdırma (Exfiltration) tespiti.
3. **Hard (Level 3):** FIM (File Integrity Monitoring) ve Rootkit tespiti. Sistemin bütünlüğünü bozan zararlı dosyaların hash analizi ve bind shell tespiti.

### 🚀 Lab Nasıl Çalıştırılır?

Herhangi bir Docker yüklü sistemde, çözmek istediğiniz seviyenin klasörüne girip şu komutları çalıştırmak yeterlidir:

1. Konteyneri inşa edin ve başlatın:
   ```bash
   docker-compose up -d --build
   ```
Tarayıcınızdan terminale erişin (Örn: http://localhost:5001).

Analizi bitirdiğinizde veya ipuçlarını topladığınızda, terminal üzerindeki ilgili form ekranlarını kullanarak bayrağı (Flag) doğrulayın.

<img width="1894" height="891" alt="d_1" src="https://github.com/user-attachments/assets/9dcd680f-f53b-42ef-b1f4-56f9452375f8" />

*Developed by Emir - Information Security Specialist / Blue Team Lab Researcher*
