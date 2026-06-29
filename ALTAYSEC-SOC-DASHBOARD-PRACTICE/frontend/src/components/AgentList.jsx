import React, { useEffect, useMemo, useState } from "react";
import { Search, MonitorSmartphone, CircleDot } from "lucide-react";
import { fetchAgents } from "../api";

// ============================================================================
// AgentList.jsx
// ----------------------------------------------------------------------------
// İzlenen tüm ajanların (endpoint) envanterini listeleyen bileşen. Wazuh'ta
// "Agents" ekranı, kurulu izleme yazılımlarının (agent) hangi makinelerde
// çalıştığını ve bunların Manager (sunucu) ile olan bağlantı durumunu gösterir:
//   - active            -> Ajan canlı, düzenli "keep-alive" sinyali gönderiyor
//   - disconnected       -> Ajan bir süre önce bağlantısını kaybetti
//   - never_connected    -> Ajan kuruldu ama hiçbir zaman sunucuya bağlanmadı
// Liste; durum ve serbest metin filtresi ile daraltılabilir, 5 saniyede bir
// otomatik yenilenerek canlı durum değişikliklerini yansıtır.
// ============================================================================

const STATUS_META = {
  active: {
    label: "Aktif",
    dot: "text-altayRed animate-pulseDot",
    badge: "bg-altayRed/15 text-altayRed border-altayRed/40 shadow-altayGlow",
    rowAccent: "border-l-2 border-l-altayRed",
  },
  disconnected: {
    label: "Bağlantı Kesildi",
    dot: "text-zinc-500",
    badge: "bg-zinc-800/40 text-zinc-500 border-zinc-700/50",
    rowAccent: "border-l-2 border-l-zinc-700",
  },
  never_connected: {
    label: "Hiç Bağlanmadı",
    dot: "text-amber-700/70",
    badge: "bg-amber-950/30 text-amber-700/80 border-amber-900/40",
    rowAccent: "border-l-2 border-l-amber-900/50",
  },
};

function timeAgo(isoString) {
  if (!isoString) return "—";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export default function AgentList() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAgents();
        if (!cancelled) {
          setAgents(data.agents);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.ip.includes(term) ||
        a.os.toLowerCase().includes(term) ||
        a.group.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [agents, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return agents.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      { active: 0, disconnected: 0, never_connected: 0 }
    );
  }, [agents]);

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
            placeholder="Ajan adı, IP, işletim sistemi veya grup ara..."
            className="bg-transparent text-xs text-zinc-200 placeholder:text-altayMuted outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { key: "all", label: `Tümü (${agents.length})` },
            { key: "active", label: `Aktif (${statusCounts.active})` },
            { key: "disconnected", label: `Kesildi (${statusCounts.disconnected})` },
            { key: "never_connected", label: `Yeni (${statusCounts.never_connected})` },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={[
                "px-2.5 py-1.5 rounded-md border text-[11px] font-mono transition-colors",
                statusFilter === opt.key
                  ? "bg-altayRed/15 border-altayRed/40 text-altayRed"
                  : "border-altayBorder text-altayMuted hover:text-zinc-200",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto table-scroll-fade">
        <table className="w-full text-left text-xs min-w-[960px]">
          <thead>
            <tr className="text-altayMuted font-mono uppercase text-[10px] tracking-wider border-b border-altayBorder">
              <th className="px-4 py-2.5 font-medium">Ajan</th>
              <th className="px-4 py-2.5 font-medium">Durum</th>
              <th className="px-4 py-2.5 font-medium">IP Adresi</th>
              <th className="px-4 py-2.5 font-medium">İşletim Sistemi</th>
              <th className="px-4 py-2.5 font-medium">Grup</th>
              <th className="px-4 py-2.5 font-medium">Ajan Sürümü</th>
              <th className="px-4 py-2.5 font-medium">Son Sinyal</th>
              <th className="px-4 py-2.5 font-medium">Durum Değişikliği</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-altayMuted">
                  Ajanlar yükleniyor...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-altayMuted">
                  Filtre kriterlerine uyan ajan bulunamadı.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((agent) => {
                const meta = STATUS_META[agent.status] || STATUS_META.disconnected;
                return (
                  <tr
                    key={agent.id}
                    className={`border-b border-altayBorder/60 hover:bg-altayRed/[0.04] transition-colors ${meta.rowAccent}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-white/5 border border-altayBorder flex items-center justify-center">
                          <MonitorSmartphone size={14} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-zinc-200 font-medium">{agent.name}</p>
                          <p className="text-altayMuted font-mono text-[10px]">ID: {agent.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`severity-badge border ${meta.badge}`}>
                        <CircleDot size={10} className={`mr-1 ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-zinc-400">{agent.ip}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{agent.os}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono">{agent.group}</td>
                    <td className="px-4 py-2.5 text-zinc-500 font-mono">{agent.version}</td>
                    <td className="px-4 py-2.5 text-altayMuted">{timeAgo(agent.last_keep_alive)}</td>
                    <td className="px-4 py-2.5 text-altayMuted">{timeAgo(agent.status_changed_at)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
