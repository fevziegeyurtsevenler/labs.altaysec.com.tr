import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================================================
// AlertsChart.jsx
// ----------------------------------------------------------------------------
// İki ayrı görselleştirme sunar:
//   1) TimelineChart -> Çift eksenli (multi-axis) çizgi grafik. Sol eksen
//      toplam alarm hacmini, sağ eksen ise kritik seviye alarm sayısını
//      gösterir. Bu, "genel gürültü" ile "gerçek tehdit" arasındaki farkı
//      görsel olarak ayırt etmeyi sağlar - SOC analistliğinde temel bir
//      tehdit avcılığı (threat hunting) becerisidir.
//   2) SeverityPieChart -> Alarmların önem seviyesine (Kritik/Yüksek/Orta/Düşük)
//      göre dağılımını gösteren pasta grafik.
// Tüm renkler marka paletindeki #ef4444 (kırmızı) tonlarının ağırlıklandırılmış
// versiyonları ve koyu (dark overlay) katmanlarla oluşturulur.
// ============================================================================

const SEVERITY_COLORS = {
  Kritik: "#ef4444",
  Yüksek: "#f87171",
  Orta: "#7f1d1d",
  Düşük: "#3f3f46",
};

// Özel tooltip - tema ile uyumlu koyu panel görünümü
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0d0d10] border border-altayRed/30 rounded-md px-3 py-2 shadow-altayGlow">
      <p className="text-[11px] font-mono text-altayMuted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs font-mono flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TimelineChart({ data }) {
  return (
    <div className="altay-panel rounded-lg p-4 border border-altayBorder h-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Alarm Zaman Çizelgesi</h3>
          <p className="text-[11px] text-altayMuted">Toplam hacim (sol eksen) ve kritik olay sayısı (sağ eksen)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1c1c20" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#6b6b75", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#1c1c20" }} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6b6b75", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#ef4444", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6b6b75" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total"
            name="Toplam Alarm"
            stroke="#7f1d1d"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#7f1d1d" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="high"
            name="Yüksek Seviye"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f87171" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="critical"
            name="Kritik Seviye"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityPieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="altay-panel rounded-lg p-4 border border-altayBorder h-[320px]">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zinc-100">Önem Seviyesi Dağılımı</h3>
        <p className="text-[11px] text-altayMuted">Tampon bellekteki tüm alarmların seviye kırılımı</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="#070709"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#3f3f46"} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            formatter={(value) => {
              const item = data.find((d) => d.name === value);
              const pct = total > 0 ? Math.round(((item?.value || 0) / total) * 100) : 0;
              return `${value} (%${pct})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
