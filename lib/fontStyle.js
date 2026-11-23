/**
 * ALYA V20 — Font Style Library
 * Konversi teks biasa → Unicode lookalike yang keren tapi tetap terbaca.
 *
 * Cara pakai:
 *   const { applyFont, FONTS } = require('./lib/fontStyle')
 *   applyFont('Halo dunia!', 'bold')        // 𝗛𝗮𝗹𝗼 𝗱𝘂𝗻𝗶𝗮!
 *   applyFont('Halo dunia!', 'italic')      // 𝘏𝘢𝘭𝘰 𝘥𝘶𝘯𝘪𝘢!
 *
 * Strategi:
 *   - Hanya huruf Latin (a-z, A-Z) & angka (0-9) yang di-convert.
 *   - Karakter lain (emoji, spasi, tanda baca, huruf Indonesia) dibiarkan asli
 *     supaya tetap nyaman dibaca & emoji tidak rusak.
 *   - Style 'default' = tidak ada konversi (font normal).
 */

'use strict'

// ─── Definisi semua font ───────────────────────────────────────────────────

/**
 * Setiap entry: { upper, lower, digit }
 *   upper : string 26 karakter, A-Z Unicode
 *   lower : string 26 karakter, a-z Unicode
 *   digit : string 10 karakter, 0-9 Unicode (boleh null → pakai angka biasa)
 */
const FONT_MAP = {

  // ── 0. Default (tidak diubah) ──────────────────────────────────────────
  default: null,

  // ── 1. Bold — 𝗛𝗮𝗹𝗼 𝗱𝘂𝗻𝗶𝗮 ──────────────────────────────────────────────
  bold: {
    upper: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
    lower: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
    digit: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
  },

  // ── 2. Italic — 𝘏𝘢𝘭𝘰 𝘥𝘶𝘯𝘪𝘢 ──────────────────────────────────────────────
  italic: {
    upper: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡',
    lower: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
    digit: null,
  },

  // ── 3. Bold Italic — 𝙃𝙖𝙡𝙤 𝙙𝙪𝙣𝙞𝙖 ─────────────────────────────────────
  bolditalic: {
    upper: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕',
    lower: '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯',
    digit: null,
  },

  // ── 4. Monospace — 𝙷𝚊𝚕𝚘 𝚍𝚞𝚗𝚒𝚊 ────────────────────────────────────────
  mono: {
    upper: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    lower: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
    digit: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
  },

  // ── 5. Script / Cursive — 𝒽𝒶𝓁𝑜 𝒹𝓊𝓃𝒾𝒶 ────────────────────────────────
  script: {
    upper: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
    lower: '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏',
    digit: null,
  },

  // ── 6. Bold Script — 𝓗𝓪𝓵𝓸 𝓭𝓾𝓷𝓲𝓪 ─────────────────────────────────────
  boldscript: {
    upper: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩',
    lower: '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃',
    digit: null,
  },

  // ── 7. Double Struck — ℍ𝕒𝕝𝕠 𝕕𝕦𝕟𝕚𝕒 ────────────────────────────────────
  doublestruck: {
    upper: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    lower: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    digit: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
  },

  // ── 8. Fraktur / Gothic — 𝔥𝔞𝔩𝔬 𝔡𝔲𝔫𝔦𝔞 ────────────────────────────────
  fraktur: {
    upper: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ',
    lower: '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷',
    digit: null,
  },

  // ── 9. Small Caps — Hᴀʟᴏ ᴅᴜɴɪᴀ ──────────────────────────────────────────
  smallcaps: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀsᴛᴜᴠᴡxʏᴢ',
    digit: null,
  },

  // ── 10. Wide / Fullwidth — Ｈａｌｏ ｄｕｎｉａ ──────────────────────────────
  wide: {
    upper: 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ',
    lower: 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ',
    digit: '０１２３４５６７８９',
  },
}

// ─── Daftar publik untuk .setfont list ────────────────────────────────────
const FONTS = {
  default:     { label: '✍️  Default',       preview: 'Halo Alya!' },
  bold:        { label: '𝗕𝗼𝗹𝗱',             preview: '𝗛𝗮𝗹𝗼 𝗔𝗹𝘆𝗮!' },
  italic:      { label: '𝘐𝘵𝘢𝘭𝘪𝘤',           preview: '𝘏𝘢𝘭𝘰 𝘈𝘭𝘺𝘢!' },
  bolditalic:  { label: '𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘',     preview: '𝙃𝙖𝙡𝙤 𝘼𝙡𝙮𝙖!' },
  mono:        { label: '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎',       preview: '𝙷𝚊𝚕𝚘 𝙰𝚕𝚢𝚊!' },
  script:      { label: '𝒮𝒸𝓇𝒾𝓅𝓉',          preview: '𝒽𝒶𝓁𝑜 𝒜𝓁𝓎𝒶!' },
  boldscript:  { label: '𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽',   preview: '𝓗𝓪𝓵𝓸 𝓐𝓵𝔂𝓪!' },
  doublestruck:{ label: '𝔻𝕠𝕦𝕓𝕝𝕖 𝕊𝕥𝕣𝕦𝕔𝕜', preview: 'ℍ𝕒𝕝𝕠 𝔸𝕝𝕪𝕒!' },
  fraktur:     { label: '𝔉𝔯𝔞𝔨𝔱𝔲𝔯',         preview: '𝔥𝔞𝔩𝔬 𝔄𝔩𝔶𝔞!' },
  smallcaps:   { label: 'Sᴍᴀʟʟ Cᴀᴘs',      preview: 'Hᴀʟᴏ Aʟʏᴀ!' },
  wide:        { label: 'Ｗｉｄｅ',            preview: 'Ｈａｌｏ Ａｌｙａ！' },
}

// ─── Core converter ───────────────────────────────────────────────────────

/**
 * Konversi satu karakter ke Unicode font target.
 * Karakter yang tidak ada di map dikembalikan apa adanya.
 */
function convertChar(ch, map) {
  if (!map) return ch
  const code = ch.codePointAt(0)
  // Uppercase A-Z  → 65-90
  if (code >= 65 && code <= 90) {
    return [...map.upper][code - 65] || ch
  }
  // Lowercase a-z  → 97-122
  if (code >= 97 && code <= 122) {
    return [...map.lower][code - 97] || ch
  }
  // Digit 0-9      → 48-57
  if (code >= 48 && code <= 57 && map.digit) {
    return [...map.digit][code - 48] || ch
  }
  return ch
}

/**
 * Terapkan font style ke string teks.
 *
 * @param {string} text      Teks asli (boleh multi-line, ada emoji, dll)
 * @param {string} fontName  Nama font dari FONTS / FONT_MAP
 * @returns {string}         Teks dengan font Unicode yang diterapkan
 */
function applyFont(text, fontName) {
  if (!text || typeof text !== 'string') return text
  const map = FONT_MAP[fontName]
  if (!map) return text   // 'default' atau nama tidak dikenal → kembalikan asli

  // Iterasi codepoint-by-codepoint agar emoji (surrogate pairs) tidak rusak
  const result = []
  for (const ch of text) {
    result.push(convertChar(ch, map))
  }
  return result.join('')
}

/**
 * Baca font style yang sedang aktif dari global atau file DB.
 * Fallback ke 'default' jika belum pernah di-set.
 */
function getCurrentFont() {
  // Cek global runtime dulu (tercepat)
  if (global.botFontStyle && FONT_MAP.hasOwnProperty(global.botFontStyle)) {
    return global.botFontStyle
  }
  // Cek persistent DB
  try {
    const fs   = require('fs')
    const path = require('path')
    const db   = path.join(process.cwd(), 'database', 'font_style.json')
    if (fs.existsSync(db)) {
      const data = JSON.parse(fs.readFileSync(db, 'utf8'))
      if (data.style && FONT_MAP.hasOwnProperty(data.style)) {
        global.botFontStyle = data.style   // cache ke global
        return data.style
      }
    }
  } catch {}
  return 'default'
}

/**
 * Simpan font style ke file DB & global.
 */
function setCurrentFont(fontName) {
  if (!FONT_MAP.hasOwnProperty(fontName)) return false
  const fs   = require('fs')
  const path = require('path')
  global.botFontStyle = fontName
  try {
    const db = path.join(process.cwd(), 'database', 'font_style.json')
    fs.writeFileSync(db, JSON.stringify({ style: fontName }, null, 2), 'utf8')
    return true
  } catch { return false }
}

/**
 * Apply font otomatis berdasarkan setting aktif saat ini.
 * Dipakai oleh metacard.js untuk setiap balasan bot.
 */
function autoApplyFont(text) {
  const font = getCurrentFont()
  return applyFont(text, font)
}

// ─── Ekspor ────────────────────────────────────────────────────────────────
module.exports = {
  FONTS,
  FONT_MAP,
  applyFont,
  autoApplyFont,
  getCurrentFont,
  setCurrentFont,
}
