import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite yapılandırması: geliştirme sunucusu /api isteklerini backend'e (4000 portu)
// yönlendirir. base: "./" seçeneği üretilecek build dosyalarının relative (göreceli)
// yollarla çağrılmasını sağlar, bu sayede alt klasörlerde (örn: /soc-practice/)
// sorunsuz çalışır.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
