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

function serve({ open, ready, notify } = { open: true, notify: true }) {
  const site = "samples/_site";
  const browserSync = bs.create('docfx')

  return browserSync.init({
    open,
    notify,
    callbacks: {
      ready: ready ? (err, bs)  => ready(bs.options.get('urls').get('local')) : undefined
    },
    files: [
      'debug/dist',
      join(site, '**')
    ],
    server: [
      'debug',
      '.',
      site
    ]
  })
}

function buildContent() {
  spawnSync('docfx build samples', { stdio: 'inherit', shell: true })
}

module.exports = { start }

if (require.main === module ) {
  start()
}
