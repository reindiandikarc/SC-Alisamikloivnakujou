// lib/ephoto.js
// Extracted from alya.js — ephoto360 scraper helper
// Di-require oleh semua ephoto plugin

'use strict'

const axios   = require('axios')
const cheerio = require('cheerio')
const FormData = require('form-data')

const EPHOTO_URLS = {
  // Group 1 — sandsummer.js
  sandsummer    : 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
  galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
  '1917style'   : 'https://en.ephoto360.com/1917-style-text-effect-523.html',
  // Group 2 — makingneon.js
  makingneon    : 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
  royaltext     : 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
  freecreate    : 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
  // Group 3 — royaltext.js (also handles galaxystyle + lighteffects)
  galaxystyle   : 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
  lighteffects  : 'https://en.ephoto360.com/create-light-effects-green-neon-online-429.html',
  // Group 4 — flagtext.js
  flagtext      : 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
  flag3dtext    : 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
  deletingtext  : 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
  // Group 5 — flag3dtext.js
  blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
  // Group 6 — glowingtext.js
  glowingtext   : 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
  underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
  logomaker     : 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
  // Group 7 — pixelglitch.js
  pixelglitch   : 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
  neonglitch    : 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
  glitchtext    : 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  // Group 8 — watercolortext.js
  watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
  effectclouds  : 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
  blackpinklogo : 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
  // Group 9 — gradienttext.js
  gradienttext  : 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
  summerbeach   : 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
  luxurygold    : 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
  // Group 10 — summerbeach.js (extra)
  multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
  // extras
  writetext     : 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
  advancedglow  : 'https://en.ephoto360.com/advanced-glow-effects-74.html',
  typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
  cartoonstyle  : 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
  papercutstyle : 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Generate ephoto360 image from URL + text
 * @param {string} url  - ephoto360 page URL
 * @param {string} text - Text to render
 * @returns {Promise<string>} Image URL
 */
async function ephoto(url, text) {
  const gT = await axios.get(url, {
    headers: { 'User-Agent': UA },
    timeout: 20000
  })

  const $ = cheerio.load(gT.data)
  const token          = $('input[name=token]').val()
  const build_server   = $('input[name=build_server]').val()
  const build_server_id = $('input[name=build_server_id]').val()

  if (!token || !build_server) throw new Error('ephoto: gagal ambil token form')

  const form = new FormData()
  form.append('text[]', text)
  form.append('token', token)
  form.append('build_server', build_server)
  form.append('build_server_id', build_server_id)

  const res = await axios({
    url,
    method: 'POST',
    data: form,
    headers: {
      'User-Agent': UA,
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      cookie: gT.headers['set-cookie']?.join('; '),
      ...form.getHeaders()
    },
    timeout: 25000
  })

  const $$ = cheerio.load(res.data)
  const formValueRaw = $$('input[name=form_value_input]').val()
  if (!formValueRaw) throw new Error('ephoto: form_value_input tidak ditemukan')

  const json = JSON.parse(formValueRaw)
  json['text[]'] = json.text
  delete json.text

  const { data } = await axios.post(
    'https://en.ephoto360.com/effect/create-image',
    new URLSearchParams(json),
    {
      headers: {
        'User-Agent': UA,
        cookie: gT.headers['set-cookie']?.join('; ')
      },
      timeout: 30000
    }
  )

  if (!data.image) throw new Error('ephoto: tidak ada URL gambar di response')
  return build_server + data.image
}

/**
 * Get ephoto URL by command name
 * @param {string} command
 * @returns {string|null}
 */
function getEphotoUrl(command) {
  return EPHOTO_URLS[command] || null
}

module.exports = { ephoto, getEphotoUrl, EPHOTO_URLS }
