import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Extra hostnames allowed to reach the dev server (comma separated), e.g. a
// tunnel or preview URL. Kept out of source so no environment-specific
// hostname is committed; set DEV_ALLOWED_HOSTS in your shell or .env to opt in.
function readAllowedHosts(mode: string) {
  return (loadEnv(mode, process.cwd(), "").DEV_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const allowedHosts = readAllowedHosts(mode);

  return {
    server: {
      host: "::",
      port: 8080,
      ...(allowedHosts.length > 0 ? { allowedHosts } : {}),
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
