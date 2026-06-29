import React, { useEffect, useState } from "react";
import { X, Copy, Check, Network, ShieldHalf, Crosshair, Terminal, Server, ListTree, Braces, Table2 } from "lucide-react";

// ============================================================================
// LogDetailModal.jsx
// ----------------------------------------------------------------------------
// Bir SIEM analistinin günlük iş akışında en çok kullandığı ekranlardan biri,
// bir log satırına tıkladığında açılan "Document Detail" (Belge Detayı)
// görünümüdür (Kibana/Wazuh'taki aynı isimli panel). Bu bileşen, seçilen
// alarmın TÜM yapılandırılmış (structured) verisini, gerçek bir SOC aracında
// görülebilecek şekilde iki farklı görüntüleme modunda sunar:
//
//   1) "Tablo Görünümü" -> Kural, MITRE, Ağ ve Ajan bilgilerini gruplandırılmış
//      anahtar-değer (key-value) blokları halinde gösterir. Hızlı okunabilirlik
//      için tasarlanmıştır.
//   2) "JSON Görünümü"  -> Olayın ham (raw) JSON yapısını, Kibana'nın "JSON"
//      sekmesindeki gibi biçimlendirilmiş (pretty-printed) şekilde gösterir.
//      Bu, log'un backend'den TAM olarak nasıl geldiğini görmek isteyen
//      ileri seviye analistler için önemlidir.
//
// Panel, sağdan kayarak açılan bir "flyout" (açılır panel) şeklinde çalışır
// ve arka planda yarı saydam bir karartma (backdrop) ile odak noktasını
// sabitler. ESC tuşu veya backdrop'a tıklama paneli kapatır.
// ============================================================================

// Önem seviyesine göre (Wazuh'un 1-15 skalasına uygun) görsel sınıflandırma -
// LogTable.jsx ile birebir tutarlı tutuluyor
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

// Anahtar-değer satırı için küçük yardımcı bileşen - tüm "Tablo Görünümü"
// bloklarında tekrar kullanılır, böylece hizalama ve tipografi tutarlı kalır
function FieldRow({ label, value, mono = true, valueClassName = "" }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 border-b border-altayBorder/50 last:border-b-0">
      <span className="text-[11px] text-altayMuted font-mono uppercase tracking-wide pt-0.5">{label}</span>
      <span className={`text-xs text-zinc-200 break-all ${mono ? "font-mono" : ""} ${valueClassName}`}>{value}</span>
    </div>
  );
}

// Bir bölüm başlığı (section header) - ikon + Türkçe başlık
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={13} className="text-altayRed" />
      <h4 className="text-[12px] font-semibold text-zinc-100 uppercase tracking-wide">{title}</h4>
    </div>
  );
}

export default function LogDetailModal({ alert, onClose }) {
  const [activeTab, setActiveTab] = useState("table"); // "table" | "json"
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Panel her açıldığında sekmeyi varsayılana (Tablo) döndür ve kayma
  // animasyonunu tetiklemek için bir "mounted" bayrağını bir sonraki
  // render döngüsünde true'ya çek
  useEffect(() => {
    if (alert) {
      setActiveTab("table");
      setCopied(false);
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }
    setMounted(false);
  }, [alert]);

  // ESC tuşuna basıldığında paneli kapat - klavye erişilebilirliği için önemli
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (alert) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const sev = getSeverityMeta(alert.level);
  const jsonString = JSON.stringify(alert, null, 2);

  function handleCopy() {
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {
        // Pano erişimi reddedilirse sessizce yok say - kritik olmayan bir özellik
      });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Arka plan karartması - tıklanınca paneli kapatır */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sağdan kayarak açılan detay paneli */}
      <div
        className={`relative h-full w-full sm:w-[480px] lg:w-[560px] bg-altaySurface border-l border-altayRed/30 shadow-2xl flex flex-col transition-transform duration-250 ease-out ${
          mounted ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel başlığı */}
        <div className="px-5 py-4 border-b border-altayBorder flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`severity-badge border ${sev.className}`}>
                {sev.label} · Seviye {alert.level}
              </span>
              <span className="text-[11px] text-altayMuted font-mono">#{alert.rule_id}</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">{alert.category}</h3>
            <p className="text-[11px] text-altayMuted font-mono mt-0.5">
              {new Date(alert.timestamp).toLocaleString("tr-TR")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Detay panelini kapat"
            className="w-8 h-8 rounded-md border border-altayBorder bg-black/30 flex items-center justify-center hover:border-altayRed/50 hover:text-altayRed transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Sekme (tab) seçimi: Tablo Görünümü / JSON Görünümü */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-altayBorder shrink-0">
          <button
            onClick={() => setActiveTab("table")}
            className={[
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors",
              activeTab === "table"
                ? "text-altayRed border-altayRed"
                : "text-altayMuted border-transparent hover:text-zinc-200",
            ].join(" ")}
          >
            <Table2 size={13} />
            Tablo Görünümü
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={[
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors",
              activeTab === "json"
                ? "text-altayRed border-altayRed"
                : "text-altayMuted border-transparent hover:text-zinc-200",
            ].join(" ")}
          >
            <Braces size={13} />
            JSON Görünümü
          </button>

          <button
            onClick={handleCopy}
            className="ml-auto mb-1.5 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono text-altayMuted hover:text-altayRed border border-altayBorder rounded-md transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? "Kopyalandı" : "JSON Kopyala"}
          </button>
        </div>

        {/* Panel gövdesi - kaydırılabilir içerik alanı */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "table" ? (
            <div className="space-y-5">
              {/* Genel Bilgiler */}
              <section>
                <SectionHeader icon={ListTree} title="Genel Bilgiler" />
                <div className="altay-panel rounded-md border border-altayBorder px-3 py-1">
                  <FieldRow label="Olay ID" value={alert.id} />
                  <FieldRow label="Zaman Damgası" value={alert.timestamp} />
                  <FieldRow label="Kategori" value={alert.category} mono={false} />
                  <FieldRow label="Konum" value={alert.location} />
                  <FieldRow label="Decoder" value={alert.decoder?.name} />
                </div>
              </section>

              {/* Kural Detayları */}
              <section>
                <SectionHeader icon={ShieldHalf} title="Kural Detayları (Rule)" />
                <div className="altay-panel rounded-md border border-altayBorder px-3 py-1">
                  <FieldRow label="Kural ID" value={alert.rule?.id ?? alert.rule_id} />
                  <FieldRow label="Seviye" value={`${alert.level} / 15`} />
                  <FieldRow label="Açıklama" value={alert.description} mono={false} />
                </div>
                {alert.rule?.groups?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {alert.rule.groups.map((g) => (
                      <span
                        key={g}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-altayBorder bg-black/30 text-zinc-400"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* MITRE ATT&CK Eşleştirmesi */}
              <section>
                <SectionHeader icon={Crosshair} title="MITRE ATT&CK Eşleştirmesi" />
                <div className="altay-panel rounded-md border border-altayRed/20 px-3 py-1 bg-altayRed/[0.03]">
                  <FieldRow
                    label="Teknik ID"
                    value={alert.mitre_technique.id}
                    valueClassName="text-altayRed font-semibold"
                  />
                  <FieldRow label="Teknik Adı" value={alert.mitre_technique.name} mono={false} />
                  <FieldRow label="Taktik" value={alert.mitre_technique.tactic} mono={false} />
                </div>
              </section>

              {/* Ağ Yönlendirme */}
              <section>
                <SectionHeader icon={Network} title="Ağ Yönlendirme (Network Routing)" />
                <div className="altay-panel rounded-md border border-altayBorder px-3 py-1">
                  <FieldRow label="Kaynak IP" value={alert.src_ip} />
                  <FieldRow label="Kaynak Port" value={alert.src_port} />
                  <FieldRow label="Hedef IP" value={alert.dest_ip} />
                  <FieldRow label="Hedef Port" value={alert.dest_port} />
                  <FieldRow label="Protokol" value={String(alert.protocol).toUpperCase()} />
                </div>
              </section>

              {/* Ajan Bilgileri */}
              <section>
                <SectionHeader icon={Server} title="Ajan Bilgileri (Agent)" />
                <div className="altay-panel rounded-md border border-altayBorder px-3 py-1">
                  <FieldRow label="Ajan Adı" value={alert.agent} mono={false} />
                  <FieldRow label="Ajan ID" value={alert.agent_id} />
                  <FieldRow label="Ajan IP" value={alert.agent_ip} />
                </div>
              </section>

              {/* Ham Log */}
              <section>
                <SectionHeader icon={Terminal} title="Ham Log Satırı (full_log)" />
                <p className="text-[11px] text-altayMuted mb-2">
                  Kaynak sistemin (sshd, web sunucusu, Windows Event Log vb.) ürettiği orijinal,
                  işlenmemiş log satırı. Gerçek sistemler bu kayıtları kendi yerel formatında üretir.
                </p>
                <pre className="bg-black/50 border border-altayBorder rounded-md p-3 text-[11px] font-mono text-zinc-400 whitespace-pre-wrap break-all leading-relaxed">
{alert.full_log}
                </pre>
              </section>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-altayMuted mb-2">
                Bu olayın backend tarafından üretilen tam JSON yapısı. Gerçek bir Kibana/Wazuh
                kurulumunda "JSON" sekmesi de bu şekilde ham veriyi gösterir.
              </p>
              <pre className="bg-black/50 border border-altayBorder rounded-md p-3 text-[11px] font-mono text-zinc-300 whitespace-pre overflow-x-auto leading-relaxed">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Panel alt bilgisi */}
        <div className="px-5 py-3 border-t border-altayBorder text-[10px] text-altayMuted font-mono shrink-0">
          AltaySec Document Detail · Eğitim Simülasyon Verisi
        </div>
      </div>
    </div>
  );
}
