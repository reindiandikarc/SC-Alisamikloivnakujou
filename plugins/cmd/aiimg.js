// Plugin: aiimg / createimg / genimg
// Commands: aiimg, createimg, genimg
// Engine 1: CreateImg.com via zencf (original)
// Engine 2: Pollinations AI (fallback)
// Engine 3: Pollinations Flux (fallback 2)

'use strict'

const axios = require('axios')

async function generateCreateImg(prompt) {
  const CreateImg = require('../../lib/createimg')
  const ai = new CreateImg()
  const url = await ai.create(prompt)
  // url dari createimg adalah link upload uguu.se, fetch jadi buffer
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
  return { buffer: Buffer.from(res.data), engine: 'CreateImg.com' }
}

async function generatePollinations(prompt) {
  const encoded = encodeURIComponent(prompt)
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 99999)}`
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data || res.data.byteLength < 1000) throw new Error('Gambar kosong')
  return { buffer: Buffer.from(res.data), engine: 'Pollinations AI' }
}

async function generatePollinationsFlux(prompt) {
  const encoded = encodeURIComponent(prompt)
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=1024&height=1024&nologo=true`
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data || res.data.byteLength < 1000) throw new Error('Gambar kosong')
  return { buffer: Buffer.from(res.data), engine: 'Flux (Pollinations)' }
}

module.exports = {
  command: ['aiimg', 'createimg', 'genimg'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, pushname, replyalya } = ctx

    if (!text) return replyalya(
      `🎨 *AI Image Generator*\n\n` +
      `Cara pakai:\n` +
      `*${prefix + command}* <deskripsi gambar>\n\n` +
      `Contoh:\n` +
      `${prefix + command} anime girl with blue hair in the forest\n` +
      `${prefix + command} futuristic city at night cyberpunk`
    )

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    replyalya(
      `🎨 *Generating image...*\n\n` +
      `👤 User   : ${pushname}\n` +
      `📝 Prompt : ${text.slice(0, 80)}${text.length > 80 ? '...' : ''}\n\n` +
      `_Mohon tunggu ±10-60 detik_`
    )

    const engines = [
      { fn: () => generateCreateImg(text),          name: 'CreateImg' },
      { fn: () => generatePollinations(text),        name: 'Pollinations' },
      { fn: () => generatePollinationsFlux(text),    name: 'Flux' },
    ]

    for (const eng of engines) {
      try {
        const { buffer, engine } = await eng.fn()
        await alya.sendMessage(m.chat, {
          image: buffer,
          caption: `✨ *AI Image Result*\n\n📝 Prompt: ${text}\n🤖 Engine: ${engine}`
        }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return
      } catch (e) {
        console.warn(`[aiimg] ${eng.name} gagal:`, e.message)
      }
    }

    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    replyalya('❌ Semua source gagal generate gambar. Coba lagi nanti!')
  }
}
