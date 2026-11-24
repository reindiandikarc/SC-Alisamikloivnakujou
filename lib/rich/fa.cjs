/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

// =====================================================================
//  lib/fa.js — IKON FONT AWESOME (Free 7.3, SVG inline — TANPA CDN, TANPA internet)   [v8]
//
//  Kenapa inline, bukan <link> CDN?  Kartu HTML WhatsApp berjalan di webview terbatas; stylesheet/font dari
//  CDN bisa diblokir sehingga ikon jadi kotak kosong. SVG Font Awesome yang ditanam langsung di kartu
//  tampil sama persis (bentuknya identik dengan fa-solid / fa-brands) dan selalu muncul.
//
//  v8: set ikon LENGKAP (±2000 solid + brand pilihan, prefix "b-") dan pemetaan ±850 emoji -> ikon.
//      Mode RICH tidak pernah menampilkan emoji: setiap emoji di teks otomatis jadi ikon FA (berwarna bila
//      punya warna makna: centang hijau, silang merah, medali emas/perak/perunggu, dll). Emoji yang tidak
//      punya padanan dibuang (bukan ditampilkan sebagai emoji).
//
//  Dipakai oleh: richui (kartu HTML), richui.client (menu), ui.js (banner/tile canvas via Path2D).
//  Lisensi ikon: Font Awesome Free — CC BY 4.0 (https://fontawesome.com/license/free)
// =====================================================================

'use strict'

const data = require('./fa-icons.json')

const norm = (e) => String(e || '').replace(/️/g, '').trim()
const has = (n) => !!data.icons[n]
const nameOf = (e) => data.emoji[norm(e)] || ''
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// warna makna untuk emoji tertentu (sisanya mewarisi warna teks / aksen kartu)
const TINT = {
  '✅': '#34d399', '✔': '#34d399', '☑': '#34d399', '🆗': '#34d399', '🟢': '#34d399', '🟩': '#34d399', '✓': '#34d399',
  '❌': '#fb7185', '✖': '#fb7185', '🔴': '#fb7185', '🟥': '#fb7185', '⛔': '#fb7185', '🚫': '#fb7185', '❎': '#fb7185', '✕': '#fb7185',
  '⚠': '#fbbf24', '🚨': '#fb7185', '🟡': '#fbbf24', '🟨': '#fbbf24', '⭐': '#fbbf24', '🌟': '#fbbf24', '✨': '#fcd34d', '💰': '#fbbf24', '🪙': '#fbbf24', '🏆': '#fbbf24', '💡': '#fcd34d',
  '🟠': '#fb923c', '🔥': '#fb923c', '🟣': '#a78bfa', '🔵': '#60a5fa', '🟦': '#60a5fa', '⚫': '#9ca3af', '⬛': '#9ca3af', '⚪': '#e5e7eb', '⬜': '#e5e7eb',
  '❤': '#fb7185', '💔': '#fb7185', '💕': '#fb7185', '💖': '#f472b6', '💘': '#f472b6', '💞': '#f472b6', '💙': '#60a5fa', '💚': '#34d399', '💛': '#fbbf24', '🧡': '#fb923c', '💜': '#a78bfa', '🖤': '#9ca3af',
  '🥇': '#ffd24a', '🥈': '#d5dde8', '🥉': '#e0954f', '👑': '#fbbf24', '💎': '#67e8f9', '🍎': '#fb7185', '🍒': '#fb7185', '🍋': '#fde047', '🍇': '#a78bfa', '🍉': '#fb7185', '🍊': '#fb923c', '🍌': '#fde047', '🍅': '#fb7185',
  '🌈': '#a78bfa', '🌙': '#fcd34d', '☀': '#fbbf24', '☁': '#cbd5e1', '🌊': '#38bdf8', '💧': '#38bdf8', '🌱': '#34d399', '🍀': '#34d399', '🌿': '#34d399', '🌸': '#f9a8d4', '🌹': '#fb7185'
}

// ---------------------------------------------------------------- deteksi emoji di dalam teks
// Dikonversi bila: bergaya emoji (Emoji_Presentation), diikuti VS16 (U+FE0F), keycap, bendera, atau termasuk
// daftar simbol yang lazim dipakai sebagai emoji walau tanpa VS16. Simbol tipografi (▬ ➥ ✦ ◦ ▰ ❝ ...) dibiarkan.
const LOOSE = new Set('⚠❤ℹ✔☑✖✂✈✉✏⚙⚖☀☁☂☎♻⚡✌☺☹☠⚔⚓⚽⛄⛅⛔⛽✊✋✨❄❓❔❕❗➕➖➗✅❌❎✍⌨⏱⏲⏰⌛⏳▶⏩⏪⏭⏮⏫⏬⏸⏹⏺♟♠♣♥♦☕♈♉♊♋♌♍♎♏♐♑♒♓⛓⚒⚗⚑♿ⓜ☑'.split(''))
const EMOJI_RE = /(?:\p{Regional_Indicator}{2}|[#*0-9]️?⃣|(?:\p{Extended_Pictographic}|[✓✕✗✘★☆])(?:️|\p{Emoji_Modifier})?(?:‍(?:\p{Extended_Pictographic})(?:️|\p{Emoji_Modifier})?)*)/gu
const SKIP = new Set(['©', '®', '™'])

function isEmojiToken(tok) {
  if (SKIP.has(tok)) return false
  if (/⃣|^\p{Regional_Indicator}/u.test(tok)) return true
  if (tok.includes('️') || tok.includes('‍')) return true
  const cp = tok.codePointAt(0)
  if (/^[✓✕✗✘★☆]$/.test(tok)) return true
  if (cp >= 0x1f000) return true
  if (/^\p{Emoji_Presentation}/u.test(tok)) return true
  return LOOSE.has(String.fromCodePoint(cp))
}

// satu ikon: <svg class="fi"><use href="#f-nama"/></svg> (butuh sprite -> lihat withSprite)
function useTag(name, cls = 'fi', tint = '') {
  return `<svg class="${cls}" aria-hidden="true"${tint ? ` style="color:${tint}"` : ''}><use href="#f-${name}"/></svg>`
}

// icon('✅') / icon('circle-check') -> <svg>; emoji tanpa padanan -> '' (tidak pernah emoji)
function icon(e, cls = 'fi', fallback = '') {
  const raw = String(e || '').trim()
  if (has(raw)) return useTag(raw, cls)
  const n = nameOf(raw) || fallback
  if (!n || !has(n)) return ''
  const key = norm(raw)
  return useTag(n, cls, TINT[key] || TINT[key.replace(/️/g, '')] || '')
}

// ganti SEMUA emoji di dalam string yang SUDAH di-escape HTML menjadi ikon FA (emoji tanpa padanan dibuang)
function html(s) {
  return String(s == null ? '' : s).replace(EMOJI_RE, (tok) => {
    if (!isEmojiToken(tok)) return tok
    if (/^[#*0-9]\uFE0F?\u20E3$/u.test(tok)) return tok[0] === '#' || tok[0] === '*' ? tok[0] : tok[0] // keycap -> angkanya saja
    if (tok === '🔟') return '10'
    const k = norm(tok)
    const n = data.emoji[k] || data.emoji[k.replace(/‍.*$/u, '')]
    if (!n || !has(n)) return ''
    return useTag(n, 'fi', TINT[k] || '')
  })
}

// hapus semua emoji dari teks biasa (untuk konteks tanpa HTML)
function strip(s) {
  return String(s == null ? '' : s).replace(EMOJI_RE, (tok) => (isEmojiToken(tok) ? '' : tok)).replace(/[ \t]{2,}/g, ' ')
}

// sisipkan ikon untuk bagian teks saja (bukan di dalam tag HTML)
function htmlText(h) {
  return String(h).split(/(<[^>]*>)/).map((seg) => (seg.startsWith('<') ? seg : html(seg))).join('')
}

const symbol = (n) => `<symbol id="f-${n}" viewBox="${data.icons[n].vb}"><path d="${data.icons[n].d}"/></symbol>`
const spriteFor = (names) => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[...new Set(names)].filter(has).map(symbol).join('')}</defs></svg>`

// sisipkan sprite berisi hanya ikon yang dipakai di html (cari "#f-nama")
function withSprite(h) {
  const names = [...String(h).matchAll(/href="#f-([a-z0-9-]+)"/g)].map((m) => m[1])
  return names.length ? spriteFor(names) + h : h
}

// ---------------------------------------------------------------- kartu game HTML (sonik, chess, slot, dll)
// Token {{fa:nama}} / {{fa:nama|#warna}} di HTML maupun string JS -> <svg> ikon FA. Emoji yang tersisa di bagian HTML
// jadi ikon; di dalam <script>/<style> dibuang. Sprite & CSS .fi ditambahkan otomatis.
function gameHtml(src) {
  let h = String(src).replace(/\{\{fa:([a-z0-9-]+)(?:\|(#[0-9a-fA-F]{3,8}))?\}\}/g, (m, n, c) => (has(n) ? useTag(n, 'fi', c || '') : ''))
  const parts = h.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/i)
  h = parts
    .map((seg) => (/^<script/i.test(seg) ? seg.replace(EMOJI_RE, (t) => (t.codePointAt(0) >= 0x1f000 || /[\uFE0F\u200D\u20E3]/.test(t) ? '' : t)) : /^<style/i.test(seg) ? seg : htmlText(seg)))
    .join('')
  const names = [...h.matchAll(/href="#f-([a-z0-9-]+)"/g)].map((m) => m[1])
  if (!names.length) return h
  const css = '<style>.fi{width:1em;height:1em;fill:currentColor;flex:none;vertical-align:-.14em}</style>'
  return css + spriteFor(names) + h
}

// ikon kategori & nada (nama FA) untuk kartu HTML dan gambar canvas
const CAT = { info: 'circle-info', group: 'user-group', sticker: 'note-sticky', downloader: 'download', game: 'gamepad', fun: 'masks-theater', tools: 'toolbox', image: 'image', audio: 'headphones', video: 'clapperboard', dokumen: 'file-lines', islam: 'mosque', channel: 'bullhorn', owner: 'crown', rpg: 'shield-halved', ui: 'palette', lainnya: 'layer-group' }
const TONE = { ok: 'check', err: 'xmark', warn: 'exclamation', denied: 'lock', usage: 'question', info: 'info', gold: 'star' }
// ikon besar nada untuk header kartu
const TONE_FA = { ok: 'circle-check', err: 'circle-xmark', warn: 'triangle-exclamation', denied: 'lock', usage: 'book-open', info: 'circle-info', gold: 'star' }

let P2D
function path2d() {
  if (P2D === undefined) {
    P2D = typeof Path2D !== 'undefined' ? Path2D : null
    if (!P2D) {
      try {
        P2D = require('@napi-rs/canvas').Path2D || null
      } catch {
        P2D = null
      }
    }
  }
  return P2D
}
const cache = {}

// gambar ikon FA ke canvas, ditaruh di tengah (cx, cy) dengan lebar/tinggi maksimum `size`. name = nama FA atau emoji
function draw(g, name, cx, cy, size, color = '#fff') {
  const key = has(name) ? name : nameOf(name)
  const ic = data.icons[key]
  const P = path2d()
  if (!ic || !P) return false
  try {
    const [x, y, w, h] = ic.vb.split(' ').map(Number)
    const p = cache[key] || (cache[key] = new P(ic.d))
    const s = size / Math.max(w, h)
    g.save()
    g.translate(cx - (x + w / 2) * s, cy - (y + h / 2) * s)
    g.scale(s, s)
    g.fillStyle = color
    g.fill(p)
    g.restore()
    return true
  } catch {
    return false
  }
}

module.exports = { gameHtml, nameOf, has, icon, useTag, html, htmlText, strip, spriteFor, withSprite, draw, CAT, TONE, TONE_FA, TINT, data, norm, EMOJI_RE, isEmojiToken, esc }
