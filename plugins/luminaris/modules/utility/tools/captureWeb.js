import { CHAT } from '../../../_runtime/core-shim.js'

export default {
  name: 'captureweb',
  command: ['ss', 'screenshot', 'capture'],
  event: [], 
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Capture a screenshot of any website URL',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const url = args[0]

    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a valid URL.\nExample: !ss https://google.com' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '📸', key: msg.key } })

    try {
      // RAW Baileys Call: Send Image directly from an API
      const imageUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`
      
      await sock.sendMessage(chat, {
        image: { url: imageUrl },
        caption: `Screenshot of: ${url}`,
        contextInfo: {
          externalAdReply: {
            title: 'Web Capture',
            body: url,
            mediaType: 1,
            sourceUrl: url,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      console.error('[CaptureWeb Error]', error)
      await sock.sendMessage(chat, { 
        text: '❌ Failed to capture the website. The URL might be blocking bots.' 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}