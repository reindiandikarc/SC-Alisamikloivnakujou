// Plugin: delowner
// Fix: baca/tulis owner.json langsung
// Commands: delowner

module.exports = {
  command: ["delowner"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      reply, replyalya, replytolak,
      fs, mess
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!args[0]) return replyalya(`Use ${prefix + command} nomor\nExample ${prefix + command} 6283166570663`)

    const ownerFile = './database/owner.json'
    let owner = []
    try { owner = JSON.parse(fs.readFileSync(ownerFile, 'utf8')) } catch { owner = [] }

    let ya = q.split('|')[0].replace(/[^0-9]/g, '')
    let unp = owner.indexOf(ya)

    if (unp === -1) return replyalya(`Nomor ${ya} tidak ada di daftar owner!`)

    owner.splice(unp, 1)
    fs.writeFileSync(ownerFile, JSON.stringify(owner))
    replyalya(`✅ Nomor *${ya}* berhasil dihapus dari daftar Owner!\n\n⚠️ Restart bot agar perubahan berlaku.`)
  }
}
