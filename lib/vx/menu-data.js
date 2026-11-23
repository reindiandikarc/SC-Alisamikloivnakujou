// lib/vx/menu-data.js — data menu "plugin baru vanXone" dengan gaya Alya V20.
//
// Helper ringan, TANPA Dependensi npm: hanya membaca lib/vx/commands.json
// setiap kali dipanggil (bukan di-load sekali saat require), supaya perubahan
// file langsung terlihat dan require() tetap aman walau file belum ada.
//
// API:
//   getGroups({ limit }) -> [{ tag, label, emoji, commands:[{cmd, desc, rel}], total }]
//                           `limit` = maksimal command per group (default: semua)
//   flatten(limit)       -> [{ cmd, desc, rel, tag, label, emoji }]
//                           `limit` = maksimal command total (default 40),
//                           diambil bergiliran antar group supaya beragam.
//   total()              -> jumlah command di commands.json
//
// Catatan: `desc` TIDAK dikarang — diambil dari folder `rel` dan engine asli.

'use strict'

const fs = require('fs')
const path = require('path')

const COMMANDS_FILE = path.join(__dirname, 'commands.json')

// Alias tag: bentuk jamak/sinonim yang jelas disatukan agar tidak dobel grup.
const TAG_ALIASES = Object.freeze({
  tool: 'tools',
  tools: 'tools',
  downloads: 'download',
  downloader: 'download',
  download: 'download',
  islamic: 'islami',
  religi: 'islami',
  'ai-image': 'ai',
  aiimage: 'ai',
  convert: 'tools',
  misc: 'lainnya',
  cmd: 'lainnya',
  main: 'lainnya',
  testing: 'lainnya',
})

// Tag -> [emoji, label Alya-style]. Label memakai huruf kapital pendek.
const TAG_META = Object.freeze({
  ai: ['🤖', 'AI'],
  tools: ['🛠️', 'TOOLS'],
  maker: ['🎨', 'MAKER'],
  canvas: ['🖼️', 'CANVAS'],
  download: ['📥', 'DOWNLOAD'],
  search: ['🔍', 'SEARCH'],
  anime: ['🍥', 'ANIME'],
  sticker: ['🖼️', 'STICKER'],
  game: ['🎮', 'GAME'],
  rpg: ['⚔️', 'RPG'],
  economy: ['💰', 'EKONOMI'],
  owner: ['👑', 'OWNER'],
  panel: ['⚙️', 'PANEL'],
  premium: ['⭐', 'PREMIUM'],
  group: ['👥', 'GROUP'],
  fun: ['🎡', 'FUN'],
  info: ['ℹ️', 'INFO'],
  primbon: ['🔮', 'PRIMBON'],
  islami: ['🕌', 'ISLAMI'],
  nsfw: ['🔞', 'NSFW'],
  quotes: ['💬', 'QUOTES'],
  ephoto: ['✍️', 'EPHOTO'],
  random: ['🎲', 'RANDOM'],
  music: ['🎵', 'MUSIC'],
  store: ['🏪', 'STORE'],
  tts: ['🎤', 'TTS'],
  image: ['🖼️', 'IMAGE'],
  internet: ['🌐', 'INTERNET'],
  pushkontak: ['📨', 'PUSH KONTAK'],
  cecan: ['📸', 'CECAN'],
  asupan: ['🍜', 'ASUPAN'],
  cewerandom: ['💬', 'CEWE RANDOM'],
  uploader: ['⬆️', 'UPLOADER'],
  bypass: ['🔓', 'BYPASS'],
  notif: ['🔔', 'NOTIF'],
  lainnya: ['📌', 'LAINNYA'],
})

// Folder `rel` -> label pendek (dipakai untuk `desc`, bukan deskripsi palsu).
const FOLDER_LABELS = Object.freeze({
  ai: 'AI',
  'ai-image': 'AI Image',
  anime: 'Anime',
  bypass: 'Bypass',
  canvas: 'Canvas',
  cmd: 'Lainnya',
  convert: 'Converter',
  download: 'Download',
  downloader: 'Download',
  downloads: 'Download',
  economy: 'Ekonomi',
  ephoto: 'Ephoto',
  fun: 'Fun',
  game: 'Game',
  group: 'Group',
  image: 'Image',
  info: 'Info',
  internet: 'Internet',
  maker: 'Maker',
  main: 'Lainnya',
  misc: 'Lainnya',
  music: 'Music',
  notif: 'Notifikasi',
  nsfw: 'NSFW',
  owner: 'Owner',
  panel: 'Panel',
  premium: 'Premium',
  primbon: 'Primbon',
  pushkontak: 'Push Kontak',
  quotes: 'Quotes',
  random: 'Random',
  religi: 'Islami',
  islamic: 'Islami',
  rpg: 'RPG',
  search: 'Search',
  stalker: 'Stalker',
  sticker: 'Sticker',
  store: 'Store',
  test: 'Testing',
  testing: 'Testing',
  tools: 'Tools',
  tts: 'TTS',
  uploader: 'Uploader',
  cecan: 'Cecan',
  asupan: 'Asupan',
  cewerandom: 'Cewe Random',
  lainnya: 'Lainnya',
})

// ── Internal ───────────────────────────────────────────────────────────────────
function loadCommands() {
  try {
    const data = JSON.parse(fs.readFileSync(COMMANDS_FILE, 'utf8'))
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

function normalizeTag(value) {
  let tag = String(value == null ? '' : value).trim().toLowerCase()
  if (!tag) return ''
  tag = tag.replace(/^#+/, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!tag) return ''
  return TAG_ALIASES[tag] || tag
}

function normalizeTags(values) {
  if (!values) return []
  const raw = Array.isArray(values) ? values : [values]
  const out = []
  for (const v of raw) {
    const tag = normalizeTag(v)
    if (tag && !out.includes(tag)) out.push(tag)
  }
  return out
}

function tagMeta(tag) {
  const found = TAG_META[tag]
  if (found) return { emoji: found[0], label: found[1] }
  const label = String(tag).replace(/[-_]+/g, ' ').toUpperCase()
  return { emoji: '📌', label }
}

function folderFromRel(rel) {
  const s = String(rel || '').replace(/\\/g, '/')
  const m = s.match(/plugins\/([^/]+)\//)
  if (m) return m[1]
  const parts = s.split('/').filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 2] : ''
}

function engineFromRel(rel) {
  const m = String(rel || '').match(/engine\/([^/]+)\//)
  return m ? m[1] : ''
}

function describe(value) {
  const rel = String(value && value.rel ? value.rel : '')
  const folder = folderFromRel(rel).toLowerCase()
  const engine = engineFromRel(rel)
  const label = FOLDER_LABELS[folder] || (folder ? folder.replace(/[-_]+/g, ' ').toUpperCase() : '')
  if (!label) return engine ? `Plugin · ${engine}` : 'Plugin'
  return engine ? `${label} · ${engine}` : label
}

// ── Public API ─────────────────────────────────────────────────────────────────
function getGroups(options = {}) {
  const limit = options && Number.isFinite(options.limit) && options.limit > 0
    ? Math.floor(options.limit)
    : 0
  const buckets = new Map()

  for (const [cmd, value] of Object.entries(loadCommands())) {
    if (!cmd || !value || typeof value !== 'object') continue
    const entry = { cmd: String(cmd), desc: describe(value), rel: String(value.rel || '') }
    let tags = normalizeTags(value.tags)
    if (!tags.length) tags = normalizeTags([folderFromRel(value.rel) || 'lainnya'])
    if (!tags.length) tags = ['lainnya']

    for (const tag of tags) {
      if (!buckets.has(tag)) buckets.set(tag, [])
      buckets.get(tag).push(entry)
    }
  }

  const groups = []
  for (const [tag, commands] of buckets.entries()) {
    commands.sort((a, b) => a.cmd.localeCompare(b.cmd))
    const meta = tagMeta(tag)
    groups.push({
      tag,
      label: meta.label,
      emoji: meta.emoji,
      commands: limit ? commands.slice(0, limit) : commands,
      total: commands.length,
    })
  }
  groups.sort((a, b) => (b.total - a.total) || a.tag.localeCompare(b.tag))
  return groups
}

function flatten(limit = 40) {
  const cap = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 40
  const groups = getGroups()
  const out = []
  let idx = 0
  while (out.length < cap) {
    let added = false
    for (const g of groups) {
      const c = g.commands[idx]
      if (!c) continue
      out.push({
        cmd: c.cmd,
        desc: c.desc,
        rel: c.rel,
        tag: g.tag,
        label: g.label,
        emoji: g.emoji,
      })
      added = true
      if (out.length >= cap) break
    }
    if (!added) break
    idx++
  }
  return out
}

function total() {
  return Object.keys(loadCommands()).length
}

module.exports = { getGroups, flatten, total, normalizeTag, tagMeta, loadCommands }
