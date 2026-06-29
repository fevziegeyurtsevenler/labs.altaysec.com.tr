/** @type {import('tailwindcss').Config} */
// Bu yapılandırma dosyası, AltaySec markasının görsel kimliğini (renk paleti ve
// tipografi) Tailwind utility sınıfları olarak tüm projeye yayar. Böylece her
// bileşen "bg-altayBg" veya "text-altayRed" gibi anlamlı isimler kullanabilir.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        altayBg: "#070709", // Ana tuval (canvas) arka plan rengi - katı koyu mod
        altayRed: "#ef4444", // Vurgu, aktif durum ve birincil aksiyon rengi
        altaySurface: "#0d0d10", // Kart ve panel yüzeyleri için hafif yükseltilmiş zemin
        altayBorder: "#1c1c20", // İnce ayırıcı çizgiler
        altayMuted: "#6b6b75", // İkincil/soluk metin rengi
        altayRedDark: "#7f1d1d", // Kırmızının koyu tonu - gradyanlarda gölge ucu
        altayRedSoft: "#451a1a", // Çok soluk kırmızı - vurgusuz arka plan dolguları
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        altayGlow: "0 0 24px 0 rgba(239, 68, 68, 0.25)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.85)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
