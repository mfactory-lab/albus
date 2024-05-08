import { basename, dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import type { BuildOptions, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// export default defineConfig({
//   test: {
//     globals: true,
//     include: ['packages/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
//     environment: 'node',
//     // environment: 'jsdom',
//     testTimeout: 20000,
//   },
// } as any)

const inline: string[] = [
  // TODO: fixme this libs doesn't support commonjs, used for `albus-issuer` and `albus-verifier`
  // '@sphereon/pex',
  'lodash-es',
  'key-did-resolver',
  'multiformats/bases/base58',
  'multiformats/bases/base64',
  'varint',
  'bigint-mod-arith',
  'nist-weierstrauss',
]

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
    // resolve: mergeDeep({
    //   alias: {
    //     'node:buffer': 'buffer',
    //   },
    // }, options.resolve),
    build: viteBuild(packageDirName, options.build),
    test: {
      globals: true,
      // include: ['packages/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      // environment: 'node',
      // environment: 'jsdom',
      testTimeout: 20000,
      pool: 'forks', // default `threads` doesn't work with `ffjavascript` lib
    },
  } as UserConfig)
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
        fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
        formats: ['cjs', 'es'],
      },
      rollupOptions: {
        external: (source: string) => {
          return !inline.includes(source)
            && !source.startsWith('.')
            && !source.startsWith('@/')
            && !source.startsWith('~/')
            && !isAbsolute(source)
        },
        plugins: [
          dts({
            rollupTypes: true,
            // insertTypesEntry: true,
          }),
          nodePolyfills({
            protocolImports: true,
          }),
          // inject({ Buffer: ['buffer', 'Buffer'] }) as PluginOption,
        ],
        output: {
          dir: resolve(dir, 'dist'),
        },
      },
    },
    options,
  )
}

const isObject = (item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && !Array.isArray(item))

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
