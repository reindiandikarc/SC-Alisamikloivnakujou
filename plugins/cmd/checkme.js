// Plugin: checkme
// Auto-generated from Alya V12
// Commands: checkme

const path = require('path')

module.exports = {
  command: ["checkme"],
  tags: ['info'],
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

        const bet = sender
        const name = pushname || 'User'

        // helper random persen
        const rand100 = () => Math.floor(Math.random() * 101)

        const sifat = [
            "Baik", "Tidak ramah", "Chapri", "Nibba/Nibbi", "Mengganggu",
            "Rusak", "Orang marah", "Sopan", "Beban", "Hebat",
            "Cringe", "Pembohong"
        ]

        const hobi = [
            "Memasak","Menari","Bermain","Bermain game","Melukis",
            "Membantu Orang Lain","Menonton anime","Membaca",
            "Bersepeda","Bernyanyi","Berbincang-bincang",
            "Berbagi Meme","Menggambar","Menghabiskan Uang Orang Tua",
            "Bermain Truth or Dare","Menghabiskan Waktu Sendirian"
        ]

        const cakep = ["Ya", "Tidak", "Sangat jelek", "Sangat tampan"]

        const watak = [
            "Peduli","Murah hati","Pemarah","Tunduk","Baik",
            "Berhati baik","Sabar","UwU","Terbaik","Membantu"
        ]

        // random hasil
        const result = {
            sifat: sifat[Math.floor(Math.random() * sifat.length)],
            hobi: hobi[Math.floor(Math.random() * hobi.length)],
            bucin: rand100(),
            great: rand100(),
            ganteng: cakep[Math.floor(Math.random() * cakep.length)],
            watak: watak[Math.floor(Math.random() * watak.length)],
            baik: rand100(),
            buruk: rand100(),
            cerdas: rand100(),
            berani: rand100(),
            penakut: rand100()
        }

        // ambil PP user
        let ppuser
        try {
            ppuser = await alya.profilePictureUrl(bet, 'image')
        } catch {
            ppuser = defaultpp // fallback kalau PP private
        }

        const profile = `*≡══《 Check @${bet.split('@')[0]} 》══≡*

    *Nama :* ${name}
    *Karakteristik :* ${result.sifat}
    *Hobi :* ${result.hobi}
    *Bucin :* ${result.bucin}%
    *Great :* ${result.great}%
    *Ganteng :* ${result.ganteng}
    *Watak :* ${result.watak}
    *Moral Baik :* ${result.baik}%
    *Moral Buruk :* ${result.buruk}%
    *Kecerdasan :* ${result.cerdas}%
    *Keberanian :* ${result.berani}%
    *Penakut :* ${result.penakut}%

    *≡═══《 CHECK PROPERTIES 》═══≡*`

        alya.sendMessage(
            from,
            {
                image: { url: ppuser },
                caption: profile,
                mentions: [bet]
            },
            { quoted: m }
        )
  }
}
