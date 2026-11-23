// Plugin: buy
// Fixed for Alya V13 - data persistence fix
// Commands: buy
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

module.exports = {
  command: ["buy"],
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

    function createTrx() {
      return 'TRX-' + Date.now().toString(36).toUpperCase()
    }

    function rupiah(number) {
      return (number || 0).toLocaleString('id-ID')
    }

    const items = {
      limit:       { money: 45000 },
      chip:        { money: 1000000 },
      exp:         { money: 1000 },
      potion:      { money: 1250 },
      trash:       { money: 40 },
      wood:        { money: 700 },
      rock:        { money: 850 },
      string:      { money: 400 },
      iron:        { money: 3000 },
      diamond:     { money: 500000 },
      emerald:     { money: 100000 },
      gold:        { money: 100000 },
      petfood:     { money: 3500 },
      pet:         { money: 120000 },
      token:       { money: 1500000 },
      anggur:      { money: 2000 },
      apel:        { money: 2000 },
      jeruk:       { money: 2000 },
      mangga:      { money: 2000 },
      pisang:      { money: 2000 },
      bibitanggur: { money: 2000 },
      bibitapel:   { money: 2000 },
      bibitjeruk:  { money: 2000 },
      bibitmangga: { money: 2000 },
      bibitpisang: { money: 2000 },
      umpan:       { money: 5000 },
      plasmaspark:  { money: 50000 },
      // ✅ HSR Items
      stellarjade:  { money: 500,   hsr: true, field: 'stellarJade' },
      hsrcredits:   { money: 100,   hsr: true, field: 'credits' },
    }

    let item   = (args[0] || '').toLowerCase().replace(/\s+/g, '')
    let jumlah = parseInt(args[1])
    const jumlahList = [1, 5, 10, 25, 50, 100]

    // ── Tampilkan daftar item ───────────────────────────────────────────
    if (!item) {
      const rows = Object.keys(items).map(v => ({
        header: '',
        title: `${rpg.emoticon(v)} ${capitalize(v)}`,
        description: `Harga: Rp ${rupiah(items[v].money)}`,
        id: `${prefix}buy ${v}`
      }))

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: {
                text: `🛒 *ALYA'S RPG SHOP*\n\nCepetan pilih mau beli apa! Jangan cuma dilihatin aja, baka! 😤\n\n💰 Uang kamu: Rp ${rupiah(userData.money || 0)}`
              },
              footer: { text: 'Jangan sampai bangkrut ya! 🙄' },
              header: { title: '🛍️ Menu Belanja' },
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Pilih Item, baka!',
                    sections: [{ title: 'Daftar Barang Dagangan', rows }]
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
      if (!items[item]) return replyalya('Item apaan itu? Nggak ada di toko aku! Cari yang bener dong! 💢')

      const rows = jumlahList.map(v => ({
        header: '',
        title: `${v} ${capitalize(item)}`,
        description: `Total: Rp ${rupiah(items[item].money * v)}`,
        id: `${prefix}buy ${item} ${v}`
      }))

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: `📦 *${capitalize(item)}*\n\nMau borong berapa banyak? Jangan maruk ya! 🙄` },
              footer: { text: botname },
              header: { title: 'Pilih Jumlah' },
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Tentukan Jumlah',
                    sections: [{ title: 'Opsi Jumlah', rows }]
                  })
                }]
              }
            }
          }
        }
      }, { quoted: m })

      return alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    }

    // ── Proses pembelian ───────────────────────────────────────────────
    if (item && jumlah) {
      if (!items[item]) return replyalya('Hmph! Barang itu nggak tersedia! 😒')
      if (isNaN(jumlah) || jumlah <= 0) return replyalya('Masukin jumlah yang bener dong! Kamu mau beli hantu? 💢')

      const harga = items[item].money * jumlah
      const uangUser = userData.money || 0

      if (uangUser < harga) {
        return replyalya(
          `Ih, nggak modal banget! 😒 Uang kamu nggak cukup buat beli *${capitalize(item)}*!\n\n` +
          `💰 Total Harga : Rp ${rupiah(harga)}\n` +
          `🪙 Uang Kamu   : Rp ${rupiah(uangUser)}\n\n` +
          `Makanya, kerja sana! Ketik: *${prefix}kerja*! Jangan malas terus! 😤`
        )
      }

      const trx = createTrx()
      const waktu = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + ' WIB'

      // ✅ FIX: modifikasi langsung ke global.db.users[m.sender]
      userData.money = (userData.money || 0) - harga

      if (item === 'plasmaspark') {
        // Plasma Spark → simpan ke ultraman DB
        const UDBPATH = './database/ultraman.json'
        let ultraDB = {}
        try { ultraDB = JSON.parse(fs.readFileSync(UDBPATH, 'utf-8')) } catch {}
        if (!ultraDB[m.sender]) ultraDB[m.sender] = { plasmaSpark: 0 }
        ultraDB[m.sender].plasmaSpark = (ultraDB[m.sender].plasmaSpark || 0) + jumlah
        fs.writeFileSync(UDBPATH, JSON.stringify(ultraDB, null, 2))
      } else if (items[item]?.hsr) {
        // ✅ HSR Item (stellarJade / hsrcredits) → update langsung ke HSR DB
        const hsrField = items[item].field // 'stellarJade' atau 'credits'
        if (!global.db.game) global.db.game = {}
        if (!global.db.game.hsr) global.db.game.hsr = {}
        if (!global.db.game.hsr[m.sender]) {
          return replyalya('Kamu belum terdaftar di HSR! Ketik *!hsrstart* dulu ya! 💢')
        }
        global.db.game.hsr[m.sender][hsrField] = (global.db.game.hsr[m.sender][hsrField] || 0) + jumlah
        // Simpan HSR DB
        const HSRDBPATH = './database/hsr_db.json'
        try { fs.writeFileSync(HSRDBPATH, JSON.stringify(global.db.game.hsr, null, 2)) } catch {}
      } else if (item === 'limit') {
        // Limit → tambah ke user.limit
        userData.limit = (userData.limit || 0) + jumlah
      } else if (item === 'exp') {
        // EXP → tambah ke user.exp
        userData.exp = (userData.exp || 0) + jumlah
      } else {
        // Item biasa → tambah ke field user
        if (typeof userData[item] !== 'number') userData[item] = 0
        userData[item] += jumlah
      }

      const sisa = userData.money

      // Info tambahan untuk HSR items
      let hsrNote = ''
      if (items[item]?.hsr && global.db.game?.hsr?.[m.sender]) {
        const hsrField = items[item].field
        const newVal = global.db.game.hsr[m.sender][hsrField] || 0
        const label = hsrField === 'stellarJade' ? '💎 Stellar Jade' : '🔵 HSR Credits'
        hsrNote = `│ ${label}: ${(newVal).toLocaleString('id-ID')}\n`
      }

      const invoice =
        `╭━━━〔 🧾 INVOICE BELANJA 〕━━━⬣\n` +
        `│\n` +
        `│ 🛍️ Transaksi : ${trx}\n` +
        `│\n` +
        `│ 📦 Barang    : ${capitalize(item)} ${rpg.emoticon ? rpg.emoticon(item) : ''}\n` +
        `│ 🔢 Jumlah    : ${jumlah}\n` +
        `│ 💰 Total     : Rp ${rupiah(harga)}\n` +
        `│ 🪙 Sisa Uang : Rp ${rupiah(sisa)}\n` +
        (hsrNote ? `│\n${hsrNote}` : '') +
        `│\n` +
        `│ 👤 Pembeli   : @${m.sender.split('@')[0]}\n` +
        `│ 🕒 Waktu     : ${waktu}\n` +
        `│\n` +
        `╰━━━━━━━━━━━━━━━━━━⬣\n` +
        `*Tuh, udah aku beliin!* 😤\n` +
        `Puas sekarang? Jangan boros!`

      return alya.sendMessage(m.chat, { text: invoice, mentions: [m.sender] }, { quoted: m })
    }
  }
}
