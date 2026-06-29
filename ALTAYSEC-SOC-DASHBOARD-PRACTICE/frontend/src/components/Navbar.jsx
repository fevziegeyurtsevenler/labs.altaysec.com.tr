import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ShieldAlert, Terminal, Flame, AlertTriangle, ChevronRight } from "lucide-react";
import { fetchStats, fetchAlerts } from "../api";

// ============================================================================
// Navbar.jsx (v2 - Çalışan Arama ve Bildirim Paneli)
// ----------------------------------------------------------------------------
// Üst navigasyon çubuğu. Sayfa başlığını, anlık saat bilgisini, hızlı arama
// kutusunu ve kritik/yüksek seviyedeki açık alarm sayısını gösteren bir
// "bildirim zili" barındırır.
// ============================================================================

export default function Navbar({ title, subtitle }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [criticalCount, setCriticalCount] = useState(0);

  // --- Arama kutusu state'i ---
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBoxRef = useRef(null);

  // --- Bildirim zili state'i ---
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);

  // Saat göstergesini her saniye güncelle
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Kritik alarm sayacını VE bildirim zili içeriğini (son yüksek/kritik
  // olaylar) periyodik olarak backend'den çek. Böylece zil her açıldığında
  // veri zaten hazırdır, ekstra bir yükleme beklemesi olmaz.
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const [statsData, alertsData] = await Promise.all([
          fetchStats(),
          fetchAlerts({ level: 8, limit: 8 }),
        ]);
        if (!cancelled) {
          setCriticalCount(statsData.alerts.critical);
          setNotifications(alertsData.alerts);
        }
      } catch {
        // Sunucuya geçici olarak erişilemezse sessizce yok say, bir sonraki
        // döngüde tekrar denenecek
      }
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Arama kutusuna yazı yazılırken sunucuyu bombardımana uğratmamak için
  // 300ms'lik bir "debounce" (geciktirme) uyguluyoruz
  useEffect(() => {
    const term = searchValue.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await fetchAlerts({ search: term, limit: 6 });
        setSearchResults(data.alerts);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchValue]);

  // Arama veya bildirim panelinin DIŞINA tıklandığında otomatik kapatılması
  // için tek bir genel (document seviyesinde) dinleyici kullanıyoruz
  useEffect(() => {
    function handleOutsideClick(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const searchDropdownOpen = searchFocused && searchValue.trim().length >= 2;

  // Kullanıcıyı "Güvenlik Olayları" sayfasına, belirtilen KQL sorgusuyla
  // (SearchBar.jsx'in anladığı sözdizimiyle) yönlendirir
  function goToEvents(query) {
    navigate(`/events?q=${encodeURIComponent(query)}`);
    setSearchFocused(false);
    setBellOpen(false);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter" && searchValue.trim()) {
      goToEvents(searchValue.trim());
    }
    if (e.key === "Escape") {
      setSearchFocused(false);
    }
  }

  return (
    <header className="h-16 border-b border-altayBorder bg-altaySurface/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 relative z-40">
      <div className="flex items-center gap-3">
        <div className="md:hidden w-7 h-7 rounded bg-altayRed/10 border border-altayRed/30 flex items-center justify-center">
          <Terminal size={14} className="text-altayRed" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-altayMuted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Hızlı arama kutusu - artık canlı sonuç döndürür ve Güvenlik
            Olayları sayfasına filtreli yönlendirme yapar */}
        <div ref={searchBoxRef} className="relative hidden sm:block">
          <div className="flex items-center gap-2 bg-black/40 border border-altayBorder rounded-md px-3 py-1.5 w-64 focus-within:border-altayRed/50 transition-colors">
            <Search size={14} className="text-altayMuted shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Kural ID, ajan veya IP ara..."
              className="bg-transparent text-xs text-zinc-300 placeholder:text-altayMuted outline-none w-full"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Canlı arama sonuçları açılır paneli */}
          {searchDropdownOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-altaySurface border border-altayRed/30 rounded-lg shadow-altayGlow overflow-hidden">
              {searchLoading && (
                <p className="px-4 py-3 text-xs text-altayMuted font-mono">Aranıyor...</p>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <p className="px-4 py-3 text-xs text-altayMuted">
                  "{searchValue}" için eşleşen olay bulunamadı.
                </p>
              )}
              {!searchLoading &&
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => goToEvents(String(item.rule_id))}
                    className="w-full text-left px-4 py-2.5 border-b border-altayBorder/60 last:border-b-0 hover:bg-altayRed/[0.06] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200 truncate">{item.category}</span>
                      <span className="text-[10px] font-mono text-altayRed shrink-0">Seviye {item.level}</span>
                    </div>
                    <p className="text-[11px] text-altayMuted truncate mt-0.5">
                      {item.agent} · {item.src_ip} · {item.mitre_technique.id}
                    </p>
                  </button>
                ))}
              {!searchLoading && searchResults.length > 0 && (
                <button
                  onClick={() => goToEvents(searchValue.trim())}
                  className="w-full text-center px-4 py-2.5 text-[11px] font-mono text-altayRed hover:bg-altayRed/10 transition-colors flex items-center justify-center gap-1"
                >
                  Tüm sonuçları gör
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sandbox modu rozeti */}
        <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-altayRed/30 bg-altayRed/10 text-altayRed">
          <span className="live-dot" />
          Sandbox Modu
        </span>

        {/* Kritik/yüksek seviye alarm bildirimi - artık gerçek bir içerik listesi sunar */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
              bellOpen ? "border-altayRed/50 bg-altayRed/10" : "border-altayBorder bg-black/30 hover:border-altayRed/40"
            }`}
            aria-label="Kritik alarm bildirimleri"
          >
            <Bell size={16} className={bellOpen ? "text-altayRed" : "text-zinc-400"} />
          </button>
          {criticalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-altayRed text-white text-[10px] font-bold font-mono flex items-center justify-center border-2 border-altaySurface">
              {criticalCount > 99 ? "99+" : criticalCount}
            </span>
          )}

          {/* Bildirim açılır paneli */}
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-altaySurface border border-altayRed/30 rounded-lg shadow-altayGlow overflow-hidden">
              <div className="px-4 py-3 border-b border-altayBorder flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-100">Önemli Bildirimler</h3>
                <span className="text-[10px] font-mono text-altayMuted">Seviye 8 ve üzeri</span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-xs text-altayMuted text-center">
                    Şu anda yüksek veya kritik seviyede açık olay yok.
                  </p>
                )}
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => goToEvents(String(item.rule_id))}
                    className="w-full text-left px-4 py-2.5 border-b border-altayBorder/60 last:border-b-0 hover:bg-altayRed/[0.06] transition-colors flex items-start gap-2.5"
                  >
                    {item.level >= 12 ? (
                      <Flame size={14} className="text-altayRed shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-200 truncate">{item.category}</span>
                        <span className="text-[10px] font-mono text-altayRed shrink-0">Sv {item.level}</span>
                      </div>
                      <p className="text-[11px] text-altayMuted truncate mt-0.5">{item.agent}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToEvents("level:8")}
                className="w-full text-center px-4 py-2.5 text-[11px] font-mono text-altayRed hover:bg-altayRed/10 transition-colors border-t border-altayBorder flex items-center justify-center gap-1"
              >
                Tümünü gör
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Saat / tarih bilgisi */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-400 border-l border-altayBorder pl-4">
          <ShieldAlert size={14} className="text-altayRed/70" />
          {now.toLocaleTimeString("tr-TR")}
        </div>
      </div>
    </header>
  );
}
