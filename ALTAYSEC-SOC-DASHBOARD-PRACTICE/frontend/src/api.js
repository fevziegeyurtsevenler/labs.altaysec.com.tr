// ============================================================================
// API İstemci Katmanı (Çift Mod Destekli)
// ----------------------------------------------------------------------------
// Backend (Express) sunucusu aktifse istekleri doğrudan oraya atar. Eğer
// backend kapalıysa veya static server üzerindeysek (örn: github pages veya
// labs.altaysec.com.tr), otomatik olarak mockData.js üzerindeki in-browser
// veri motorunu kullanarak tamamen serverless çalışır.
// ============================================================================

import * as mockData from "./mockData";

const BASE_URL = "/api";
let useMock = null;

async function checkMode() {
  if (useMock !== null) return useMock;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    // Backend health endpoint kontrolü
    const res = await fetch(`${BASE_URL}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      useMock = (data.status !== "operational");
    } else {
      useMock = true;
    }
  } catch (e) {
    useMock = true;
  }
  return useMock;
}

async function request(path) {
  const isMock = await checkMode();
  if (isMock) {
    if (path === "/stats") {
      return mockData.getStats();
    }
    if (path.startsWith("/alerts?")) {
      const url = new URL(path, window.location.origin);
      const limit = url.searchParams.get("limit");
      const level = url.searchParams.get("level");
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search");
      const mitre = url.searchParams.get("mitre");
      const agent_ip = url.searchParams.get("agent_ip");
      return mockData.getAlerts({ limit, level, category, search, mitre, agent_ip });
    }
    if (path === "/alerts/categories") {
      return mockData.getAlertsCategories();
    }
    if (path.startsWith("/alerts/")) {
      const id = path.split("/").pop();
      const alert = mockData.getAlert(id);
      if (!alert) {
        throw new Error(`Belirtilen ID'ye sahip olay bulunamadı: ${id}`);
      }
      return alert;
    }
    if (path === "/agents") {
      return mockData.getAgents();
    }
    throw new Error(`Bilinmeyen mock rotası: ${path}`);
  }

  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API isteği başarısız oldu: ${path} (HTTP ${res.status})`);
  }
  return res.json();
}

// Gösterge paneli özet istatistiklerini ve grafik verisini getirir
export function fetchStats() {
  return request("/stats");
}

// Filtrelenebilir güvenlik olayları/logları listesini getirir.
export function fetchAlerts({ limit = 100, level, category, search, mitre, agent_ip } = {}) {
  const params = new URLSearchParams();
  params.set("limit", limit);
  if (level) params.set("level", level);
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (mitre) params.set("mitre", mitre);
  if (agent_ip) params.set("agent_ip", agent_ip);
  return request(`/alerts?${params.toString()}`);
}

// Mevcut alarm kategorilerini getirir (filtre açılır menüsü için)
export function fetchCategories() {
  return request("/alerts/categories");
}

// Tüm ajanların (endpoint) listesini ve durumlarını getirir
export function fetchAgents() {
  return request("/agents");
}
