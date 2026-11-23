// Plugin: onlygroup
// Commands: onlygroup
//
// FIX v2 (root cause): versi lama adalah sisa migrasi switch/case V12 → plugin.
// Case 'onlygroup' dan case 'onlyprivatechat'/'onlypc' ketukar jadi satu blok
// tanpa pemisah, jadi tiap kali jalanin ".onlygroup on/off" otomatis IKUT
// ngubah db.settings[botNumber].onlypc ke nilai yang sama — bikin onlygrub dan
// onlypc nyala bareng (kontradiktif: "hanya grup" + "hanya pribadi" sekaligus).
//
// Sekarang dipisah bersih: .onlygroup HANYA mengubah onlygrub, gak nyentuh onlypc.
// Juga ditambah sync ke global.db.settings + saveDB supaya konsisten dengan
// onlygc.js/onlypc.js/public.js/self.js.

module.exports = {
  command: ['onlygroup'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      Ryuu, botNumber, q, args, prefix, command,
      replyalya, replytolak, mess, db, saveDB
    } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || 'Fitur Khusus owner!')
    if (args.length < 1) return replyalya(`Contoh: ${prefix + command} on/off`)

    if (q !== 'on' && q !== 'off') {
      return replyalya(`Contoh: ${prefix + command} on/off`)
    }

    const newOnlygrub = q === 'on'

    try {
      if (!db.settings) db.settings = {}
      if (!db.settings[botNumber]) db.settings[botNumber] = {}
      db.settings[botNumber].onlygrub = newOnlygrub
    } catch (e) {
      console.error('[onlygroup.js] Gagal update db.settings:', e?.message || e)
    }

    try {
      if (!global.db) global.db = {}
      if (!global.db.settings) global.db.settings = {}
      if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {}
      global.db.settings[botNumber].onlygrub = newOnlygrub
    } catch (e) {
      console.error('[onlygroup.js] Gagal update global.db.settings:', e?.message || e)
    }

    try { saveDB(global.db) } catch (_) {}

    return replyalya(`Successfully Changed Onlygroup To ${q}`)
  }
}
