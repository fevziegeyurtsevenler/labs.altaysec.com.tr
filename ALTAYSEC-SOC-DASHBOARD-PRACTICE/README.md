# AltaySec — SIEM Eğitim Sandbox

AltaySec, **Wazuh Dashboard**'ın arayüz ve operasyonel mantığını taklit eden, tamamen
sentetik (mock) verilerle çalışan bir eğitim platformudur. Sanal makine veya gerçek
bir Wazuh Manager kurmadan; Blue Team operasyonlarını, tehdit avcılığını (threat
hunting) ve SIEM arayüzlerinin nasıl okunacağını öğrenmek isteyenler için tasarlanmıştır.

> ⚠️ Bu proje **gerçek bir güvenlik izleme aracı değildir**. Tüm ajanlar, alarmlar ve
> IP adresleri rastgele üretilir ve hiçbir gerçek ağ/sistem ile bağlantısı yoktur.

## Mimari

```
AltaySec/
├── backend/                  # Express.js mock SIEM API sunucusu
│   ├── server.js              # /api/stats, /api/alerts, /api/agents endpointleri
│   └── package.json
└── frontend/                  # React + Vite + Tailwind + Recharts arayüzü
    ├── src/
    │   ├── components/         # Navbar, Sidebar, MetricCard, AlertsChart, LogTable,
    │   │                         AgentList, LogDetailModal, SearchBar, AlertToast
    │   ├── pages/               # DashboardOverview, SecurityEvents, EndpointAgents
    │   ├── api.js                # Backend ile konuşan fetch katmanı
    │   └── App.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

## Özellikler

- **Canlı alarm üretimi**: Backend her 3 saniyede bir, MITRE ATT&CK teknikleriyle
  eşleştirilmiş (SQL Enjeksiyonu, XSS, RCE, SSH Kaba Kuvvet, Fidye Yazılımı,
  Pass-the-Hash, Yetki Yükseltme, Oltalama, PowerShell vb.) gerçekçi bir güvenlik
  olayı üretir.
- **Genel Bakış**: Ajan sağlığı, alarm hacmi, kritik tehdit sayısı, zaman çizelgesi
  grafiği, önem seviyesi pasta grafiği, en sık görülen MITRE teknikleri ve kritik
  olaylar için gerçek zamanlı ekran bildirimleri (toast).
- **Güvenlik Olayları**: KQL benzeri tehdit avcılığı arama çubuğu (`level:12`,
  `mitre:T1486`, `agent_ip:10.0.0.10`), sayfalanmış ve filtrelenebilir canlı log
  tablosu, tıklanabilir satırlardan açılan "Log Detayı" paneli (Tablo/JSON görünümü).
- **Uç Nokta Ajanları**: İzlenen tüm cihazların bağlantı durumu (Aktif / Bağlantı
  Kesildi / Hiç Bağlanmadı) ile envanteri.
- **Üst Çubuk**: Çalışan canlı arama (sonuç önizlemeli) ve gerçek içerik gösteren
  bildirim zili.
- **Tema**: Katı koyu mod (#070709) zemin üzerinde kırmızı (#ef4444) vurgu rengi,
  Inter (arayüz) ve JetBrains Mono (veri/log) tipografisi.

## Kurulum ve Çalıştırma

### 1) Backend (API sunucusu)

```bash
cd backend
npm install
npm start          # http://localhost:4000 adresinde çalışır
# Geliştirme için otomatik yeniden başlatma: npm run dev
```

### 2) Frontend (React arayüzü)

Backend çalışırken, **ayrı bir terminalde**:

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173 adresinde çalışır
```

Vite geliştirme sunucusu, `/api` ile başlayan tüm istekleri otomatik olarak
`http://localhost:4000` adresindeki backend'e yönlendirir (bkz. `vite.config.js`).

### 3) Production build

```bash
cd frontend
npm run build       # dist/ klasörüne statik dosyalar üretir
npm run preview      # üretilen build'i yerel olarak önizler
```

## API Referansı

| Endpoint | Açıklama |
|---|---|
| `GET /api/stats` | Gösterge paneli için özet metrikler, zaman çizelgesi ve dağılım verileri |
| `GET /api/alerts` | Filtrelenebilir alarm listesi (`limit`, `level`, `category`, `search`, `mitre`, `agent_ip`) |
| `GET /api/alerts/:id` | Tek bir alarmın tam (derinlemesine) detayı |
| `GET /api/alerts/categories` | Mevcut alarm kategorilerinin listesi |
| `GET /api/agents` | İzlenen tüm ajanların (endpoint) listesi ve durumu |

## Eğitim Amaçlı Kullanım Notları

Bu sandbox, aşağıdaki kavramları uygulamalı öğrenmek için uygundur:

- Wazuh'un 1–15 arası alarm önem seviyesi (level) skalası
- MITRE ATT&CK taktik/teknik haritalama mantığı
- KQL benzeri yapılandırılmış sorgu sözdizimiyle tehdit avcılığı (threat hunting)
- SOC analistlerinin günlük olarak kullandığı filtreleme ve arama desenleri
- Ajan tabanlı (agent-based) izleme mimarisinin temel kavramları (keep-alive,
  bağlantı kaybı, hiçbir zaman bağlanmama durumları)
