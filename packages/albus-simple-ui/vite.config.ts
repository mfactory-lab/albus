import path from 'node:path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { BuildOptions } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  const isProd = mode === 'production'

  const build: BuildOptions = {
    manifest: isProd,
    chunkSizeWarningLimit: 1024,
    // target: ['es2020'],
    // rollupOptions: {
    //   plugins: [
    //     inject({ Buffer: ['buffer', 'Buffer'] }) as any,
    //   ],
    // },
  }

  return {
    build,
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar({
        sassVariables: './src/assets/styles/_variables.scss',
      }),
      Pages({
        extensions: ['vue', 'md'],
      }),
      Layouts(),
      AutoImport({
        ignore: ['h'],
        imports: [
          'vue',
          'vue-router',
          '@vueuse/head',
          '@vueuse/core',
          'quasar',
          {
            'i18next-vue': [
              'useTranslation',
            ],
          },
          // {
          //   '@package': ['...'],
          // },
        ],
        dts: 'types/auto-imports.d.ts',
        dirs: ['src/hooks/**', 'src/stores/**'],
      }),
      Components({
        // allow to autoload markdown components under `./src/components/`
        extensions: ['vue', 'md', 'jsx', 'tsx'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.jsx$/, /\.tsx$/],
        dts: 'types/components.d.ts',
      }),
    ],
    resolve: {
      // preserveSymlinks: true,
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
        '@/': `${path.resolve(__dirname, 'src')}/`,
        // 'crypto': 'crypto-browserify',
      },
      // dedupe: [
      //  'bn.js',
      // 'bs58',
      // 'lodash',
      // 'buffer-layout',
      // '@solana/web3.js',
      // '@solana/buffer-layout',
      // ],
    },

    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       additionalData: '@use "~/assets/styles/variables.scss" as *;',
    //     },
    //   },
    // },

    define: {
      'process.env': {},
    },

    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head',
        'axios',
        'pinia',
        'lodash',
      ],
      exclude: ['ethereum-cryptography', 'vue-demi'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
        ],
      },
    },
  }
})
