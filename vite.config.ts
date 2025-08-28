import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        demo1: resolve(__dirname, 'demo1.html'),
        demo2: resolve(__dirname, 'demo2.html'),
        talk: resolve(__dirname, 'talk.html'),
        homeserver: resolve(__dirname, 'homeserver.html'),
      },
    },
  },
});
