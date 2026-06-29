import React, { useEffect, useRef, useState } from "react";
import { Flame, X, ChevronRight } from "lucide-react";

// ============================================================================
// AlertToast.jsx
// ----------------------------------------------------------------------------
// Yüksek Önemli (Kritik) Gerçek Zamanlı Bildirim Bileşeni.
//
// Backend'de yeni bir KRİTİK seviye (level >= 12) olay üretildiğinde - örn.
// Fidye Yazılımı, RCE veya Yetki Yükseltme - bu bildirim ekranın sağ üst
// köşesinde anında belirir. Gerçek bir SOC analistinin SIEM ekranında
// görmeyi beklediği "acil müdahale" uyarısını taklit eder.
//
// Özellikleri:
//   - Sağdan kayarak giriş animasyonu
//   - Otomatik kapanma için geri sayan bir ilerleme çubuğu (progress bar)
//   - Tıklanınca "Log Details" panelini açabilmesi için onView geri çağrısı
//   - Manuel kapatma (X) butonu
//
// Props:
//   alert      -> Gösterilecek alarm nesnesi (rule_id, level, category, vb.)
//   onDismiss  -> Bildirim kapandığında (otomatik veya manuel) çağrılır
//   onView     -> Bildirime tıklanınca çağrılır (detay panelini açmak için)
//   duration   -> Bildirimin ekranda kalma süresi (ms), varsayılan 6500ms
// ============================================================================

export default function AlertToast({ alert, onDismiss, onView, duration = 6500 }) {
  const [mounted, setMounted] = useState(false);
  const [remainingPct, setRemainingPct] = useState(100);
  const dismissTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const startRef = useRef(Date.now());

  // Giriş animasyonunu bir sonraki render döngüsünde tetikle (CSS transition
  // için başlangıç ve bitiş durumlarının ayrı render'larda olması gerekir)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Otomatik kapanma zamanlayıcısı ve ilerleme çubuğu güncellemesi
  useEffect(() => {
    startRef.current = Date.now();

    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    // İlerleme çubuğunu 100ms aralıklarla güncelle - akıcı bir geri sayım hissi verir
    tickTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setRemainingPct(pct);
    }, 100);

    return () => {
      clearTimeout(dismissTimerRef.current);
      clearInterval(tickTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id]);

  function handleDismiss() {
    clearTimeout(dismissTimerRef.current);
    clearInterval(tickTimerRef.current);
    setMounted(false);
    // Çıkış animasyonunun (250ms) tamamlanması
    setTimeout(() => onDismiss(), 250);
  }

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full sm:w-96 bg-altaySurface border border-altayRed/40 rounded-lg shadow-altayGlow overflow-hidden transition-all duration-250 ease-out ${
        mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <button
        onClick={() => onView?.()}
        className="w-full text-left p-3.5 flex items-start gap-3 hover:bg-altayRed/[0.05] transition-colors"
      >
        <div className="w-9 h-9 rounded-md bg-altayRed/15 border border-altayRed/40 flex items-center justify-center shrink-0 animate-pulseDot">
          <Flame size={17} className="text-altayRed" strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-altayRed">
              KRİTİK OLAY · Seviye {alert.level}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-100 truncate">{alert.category}</p>
          <p className="text-[11px] text-altayMuted mt-0.5 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-zinc-500">
            <span>{alert.agent}</span>
            <span className="text-altayBorder">•</span>
            <span>{alert.mitre_technique.id}</span>
            <span className="text-altayBorder">•</span>
            <span className="flex items-center gap-0.5 text-altayRed/80">
              Detay <ChevronRight size={10} />
            </span>
          </div>
        </div>

        <span
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          role="button"
          aria-label="Bildirimi kapat"
          className="w-6 h-6 rounded flex items-center justify-center text-altayMuted hover:text-zinc-200 shrink-0"
        >
          <X size={13} />
        </span>
      </button>

      {/* Otomatik kapanma ilerleme çubuğu */}
      <div className="h-[3px] bg-black/40">
        <div
          className="h-full bg-gradient-to-r from-altayRedDark to-altayRed transition-[width] duration-100 linear"
          style={{ width: `${remainingPct}%` }}
        />
      </div>
    </div>
  );
}
