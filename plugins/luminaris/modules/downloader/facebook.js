import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

const API = "https://api.rifkyshre.biz.id"
const ROUTE = "/scrape/facebook"

async function downloadFacebook(url) {
  try {
    const res = await fetch(`${API}${ROUTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://code.rifkyshre.biz.id',
        'Referer': 'https://code.rifkyshre.biz.id/'
      },
      body: JSON.stringify({ url })
    })

    const body = await res.json()
    if (!body?.status) {
      return { ok: false, error: body?.error || 'Unknown error', code: body?.code || res.status }
    }

    const d = body.data
    return {
      ok: true,
      data: {
        title: d.title || 'Facebook Video',
        description: d.description || '',
        thumbnail: d.thumbnail || null,
        hd: d.hd || null,
        sd: d.sd || null
      }
    }
  } catch (e) {
    return { ok: false, error: e.message, code: 500 }
  }
}

export default {
  name: 'facebook',
  command: ['facebook', 'fb', 'fbdl'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Download video from Facebook (Reels/Posts)',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const url = args[0] || ''

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a valid Facebook URL!\n\n*Example:*\n!fb https://www.facebook.com/share/v/1CGj5okEfF/' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      const result = await downloadFacebook(url)

      if (!result.ok || !result.data) {
        await sock.sendMessage(chat, { 
          text: `❌ Failed to download. Is the link valid or is the video private?` 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      const videoUrl = result.data.hd || result.data.sd
      if (!videoUrl) {
        await sock.sendMessage(chat, { 
          text: '❌ No video URL found in the response.' 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      const caption = `*Facebook Video*\n\n*${result.data.title}*${result.data.description ? `\n\n_${result.data.description}_` : ''}`

      await sock.sendMessage(chat, {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: caption
      }, { quoted: msg })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('facebook download failed', error)
      await sock.sendMessage(chat, { 
        text: '❌ Failed to download from Facebook. Please try again later.' 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}