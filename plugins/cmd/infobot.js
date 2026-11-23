// Plugin: infobot
// Alya V13 — Informasi Bot (Redesigned)
// Commands: infobot

const path = require('path')

module.exports = {
  command: ["infobot"],
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
      waifuList, husbuList, pler, setting, user,
      runtime, alyaFitur
    } = ctx

    const { performance } = require('perf_hooks')
    const os = require('os')
    const fs = require('fs')
    const moment = require('moment-timezone')

    // ── Stats ───────────────────────────────────────────────
    const totalUser  = Object.keys(global.db.users || {}).length
    const totalChat  = Object.keys(global.db.chats || {}).length

    let totalGroup = 0
    try {
      const grupData = JSON.parse(fs.readFileSync('./database/gruplist.json', 'utf8'))
      totalGroup = (grupData.groups || []).length
    } catch { totalGroup = 0 }

    let totalCmd = 0
    try {
      const cmdDb = JSON.parse(fs.readFileSync('./database/command.json', 'utf8'))
      totalCmd = Array.isArray(cmdDb)
        ? cmdDb.reduce((acc, v) => acc + (v.count || 0), 0)
        : 0
    } catch { totalCmd = 0 }

    // ── Speed ────────────────────────────────────────────────
    const t0 = performance.now()
    await new Promise(r => setTimeout(r, 1))
    const pingMs = (performance.now() - t0).toFixed(1)

    // ── Uptime ───────────────────────────────────────────────
    const uptimeText = runtime ? runtime(process.uptime()) : '–'

    // ── RAM ──────────────────────────────────────────────────
    const usedRam  = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0)
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(0)

    // ── Total Features ───────────────────────────────────────
    let totalFitur = '800+'
    try { totalFitur = alyaFitur ? alyaFitur() : '800+' } catch { totalFitur = '800+' }

    // ── Mode ─────────────────────────────────────────────────
    const botMode = global.db?.settings?.public !== false ? 'Public 🌐' : 'Self 🔒'

    // ── Greeting ─────────────────────────────────────────────
    const jam = moment.tz('Asia/Jakarta').hour()
    const greeting = jam < 11 ? 'Selamat Pagi ☀️'
                   : jam < 15 ? 'Selamat Siang 🌤️'
                   : jam < 18 ? 'Selamat Sore 🌇'
                   : 'Selamat Malam 🌙'

    const teks =
`╔══════════════════════════════════╗
║       ✦  𝑨 𝑳 𝒀 𝑨   𝑩 𝑶 𝑻  ✦        
║    ≋  Next-Gen WhatsApp Assistant ≋ 
╚══════════════════════════════════╝

${greeting}, @${sender.split('@')[0]}

Assalamu'alaikum Warahmatullahi Wabarakatuh 🌿
Salam sejahtera bagi kita semua,
Shalom • Om Swastiastu • Namo Buddhaya 🙏

Perkenalkan, saya *${global.botname || 'Alya Bot'}* — 
asisten digital berbasis WhatsApp yang hadir  
melayani Anda sepenuh hati, 24 jam sehari.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─「 🤖 *BOT INFORMATION* 」
│
│  🌸 Nama Bot   : ${global.botname || 'Alya chan'}
│  🏷️  Versi      : 13.0.0 Stable
│  📦 Tipe       : Multi-Device (MD)
│  🟢 Platform   : NodeJS v20
│  📚 Library    : @whiskeysockets/baileys
│  🗄️  Database   : MongoDB + Firebase
│  ⏳ Runtime    : ${uptimeText}
│  🖥️  Host       : Ubuntu 24.04 LTS VPS
│  ⚡ Speed      : ${pingMs} ms
│  🔒 RAM        : ${usedRam} MB / ${totalRam} MB
│  🌐 Mode       : ${botMode}
│
└──────────────────────────────

┌─「 📊 *BOT STATISTICS* 」
│
│  👥 Total User    : ${totalUser.toLocaleString('id-ID')} user
│  🏠 Total Group   : ${totalGroup.toLocaleString('id-ID')} grup
│  💬 Total Chat    : ${totalChat.toLocaleString('id-ID')} chat
│  ⚙️  Total Fitur   : ${totalFitur} commands
│  🔢 Command Run   : ${totalCmd.toLocaleString('id-ID')} kali
│
└──────────────────────────────

┌─「 👨‍💻 *DEVELOPER INFO* 」
│
│  🧑‍💻 Author    : @reindiandikarc
│  🏢 Team      : Reindiandikarc Dev
│  📧 Email     : andikabudiyanto8897@gmail.com
│  📱 WhatsApp  : wa.me/6285602845943
│  🎵 TikTok    : @reindiandikarc
│  🌐 Website   : ${global.websitex || global.ownerweb}
│
└──────────────────────────────

Demikian yang dapat saya sampaikan.  
Terima kasih telah mempercayai *Alya Bot*.  
Apabila ada kekurangan, mohon maaf sebesar-besarnya.

Ketik *${prefix}menu* untuk melihat semua fitur.
Ketik *${prefix}ping* untuk cek status sistem.

*© 2026 Alya Tech • All Rights Reserved* 🌸
Wassalamu'alaikum Warahmatullahi Wabarakatuh.`

    await alya.sendMessage(m.chat, {
      text: teks,
      mentions: [sender]
    }, { quoted: m })
  }
}
