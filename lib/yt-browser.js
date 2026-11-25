'use strict';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

let browserPromise = null;

function pickIzukaDownloadUrl(data) {
  if (!data || typeof data !== 'object') return null;
  const result = data.result && typeof data.result === 'object' ? data.result : {};
  for (const candidate of [result.download_url, result.url, result.downloadUrl, data.download_url]) {
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) return candidate.trim();
  }
  return null;
}

function resetBrowser() {
  const pending = browserPromise;
  browserPromise = null;
  if (pending) {
    pending.then((b) => { if (b && b.close) b.close().catch(() => {}); }).catch(() => {});
  }
}

async function getBrowser() {
  if (browserPromise) return browserPromise;
  browserPromise = (async () => {
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.CHROMIUM_BIN || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    browser.on('disconnected', () => { browserPromise = null; });
    return browser;
  })().catch((e) => {
    browserPromise = null;
    throw e;
  });
  return browserPromise;
}

async function fetchBuffer(url, { timeout = 60000, range } = {}) {
  const browser = await getBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setDefaultTimeout(timeout);
    let origin;
    try { origin = new URL(url).origin; } catch { origin = 'https://yotomp3.com'; }
    await page.goto(origin + '/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    const out = await page.evaluate(async ({ target, rangeHeader }) => {
      const init = rangeHeader ? { headers: { Range: rangeHeader } } : {};
      const res = await fetch(target, init);
      if (!res.ok && res.status !== 206) throw new Error('HTTP ' + res.status);
      const bytes = new Uint8Array(await res.arrayBuffer());
      let raw = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        raw += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
      }
      return { status: res.status, type: res.headers.get('content-type') || '', b64: btoa(raw) };
    }, { target: url, rangeHeader: range });
    if (!out || !out.b64) throw new Error('Browser fetch kosong');
    const buffer = Buffer.from(out.b64, 'base64');
    if (!buffer.length) throw new Error('Browser fetch menghasilkan buffer kosong');
    return { status: out.status, type: out.type, buffer };
  } catch (e) {
    resetBrowser();
    throw e;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

module.exports = { UA, pickIzukaDownloadUrl, resetBrowser, getBrowser, fetchBuffer };
