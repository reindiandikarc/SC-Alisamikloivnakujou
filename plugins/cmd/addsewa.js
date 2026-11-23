// Plugin: addsewa
// Mendaftarkan grup baru ke sistem sewa via link undangan WhatsApp ATAU
// langsung via ID grup.
// Commands: addsewa
//
// FIX v3 (disederhanakan sesuai pola join.js / masukgc.js yang TERBUKTI JALAN):
// - join.js & masukgc.js TIDAK pernah gagal karena mereka pakai pola simple:
//     1. groupGetInviteInfo(inviteCode)  → dapat { id, subject } SEBELUM join
//     2. groupAcceptInvite(inviteCode)   → join, return groupId (string)
//   Keduanya tersedia & terbukti jalan di fork ini — sebelumnya addsewa.js
//   v2 menghindari groupGetInviteInfo() dengan asumsi tidak tersedia, padahal
//   justru itu sebabnya alur jadi rumit, bertingkat, dan gagal/silent.
// - v3 ini langsung pakai pola identik join.js/masukgc.js: tidak ada lagi
//   "getGroupIdFromInviteCode" custom, tidak ada lagi scan groupFetchAllParticipating.
// - Tetap pertahankan: validasi durasi, mode ID grup langsung, integrasi ke
//   lib/sewa.js (sumber data sama dengan tambahsewa/ceksewa/listsewa/delsewa).
// - Semua error path WAJIB kirim pesan respon agar tidak silent.

'use strict'

const { addSewaGroup: libAddSewaGroup, msToDate, getGcName } = require('../../lib/sewa')

// ─── Helper: validasi durasi → ms ──────────────────────────────────────────
function toMs(str) {
  const num  = parseInt(str)
  if (isNaN(num) || num <= 0) return NaN
  const unit = str[str.length - 1].toLowerCase()
  if (unit === 'd') return num * 24 * 60 * 60 * 1000
  if (unit === 'h') return num * 60 * 60 * 1000
  if (unit === 'm') return num * 60 * 1000
  if (unit === 's') return num * 1000
  if (unit === 'y') return num * 365 * 24 * 60 * 60 * 1000
  return num * 24 * 60 * 60 * 1000 // default: hari
}

// ─── Helper: format sisa waktu expired ─────────────────────────────────────
function getExpiredText(expired) {
  if (expired === 'PERMANENT') return '♾️ PERMANENT'
  const sisa = expired - Date.now()
  if (sisa <= 0) return '⚠️ SUDAH EXPIRED'
  return msToDate(sisa)
}

// ─── Helper: expired → tanggal lokal WIB ──────────────────────────────────
function toDateStr(expired) {
  if (expired === 'PERMANENT') return '♾️ Tidak ada batas'
  return new Date(expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

module.exports = {
  command: ['addsewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, replyalya, replytolak, Ryuu } = ctx

    // ── Cek permission ────────────────────────────────────────────────────
    if (!Ryuu) return replytolak('❌ Fitur ini khusus Owner!')

    // ── Panduan jika tidak ada argumen ────────────────────────────────────
    if (!text || text.trim().split(/\s+/).length < 2) {
      return replyalya(
        `╭━━━〔 📋 *PANDUAN ADDSEWA* 〕━━━⬣\n` +
        `┃\n` +
        `┃ *Format 1 — via link undangan:*\n` +
        `┃ ${prefix}${command} <link_gc> <durasi>\n` +
        `┃\n` +
        `┃ *Format 2 — via ID grup langsung:*\n` +
        `┃ ${prefix}${command} <group_id> <durasi>\n` +
        `┃\n` +
        `┃ *Contoh:*\n` +
        `┃ ${prefix}${command} https://chat.whatsapp.com/XXX 30d\n` +
        `┃ ${prefix}${command} 120363012345@g.us 30d\n` +
        `┃ ${prefix}${command} https://chat.whatsapp.com/XXX PERMANENT\n` +
        `┃\n` +
        `┃ *Satuan Waktu:*\n` +
        `┃ s=detik  m=menit  h=jam\n` +
        `┃ d=hari   y=tahun  PERMANENT=selamanya\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ── Parse argumen ──────────────────────────────────────────────────────
    const parts = text.trim().split(/\s+/)
    const input = parts[0]   // link atau group_id
    const waktu = parts[1]

    // ── Validasi durasi ────────────────────────────────────────────────────
    if (waktu !== 'PERMANENT') {
      const durMs = toMs(waktu)
      if (isNaN(durMs)) {
        return replyalya(
          `❌ *Durasi tidak valid!* (\`${waktu}\`)\n\n` +
          `Contoh yang benar:\n` +
          `• \`30d\` = 30 hari\n• \`1h\` = 1 jam\n• \`7d\` = 7 hari\n• \`PERMANENT\` = selamanya`
        )
      }
    }

    // ── Deteksi mode: link vs group ID langsung ────────────────────────────
    const isGroupId  = input.endsWith('@g.us')
    const linkMatch  = !isGroupId ? input.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{15,30})/i) : null
    const isLinkMode = !isGroupId && !!linkMatch

    if (!isGroupId && !isLinkMode) {
      return replyalya(
        `❌ *Input tidak valid!*\n\n` +
        `Kirim salah satu dari:\n` +
        `• Link grup: \`https://chat.whatsapp.com/XXX\`\n` +
        `• ID grup langsung: \`120363012345@g.us\`\n\n` +
        `Input yang kamu kirim:\n\`${input}\``
      )
    }

    // ══════════════════════════════════════════════════════════════════
    // MODE 1: group ID langsung (tidak perlu join)
    // ══════════════════════════════════════════════════════════════════
    if (isGroupId) {
      const groupId = input
      const groupName = await getGcName(groupId)

      const sewa = global.sewa || []
      let expired
      try {
        libAddSewaGroup(groupId, waktu, sewa)
        global.sewa = sewa
        expired = sewa.find(x => x.id === groupId)?.expired
      } catch (e) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya(`❌ Gagal menyimpan data sewa:\n\`${e.message}\``)
      }

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return replyalya(
        `╭━━━〔 ✅ *SEWA BERHASIL* 〕━━━⬣\n` +
        `┃\n` +
        `┃ 🏷️ Nama   : *${groupName}*\n` +
        `┃ 🆔 ID     : \`${groupId}\`\n` +
        `┃\n` +
        `┃ ⏳ Durasi : *${waktu}*\n` +
        `┃ 📅 Expired: *${getExpiredText(expired)}*\n` +
        `┃ 🗓️ Tgl     : ${toDateStr(expired)}\n` +
        `┃\n` +
        `┃ ✅ *Status sewa: AKTIF & BERJALAN*\n` +
        `┃\n` +
        `┃ 💡 Cek sewa: \`${prefix}ceksewa\` (di grup)\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ══════════════════════════════════════════════════════════════════
    // MODE 2: link undangan — pola IDENTIK dengan join.js / masukgc.js
    // ══════════════════════════════════════════════════════════════════
    const inviteCode = linkMatch[1]

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let groupId   = null
    let groupName = '(tidak diketahui)'

    try {
      // ── Sama seperti join.js: groupGetInviteInfo DULU untuk dapat id+subject ──
      const groupInfo = await alya.groupGetInviteInfo(inviteCode)
      groupId   = groupInfo?.id || null
      groupName = groupInfo?.subject || groupId || groupName

      // ── Lalu join — sama seperti join.js & masukgc.js ──────────────────────
      const joinRes = await alya.groupAcceptInvite(inviteCode)
      // masukgc.js membuktikan groupAcceptInvite() di fork ini return groupId
      // langsung sebagai string. Pakai sebagai fallback kalau groupGetInviteInfo
      // tidak mengembalikan id (jaga-jaga).
      if (!groupId) {
        if (typeof joinRes === 'string' && joinRes.includes('@g.us')) groupId = joinRes
        else if (joinRes?.id) groupId = joinRes.id
      }
    } catch (joinErr) {
      const errMsg = joinErr?.message || ''
      const statusCode = joinErr?.output?.statusCode

      // Bot sudah ada di dalam grup → bukan error fatal, lanjut pakai groupId yang sudah didapat
      const alreadyInGroup = statusCode === 409 || errMsg.includes('already') || errMsg.includes('existed')
      const pendingApproval = statusCode === 403 || errMsg.includes('require-invite') || errMsg.includes('403')

      if (!alreadyInGroup && !pendingApproval) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya(
          `❌ *Gagal masuk ke grup!*\n\n` +
          `Kemungkinan penyebab:\n` +
          `• Link sudah di-reset / tidak valid\n` +
          `• Bot diblokir dari grup ini\n` +
          `• Grup sudah penuh\n\n` +
          `Error: \`${errMsg || 'Unknown'}\`\n\n` +
          `💡 Gunakan ID grup langsung jika bot sudah di dalam grup:\n` +
          `\`${prefix}${command} 120363012345@g.us ${waktu}\``
        )
      }
      // Jika alreadyInGroup/pendingApproval dan groupId sudah didapat dari
      // groupGetInviteInfo di atas, kita lanjut saja — tidak return di sini.
    }

    // ── Kalau sampai sini masih belum dapat groupId, minta input manual ───
    if (!groupId) {
      await alya.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      return replyalya(
        `⚠️ *ID grup tidak terdeteksi otomatis.*\n\n` +
        `Silakan daftarkan sewa menggunakan *ID grup langsung*:\n` +
        `\`${prefix}${command} <id_grup@g.us> ${waktu}\`\n\n` +
        `Cara cari ID grup:\n` +
        `• Kirim perintah \`${prefix}cekidgc\` *di dalam grup tersebut*\n` +
        `• Atau gunakan \`${prefix}getlid\``
      )
    }

    // ── Daftarkan sewa (sumber data sama dengan tambahsewa/ceksewa/dll) ────
    const sewa = global.sewa || []
    let expired
    try {
      libAddSewaGroup(groupId, waktu, sewa)
      global.sewa = sewa
      expired = sewa.find(x => x.id === groupId)?.expired
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Gagal menyimpan data sewa:\n\`${e.message}\``)
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    return replyalya(
      `╭━━━〔 ✅ *SEWA BERHASIL* 〕━━━⬣\n` +
      `┃\n` +
      `┃ 🏷️ Nama   : *${groupName}*\n` +
      `┃ 🆔 ID     : \`${groupId}\`\n` +
      `┃\n` +
      `┃ ⏳ Durasi : *${waktu}*\n` +
      `┃ 📅 Expired: *${getExpiredText(expired)}*\n` +
      `┃ 🗓️ Tgl     : ${toDateStr(expired)}\n` +
      `┃\n` +
      `┃ 🤖 ✅ Bot berhasil masuk / sudah ada di grup\n` +
      `┃\n` +
      `┃ ✅ *Status sewa: AKTIF & BERJALAN*\n` +
      `┃\n` +
      `┃ 💡 Cek sewa: \`${prefix}ceksewa\` (di grup)\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
    )
  }
}
