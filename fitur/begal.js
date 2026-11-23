// Plugin: begal
// Ported from Alya V10 — format plugin
// Commands: begal
// Database: global.db.users[jid].antibegal (field existing)

const path = require('path')

module.exports = {
  command: ["begal"],
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

    const delay = (ms) => new Promise(res => setTimeout(res, ms))
    const stepDelay = 4000

    const COOLDOWN = 60 * 60 * 1000 // 1 Jam
    const SUCCESS_CHANCE = 0.35
    const ESCAPE_CHANCE = 0.25
    const JAIL_TIME = 5 * 60 * 60 * 1000 // 5 Jam
    const MIN_MONEY_TARGET = 50000

    let targetId = m.quoted ? m.quoted.sender : args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
    let begalType = args[0] ? args[0].toLowerCase() : null

    if (!begalType || !['money', 'limit'].includes(begalType))
      return replyalya(`⚠️ *PILIH JENISNYA!*\nContoh: .begal money (sambil reply) atau .begal money 628xxx`)

    if (!targetId)
      return replyalya('⚠️ *SIAPA TARGETNYA?*\nReply pesannya atau masukin nomor setelah jenis barang!')

    let users = global.db.users
    let now = Date.now()

    if (!(targetId in users)) return replyalya('❌ Target lu nggak ketemu, mungkin dia hantu.')
    if (targetId === m.sender) return replyalya('🤣 Masa mau begal diri sendiri? Stress ya?')

    let senderData = users[m.sender] ??= {}
    let victim = users[targetId]

    senderData.lastBegal ??= 0
    senderData.jailUntil ??= 0
    senderData.money ??= 0
    senderData.limit ??= 0
    senderData.kriminalLog ??= []

    victim.money ??= 0
    victim.limit ??= 0
    victim.antibegal ??= 0

    if (now < senderData.jailUntil) {
      let sisaMenit = Math.ceil((senderData.jailUntil - now) / 60000)
      return replyalya(`👮 *LU LAGI DI SEL!*\nSabar bray, lu masih dikurung sekitar ${sisaMenit} menit lagi. Jangan hobi ngerampok!`)
    }

    if (now < senderData.lastBegal + COOLDOWN) {
      let mnt = Math.ceil((senderData.lastBegal + COOLDOWN - now) / 60000)
      return replyalya(`⏳ *SABAR BOS!*\nPolisi lagi patroli. Tunggu ${mnt} menit lagi biar aman.`)
    }

    // ── Cek Bodyguard (antibegal dari database) ───────────────────────
    if (victim.antibegal > 0) {
      victim.antibegal--
      senderData.lastBegal = now
      senderData.kriminalLog.push({ time: now, aksi: 'BEGAL', target: targetId, hasil: 'GAGAL (ANTIBEGAL)' })
      return replyalya(`🛡️ *WADUH!* Target punya *Bodyguard*. Lu malah digebukin balik sampe bonyok!`)
    }

    if (begalType === 'money' && victim.money < MIN_MONEY_TARGET)
      return replyalya('💸 Target lu terlalu miskin, kasihan mending lu kasih sedekah.')

    if (victim[begalType] < 1)
      return replyalya(`❌ Target nggak punya ${begalType} sama sekali.`)

    let maxSteal = Math.max(1, Math.floor(victim[begalType] * 0.4))
    let stolen = Math.floor(Math.random() * maxSteal) + 1

    senderData.lastBegal = now

    const steps = [
      `🕶️ *OPERASI DIMULAI*\nTarget: @${targetId.split('@')[0]}`,
      '🎭 Memakai topeng dan nyiapin sajam...',
      '🏍️ Memantau pergerakan target dari gang sempit...',
      '🗡️ *CRAAASSS!* Langsung todong leher target!',
      '🎒 Lagi ngubek-ngubek tas target...',
      '🚨 *WADUH!* Warga sekitar mulai sadar!'
    ]

    let sent = await alya.sendMessage(m.chat, {
      text: steps[0],
      mentions: [targetId]
    }, { quoted: m })

    for (let i = 1; i < steps.length; i++) {
      await delay(stepDelay)
      await alya.sendMessage(m.chat, { text: steps[i], edit: sent.key, mentions: [targetId] })
    }

    await delay(stepDelay)

    let randomAction = Math.random()

    if (randomAction > SUCCESS_CHANCE) {
      if (Math.random() < ESCAPE_CHANCE) {
        senderData.kriminalLog.push({ time: now, aksi: 'BEGAL', target: targetId, hasil: 'GAGAL (LOLOS)' })
        return alya.sendMessage(m.chat, {
          text: `💨 *HAMPIR KETANGKAP!*\nWarga ngejar pake motor, tapi lu berhasil masuk gang sempit dan lolos. Lu nggak dapet apa-apa!`,
          edit: sent.key
        })
      } else {
        let fine = Math.max(1, Math.floor(senderData[begalType] * 0.5))
        senderData[begalType] = Math.max(0, senderData[begalType] - fine)
        senderData.jailUntil = now + JAIL_TIME
        senderData.kriminalLog.push({ time: now, aksi: 'BEGAL', target: targetId, hasil: 'DITANGKAP', denda: fine })

        return alya.sendMessage(m.chat, {
          text: `👮 *NASIB APES!*\nLu dikepung warga dan digebukin sampe pingsan. \n\n💸 *Denda:* ${fine.toLocaleString()} ${begalType}\n⛓️ *Hukuman:* Penjara 5 Jam`,
          edit: sent.key
        })
      }
    } else {
      stolen = Math.min(stolen, victim[begalType])
      victim[begalType] -= stolen
      senderData[begalType] += stolen

      senderData.kriminalLog.push({ time: now, aksi: 'BEGAL', target: targetId, hasil: 'SUKSES', dapat: stolen })

      return alya.sendMessage(m.chat, {
        text: `💰 *JACKPOT MANTAP!*\n\nBerhasil merampas harta @${targetId.split('@')[0]}\n📈 *Dapet:* ${stolen.toLocaleString()} ${begalType}\n🔥 *Total Harta Lu:* ${senderData[begalType].toLocaleString()}`,
        edit: sent.key,
        mentions: [targetId]
      })
    }
  }
}
