// Plugin: pindahgc
// Auto-generated from Alya V12
// Commands: movegc, pindahgc

const path = require('path')

module.exports = {
  command: ["movegc", "pindahgc"],
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

        if (!Ryuu) return replytolak(mess.only.owner)

        let [idAsal, idTujuan] = text.split('|')
        if (!idAsal || !idTujuan) return m.reply(`Format: .${command} ID_Lama|ID_Baru`)

        idAsal = idAsal.trim()
        idTujuan = idTujuan.trim()

        try {
            // Ambil dari cache agar tidak membebani koneksi
            let listGrup = await alya.groupFetchAllParticipating()
            let grupLama = listGrup[idAsal]

            if (!grupLama) return m.reply('Grup asal tidak terbaca di memori bot.')

            const botNumber = alya.decodeJid(alya.user.id)
            let membersToMove = grupLama.participants
                .map(u => u.id)
                .filter(id => id !== botNumber && id !== m.sender)

            let total = membersToMove.length
            if (total === 0) return m.reply('Tidak ada member yang bisa diambil.')

            await m.reply(`⚠️ *PROSESING: ${total} MEMBER*\n\nEstimasi waktu: ±1.5 Jam.\nBot akan istirahat 30 detik setiap 20 member agar sesi tidak putus.\n\n_Pantau terus log panel agar tahu jika bot perlu restart._`)

            let success = 0, failed = 0, privated = 0

            for (let i = 0; i < total; i++) {
                let user = membersToMove[i]

                try {
                    let response = await alya.groupParticipantsUpdate(idTujuan, [user], 'add')

                    if (response && response[0]) {
                        if (response[0].status === '200') success++
                        else if (response[0].status === '403') privated++
                        else failed++
                    }
                } catch (err) {
                    failed++

                    await new Promise(res => setTimeout(res, 5000))
                }

                if ((i + 1) % 20 === 0) {
                    console.log(`[SYSTEM] Menghindari DC: Istirahat 30 detik... (${i + 1}/${total})`)
                    await new Promise(res => setTimeout(res, 30000)) // Istirahat 30 detik tiap 20 orang
                } else {
                    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 2000) + 8000))
                }
            }

            await m.reply(`✅ *MISI SELESAI*\nTotal: ${total}\nBerhasil: ${success}\nPrivasi: ${privated}\nGagal: ${failed}`)

        } catch (e) {
            console.error(e)
            m.reply('Koneksi terganggu. Silakan cek panel dan jalankan ulang jika perlu.')
        }
  }
}
