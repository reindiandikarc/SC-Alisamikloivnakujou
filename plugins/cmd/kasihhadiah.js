// Plugin: kasihhadiah
// Auto-generated from Alya V12
// Commands: kasihhadiah

const path = require('path')

module.exports = {
  command: ["kasihhadiah"],
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

        let users = global.db.users[m.sender]
        if (!users.waifu || !users.waifu.name) return replyalya("😔 Mau ngasih hadiah ke siapa? Istri aja gak punya.")

        users.lastKasihHadiah ??= 0
        let cooldownKasih = 300000
        let timeLapseKasih = Date.now() - users.lastKasihHadiah
        if (timeLapseKasih < cooldownKasih) {
            let sisaKasih = Math.ceil((cooldownKasih - timeLapseKasih) / 1000)
            return replyalya(`⏳ Pelan-pelan bray, kasih waktu dia buat nikmatin hadiah sebelumnya. Tunggu ${sisaKasih} detik lagi.`)
        }

        users.inventory ??= {}

        if (!args[0]) {
            return replyalya(`Mau ngasih hadiah apa ke *${users.waifu.name}*?\nKetik *.kasihhadiah cokelat* atau *.kasihhadiah bunga*`)
        }

        let item = args[0].toLowerCase()
        users.waifu.affection ??= 0

        if (item === 'cokelat') {
            if (!users.inventory.cokelat || users.inventory.cokelat < 1) return replyalya("❌ Lu gak punya Cokelat di tas. Beli dulu di *.belihadiah*")
            users.inventory.cokelat -= 1
            users.waifu.affection += 10
            users.lastKasihHadiah = Date.now()
            replyalya(`🍫 Lu ngasih sebatang Cokelat manis ke *${users.waifu.name}*.\nDia tersenyum senang menerimanya!\n\n📈 Affection +10 (Total: ${users.waifu.affection})`)
        } else if (item === 'bunga') {
            if (!users.inventory.bunga || users.inventory.bunga < 1) return replyalya("❌ Lu gak punya Bunga di tas. Beli dulu di *.belihadiah*")
            users.inventory.bunga -= 1
            users.waifu.affection += 30
            users.lastKasihHadiah = Date.now()
            replyalya(`💐 Lu memberikan buket Bunga yang sangat indah ke *${users.waifu.name}*.\nPipinya merona merah dan dia sangat bahagia!\n\n📈 Affection +30 (Total: ${users.waifu.affection})`)
        } else {
            replyalya("Item gak valid. Pilih 'cokelat' atau 'bunga' sesuai yang ada di tas.")
        }
  }
}
