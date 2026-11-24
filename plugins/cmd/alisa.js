// ============================================================
// Plugin: .alisa - AI Interactive Kill Switch (Nyata & Berfungsi)
// Commands: alisa
//
// DATABASE TERPISAH:
//   ✅ alisa.js       → database/alisa_gc.json  (khusus .alisa on/off)
//   ✅ autoaigc.js    → database/openaigc.json   (khusus autoaigc)
//   ✅ autosimi.js    → database/simi.json        (khusus autosimi)
//
//   Ketiga database TIDAK SALING MENYENTUH. Matikan .alisa off
//   tidak akan mengubah openaigc.json maupun simi.json.
//
// Cara Kerja:
//   Menyimpan status AI ke dua lapisan:
//     1. global.alisaDisabled (in-memory, dibaca alya.js setiap pesan)
//     2. ./database/alisa_status.json (persistent, dimuat saat bot restart)
//     3. ./database/alisa_gc.json (daftar grup yang .alisa on — TERPISAH dari openaigc)
//
//   PENTING: Di alya.js, isAutoAiGcAlisa harus dibuat terpisah:
//   ──────────────────────────────────────────────────────────────
//   let alisagc = JSON.parse(fs.readFileSync('./database/alisa_gc.json'))
//   const isAutoAiGcAlisa = m.isGroup ? alisagc.includes(m.chat) : true
//   ──────────────────────────────────────────────────────────────
//
// Scope:
//   .alisa           → tampilkan help + status + button on/off
//   .alisa on        → aktifkan AI Interaktif di grup ini (admin/owner)
//   .alisa off       → matikan AI Interaktif di grup ini (admin/owner)
//   .alisa on-all    → aktifkan AI Interaktif di semua chat global (owner only)
//   .alisa off-all   → matikan AI Interaktif di semua chat global (owner only)
//   .alisa status    → lihat status detail
//   .alisa reset     → reset history percakapan user ini
// ============================================================

'use strict'

const fs   = require('fs')
const path = require('path')
const { isVpsStatusQuery, getVpsStatus, formatVpsStatus, shortUptime } = require('../../lib/vps-status')

// ── Path storage ───────────────────────────────────────────────────────────────
// ✅ PENTING: alisa_gc.json KHUSUS untuk .alisa on/off
// Tidak menyentuh openaigc.json (milik autoaigc) maupun simi.json (milik autosimi)
const ALISA_GC_PATH    = './database/alisa_gc.json'     // ← database EKSKLUSIF .alisa
const ALISA_STATUS_PATH = './database/alisa_status.json'

// ── Load / Save alisa_gc (whitelist grup AI Interaktif aktif) ─────────────────
function loadAlisaGc() {
  try {
    if (!fs.existsSync(ALISA_GC_PATH)) {
      fs.writeFileSync(ALISA_GC_PATH, '[]')
      return []
    }
    return JSON.parse(fs.readFileSync(ALISA_GC_PATH, 'utf-8')) || []
  } catch { return [] }
}

function saveAlisaGc(arr) {
  try {
    fs.writeFileSync(ALISA_GC_PATH, JSON.stringify(arr, null, 2))
    // Sync ke global.alisagc agar alya.js bisa baca tanpa fs
    if (global.alisagc !== undefined) global.alisagc = arr
  } catch (e) { console.error('[Alisa] Gagal simpan alisa_gc:', e.message) }
}

// ── Load / Save alisa_status (global kill switch) ────────────────────────────
// Format: { disabled: true/false, disabledAt: ISO, disabledBy: "sender" }
function loadAlisaStatus() {
  try {
    if (!fs.existsSync(ALISA_STATUS_PATH)) {
      const def = { disabled: false, disabledAt: null, disabledBy: null }
      fs.writeFileSync(ALISA_STATUS_PATH, JSON.stringify(def, null, 2))
      return def
    }
    return JSON.parse(fs.readFileSync(ALISA_STATUS_PATH, 'utf-8'))
  } catch { return { disabled: false, disabledAt: null, disabledBy: null } }
}

function saveAlisaStatus(status) {
  try {
    fs.writeFileSync(ALISA_STATUS_PATH, JSON.stringify(status, null, 2))
    // Sync ke global — alya.js membaca global.alisaDisabled setiap pesan masuk
    global.alisaDisabled = status.disabled
    console.log(`[Alisa] global.alisaDisabled = ${global.alisaDisabled}`)
  } catch (e) { console.error('[Alisa] Gagal simpan alisa_status:', e.message) }
}

// Inisialisasi global saat plugin pertama kali dimuat
;(() => {
  const st = loadAlisaStatus()
  if (typeof global.alisaDisabled === 'undefined') {
    global.alisaDisabled = st.disabled || false
    console.log(`[Alisa] Init: global.alisaDisabled = ${global.alisaDisabled}`)
  }
  // Init global.alisagc dari file
  if (typeof global.alisagc === 'undefined') {
    global.alisagc = loadAlisaGc()
    console.log(`[Alisa] Init: global.alisagc loaded, ${global.alisagc.length} grup aktif`)
  }
})()

// ── Fungsi bantu ───────────────────────────────────────────────────────────────
function buildStatusBar(isGlobalOff, isGroupOff, prefix) {
  const globalIcon = isGlobalOff ? '🔴' : '🟢'
  const groupIcon  = isGroupOff  ? '🔴' : '🟢'
  return (
    `╔════════════════════════╗\n` +
    `║  🤖 *STATUS AI ALISA*    ║\n` +
    `╠════════════════════════╣\n` +
    `║ ${globalIcon} Global AI  : ${isGlobalOff ? '*MATI*   ' : '*HIDUP*  '}║\n` +
    `║ ${groupIcon} Grup ini   : ${isGroupOff  ? '*MATI*   ' : '*HIDUP*  '}║\n` +
    `╠════════════════════════╣\n` +
    `║ 📋 *Commands:*\n` +
    `║ ${prefix}alisa on       → Aktif di grup ini\n` +
    `║ ${prefix}alisa off      → Mati di grup ini\n` +
    `║ ${prefix}alisa on-all   → Aktif global 🌐\n` +
    `║ ${prefix}alisa off-all  → Mati global 🌑\n` +
    `║ ${prefix}alisa status   → Info lengkap\n` +
    `║ ${prefix}alisa vps      → Status VPS bot\n` +
    `║ ${prefix}alisa reset    → Reset history\n` +
    `╚════════════════════════╝`
  )
}

// ── MODULE EXPORT ──────────────────────────────────────────────────────────────
module.exports = {
  command: ['alisa'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, command, text,
      from, sender, pushname,
      isGroup, groupName,
      Ryuu,
      isAdmins, isAdminOrOwner, isBotAdmins,
      reply, replyalya, replytolak,
      clearUserHistory,
      getChatCount, getEffectiveRole,
    } = ctx

    const sub = (args[0] || '').toLowerCase().trim()

    // .alisa juga "mengenali" pertanyaan status VPS bot dalam bahasa natural.
    // Contoh: `.alisa VPS kamu masih hidup?` → jawaban status lokal.
    if (!['on', 'off', 'on-all', 'off-all', 'status', 'reset', 'vps'].includes(sub) &&
        isVpsStatusQuery(text)) {
      console.log('[VPS] .alisa natural query -> jawaban lokal');
      return replyalya(formatVpsStatus(getVpsStatus({ socket: alya }), { prefix }))
    }

    // Load state
    const gcList      = loadAlisaGc()          // ← ALISA_GC, bukan openaigc!
    const alisaSt     = loadAlisaStatus()
    const isGlobalOff = alisaSt.disabled === true
    const isGroupActive = isGroup ? gcList.includes(from) : true

    // ─── Private chat: on/off tidak berlaku di PM ─────────────────────────
    if (!isGroup && !['vps', 'status', 'reset', 'on-all', 'off-all'].includes(sub)) {
      return replyalya(
        `🎀 *Di chat pribadi, Alisa selalu aktif!*\n\n` +
        `Kamu bisa langsung ngobrol sama aku kapan saja~\n` +
        `_Jangan pikir aku senang ya... ini memang tugasku!_ 😤\n\n` +
        `💡 Kalau mau reset history:\n` +
        `*${prefix}${command} reset*`
      )
    }

    switch (sub) {

      // ══════════════════════════════════════════════════════════════════════
      // .alisa vps — status VPS/server bot (lokal, tanpa API)
      // ══════════════════════════════════════════════════════════════════════
      case 'vps': {
        console.log('[VPS] .alisa vps -> jawaban lokal');
        return replyalya(formatVpsStatus(getVpsStatus({ socket: alya }), { prefix }))
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa on — aktifkan AI Interaktif di grup ini
      // ══════════════════════════════════════════════════════════════════════
      case 'on': {
        if (!isAdminOrOwner) return replytolak('❌ Hanya admin grup atau owner yang bisa mengaktifkan AI!')

        if (isGroupActive) {
          return replyalya(
            `ℹ️ *AI Alisa sudah aktif* di grup ini!\n\n` +
            `_Coba panggil namaku atau mention aku~_\n` +
            `Contoh: \`Alisa halo!\` atau tag @bot`
          )
        }

        gcList.push(from)
        saveAlisaGc(gcList)
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        try {
          await alya.sendMessage(m.chat, {
            text:
              `✅ *AI Alisa berhasil diaktifkan di grup ini!*\n\n` +
              `╔══════════════════════╗\n` +
              `║  🟢 *AI MODE: AKTIF*   ║\n` +
              `╚══════════════════════╝\n\n` +
              `📌 *Cara memanggil Alisa:*\n` +
              `› Tulis \`Alisa [pesan]\`\n` +
              `› Reply pesan bot\n` +
              `› Mention @bot\n\n` +
              `ℹ️ _Switch ini TERPISAH dari autoaigc & autosimi_\n` +
              `_Hmph... j-jangan berisik ya!_ 😤`,
            buttons: [
              {
                buttonId: `${prefix}alisa off`,
                buttonText: { displayText: '🔕 Matikan AI di Grup Ini' },
                type: 1
              },
              {
                buttonId: `${prefix}alisa status`,
                buttonText: { displayText: '📊 Lihat Status AI' },
                type: 1
              }
            ],
            headerType: 1,
            footer: `🌸 Alya Bot V20 | ${prefix}alisa off untuk matikan`
          }, { quoted: m })
        } catch {
          await replyalya(
            `✅ *AI Alisa berhasil diaktifkan di grup ini!*\n\n` +
            `🟢 AI MODE: AKTIF\n\n` +
            `_Hmph... j-jangan berisik ya!_ 😤\n\n` +
            `Untuk matikan: *${prefix}alisa off*`
          )
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa off — matikan AI Interaktif di grup ini
      // ══════════════════════════════════════════════════════════════════════
      case 'off': {
        if (!isAdminOrOwner) return replytolak('❌ Hanya admin grup atau owner yang bisa mematikan AI!')

        if (!isGroupActive) {
          return replyalya(
            `ℹ️ *AI Alisa sudah nonaktif* di grup ini.\n` +
            `Ketik *${prefix}${command} on* untuk mengaktifkan kembali.`
          )
        }

        const idx = gcList.indexOf(from)
        if (idx !== -1) gcList.splice(idx, 1)
        saveAlisaGc(gcList)
        await alya.sendMessage(m.chat, { react: { text: '🔕', key: m.key } })

        try {
          await alya.sendMessage(m.chat, {
            text:
              `🔕 *AI Alisa dinonaktifkan di grup ini.*\n\n` +
              `╔══════════════════════╗\n` +
              `║  🔴 *AI MODE: MATI*    ║\n` +
              `╚══════════════════════╝\n\n` +
              `_Aku... tidak akan merespons otomatis lagi di sini._\n` +
              `_Tapi kalau kamu mention aku langsung, aku tetap jawab ya~_ 🙈`,
            buttons: [
              {
                buttonId: `${prefix}alisa on`,
                buttonText: { displayText: '✅ Aktifkan AI di Grup Ini' },
                type: 1
              },
              {
                buttonId: `${prefix}alisa status`,
                buttonText: { displayText: '📊 Lihat Status AI' },
                type: 1
              }
            ],
            headerType: 1,
            footer: `🌸 Alya Bot V20 | ${prefix}alisa on untuk aktifkan`
          }, { quoted: m })
        } catch {
          await replyalya(
            `🔕 *AI Alisa dinonaktifkan di grup ini.*\n\n` +
            `🔴 AI MODE: MATI\n\n` +
            `_Aku tidak akan merespons otomatis lagi..._\n` +
            `Aktifkan lagi: *${prefix}alisa on*`
          )
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa on-all — aktifkan AI Interaktif secara GLOBAL (owner only)
      // ══════════════════════════════════════════════════════════════════════
      case 'on-all': {
        if (!Ryuu) return replytolak('❌ Khusus owner bot!')

        // Matikan global kill-switch
        saveAlisaStatus({ disabled: false, disabledAt: null, disabledBy: null })

        let allGroups = []
        try {
          const groupData = await alya.groupFetchAllParticipating()
          allGroups = Object.keys(groupData)
        } catch { /* tidak fatal */ }

        let added = 0
        for (const gid of allGroups) {
          if (!gcList.includes(gid)) { gcList.push(gid); added++ }
        }
        saveAlisaGc(gcList)

        await alya.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })

        try {
          await alya.sendMessage(m.chat, {
            text:
              `🌐 *AI Alisa diaktifkan GLOBAL!*\n\n` +
              `╔══════════════════════════╗\n` +
              `║  🟢 *GLOBAL AI: AKTIF*    ║\n` +
              `╚══════════════════════════╝\n\n` +
              `✅ Diaktifkan di: *${added}* grup baru\n` +
              `📊 Total grup aktif: *${gcList.length}*\n` +
              `🛡️ Kill-switch: *OFF* (AI bebas jalan)\n\n` +
              `ℹ️ autoaigc & autosimi tidak terpengaruh.\n` +
              `_Sekarang aku ada di mana-mana~_ 🌸`,
            buttons: [
              {
                buttonId: `${prefix}alisa off-all`,
                buttonText: { displayText: '🌑 Matikan AI Semua Chat' },
                type: 1
              },
              {
                buttonId: `${prefix}alisa status`,
                buttonText: { displayText: '📊 Lihat Status' },
                type: 1
              }
            ],
            headerType: 1,
            footer: `🌸 Alya Bot V20 — Owner Control`
          }, { quoted: m })
        } catch {
          await replyalya(
            `🌐 *AI Alisa diaktifkan GLOBAL!*\n` +
            `✅ ${added} grup baru | Total: ${gcList.length} grup\n\n` +
            `Matikan semua: *${prefix}alisa off-all*`
          )
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa off-all — matikan AI Interaktif GLOBAL (owner only)
      // ══════════════════════════════════════════════════════════════════════
      case 'off-all': {
        if (!Ryuu) return replytolak('❌ Khusus owner bot!')

        const prevCount = gcList.length

        // Set global kill-switch = true
        saveAlisaStatus({
          disabled: true,
          disabledAt: new Date().toISOString(),
          disabledBy: sender
        })

        // Kosongkan whitelist ALISA saja — openaigc & simi TIDAK disentuh!
        gcList.length = 0
        saveAlisaGc(gcList)

        await alya.sendMessage(m.chat, { react: { text: '🌑', key: m.key } })

        try {
          await alya.sendMessage(m.chat, {
            text:
              `🌑 *AI Alisa dimatikan TOTAL!*\n\n` +
              `╔══════════════════════════╗\n` +
              `║  🔴 *GLOBAL AI: MATI*     ║\n` +
              `╚══════════════════════════╝\n\n` +
              `❌ Dinonaktifkan dari: *${prevCount}* grup\n` +
              `🛡️ Kill-switch: *ON* (AI benar-benar berhenti)\n\n` +
              `✅ *autoaigc & autosimi TIDAK terpengaruh*\n` +
              `_(mereka punya database sendiri-sendiri)_\n\n` +
              `🚫 *Yang dimatikan (AI Interaktif .Alisa):*\n` +
              `› Auto-reply semua grup & PM\n` +
              `› Panggil nama "Alisa"\n` +
              `› Mention / tag bot\n` +
              `› Reply ke pesan bot\n\n` +
              `_Aku... istirahat dulu ya. Jangan kangen!_ 😔\n` +
              `💡 Aktifkan lagi: *${prefix}alisa on-all*`,
            buttons: [
              {
                buttonId: `${prefix}alisa on-all`,
                buttonText: { displayText: '🌐 Aktifkan AI Semua Chat' },
                type: 1
              },
              {
                buttonId: `${prefix}alisa status`,
                buttonText: { displayText: '📊 Lihat Status' },
                type: 1
              }
            ],
            headerType: 1,
            footer: `🌸 Alya Bot V20 — Owner Control`
          }, { quoted: m })
        } catch {
          await replyalya(
            `🌑 *AI Alisa dimatikan TOTAL!*\n` +
            `❌ ${prevCount} grup dinonaktifkan\n` +
            `🛡️ Kill-switch: AKTIF\n\n` +
            `Aktifkan lagi: *${prefix}alisa on-all*`
          )
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa status — lihat status lengkap
      // ══════════════════════════════════════════════════════════════════════
      case 'status': {
        const chatCount = typeof getChatCount === 'function' ? getChatCount(sender) : 0
        const roleData  = typeof getEffectiveRole === 'function' ? getEffectiveRole(sender) : { role: 'User' }
        const voiceModel = (() => {
          try {
            const { getVoiceModel } = require('../../machine/interactive_ai')
            return getVoiceModel()
          } catch { return 'bella' }
        })()

        // Status autoaigc & autosimi (baca database masing-masing)
        let autoaigcStatus = '⚠️ ?'
        let autosimiStatus = '⚠️ ?'
        try {
          const aigcArr = JSON.parse(fs.readFileSync('./database/openaigc.json', 'utf-8')) || []
          autoaigcStatus = aigcArr.includes(from) ? '🟢 Aktif' : '🔴 Nonaktif'
        } catch {}
        try {
          const simiArr = JSON.parse(fs.readFileSync('./database/simi.json', 'utf-8')) || []
          autosimiStatus = simiArr.includes(from) ? '🟢 Aktif' : '🔴 Nonaktif'
        } catch {}

        // Status VPS bot dibaca lokal — tidak tergantung API AI.
        const vpsNow = getVpsStatus({ socket: alya })
        const vpsService = vpsNow.service === 'active' ? '🟢 Aktif' : '🔴 ' + vpsNow.service
        const vpsConn = vpsNow.connected === true ? '🟢 Terhubung' : '🔴 Putus'

        const statusGrup   = isGroup
          ? (isGroupActive ? '🟢 Aktif' : '🔴 Nonaktif')
          : '🟢 Selalu aktif (PM)'
        const statusGlobal = isGlobalOff ? '🔴 MATI (kill-switch on)' : '🟢 HIDUP'
        const disabledInfo = isGlobalOff && alisaSt.disabledAt
          ? `\n║ ⏰ Dimatikan: ${new Date(alisaSt.disabledAt).toLocaleString('id-ID')}`
          : ''

        return replyalya(
          `╔═══════════════════════════════╗\n` +
          `║  🤖 *STATUS AI ALISA V20*       ║\n` +
          `╠═══════════════════════════════╣\n` +
          `║ 🌐 Global Alisa : ${statusGlobal}${disabledInfo}\n` +
          `║ 📍 .Alisa Grup  : ${statusGrup}\n` +
          `╠═══════════════════════════════╣\n` +
          `║ ⚙️ *Status Fitur AI Lainnya:*\n` +
          `║ 🤖 autoaigc : ${autoaigcStatus}\n` +
          `║ 💬 autosimi : ${autosimiStatus}\n` +
          `╠═══════════════════════════════╣\n` +
          `║ 🎙️ Voice     : \`${voiceModel}\`\n` +
          `║ 🖥️ VPS       : ${vpsService} | ${vpsConn}\n` +
          `║ ⏱️ Uptime VPS: ${shortUptime(vpsNow.systemUptimeSec)} | RAM ${vpsNow.memory.percent}%\n` +
          `║ 💬 Chat-mu   : ${String(chatCount)} pesan\n` +
          `║ 🎭 Hubungan  : ${(roleData.role || 'User').slice(0, 14)}\n` +
          `╠═══════════════════════════════╣\n` +
          `║ 📋 *Commands:*\n` +
          `║ ${prefix}alisa on/off\n` +
          `║ ${prefix}alisa on-all/off-all\n` +
          `║ ${prefix}alisa reset\n` +
          `║ ${prefix}setvoice [nama]\n` +
          `╚═══════════════════════════════╝\n\n` +
          `_Hmph, apa lagi yang mau kamu tahu..._ 😒`
        )
      }

      // ══════════════════════════════════════════════════════════════════════
      // .alisa reset — reset history percakapan user ini
      // ══════════════════════════════════════════════════════════════════════
      case 'reset': {
        const cleared = typeof clearUserHistory === 'function'
          ? clearUserHistory(sender)
          : false
        await alya.sendMessage(m.chat, { react: { text: '🔄', key: m.key } })
        if (cleared) {
          return replyalya(
            `🔄 *History percakapanmu berhasil direset!*\n\n` +
            `_Aku sudah lupa semua yang kita bicarakan...\n` +
            `Seperti orang asing lagi deh. Hmph._ 😶\n\n` +
            `_...tapi kalau kamu mau mulai lagi, aku di sini._ 💕`
          )
        } else {
          return replyalya(
            `ℹ️ *Tidak ada history yang perlu direset.*\n` +
            `_Kita belum pernah ngobrol sepertinya..._\n` +
            `_Yuk mulai dulu~_ 🌸`
          )
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // Default — tampilkan help + button on/off
      // ══════════════════════════════════════════════════════════════════════
      default: {
        const statusGrup = isGroup
          ? (isGroupActive
            ? `🟢 *AI Aktif* di grup *${groupName || 'ini'}*`
            : `🔴 *AI Nonaktif* di grup *${groupName || 'ini'}*`)
          : `🟢 *AI Selalu Aktif* di chat pribadi`

        const globalBanner = isGlobalOff
          ? `\n⚠️ *[GLOBAL KILL-SWITCH AKTIF — AI Interaktif benar-benar mati!]*\n`
          : ''

        const helpText =
          `╭─「 🤖 *ALISA AI — CONTROL PANEL* 」\n` +
          `│\n` +
          `│ ${statusGrup}\n` +
          `│ 🌐 Global: ${isGlobalOff ? '🔴 MATI' : '🟢 HIDUP'}\n` +
          `│${globalBanner}\n` +
          `├─ *📋 Commands:*\n` +
          `│ ${prefix}alisa on         — Aktifkan AI di grup ini\n` +
          `│ ${prefix}alisa off        — Matikan AI di grup ini\n` +
          `│ ${prefix}alisa on-all     — Aktifkan di semua chat 🌐\n` +
          `│ ${prefix}alisa off-all    — Matikan di semua chat 🌑\n` +
          `│ ${prefix}alisa status     — Status & info lengkap\n` +
          `│ ${prefix}alisa vps        — Status VPS/server bot\n` +
          `│ ${prefix}alisa reset      — Reset history chat-mu\n` +
          `│\n` +
          `├─ *🎙️ Voice:*\n` +
          `│ ${prefix}setvoice         — Lihat daftar suara\n` +
          `│ ${prefix}setvoice [nama]  — Ganti suara AI\n` +
          `│\n` +
          `├─ *💬 Cara memanggil AI:*\n` +
          `│ › "Alisa halo!" (panggil nama)\n` +
          `│ › Reply pesan bot\n` +
          `│ › Mention @bot\n` +
          `│\n` +
          `├─ *⚙️ AI Lainnya (switch terpisah):*\n` +
          `│ ${prefix}autoaigc on/off  — Auto AI Grup\n` +
          `│ ${prefix}autosimi on/off  — Auto Simi\n` +
          `│\n` +
          `│ _Hmph... kalau mau ngobrol, tinggal panggil aja~_ 💕\n` +
          `╰──────────────────`

        if (isGroup) {
          try {
            await alya.sendMessage(m.chat, {
              text: helpText,
              buttons: isGroupActive
                ? [
                    {
                      buttonId: `${prefix}alisa off`,
                      buttonText: { displayText: '🔕 Matikan AI di Grup Ini' },
                      type: 1
                    },
                    {
                      buttonId: `${prefix}alisa status`,
                      buttonText: { displayText: '📊 Lihat Status Lengkap' },
                      type: 1
                    }
                  ]
                : [
                    {
                      buttonId: `${prefix}alisa on`,
                      buttonText: { displayText: '✅ Aktifkan AI di Grup Ini' },
                      type: 1
                    },
                    {
                      buttonId: `${prefix}alisa status`,
                      buttonText: { displayText: '📊 Lihat Status Lengkap' },
                      type: 1
                    }
                  ],
              headerType: 1,
              footer: `🌸 Alya Bot V20 | Tap tombol untuk toggle AI`
            }, { quoted: m })
            return
          } catch { /* fallback ke teks biasa */ }
        }

        return replyalya(helpText)
      }
    }
  }
}
