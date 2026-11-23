// Plugin: lb
// Auto-generated from Alya V12
// Commands: leaderboard, lb

const path = require('path')

module.exports = {
  command: ["leaderboard", "lb"],
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

        if (!m.isGroup) return replyalya(mess.only.group)
        const isNumber = (number) => {
            if (!number) return false
            number = parseInt(number)
            return typeof number === 'number' && !isNaN(number)
        }
        const leaderboards = [
            'level', 'exp', 'money', 'limit', 'bank', 'chip',
            'diamond', 'gold', 'iron', 'emerald', 'trash',
            'potion', 'petFood', 'wood', 'rock', 'string',
            'common', 'uncommon', 'mythic', 'legendary', 'skata'
        ]

        let typeAlt = (args[0] || '').toLowerCase()
        let leaderboard = leaderboards.filter(v => v && Object.values(global.db.users).filter(user => user && user[v]).length)

        let helpText = `*––––『 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳 』––––*\n\n`
        helpText += `Berikut adalah daftar kategori yang tersedia:\n\n`
        helpText += leaderboard.map(v => `⮕ ${rpg.emoticon(v)} *${v}*`).join('\n')
        helpText += `\n\n––––––––––––––––––––––––\n`
        helpText += `💁🏻‍♂ *Tips:* \n`
        helpText += `⮕ Ketik: *${prefix}${command} [kategori]*\n`
        helpText += `⮕ Contoh: *${prefix}${command} money*`

        if (!leaderboard.includes(type)) return await reply(helpText)
        let users = Object.entries(global.db.users).map(([key, value]) => {
            return { ...value, jid: key }
        })

        let sortedItem = users.filter(u => u[type] !== undefined).sort((a, b) => (b[type] || 0) - (a[type] || 0))
        let userItem = sortedItem.map(u => u.jid)

        let len = 10
        let totalUser = sortedItem.length
        let maxPage = Math.ceil(totalUser / len)
        let page = isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1), maxPage) - 1 : 0
        let start = page * len
        let header = `*🏆 LEADERBOARD ${typeAlt.toUpperCase()} 🏆*\n`
        header += `*Peringkat:* ${userItem.indexOf(m.sender) + 1} dari ${totalUser}\n`
        header += `*Halaman:* ${page + 1} / ${maxPage}\n`
        header += `––––––––––––––––––––––––––––––\n\n`

        let mentionJid = []
        let contentAlt = sortedItem.slice(start, start + len).map((user, i) => {
            let rank = start + i + 1
            let isMe = user.jid === m.sender
            let name = user.registered ? user.name : alya.getName(user.jid)
            let isMember = participants.some(p => p.id === user.jid)

            mentionJid.push(user.jid)
            let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `*${rank}.*`

            return `${medal} ${isMe ? '*(Kamu)*' : ''}\n` +
                   `   👤 *Name:* ${isMember ? name : 'User Luar Grup'}\n` +
                   `   📊 *Stat:* ${rpg.emoticon(type)} ${user[type].toLocaleString()}\n` +
                   `   🔗 *JID:* @${user.jid.split('@')[0]}`
        }).join('\n\n')

        let footer = `\n\n––––––––––––––––––––––––––––––\n`
        footer += `Gunakan *${prefix}${command} ${type} ${page + 2}* untuk melihat halaman berikutnya.`
        return await replyalya(header + content + footer, {
            contextInfo: {
                mentionedJid: mentionJid
            }
        })
    }
  }
