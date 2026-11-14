import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA. Production only: in development its cache
// would happily serve yesterday's modules over the dev server.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  // Whether this tab was already controlled by a worker. Reloading after the
  // very first install would be pointless; reloading after an *update* is what
  // stops a tab running an old bundle whose assets the deploy has removed.
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!wasControlled || reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    // updateViaCache: "none" so the browser always revalidates sw.js itself
    // instead of serving the previous worker from the HTTP cache.
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        const activate = (worker: ServiceWorker | null) => {
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        };

        activate(registration.installing);
        registration.addEventListener("updatefound", () => {
          activate(registration.installing);
        });

        // Check for a newer worker on every load, not only on the browser's
        // own schedule.
        registration.update().catch(() => {});
      })
      .catch(() => {
        // Service worker registration failed silently
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
