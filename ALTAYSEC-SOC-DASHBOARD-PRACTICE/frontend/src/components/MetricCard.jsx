import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

// ============================================================================
// MetricCard.jsx
// ----------------------------------------------------------------------------
// Tekrar kullanılabilir "taktiksel kart" bileşeni. Bir SOC gösterge panelinde
// her metrik (örn. Toplam Ajan, Kritik Alarm, Aktif Tehdit) için sayısal
// değer, ikon ve analitik bir alt-etiket (trend/oran bilgisi) gösterir.
//
// Props:
//   label    -> Metriğin başlığı (örn. "Kritik Seviye Alarm")
//   value    -> Ana sayısal değer
//   icon     -> lucide-react ikon bileşeni
//   trend    -> "up" | "down" | "flat" (sub-label yanında ok yönünü belirler)
//   trendLabel -> Alt etiket metni (örn. "son 1 saatte +12%")
//   tone     -> "danger" | "warning" | "neutral" - vurgu rengini belirler
// ============================================================================

const TONE_STYLES = {
  danger: {
    border: "border-altayRed/30",
    iconBg: "bg-altayRed/10",
    iconColor: "text-altayRed",
    glow: "hover:shadow-altayGlow",
  },
  warning: {
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "hover:shadow-[0_0_24px_0_rgba(245,158,11,0.15)]",
  },
  neutral: {
    border: "border-altayBorder",
    iconBg: "bg-white/5",
    iconColor: "text-zinc-300",
    glow: "",
  },
};

const TREND_ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

export default function MetricCard({
  label,
  value,
  icon: Icon,
  trend = "flat",
  trendLabel,
  tone = "neutral",
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.neutral;
  const TrendIcon = TREND_ICON[trend] || Minus;
  const trendColor =
    trend === "up" ? "text-altayRed" : trend === "down" ? "text-emerald-400" : "text-altayMuted";

  return (
    <div
      className={`altay-panel rounded-lg p-4 border ${style.border} transition-shadow duration-200 ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-altayMuted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-50 font-mono tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-md flex items-center justify-center ${style.iconBg}`}>
            <Icon size={17} className={style.iconColor} strokeWidth={2.1} />
          </div>
        )}
      </div>

      {trendLabel && (
        <div className={`mt-3 flex items-center gap-1 text-[11px] ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
