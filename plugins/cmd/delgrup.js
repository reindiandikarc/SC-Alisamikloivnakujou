// Plugin: delgrup
// Commands: delgrup
// Fungsi: Hapus ID grup dari database/idgrup.json (pler)

module.exports = {
  command: ["delgrup"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      from, isGroup,
      Ryuu,
      reply, replyalya, replytolak,
      fs, mess, pler
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    const idgrupFile = './database/idgrup.json'

    let idgrup = []
    try { idgrup = JSON.parse(fs.readFileSync(idgrupFile, 'utf8')) } catch { idgrup = [] }

    let targetId

    if (args[0]) {
      let input = args[0].trim()
      if (!input.endsWith('@g.us')) input = input + '@g.us'
      targetId = input
    } else if (isGroup) {
      targetId = from
    } else {
      return replyalya(
        `❌ *Cara pakai .delgrup:*\n\n` +
        `• Di dalam grup: ketik *${prefix}delgrup* (tanpa argumen)\n` +
        `• Kirim ID: ketik *${prefix}delgrup 120363xxxxxx@g.us*`
      )
    }

    const idx = idgrup.indexOf(targetId)
    if (idx === -1) {
      return replyalya(`⚠️ Grup *${targetId}* tidak ditemukan di database!`)
    }

    idgrup.splice(idx, 1)
    fs.writeFileSync(idgrupFile, JSON.stringify(idgrup))

    // Update array pler secara langsung
    const plerIdx = pler.indexOf(targetId)
    if (plerIdx !== -1) pler.splice(plerIdx, 1)

    replyalya(
      `✅ *Grup berhasil dihapus!*\n\n` +
      `🆔 ID: *${targetId}*\n` +
      `📋 Sisa grup terdaftar: *${idgrup.length}*`
    )
  }
}
