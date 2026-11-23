// Plugin: sewabot
// Auto-generated from Alya V12
// Commands: sewa, sewabot
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["sewa", "sewabot"],
  tags: ['owner'],
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

      function rupiah(num) {
        return num.toLocaleString('id-ID')
      }
      const paket = {
        "1hari":  { nama: "1 Hari", harga: 1000 },
        "5hari":  { nama: "5 Hari", harga: 4500 },
        "7hari":  { nama: "7 Hari", harga: 6000 },
        "1bulan": { nama: "1 Bulan", harga: 20000 },
        "3bulan": { nama: "3 Bulan", harga: 50000 },
        "1tahun": { nama: "1 Tahun", harga: 120000 },
        "prem1":  { nama: "Premium + sewa 1 Bulan", harga: 60000 },
        "prem12": { nama: "Premium + sewa 1 Tahun", harga: 150000 }
      }

      let pilih = (args[0] || '').toLowerCase()

      // ===== MENU UTAMA =====
      if (!pilih) {

        const rows = Object.keys(paket).map(v => ({
          header: "",
          title: `📦 ${paket[v].nama}`,
          description: `Harga Rp ${rupiah(paket[v].harga)}`,
          id: `.sewabot ${v}`
        }))

        const teks = `
    ╭━━━〔 🤖 *SEWA BOT ALYA* 〕━━━⬣
    ┃
    ┃ 💼 *PAKET HARIAN*
    ┃ ├ 1 Hari     : Rp 1.000
    ┃ ├ 5 Hari     : Rp 4.500
    ┃ └ 7 Hari     : Rp 6.000
    ┃
    ┃ 📆 *PAKET BULANAN & TAHUNAN*
    ┃ ├ 1 Bulan    : Rp 20.000
    ┃ ├ 3 Bulan    : Rp 50.000
    ┃ └ 1 Tahun    : Rp 120.000
    ┃
    ┃ 👑 *PREMIUM & VVIP GROUP*
    ┃ (Admin menjadi User Premium)
    ┃ ├ 1 Bulan    : Rp 60.000
    ┃ └ 1 Tahun    : Rp 150.000
    ┃
    ┣━━━━━━━━━━━━━━━━━━⬣
    ┃ ⚡ *KEUNGGULAN BOT*
    ┃ ✓ Proses cepat (1–5 menit)
    ┃ ✓ Bisa jaga grup 24 jam
    ┃ ✓ Fitur lengkap & update
    ┃ ✓ Anti ribet & fast respon
    ┃
    ┃ 📦 *PILIH PAKET DI BAWAH*
    ╰━━━━━━━━━━━━━━━━━━⬣
    `
        const msg = generateWAMessageFromContent(m.chat,{
          viewOnceMessage:{
            message:{
              messageContextInfo:{
                deviceListMetadata:{},
                deviceListMetadataVersion:2
              },
              interactiveMessage:{
                body:{ text: teks },
                footer:{ text: botname },
                header:{ title: "Sewa Bot Alya" },
                nativeFlowMessage:{
                  buttons:[{
                    name:"single_select",
                    buttonParamsJson:JSON.stringify({
                      title:"Pilih Paket Sewa",
                      sections:[{
                        title:"Daftar Paket",
                        rows
                      }]
                    })
                  }]
                }
              }
            }
          }
        },{ quoted:m })

        return alya.relayMessage(
          msg.key.remoteJid,
          msg.message,
          { messageId: msg.key.id }
        )
      }
      if (pilih) {

        if (!paket[pilih]) return reply("❌ Paket tidak ditemukan")

        let nama = paket[pilih].nama
        let harga = paket[pilih].harga

        let orderText = `Halo kak saya mau sewa bot

    Paket : ${nama}
    Harga : Rp ${rupiah(harga)}

    Link Group :
    `

        let link = `https://wa.me/6283166570663?text=${encodeURIComponent(orderText)}`

        let teks = `
    ╭━━━〔 🤖 ORDER SEWA BOT 〕━━━⬣
    │
    │ 📦 Paket : ${nama}
    │ 💰 Harga : Rp ${rupiah(harga)}
    │
    │ ⚡ Proses aktivasi 1-5 menit
    │ 🔐 Bot aktif 24 jam
    │
    ╰━━━━━━━━━━━━━━━━━━⬣

    📞 Klik link dibawah untuk order
    ${link}
    `

        alya.sendMessage(m.chat,{
          text: teks,
          contextInfo: {}
        },{ quoted:m })

      }

    }
    //=================={{=[===================]]\\
  }
