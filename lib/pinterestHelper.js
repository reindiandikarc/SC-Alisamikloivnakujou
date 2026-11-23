/**
 * pinterestHelper.js
 * Shared helper untuk semua plugin berbasis Pinterest
 * Alya V13 - Fixed & Working
 */

const axios = require('axios')

/**
 * Cari gambar dari Pinterest, kembalikan 1 URL random dari hasil
 * @param {string} query - keyword pencarian
 * @param {number} limit - jumlah hasil yang diambil (default 15)
 * @returns {string|null} URL gambar atau null jika gagal
 */
async function searchPinterest(query, limit = 15) {
  // ── API 1: nexray ──────────────────────────────────────────
  try {
    const { data } = await axios.get(
      `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    )

    if (data?.status && Array.isArray(data.result) && data.result.length) {
      const urls = data.result
        .map(item => item.images_url)
        .filter(Boolean)

      if (urls.length) return pickRandom(urls)
    }
  } catch (e) {
    console.warn('[PinterestHelper] API1 (nexray) gagal:', e.message)
  }

  // ── API 2: anabot fallback ─────────────────────────────────
  try {
    const { data } = await axios.get(
      `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=freeApikey`,
      { timeout: 15000 }
    )

    if (data?.success && data?.data?.result?.length) {
      const urls = data.data.result
        .map(pin =>
          pin.images?.['736x']?.url ||
          pin.images?.['345x']?.url ||
          pin.images?.['200x']?.url
        )
        .filter(Boolean)

      if (urls.length) return pickRandom(urls)
    }
  } catch (e) {
    console.warn('[PinterestHelper] API2 (anabot) gagal:', e.message)
  }

  // ── API 3: naoai fallback ──────────────────────────────────
  try {
    const { data } = await axios.get(
      `https://api.naoai.web.id/api/pinterest?query=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    )

    if (Array.isArray(data?.data) && data.data.length) {
      const urls = data.data
        .map(item => item.url || item.image || item.images_url)
        .filter(Boolean)

      if (urls.length) return pickRandom(urls)
    }
  } catch (e) {
    console.warn('[PinterestHelper] API3 (naoai) gagal:', e.message)
  }

  return null
}

/**
 * Ambil beberapa gambar sekaligus (untuk carousel)
 * @param {string} query
 * @param {number} count - jumlah gambar yang dikembalikan (max 15)
 * @returns {string[]} array URL gambar
 */
async function searchPinterestMulti(query, count = 5) {
  // API 1: nexray
  try {
    const { data } = await axios.get(
      `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    )

    if (data?.status && Array.isArray(data.result) && data.result.length) {
      const urls = data.result
        .map(item => item.images_url)
        .filter(Boolean)
        .slice(0, count)

      if (urls.length) return urls
    }
  } catch (e) {
    console.warn('[PinterestHelper] Multi API1 gagal:', e.message)
  }

  // API 2: anabot
  try {
    const { data } = await axios.get(
      `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=freeApikey`,
      { timeout: 15000 }
    )

    if (data?.success && data?.data?.result?.length) {
      const urls = data.data.result
        .map(pin =>
          pin.images?.['736x']?.url ||
          pin.images?.['345x']?.url ||
          pin.images?.['200x']?.url
        )
        .filter(Boolean)
        .slice(0, count)

      if (urls.length) return urls
    }
  } catch (e) {
    console.warn('[PinterestHelper] Multi API2 gagal:', e.message)
  }

  return []
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

module.exports = { searchPinterest, searchPinterestMulti }
