// Plugin: belihadiah
// Auto-generated from Alya V12
// Commands: belihadiah

const path = require('path')

module.exports = {
  command: ["belihadiah"],
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
        const HARGA_COKELAT = 50000
        const HARGA_BUNGA = 150000

        if (!args[0]) {
            let shop = `🛍️ *TOKO HADIAH WAIFU* 🛍️\n\n`
            shop += `1. Cokelat 🍫 - Rp ${HARGA_COKELAT.toLocaleString()}\n`
            shop += `2. Buket Bunga 💐 - Rp ${HARGA_BUNGA.toLocaleString()}\n\n`
            shop += `Ketik *.belihadiah 1* atau *.belihadiah 2* buat masukin ke tas.`
            return replyalya(shop)
        }
        users.lastBeliHadiah ??= 0
        let cooldownBeli = 300000
        let timeLapseBeli = Date.now() - users.lastBeliHadiah
        if (timeLapseBeli < cooldownBeli) {
            let sisaBeli = Math.ceil((cooldownBeli - timeLapseBeli) / 1000)
            return replyalya(`⏳ Tokonya lagi istirahat bray. Balik lagi dalam ${sisaBeli} detik.`)
        }

        users.inventory ??= {}

        if (args[0] === '1') {
            if (users.money < HARGA_COKELAT) return replyalya("💸 Uang lu kurang buat beli Cokelat.")
            users.money -= HARGA_COKELAT
            users.lastBeliHadiah = Date.now()
            users.inventory.cokelat = (users.inventory.cokelat || 0) + 1
            replyalya(`🍫 Berhasil beli 1 Cokelat seharga Rp ${HARGA_COKELAT.toLocaleString()}\nCek tas lu, sekarang bisa dikasih ke istri pakai *.kasihhadiah cokelat*`)
        } else if (args[0] === '2') {
            if (users.money < HARGA_BUNGA) return replyalya("💸 Uang lu kurang buat beli Buket Bunga.")
            users.money -= HARGA_BUNGA
            users.lastBeliHadiah = Date.now()
            users.inventory.bunga = (users.inventory.bunga || 0) + 1
            replyalya(`💐 Berhasil beli 1 Buket Bunga seharga Rp ${HARGA_BUNGA.toLocaleString()}\nCek tas lu, sekarang bisa dikasih ke istri pakai *.kasihhadiah bunga*`)
        } else {
            replyalya("Pilih angka 1 atau 2 aja bray.")
        }
  }
}
