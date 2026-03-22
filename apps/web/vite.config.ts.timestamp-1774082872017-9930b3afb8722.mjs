// vite.config.ts
import { defineConfig } from "file:///C:/JobNow/JobNow/node_modules/.pnpm/vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1/node_modules/vite/dist/node/index.js";
import react from "file:///C:/JobNow/JobNow/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_/node_modules/@vitejs/plugin-react/dist/index.js";
import { TanStackRouterVite } from "file:///C:/JobNow/JobNow/node_modules/.pnpm/@tanstack+router-vite-plugin@1.163.2_@tanstack+react-router@1.163.2_react-dom@18.3.1_react@18_6akqklysr2ahgv5aalmcxbtnze/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import tsconfigPaths from "file:///C:/JobNow/JobNow/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.9.3_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import tailwindcss from "file:///C:/JobNow/JobNow/node_modules/.pnpm/@tailwindcss+vite@4.2.1_vite@5.4.21_@types+node@25.3.3_lightningcss@1.31.1_/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [tailwindcss(), react(), TanStackRouterVite(), tsconfigPaths()],
  server: {
    host: true,
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.spec.cjs"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxKb2JOb3dcXFxcSm9iTm93XFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxKb2JOb3dcXFxcSm9iTm93XFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Kb2JOb3cvSm9iTm93L2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSAnQHRhbnN0YWNrL3JvdXRlci12aXRlLXBsdWdpbic7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcygpLCByZWFjdCgpLCBUYW5TdGFja1JvdXRlclZpdGUoKSwgdHNjb25maWdQYXRocygpXSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICAgIGhvc3Q6IHRydWUsXHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0ZXN0OiB7XHJcbiAgICAgICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcclxuICAgICAgICBzZXR1cEZpbGVzOiBbJy4vc3JjL3Rlc3Qtc2V0dXAudHMnXSxcclxuICAgICAgICBleGNsdWRlOiBbJyoqL25vZGVfbW9kdWxlcy8qKicsICcqKi9kaXN0LyoqJywgJyoqLyouc3BlYy5janMnXSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8saUJBQWlCO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsTUFBTSxHQUFHLG1CQUFtQixHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ3ZFLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNsQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDRixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZLENBQUMscUJBQXFCO0FBQUEsSUFDbEMsU0FBUyxDQUFDLHNCQUFzQixjQUFjLGVBQWU7QUFBQSxFQUNqRTtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
