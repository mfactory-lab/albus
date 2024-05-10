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
  // platform: 'neutral',
  // noExternal: ['lodash-es'],
  // skipNodeModulesBundle: true,
  ...options,
}))
