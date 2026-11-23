// Plugin: alquran
// Auto-generated from Alya V12
// Commands: alquran

const path = require('path')

module.exports = {
  command: ["alquran"],
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

    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)
    async function alquran(surah, ayat) {
        let res = await fetch(`https://kalam.sindonews.com/ayat/${ayat}/${surah}`)
        if (!res.ok) throw 'Error, mungkin tidak ditemukan?'

        let $ = cheerio.load(await res.text())
        let content = $('body > main > div > div.content.clearfix > div.news > section > div.list-content.clearfix')

        let Surah = $(content).find('div.ayat-title > h1').text()
        let arab = $(content).find('div.ayat-detail > div.ayat-arab').text()
        let latin = $(content).find('div.ayat-detail > div.ayat-latin').text()
        let terjemahan = $(content).find('div.ayat-detail > div.ayat-detail-text').text()
        let tafsir = ''

        $(content).find('div.ayat-detail > div.tafsir-box > div').each(function () {
            tafsir += $(this).text() + '\n'
        })
        tafsir = tafsir.trim()

        let keterangan = $(content).find('div.ayat-detail > div.ayat-summary').text()

        return {
            surah: Surah,
            arab,
            latin,
            terjemahan,
            tafsir,
            keterangan,
        }
    }
        if (!text) return reply(`Contoh:\n${prefix + command} 1 2\n\nMaka hasilnya adalah surah Al-Fatihah ayat 2`)
        if (isNaN(args[0]) || isNaN(args[1])) return reply(`Contoh:\n${prefix + command} 1 2\n\nMaka hasilnya adalah surah Al-Fatihah ayat 2`)
        let res = await alquran(args[0], args[1])
        m.reply(`
    ${res.arab}
    ${res.latin}

    ${res.terjemahan}
    ${readMore}
    ${res.tafsir}

    ( ${res.surah} )
    `.trim())
  }
}
