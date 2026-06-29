import React from "react";
import AgentList from "../components/AgentList";

// ============================================================================
// EndpointAgents.jsx
// ----------------------------------------------------------------------------
// "Uç Nokta Ajanları" görünümü - şirket ağındaki tüm izlenen cihazların
// (sunucu, istasyon, dizüstü) envanterini ve Manager (sunucu) ile olan
// bağlantı sağlık durumunu gösterir. Bir ajanın "disconnected" duruma
// geçmesi, o cihazda izleme körlüğü (visibility gap) oluştuğu anlamına gelir
// ve SOC ekiplerinin öncelikli olarak araştırması gereken bir durumdur.
// ============================================================================

export default function EndpointAgents() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Uç Nokta Ajanları</h2>
        <p className="text-xs text-altayMuted mt-1">
          İzlenen tüm uç nokta (endpoint) cihazlarının envanteri ve canlılık (keep-alive) durumu.
        </p>
      </div>
      <AgentList />
    </div>
  );
}
