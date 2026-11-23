// Plugin: mancing
// Commands: mancing
// Port dari Alya V10 — FIX: mess.only.group → string literal, getName fallback

'use strict'

module.exports = {
  command: ['mancing'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const { reply, replytolak, user } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di dalam grup!')

    function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let min = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, min, s].map(v => v.toString().padStart(2, '0')).join(':')
    }

    const id = m.sender
    const userData = global.db.users[id]
    if (!userData) return replytolak('❌ Data user tidak ditemukan. Silakan daftar terlebih dahulu.')

    const __timers = (new Date - userData.lastmisi)
    const _timers = (3600000 - __timers)
    const timers = clockString(_timers)

    const kerja = 'Memancing'
    if (!alya.misi) alya.misi = {}

    if (id in alya.misi) {
      return reply(`Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
    }

    if (!userData.umpan || userData.umpan <= 0) return m.reply('Kamu Membutuhkan Umpan 🪱 Untuk Memancing!')
    if (!userData.fishingrod || userData.fishingrod <= 0) return m.reply('Kamu Harus Mempunyai Fishingrod 🎣 Terlebih Dahulu Jika Ingin Memancing')

    if (new Date - userData.lastmisi > 3600000) {
      const ikan1  = Math.floor(Math.random() * 5)
      const ikan2  = Math.floor(Math.random() * 5)
      const ikan3  = Math.floor(Math.random() * 5)
      const ikan4  = Math.floor(Math.random() * 5)
      const ikan5  = Math.floor(Math.random() * 5)
      const ikan6  = Math.floor(Math.random() * 5)
      const ikan7  = Math.floor(Math.random() * 5)
      const ikan8  = Math.floor(Math.random() * 5)
      const ikan9  = Math.floor(Math.random() * 5)
      const ikan10 = Math.floor(Math.random() * 5)
      const ikan11 = Math.floor(Math.random() * 5)

      const hsl = `*📮 Hasil tangkapan Mu*
${ikan1  ? `\n🦀 Kepiting: ${ikan1}`  : ''}${ikan2  ? `\n🦞 Lobster: ${ikan2}`   : ''}${ikan3  ? `\n🦐 Udang: ${ikan3}`     : ''}${ikan4  ? `\n🦑 Cumi: ${ikan4}`      : ''}${ikan5  ? `\n🐙 Gurita: ${ikan5}`    : ''}${ikan6  ? `\n🐡 Buntal: ${ikan6}`    : ''}${ikan7  ? `\n🐠 Dory: ${ikan7}`      : ''}${ikan8  ? `\n🐳 Orca: ${ikan8}`      : ''}${ikan9  ? `\n🐬 Lumba: ${ikan9}`     : ''}${ikan10 ? `\n🐋 Paus: ${ikan10}`     : ''}${ikan11 ? `\n🦈 Hiu: ${ikan11}`      : ''}`.trim()

      userData.kepiting  = (userData.kepiting  || 0) + ikan1
      userData.lobster   = (userData.lobster   || 0) + ikan2
      userData.udang     = (userData.udang     || 0) + ikan3
      userData.cumi      = (userData.cumi      || 0) + ikan4
      userData.gurita    = (userData.gurita    || 0) + ikan5
      userData.buntal    = (userData.buntal    || 0) + ikan6
      userData.dory      = (userData.dory      || 0) + ikan7
      userData.orca      = (userData.orca      || 0) + ikan8
      userData.lumba     = (userData.lumba     || 0) + ikan9
      userData.paus      = (userData.paus      || 0) + ikan10
      userData.hiu       = (userData.hiu       || 0) + ikan11

      if (userData.fishingroddurability !== undefined) userData.fishingroddurability -= 10
      userData.umpan -= 1

      alya.misi[id] = [
        kerja,
        setTimeout(() => { delete alya.misi[id] }, 20000)
      ]

      setTimeout(() => { m.reply('Kamu Sedang Memancing...') },  0)
      setTimeout(() => { m.reply('Kail Mu Di Tarik Ikan...') },  9000)
      setTimeout(() => { m.reply('Kamu Menarik Kailmu') },       12000)
      setTimeout(() => { m.reply('Kamu Berhasil Menarik Ikan Keluar Dari Air') }, 15000)
      setTimeout(() => { m.reply('Ini Dia Hasil Tangkapanmu') },  18000)
      setTimeout(() => { m.reply(hsl) },                          20000)

      userData.lastmisi = new Date * 1

    } else {
      m.reply(`Mohon Tunggu Selama ${timers} Sebelum Memulai Misi Kembali`)
    }
  }
}
