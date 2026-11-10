import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA. Production only: in development its cache
// would happily serve yesterday's modules over the dev server.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed silently
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
