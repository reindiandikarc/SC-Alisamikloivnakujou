/*
 * vanXone — ALQANIME AUTO NOTIF
 * Source: https://alqanime.net/
 * Check: 15 minutes
 */

import * as cheerio from 'cheerio'

const SITE = 'https://alqanime.net'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': SITE + '/'
}

async function getHTML(url) {
  const res = await fetch(url, {
    headers,
    timeout: 30000
  })

  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)

  return await res.text()
}

// ============================================================
// AMBIL RILISAN TERBARU
// ============================================================

export async function getLatest() {
  const html = await getHTML(SITE + '/')
  const $ = cheerio.load(html)

  const results = []
  const seen = new Set()

  /*
   * Cari heading "Rilisan Terbaru"
   */
  let section = null

  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const text = $(el).text().trim().toLowerCase()

    if (
      text.includes('rilisan terbaru') &&
      !section
    ) {
      section = $(el)
    }
  })

  /*
   * Ambil parent/container dari heading.
   */
  let container = section

  if (section && section.length) {
    for (let i = 0; i < 4; i++) {
      if (
        container.parent().length &&
        container.parent().find('a').length >= 3
      ) {
        container = container.parent()
        break
      }

      container = container.parent()
    }
  }

  /*
   * Kalau section tidak ketemu,
   * fallback ke homepage seluruh link alqanime.
   */
  const links = container && container.length
    ? container.find('a[href]')
    : $('a[href]')

  links.each((i, el) => {
    const a = $(el)

    const href = a.attr('href')
    if (!href)
      return

    let url

    try {
      url = new URL(href, SITE).href
    } catch {
      return
    }

    /*
     * Hanya halaman anime.
     */
    if (!url.startsWith(SITE))
      return

    if (
      url === SITE ||
      url === SITE + '/' ||
      url.includes('/category/') ||
      url.includes('/genre/') ||
      url.includes('/season/') ||
      url.includes('/studio/') ||
      url.includes('/page/') ||
      url.includes('/tag/') ||
      url.includes('/jadwal-rilis') ||
      url.includes('/advanced-search')
    ) {
      return
    }

    const title = a.text()
      .replace(/\s+/g, ' ')
      .trim()

    if (!title)
      return

    /*
     * Jangan masukkan link yang cuma menu.
     */
    if (
      title.length < 3 ||
      title.toLowerCase() === 'lihat semua'
    ) {
      return
    }

    if (seen.has(url))
      return

    seen.add(url)

    const parent = a.closest('article, li, .bs, .bsx, .item')

    const poster =
      parent.find('img').first().attr('src') ||
      parent.find('img').first().attr('data-src') ||
      ''

    results.push({
      title,
      url,
      poster
    })
  })

  /*
   * Alqanime saat ini menampilkan rilisan terbaru
   * dari yang paling baru ke lama.
   */
  return results.slice(0, 30)
}

// ============================================================
// KIRIM NOTIF
// ============================================================

export default {
  getLatest
};
