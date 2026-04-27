import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  // Load .env / .env.local — DEV_HA_URL + DEV_HA_TOKEN drive the live-data
  // proxy below. Both are dev-only (gitignored); the production card never
  // sees them because it reads from `hass.states[...]`, not from /api.
  const env = loadEnv(mode, __dirname, "");
  const haUrl = env.DEV_HA_URL;
  const haToken = env.DEV_HA_TOKEN;
  return {
    root: mode === "development" ? "dev" : ".",
    build: {
      outDir: resolve(__dirname, "dist"),
      emptyOutDir: true,
      target: "es2022",
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "src/card.ts"),
        formats: ["es"],
        fileName: () => "journey-viewer-card.js",
      },
      rollupOptions: {
        // Bundle leaflet + lit into the single output file so HA users only
        // load one resource. CSS is inlined too via lit's css helper.
        external: [],
        output: {
          // Inline the dynamic import() of the editor so we ship one file.
          inlineDynamicImports: true,
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      // Proxy /ha-api → real HA. The token is injected server-side so it
      // never reaches the browser; CORS is bypassed by virtue of being
      // same-origin to the dev server. Falls back to a 503 if either env
      // var is missing — dev/main.ts then surfaces a friendly empty state.
      proxy: haUrl && haToken
        ? {
            "/ha-api": {
              target: haUrl,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/ha-api/, "/api"),
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  proxyReq.setHeader("Authorization", `Bearer ${haToken}`);
                });
              },
            },
          }
        : undefined,
    },
  };
});
