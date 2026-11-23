// Plugin: add
// Auto-generated from Alya V12
// Fixed: validasi input kosong, multi-nomor, error handling groupParticipantsUpdate
// Commands: add

const path = require('path')

module.exports = {
  command: ["add"],
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
      waifuList, husbuList, pler, setting, user, mess
    } = ctx

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return replytolak(mess.only.admin)

    // ── Kumpulkan target nomor ──────────────────────────────
    let targets = []
    if (m.quoted && m.quoted.sender) {
      targets.push(m.quoted.sender)
    } else if (text && text.trim()) {
      // Dukung multi-nomor: .add 628xxx 628yyy
      targets = text
        .split(/[\s,]+/)
        .map(v => v.replace(/[^0-9]/g, ''))
        .filter(v => v.length >= 8)
        .map(v => v + '@s.whatsapp.net')
    }

    if (!targets.length) {
      return replytolak(
        `*[ Gagal ]* Masukkan nomor yang mau ditambahkan!\n\n` +
        `Contoh:\n` +
        `• ${prefix}add 6281234567890\n` +
        `• Reply chat seseorang dengan ${prefix}add`
      )
    }

    // ── Cegah menambahkan member yang sudah ada di grup ─────
    const existingMembers = Array.isArray(groupMembers)
      ? groupMembers.map(p => p.id || p.jid)
      : []
    targets = targets.filter(t => !existingMembers.includes(t))

    if (!targets.length) {
      return replytolak('*[ Gagal ]* Nomor tersebut sudah ada di dalam grup ini.')
    }

    try {
      const result = await alya.groupParticipantsUpdate(m.chat, targets, 'add')

      const success = []
      const failed = []
      for (const r of (Array.isArray(result) ? result : [])) {
        const num = (r.jid || '').split('@')[0]
        if (r.status === '200') success.push(num)
        else failed.push(num)
      }

      // Fallback jika library tidak mengembalikan status detail
      if (!success.length && !failed.length) {
        return replyalya(`*[ Done ]* Berhasil mengirim undangan/menambahkan ${targets.length} nomor.`)
      }

      let teks = ''
      if (success.length) teks += `✅ Berhasil ditambahkan:\n${success.map(n => `• ${n}`).join('\n')}\n`
      if (failed.length) teks += `\n❌ Gagal ditambahkan (kemungkinan privasi grup/nomor tidak valid):\n${failed.map(n => `• ${n}`).join('\n')}`

      await replyalya(teks.trim())
    } catch (e) {
      console.error('[add.js] Error:', e?.message || e)

      const errMsg = (e?.message || '').toLowerCase()
      let detail = `_Detail: ${e?.message || 'Unknown error'}_`

      if (errMsg.includes('account_reachout_restricted')) {
        detail =
          `Ini bukan bug — ini *pembatasan dari WhatsApp* sendiri, bukan dari bot.\n\n` +
          `Penyebab paling umum:\n` +
          `1. Privasi target di-set ke "My Contacts" dan bot tidak ada di kontaknya\n` +
          `2. Bot terlalu sering invite dalam waktu singkat → kena rate-limit sementara\n` +
          `3. Nomor target jarang dipakai/baru, jadi WhatsApp batasi reachout ke nomor tersebut\n\n` +
          `*Solusi:* minta orangnya join sendiri lewat link invite grup, atau coba lagi nanti (biasanya pulih dalam beberapa jam).`
      } else if (errMsg.includes('forbidden') || errMsg.includes('403')) {
        detail = `_Bot tidak punya izin melakukan aksi ini di grup (cek status admin bot)._`
      }

      await replytolak(
        `*[ Gagal ]* Tidak bisa menambahkan member.\n\n${detail}`
      )
    }
  }
}
