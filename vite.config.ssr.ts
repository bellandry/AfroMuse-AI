import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src"), "@shared": path.resolve(import.meta.dirname, "shared"), "@assets": path.resolve(import.meta.dirname, "attached_assets") } },
  build: { ssr: "client/src/entry-server.tsx", outDir: "dist/server-ssr", emptyOutDir: true, rollupOptions: { output: { entryFileNames: "entry-server.js" } } },
});
