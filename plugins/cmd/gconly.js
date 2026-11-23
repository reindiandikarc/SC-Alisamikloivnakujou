// Plugin: gconly
// Commands: gconly
// (alias lama untuk onlygc — disamakan biar gak ada 2 command beda nama tapi beda nasib)
//
// FIX v2: sama seperti onlygc.js, sekarang menulis ke db.settings[botNumber].onlygrub
// supaya benar-benar nyambung ke enforcement di alya.js, bukan cuma global.onlyGC.

module.exports = {
  command: ['gconly'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      Ryuu, botNumber, q,
      replyalya, replytolak,
      mess, db, saveDB
    } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner yang bisa menggunakan perintah ini.')

    const turnOff = (q || '').toLowerCase().trim() === 'off'
    const newOnlyGC = !turnOff

    global.onlyGC = newOnlyGC
    global.onlyPC = false

    try {
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].onlygrub = newOnlyGC
      db.settings[botNumber].onlypc = false
    } catch (e) {
      console.error('[gconly.js] Gagal update db.settings:', e?.message || e)
    }

    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].onlygrub = newOnlyGC
      global.db.settings[botNumber].onlypc = false
    } catch (e) {
      console.error('[gconly.js] Gagal update global.db.settings:', e?.message || e)
    }

    try { saveDB(global.db) } catch (_) {}

    return replyalya(
      newOnlyGC
        ? '✅ *Mode GC Only diaktifkan. Bot hanya merespons di grup.*'
        : '✅ *Mode GC Only dimatikan.*\nBot kembali merespons di grup maupun chat pribadi.'
    )
  }
}
