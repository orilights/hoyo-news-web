import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import simpleHtmlPlugin from 'vite-plugin-simple-html'
import buildInfoPlugin from './plugins/buildInfo'

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
    buildInfoPlugin,
  ],
  server: {
    host: true,
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'player',
              test: /node_modules[\\/]artplayer/,
            },
            {
              name: 'vendor',
              test: /node_modules/,
            },
          ],
        },
      },
      onwarn(warning, defaultHandler) {
        if (warning.code === 'COMMONJS_VARIABLE_IN_ESM')
          return
        defaultHandler(warning)
      },
    },
  },
})
