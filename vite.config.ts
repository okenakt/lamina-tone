import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve("./src"),
      },
    },
    server: {
      host: env.VITE_HOST || "0.0.0.0",
      port: parseInt(env.VITE_PORT || "5173"),
      watch: {
        usePolling: true, // WSLでのファイル監視に必要
        interval: 100,
      },
      hmr: {
        port: parseInt(env.VITE_HMR_PORT || "24679"), // WSL用HMRポート（競合を避ける）
      },
    },
  };
});
