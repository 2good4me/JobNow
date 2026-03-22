/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react(), TanStackRouterVite(), tsconfigPaths()],
    server: {
        host: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.cjs'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            // Đo coverage trên toàn bộ logic: services, hooks, utils (bỏ qua UI components và routes)
            include: [
                'src/features/**/services/**/*.ts',
                'src/features/**/hooks/**/*.ts',
                'src/utils/**/*.ts',
                'src/lib/**/*.ts',
            ],
            exclude: [
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/node_modules/**',
                'src/routeTree.gen.ts',
            ],
        },
    },
});
