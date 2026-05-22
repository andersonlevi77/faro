import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            // No refrescar rutas generadas por Wayfinder (evita bucle de recarga en dev).
            refresh: [
                'resources/views/**',
                'routes/**',
                'app/**',
                'config/**',
                'lang/**',
                'resources/js/pages/**',
                'resources/js/components/**',
                'resources/js/layouts/**',
            ],
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
