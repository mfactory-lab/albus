import { type Options, defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['cjs'],
  noExternal: ['chalk'],
  platform: 'node',
  skipNodeModulesBundle: true,
  cjsInterop: true,
  clean: true,
  shims: true,
  bundle: true,
  ...options,
}))
