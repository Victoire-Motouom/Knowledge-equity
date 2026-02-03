import "./global.css";

import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "next-themes";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = import.meta.env.BASE_URL || "/";
    const swUrl = new URL("sw.js", window.location.origin + base).toString();
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.error("Service worker registration failed", err);
    });
  });
}
