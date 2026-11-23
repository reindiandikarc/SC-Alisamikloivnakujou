// Plugin: sell
// Fixed for Alya V13 - data persistence fix
// Commands: sell
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

module.exports = {
  command: ["sell"],
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

    // ✅ FIX: selalu ambil reference langsung ke db agar perubahan persist
    const userData = global.db.users[m.sender]
    if (!userData) return replyalya('Hah? Data kamu nggak ada! Daftar dulu ya baka! 💢')

    function capitalize(word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    }

    function rupiah(number) {
      return (number || 0).toLocaleString('id-ID')
    }

    // Harga jual = 50% dari harga beli (wajar untuk RPG economy)
    const items = {
      limit:       { money: 999 },
      exp:         { money: 1 },
      chip:        { money: 1000000 },
      potion:      { money: 625 },
      trash:       { money: 20 },
      wood:        { money: 350 },
      rock:        { money: 425 },
      string:      { money: 200 },
      iron:        { money: 1500 },
      diamond:     { money: 250000 },
      emerald:     { money: 50000 },
      gold:        { money: 50000 },
      common:      { money: 1000 },
      uncommon:    { money: 10000 },
      mythic:      { money: 37500 },
      legendary:   { money: 100000 },
      petfood:     { money: 1750 },
      pet:         { money: 60000 },
      anggur:      { money: 1000 },
      apel:        { money: 1000 },
      jeruk:       { money: 1000 },
      mangga:      { money: 1000 },
      pisang:      { money: 1000 },
      bibitanggur: { money: 1000 },
      bibitapel:   { money: 1000 },
      bibitjeruk:  { money: 1000 },
      bibitmangga: { money: 1000 },
      bibitpisang: { money: 1000 },
      umpan:       { money: 2500 }
    }

    let item   = (args[0] || '').toLowerCase().replace(/\s+/g, '')
    let jumlah = args[1]
    const jumlahList = [1, 5, 10, 25, 50, 100]

    // Support "all" / "max"
    if (jumlah === 'all' || jumlah === 'max') {
      jumlah = (userData[item] && typeof userData[item] === 'number') ? userData[item] : 0
    } else {
      jumlah = parseInt(jumlah)
    }

    // ── Tampilkan daftar item yang bisa dijual ──────────────────────────
    if (!item) {
      const rows = Object.keys(items).map(v => ({
        header: '',
        title: `${rpg.emoticon(v)} ${capitalize(v)}`,
        description: `Harga Jual: Rp ${rupiah(items[v].money)} | Stok: ${userData[v] || 0}`,
        id: `${prefix}sell ${v}`
      }))

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: {
                text: `💰 *ALYA'S SELL SHOP*\n\nMau jual apa? Buruan pilih, aku nggak punya banyak waktu buat nungguin kamu mikir! 😤`
              },
              footer: { text: 'Jangan sampai nyesel ya jualnya! 🙄' },
              header: { title: '🏪 Pegadaian Alya' },
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Pilih Item, baka!',
                    sections: [{ title: 'Barang di Tas Kamu', rows }]
                  })
                }]
              }
            }
          }
        }
      }, { quoted: m })

      return alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    }

    // ── Item dipilih tapi jumlah belum ─────────────────────────────────
    if (item && !jumlah) {
      if (!items[item]) return replyalya('Item apaan itu? Nggak ada di daftar aku! Cari yang bener dong! 💢')

      const stokUser = (userData[item] && typeof userData[item] === 'number') ? userData[item] : 0

      const rows = jumlahList.map(v => ({
        header: '',
        title: `${v} ${capitalize(item)}`,
        description: `Dapet: Rp ${rupiah(items[item].money * v)}`,
        id: `${prefix}sell ${item} ${v}`
      }))

      rows.push({
        header: '',
        title: `Jual Semua ${capitalize(item)} (${stokUser})`,
        description: `Dapet: Rp ${rupiah(items[item].money * stokUser)}`,
        id: `${prefix}sell ${item} all`
      })

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: {
                text: `📦 *${capitalize(item)}*\n\nStok kamu ada *${stokUser}* nih. Mau dijual berapa? Semuanya juga boleh, biar tas kamu nggak penuh sampah! 🙄`
              },
              footer: { text: botname },
              header: { title: 'Tentukan Jumlah' },
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Pilih Jumlah',
                    sections: [{ title: 'Opsi Penjualan', rows }]
                  })
                }]
              }
            }
          }
        }
      }, { quoted: m })

      return alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    }

    // ── Proses penjualan ───────────────────────────────────────────────
    if (item && jumlah) {
      if (!items[item]) return replyalya('Barang itu nggak laku di sini! Cari yang lain! 😒')
      if (isNaN(jumlah) || jumlah <= 0) return replyalya('Jumlah nggak valid! 💢')

      // ✅ FIX: cek stok dari userData (reference langsung ke db)
      const stokUser = (typeof userData[item] === 'number') ? userData[item] : 0

      if (stokUser < jumlah) {
        return replyalya(
          `Hah?! Barang kamu nggak cukup! 💢\n` +
          `Jangan sok mau jual banyak kalau punyanya cuma segitu!\n\n` +
          `${rpg.emoticon(item)} *${capitalize(item)}* kamu cuma ada: *${stokUser}*`
        )
      }

      const harga = items[item].money * jumlah

      // ✅ FIX: modifikasi langsung ke userData (reference ke global.db.users[m.sender])
      userData[item] -= jumlah
      userData.money = (userData.money || 0) + harga

      return replyalya(
        `*Tuh, udah laku!* 😤\n\n` +
        `${rpg.emoticon(item)} *Item*    : ${capitalize(item)}\n` +
        `📊 *Jumlah*  : ${jumlah}\n` +
        `📦 *Sisa Tas*: ${userData[item]}\n` +
        `💰 *Uang Masuk*: +Rp ${rupiah(harga)}\n` +
        `💳 *Total Uang*: Rp ${rupiah(userData.money)}\n\n` +
        `Puas sekarang? Jangan dipake buat yang aneh-aneh ya uangnya! 💖`
      )
    }
  }
}
