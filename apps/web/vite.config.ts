import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react(), TanStackRouterVite(), tsconfigPaths()],
    server: {
        host: true, // Cho phép LAN truy cập
        port: 3000,
    },
});
