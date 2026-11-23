// Plugin: wormgpt
// Sumber: Nanzz API — AI Chat ("NanzzGpt" / worm-gpt endpoint)
// Endpoint: https://api-nanzz.my.id/api/ai/worm-gpt.php?prompt=<text>
// Commands: wormgpt
//
// Catatan implementasi:
// - Response API ini belum berhasil divalidasi penuh (network sandbox dev
//   diblokir), tapi dari satu test call diketahui shape dasarnya:
//   { creator, name: "NanzzGpt", status, message/result }
// - Parsing di bawah cek beberapa field jawaban yang umum dipakai endpoint
//   sejenis (result/data/answer/response/message), defensif seperti
//   cekkuota.js.

const axios = require('axios')

const BASE_URL = 'https://api-nanzz.my.id/api/ai/worm-gpt.php'

async function askWormGpt(prompt) {
  // 1) Coba GET dengan query string
  try {
    const { data } = await axios.get(BASE_URL, {
      params: { prompt },
      timeout: 30000,
      validateStatus: () => true
    })
    if (isUsableResponse(data)) return data
  } catch (_) { /* lanjut coba POST */ }

  // 2) Fallback POST dengan payload JSON
  const { data } = await axios.post(BASE_URL, { prompt }, {
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

function isUsableResponse(data) {
  if (!data) return false
  const isFail = data.status === false || data.status === 'false' || data.success === false
  if (!isFail) return true
  const msg = (data.message || data.msg || '').toString().toLowerCase()
  if (msg.includes('parameter') || msg.includes('method') || msg.includes('not allowed')) return false
  return true
}

function extractAnswer(raw) {
  if (!raw) return null
  if (typeof raw === 'string') return raw
  return raw.result ?? raw.data ?? raw.answer ?? raw.response ?? raw.message ?? null
}

module.exports = {
  command: ['wormgpt'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx

    if (!text) {
      return reply(
        `🤖 *WormGPT AI*\n\n` +
        `Cara pakai:\n• *${prefix}${command} <pertanyaan>*\n` +
        `Contoh: *${prefix}${command} jelaskan apa itu fotosintesis*\n\n` +
        `_Powered by Nanzz API_`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '🤖', key: m.key } })

    let raw
    try {
      raw = await askWormGpt(text)
    } catch (e) {
      console.error('[wormgpt] request error:', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Gagal menghubungi AI.\n_${e?.message || 'Unknown error'}_`)
    }

    const isOk = raw?.status === true || raw?.status === 'true' || raw?.success === true
    const answer = extractAnswer(raw)

    if (!isOk || !answer) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(
        `❌ AI tidak memberikan jawaban.\n` +
        (raw?.message ? `_${raw.message}_` : `_Coba lagi dengan pertanyaan lain_`)
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await replyalya(`🤖 *WormGPT:*\n\n${answer}\n\n_Ditanyakan oleh ${pushname}_`)
  }
}
