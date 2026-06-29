import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardOverview from "./pages/DashboardOverview";
import SecurityEvents from "./pages/SecurityEvents";
import EndpointAgents from "./pages/EndpointAgents";

// ============================================================================
// App.jsx
// ----------------------------------------------------------------------------
// Uygulamanın ana iskeleti (layout). Sol tarafta sabit Sidebar, üst tarafta
// Navbar ve ortada aktif rotaya göre değişen sayfa içeriği (Outlet benzeri
// Routes bloğu) yer alır. Her sayfa, Navbar'da gösterilecek başlık/alt-başlığı
// PAGE_META haritasından alır.
// ============================================================================

const PAGE_META = {
  "/": { title: "Genel Bakış", subtitle: "Genel SOC durum özeti" },
  "/events": { title: "Güvenlik Olayları", subtitle: "Canlı alarm ve log akışı" },
  "/agents": { title: "Uç Nokta Ajanları", subtitle: "İzlenen cihaz envanteri" },
};

export default function App() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: "AltaySec", subtitle: "" };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-altayBg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/events" element={<SecurityEvents />} />
            <Route path="/agents" element={<EndpointAgents />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
