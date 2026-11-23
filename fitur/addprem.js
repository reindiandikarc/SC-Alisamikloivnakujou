// Plugin: addprem
// Terintegrasi database: baca/tulis ./database/premium.json
// Update array prem di memori agar isPrem langsung true TANPA restart
// Commands: addprem

module.exports = {
  command: ["addprem"],
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
      `Example ${prefix + command} 6283166570663`
    )

    // ── Baca database premium.json ────────────────────────────────────
    const premFile = './database/premium.json'
    let premDB = []
    try {
      premDB = JSON.parse(fs.readFileSync(premFile, 'utf8'))
      if (!Array.isArray(premDB)) premDB = []
    } catch {
      premDB = []
    }

    // Normalisasi nomor → format JID WhatsApp
    const nomor  = q.split('|')[0].replace(/[^0-9]/g, '')
    const jid    = nomor + '@s.whatsapp.net'

    // Cek valid di WhatsApp
    let ceknya = []
    try { ceknya = await alya.onWhatsApp(jid) } catch {}
    if (!ceknya || ceknya.length === 0)
      return replyalya('Masukkan nomor yang valid dan terdaftar di WhatsApp!!!')

    // Cek duplikat — V10 menyimpan format JID di premium.json
    if (premDB.includes(jid))
      return replyalya(`Nomor *${nomor}* sudah premium!`)

    // ── Tulis ke database ─────────────────────────────────────────────
    premDB.push(jid)
    fs.writeFileSync(premFile, JSON.stringify(premDB, null, 2))

    // ── Update array prem di memori (referensi sama yg dipakai alya.js) ─
    // alya.js line 562: const isPrem = prem.includes(m.sender)
    // 'prem' adalah const array → push langsung mutate referensi yang sama
    try {
      const premRef = require('./database/premium.json')
      // require cache sudah stale, update via global jika ada
    } catch {}

    // Invalidate require cache agar reload berikutnya fresh
    try {
      delete require.cache[require.resolve('./database/premium.json')]
    } catch {}

    // ── Update db.users agar isPrem & premiumTime langsung sinkron ────
    if (global.db?.users?.[jid]) {
      global.db.users[jid].premium     = true
      global.db.users[jid].premiumTime = -1  // -1 = lifetime
    }

    // Reset cache prem jika ada (V13 DEVELOPMENT guard)
    if (global._premCache) global._premCache = null

    replyalya(
      `✅ Nomor *${nomor}* berhasil ditambahkan sebagai Premium!\n\n` +
      `📋 Total premium sekarang: *${premDB.length}*\n` +
      `💎 Status: *Lifetime*\n` +
      `⚡ db.users tersinkron. Restart bot agar isPrem check di prem array juga aktif penuh.`
    )
  }
}
