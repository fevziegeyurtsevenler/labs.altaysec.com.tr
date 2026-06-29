import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import LogTable from "../components/LogTable";
import SearchBar from "../components/SearchBar";

// ============================================================================
// SecurityEvents.jsx
// ----------------------------------------------------------------------------
// "Güvenlik Olayları" görünümü - ham alarm/log akışının filtrelenebilir tam
// listesini sunar. Bu ekran, bir SOC analistinin tehdit avcılığı (threat
// hunting) yaparken en çok zaman geçirdiği yerdir: belirli bir IP'nin tüm
// hareketlerini, belirli bir kural ID'sinin tetiklenme sıklığını veya
// belirli bir MITRE tekniğine ait olayları arayıp inceleyebilir.
//
// v3 GÜNCELLEMESİ:
// Bu sayfa artık SearchBar.jsx'i barındırır - Kibana/Wazuh'taki KQL arama
// çubuğunu taklit eden, "mitre:T1486" veya "level:12" gibi yapılandırılmış
// sorgular yazılabilen bir bileşen. SearchBar kendisi veri ÇEKMEZ; sadece
// kullanıcının yazdığı sorguyu ayrıştırıp `kqlQuery` state'ine yazar. Bu
// state, `externalQuery` prop'u olarak LogTable'a aktarılır ve LogTable
// bu sorguyu kendi iç filtreleriyle (seviye/kategori açılır menüleri)
// birleştirerek backend'den doğru veriyi çeker.
//
// v4 GÜNCELLEMESİ - NAVBAR ENTEGRASYONU:
// Navbar.jsx'teki arama kutusu veya bildirim zilinden bir sonuca
// tıklandığında, kullanıcı bu sayfaya "/events?q=..." şeklinde bir URL
// sorgu parametresiyle yönlendirilir. Bu sayfa artık `useSearchParams` ile
// bu parametreyi okur ve SearchBar'ı o değerle başlatır - böylece Navbar'da
// görülen sonuç, bu sayfada da aynı filtrelenmiş tabloyla karşılanır.
// ============================================================================

export default function SecurityEvents() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // SearchBar'dan gelen, ayrıştırılmış (parsed) tehdit avcılığı sorgusu.
  const [kqlQuery, setKqlQuery] = useState({
    raw: initialQuery,
    search: undefined,
    level: undefined,
    mitre: undefined,
    agent_ip: undefined,
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Güvenlik Olayları</h2>
        <p className="text-xs text-altayMuted mt-1">
          Tüm ajanlardan toplanan ham alarm akışı. Yeni olaylar her 3 saniyede bir otomatik olarak listeye eklenir.
        </p>
      </div>

      {/* Tehdit Avcılığı Arama Çubuğu (KQL-benzeri). `key={initialQuery}`
          kullanılarak, Navbar'dan farklı bir "q" parametresiyle her
          gelişte SearchBar yeniden monte edilir ve giriş kutusu o yeni
          değerle baştan başlar - URL durumu ile bileşen durumu senkron kalır. */}
      <SearchBar key={initialQuery} initialValue={initialQuery} onQueryChange={setKqlQuery} />

      {/* Sayfalamalı, tıklanabilir olay tablosu - SearchBar sorgusunu externalQuery
          üzerinden alır ve kendi iç filtreleriyle birleştirir */}
      <LogTable pageSize={150} rowsPerPage={15} liveMode externalQuery={kqlQuery} />
    </div>
  );
}
