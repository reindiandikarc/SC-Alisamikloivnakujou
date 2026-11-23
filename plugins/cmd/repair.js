// Plugin: repair
// Auto-generated from Alya V12
// Commands: claim, repair

const path = require('path')

module.exports = {
  command: ["claim", "repair"],
  tags: ['ai'],
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
        let _type = (args[0] || '').toLowerCase()
        let userAlt = global.db.users[m.sender]

        user.pickaxe = user.pickaxe || 0
        user.sword = user.sword || 0
        user.fishingrod = user.fishingrod || 0
        user.armor = user.armor || 0
        user.pickaxedurability = user.pickaxedurability || 0
        user.sworddurability = user.sworddurability || 0
        user.fishingroddurability = user.fishingroddurability || 0
        user.armordurability = user.armordurability || 0

        let caption = `*❏ RECIPE*
    ▧ Pickaxe ⛏️
    〉 20 Rock
    〉 20 Wood
    〉 20 Iron
    〉 1 Diamond

    ▧ Sword ⚔️
    〉 20 Wood
    〉 20 Iron
    〉 2 Gold
    〉 1 Diamond

    ▧ FishingRod 🎣
    〉 20 Wood
    〉 20 String
    〉 20 Iron
    〉 1 Diamond

    ▧ Armor 🥼
    〉 15 Iron
    〉 2 Gold
    〉 1 Diamond`

        try {
            if (/repair/i.test(command)) {
                switch (type) {
                    case 'pickaxe':
                        if (user.pickaxedurability > 99) return m.reply('Tools ini belum memiliki kerusakan!')
                        if (user.pickaxe == 0) return m.reply('Kamu belum memiliki item ini!')
                        if (user.diamond < 1 || user.rock < 20 || user.wood < 20 || user.iron < 20 ) return m.reply(`Barang tidak cukup!`)
                        user.rock -= 20
                        user.wood -= 20
                        user.iron -= 20
                        user.diamond -= 1
                        user.pickaxedurability = 100
                        m.reply("Sukses memperbaiki Pickaxe ⛏️!")

                    case 'sword':
                        if (user.sworddurability > 99) return m.reply('Tools ini belum memiliki kerusakan!')
                        if (user.sword == 0) return m.reply('Kamu belum memiliki item ini!')
                        if (user.diamond < 1 || user.wood < 20 || user.iron < 20 || user.gold < 2 ) return m.reply(`Barang tidak cukup!`)
                        user.wood -= 20
                        user.iron -= 20
                        user.gold -= 2
                        user.diamond -= 1
                        user.sworddurability = 100
                        m.reply("Sukses memperbaiki Sword ⚔️!")

                    case 'fishingrod':
                        if (user.fishingroddurability > 99) return m.reply('Tools ini belum memiliki kerusakan!')
                        if (user.fishingrod == 0) return m.reply('Kamu belum memiliki item ini!')
                        if (user.diamond < 1 || user.string < 20 || user.wood < 20 || user.iron < 20 ) return m.reply(`Barang tidak cukup!`)
                        user.wood -= 20
                        user.string -= 20
                        user.iron -= 20
                        user.diamond -= 1
                        user.fishingroddurability = 100
                        m.reply("Sukses memperbaiki FishingRod 🎣!")

                    case 'armor':
                        if (user.armordurability > 99) return m.reply('Tools ini belum memiliki kerusakan!')
                        if (user.armor == 0) return m.reply('Kamu belum memiliki item ini!')
                        if (user.diamond < 1 || user.iron < 15 || user.gold < 2 ) return m.reply(`Barang tidak cukup!`)
                        user.iron -= 15
                        user.gold -= 2
                        user.diamond -= 1
                        user.armordurability = 100
                        m.reply("Sukses memperbaiki Armor 🥼!")
                        const rows = [
                            { header: "", title: "SWORD ⚔️", description: "Repair Sword durability", id: ".repair sword" },
                            { header: "", title: "PICKAXE ⛏️", description: "Repair Pickaxe durability", id: ".repair pickaxe" },
                            { header: "", title: "FISHINGROD 🎣", description: "Repair FishingRod durability", id: ".repair fishingrod" },
                            { header: "", title: "ARMOR 🥼", description: "Repair Armor durability", id: ".repair armor" }
                        ]

                        const msg = generateWAMessageFromContent(m.chat, {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: {
                                        body: {
                                            text: caption
                                        },
                                        footer: {
                                            text: global.wm || 'Alya-chan Assistant'
                                        },
                                        header: {
                                            title: '⚒️ *「 R E P A I R 」*\nSilakan pilih equipment yang ingin diperbaiki.',
                                            hasMediaAttachment: false
                                        },
                                        nativeFlowMessage: {
                                            buttons: [{
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "Pilih Tools",
                                                    sections: [{
                                                        title: "Daftar Peralatan",
                                                        rows
                                                    }]
                                                })
                                            }]
                                        }
                                    }
                                }
                            }
                        }, { quoted: m })

                        await alya.relayMessage(
                            msg.key.remoteJid,
                            msg.message,
                            { messageId: msg.key.id }
                        )
                }
            } else if (/enchant|enchan/i.test(command)) {
                const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 : Math.min(1, count)
                switch (_type) {
                    case 't':
                    case '':
                        m.reply("Fitur enchant belum tersedia.")
                }
            }
        } catch (err) {
            m.reply("Error\n\n\n" + err.stack)
        }
    }
    //==================================================================
  }
