import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { BuildOptions, PluginOption, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import inject from '@rollup/plugin-inject'

import globalPackageJson from './package.json'

const external = [
  'axios',
  'tslib',
  'snarkjs',
  'circomlibjs',
  'ffjavascript',
  '@albus/cli',
  '@albus/core',
  '@albus/sdk',
  'node:fs',
]

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
}

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
  const packageDirName = basename(dir)

  const packageJson = JSON.parse(
    readFileSync(resolve(dir, 'package.json'), { encoding: 'utf-8' }),
  )

  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.peerDependencies || {}),
    ...(globalPackageJson.devDependencies || {}),
    ...(globalPackageJson.dependencies || {}),
  }

  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        name: `albus_${packageDirName}`,
        entry: resolve(dir, 'src', 'index.ts'),
        fileName: format => `index.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: Array.from(new Set([...Object.keys(deps), ...external])),
        plugins: [
          dts({
            // rollupTypes: true,
          }),
          inject({
            Buffer: ['buffer', 'Buffer'],
          }) as PluginOption,
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
        // 'assert': 'assert',
        // 'node:crypto': 'crypto-browserify',
        // 'buffer': 'buffer',
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
    testTimeout: 10000,
  },
} as any)
