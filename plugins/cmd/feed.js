// Plugin: feed
// Ported from Alya V10 - RPG Pet Feeding
// Commands: feed

module.exports = {
  command: ["feed"],
  tags: ['rpg'],
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

    function clockString(ms) {
      let h = isNaN(ms) ? '--' : Math.floor(ms / 310000)
      let mn = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
      let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
      return [h, ' H ', mn, ' M ', s, ' S'].map(v => v.toString().padStart(2, 0)).join('')
    }
    function pickRandom(list) {
      return list[Math.floor(Math.random() * list.length)]
    }

    let info = `
乂 List Pet:
🐈 • Cat
🐕 • Dog
🐎 • Horse
🦊 • Fox
🤖 • Robo

*➠ Example:* ${prefix}feed cat
`.trim()

    let pesan = pickRandom(['ɴʏᴜᴍᴍᴍ~', 'ᴛʜᴀɴᴋs', 'ᴛʜᴀɴᴋʏᴏᴜ ^-^', '...', 'ᴛʜᴀɴᴋ ʏᴏᴜ~', 'ᴀʀɪɢᴀᴛᴏᴜ ^-^'])
    let petType = (args[0] || '').toLowerCase()
    let emoMap = { fox: '🦊', cat: '🐈', dog: '🐕', horse: '🐴', robo: '🤖' }
    let emo = emoMap[petType] || ''
    let u = global.db.users[m.sender]

    u.fox = u.fox || 0
    u.cat = u.cat || 0
    u.dog = u.dog || 0
    u.horse = u.horse || 0
    u.robo = u.robo || 0
    u.petfood = u.petfood || 0
    u.foxexp = u.foxexp || 0; u.catexp = u.catexp || 0
    u.dogexp = u.dogexp || 0; u.horseexp = u.horseexp || 0; u.roboexp = u.roboexp || 0
    u.foxlastfeed = u.foxlastfeed || 0; u.catlastfeed = u.catlastfeed || 0
    u.doglastfeed = u.doglastfeed || 0; u.horselastfeed = u.horselastfeed || 0; u.robolastfeed = u.robolastfeed || 0

    const FEEDCD = 10000
    const petList = ['fox', 'cat', 'dog', 'horse', 'robo']

    if (!petType || !petList.includes(petType)) return replyalya(info)

    let petLvl = u[petType]
    let petExp = u[petType + 'exp']
    let lastFeed = u[petType + 'lastfeed']

    if (petLvl == 0) return replyalya('ʏᴏᴜ ᴅᴏɴ\'ᴛ ʜᴀᴠᴇ ᴛʜɪs ᴘᴇᴛ ʏᴇᴛ!')
    if (petLvl >= 10) return replyalya('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')

    let elapsed = (new Date - lastFeed)
    if (elapsed < FEEDCD) {
      let remaining = FEEDCD - elapsed
      return replyalya(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${clockString(remaining)}*`)
    }

    if (u.petfood <= 0) return replyalya('ʏᴏᴜʀ ᴘᴇᴛ ғᴏᴏᴅ ɴᴏᴛ ᴇɴᴏᴜɢʜ')

    u.petfood -= 1
    u[petType + 'exp'] += 20
    u[petType + 'lastfeed'] = new Date * 1

    replyalya(`ғᴇᴇᴅɪɴɢ *${petType}*...\n*${emo} ${petType.charAt(0).toUpperCase() + petType.slice(1)}:* ${pesan}`)

    let naiklvl = (petLvl * 100) - 1
    if (u[petType + 'exp'] > naiklvl) {
      u[petType] += 1
      u[petType + 'exp'] -= (petLvl * 100)
      replyalya(`*ᴄᴏɴɢʀᴀᴛs!*, ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
    }
  }
}
