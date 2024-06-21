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
    noExternal: [
      // ESM only
      'crypto-ld',
      'jsonld-document-loader',
      // 'key-did-resolver',
    ],
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
