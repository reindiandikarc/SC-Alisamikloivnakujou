// lib/richmenu.js — kartu menu HTML interaktif untuk Alya (gaya Hitoshi MD / vanXone).
//
// Sumber data digabung dan dideduplikasi:
//   1. perintah CASE   -> cmd_registry.json (root, fallback plugins/cmd_registry.json)
//   2. perintah PLUGIN -> lib/vx/commands.json (lewat lib/vx/menu-data.js)
//   3. perintah PLUGIN -> plugins/cmd/*.js  (`command: [...]`)
//
// .menu / .allmenu mencoba kartu ini lebih dulu. Kalau mode 'text' atau kartu gagal,
// send() mengembalikan false dan pemanggil memakai menu lama apa adanya.

'use strict'

const fs = require('fs')
const path = require('path')
const richui = require('./rich/richui.cjs')
const uimode = require('./rich/uimode.cjs')
const cats = require('./rich/categories.cjs')
const fa = require('./rich/fa.cjs')
const vxMenu = require('./vx/menu-data')
const CATALOG = require('./rich/categories.json')

const ROOT = path.join(__dirname, '..')
const REGISTRIES = [
  path.join(ROOT, 'cmd_registry.json'),
  path.join(ROOT, 'plugins', 'cmd_registry.json'),
]
const CMD_DIR = path.join(ROOT, 'plugins', 'cmd')

// Alias lokal -> kategori baku lib/rich/categories.json
const LOCAL_ALIAS = {
  general: 'info', main: 'info', other: 'tools', lainnya: 'tools', misc: 'tools',
  islami: 'islam', islamic: 'islam', religi: 'islam',
  ephoto: 'maker', canvas: 'image', convert: 'tools',
  stalker: 'search', random: 'fun', music: 'audio', tts: 'audio',
  cecan: 'fun', asupan: 'fun', cewerandom: 'fun', cek: 'tools',
  database: 'owner', testing: 'owner', test: 'owner', panel: 'panel',
  store: 'store', broadcast: 'broadcast', pushkontak: 'broadcast',
  // tag plugin yang sebelumnya jatuh ke 'info' / kategori hapus
  admin: 'group', adminstore: 'store', bug: 'tools', converter: 'tools',
  edukasi: 'info', fake: 'fun', family: 'game', games: 'game',
  menfess: 'group', romance: 'fun', download: 'downloader',
  downloader: 'downloader', ephoto360: 'maker', maker: 'maker',
  tts: 'audio', music: 'audio', quotes: 'quotes', nsfw: 'nsfw',
}

// Dipakai bila registry hanya berisi path file (kasus di repo ini).
const KNOWN_TAGS = [
  ['game', /tebak|game|ultraman|blackjack|slot|catur|suit|tictactoe|truth|dare|gacha|quiz|caklontong|asahotak|susunkata|tekateki|family100|werewolf/i],
  ['rpg', /mining|nebang|mancing|berkebon|kerja|bansos|gajian|nabung|bank|shop|craft|duel|battle|invest|guild|level|money|exp/i],
  ['ai', /^ai|gemini|bard|gpt|blackbox|claude|dalle|prodia|bingimg|chatgpt|aichat/i],
  ['downloader', /dl$|downloader|^yt|^tiktok|instagram|facebook|twitter|spotify|terabox|gdrive|pinterest|snackvideo/i],
  ['sticker', /stik|sticker|togif|tovn|toimg|toptt|toaudio/i],
  ['group', /^(add|del|kick|promote|demote|mute|unmute|tag|hidetag|antilink|antibot|setwelcome|welcome|opentime|closetime)/i],
  ['owner', /^(addprem|delprem|addowner|delowner|addsewa|delsewa|addredeem|delredeem|setbot|setppbot|restart|ban|unban|self|public)/i],
  ['islam', /sholat|alquran|ayat|doa|hadis|asmaulhusna|quotesislami|islam/i],
  ['info', /info|runtime|ping|weather|cekkhodam|imdb|cekkuota|cekpulsa/i],
]

// ── util ──────────────────────────────────────────────────────────────────────
function normalizeCmd(value) {
  let c = String(value == null ? '' : value).trim().replace(/^[.!#/]+/, '')
  if (!c || c.length > 64 || /\s/.test(c) || !/^[\p{L}\p{N}_.\-]+$/u.test(c)) return ''
  return c.toLowerCase()
}

function canonCat(value) {
  const raw = String(value == null ? '' : value).trim().toLowerCase()
  return cats.canon(LOCAL_ALIAS[raw] || raw || 'tools')
}

// Kategori hasil scan menu teks boleh memakai alias, tapi jangan sampai
// menciptakan kategori baru dari nama file (mis. "domainmenu" -> "domain").
const CANON_CATS = new Set(Array.isArray(CATALOG?.order) ? CATALOG.order : [])
function canonKnown(value) {
  const c = canonCat(value)
  return CANON_CATS.has(c) ? c : 'info'
}

function pickString(src, keys) {
  for (const k of keys) {
    const m = String(src).match(new RegExp('\\b' + k + '\\s*:\\s*([\'"`])([^\'"`]*)\\1'))
    if (m && m[2]) return m[2].trim()
  }
  return ''
}

function deriveCategory(cmd, info) {
  if (info && typeof info === 'object' && !Array.isArray(info)) {
    const t = (Array.isArray(info.tags) ? info.tags.find(Boolean) : info.tags) ||
      info.cat || info.category
    if (t) return canonCat(t)
    if (info.file) info = info.file
  }
  const p = String(info || '').replace(/\\/g, '/')
  const vx = p.match(/(?:^|\/)vx_([^/]+)\.js$/i)
  let folder = ''
  if (vx) {
    const parts = vx[1].split('_')
    const i = parts.indexOf('plugins')
    folder = (i >= 0 ? parts[i + 1] : parts[1]) || ''
  } else {
    const m = p.match(/(?:^|\/)([^/]+)\/[^/]+\.js$/i)
    folder = m ? m[1] : ''
  }
  if (folder && folder !== 'cmd' && folder !== 'fitur') return canonCat(folder)
  for (const [tag, re] of KNOWN_TAGS) if (re.test(cmd)) return canonCat(tag)
  return 'info'
}

function loadRegistry() {
  for (const file of REGISTRIES) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (data && typeof data === 'object' && !Array.isArray(data)) return data
    } catch { /* coba path berikutnya */ }
  }
  return {}
}

// ── sumber 3: perintah dari plugins/cmd/*.js ──────────────────────────────────
function scanPluginFiles(isOwner) {
  const found = new Map()
  if (!fs.existsSync(CMD_DIR)) return found
  for (const name of fs.readdirSync(CMD_DIR)) {
    if (!name.endsWith('.js') || name.startsWith('.')) continue
    const full = path.join(CMD_DIR, name)
    try {
      const src = fs.readFileSync(full, 'utf8')
      const cm = src.match(/\b(?:command|cmd)\s*:\s*(\[[^\]]*\]|(['"`])[^'"`]*\2)/)
      if (!cm) continue
      const cmds = [...cm[1].matchAll(/(['"`])([^'"`]+)\1/g)]
        .map((x) => x[2])
        .map(normalizeCmd)
        .filter(Boolean)
      if (!cmds.length) continue
      if (/\bowner\s*:\s*true\b/.test(src) && !isOwner) continue
      const desc = pickString(src, ['desc', 'description'])
      const cat = pickString(src, ['category'])
      // Tags plugin selama ini dibaca tapi tidak pernah dipakai deriveCategory.
      // Simpan supaya kategori rich mengikuti tag asli SC.
      const tm = src.match(/\btags\s*:\s*\[([^\]]*)\]/)
      const tags = tm
        ? [...tm[1].matchAll(/(['"`])([^'"`]+)\1/g)].map(x => x[2]).filter(Boolean)
        : []
      for (const c of cmds) found.set(c, { cmd: c, cat, tags, desc, file: full })
    } catch (err) {
      console.warn('[richmenu] lewati plugin', name, '-', err.message)
    }
  }
  return found
}

// ── sumber 4: perintah yang hanya muncul di menu teks ─────────────────────────
// Registry & plugin `command:` tidak menangkap perintah yang ditulis langsung
// sebagai string menu, mis. `${prefix}hercai-cartoon` di Alya.js/allmenu atau
// `${prefix}cekdomain` di domainmenu.js. Fungsi ini membaca sumbernya apa adanya.
function scanTextMenus() {
  const found = new Map()
  const take = (src, source, cat) => {
    const re = /\$\{(?:prefix|p)\}\s*([A-Za-z0-9_.\-]+)/g
    let m
    while ((m = re.exec(String(src || '')))) {
      const c = normalizeCmd(m[1])
      if (!c || found.has(c)) continue
      found.set(c, { cmd: c, cat: canonKnown(cat), source, desc: '' })
    }
  }

  // a) lib/listmenu.js — seluruh isi memang definisi menu.
  try {
    const f = path.join(ROOT, 'lib', 'listmenu.js')
    if (fs.existsSync(f)) take(fs.readFileSync(f, 'utf8'), 'lib/listmenu.js', 'info')
  } catch { /* abaikan */ }

  // b) Alya.js — semua perintah yang dirender dengan ${prefix} di blok
  //    case/menu (termasuk alias case seperti playmusic_process/addexp).
  try {
    const f = path.join(ROOT, 'Alya.js')
    if (fs.existsSync(f)) take(fs.readFileSync(f, 'utf8'), 'Alya.js-case-text', 'info')
  } catch { /* abaikan */ }

  // c) plugins/cmd/*menu*.js — subtree menu plugin (aimenu, domainmenu, ...).
  try {
    if (fs.existsSync(CMD_DIR)) {
      for (const name of fs.readdirSync(CMD_DIR)) {
        if (!name.endsWith('.js') || !/menu/i.test(name) || name.startsWith('.')) continue
        const f = path.join(CMD_DIR, name)
        const src = fs.readFileSync(f, 'utf8')
        const folderCat = name.replace(/menu\.js$/i, '').replace(/^vx_/, '')
        take(src, 'plugin-menu-text:' + name, folderCat || 'info')
      }
    }
  } catch { /* abaikan */ }

  return found
}

// ── kumpulkan + deduplikasi ────────────────────────────────────────────────────
function collect(isOwner = false) {
  const entries = new Map()
  const add = (source, cat, cmd, desc, icon, overrideCat) => {
    const c = normalizeCmd(cmd)
    if (!c) return
    const k = canonCat(cat)
    let e = entries.get(c)
    if (!e) {
      e = { c, i: String(icon || ''), d: '', cat: k, case: false, plugin: false }
      entries.set(c, e)
    }
    if (source === 'case') e.case = true
    else e.plugin = true
    if (overrideCat && k) e.cat = k
    if (!e.d && desc) e.d = fa.strip(String(desc)).trim().slice(0, 90)
    if (!e.i && icon) e.i = String(icon)
  }

  // Plugin file dipindai lebih dulu supaya deskripsi aslinya bisa dipakai CASE.
  const pluginFiles = scanPluginFiles(isOwner)

  // 1) CASE — cmd_registry.json
  for (const [cmd, info] of Object.entries(loadRegistry())) {
    const c = normalizeCmd(cmd)
    const extra = pluginFiles.get(c) || null
    add('case', deriveCategory(c, info), c, extra && extra.desc, '', false)
  }

  // 2) PLUGIN — vanXone (memakai helper menu-data, bukan membaca JSON langsung)
  try {
    for (const g of vxMenu.getGroups()) {
      for (const item of g.commands) {
        add('plugin', g.tag, item.cmd, item.desc, g.emoji, true)
      }
    }
  } catch (err) {
    console.warn('[richmenu] vx menu-data gagal:', err.message)
  }

  // 3) PLUGIN — plugins/cmd/*.js
  for (const item of pluginFiles.values()) {
    add('plugin', item.cat || deriveCategory(item.cmd, item), item.cmd, item.desc, '', !!item.cat)
  }

  // 4) MENU TEKS — sumber yang selama ini tidak ikut ter-scan:
  //    lib/listmenu.js, blok case menu/allmenu/help/listcmd di Alya.js,
  //    dan semua plugins/cmd/*menu*.js. Ini yang bikin rich "meliput semua
  //    menu Alisa SC sekarang" tanpa mengubah richui/paginasi.
  for (const item of scanTextMenus().values()) {
    // Kategori teks hanya dipakai kalau command belum punya kategori dari
    // registry/plugin. Tanpa ini, entri lama di listmenu.js (mis.
    // `readviewonce`) menimpa kategori eksplisit plugin (`tools`).
    add('text-menu', item.cat, item.cmd, item.desc || ('Menu ' + item.source), '', false)
  }

  const groups = {}
  for (const e of entries.values()) {
    if (!groups[e.cat]) groups[e.cat] = []
    groups[e.cat].push(e)
  }
  const order = cats.sortCats(Object.keys(groups))
  for (const k of order) groups[k].sort((a, b) => a.c.localeCompare(b.c))

  let caseTotal = 0
  let pluginTotal = 0
  for (const e of entries.values()) {
    if (e.case) caseTotal++
    if (e.plugin) pluginTotal++
  }

  return {
    groups,
    order,
    totals: { total: entries.size, caseTotal, pluginTotal },
    total: entries.size,
    caseTotal,
    pluginTotal,
  }
}

// ── info user & pesan ─────────────────────────────────────────────────────────
function messageText(m) {
  const msg = (m && m.message) || {}
  return String(
    msg.extendedTextMessage?.text || msg.conversation ||
    msg.imageMessage?.caption || msg.videoMessage?.caption || m?.text || ''
  )
}

function greeting() {
  try {
    const h = Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta', hour: 'numeric', hourCycle: 'h23',
    }).format(new Date()))
    return h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam'
  } catch {
    return 'Halo'
  }
}

async function avatarOf(sock, jid, ms = 1200) {
  if (!sock || typeof sock.profilePictureUrl !== 'function' || !jid) return null
  const timeout = new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms)
    if (typeof t.unref === 'function') t.unref()
  })
  try {
    return await Promise.race([
      (async () => {
        const url = await sock.profilePictureUrl(jid, 'image')
        if (!url || typeof fetch !== 'function') return null
        const res = await fetch(url)
        const buf = Buffer.from(await res.arrayBuffer())
        return buf.length ? buf : null
      })(),
      timeout,
    ])
  } catch {
    return null
  }
}

// ── kirim kartu ───────────────────────────────────────────────────────────────
// Return true bila kartu terkirim; false bila pemanggil harus memakai menu lama.
async function send(ctx = {}) {
  if (!uimode.isRich()) return false
  try {
    const sock = ctx.sock
    const m = ctx.m || {}
    const from = m.chat || m.key?.remoteJid
    if (!sock || !from || typeof sock.relayMessage !== 'function') return false

    const prefix = String(ctx.prefix || global.prefix || '.')
    const { groups, order, totals } = collect(!!ctx.isOwner)

    // `.menu <kategori>` membuka kategori itu; `.allmenu` membuka daftar semua perintah.
    const text = messageText(m)
    let key = String(ctx.sub || '').trim().toLowerCase()
    if (!key) {
      const mm = text.match(/^[.!#/]\s*menu\s+([\p{L}\p{N}_\-]+)/iu)
      if (mm) key = mm[1].toLowerCase()
    }
    const allCmd = /^[.!#/]\s*allmenu\b/i.test(text)
    const canonKey = key ? cats.canon(LOCAL_ALIAS[key] || key) : ''
    const hit = canonKey ? order.find((c) => c === canonKey) : null
    let start = 'home'
    if (allCmd || key === 'all' || key === 'allmenu') start = 'all'
    else if (hit) start = 'cat'

    const sender = String(m.sender || m.key?.participant || '')
    const num = sender.split('@')[0]
    const dbUser = global.db?.users?.[m.sender] || {}
    const level = Math.max(1, Math.floor(Number(dbUser.level) || 1))
    const exp = Math.max(0, Math.floor(Number(dbUser.exp) || 0))
    const need = 100 + (level - 1) * 50
    const pct = Math.min(100, Math.floor((exp / need) * 100))
    const allUsers = Object.keys(global.db?.users || {})
    const rupiah = (v) => 'Rp' + Math.floor(Number(v) || 0).toLocaleString('id-ID')

    const avatarBuf = await avatarOf(sock, sender)
    let avatar = ''
    if (avatarBuf) {
      try { avatar = await richui.avatarUri(avatarBuf) } catch { avatar = '' }
    }

    const hot = new Set(
      order.filter((c) => groups[c].length >= 10)
        .sort((a, b) => groups[b].length - groups[a].length)
        .slice(0, 3)
    )
    const catList = order.map((c) => ({
      id: c,
      icon: cats.iconOf(c),
      label: cats.labelOf(c),
      desc: cats.descOf(c),
      hot: hot.has(c),
      items: groups[c].map((it) => ({ i: it.i || cats.iconOf(c), c: it.c, d: it.d })),
    }))

    // Chip pintasan: tiap kategori mengirim `.menu <kategori>` plus allmenu & vxmenu.
    catList.push({
      id: 'shortcut',
      icon: '⚡',
      label: 'PINTASAN',
      desc: 'Kirim perintah langsung dari kartu',
      items: [
        ...order.map((c) => ({
          i: cats.iconOf(c), c: `menu ${c}`, d: `Buka kategori ${cats.labelOf(c)}`,
        })),
        { i: '📖', c: 'allmenu', d: 'Tampilkan semua perintah' },
        { i: '🧩', c: 'vxmenu', d: 'Daftar plugin vanXone' },
      ],
    })

    const card = richui.menuApp({
      prefix,
      start,
      cat: hit || '',
      link: '',
      user: {
        greeting: greeting(),
        name: fa.strip(String(m.pushName || num || 'Alya')).trim().slice(0, 40),
        status: ctx.isOwner ? 'OWNER' : ctx.isPremium ? 'PREMIUM' : 'MEMBER',
        chat: String(from).endsWith('@g.us') ? 'Grup' : 'Pribadi',
        avatar,
        level,
        pct,
        exp: exp.toLocaleString('id-ID'),
        expNeed: need.toLocaleString('id-ID'),
        money: rupiah(dbUser.money),
        bank: rupiah(dbUser.bank),
        limit: ctx.isOwner || ctx.isPremium ? 'Unlimited' : 'Free',
        rank: 0,
        rankTotal: allUsers.length,
      },
      info: {
        mode: sock.public === false || global.public === false ? 'Self' : 'Public',
        users: allUsers.length,
        total: totals.total,
        caseTotal: totals.caseTotal,
        pluginTotal: totals.pluginTotal,
        uptime: Math.floor(process.uptime()),
      },
      legal: null,
      cats: catList,
    })

    const receipt = await richui.sendHtml(sock, from, card.html, card.label)
    // Jangan pernah menganggap "relay resolve" sebagai kartu tampil. Kalau tidak ada
    // key/message yang bisa dipakai, lempar error supaya pemanggil memakai menu lama.
    if (!receipt || !receipt.key || !receipt.key.id) {
      throw new Error('[richmenu] relay kartu tidak mengembalikan key yang bisa dipakai')
    }
    return true
  } catch (err) {
    console.warn('[richmenu] gagal kirim kartu, pakai menu lama:', err && err.message)
    return false
  }
}

module.exports = { send, collect, uimode }
