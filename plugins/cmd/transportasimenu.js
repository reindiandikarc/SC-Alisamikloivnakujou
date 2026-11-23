// Plugin: transportasimenu
// Fixed for Alya V13
// Commands: transportasimenu

const path = require('path')

module.exports = {
  command: ["transportasimenu"],
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
      // 2705 FIX: listbut2 diambil dari ctx bukan global
      listbut2, listbut3
    } = ctx

      let AlyaSad = `╭── • 🚆 *TRANSPORTASI & PROVIDER* • ──╮
┃
┣⊱ 🚆 *${prefix}kaijadwal* - Jadwal kereta api KAI
┣⊱ ✈️ *${prefix}bandarajadwal* - Jadwal penerbangan pesawat
┃
┣⊱ 📶 *${prefix}cekkuota <nomor>* - Cek kuota internet
┣⊱ 💰 *${prefix}cekpulsa <nomor>* - Cek saldo pulsa
┃
┣⊱ 📱 Operator: Telkomsel, Indosat, XL, Axis, Tri, Smartfren, By.U
┃
┣⊱ 📌 *Contoh:*
┣⊱ ${prefix}kaijadwal GMR YK 2025-06-01
┣⊱ ${prefix}bandarajadwal CGK DPS
┣⊱ ${prefix}cekkuota 08123456789
┣⊱ ${prefix}cekpulsa 08123456789
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
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
        },
        {
            title: "🚆 TRANSPORTASI",
            rows: [
                { title: "🚆 JADWAL KERETA API", description: "Cek jadwal KAI: .kaijadwal GMR YK 2025-06-01", id: `${prefix}kaijadwal` },
                { title: "✈️ JADWAL PESAWAT", description: "Cek jadwal penerbangan: .bandarajadwal CGK DPS", id: `${prefix}bandarajadwal` },
                { title: "📶 CEK KUOTA INTERNET", description: "Cek kuota semua operator: .cekkuota 08xxx", id: `${prefix}cekkuota` },
                { title: "💰 CEK PULSA / SALDO", description: "Cek saldo pulsa: .cekpulsa 08xxx", id: `${prefix}cekpulsa` },
            ]
        },
        {
            title: "🥳 FUN & LAIN-LAIN",
            rows: [
                { title: "🥳 FUN MENU", description: "Fitur menyenangkan", id: `${prefix}funmenu` },
                { title: "🕌 ISLAMI MENU", description: "Fitur religi islami", id: `${prefix}islamimenu` },
                { title: "👤 ANONYMOUS", description: "Fitur anonymous chat", id: `${prefix}anonymousmenu` },
                { title: "📮 BERITA MENU", description: "Fitur berita terkini", id: `${prefix}beritamenu` },
                { title: "📪 OTHER MENU", description: "Fitur yang tidak dikategorikan", id: `${prefix}othermenu` },
            ]
        },
        {
            title: "👑 OWNER & ADMIN",
            rows: [
                { title: "👤 OWNER MENU", description: "Khusus untuk pengembang bot", id: `${prefix}ownermenu` },
                { title: "👥 GROUP MENU", description: "Pengaturan grup & admin", id: `${prefix}groupmenu` }
            ]
        }
    ];
        const listnye = {
            title: "LIHAT MENU",
            sections: sections
        };
    	await listbut3(m.chat, AlyaSad, listnye, m);
  }
}
