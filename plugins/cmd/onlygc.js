// Plugin: onlygc
// Commands: onlygc
//
// FIX v2 (root cause):
// - Versi lama hanya set global.onlyGC/global.onlyPC, padahal enforcement asli di alya.js
//   membaca db.settings[botNumber].onlygrub & db.settings[botNumber].onlypc.
//   Akibatnya command ini "sukses" tapi TIDAK punya efek apa pun ke behavior bot.
// - Sekarang ditulis ke key yang benar (onlygrub), disinkron ke db.settings DAN
//   global.db.settings, lalu di-flush ke disk — sama seperti pola public.js/self.js.
// - Tambah dukungan "off" agar bisa dimatikan tanpa harus ganti ke .onlypc.

module.exports = {
  command: ['onlygc'],
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

    // ── 1. Set runtime langsung (efek instan) ──
    global.onlyGC = newOnlyGC
    global.onlyPC = false

    // ── 2. Simpan ke db.settings (primary store yang dibaca alya.js per pesan) ──
    try {
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].onlygrub = newOnlyGC
      db.settings[botNumber].onlypc = false
    } catch (e) {
      console.error('[onlygc.js] Gagal update db.settings:', e?.message || e)
    }

    // ── 3. Sync ke global.db.settings (secondary store) ──
    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].onlygrub = newOnlyGC
      global.db.settings[botNumber].onlypc = false
    } catch (e) {
      console.error('[onlygc.js] Gagal update global.db.settings:', e?.message || e)
    }

    // ── 4. Flush ke disk ──
    try { saveDB(global.db) } catch (_) {}

    return replyalya(
      newOnlyGC
        ? '✅ *Bot sekarang hanya merespons di grup (GC Only)*\n\n• Ketik *.onlygc off* atau *.onlypc* untuk mengubah lagi.'
        : '✅ *Mode GC Only dimatikan.*\nBot kembali merespons di grup maupun chat pribadi.'
    )
  }
}
