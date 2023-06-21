import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BuildOptions, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import inject from '@rollup/plugin-inject'

import globalPackageJson from './package.json'

const external = [
  'tslib',
  'snarkjs',
  'circomlibjs',
  '@albus/core',
]

export const libFileName = (format: string) => `index.${format}.js`

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

  const packageJson = JSON.parse(readFileSync(resolve(dir, 'package.json'), { encoding: 'utf-8' }))
  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.peerDependencies || {}),
    ...(globalPackageJson.devDependencies || {}),
    // ...(globalPackageJson.dependencies || {}),
  }
  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        entry: resolve(dir, 'src', 'index.ts'),
        name: `albus_${packageDirName}`,
        fileName: libFileName,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: Array.from(new Set([...Object.keys(deps), ...external])),
        plugins: [
          inject({ Buffer: ['buffer', 'Buffer'] }),
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
    resolve: {
      alias: {
        'assert': 'assert',
        'node:crypto': 'crypto-browserify',
        'node:buffer': 'buffer',
      },
    },
    build: viteBuild(packageDirName, options.build),
  })
}

export default defineConfig({
  test: {
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'jsdom',
  },
})
