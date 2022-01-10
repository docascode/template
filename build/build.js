const esbuild = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')
const { spawnSync } = require('child_process')
const { join } = require('path')

process.env.PATH = join(__dirname, '../bin') + process.env.PATH

function buildTemplate({ watch } = {}) {

  const debug = {
    outdir: 'debug/dist',
    bundle: true,
    minify: false,
    sourcemap: true,
    treeShaking: true,
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error('watch build failed:', error)
        } else {
          console.log('watch build succeeded:', result)
        }
      }
    }
  }

  const release = {
    outdir: 'dist',
    bundle: true,
    minify: true,
    minifySyntax: true,
    sourcemap: false,
    treeShaking: true,
  }

  return esbuild.build(Object.assign(watch ? debug : release, {
    entryPoints: [
      'src/docfx.ts',
      'src/docfx.scss',
    ],
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


function buildContent() {
  spawnSync('docfx build samples', { stdio: 'inherit', shell: true })
}

module.exports = { buildTemplate, buildContent }

if (require.main === module) {
  buildTemplate()
  buildContent()
}
