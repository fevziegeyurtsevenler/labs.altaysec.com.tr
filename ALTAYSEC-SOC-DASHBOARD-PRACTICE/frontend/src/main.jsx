import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Uygulamanın React ağacına bağlandığı giriş noktası (entry point).
// HashRouter, statik hosting ortamlarında (labs.altaysec.com.tr/soc-practice gibi)
// alt dizinlerden gelen isteklerin web sunucusu yönlendirme kurallarına takılmadan
// sorunsuz çalışması için BrowserRouter yerine tercih edilmiştir.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
