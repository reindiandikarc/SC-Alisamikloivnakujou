// Plugin: uimode — pilih tampilan menu (owner only)
// Commands: uimode rich | uimode text | uimode status
// Pilihan tersimpan di database/uimode.json (lewat lib/rich/store.cjs).

'use strict'

const uimode = require('../../lib/rich/uimode.cjs')

module.exports = {
  command: ['uimode'],
  tags: ['general'],
  category: 'owner',
  run: async (alya, m, ctx) => {
    const {
      args = [], q = '', prefix = '.',
      reply, replyalya, replytolak,
      Ryuu, isAly, isAlya, isOwn,
    } = ctx

    const senderNum = String(m.sender || '').split('@')[0]
    const listedOwner =
      (Array.isArray(global.owner) && global.owner.some((o) => String(o).split('@')[0] === senderNum)) ||
      (global.ownernomer != null && String(global.ownernomer).split('@')[0] === senderNum)
    const isOwner = !!(Ryuu || isAly || isAlya || isOwn || listedOwner)

    const say = (txt) => {
      if (typeof replyalya === 'function') return replyalya(txt)
      if (typeof reply === 'function') return reply(txt)
      return alya.sendMessage(m.chat, { text: txt })
    }

    if (!isOwner) {
      const denial = '⚠️ Perintah *uimode* hanya untuk Owner.'
      if (typeof replytolak === 'function') return replytolak(denial)
      return say(denial)
    }

    const sub = String(args[0] || String(q || '').trim().split(/\s+/)[0] || '')
      .replace(/^[.!#/]+/, '')
      .toLowerCase()

    if (sub === 'status') {
      return say(
        `🌸 *UI MODE*\n` +
        `┃ Mode saat ini : *${uimode.get()}*\n` +
        `┃ Penyimpanan : database/uimode.json\n` +
        `┃\n` +
        `┃ • ${prefix}uimode rich → kartu HTML interaktif\n` +
        `┃ • ${prefix}uimode text → menu teks klasik\n` +
        `┗━━━━━━━━━━━━━━━━━━`
      )
    }

    if (sub === 'rich' || sub === 'text') {
      const mode = uimode.set(sub)
      return say(
        `✅ UI mode berubah menjadi *${mode}*.\n` +
        `Tersimpan di database/uimode.json. Cek dengan ${prefix}uimode status.`
      )
    }

    return say(
      `🌸 *UI MODE*\n` +
      `┃ Mode saat ini : *${uimode.get()}*\n` +
      `┃\n` +
      `┃ Pilihan:\n` +
      `┃ • ${prefix}uimode rich  — kartu menu interaktif\n` +
      `┃ • ${prefix}uimode text  — menu teks klasik\n` +
      `┃ • ${prefix}uimode status — lihat mode aktif\n` +
      `┗━━━━━━━━━━━━━━━━━━`
    )
  },
}
