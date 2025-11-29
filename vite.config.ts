// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'

console.log('START')
console.log('process.env.PLATFORM', process.env.PLATFORM)

export default defineConfig({
  base: './',
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          PLATFORM: process.env.PLATFORM || 'default',
          MODE: process.env.MODE || 'default',
        },
      },
    }),
    react({
      fastRefresh: false,
    }),
  ],

  // Ключевой момент — сюда
  esbuild: {
    define: {
      __PLATFORM__: JSON.stringify(process.env.PLATFORM || 'default'),
      __MODE__: JSON.stringify(process.env.MODE || 'default'),
    },
  },

  // А вот этот блок можно убрать совсем
  // define: {
  //   __PLATFORM__: JSON.stringify(process.env.PLATFORM || 'default')
  // },
})
  