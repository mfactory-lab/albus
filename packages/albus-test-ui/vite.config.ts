import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  const isProd = mode === 'prod'

  const { default: stdLibBrowser } = await import('node-stdlib-browser')

  return {
    build: {
      manifest: isProd,
      chunkSizeWarningLimit: 1024,
    },
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
        imports: [
          'vue',
          'vue-router',
          // '@vueuse/head',
          '@vueuse/core',
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
        resolvers: [],
        dts: 'types/components.d.ts',
      }),
      nodePolyfills({
        protocolImports: true,
        include: ['stream', 'crypto', 'constants'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      // preserveSymlinks: true,
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
        '@/': `${path.resolve(__dirname, 'src')}/`,
        ...stdLibBrowser,
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
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables.scss" as *;',
        },
        sass: {
          quietDeps: true,
          // Logger warn override is a workaround for deprecation warning spam. See
          // https://github.com/sass/sass/issues/3065#issuecomment-868302160.
          // `quietDeps` is supposed to have the same effect, but doesn't work.
          logger: {
            warn(message: string, options: any) {
              if (
                (options.deprecation && options.stack?.includes('node_modules'))
                || message.includes('repetitive deprecation')
              ) {
                return
              }
              console.warn(
              `\x1B[33mSASS WARNING\x1B[0m: ${message}\n${options.stack === 'null' ? '' : options.stack
              }\n`,
              )
            },
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head',
        'axios',
        'lodash',
        'pinia',
        'buffer',
        'process',
      ],
      exclude: [
        // 'ethereum-cryptography',
        'vue-demi',
      ],
    },
  }
})
