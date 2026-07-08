<div align="center">
  <!-- <img src="assets/preview.png" alt="AltaySec LLM Security Lab" width="100%" /> -->
  
  <br/>
  
  # 🔓 AltaySec — LLM Jailbreak Lab
  
  **Yapay Zeka Sistemleri İçin Uygulamalı Güvenlik (CTF) Laboratuvarı**

  [![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker&logoColor=white)](https://www.docker.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-43853D?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Nginx](https://img.shields.io/badge/Nginx-Proxy-009639?logo=nginx&logoColor=white)](https://nginx.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  <p align="center">
    LLM (Büyük Dil Modeli) güvenlik zafiyetlerini (Prompt Injection, Jailbreak, System Prompt Exfiltration) öğrenmek ve pratik yapmak için hazırlanmış modern, dockerize ve <b>sıfır maliyetli (Zero-Bill)</b> bir eğitim ortamı.
  </p>
</div>

---

## 🚀 Hızlı Başlangıç

### 📋 Gereksinimler
- [Docker](https://www.docker.com/products/docker-desktop/) ve Docker Compose kurulu olmalı.
- Oynamak için ücretsiz bir LLM API anahtarına ihtiyacınız var:
  - **Groq (Önerilen/Hızlı):** [console.groq.com/keys](https://console.groq.com/keys)
  - **Google Gemini:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 🛠️ Kurulum ve Çalıştırma

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/beratt06/AltaySec-Academy-LLM_SECUR-TY-Lab.git
   cd AltaySec-Academy-LLM_SECUR-TY-Lab
   ```

2. **Docker ile Başlatın:**
   ```bash
   docker-compose up --build -d
   ```

3. **Tarayıcıda Açın:**
   👉 **[http://localhost:3002](http://localhost:3002)** adresinden laboratuvara erişebilirsiniz.

> 💡 *Not: Sunucuya veya production ortamına kuruyorsanız, bir Nginx Reverse Proxy (veya Cloudflare Tunnel) aracılığıyla 80/443 portuna yönlendirebilirsiniz.*

---

## 🎯 Nasıl Oynanır?

1. **Bağlantı Kurun:** Sisteme girdiğinizde kendi API anahtarınızı (Gemini veya Groq) bağlayın.
2. **Görev Seçin:** Güvenlik açıklarını test etmek istediğiniz asistanı seçin.
3. **Zafiyet Avı:** Hedef sistemi manipüle ederek (Prompt Injection/Jailbreak) koruduğu sırrı açığa çıkartmaya çalışın. Format: `AltaySec{...}`
4. **Bayrağı Doğrulatın:** Bulduğunuz bayrağı sisteme girip başarı durumunuzu doğrulayın.
5. **Takılırsanız:** `writeups/` (Çözümler) klasöründeki resmi çözüm yöntemlerine göz atabilirsiniz.

---

## 🏆 Seviyeler

Bu lab, LLM saldırı vektörlerini temelden ileri düzeye kadar işler:

| Zorluk | Hedef Sistem | Öğrenim Çıktısı (Konsept) |
|:---:|:---:|---|
| 🟢 **Kolay** | **VAULT-BOT 9000** | Rol yapma (Roleplay) / Karakter bypass saldırıları. Yapay zekayı koruyucu rolünden çıkarma taktikleri. |
| 🟡 **Orta** | **CORP-ASSISTANT** | Çok katmanlı **Prompt Injection** atlatma. Katı güvenlik komutlarını ezerek gizli koda ulaşma. |
| 🔴 **Zor** | **NEMESIS-AI v2.1** | Gelişmiş **System Prompt Exfiltration** (Sızdırma). Arka plandaki tüm gizli talimatları ifşa etme. |

---

## 🏗 Sistem Mimarisi ve Güvenlik

Laboratuvar güvenlik odaklı ve eğitim kurumları için **"Sıfır Fatura (Zero-Bill)"** prensibiyle tasarlanmıştır.

- **İstemci Taraflı LLM:** Yapay zeka istekleri doğrudan kullanıcının tarayıcısından yapılır. Sunucu (Backend) hiçbir şekilde LLM faturası üretmez. Bu, DDoS ile LLM kotası patlatma riskini %100 sıfırlar.
- **Kriptografik Doğrulama:** CTF bayrakları (`AltaySec{...}`) hiçbir şekilde frontend'de yer almaz. Doğrulama Backend üzerinde **SHA-256 hash** kontrolü ile yapılır. (Tarayıcı ağı izlenerek hile yapılamaz).
- **Obfuscation (Gizleme):** Sistem prompt'ları backend'den Base64+XOR şifrelemesiyle istemciye aktarılır.
- **İzolasyon:** Frontend (Nginx) ve Backend (Node.js) izole bir Docker ağı içerisinde sadece yetkilendirilmiş portlardan konuşur.

<details>
<summary><b>📂 Dizin Yapısını Görüntüle</b></summary>

```text
llm security/
├── backend/                  # Node.js API (Hash Doğrulama, İpuçları)
├── frontend/                 # Nginx + Static HTML/CSS/JS (Kullanıcı Arayüzü)
├── writeups/                 # 🛡️ Çözüm ve Hile Kılavuzları
├── assets/                   # README ve dökümantasyon görselleri
└── docker-compose.yml        # Konteyner Orkestrasyonu
```

</details>

---

## 📖 Çözüm Kılavuzları (Writeups)

Eğer bir bölümde takılırsanız, sistemin nasıl sömürüldüğüne dair teknik dokümanlara aşağıdaki linklerden ulaşabilirsiniz:

- 🟢 [Çözüm 1: VAULT-BOT 9000](writeups/level-1-easy.md)
- 🟡 [Çözüm 2: CORP-ASSISTANT](writeups/level-2-medium.md)
- 🔴 [Çözüm 3: NEMESIS-AI v2.1](writeups/level-3-hard.md)

---

## 📝 Lisans

Bu proje **AltaySec Academy** tarafından eğitim amaçlı açık kaynak olarak geliştirilmiş olup [MIT Lisansı](LICENSE) ile lisanslanmıştır. Dilediğiniz gibi çatallayabilir (fork), değiştirebilir ve eğitimlerinizde kullanabilirsiniz.

<div align="center">
  <i>"Sistemleri korumak için, önce nasıl kırıldıklarını anlamalısın."</i>
</div>
