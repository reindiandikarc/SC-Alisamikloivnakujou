// Plugin: telestick
// Commands: telestick
// Download semua sticker dalam satu sticker pack Telegram, kirim sebagai
// sticker WhatsApp satu per satu.
//
// ⚠️ CATATAN PENTING — file ini ditulis ULANG dari nol.
// Versi sebelumnya berisi kode TEROBFUSKASI dengan teknik anti-debugging
// (hex-encoded strings, deteksi debugger yang masuk infinite loop) dan
// sebuah Telegram Bot API token yang di-hardcode di dalam string
// tersembunyi itu — token itu TIDAK tercatat di settings.js manapun di
// codebase ini, yang membuatnya tidak bisa diverifikasi keamanannya
// (kemungkinan token curian/backdoor). Kode itu tidak dipakai lagi.
//
// Plugin ini sekarang memakai token Telegram bot MILIK OWNER SENDIRI,
// dibaca dari global.telegramBotToken (set di settings.js). Tanpa token
// yang valid, plugin akan kasih instruksi setup yang jelas — bukan diam
// pakai token tersembunyi siapa pun.

'use strict'

function getTelegramToken() {
  return global.telegramBotToken || null
}

module.exports = {
  command: ['telestick'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const { text, prefix, reply, replyalya } = ctx

    const token = getTelegramToken()
    if (!token) {
      return reply(
        `⚠️ *Telegram Bot Token belum dikonfigurasi*\n\n` +
        `Fitur ini butuh token bot Telegram milikmu sendiri.\n` +
        `Cara setup:\n` +
        `1. Buat bot via @BotFather di Telegram\n` +
        `2. Tambahkan ke settings.js:\n` +
        `   \`global.telegramBotToken = 'TOKEN_KAMU'\`\n` +
        `3. Restart bot\n\n` +
        `_Demi keamanan, plugin ini tidak lagi memakai token tersembunyi dari kode lama._`
      )
    }

    if (!text) {
      return reply(
        `🎴 *Download Sticker Pack Telegram*\n\n` +
        `Cara pakai:\n• \`${prefix}telestick <nama_set>\`\n` +
        `Contoh: \`${prefix}telestick AnimeStickers\`\n\n` +
        `💡 Nama set bisa dilihat dari link sticker pack Telegram\n` +
        `(t.me/addstickers/<nama_set>)`
      )
    }

    const setName = text.trim().split(/\s+/)[0]
    const apiBase = `https://api.telegram.org/bot${token}`

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let setInfo
    try {
      const res = await fetchJson(`${apiBase}/getStickerSet?name=${encodeURIComponent(setName)}`)
      if (!res?.ok) throw new Error(res?.description || 'Sticker set tidak ditemukan')
      setInfo = res.result
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Gagal mengambil sticker set "${setName}".\n_${e?.message || 'Set tidak ditemukan atau API Telegram error'}_`)
    }

    const stickers = setInfo.stickers || []
    if (!stickers.length) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Sticker set "${setName}" kosong atau tidak valid.`)
    }

    const estimateSeconds = Math.ceil(stickers.length * 1.5)
    await replyalya(
      `📦 *Total sticker:* ${stickers.length}\n` +
      `⏱️ *Estimasi waktu:* ~${estimateSeconds} detik\n\n` +
      `_Mengirim satu per satu..._`
    )

    let sukses = 0, gagal = 0
    for (const sticker of stickers) {
      try {
        const fileRes = await fetchJson(`${apiBase}/getFile?file_id=${sticker.file_id}`)
        if (!fileRes?.ok) { gagal++; continue }

        const filePath = fileRes.result.file_path
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
        const buffer = await getBuffer(fileUrl)

        if (!Buffer.isBuffer(buffer) || buffer.length < 50) { gagal++; continue }

        await alya.sendImageAsSticker(m.chat, buffer, m, {
          packname: global.packname,
          author: m.pushName
        })
        sukses++
        await sleep(700)
      } catch (e) {
        gagal++
        console.error('[telestick] gagal kirim 1 sticker:', e?.message || e)
      }
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await replyalya(`✅ *Selesai!*\n📦 Berhasil: ${sukses}\n❌ Gagal: ${gagal}`)
  }
}
