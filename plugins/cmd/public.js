// Plugin: public
// Mengubah bot ke mode public — semua orang bisa pakai bot
// Commands: public
//
// FIX v1:
// - Simpan ke SEMUA key settings yang dipakai alya.js: db.settings[botNumber] DAN global.db.settings[botNumber]
// - Set alya.public = true langsung di runtime agar efek instan (tanpa tunggu pesan berikutnya)
// - Gunakan optional chaining + fallback agar tidak crash jika settings belum init

module.exports = {
  command: ['public'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      Ryuu, botNumber,
      replyalya, replytolak,
      mess, db, saveDB
    } = ctx

    // Hanya owner yang boleh
    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner yang bisa menggunakan perintah ini.')

    // Cek sudah public
    if (alya.public === true) {
      return replyalya('⚙️ Bot sudah dalam *mode PUBLIC*.\nSemua orang bisa menggunakan bot.')
    }

    // ── 1. Set runtime langsung (efek instan tanpa tunggu pesan berikutnya) ──
    alya.public = true

    // ── 2. Simpan ke db.settings (primary store yang dibaca alya.js per pesan) ──
    try {
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].public = true
    } catch (e) {
      console.error('[public.js] Gagal update db.settings:', e?.message || e)
    }

    // ── 3. Sync ke global.db.settings (secondary store yang juga dipakai beberapa cek) ──
    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].public = true
    } catch (e) {
      console.error('[public.js] Gagal update global.db.settings:', e?.message || e)
    }

    // ── 4. Flush ke disk ──
    try { saveDB(global.db) } catch (_) {}

    return replyalya(
      '✅ *Bot berhasil diubah ke mode PUBLIC*\n\n' +
      '• Semua orang bisa menggunakan bot sekarang.\n' +
      '• Ketik *.self* untuk membatasi hanya owner.'
    )
  }
}
