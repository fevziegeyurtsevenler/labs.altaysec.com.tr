import React, { useEffect, useMemo, useRef, useState } from "react";
import { TerminalSquare, X, Info } from "lucide-react";

// ============================================================================
// SearchBar.jsx
// ----------------------------------------------------------------------------
// Tehdit Avcılığı (Threat Hunting) Arama Çubuğu.
//
// Kibana/Wazuh'taki KQL (Kibana Query Language) arama çubuğunu taklit eder:
// Analist, tek bir metin kutusuna hem serbest metin hem de alana özel
// (field-specific) sorgular yazabilir. Şu sözdizimini destekler:
//
//   mitre:T1110          -> Sadece bu MITRE teknik ID'sini içeren olaylar
//   agent_ip:10.0.0.10   -> Belirtilen ajan IP adresine ait olaylar (ip: de çalışır)
//   level:12             -> Bu seviye VE ÜSTÜ olaylar (Wazuh mantığına uygun "minimum seviye")
//   ransomware           -> Yukarıdaki kalıplara uymayan her şey serbest metin
//                            olarak açıklama/ajan/IP/kural ID alanlarında aranır
//
// Birden fazla token boşluk ile ayrılarak birlikte kullanılabilir, örn:
//   "level:10 mitre:T1486" -> Seviyesi 10+ olan VE T1486 içeren olaylar
//
// Bu bileşen KENDİ BAŞINA veri çekmez; sadece kullanıcının yazdığı metni
// ayrıştırıp (parse) yapılandırılmış bir sorgu nesnesi olarak üst bileşene
// (LogTable'ı barındıran sayfa) iletir.
//
// Prop:
//   initialValue       -> Bileşen ilk açıldığında giriş kutusuna yazılacak
//                           başlangıç metni (örn. Navbar'dan "?q=" ile gelen
//                           sorgu). Verildiğinde, mount anında otomatik
//                           olarak ayrıştırılıp onQueryChange ile bildirilir.
//   onQueryChange(parsedQuery) -> Sorgu her değiştiğinde (debounce'lı) tetiklenir
// ============================================================================

const EXAMPLE_QUERIES = ["level:12", "mitre:T1486", "agent_ip:10.0.0.10", "powershell"];

// Tek bir KQL-benzeri token'ı ayrıştırır: "anahtar:değer" / "anahtar>=değer" / "anahtar=değer"
const FIELD_TOKEN_PATTERN = /^(level|mitre|agent_ip|ip)(:|>=|<=|=)(.+)$/i;

// Ham kullanıcı girdisini, backend'in /api/alerts endpoint'ine gönderilecek
// yapılandırılmış filtre nesnesine çevirir
function parseQuery(raw) {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  let level;
  let mitre;
  let agentIp;
  const freeTextTokens = [];

  tokens.forEach((token) => {
    const match = token.match(FIELD_TOKEN_PATTERN);
    if (match) {
      const key = match[1].toLowerCase();
      // Tırnak işaretleri varsa temizle (örn. agent_ip:"10.0.0.10")
      const value = match[3].replace(/^["']|["']$/g, "");
      if (key === "level") level = value;
      else if (key === "mitre") mitre = value;
      else if (key === "agent_ip" || key === "ip") agentIp = value;
    } else {
      freeTextTokens.push(token);
    }
  });

  return {
    raw,
    search: freeTextTokens.length > 0 ? freeTextTokens.join(" ") : undefined,
    level,
    mitre,
    agent_ip: agentIp,
  };
}

export default function SearchBar({ initialValue = "", onQueryChange }) {
  const [value, setValue] = useState(initialValue);
  const [showHint, setShowHint] = useState(false);
  const debounceRef = useRef(null);

  // Bileşen ilk monte edildiğinde, eğer bir başlangıç değeri (örn. Navbar'dan
  // gelen "?q=" parametresi) varsa, hiç beklemeden hemen ayrıştırıp üst
  // bileşene bildiriyoruz - kullanıcı yazmayı beklemeden sonuçlar gelmeli
  useEffect(() => {
    onQueryChange(parseQuery(initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yazı yazılırken sunucuyu bombardımana uğratmamak için 350ms'lik bir
  // "debounce" (geciktirme) uyguluyoruz - kullanıcı yazmayı bitirdikten
  // kısa bir süre sonra sorgu çalıştırılır
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onQueryChange(parseQuery(value));
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Aktif olarak ayrıştırılmış alanları (field) göstermek için - kullanıcıya
  // sorgusunun nasıl yorumlandığına dair anlık geri bildirim sağlar
  const parsedPreview = useMemo(() => parseQuery(value), [value]);
  const hasStructuredFields = Boolean(parsedPreview.level || parsedPreview.mitre || parsedPreview.agent_ip);

  function handleClear() {
    setValue("");
    onQueryChange(parseQuery(""));
  }

  function handleEnter(e) {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onQueryChange(parseQuery(value));
    }
    if (e.key === "Escape") {
      handleClear();
    }
  }

  return (
    <div className="altay-panel rounded-lg border border-altayBorder p-3">
      <div className="flex items-center gap-2 bg-black/40 border border-altayBorder rounded-md px-3 py-2.5 focus-within:border-altayRed/50 transition-colors">
        <TerminalSquare size={16} className="text-altayRed shrink-0" />
        <span className="hidden sm:inline text-[10px] font-mono font-semibold uppercase tracking-wider text-altayRed/80 bg-altayRed/10 border border-altayRed/30 rounded px-1.5 py-0.5 shrink-0">
          KQL
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Tehdit avcılığı sorgusu yazın... örn: level:12 mitre:T1486 agent_ip:10.0.0.10"
          className="flex-1 bg-transparent text-xs font-mono text-zinc-200 placeholder:text-altayMuted outline-none"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={() => setShowHint((s) => !s)}
          aria-label="Sorgu sözdizimi yardımı"
          className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${
            showHint ? "text-altayRed bg-altayRed/10" : "text-altayMuted hover:text-zinc-200"
          }`}
        >
          <Info size={13} />
        </button>
        {value && (
          <button
            onClick={handleClear}
            aria-label="Sorguyu temizle"
            className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-altayMuted hover:text-altayRed transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Ayrıştırılan alanların anlık önizlemesi - kullanıcı sorgusunun doğru
          yorumlandığını görerek güven kazanır */}
      {hasStructuredFields && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {parsedPreview.level && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-altayRed/30 bg-altayRed/10 text-altayRed">
              seviye &ge; {parsedPreview.level}
            </span>
          )}
          {parsedPreview.mitre && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-altayRed/30 bg-altayRed/10 text-altayRed">
              mitre: {parsedPreview.mitre}
            </span>
          )}
          {parsedPreview.agent_ip && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-altayRed/30 bg-altayRed/10 text-altayRed">
              ajan ip: {parsedPreview.agent_ip}
            </span>
          )}
          {parsedPreview.search && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-altayBorder bg-white/5 text-zinc-400">
              metin: "{parsedPreview.search}"
            </span>
          )}
        </div>
      )}

      {/* Sözdizimi yardımı / hızlı örnekler */}
      {showHint && (
        <div className="mt-3 pt-3 border-t border-altayBorder">
          <p className="text-[11px] text-altayMuted mb-2">
            Desteklenen alanlar: <span className="font-mono text-zinc-300">level</span>,{" "}
            <span className="font-mono text-zinc-300">mitre</span>,{" "}
            <span className="font-mono text-zinc-300">agent_ip</span> (veya{" "}
            <span className="font-mono text-zinc-300">ip</span>). Eşleşmeyen her kelime serbest
            metin olarak aranır. Hızlı denemek için aşağıdaki örnek sorgulardan birine tıklayın:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex}
                onClick={() => setValue(ex)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-altayBorder bg-black/30 text-zinc-400 hover:border-altayRed/40 hover:text-altayRed transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
