const { join } = require('path')
const bs = require('browser-sync')
const { buildTemplate, buildContent } = require('./build.js')

function start(options) {
  buildContent()
  
  Promise.all([
    buildTemplate({ watch: true }),
    serve(options)
  ])
}

function serve() {
  const site = "samples/_site";
  const browserSync = bs.create('docfx')

  return browserSync.init({
    open: true,
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

module.exports = { start }

if (require.main === module ) {
  start()
}
