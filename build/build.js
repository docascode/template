const esbuild = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')

function build({ watch } = {}) {

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

  return esbuild.build(Object.assign(watchOptions, {
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

module.exports = { build }

if (require.main === module) {
  build()
}
