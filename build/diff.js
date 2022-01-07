const { start } = require('./start.js')
const { Cluster } = require('puppeteer-cluster')
const { exit } = require('process')
const { mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const urls = [
  '/',
  '/tutorial/getting-started/',
  '/tutorial/walkthrough/walkthrough_create_a_docfx_project_2/'
]

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1152, height: 648 },
  { width: 768, height: 600 },
  { width: 375, height: 812, isMobile: true, hasTouch: true }
]

function diff() {
  start({ open: false, ready })
}

function ready(url) {
  captureScreenshots(url)
}

async function captureScreenshots(baseurl) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 8,
  });

  ensuredirSync('tests/screenshots/actual')

  await cluster.task(async ({ page, data: { url, viewport } }) => {
    const path = `tests/screenshots/actual/${url.slice(1).replace(/[/]+/g, '-')}-${viewport.width}-${viewport.height}.png`
    await page.setViewport(viewport)
    await page.goto(baseurl + url);
    await page.screenshot({ path, fullPage: true });
    console.log(`Save screenshot to ${path}`)
  });

  for (const viewport of viewports) {
    for (const url of urls) {
      cluster.queue({ url, viewport });
    }
  }

  await cluster.idle();
  await cluster.close();

  if (!compare('tests/screenshots/expected', 'tests/screenshots/actual')) {
    exit(1)
  }

  exit(0)
}

function ensuredirSync(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function compare(base, target) {
  let hasDiff = false

  for (const filename of readdirSync(base)) {

    const img1 = PNG.sync.read(readFileSync(join(base, filename)))
    const img2 = PNG.sync.read(readFileSync(join(target, filename)))
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    if (pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 }) == 0) {
      continue
    }

    writeFileSync(join(target, 'diff.' + filename), PNG.sync.write(diff))
    hasDiff = true
  }

  return hasDiff
}

module.exports = { diff }

if (require.main === module) {
  diff()
}
