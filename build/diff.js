const { Cluster } = require('puppeteer-cluster')
const { exit } = require('process')
const { mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, cpSync, rmSync } = require('fs')
const { join } = require('path')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')
const http = require('http')
const statik = require('node-static')

const expectedDir = 'tests/screenshots/expected'
const actualDir = 'tests/screenshots/actual'
const diffDir = 'tests/screenshots/diff'

const urls = [
  '/',
  '/tutorial/getting-started/',
  '/tutorial/walkthrough/walkthrough_create_a_docfx_project_2/'
]

const themes = [
  'light',
  'dark'
]

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1152, height: 648 },
  { width: 768, height: 600 },
  { width: 375, height: 812, isMobile: true, hasTouch: true }
]

async function diff() {
  const url = await serve('./samples/_site')
  await captureScreenshots(url)
}

async function serve(dir) {
  return new Promise((resolve, reject) => {
    const file = new statik.Server(dir)
    const server = http.createServer((req, res) => file.serve(req, res))

    server.listen(0, 'localhost', async err => {
      if (err) {
        reject(err)
      } else {
        resolve(`http://localhost:${server.address().port}`)
      }
    })
  })
}

async function captureScreenshots(baseurl) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 8,
  });

  ensuredirSync(actualDir)

  await cluster.task(async ({ page, data: { url, viewport, theme } }) => {
    try {
      const path = `${actualDir}/${url.slice(1).replace(/[/]+/g, '-')}-${viewport.width}-${viewport.height}-${theme}.png`
      await page.setCookie({ name: 'docfx.theme', value: theme, domain: 'localhost' })
      await page.setViewport(viewport)
      await page.goto(baseurl + url, {
        waitUntil: 'networkidle0'
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
      await page.screenshot({ path, fullPage: true })
      console.log(`Save screenshot to ${path}`)
    } catch (e) {
      console.error(e)
    }
  });

  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const url of urls) {
        cluster.queue({ url, viewport, theme });
      }
    }
  }

  await cluster.idle();
  await cluster.close();

  exit(compare(expectedDir, actualDir) ? 1 : 0)
}

function ensuredirSync(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function compare(base, target) {
  let hasDiff = false

  if (existsSync(base)) {
    for (const filename of readdirSync(base)) {
      try {
        console.log(`  ${join(base, filename)} --> ${join(target, filename)}`)

        const img1 = PNG.sync.read(readFileSync(join(base, filename)))
        const img2 = PNG.sync.read(readFileSync(join(target, filename)))
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const n = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 })
        if (n == 0) {
          continue
        }

        const diffFile = join(diffDir, filename)
        ensuredirSync(diffDir)
        writeFileSync(diffFile, PNG.sync.write(diff))
        console.error(`Pixelmatch diff [${n}]: ${diffFile}`)

        hasDiff = true
      } catch (err) {
        console.error(err)
        hasDiff = true
      }
    }

    return hasDiff
  }
}

function acceptDiff() {
  if (existsSync(actualDir)) {
    if (existsSync(expectedDir)) {
      rmSync(expectedDir, { force: true, recursive: true })
    }
    cpSync(actualDir, expectedDir, { force: true, recursive: true })
  }
}

module.exports = { diff, acceptDiff }

if (require.main === module) {
  if (process.argv.includes('--accept')) {
    acceptDiff()
  } else {
    diff()
  }
}
