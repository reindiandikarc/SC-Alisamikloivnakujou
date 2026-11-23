// Plugin: culikaman
// Auto-generated from Alya V12
// Commands: culikmem, culikaman

const path = require('path')

module.exports = {
  command: ["culikmem", "culikaman"],
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

        if (!Ryuu) return replyalya('❌ Khusus owner!')

        if (!text) {
            return replyalya(
                `📌 Format salah!\n\nContoh:\n${prefix + command} idGrupAsal|idGrupTujuan`
            )
        }

        let [fromGroup, toGroup] = text.split('|').map(v => v.trim())

        if (!fromGroup || !toGroup) {
            return replyalya(
                `📌 Format salah!\n\nContoh:\n${prefix + command} idGrupAsal|idGrupTujuan`
            )
        }

        try {
            let fromMeta = await alya.groupMetadata(fromGroup)
            let toMeta = await alya.groupMetadata(toGroup)
            let botInTarget = toMeta.participants.find(p => p.id === alya.user.id)

            if (!botInTarget || !botInTarget.admin) {
                return replyalya('❌ Bot harus admin di grup tujuan!')
            }

            let peserta = fromMeta.participants.map(v => v.id)
            let sudah = toMeta.participants.map(v => v.id)

            let belum = peserta.filter(x => !sudah.includes(x))

            let total = belum.length

            let batchSize = 10
            let delayBatch = 1000 * 60 * 10

            replyalya(
                `🚀 *Culik Member Dimulai!*\n\n` +
                `📊 Total target: ${total}\n` +
                `📦 Per batch: ${batchSize}\n` +
                `⏳ Delay: 10 menit`
            )

            const delay = ms => new Promise(res => setTimeout(res, ms))

            for (let i = 0; i < belum.length; i += batchSize) {
                let batch = belum.slice(i, i + batchSize)

                for (let user of batch) {
                    try {
                        await delay(Math.floor(Math.random() * 3000) + 3000)

                        await alya.groupParticipantsUpdate(
                            toGroup,
                            [user],
                            'add'
                        )

                    } catch (err) {
                        console.log(`❌ Gagal add ${user} -> ${err.message}`)
                    }
                }

                if (i + batchSize < belum.length) {
                    await alya.sendMessage(m.chat, {
                        text: `✅ Batch ${Math.floor(i / batchSize) + 1} selesai\n⏳ Lanjut 10 menit lagi...`
                    })

                    await delay(delayBatch)
                }
            }

            replyalya('✅ Semua member berhasil diproses!')

        } catch (err) {
            console.log(err)

            replyalya(
                '❌ Gagal proses!\nPastikan ID grup valid & bot admin di grup tujuan'
            )
        }
  }
}
