import { type Options, defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['cjs', 'esm'],
  cjsInterop: true,
  clean: true,
  treeshake: true,
  shims: true,
  dts: true,
  noExternal: [
    // used in @sphereon/pex
    'string.prototype.matchall',
    // 'key-did-resolver',
  ],
  ...options,
}))
