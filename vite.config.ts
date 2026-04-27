import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => ({
  root: mode === "development" ? "dev" : ".",
  publicDir: resolve(__dirname, "public"),
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
  },
}));
