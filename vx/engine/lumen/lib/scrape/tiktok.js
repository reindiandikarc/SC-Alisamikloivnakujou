/**
 * Helper URL TikTok: ambil link dari teks dan resolve link pendek.
 * Mendukung: tiktok.com (www/vm/vt/m/vn), /t/xxx, /@user/video|photo/id, dan tt.site/t/xxx
 */
import fetch from 'node-fetch'

const URL_REGEX =
  /https?:\/\/(?:[\w-]+\.)*(?:tiktok\.com|tiktokv\.com|tt\.site)\/[^\s<>"'`]+/i

const CANONICAL_REGEX =
  /https?:\/\/(?:www\.|m\.)?tiktok\.com\/@[\w.-]+\/(?:video|photo)\/\d+/i

const UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'

/** Ambil URL TikTok pertama dari teks (bersihkan tanda baca di ujung). */
export function extractTikTokUrl(text = '') {
  const found = String(text).match(URL_REGEX)?.[0]
  return found ? found.replace(/[.,;:!?)\]}>]+$/, '') : null
}

/** Ikuti redirect link pendek sampai ketemu URL asli TikTok. Return null jika gagal. */
export async function resolveTikTokUrl(url, timeout = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
    })

    // 1) hasil redirect HTTP sudah berupa link video/foto
    const direct = res.url?.match(CANONICAL_REGEX)?.[0]
    if (direct) return direct

    // 2) redirect lewat HTML (meta refresh / JS) -> cari link video di body
    const html = await res.text()
    const fromBody = html.replace(/\\u002F/g, '/').replace(/\\\//g, '/').match(CANONICAL_REGEX)?.[0]
    if (fromBody) return fromBody

    // 3) terakhir: pakai URL akhir kalau sudah domain tiktok
    if (/tiktok\.com/i.test(res.url || '') && res.url !== url) return res.url
    return null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}