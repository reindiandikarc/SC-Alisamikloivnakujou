/**
 * Name : Sticker Telegram Search
 * Type : ESM
 * Url : https://www.sigstick.com
 * Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
 */
import { searchPack, getPack } from '../../lib/scrape/stickersearch.js'

if (!global.sigstickSession) {
  global.sigstickSession = {}
}

// ============================================================
// HANDLER SEARCH
// ============================================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length) {
    return m.reply(
      `🔎 *Sticker Search*\n\nContoh:\n${usedPrefix + command} vanXone\n${usedPrefix + command} blue archive`
    )
  }

  const query = args.join(' ')

  try {
    await m.reply(`🔎 Mencari sticker pack *${query}*...`)
    const packs = await searchPack(query)
    
    if (!packs.length) {
      return m.reply(`❌ Tidak ada sticker pack untuk *${query}*.`)
    }

    const results = packs.slice(0, 10)
    
    // Session per sender
    global.sigstickSession[m.sender] = results
    
    let teks = `╭─「 *SIGSTICK SEARCH* 」\n` +
               `│ 🔎 Query: *${query}*\n` +
               `│ 📦 Total: *${packs.length}*\n` +
               `╰────────────────\n\n`
               
    results.forEach((p, i) => {
      teks += `*${i + 1}. ${p.title || 'Tanpa Judul'}*\n`
      if (p.status) teks += ` Status: ${p.status}\n`
      if (p.id) teks += ` ID: ${p.id}\n`
      if (p.telegramUrl) teks += ` Telegram: ${p.telegramUrl}\n`
      teks += '\n'
    })
    
    teks += `Reply angka *1-${results.length}* untuk mengirim pack.`
    await m.reply(teks)
    
  } catch (e) {
    console.error('[SIGSTICK SEARCH]', e)
    await m.reply(`❌ Gagal mencari sticker pack.\n\n${e.message}`)
  }
}

// ============================================================
// REPLY NUMBER
// ============================================================
handler.before = async function (m, { conn }) {
  if (!m.text) return
  
  // Support 1 sampai 10
  if (!/^(10|[1-9])$/.test(m.text.trim())) return

  const session = global.sigstickSession?.[m.sender]
  if (!session) return

  const number = Number(m.text.trim())
  const pack = session[number - 1]
  
  if (!pack) {
    return m.reply('❌ Nomor sticker pack tidak valid.')
  }

  delete global.sigstickSession[m.sender]
  await m.reply(`📦 Mengambil pack *${pack.title || 'Sticker Pack'}*...`)

  try {
    const result = await getPack(pack)
    let stickers = result.stickers || []
    
    if (!stickers.length) {
      return m.reply('❌ Sticker dalam pack tidak ditemukan.')
    }

    // WhatsApp native sticker pack.
    // Batasi jumlah agar ukuran paket tidak terlalu berat.
    const limit = stickers.slice(0, 30)
    const stickerList = limit.map(url => ({ data: { url } }))
    
    // Perbaikan: limit[0] sudah berupa string URL, jadi tidak perlu .url
    const cover = limit[0]
    
    if (!cover) {
      return m.reply('❌ Cover sticker tidak ditemukan.')
    }

    await conn.sendMessage(
      m.chat, 
      {
        cover: { url: cover },
        stickers: stickerList,
        name: pack.title || 'SigStick Pack',
        publisher: 'vanXone',
        description: 'vanXone ᴍᴅ ʙy vanXone'
      }, 
      { quoted: m }
    )
    
  } catch (e) {
    console.error('[SIGSTICK PACK]', e)
    await m.reply(`❌ Gagal mengambil sticker pack.\n\n${e.message}`)
  }
}


// ============================================================
// COMMAND
// ============================================================
handler.help = ['stickersearch <keyword>']
handler.tags = ['sticker']
handler.command = /^(stickersearch|stickerfind|sigstick)$/i
handler.limit = true

export default handler