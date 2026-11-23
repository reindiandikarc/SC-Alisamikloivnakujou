// Plugin: daftar
// FIX: dulu baca `registeredUsers` dari ctx yang bersumber dari file
// registered.json terpisah (desync dengan mode case). Sekarang pakai sumber
// data tunggal global.db.users via lib/userRegistration.js.

module.exports = {
  command: ['daftar'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      prefix, replyalya, db
    } = ctx

    const { findRegisteredUser } = require('../../lib/userRegistration')
    const dbRef = db || global.db
    const userId = m.sender
    const existing = findRegisteredUser(dbRef, userId)

    if (existing) {
      return replyalya(
`✅ Hmph... *${existing.nama}* ya? Kamu tuh udah terdaftar dari tadi!

Ngapain sih daftar lagi? 😒
Bukan berarti aku seneng kamu balik... b-baka!`
      )
    }

    await alya.sendMessage(m.chat, {
      image: { url: 'https://raw.githubusercontent.com/reindiandikarc/Yuugames/refs/heads/main/alya1.jpg' },
      caption: `Selamat datang! 👋\n\nKlik tombol di bawah untuk registrasi otomatis.`,
      footer: 'Alyachan Official',
      buttons: [
        {
          buttonId: `${prefix}automaticreg`,
          buttonText: { displayText: '⚡ Register Automatic' },
          type: 1
        }
      ],
      headerType: 1
    })
  }
}
