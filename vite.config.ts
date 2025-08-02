import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import simpleHtmlPlugin from 'vite-plugin-simple-html'
import buildDatePlugin from './plugins/buildDate.js'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: './src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    simpleHtmlPlugin({
      inject: {
        data: {
          injectHead: process.env.INJECT_HEAD || '',
        },
      },
    }),
    buildDatePlugin,
  ],
})
