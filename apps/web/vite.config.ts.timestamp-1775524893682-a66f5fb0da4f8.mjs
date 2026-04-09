// vite.config.ts
import { defineConfig } from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_terser@5.46.1/node_modules/vite/dist/node/index.js";
import react from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_terser@5.46.1_/node_modules/@vitejs/plugin-react/dist/index.js";
import { TanStackRouterVite } from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/@tanstack+router-vite-plugin@1.163.2_@tanstack+react-router@1.163.2_react-dom@18.3.1_react@18_7lwzo5opjn6gybjtzk2kndqcuq/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import tsconfigPaths from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.9.3_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_terser@5.46.1_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import tailwindcss from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/@tailwindcss+vite@4.2.1_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_terser@5.46.1_/node_modules/@tailwindcss/vite/dist/index.mjs";
import { VitePWA } from "file:///home/pind/WorkSpace/JobNow/node_modules/.pnpm/vite-plugin-pwa@1.2.0_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_terser@5.46.1__workb_qgtrra3nvg2m4xmocjdicxav2m/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    TanStackRouterVite(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192x192.png", "icon-512x512.png"],
      manifest: {
        name: "JobNow - T\xECm vi\u1EC7c l\xE0m nhanh",
        short_name: "JobNow",
        description: "N\u1EC1n t\u1EA3ng k\u1EBFt n\u1ED1i ng\u01B0\u1EDDi t\xECm vi\u1EC7c v\xE0 nh\xE0 tuy\u1EC3n d\u1EE5ng",
        theme_color: "#1565C0",
        background_color: "#FFFFFF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "vi",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // Cache Firebase SDK và static assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5e6,
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache Firebase Firestore API calls
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 3e3,
    proxy: {
      "/api/verify-cccd": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9waW5kL1dvcmtTcGFjZS9Kb2JOb3cvYXBwcy93ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3BpbmQvV29ya1NwYWNlL0pvYk5vdy9hcHBzL3dlYi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9waW5kL1dvcmtTcGFjZS9Kb2JOb3cvYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBUYW5TdGFja1JvdXRlclZpdGUgfSBmcm9tICdAdGFuc3RhY2svcm91dGVyLXZpdGUtcGx1Z2luJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgICAgIHJlYWN0KCksXG4gICAgICAgIFRhblN0YWNrUm91dGVyVml0ZSgpLFxuICAgICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICAgIFZpdGVQV0Eoe1xuICAgICAgICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICAgICAgICBpbmNsdWRlQXNzZXRzOiBbJ2ljb24tMTkyeDE5Mi5wbmcnLCAnaWNvbi01MTJ4NTEyLnBuZyddLFxuICAgICAgICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnSm9iTm93IC0gVFx1MDBFQ20gdmlcdTFFQzdjIGxcdTAwRTBtIG5oYW5oJyxcbiAgICAgICAgICAgICAgICBzaG9ydF9uYW1lOiAnSm9iTm93JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05cdTFFQzFuIHRcdTFFQTNuZyBrXHUxRUJGdCBuXHUxRUQxaSBuZ1x1MDFCMFx1MUVERGkgdFx1MDBFQ20gdmlcdTFFQzdjIHZcdTAwRTAgbmhcdTAwRTAgdHV5XHUxRUMzbiBkXHUxRUU1bmcnLFxuICAgICAgICAgICAgICAgIHRoZW1lX2NvbG9yOiAnIzE1NjVDMCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGRkZGRkYnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcbiAgICAgICAgICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgICAgICAgICBzY29wZTogJy8nLFxuICAgICAgICAgICAgICAgIGxhbmc6ICd2aScsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogWydidXNpbmVzcycsICdwcm9kdWN0aXZpdHknXSxcbiAgICAgICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnL2ljb24tNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZScsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3b3JrYm94OiB7XG4gICAgICAgICAgICAgICAgLy8gQ2FjaGUgRmlyZWJhc2UgU0RLIHZcdTAwRTAgc3RhdGljIGFzc2V0c1xuICAgICAgICAgICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx3b2ZmMn0nXSxcbiAgICAgICAgICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNTAwMDAwMCxcbiAgICAgICAgICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWNoZSBHb29nbGUgRm9udHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FjaGUgRmlyZWJhc2UgRmlyZXN0b3JlIEFQSSBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9maXJlc3RvcmVcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ZpcmVzdG9yZS1jYWNoZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiA1MCwgbWF4QWdlU2Vjb25kczogNjAgKiA1IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgICBob3N0OiB0cnVlLFxuICAgICAgICBwb3J0OiAzMDAwLFxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgJy9hcGkvdmVyaWZ5LWNjY2QnOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxvQkFBb0I7QUFDM1QsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixtQkFBbUI7QUFBQSxJQUNuQixjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsTUFDSixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsb0JBQW9CLGtCQUFrQjtBQUFBLE1BQ3RELFVBQVU7QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLFlBQVksQ0FBQyxZQUFZLGNBQWM7QUFBQSxRQUN2QyxPQUFPO0FBQUEsVUFDSDtBQUFBLFlBQ0ksS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ2I7QUFBQSxVQUNBO0FBQUEsWUFDSSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDYjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsTUFDQSxTQUFTO0FBQUE7QUFBQSxRQUVMLGNBQWMsQ0FBQyxzQ0FBc0M7QUFBQSxRQUNyRCwrQkFBK0I7QUFBQSxRQUMvQixnQkFBZ0I7QUFBQSxVQUNaO0FBQUE7QUFBQSxZQUVJLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNMLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQUEsY0FDaEUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDNUM7QUFBQSxVQUNKO0FBQUEsVUFDQTtBQUFBO0FBQUEsWUFFSSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDTCxXQUFXO0FBQUEsY0FDWCxZQUFZLEVBQUUsWUFBWSxJQUFJLGVBQWUsS0FBSyxFQUFFO0FBQUEsY0FDcEQsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDNUM7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDSCxvQkFBb0I7QUFBQSxRQUNoQixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDbEI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNsQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
