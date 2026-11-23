// [vx] vxmenu / menuvx — daftar plugin baru vanXone dengan gaya Alya V20.
// Ringan: tidak memuat plugin, hanya data dari lib/vx/menu-data.js
// (fallback langsung ke lib/vx/commands.json kalau helper belum ada).
'use strict'

const fs = require('fs')
const path = require('path')

const PER_PAGE = 40

let vxMenu = null
try { vxMenu = require('../../lib/vx/menu-data') } catch { vxMenu = null }

const HEADER =
`╭──────────────────────────╮
│  🌸 *ALYA BOT — V20*  🌸  │
╰──────────────────────────╯`

function footer(prefix) {
  return `\n💡 *${prefix}help <cmd>* untuk detail penggunaan\n© 2026 • Alya V20`
}

function loadFallbackCommands() {
  try {
    const file = path.join(__dirname, '../../lib/vx/commands.json')
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

const FALLBACK_EMOJI = {
  ai: '🤖', tools: '🛠️', tool: '🛠️', download: '📥', downloads: '📥',
  downloader: '📥', game: '🎮', rpg: '⚔️', anime: '🍥', sticker: '🖼️',
  canvas: '🎨', maker: '🎨', search: '🔍', owner: '👑', panel: '⚙️',
  group: '👥', fun: '🎡', info: 'ℹ️', nsfw: '🔞', primbon: '🔮',
  islami: '🕌', store: '🏪', music: '🎵', premium: '⭐',
}

// Bentuk grup sama seperti menu-data.getGroups(): {tag,label,emoji,commands,total}
function buildGroups() {
  if (vxMenu && typeof vxMenu.getGroups === 'function') {
    try {
      const groups = vxMenu.getGroups()
      if (groups.length) return groups
    } catch { /* lanjut ke fallback */ }
  }
  const data = loadFallbackCommands()
  const buckets = new Map()
  for (const [cmd, v] of Object.entries(data)) {
    if (!cmd || !v || typeof v !== 'object') continue
    const rel = String(v.rel || '')
    const folder = (rel.match(/plugins\/([^/]+)\//) || [])[1] || 'plugin'
    const engine = (rel.match(/engine\/([^/]+)\//) || [])[1] || ''
    const desc = engine ? `${folder} · ${engine}` : folder
    const raw = Array.isArray(v.tags) ? v.tags : [v.tags]
    const tags = []
    for (const t of raw) {
      const tag = String(t == null ? '' : t).trim().toLowerCase()
      if (tag && !tags.includes(tag)) tags.push(tag)
    }
    if (!tags.length) tags.push('lainnya')
    for (const tag of tags) {
      if (!buckets.has(tag)) buckets.set(tag, [])
      buckets.get(tag).push({ cmd: String(cmd), desc, rel })
    }
  }
  return [...buckets.entries()]
    .map(([tag, commands]) => {
      commands.sort((a, b) => a.cmd.localeCompare(b.cmd))
      return {
        tag,
        label: tag.toUpperCase(),
        emoji: FALLBACK_EMOJI[tag] || '📌',
        commands,
        total: commands.length,
      }
    })
    .sort((a, b) => (b.total - a.total) || a.tag.localeCompare(b.tag))
}

function countAll() {
  if (vxMenu && typeof vxMenu.total === 'function') {
    try { return vxMenu.total() } catch { /* fallback */ }
  }
  return Object.keys(loadFallbackCommands()).length
}

module.exports = {
  command: ['vxmenu', 'menuvx'],
  run: async (alya, m, ctx) => {
    const reply = ctx.replyalya || ctx.reply || ((t) => alya.sendMessage(m.chat, { text: t }, { quoted: m }))
    const prefix = ctx.prefix || '.'

    try { await alya.sendMessage(m.chat, { react: { text: '🌸', key: m.key } }) } catch { /* opsional */ }

    const argv = Array.isArray(ctx.args)
      ? ctx.args.slice()
      : String(ctx.args || '').trim().split(/\s+/).filter(Boolean)
    const norm = vxMenu && typeof vxMenu.normalizeTag === 'function'
      ? vxMenu.normalizeTag
      : (t) => String(t == null ? '' : t).trim().toLowerCase()
    const tag = norm(argv[0])
    const groups = buildGroups()
    const totalAll = countAll()

    // ── Tanpa argumen: daftar kategori ─────────────────────────────────────
    if (!tag) {
      const lines = groups.map(g => `┃ ➤ ${g.emoji} *${prefix}vxmenu ${g.tag}* — ${g.total} command`)
      const shown = lines.slice(0, 40)
      const rest = lines.length - shown.length
      const more = rest > 0 ? `┃ ➤ ... dan ${rest} kategori lainnya\n` : ''
      const teks = `${HEADER}

🆕 *PLUGIN BARU VANXONE*
_${totalAll.toLocaleString('id-ID')} command • ${groups.length} kategori_

┣━━〔 🆕 *DAFTAR KATEGORI* 〕━━⬣
┃
${shown.join('\n')}
${more}┃
┃ → Ketik *${prefix}vxmenu <tag> [halaman]*
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣${footer(prefix)}`
      return reply(teks)
    }

    // ── Tag tidak dikenal ──────────────────────────────────────────────────
    const group = groups.find(g => g.tag === tag || g.label.toLowerCase() === tag)
    if (!group) {
      const teks = `${HEADER}

┣━━〔 ⚠️ *TAG TIDAK ADA* 〕━━⬣
┃
┃ ➤ Tag \`${tag}\` belum terdaftar~ 🙈
┃ → Ketik *${prefix}vxmenu* untuk daftar kategori
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣${footer(prefix)}`
      return reply(teks)
    }

    // ── Daftar command per tag + pagination ────────────────────────────────
    const cmds = group.commands
    const pages = Math.max(1, Math.ceil(cmds.length / PER_PAGE))
    const page = Math.min(Math.max(parseInt(argv[1], 10) || 1, 1), pages)
    const slice = cmds.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const next = page < pages ? `┃ → *${prefix}vxmenu ${tag} ${page + 1}* untuk lanjut\n` : ''
    const teks = `${HEADER}

🆕 *PLUGIN BARU VANXONE*

┣━━〔 ${group.emoji} *${group.label}* 〕━━⬣
┃
${slice.map(c => `┃ ➤ *${prefix}${c.cmd}* — ${c.desc}`).join('\n')}
┃
┃ 📄 Halaman ${page}/${pages} • ${cmds.length} command
${next}┃
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣${footer(prefix)}`
    return reply(teks)
  },
}
