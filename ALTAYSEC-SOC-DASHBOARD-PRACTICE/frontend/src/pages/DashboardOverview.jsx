import React, { useEffect, useRef, useState } from "react";
import { Server, ShieldAlert, Activity, Flame, Crosshair } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { TimelineChart, SeverityPieChart } from "../components/AlertsChart";
import AlertToast from "../components/AlertToast";
import LogDetailModal from "../components/LogDetailModal";
import { fetchStats, fetchAlerts } from "../api";

// ============================================================================
// DashboardOverview.jsx
// ----------------------------------------------------------------------------
// SOC gösterge panelinin ana sayfası.
// Ajan sağlığı, alarm hacmi, kritik tehdit sayısı ve
// en sık gözlemlenen MITRE ATT&CK teknikleri tek bir ekranda toplanır.
// Veri her 5 saniyede bir tazelenerek canlı izleme hissi korunur.
//
// Bu sayfa artık arka planda her 4 saniyede bir KRİTİK seviye (level >= 12)
// olayları kontrol eder. Sayfa ilk açıldığında mevcut kritik olaylar sessizce
// "görülmüş" olarak işaretlenir (spam önlemek için); bundan SONRA backend'in
// ürettiği her YENİ kritik olay için ekranın sağ üstünde bir AlertToast
// bildirimi belirir. Bildirime tıklamak, o olayın tam detayını LogDetailModal
// panelinde açar - böylece analist saniyeler içinde "fark et -> incele"
// akışını tamamlayabilir.
// ============================================================================

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);

  // --- Gerçek zamanlı kritik bildirim sistemi için state ve referanslar ---
  const [toasts, setToasts] = useState([]); // Ekranda gösterilen aktif bildirimler
  const [selectedAlert, setSelectedAlert] = useState(null); // Bildirimden açılan Log Detay paneli
  // seenIdsRef: Daha önce "görülmüş" (zaten bildirim olarak gösterilmiş veya
  // sayfa açılırken zaten mevcut olan) kritik olay ID'lerini tutar. null
  // olması "henüz ilk yükleme yapılmadı" anlamına gelir
  const seenIdsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchStats();
        if (!cancelled) setStats(data);
      } catch {
        // Sunucuya erişilemezse mevcut veriyle devam et, sonraki turda yeniden dene
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Kritik seviye (level >= 12) olayları periyodik olarak kontrol eden ayrı
  // bir izleme döngüsü. Stats döngüsünden bilerek AYRI tutuldu: bu sayede
  // bildirim mantığı, genel istatistik yenileme hızından bağımsız olarak
  // backend'in alarm üretim hızına (3 saniye) daha yakın bir duyarlılıkla çalışır.
  useEffect(() => {
    let cancelled = false;

    async function pollCriticalAlerts() {
      try {
        const data = await fetchAlerts({ level: 12, limit: 15 });
        if (cancelled) return;
        const incoming = data.alerts;

        if (seenIdsRef.current === null) {
          // İlk yükleme: sayfa açıldığında zaten var olan kritik olayları
          // bildirim olarak GÖSTERME - sadece "görülmüş" listesine ekle.
          // Aksi halde sayfa her açıldığında geçmiş olaylar için spam oluşurdu.
          seenIdsRef.current = new Set(incoming.map((a) => a.id));
          return;
        }

        const freshOnes = incoming.filter((a) => !seenIdsRef.current.has(a.id));
        if (freshOnes.length === 0) return;

        freshOnes.forEach((a) => seenIdsRef.current.add(a.id));

        setToasts((prev) => {
          const newToasts = freshOnes.slice(0, 4).map((a) => ({
            key: `${a.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            alert: a,
          }));
          // Aynı anda ekranda en fazla 4 bildirim tutulur - SOC ekranı
          // bildirim yığınıyla (notification spam) boğulmamalı
          return [...newToasts, ...prev].slice(0, 4);
        });
      } catch {
        // Sunucuya geçici erişilemezlik durumunda sessizce yok say
      }
    }

    pollCriticalAlerts();
    const interval = setInterval(pollCriticalAlerts, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Bir bildirim otomatik veya manuel olarak kapandığında listeden çıkar
  function dismissToast(key) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }

  if (!stats) {
    return (
      <div className="p-6 text-altayMuted text-sm font-mono">Gösterge paneli verisi yükleniyor...</div>
    );
  }

  return (
    <>
      {/* Gerçek zamanlı kritik bildirim yığını - ekranın sağ üst köşesinde sabit */}
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-3 w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
        {toasts.map((t) => (
          <AlertToast
            key={t.key}
            alert={t.alert}
            onDismiss={() => dismissToast(t.key)}
            onView={() => {
              setSelectedAlert(t.alert);
              dismissToast(t.key);
            }}
          />
        ))}
      </div>

      {/* Bildirimden açılan Log Detay paneli - LogTable.jsx'teki aynı bileşen
          burada da yeniden kullanılır, böylece tutarlı bir inceleme deneyimi sağlanır */}
      <LogDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />

      <div className="p-6 space-y-6">
      {/* Üst satır: temel metrik kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Toplam İzlenen Ajan"
          value={stats.agents.total}
          icon={Server}
          tone="neutral"
          trendLabel={`${stats.agents.active} aktif / ${stats.agents.disconnected} bağlantı kesildi`}
          trend="flat"
        />
        <MetricCard
          label="Aktif Ajan Oranı"
          value={`%${Math.round((stats.agents.active / stats.agents.total) * 100)}`}
          icon={Activity}
          tone="neutral"
          trendLabel={`${stats.agents.neverConnected} ajan hiçbir zaman bağlanmadı`}
          trend="flat"
        />
        <MetricCard
          label="Toplam Alarm (Tampon)"
          value={stats.alerts.total}
          icon={ShieldAlert}
          tone="warning"
          trendLabel="Son 500 olayı kapsayan tampon bellek"
          trend="up"
        />
        <MetricCard
          label="Kritik Seviye Alarm"
          value={stats.alerts.critical}
          icon={Flame}
          tone="danger"
          trendLabel="Level 12-15 arası, acil müdahale gerektirir"
          trend="up"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TimelineChart data={stats.timeline} />
        </div>
        <SeverityPieChart data={stats.severityDistribution} />
      </div>

      {/* Alt satır: MITRE teknikleri ve kategori dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="altay-panel rounded-lg border border-altayBorder p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair size={15} className="text-altayRed" />
            <h3 className="text-sm font-semibold text-zinc-100">En Sık Görülen MITRE ATT&CK Teknikleri</h3>
          </div>
          <div className="space-y-2.5">
            {stats.topMitreTechniques.map((t) => {
              const maxCount = stats.topMitreTechniques[0]?.count || 1;
              const widthPct = Math.max(8, Math.round((t.count / maxCount) * 100));
              return (
                <div key={t.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-zinc-300">
                      {t.id} <span className="text-altayMuted">· {t.name}</span>
                    </span>
                    <span className="font-mono text-altayRed">{t.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-altayRedDark to-altayRed rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-altayMuted mt-0.5">{t.tactic}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="altay-panel rounded-lg border border-altayBorder p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={15} className="text-altayRed" />
            <h3 className="text-sm font-semibold text-zinc-100">Kategoriye Göre Alarm Dağılımı</h3>
          </div>
          <div className="space-y-2.5">
            {stats.categoryDistribution
              .sort((a, b) => b.value - a.value)
              .map((cat) => {
                const maxVal = Math.max(...stats.categoryDistribution.map((c) => c.value), 1);
                const widthPct = Math.max(8, Math.round((cat.value / maxVal) * 100));
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300">{cat.name}</span>
                      <span className="font-mono text-altayMuted">{cat.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-altayRedSoft to-altayRed/70 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
