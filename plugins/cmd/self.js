// Plugin: self
// Mengubah bot ke mode self — hanya owner yang bisa pakai bot
// Commands: self
//
// FIX v1:
// - Simpan ke SEMUA key settings yang dipakai alya.js: db.settings[botNumber] DAN global.db.settings[botNumber]
// - Set alya.public = false langsung di runtime agar efek instan (tanpa tunggu pesan berikutnya)
// - Gunakan optional chaining + fallback agar tidak crash jika settings belum init

module.exports = {
  command: ['self'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      Ryuu, botNumber,
      replyalya, replytolak,
      mess, db, saveDB
    } = ctx

    // Hanya owner yang boleh
    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner yang bisa menggunakan perintah ini.')

    // Cek sudah self
    if (alya.public === false) {
      return replyalya('⚙️ Bot sudah dalam *mode SELF*.\nHanya owner yang bisa menggunakan bot.')
    }

    // ── 1. Set runtime langsung (efek instan tanpa tunggu pesan berikutnya) ──
    alya.public = false

    // ── 2. Simpan ke db.settings (primary store yang dibaca alya.js per pesan) ──
    try {
      // pastikan key ada
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].public = false
    } catch (e) {
      console.error('[self.js] Gagal update db.settings:', e?.message || e)
    }

    // ── 3. Sync ke global.db.settings (secondary store yang juga dipakai beberapa cek) ──
    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].public = false
    } catch (e) {
      console.error('[self.js] Gagal update global.db.settings:', e?.message || e)
    }

    // ── 4. Flush ke disk ──
    try { saveDB(global.db) } catch (_) {}

    return replyalya(
      '✅ *Bot berhasil diubah ke mode SELF*\n\n' +
      '• Hanya owner yang bisa menggunakan bot sekarang.\n' +
      '• Ketik *.public* untuk kembali ke mode publik.'
    )
  }
}
