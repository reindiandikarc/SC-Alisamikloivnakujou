// Plugin: addlist
// Commands: addlist
// Deskripsi: Tambah item ke list respons per-grup
// Penggunaan: .addlist key|respons

const path = require('path')

module.exports = {
  command: ['addlist'],
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
      db_respon_list, addResponList, isAlreadyResponList, uploadwidipe
    } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur Khusus Group!')
    if (!isAdmins) return replytolak('❌ Fitur Khusus Admin!')

    if (!q || !q.includes('|')) {
      return reply(
        `╔═══ ➕ *ADDLIST* ═══╗\n` +
        `┃\n` +
        `┣ Cara pakai:\n` +
        `┣ *${prefix}addlist key|response*\n` +
        `┃\n` +
        `┣ Contoh:\n` +
        `┗ *${prefix}addlist tes|Halo ini respons!*\n\n` +
        `💡 Key yang ditambah akan muncul sebagai\n` +
        `tombol di perintah *${prefix}openlist*`
      )
    }

    const args1 = q.split('|')[0].trim().toLowerCase()
    const args2 = q.split('|').slice(1).join('|').trim()

    if (!args1 || !args2) return reply(`❌ Key dan respons tidak boleh kosong!`)
    if (args1.length > 24) return reply(`❌ Key terlalu panjang! Maksimal 24 karakter.`)

    // Cek apakah key sudah ada di grup ini (per-grup, bukan global)
    if (isAlreadyResponList(m.chat, args1, db_respon_list)) {
      return reply(
        `⚠️ Key *${args1}* sudah terdaftar di grup ini!\n\n` +
        `Gunakan *${prefix}updatelist ${args1}|respons baru* untuk mengubahnya,\n` +
        `atau *${prefix}dellist ${args1}* untuk menghapusnya.`
      )
    }

    try {
      if (isImage || (quoted && /image/.test(mime))) {
        // Jika ada gambar, download dan upload
        const media = await alya.downloadAndSaveMediaMessage(quoted)
        const mem = await uploadwidipe(media)
        addResponList(m.chat, args1, args2, true, mem, db_respon_list)
        reply(
          `✅ *Berhasil tambah list (dengan gambar)!*\n\n` +
          `🔑 Key : *${args1}*\n` +
          `🖼️ Gambar : Tersimpan\n` +
          `📝 Caption : ${args2}\n\n` +
          `_Tampilkan dengan: ${prefix}list_`
        )
        if (require('fs').existsSync(media)) require('fs').unlinkSync(media)
      } else {
        addResponList(m.chat, args1, args2, false, '-', db_respon_list)
        reply(
          `✅ *Berhasil tambah list!*\n\n` +
          `🔑 Key : *${args1}*\n` +
          `📝 Respons : ${args2.length > 60 ? args2.substring(0, 60) + '...' : args2}\n\n` +
          `_Tampilkan dengan: ${prefix}list_\n` +
          `_Buka via button: ${prefix}openlist ${args1}|teks_`
        )
      }
    } catch (e) {
      console.error('[addlist] Error:', e)
      reply(`❌ Gagal menyimpan list! Coba lagi.`)
    }
  }
}
