import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "咖啡收藏簿 · 台北",
        short_name: "丐幫找咖啡",
        description: "台北 8 個捷運生活圈的咖啡廳清單與個人收藏",
        lang: "zh-Hant-TW",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#e8d9c3",
        theme_color: "#2e1f16",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // 字體檔約 4.9MB，要放寬預快取上限才會離線可用
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,png,svg,webp,ttf,woff,woff2}"],
        // bootstrap-icons 的字體網址帶 ?hash，比對預快取時忽略查詢參數，離線才找得到圖示字體
        ignoreURLParametersMatching: [/.*/],
        runtimeCaching: [
          {
            // 店家照片：看過一次就存起來，離線也能顯示
            urlPattern: ({ url }) => url.hostname === "cafeandcowork.com" || url.hostname === "images.unsplash.com",
            handler: "CacheFirst",
            options: {
              cacheName: "cafe-photos",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
});
