// Plugin: addowner
// Fix: baca/tulis owner.json + update global.owner agar langsung aktif tanpa restart
// Commands: addowner

module.exports = {
  command: ["addowner"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      reply, replyalya, replytolak,
      fs, mess
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!args[0]) return replyalya(`Use ${prefix + command} number\nExample ${prefix + command} 6283166570663`)

    const ownerFile = './database/owner.json'
    let owner = []
    try { owner = JSON.parse(fs.readFileSync(ownerFile, 'utf8')) } catch { owner = [] }

    let bnnd = q.split('|')[0].replace(/[^0-9]/g, '')
    let ceknye = await alya.onWhatsApp(bnnd + '@s.whatsapp.net')
    if (!ceknye || ceknye.length === 0) return replyalya('Enter A Valid And Registered Number On WhatsApp!!!')

    if (owner.includes(bnnd)) return replyalya(`Nomor ${bnnd} sudah menjadi Owner!`)

    owner.push(bnnd)
    fs.writeFileSync(ownerFile, JSON.stringify(owner))

    // Update global.owner agar langsung aktif tanpa restart
    if (global.owner && !global.owner.includes(bnnd)) global.owner.push(bnnd)

    replyalya(`✅ Number *${bnnd}* Has Become An Owner!!!\n\n📋 Total owner: *${owner.length}*\n💡 Langsung aktif tanpa restart.`)
  }
}
