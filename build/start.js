import { join } from 'path'
import bs from 'browser-sync'
import { buildDist } from './esbuild.js'
import { spawnSync } from 'child_process';

buildContent()

Promise.all([
  buildDist({ watch: true }),
  serve()
])

function serve() {
  const site = "samples/_site";
  const browserSync = bs.create('docfx')

  return browserSync.init({
    open: true,
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
