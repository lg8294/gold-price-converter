import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true, // 强制清空输出目录
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
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,
  },
  publicDir: "assets",
  css: {
    devSourcemap: true,
  },
});
