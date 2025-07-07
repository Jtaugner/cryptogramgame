import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vite.dev/config/

console.log('process.env.PLATFORM', process.env.PLATFORM);

export default defineConfig({
  base: './',
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          PLATFORM: process.env.PLATFORM || 'default',
        },
      },
    }),
    react()
  ],
  define: {
    __PLATFORM__: JSON.stringify(process.env.PLATFORM || 'default')
  }
})
