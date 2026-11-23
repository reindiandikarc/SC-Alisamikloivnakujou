// Plugin: addgrup / addgc
// Fix: push ke pler runtime agar langsung aktif tanpa restart
// Commands: addgrup, addgc

module.exports = {
  command: ['addgrup', 'addgc'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, command,
      from, isGroup,
      Ryuu,
      replyalya, replytolak,
      fs, mess,
      pler  // reference ke array idgrup dari alya.js
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
        `❌ *Cara pakai .addgc / .addgrup:*\n\n` +
        `• Di dalam grup: ketik *${prefix + command}* (tanpa argumen)\n` +
        `• Kirim ID: ketik *${prefix + command} 120363xxxxxx@g.us*\n\n` +
        `📌 ID grup bisa dicek dengan *.idgc*`
      )
    }

    if (idgrup.includes(targetId))
      return replyalya(`⚠️ Grup *${targetId}* sudah terdaftar!`)

    idgrup.push(targetId)
    fs.writeFileSync(idgrupFile, JSON.stringify(idgrup))

    // Push ke array pler runtime agar .upswgc & fitur lain langsung kenal grup ini
    if (!pler.includes(targetId)) pler.push(targetId)

    replyalya(
      `✅ *Grup berhasil ditambahkan!*\n\n` +
      `🆔 ID: *${targetId}*\n` +
      `📋 Total grup terdaftar: *${idgrup.length}*\n\n` +
      `💡 Grup aktif sekarang. *.upswgc* sudah bisa digunakan premium di grup ini.`
    )
  }
}
