// Plugin: addowner
// Terintegrasi database: baca/tulis ./database/owner.json
// Update global.owner agar langsung aktif TANPA restart
// Commands: addowner

module.exports = {
  command: ["addowner"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      reply, replyalya, replytolak,
      mess
    } = ctx

    const fs = require('fs')

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!args[0]) return replyalya(
      `Use ${prefix + command} number\n` +
      `Example ${prefix + command} 6285602845943`
    )

    // ── Baca database owner.json ─────────────────────────────────────
    const ownerFile = './database/owner.json'
    let ownerDB = []
    try {
      ownerDB = JSON.parse(fs.readFileSync(ownerFile, 'utf8'))
      if (!Array.isArray(ownerDB)) ownerDB = []
    } catch {
      ownerDB = []
    }

    // Normalisasi nomor (hanya angka)
    const bnnd = q.split('|')[0].replace(/[^0-9]/g, '')

    // Cek valid di WhatsApp
    let ceknye = []
    try { ceknye = await alya.onWhatsApp(bnnd + '@s.whatsapp.net') } catch {}
    if (!ceknye || ceknye.length === 0)
      return replyalya('Enter A Valid And Registered Number On WhatsApp!!!')

    // Cek duplikat
    if (ownerDB.includes(bnnd))
      return replyalya(`Nomor *${bnnd}* sudah menjadi Owner!`)

    // ── Tulis ke database ─────────────────────────────────────────────
    ownerDB.push(bnnd)
    fs.writeFileSync(ownerFile, JSON.stringify(ownerDB, null, 2))

    // ── Update global.owner agar Ryuu langsung true tanpa restart ─────
    // global.owner dipakai di alya.js line 515:
    //   let Ryuu = owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    // Karena 'owner' const di alya.js adalah referensi array yang sama (push mutate),
    // kita push ke array aslinya via global reference
    if (!Array.isArray(global.owner)) global.owner = []
    if (!global.owner.includes(bnnd)) global.owner.push(bnnd)

    // Sync ke module cache (kalau diakses dari luar alya.js)
    try {
      const ownerModule = require('./database/owner.json')
      if (Array.isArray(ownerModule) && !ownerModule.includes(bnnd)) ownerModule.push(bnnd)
    } catch {}

    replyalya(
      `✅ Number *${bnnd}* Has Become An Owner!!!\n\n` +
      `📋 Total owner sekarang: *${ownerDB.length}*\n` +
      `⚡ Langsung aktif tanpa restart.`
    )
  }
}
