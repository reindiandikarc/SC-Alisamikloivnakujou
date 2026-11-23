// Plugin: perangsarung
// Auto-generated from Alya V12
// Commands: perangsarung

const path = require('path')

module.exports = {
  command: ["perangsarung"],
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

        let taggedUsers = m.mentionedJid.slice(0, 7) // Maksimal 7 pemain
        if (taggedUsers.length < 7) return reply(`Tag 7 orang untuk bermain perang sarung!`)

        let name = alya.getName(m.sender)
        let players = taggedUsers.map(jid => ({
            jid,
            name: alya.getName(jid)
        }))

        function randomEliminate() {
            let index = Math.floor(Math.random() * players.length)
            return players.splice(index, 1)[0] // Ambil & hapus dari daftar
        }

        let gameText = `⚔️ **Game Perang Sarung Dimulai!** ⚔️\nPeserta:\n${players.map(p => `- @${p.jid.split('@')[0]}`).join('\n')}`
        reply(gameText)
        setTimeout(() => reply(`🔥 **Ronde 1**: ${randomEliminate().name} telah mati! ☠️`), 5000)
        setTimeout(() => reply(`🔥 **Ronde 2**: ${randomEliminate().name} telah mati! ☠️`), 10000)
        setTimeout(() => reply(`🔥 **Ronde 3**: ${randomEliminate().name} telah mati! ☠️`), 15000)
        setTimeout(() => reply(`🔥 **Ronde 4**: ${randomEliminate().name} telah mati! ☠️`), 20000)
        setTimeout(() => reply(`🔥 **Ronde 5**: ${randomEliminate().name} telah mati! ☠️`), 25000)

        setTimeout(() => {
            let juara3 = randomEliminate()
            let juara2 = randomEliminate()
            let juara1 = players[0] // Pemenang terakhir

            let resultText = `🏆 **Hasil Akhir Perang Sarung!** 🏆\n\n🥇 **Juara 1:** ${juara1.name}\n🥈 **Juara 2:** ${juara2.name}\n🥉 **Juara 3:** ${juara3.name}\n\nTerima kasih sudah bermain!`
            reply(resultText)
        }, 30000)
  }
}
