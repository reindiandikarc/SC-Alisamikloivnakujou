// Plugin: wastalker
// Auto-generated from Alya V12
// Commands: whatsappstalk, wastalker

const path = require('path')

module.exports = {
  command: ["whatsappstalk", "wastalker"],
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

      if (!m.isGroup) return replyalya('❌ Fitur ini hanya untuk grup')

      try {
        const moment = require("moment-timezone")
        const PhoneNum = require("awesome-phonenumber")

        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

        let input = q || m.quoted?.sender || m.mentionedJid?.[0]
        if (!input) return replyalya(`⚠️ Contoh:\n${prefix + command} 628xxx`)

        let number = input.replace(/\D/g, '')
        if (number.length < 8) return replyalya('❌ Nomor tidak valid')

        let jid = number + '@s.whatsapp.net'

        let cek = await alya.onWhatsApp(jid)
        if (!cek[0]?.exists) return replyalya('❌ Nomor tidak terdaftar di WhatsApp.')

        let name = await alya.getName(jid)
        let bio = await alya.fetchStatus(jid).catch(() => null)
        let business = await alya.getBusinessProfile(jid).catch(() => null)

        let img
        try {
          img = await alya.profilePictureUrl(jid, 'image')
        } catch {
          img = 'https://placehold.co/300x300'
        }

        let format = PhoneNum(`+${number}`)
        let countryCode = format.getRegionCode('international')
        let country = regionNames.of(countryCode || '') || '-'

        let bioDate = bio?.setAt
          ? moment(bio.setAt).locale('id').format('LL')
          : '-'
        let teks = `*╭─「 WHATSAPP STALK 」*
    *│• Negara:* ${country.toUpperCase()}
    *│• Nama:* ${name || '-'}
    *│• Nomor:* +${number}
    *│• Format:* ${format.getNumber('international')}
    *│• Link:* wa.me/${number}
    *│• Mention:* @${number}
    *│• Status:* ${bio?.status || '-'}
    *│• Tanggal:* ${bioDate}
    *╰──────────────*`

        if (business) {
          teks += `

    *╭─「 BUSINESS INFO 」*
    *│• Business ID:* ${business.wid || '-'}
    *│• Website:* ${business.website || '-'}
    *│• Email:* ${business.email || '-'}
    *│• Kategori:* ${business.category || '-'}
    *│• Alamat:* ${business.address || '-'}
    *│• Timezone:* ${business.business_hours?.timezone || '-'}
    *│• Deskripsi:* ${business.description || '-'}
    *╰────────────────*`
        } else {
          teks += `\n\n*Standard WhatsApp Account*`
        }
        await alya.sendMessage(m.chat, {
          image: { url: img },
          caption: teks,
          mentions: [jid]
        }, { quoted: m })

      } catch (err) {
        console.log('WASTALK ERROR:', err)
        replyalya('❌ Terjadi kesalahan saat mengambil data!')
      }
    }
}
