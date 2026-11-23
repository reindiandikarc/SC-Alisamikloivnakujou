// Plugin: automaticreg
// FIX: sebelumnya baca/tulis registered.json ke array module-level yang
// terpisah dari yang dipakai mode case (Alya.js) -> data "hilang" kalau
// ganti mode, dan rawan race antar-user. Sekarang sumber data tunggal:
// global.db.users[id].registered, lewat lib/userRegistration.js — sinkron
// otomatis dengan mode case, dan disimpan via saveDB() yang sudah aman.

module.exports = {
  command: ['automaticreg'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      sender, pushname,
      replyalya, db, saveDB,
      generateAnimeCard
    } = ctx

    const { findRegisteredUser, registerUser, generateKodeReg } = require('../../lib/userRegistration')
    const dbRef = db || global.db

    const userId = sender
    const existing = findRegisteredUser(dbRef, userId)

    if (existing) {
      return replyalya(
`✅ Hmph... *${existing.nama}* ya? Kamu tuh udah terdaftar dari tadi!

Ngapain sih daftar lagi? 😒
Bukan berarti aku seneng kamu balik... b-baka!`
      )
    }

    const nama = pushname || `User${Object.keys(dbRef.users || {}).length + 1}`
    const kodeReg = generateKodeReg(8)
    const daftar_pada = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    const ppuser = await alya.profilePictureUrl(userId, 'image').catch(() => null)

    const dataUser = registerUser(dbRef, saveDB, userId, {
      nama, kodeReg, daftarPada: daftar_pada, ppuser,
      bonusLimit: 30, bonusMoney: 50000
    })

    const cardBuffer = await generateAnimeCard(dataUser)

    const tinyThumbnail = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgPo8MksAAAAASUVORK5CYII=',
      'base64'
    )

    await alya.sendMessage(m.chat, {
      image: cardBuffer,
      caption: `🎉 *Registrasi Berhasil!*

👤 Nama: ${nama}
🆔 Kode: ${kodeReg}
📅 Tanggal: ${daftar_pada}
💎 Status: Free User
✔️ Verified: True

🎁 *Bonus User Baru*
💳 Limit: +30
💰 Money: +50000`,
      footer: 'Alyachan Official',
      buttons: [
        { buttonId: `${ctx.prefix}menu`, buttonText: { displayText: 'Menu' }, type: 1 }
      ],
      headerType: 4,
      jpegThumbnail: tinyThumbnail
    })

    // Notif ke newsletter
    const notifMsg = `📢 User Baru Terdaftar
👤 Nama: ${nama}
🆔 Kode: ${kodeReg}
📅 Tanggal: ${daftar_pada}
💎 Status: Free User
✔️ Verified: True

🎁 Bonus:
Limit +30
Money +50000`

    await alya.sendMessage('120363422956241554@newsletter', { text: notifMsg }).catch(() => {})
  }
}
