import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
    server: {
        port: 3699,
        host: '0.0.0.0',
    },
    plugins: [
        ...VitePluginNode({
            adapter: 'express',
            appPath: './app.ts',
        }),
    ],
});