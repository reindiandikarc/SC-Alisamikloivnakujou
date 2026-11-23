// Plugin: checknum
// Auto-generated from Alya V12
// Commands: cekkenon, checknum

const path = require('path')

module.exports = {
  command: ["cekkenon", "checknum"],
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

        if (!text && !m.quoted) {
            return replyalya(`📱 *CEK NOMOR WHATSAPP*

    Contoh:
    ${prefix + command} 081234567890
    ${prefix + command} +1234567890

    Atau reply pesan target`)
        }

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        let inputNumber = ''

        if (m.quoted) {
            inputNumber = m.quoted.sender.split('@')[0]
        } else {
            let raw = text.replace(/[^0-9+]/g, '')

            if (raw.startsWith('+')) {
                inputNumber = raw.replace('+', '')
            } else if (raw.startsWith('0')) {
                inputNumber = '62' + raw.slice(1)
            } else if (raw.startsWith('8')) {
                inputNumber = '62' + raw
            } else {
                inputNumber = raw
            }
        }

        if (inputNumber.length < 8 || inputNumber.length > 16) {
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            return replyalya('❌ Nomor tidak valid!')
        }

        try {
            let cek = await alya.onWhatsApp(inputNumber)

            if (!cek || cek.length === 0 || !cek[0]?.exists) {
                await alya.sendMessage(m.chat, { react: { text: "☠️", key: m.key } })
                return replyalya(`☠️ *STATUS: KENON / MATI*

    📵 Nomor: +${inputNumber}
    ❌ Tidak terdaftar di WhatsApp

    Kemungkinan:
    • Nomor belum dibuat WA
    • Nomor sudah ke-banned`)
            } else {
                await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
                return replyalya(`✅ *STATUS: AKTIF*

    📱 Nomor: +${inputNumber}
    🟢 Terdaftar di WhatsApp`)
            }

        } catch (e) {
            console.error('CekNo Error:', e)
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            replyalya('❌ Gagal cek nomor, mungkin kena limit WA.')
        }
  }
}
