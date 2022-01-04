const { start } = require('./start.js')
const { Cluster } = require('puppeteer-cluster')
const { exit } = require('process')

const urls = [
  '/',
  '/tutorial/docfx_getting_started',
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
    maxConcurrency: 2,
  });

  await cluster.task(async ({ page, data : { url, viewport } }) => {
    const path = `tests/screenshots/${url.slice(1).replace(/[/]+/g, '-')}-${viewport.width}-${viewport.height}.png`
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
  exit(0)
}

module.exports = { diff }

if (require.main === module ) {
  diff()
}
