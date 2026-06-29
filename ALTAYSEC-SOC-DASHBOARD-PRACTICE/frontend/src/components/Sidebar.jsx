import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldHalf, LayoutDashboard, ListTree, ServerCog, Radio } from "lucide-react";

// ============================================================================
// Sidebar.jsx
// ----------------------------------------------------------------------------
// Sol navigasyon paneli. Wazuh'un klasik sol menü anlayışına benzer şekilde,
// kullanıcıyı 3 ana operasyonel görünüme yönlendirir:
//   1) Genel Bakış        -> Genel SOC durum özeti (metrikler + grafikler)
//   2) Güvenlik Olayları   -> Ham/filtrelenebilir alarm/log akışı
//   3) Uç Nokta Ajanları   -> İzlenen ajan (endpoint) filosunun envanteri
// ============================================================================

const NAV_ITEMS = [
  { to: "/", label: "Genel Bakış", icon: LayoutDashboard, end: true },
  { to: "/events", label: "Güvenlik Olayları", icon: ListTree },
  { to: "/agents", label: "Uç Nokta Ajanları", icon: ServerCog },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-altayBorder bg-altaySurface shrink-0">
      {/* Marka başlığı - tıklanınca ana sayfaya (Genel Bakış) döner */}
      <NavLink
        to="/"
        aria-label="Ana sayfaya dön - Genel Bakış"
        className="flex items-center gap-2.5 px-5 h-16 border-b border-altayBorder hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-8 h-8 rounded-md bg-altayRed/10 border border-altayRed/30 flex items-center justify-center shrink-0">
          <ShieldHalf size={18} className="text-altayRed" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-zinc-100 tracking-tight text-[15px]">
            Altay<span className="text-altayRed">Sec</span>
          </p>
          <p className="text-[10px] text-altayMuted font-mono tracking-wide uppercase">Eğitim SOC Ortamı</p>
        </div>
      </NavLink>

      {/* Ana navigasyon listesi */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-altayMuted">
          Operasyonlar
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 border",
                isActive
                  ? "bg-altayRed/10 text-altayRed border-altayRed/30 shadow-altayGlow"
                  : "text-zinc-400 border-transparent hover:bg-white/5 hover:text-zinc-100",
              ].join(" ")
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}

        <p className="px-3 mt-6 mb-2 text-[10px] font-mono uppercase tracking-widest text-altayMuted">
          Durum
        </p>
        <div className="px-3 py-2.5 rounded-md border border-altayBorder bg-black/30 flex items-center gap-2 text-xs text-zinc-400">
          <Radio size={14} className="text-altayRed animate-pulseDot" />
          Canlı Log Akışı Aktif
        </div>
      </nav>
    </aside>
  );
}
