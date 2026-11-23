// Plugin: onlypc
// Commands: onlypc
//
// FIX v2 (root cause): sama seperti onlygc.js — sekarang menulis ke
// db.settings[botNumber].onlypc (key yang benar-benar dibaca alya.js),
// bukan cuma global.onlyPC yang gak pernah dibaca di mana pun.

module.exports = {
  command: ['onlypc'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      Ryuu, botNumber, q,
      replyalya, replytolak,
      mess, db, saveDB
    } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner yang bisa menggunakan perintah ini.')

    const turnOff = (q || '').toLowerCase().trim() === 'off'
    const newOnlyPC = !turnOff

    // ── 1. Set runtime langsung (efek instan) ──
    global.onlyPC = newOnlyPC
    global.onlyGC = false

    // ── 2. Simpan ke db.settings (primary store yang dibaca alya.js per pesan) ──
    try {
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].onlypc = newOnlyPC
      db.settings[botNumber].onlygrub = false
    } catch (e) {
      console.error('[onlypc.js] Gagal update db.settings:', e?.message || e)
    }

    // ── 3. Sync ke global.db.settings (secondary store) ──
    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].onlypc = newOnlyPC
      global.db.settings[botNumber].onlygrub = false
    } catch (e) {
      console.error('[onlypc.js] Gagal update global.db.settings:', e?.message || e)
    }

    // ── 4. Flush ke disk ──
    try { saveDB(global.db) } catch (_) {}

    return replyalya(
      newOnlyPC
        ? '✅ *Bot sekarang hanya merespons di chat pribadi (PC Only)*\n\n• Ketik *.onlypc off* atau *.onlygc* untuk mengubah lagi.'
        : '✅ *Mode PC Only dimatikan.*\nBot kembali merespons di grup maupun chat pribadi.'
    )
  }
}
