const esbuild = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')

function build({ watch } = {}) {

  const watchOptions = watch ? {
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
      'src/docfx.scss',
    ],
    outdir: 'dist',
    bundle: true,
    minify: true,
    sourcemap: false,
    treeShaking: true,
    plugins: [
      sassPlugin()
    ],
    loader: {
      '.eot': 'file',
      '.svg': 'file',
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file'
    }
  }))
}

module.exports = { build }

if (require.main === module) {
  build()
}
