const { join } = require('path')
const bs = require('browser-sync')
const { build } = require('./build.js')
const { spawnSync } = require('child_process')

function start(options) {
  buildContent()
  
  Promise.all([
    build({ watch: true }),
    serve(options)
  ])
}

function serve({ open, ready } = { open: true }) {
  const site = "samples/_site";
  const browserSync = bs.create('docfx')

  return browserSync.init({
    open,
    callbacks: {
      ready: ready ? (err, bs)  => ready(bs.options.get('urls').get('local')) : undefined
    },
    files: [
      'dist',
      join(site, '**')
    ],
    server: [
      '.',
      site
    ]
  })
}

function buildContent() {
  const options = { stdio: 'inherit', shell: true }
  spawnSync('dotnet tool update -g docfx --version "3.0.0-*" --add-source https://docfx.pkgs.visualstudio.com/docfx/_packaging/docs-public-packages/nuget/v3/index.json', options)
  spawnSync('docfx build samples --template .', options)
}

module.exports = { start }

if (require.main === module ) {
  start()
}
