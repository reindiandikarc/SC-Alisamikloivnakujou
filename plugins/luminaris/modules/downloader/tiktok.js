import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

const TIKTOK_URL_RE = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/\S+/i

async function resolveShortUrl(url) {
  if (!/vt\.tiktok\.com/i.test(url)) return url
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' })
    const location = res.headers.get('location')
    return location || url
  } catch {
    return url
  }
}

async function fetchTikTokData(url) {
  const resolved = await resolveShortUrl(url)
  const form = new URLSearchParams()
  form.append('url', resolved)

  const res = await fetch('https://www.tikwm.com/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  })
  
  const data = await res.json()
  if (data?.code !== 0 || !data?.data) {
    throw new Error(data?.msg || 'tikwm API returned error')
  }
  return data.data
}

export default {
  name: 'tiktok',
  command: ['tiktok', 'tt', 'ttdl', 'tikdl'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Download video/images from TikTok',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const url = args[0] || ''

    if (!url || !TIKTOK_URL_RE.test(url)) {
      return sock.sendMessage(chat, { 
        text: '❌ Kirim link TikTok yaa kak!\nContoh: !tiktok https://vt.tiktok.com/xxxxx' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      const info = await fetchTikTokData(url)
      const caption = info.title ? `*TikTok*\n\n${info.title}` : '*TikTok Download*'

      if (Array.isArray(info.images) && info.images.length > 0) {
        await sock.sendMessage(chat, { text: `${info.images.length} gambar ditemukan! Mengirim...` }, { quoted: msg })

        for (let i = 0; i < info.images.length; i++) {
          const imgCaption = i === 0 ? caption : undefined
          await sock.sendMessage(chat, {
            image: { url: info.images[i] },
            mimetype: 'image/jpeg',
            caption: imgCaption
          }, { quoted: msg })
          
          if (i < info.images.length - 1) {
            await new Promise(r => setTimeout(r, 1500))
          }
        }

        if (info.music) {
          try {
            await sock.sendMessage(chat, {
              audio: { url: info.music },
              mimetype: 'audio/mpeg',
              ptt: false
            }, { quoted: msg })
          } catch (err) {
            logger.error('Failed to send TikTok audio', err)
          }
        }
        
        await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
        return
      }

      const videoUrl = info.play || info.wmplay
      if (videoUrl) {
        await sock.sendMessage(chat, {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          caption
        }, { quoted: msg })
        
        await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
        return
      }

      await sock.sendMessage(chat, { text: '❌ Tidak ditemukan media yang bisa diunduh.' }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })

    } catch (err) {
      logger.error('TikTok download failed', err)
      await sock.sendMessage(chat, { text: '❌ Gagal mengunduh dari TikTok. Coba lagi nanti.' }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}