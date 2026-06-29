import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, RefreshCw, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { fetchAlerts, fetchCategories } from "../api";
import LogDetailModal from "./LogDetailModal";

// ============================================================================
// LogTable.jsx (Sayfalama + SearchBar Entegrasyonu)
// ----------------------------------------------------------------------------
// Güvenlik olaylarını (logları) listeleyen, kendi veri çekme ve filtreleme
// mantığını barındıran bağımsız bir bileşendir. Gerçek bir SIEM arayüzündeki
// "Güvenlik Olayları" ekranına benzer şekilde:
//   - Önem seviyesine (level) göre renk kodlaması yapar
//   - Serbest metin araması (ajan adı, IP, açıklama, kural ID, MITRE kodu) sunar
//   - Minimum seviye ve kategori filtreleriyle daraltma yapar
//   - 3 saniyede bir backend'den taze veri çekerek "canlı akış" hissi verir
//   - Her satır tıklanabilir; seçilen olay LogDetailModal panelinde açılır
//
//   1) SAYFALAMA (PAGINATION): Backend'den çekilen olay havuzu (varsayılan
//      150 kayıt) artık TEK SEFERDE DOM'a basılmıyor. Bunun yerine
//      `ROWS_PER_PAGE` (15) büyüklüğünde sayfalara bölünüyor ve kullanıcı
//      "Önceki/Sonraki" butonlarıyla gezinebiliyor. Bu, her 3 saniyede bir
//      yeni log eklenmesine rağmen DOM'un (ve tarayıcının) aşırı büyümesini
//      ve yavaşlamasını önler - gerçek bir SOC aracının temel gereksinimidir.
//   2) externalQuery PROP'U: Üst bileşenden (örn. SecurityEvents.jsx) gelen,
//      SearchBar.jsx tarafından üretilmiş yapılandırılmış sorgu nesnesini
//      (level/mitre/agent_ip/search) kabul eder ve kendi iç filtreleriyle
//      BİRLEŞTİRİR. Böylece KQL-benzeri arama çubuğu ile mevcut açılır
//      menü filtreleri aynı anda, birbiriyle uyumlu şekilde çalışır.
//
// Prop:
//   pageSize     -> Backend'den TEK SEFERDE çekilecek maksimum kayıt sayısı
//                    (sayfalama havuzunun büyüklüğü, varsayılan 150)
//   rowsPerPage  -> Bir ekran sayfasında gösterilecek satır sayısı (varsayılan 15)
//   liveMode     -> true ise periyodik olarak otomatik yenilenir (varsayılan true)
//   externalQuery -> SearchBar.jsx'ten gelen { search, level, mitre, agent_ip } nesnesi
// ============================================================================

// Önem seviyesine göre (Wazuh'un 1-15 skalasına uygun) görsel sınıflandırma
function getSeverityMeta(level) {
  if (level >= 12) {
    return { label: "KRİTİK", className: "bg-altayRed/20 text-altayRed border-altayRed/40" };
  }
  if (level >= 8) {
    return { label: "YÜKSEK", className: "bg-altayRed/10 text-red-300 border-altayRed/25" };
  }
  if (level >= 4) {
    return { label: "ORTA", className: "bg-amber-500/10 text-amber-300 border-amber-500/25" };
  }
  return { label: "DÜŞÜK", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25" };
}

const LEVEL_FILTERS = [
  { label: "Tüm Seviyeler", value: "" },
  { label: "Kritik (12-15)", value: "12" },
  { label: "Yüksek (8-15)", value: "8" },
  { label: "Orta (4-15)", value: "4" },
];

const ROWS_PER_PAGE_DEFAULT = 15;

export default function LogTable({ pageSize = 150, rowsPerPage = ROWS_PER_PAGE_DEFAULT, liveMode = true, externalQuery = null }) {
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Hangi olayın "Log Detay" panelinde açık olduğunu tutan tek state -
  // null ise panel kapalı, bir alarm nesnesi ise panel o veriyle açık demektir
  const [selectedAlert, setSelectedAlert] = useState(null);

  // --- Sayfalama (pagination) state'i ---
  // Şu anda görüntülenen sayfa numarası (1'den başlar)
  const [currentPage, setCurrentPage] = useState(1);

  // Kategori listesini bir kez çek
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Arama kutusuna yazı yazılırken sunucuyu bombardımana uğratmamak için
  // 350ms'lik bir "debounce" (geciktirme) uyguluyoruz
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // SearchBar'dan (externalQuery) gelen yapılandırılmış alanları, bu
  // bileşenin kendi iç filtreleriyle birleştirerek backend'e gönderilecek
  // NİHAİ sorgu parametrelerini hesaplar. "level" için ikisinden BÜYÜK
  // OLANI (en kısıtlayıcı filtre) kullanılır; "search" alanları ise
  // boşluk ile birleştirilerek her ikisi de aranır.
  const effectiveParams = useMemo(() => {
    const internalLevel = levelFilter ? parseInt(levelFilter, 10) : undefined;
    const externalLevel = externalQuery?.level ? parseInt(externalQuery.level, 10) : undefined;
    const combinedLevel =
      internalLevel !== undefined || externalLevel !== undefined
        ? Math.max(internalLevel || 0, externalLevel || 0)
        : undefined;

    const combinedSearch = [debouncedSearch, externalQuery?.search].filter(Boolean).join(" ") || undefined;

    return {
      level: combinedLevel,
      category: categoryFilter,
      search: combinedSearch,
      mitre: externalQuery?.mitre || undefined,
      agent_ip: externalQuery?.agent_ip || undefined,
    };
  }, [levelFilter, categoryFilter, debouncedSearch, externalQuery]);

  // Filtreler değiştiğinde sayfa 1'e dön - aksi halde kullanıcı 5. sayfadayken
  // filtre değişip sonuç sayısı 2 sayfaya düştüğünde "boş" bir ekranda kalabilir
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveParams]);

  // Filtreler değiştiğinde veya canlı mod açıksa periyodik olarak veri çek
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAlerts({
          limit: pageSize,
          level: effectiveParams.level,
          category: effectiveParams.category,
          search: effectiveParams.search,
          mitre: effectiveParams.mitre,
          agent_ip: effectiveParams.agent_ip,
        });
        if (!cancelled) {
          setAlerts(data.alerts);
          setLastUpdated(new Date());
          setLoading(false);

          // Eğer detay paneli açıkken arka planda liste yenilenirse, seçili
          // olayı da güncel veriyle tazeleyelim (id eşleşirse) - böylece
          // panel açıkken canlı akış devam ettiğinde veri "donmuş" gibi kalmaz
          if (selectedAlert) {
            const stillExists = data.alerts.find((a) => a.id === selectedAlert.id);
            if (stillExists) setSelectedAlert(stillExists);
          }
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    if (!liveMode) return () => {};
    const interval = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // selectedAlert bilerek bağımlılıklara eklenmedi: sadece referans için
    // okunuyor, değişimi yeniden veri çekmeyi tetiklememeli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, effectiveParams, liveMode]);

  // --- Sayfalama hesaplamaları ---
  // Toplam sayfa sayısı: en az 1 sayfa olmalı (boş liste durumunda bile)
  const totalPages = Math.max(1, Math.ceil(alerts.length / rowsPerPage));

  // Eğer filtre değişikliğiyle toplam sayfa sayısı azalırsa ve kullanıcı artık
  // var olmayan bir sayfadaysa, son sayfaya geri çek
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Sadece GÜNCEL SAYFAYA ait satırları DOM'a basacak alt küme (slice)
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return alerts.slice(start, start + rowsPerPage);
  }, [alerts, currentPage, rowsPerPage]);

  const rangeLabel = useMemo(() => {
    if (alerts.length === 0) return "0 olay görüntüleniyor";
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, alerts.length);
    return `${start}-${end} / ${alerts.length} olay görüntüleniyor`;
  }, [alerts.length, currentPage, rowsPerPage]);

  return (
    <div className="altay-panel rounded-lg border border-altayBorder overflow-hidden">
      {/* Filtre çubuğu */}
      <div className="p-4 border-b border-altayBorder flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-black/20">
        <div className="flex flex-1 items-center gap-2 bg-black/40 border border-altayBorder rounded-md px-3 py-2 max-w-md">
          <Search size={14} className="text-altayMuted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ajan, IP, kural ID veya MITRE kodu ara..."
            className="bg-transparent text-xs text-zinc-200 placeholder:text-altayMuted outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-altayMuted text-xs">
            <Filter size={13} />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-black/40 border border-altayBorder text-xs text-zinc-300 rounded-md px-2.5 py-2 outline-none focus:border-altayRed/50"
          >
            {LEVEL_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/40 border border-altayBorder text-xs text-zinc-300 rounded-md px-2.5 py-2 outline-none focus:border-altayRed/50"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-[11px] text-altayMuted font-mono pl-1">
            <RefreshCw size={12} className={liveMode ? "animate-spin [animation-duration:2.5s]" : ""} />
            {lastUpdated ? lastUpdated.toLocaleTimeString("tr-TR") : "--:--:--"}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-[11px] text-altayMuted font-mono border-b border-altayBorder flex items-center justify-between">
        <span>{rangeLabel}</span>
        <span className="text-altayMuted/70 hidden sm:inline">Detaylarını görmek için bir satıra tıklayın</span>
      </div>

      {/* Veri tablosu - yatay kaydırılabilir (mobil/dar ekran uyumu) */}
      <div className="overflow-x-auto table-scroll-fade">
        <table className="w-full text-left text-xs min-w-[1040px]">
          <thead>
            <tr className="text-altayMuted font-mono uppercase text-[10px] tracking-wider border-b border-altayBorder">
              <th className="px-4 py-2.5 font-medium">Zaman</th>
              <th className="px-4 py-2.5 font-medium">Seviye</th>
              <th className="px-4 py-2.5 font-medium">Ajan</th>
              <th className="px-4 py-2.5 font-medium">Kural ID</th>
              <th className="px-4 py-2.5 font-medium">MITRE Teknik</th>
              <th className="px-4 py-2.5 font-medium">Açıklama</th>
              <th className="px-4 py-2.5 font-medium">Kaynak IP</th>
              <th className="px-4 py-2.5 font-medium">Hedef</th>
              <th className="px-4 py-2.5 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-altayMuted">
                  Olaylar yükleniyor...
                </td>
              </tr>
            )}
            {!loading && alerts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-altayMuted">
                  Filtre kriterlerine uyan olay bulunamadı.
                </td>
              </tr>
            )}
            {!loading &&
              paginatedAlerts.map((alert) => {
                const sev = getSeverityMeta(alert.level);
                const isSelected = selectedAlert?.id === alert.id;
                return (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedAlert(alert);
                    }}
                    aria-label={`${alert.category} olayının detaylarını göster`}
                    className={[
                      "border-b border-altayBorder/60 cursor-pointer transition-colors",
                      isSelected ? "bg-altayRed/[0.08]" : "hover:bg-altayRed/[0.04]",
                    ].join(" ")}
                  >
                    <td className="px-4 py-2.5 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleTimeString("tr-TR")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`severity-badge border ${sev.className}`}>
                        {sev.label} · {alert.level}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 font-medium whitespace-nowrap">{alert.agent}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-400">{alert.rule_id}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-altayRed/90">{alert.mitre_technique.id}</span>
                      <span className="text-altayMuted"> · {alert.mitre_technique.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 max-w-md">{alert.description}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-400 whitespace-nowrap">{alert.src_ip}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-500 whitespace-nowrap">
                      {alert.dest_ip}
                      {alert.dest_port ? `:${alert.dest_port}` : ""}
                    </td>
                    <td className="px-4 py-2.5 text-altayMuted">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Sayfalama (Pagination) kontrolleri */}
      <div className="px-4 py-3 border-t border-altayBorder flex items-center justify-between bg-black/20">
        <span className="text-[11px] text-altayMuted font-mono">
          Sayfa {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono rounded-md border border-altayBorder text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-altayRed/40 hover:text-altayRed transition-colors"
          >
            <ChevronLeft size={12} />
            Önceki
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono rounded-md border border-altayBorder text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-altayRed/40 hover:text-altayRed transition-colors"
          >
            Sonraki
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {alerts.some((a) => a.level >= 12) && (
        <div className="px-4 py-2.5 border-t border-altayRed/20 bg-altayRed/5 flex items-center gap-2 text-[11px] text-altayRed">
          <AlertTriangle size={13} />
          Listede kritik seviyede (level 12+) açık olay bulunuyor - öncelikli inceleme önerilir.
        </div>
      )}

      {/* Log Detay Paneli - seçili olay varsa açılır, kapatıldığında selectedAlert null'a döner */}
      <LogDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
}
