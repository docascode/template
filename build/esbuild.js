import { build } from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'

export function buildDist({ watch }) {

  const watchOptions = watch ? {
    minify: false,
    sourcemap: false,
    treeShaking: false,
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error('watch build failed:', error)
        } else {
          console.log('watch build succeeded:', result)
        }
      }
    }
  } : {}

  return build(Object.assign(watchOptions, {
    entryPoints: [
      'src/docfx.ts',
      'src/docfx.worker.ts',
      'src/docfx.scss',
    ],
    outdir: 'dist',
    bundle: true,
    minify: true,
    sourcemap: true,
    treeShaking: true,
    plugins: [
      sassPlugin()
    ]
  }))
}