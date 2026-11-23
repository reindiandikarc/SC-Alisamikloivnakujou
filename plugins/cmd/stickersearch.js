// Plugin: stickersearch
// Sumber: Nanzz API — Stickerly Search & Download
// Endpoint: https://api-nanzz.my.id/api/downloader/stickerly-search-&-dl.php?query=<keyword>
// Commands: stickersearch, stickerly, cstik
//
// Catatan implementasi:
// - Struktur response API ini belum berhasil divalidasi langsung (network di
//   sandbox dev diblokir saat development), jadi parsing di bawah bersifat
//   DEFENSIF: mengecek banyak kemungkinan nama field (status/success, result/
//   data/packs, url/link/file, dst) — pola yang sama dipakai cekkuota.js di
//   bot ini. Kalau setelah ditest field aslinya berbeda, tinggal sesuaikan
//   di bagian "NORMALISASI RESULT" saja.

const axios = require('axios')

const BASE_URL = 'https://api-nanzz.my.id/api/downloader/stickerly-search-&-dl.php'

async function searchStickerly(query) {
  // 1) Coba GET dengan query string (cara standar utk endpoint ?query=)
  try {
    const { data } = await axios.get(BASE_URL, {
      params: { query },
      timeout: 20000,
      validateStatus: () => true
    })
    if (isUsableResponse(data)) return data
  } catch (_) { /* lanjut coba POST */ }

  // 2) Fallback POST dengan payload JSON berisi field yang sama
  const { data } = await axios.post(BASE_URL, { query }, {
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

// Anggap response GET "tidak usable" kalau server menolak karena method/
// parameter (biasanya pesan menyebut "parameter" atau "method"), supaya
// kita tahu kapan harus coba POST.
function isUsableResponse(data) {
  if (!data) return false
  const isFail = data.status === false || data.status === 'false' || data.success === false
  if (!isFail) return true
  const msg = (data.message || data.msg || '').toString().toLowerCase()
  if (msg.includes('parameter') || msg.includes('method') || msg.includes('not allowed')) return false
  // Gagal tapi bukan soal parameter/method (misal "tidak ada hasil") → tetap usable,
  // tidak perlu coba POST.
  return true
}

// ── NORMALISASI RESULT ───────────────────────────────────────────────
// API berbeda-beda menamai field hasil. Cek beberapa kemungkinan umum.
function normalizeResult(raw) {
  if (!raw) return { ok: false, items: [] }

  const ok = raw.status === true || raw.status === 'true' || raw.success === true || (!('status' in raw) && !('success' in raw))
  if (!ok) return { ok: false, items: [], message: raw.message || raw.msg || null }

  // Kemungkinan lokasi array hasil
  const candidates = raw.result ?? raw.data ?? raw.packs ?? raw.results ?? raw.stickers ?? raw.list
  let items = []

  if (Array.isArray(candidates)) {
    items = candidates
  } else if (candidates && Array.isArray(candidates.packs)) {
    items = candidates.packs
  } else if (Array.isArray(raw)) {
    items = raw
  }

  const normalized = items.map((it, i) => {
    const title = it.title || it.name || it.pack_name || it.packName || `Pack ${i + 1}`
    const author = it.author || it.creator || it.user || null
    const thumb = it.thumb || it.thumbnail || it.image || it.cover || it.icon || null
    // URL download bisa berupa link ke .wastickers/zip, atau langsung array webp
    const downloadUrl = it.download || it.downloadUrl || it.download_url || it.url || it.link || it.file || null
    const webpList = Array.isArray(it.stickers) ? it.stickers
      : Array.isArray(it.webp) ? it.webp
      : Array.isArray(it.images) ? it.images
      : []
    return { title, author, thumb, downloadUrl, webpList, raw: it }
  })

  return { ok: true, items: normalized }
}

module.exports = {
  command: ['stickersearch', 'stickerly', 'cstik'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const { text, prefix, reply, replyalya } = ctx

    if (!text) {
      return reply(
        `🔍 *Cari Sticker Pack (Sticker.ly)*\n\n` +
        `Cara pakai:\n` +
        `• *${prefix}stickersearch <kata kunci>*\n` +
        `  Contoh: *${prefix}stickersearch anime cute*\n\n` +
        `_Sumber: Sticker.ly via Nanzz API_`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    let raw
    try {
      raw = await searchStickerly(text)
    } catch (e) {
      console.error('[stickersearch] request error:', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Gagal menghubungi server pencarian sticker.\n_${e?.message || 'Unknown error'}_`)
    }

    const { ok, items, message } = normalizeResult(raw)

    if (!ok || !items.length) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(
        `❌ *Tidak ada hasil untuk "${text}"*\n` +
        (message ? `_${message}_\n` : '') +
        `\n_Coba kata kunci lain yang lebih umum_`
      )
    }

    const top = items.slice(0, 10)

    // Kalau punya daftar webp langsung di hasil pertama → kirim beberapa
    // sticker langsung sebagai contoh. Kalau tidak, tampilkan daftar pack.
    const first = top[0]

    if (first.webpList && first.webpList.length) {
      await replyalya(
        `🎴 *Ditemukan pack: ${first.title}*\n` +
        (first.author ? `👤 Oleh: ${first.author}\n` : '') +
        `📦 ${first.webpList.length} sticker dalam pack ini\n` +
        `_Mengirim beberapa contoh sticker..._`
      )

      const sendCount = Math.min(5, first.webpList.length)
      for (let i = 0; i < sendCount; i++) {
        const stickerUrl = first.webpList[i]?.url || first.webpList[i]
        if (!stickerUrl) continue
        try {
          await alya.sendMessage(m.chat, { sticker: { url: stickerUrl } }, { quoted: m })
        } catch (e) {
          console.error('[stickersearch] gagal kirim sticker idx', i, e?.message || e)
        }
      }
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return
    }

    // Fallback: tampilkan daftar pack yang ditemukan + link download (kalau ada)
    let listMsg = `🎴 *HASIL PENCARIAN STICKER PACK*\n📝 Keyword: "${text}"\n━━━━━━━━━━━━━━━━━━━━\n\n`
    top.forEach((it, i) => {
      listMsg += `*${i + 1}.* ${it.title}\n`
      if (it.author) listMsg += `   👤 ${it.author}\n`
      if (it.downloadUrl) listMsg += `   🔗 ${it.downloadUrl}\n`
      listMsg += `\n`
    })
    listMsg += `━━━━━━━━━━━━━━━━━━━━\n💡 _Salin link download untuk mengunduh pack secara manual_`

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    // Kirim thumbnail pack pertama kalau ada, sebagai gambar pendamping
    if (first.thumb) {
      try {
        await alya.sendMessage(m.chat, {
          image: { url: first.thumb },
          caption: listMsg
        }, { quoted: m })
        return
      } catch (_) { /* lanjut ke text-only di bawah */ }
    }

    await replyalya(listMsg)
  }
}
