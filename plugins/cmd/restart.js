// Plugin: restart
// Auto-generated from Alya V12
// Commands: restart
//
// FIX KRITIS: process.exit() TANPA argumen = exit code 0.
// Tidak lagi pakai PM2 — panel hosting (Pterodactyl dkk) yang mendeteksi
// proses berhenti/crash dan menyalakan ulang. Panel umumnya hanya
// auto-restart kalau proses exit dengan kode abnormal (!= 0). Jadi kalau
// pakai exit(0) (selesai "normal"), bot benar-benar MATI dan TIDAK PERNAH
// nyala lagi — ini adalah root cause utama "fitur restart tidak berfungsi".
// FIX: pakai process.exit(1) supaya panel mendeteksinya sebagai exit
// abnormal dan menyalakan ulang proses secara otomatis.

const path = require('path')

module.exports = {
  command: ["restart"],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)
    await replyalya(`🔄 Restarting ${global.botname}...`)
    await replyalya(`✅ Berhasil Restart — bot akan online kembali dalam beberapa detik.`)
    // Beri waktu agar pesan di atas terkirim sebelum proses exit
    await sleep(2000)
    // ✅ FIX: exit(1) bukan exit() — supaya PM2 (autorestart: true) mendeteksi
    // exit abnormal dan benar-benar menyalakan ulang proses.
    process.exit(1)
  }
}
