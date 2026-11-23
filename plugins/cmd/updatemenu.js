// Plugin: updatemenu
// Fixed for Alya V13
// Commands: updatemenu

const path = require('path')

module.exports = {
  command: ["updatemenu"],
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
      waifuList, husbuList, pler, setting, user,
      listbut2, listbut3
    } = ctx

    let updateTeks = `╔══ 🔄 *「 UPDATE LOG - ALYA V13 」* 🔄 ══╗
┃
┣⊱ ✅ *Patch Notes V13*
┃
┣⊱ 🎌 Allmenu anime sudah di fix
┣⊱ 🤖 AI lebih responsif & stabil
┣⊱ 🔄 Sistem menu diperbarui ke V13
┣⊱ 👋 .setwelcome bisa ganti format kapan saja
┣⊱ 👋 .setleft bisa ganti format kapan saja
┣⊱ ♟️ Game baru: .catur (PvP 2 pemain)
┣⊱ 🎯 Game baru: .truthordare / .tod
┣⊱ 🔧 Arsitektur plugin baru V13
┣⊱ 🐛 Fix semua command & menu V13
┃
┣⊱ 📌 *Noted:*
┃  Jangan Reply, Tagg, dan Panggil Alya
┃  Jika tidak ada yang penting. Tapi
┃  kalau sekedar chatan sama dia gak
┃  papa, nanya-nanya yang bener.
┃  Kalau mau mainan cukup gak usah
┃  reply bot, udah responsif.
┃
╚════════════════════╝`

    const sections = [
      {
        title: "🌟 MENU UTAMA",
        rows: [
          { title: "📦 SEMUA FITUR", description: "📌 Tampilkan semua list perintah bot", id: `${prefix}allmenu` },
          { title: "📜 PERATURAN", description: "🎉 Baca aturan penggunaan bot", id: `${prefix}rules` },
          { title: "🆕 FITUR BARU", description: "Update fitur terbaru Alya", id: `${prefix}newfitur` },
          { title: "💸 DONASI", description: "Donasi bot agar dapat berkembang", id: `${prefix}donasi` },
          { title: "🌟 RATING", description: "Rating bot ini", id: `${prefix}rating` },
          { title: "📋 INFO BOT", description: "Menampilkan informasi bot", id: `${prefix}infobot` },
          { title: "🔄 UPDATE MENU", description: "Lihat update terbaru Alya V13", id: `${prefix}updatemenu` }
        ]
      }
    ]

    const listnye = {
      title: "LIHAT MENU",
      sections: sections
    }

    await listbut3(m.chat, updateTeks, listnye, m)
  }
}
