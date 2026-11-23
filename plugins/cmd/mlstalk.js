// Plugin: mlstalk
// Migrated from Alya V10 → V13 Plugin Architecture
// Commands: mlstalk

module.exports = {
  command: ["mlstalk"],
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

    if (!text)
      return replyalya(
        `🎮 *Mobile Legends Stalk*\n\n` +
        `Format:\n${prefix + command} uid|zone\n` +
        `Contoh:\n${prefix + command} 1422073161|15910`
      )

    let [uid, zone] = text.split('|')
    if (!uid || !zone)
      return replyalya('⚠️ Format salah!\nGunakan: uid|zone\nContoh: 1422073161|15910')

    alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
      const axios = require('axios')

      const { data } = await axios.get(
        'https://api.mobapay.com/api/app_shop',
        {
          headers: { 'content-type': 'application/json' },
          params: {
            app_id: 100000,
            game_user_key: uid.trim(),
            game_server_key: zone.trim(),
            country: 'ID',
            language: 'en',
            shop_id: 1001
          }
        }
      )

      const shop = data.data.shop_info

      const fr1 = shop.good_list
        .filter(i => i.label && i.label.caption === '首充商品角标')
        .map(i => ({
          title: i.title,
          available: !i.goods_limit.reached_limit
        }))

      const fr2 = shop.shelf_location?.[0]?.goods
        ?.filter(i => i.label && i.label.caption === '首充商品角标')
        .map(i => ({
          title: i.title,
          available: !i.goods_limit.reached_limit
        })) || []

      const firstRecharge = [...fr1, ...fr2]

      let resultText = `🎮 *Mobile Legends Stalk*\n\n`
      resultText += `👤 Username : *${data.data.user_info.user_name}*\n`
      resultText += `🆔 UID      : ${uid.trim()}\n`
      resultText += `🌍 Zone     : ${zone.trim()}\n\n`
      resultText += `🛒 *Double Diamond Checker:*\n`

      if (firstRecharge.length === 0) {
        resultText += `❌ Tidak ada item first recharge double diamond`
      } else {
        firstRecharge.forEach((i, idx) => {
          resultText += `\n${idx + 1}. ${i.title}\n`
          resultText += `   Status : ${i.available ? '✅ Belum Dibeli' : '❌ Sudah Dibeli'}`
        })
      }

      await replyalya(resultText)

    } catch (err) {
      console.error(err)
      replyalya('❌ Gagal mengambil data Mobile Legends. Pastikan UID dan Zone benar.')
    }
  }
}
