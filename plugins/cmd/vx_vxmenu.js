// [vx] vxmenu — menu command hasil porting vanXone (pendamping scripts/vx-wire.js).
// Membaca lib/vx/commands.json saja (tidak memuat plugin), jadi ringan.
'use strict'
const { COMMANDS } = require('../../lib/vx/dispatch')
const PER_PAGE = 60
module.exports = {
  command: ['vxmenu', 'menuvx'],
  run: async (alya, m, ctx) => {
    const reply = ctx.replyalya || ctx.reply || ((t) => alya.sendMessage(m.chat, { text: t }, { quoted: m }))
    const prefix = ctx.prefix || '.'
    const byTag = new Map()
    for (const [cmd, v] of Object.entries(COMMANDS)) {
      for (const t of v.tags) {
        if (!byTag.has(t)) byTag.set(t, [])
        byTag.get(t).push(cmd)
      }
    }
    const tag = (ctx.args?.[0] || '').toLowerCase()
    if (!tag) {
      const lines = [...byTag.entries()].sort((a, b) => b[1].length - a[1].length)
        .map(([t, cmds]) => `• ${t} — ${cmds.length} command`)
      return reply(`📦 *Menu Porting vanXone* (${Object.keys(COMMANDS).length} command)\n\n` +
        lines.join('\n') + `\n\n_Ketik ${prefix}vxmenu <tag> [halaman] untuk daftar command._`)
    }
    if (!byTag.has(tag)) {
      return reply(`⚠️ Tag \`${tag}\` tidak ada. Ketik ${prefix}vxmenu untuk daftar tag.`)
    }
    const cmds = byTag.get(tag).sort()
    const pages = Math.ceil(cmds.length / PER_PAGE)
    const page = Math.min(Math.max(parseInt(ctx.args?.[1]) || 1, 1), pages)
    const slice = cmds.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    return reply(`📦 *vanXone — ${tag}* (${cmds.length} command, hal ${page}/${pages})\n\n` +
      slice.map(c => `${prefix}${c}`).join('\n') +
      (pages > 1 ? `\n\n_Halaman lain: ${prefix}vxmenu ${tag} <1-${pages}>_` : ''))
  },
}
