import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./styles.css";
import App from "./App.jsx";

// Service Worker：離線可用，有新版本時自動更新
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
