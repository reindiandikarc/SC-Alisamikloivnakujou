// Plugin: genshinstalk
// Auto-generated from Alya V12
// Commands: genshinstalk

const path = require('path')

module.exports = {
  command: ["genshinstalk"],
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

      if (!text) {
        alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya(`📌 Contoh: ${prefix + command} 886567006`)
      }

      if (!/^\d+$/.test(text)) {
        alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya('UID harus berupa angka!')
      }

      alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        const scrapeEnkaProfile = require('../../scrape/genshinstalk')
        const data = await scrapeEnkaProfile(text)

        if (!data.playerInfo.nickname) {
          alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return replyalya('UID tidak ditemukan atau profile disembunyikan.')
        }

        let message = `
    🎮 *GENSHIN PROFILE FULL*

    👤 Nickname : ${data.playerInfo.nickname}
    🆔 UID      : ${data.uid}
    ⭐ AR       : ${data.playerInfo.level}
    🌍 WL       : ${data.playerInfo.worldLevel}
    🏆 achievements   : ${data.playerInfo.achievements}
    🌀 Spiral   : ${data.playerInfo.spiralAbyss}
    🎭 Theater  : ${data.playerInfo.theater}
    ⚔️ Stygian  : ${data.playerInfo.stygianOnslaught}
    ✍️ Bio      : ${data.playerInfo.signature}

    ━━━━━━━━━━━━━━━━━━
    👥 Total Character : ${data.characters.length}
    ━━━━━━━━━━━━━━━━━━
    `

        for (let char of data.characters) {

          message += `

    ==============================
    👤 ${char.card?.name || char.name}
    ⭐ Level : ${char.card?.level || char.level}/${char.card?.maxLevel || '-'}
    🤝 Friendship : ${char.card?.friendship || 0}
    🌟 Constellation : ${char.card?.constellation || 0}

    📊 STATS
    HP : ${char.card?.stats?.hp || 0} (${char.card?.stats?.hpBase || 0}+${char.card?.stats?.hpBonus || 0})
    ATK : ${char.card?.stats?.atk || 0} (${char.card?.stats?.atkBase || 0}+${char.card?.stats?.atkBonus || 0})
    DEF : ${char.card?.stats?.def || 0} (${char.card?.stats?.defBase || 0}+${char.card?.stats?.defBonus || 0})
    EM : ${char.card?.stats?.em || 0}
    CR : ${char.card?.stats?.cr || 0}
    CD : ${char.card?.stats?.cd || 0}
    ER : ${char.card?.stats?.er || 0}
    Element DMG : ${char.card?.stats?.elementalDmg || 0}
    Physical DMG : ${char.card?.stats?.physicalDmg || 0}

    🎯 TALENTS
    ${char.card?.talents?.map((t,i)=>`Talent ${i+1}: Lv ${t.level}`).join('\n') || '-'}

    ⚔️ WEAPON
    Name : ${char.card?.weapon?.name || '-'}
    Level : ${char.card?.weapon?.level || 0}/${char.card?.weapon?.maxLevel || 0}
    Refine : R${char.card?.weapon?.refinement || 0}
    Stars : ${char.card?.weapon?.stars || 0}
    Base ATK : ${char.card?.weapon?.baseAtk || 0}
    Substat : ${char.card?.weapon?.substat || '-'}

    🧿 ARTIFACTS
    `

          if (char.card?.artifacts?.length) {
            char.card.artifacts.forEach((art, i) => {
              message += `
    ${art.slot}
    ⭐ ${art.stars} | +${art.level}
    Main : ${art.mainStat?.value || '-'}
    Sub :
    ${art.substats.map(s=>`- ${s.value}`).join('\n')}
    Set : ${art.setName || '-'}
    `
            })
          } else {
            message += `-`
          }

          message += `\n==============================\n`
        }

        await alya.sendMessage(m.chat, {
          image: { url: data.playerInfo.avatar },
          caption: message.slice(0, 90000) // safety limit
        }, { quoted: m })

        alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (err) {
        console.log(err)
        alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('Terjadi kesalahan saat mengambil data.')
      }
  }
}
