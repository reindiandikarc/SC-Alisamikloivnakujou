import fetch from 'node-fetch'
import { extractTikTokUrl, resolveTikTokUrl } from '../../lib/scrape/tiktok.js'

let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    const input = m.quoted ? m.quoted.text : text

    if (!input) {
      return m.reply(`Kirim ${usedPrefix + command} url_tiktok`)
    }
    await m.reply(wait);

    // Menerima link tiktok.com (www/vm/vt/m, /t/xxx) dan tt.site/t/xxx
    const url = extractTikTokUrl(input)

    if (!url) {
      return m.reply(`Link yang kamu berikan tidak valid`)
    }

    const data = await getTikTok(url)

    if (!data) {
      return m.reply('TIMEOUT')
    }

    /*
    ============================
        DATA TIKTOK
    ============================
    */
    const nickname = data.author?.nickname || data.author?.name || '-'
    const username = data.author?.unique_id || data.author?.uniqueId || '-'
    const title = data.title || data.desc || '-'
      
    // Mengambil link audio
    const audioUrl = 
      data.music || 
      data.audio || 
      data.music_url || 
      data.music_info?.url ||
      data.music_info?.playUrl

    if (!audioUrl) {
      return m.reply('❌ Audio/Musik TikTok tidak ditemukan.')
    }

    const caption =
`*[ Tiktok Audio Downloader ]*

• Nickname: ${nickname}
• Username: @${username}
• Title: ${title}

🎵 _Sedang mengirim audio..._`

    // Kirim text informasi
    await m.reply(caption)
    
    await delay(1000)

    // Kirim Audio
    await conn.sendMessage(
      m.chat, 
      { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg',
        ptt: false // Ubah ke true jika ingin dikirim sebagai Voice Note (VN)
      }, 
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    return m.reply('❌ Terjadi kesalahan saat download Audio TikTok.')
  }
}

handler.help = ['ttaudio', 'ttmp3']
handler.tags = ['download']
handler.command = /^(ttaudio|ttmp3|tiktokaudio|tta)$/i
handler.limit = true

export default handler

// ===============================
// GET TIKTOK WITH FALLBACK
// ===============================

async function getTikTok(url) {
  let data = await fetchTikTok(url)
  if (data) return data

  const resolved = await resolveTikTokUrl(url)
  if (resolved && resolved !== url) return fetchTikTok(resolved)

  return null
}

async function fetchTikTok(url) {
  // PRIMARY : TIKWM
  try {
    const res = await (
      await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
      )
    ).json()

    if (res?.data) {
      return res.data
    }
  } catch {}

  // FALLBACK : SIPUTZX
  try {
    const res = await (
      await fetch(
        `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`
      )
    ).json()

    if (res?.data) {
      const d = res.data
      return {
        title: d.title || d.desc,
        author: d.author,
        music: d.music || d.audio || d.music_url || d.music_info?.url
      }
    }
  } catch {}

  return null
}

// ===============================
// DELAY
// ===============================

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))