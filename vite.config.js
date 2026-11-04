import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        dns: resolve(import.meta.dirname, "dns/index.html"),
        cidr: resolve(import.meta.dirname, "cidr/index.html"),
        privacy: resolve(import.meta.dirname, "privacidade/index.html"),
      },
    },
  },
});
