import { basename, dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import inject from '@rollup/plugin-inject'

import type { BuildOptions, PluginOption, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const isObject = (item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && !Array.isArray(item))
const isExternal = (id: string) => !id.startsWith('.') && !id.startsWith('@/') && !id.startsWith('~/') && !isAbsolute(id)

function mergeDeep<T>(target: T, ...sources: T[]): T {
  if (!sources.length) {
    return target
  }
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        mergeDeep(target[key] as T, source[key] as T)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

function viteBuild(path: string, options: BuildOptions = {}): BuildOptions {
  const dir = dirname(fileURLToPath(path))
  const pkgName = basename(dir)

  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      manifest: true,
      minify: true,
      reportCompressedSize: true,
      emptyOutDir: false,
      lib: {
        name: `albus_${pkgName}`,
        entry: resolve(dir, 'src', 'index.ts'),
        fileName: format => `index.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: isExternal,
        plugins: [
          dts({
            // rollupTypes: true,
            insertTypesEntry: true,
          }),
          inject({ Buffer: ['buffer', 'Buffer'] }) as PluginOption,
        ],
        output: {
          dir: resolve(dir, 'dist'),
        },
      },
    },
    options,
  )
}

/**
 * Config for plugins
 *
 * @param packageDirName - package directory name
 * @param options - custom options
 * @returns user config
 */
export function pluginViteConfig(packageDirName: string, options: UserConfig = {}) {
  return defineConfig({
    ...options,
    resolve: mergeDeep({
      alias: {
        'node:buffer': 'buffer',
      },
    }, options.resolve),
    build: viteBuild(packageDirName, options.build),
  })
}

export default defineConfig({
  test: {
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'node',
    // environment: 'jsdom',
    testTimeout: 20000,
  },
} as any)
