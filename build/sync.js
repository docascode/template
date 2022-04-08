const { join, dirname } = require('path')
const { copyFileSync, mkdirSync } = require('fs')
const glob = require('glob')

const config = [
  {
    src: 'packages/schemas/src',
    dest: 'ContentTemplate/schemas',
    files: [
      'Hub.schema.json'
    ]
  },
  {
    src: 'packages/docfx-templates',
    dest: 'ContentTemplate',
    files: [
      'Hub.html.primary.js',
      'Hub.html.primary.tmpl',
      'Hub.mta.json.js',
      'Hub.mta.json.js',
      'partials/hub/**/*'
    ]
  },
  {
    src: 'packages/site-templates',
    dest: '.',
    files: [
      'Hub.html.liquid'
    ]
  }
]

const root = join(__dirname, '..')
const docsui = join(__dirname, '../../docs-ui');

for (const { src, dest, files } of config) {
  for (const file of files) {
    const srcDir = join(docsui, src)
    for (const from of glob.sync(join(srcDir, file))) {
      const to = join(root, dest, from.slice(srcDir.length))
      console.log(`${from} --> ${to}`)
      mkdirSync(dirname(to), { recursive: true})
      copyFileSync(from, to)
    }
  }
}