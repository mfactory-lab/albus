import { type Options, defineConfig } from 'tsup'

function baseConfig(platform: 'browser' | 'node', options: Options): Options {
  return {
    entry: ['src/index.ts'],
    sourcemap: true,
    format: ['cjs', 'esm'],
    // cjsInterop: true,
    clean: true,
    treeshake: true,
    shims: true,
    dts: true,
    external: [
      // fix: Could not resolve "crypto"
      '@solana/spl-type-length-value',
    ],
    noExternal: ['lodash-es'],
    outExtension({ format }) {
      return {
        js: `.${platform}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
      }
    },
    platform: platform === 'node' ? 'node' : 'browser',
    pure: ['process'],
    ...options,
  }
}

export default defineConfig((options: Options) => {
  return [baseConfig('node', options), baseConfig('browser', options)]
})
