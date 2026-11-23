// Plugin: petshop
// Auto-generated from Alya V12
// Commands: petstore, petshop

const path = require('path')

module.exports = {
  command: ["petstore", "petshop"],
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

        if (!m.isGroup) return replytolak(mess.only.group)
        const { generateWAMessageFromContent } = require('@whiskeysockets/baileys')

        let typeAlt = (args[0] || '').toLowerCase()
        let userAlt = global.db.users[m.sender]
        const allPets = [
            'cat', 'dog', 'horse', 'fox', 'robo', 'lion',
            'rhinoceros', 'dragon', 'centaur', 'kyubi',
            'griffin', 'phonix', 'wolf'
        ]
        allPets.forEach(p => { if (typeof user[p] === 'undefined') user[p] = 0 })
        user.pet = user.pet || 0
        const prices = {
            cat: 2, dog: 2, horse: 4, fox: 6, robo: 10,
            lion: 10, rhinoceros: 10, dragon: 15, centaur: 10,
            kyubi: 12, griffin: 10, phonix: 15, wolf: 8
        }

        try {
            if (type && prices[type]) {
                if (user[type] > 0) return m.reply(`⚠️ Kamu sudah memiliki pet *${type}*. Satu sudah cukup untuk menemanimu!`)
                if (user.pet < prices[type]) return m.reply(`❌ Token tidak cukup! Butuh *${prices[type]}* 🔖, kamu punya *${user.pet}* 🔖.`)

                user.pet -= prices[type]
                user[type] += 1

                return m.reply(`🎉 *ADPSI BERHASIL!* 🎉\n\nSekarang **${typeAlt.toUpperCase()}** resmi menjadi peliharaanmu. Cek di \`.inv\``)
            } else {
                let logo = `🐾 *P E T  S T O R E* 🐾`
                let caption = `Halo @${m.sender.split('@')[0]}! Selamat datang di pusat adopsi pet Alya.

    🔖 **Token Milikmu:** ${user.pet} Token
    ————————————————————————
    Pilih kategori pet di bawah ini untuk melihat detail harga dan mengadopsi.`

                const sections = [
                    {
                        title: "🏠 PET RUMAHAN (EASY)",
                        rows: [
                            { title: "CAT 🐈", description: `Harga: ${prices.cat} Token`, id: `${prefix}petshop cat` },
                            { title: "DOG 🐕", description: `Harga: ${prices.dog} Token`, id: `${prefix}petshop dog` },
                            { title: "HORSE 🐎", description: `Harga: ${prices.horse} Token`, id: `${prefix}petshop horse` },
                            { title: "WOLF 🐺", description: `Harga: ${prices.wolf} Token`, id: `${prefix}petshop wolf` }
                        ]
                    },
                    {
                        title: "🦁 PET BUAS (MEDIUM)",
                        rows: [
                            { title: "FOX 🦊", description: `Harga: ${prices.fox} Token`, id: `${prefix}petshop fox` },
                            { title: "LION 🦁", description: `Harga: ${prices.lion} Token`, id: `${prefix}petshop lion` },
                            { title: "RHINOCEROS 🦏", description: `Harga: ${prices.rhinoceros} Token`, id: `${prefix}petshop rhinoceros` },
                            { title: "ROBO 🤖", description: `Harga: ${prices.robo} Token`, id: `${prefix}petshop robo` }
                        ]
                    },
                    {
                        title: "🐉 PET MITOLOGI (HARD)",
                        rows: [
                            { title: "DRAGON 🐉", description: `Harga: ${prices.dragon} Token`, id: `${prefix}petshop dragon` },
                            { title: "PHONIX 🔥", description: `Harga: ${prices.phonix} Token`, id: `${prefix}petshop phonix` },
                            { title: "KYUBI 🦊", description: `Harga: ${prices.kyubi} Token`, id: `${prefix}petshop kyubi` },
                            { title: "CENTAUR 🏹", description: `Harga: ${prices.centaur} Token`, id: `${prefix}petshop centaur` },
                            { title: "GRIFFIN 🦅", description: `Harga: ${prices.griffin} Token`, id: `${prefix}petshop griffin` }
                        ]
                    }
                ]

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: {
                                body: { text: caption },
                                footer: { text: global.wm || 'Alya-chan Assistant' },
                                header: {
                                    title: logo,
                                    hasMediaAttachment: false
                                },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "PILIH PET 🐾",
                                            sections
                                        })
                                    }]
                                }
                            }
                        }
                    }
                }, { quoted: m })

                await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            }
        } catch (err) {
            m.reply("Error pada PetStore:\n" + err.message)
        }
    }
    //==================================================================
  }
