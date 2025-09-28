import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  root: "src",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  publicDir: "assets",
  css: {
    devSourcemap: true,
  },
});
