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
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed", err);
    });
  });
}
