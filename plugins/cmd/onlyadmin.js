// Plugin: onlyadmin
// Commands: blackbox, onlyadmin
// Fungsi: Mode "Bot Khusus Admin" per grup — kalau ON, hanya Admin Grup dan
//         Owner Bot yang bisa memakai command bot di grup ini. Member biasa
//         tetap bisa chat normal, hanya saja bot tidak akan merespon command
//         mereka. Status disimpan persisten di database/mute.json dan
//         di-enforce langsung di alya.js (real-time, tanpa perlu restart bot).

const path = require('path')
const fs = require('fs')

const MUTE_PATH = path.join(__dirname, '../../database/mute.json')

function loadMute() {
  try { return JSON.parse(fs.readFileSync(MUTE_PATH, 'utf-8')) } catch { return [] }
}
function saveMute(data) {
  try { fs.writeFileSync(MUTE_PATH, JSON.stringify(data, null, 2)) } catch {}
}

module.exports = {
  command: ['blackbox', 'onlyadmin'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      isAdmins, isAdminOrOwner, Ryuu,
      reply, replyalya, replytolak,
    } = ctx

    if (!m.isGroup) return replytolak('Jangan di sini, baka! Gunakan fitur ini di dalam grup.')

    if (!isAdmins && !Ryuu) {
      return reply('Hah? Siapa kamu berani memerintahku? Aku hanya patuh pada Admin dan Owner-ku saja! \n\n_Ty nikto... (Kamu bukan siapa-siapa...)_')
    }

    const mute = loadMute()
    const isMute = mute.includes(m.chat)

    if (args[0] === 'on') {
      if (isMute) return reply('Sudah kubilang aku sedang tidak ingin bicara dengan member biasa. Berhenti menggangguku!')
      mute.push(m.chat)
      saveMute(mute)
      // ✅ Invalidate cache agar enforcement langsung aktif tanpa tunggu TTL 5 detik
      if (global._muteGroupsCache) global._muteGroupsCache.ts = 0
      return reply(`Oke, baiklah! Mulai sekarang aku hanya akan merespon Admin dan Owner saja. Meladeni member biasa itu membuatku malas sekali! \n\n_Mne len' razgovarivat' s nimi... (Aku malas bicara dengan mereka...)_\n\n_✅ Aktif sekarang juga, tidak perlu restart bot._`)
    } else if (args[0] === 'off') {
      if (!isMute) return reply('Aku kan sudah bilang bisa merespon semuanya, dasar pelupa!')
      const idx = mute.indexOf(m.chat)
      if (idx !== -1) mute.splice(idx, 1)
      saveMute(mute)
      // ✅ Invalidate cache agar enforcement langsung nonaktif tanpa tunggu TTL 5 detik
      if (global._muteGroupsCache) global._muteGroupsCache.ts = 0
      return reply('Hmph, ya sudah. Aku akan kembali merespon semuanya. Tapi jangan buat aku menyesal ya! \n\n_Ura... (Akhirnya...)_\n\n_✅ Nonaktif sekarang juga, tidak perlu restart bot._')
    } else {
      const chatId = m.chat
      return reply(
        `${isMute ? '🔇 *OnlyAdmin (Bot Khusus Admin): ON*' : '🔊 *OnlyAdmin (Bot Khusus Admin): OFF*'}\n\n` +
        `ℹ️ Kalau ON: hanya Admin Grup & Owner Bot yang bisa pakai command bot di grup ini. Member biasa tetap bisa chat seperti biasa.\n\n` +
        `Pilih opsi:\n\n> ${prefix}${command} on\n> ${prefix}${command} off`
      )
    }
  }
}
