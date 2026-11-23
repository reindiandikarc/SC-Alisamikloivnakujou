// Registry plugin "bohongan" bentuk donor (engine/vemzo/hoshino2) yang diisi dari plugin vanXone yang benar-benar termuat.
// Tanpa ini fitur seperti .totalfitur2, .benefitowner, .searchplugin membaca tabel kosong -> hasilnya 0.
'use strict'
function live() {
  try {
    return typeof global.__vanPlugins === 'function' ? global.__vanPlugins() : []
  } catch {
    return []
  }
}
function shaped() {
  return live().map((p) => {
    const cmds = [].concat(p.command || []).map(String)
    return {
      config: {
        name: cmds[0] || p.name || 'unknown',
        alias: cmds.slice(1),
        category: String(p.category || 'lainnya').toLowerCase(),
        description: p.desc || '',
        usage: p.usage || '',
        isOwner: !!p.owner,
        isPremium: !!p.premium,
        isGroup: !!p.group,
        isPrivate: false,
        isAdmin: !!p.admin,
        isBotAdmin: !!p.botAdmin,
        isEnabled: true
      },
      handler: p.run
    }
  })
}
function byCategory() {
  const out = {}
  for (const p of shaped()) (out[p.config.category] = out[p.config.category] || []).push(p.config.name)
  return out
}
module.exports = { all: shaped, count: () => shaped().length, byCategory, commandNames: () => live().flatMap((p) => [].concat(p.command || []).map(String)) }
