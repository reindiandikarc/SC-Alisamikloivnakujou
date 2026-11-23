// Plugin: sulap
// Auto-generated from Alya V12
// Commands: siderv2, sulap

const path = require('path')

module.exports = {
  command: ["siderv2", "sulap"],
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

      if (!m.isGroup) return replytolak('❗ *Perintah ini hanya bisa digunakan dalam grup!*')
      if (!isAdmins && !Ryuu) return replytolak('❗ *Perintah ini hanya untuk admin grup!*')
      if (!isBotAdmins) return replytolak('❗ *Bot harus menjadi admin terlebih dahulu!*')

      let target = m.mentionedJid[0]
                 || (m.quoted ? m.quoted.sender : null)
                 || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

      if (!target) return replyalya('❗ *Tag atau reply seseorang untuk dikeluarkan!*')
      if (target === m.sender) return replyalya('❗ *Kamu tidak bisa mengeluarkan dirimu sendiri!*')
      if (owner.includes(target.split('@')[0])) return replyalya('❗ *Tidak bisa mengeluarkan owner bot!*')

      await alya.sendMessage(m.chat, { react: { text: "🧙", key: m.key } })
      await alya.sendMessage(m.chat,{
        text:`✨ *Pertunjukan Sulap Dimulai!*`,
        contextInfo: {}
      },{quoted:m})

      const sentMsg = await alya.sendMessage(m.chat,{
        text:`🧙 *Abrakadabra...*
    ✨ Persiapkan diri untuk menyaksikan keajaiban!`
      },{quoted:m})

      await sleep(4000)
      await alya.sendMessage(m.chat,{ text:`🌀 *Mengumpulkan kekuatan sihir...*`, edit: sentMsg.key })

      await sleep(4000)
      await alya.sendMessage(m.chat,{ text:`💫 *Mengarahkan tongkat ke target...*`, edit: sentMsg.key })

      await sleep(4000)
      await alya.sendMessage(m.chat,{ text:`🎇 *Dalam hitungan 3 detik dia akan menghilang!*
    3️⃣...`, edit: sentMsg.key })

      await sleep(2000)
      await alya.sendMessage(m.chat,{ text:`🎇 *Dalam hitungan 3 detik dia akan menghilang!*
    2️⃣...`, edit: sentMsg.key })

      await sleep(2000)
      await alya.sendMessage(m.chat,{ text:`🎇 *Dalam hitungan 3 detik dia akan menghilang!*
    1️⃣... 💥`, edit: sentMsg.key })

      await alya.groupParticipantsUpdate(m.chat,[target],'remove')

      await alya.sendMessage(m.chat,{
        text:`🎩 *Dan poof! Dia telah menghilang seperti sulap!* ✨`,
        mentions:[target]
      },{quoted:m})
  }
}
