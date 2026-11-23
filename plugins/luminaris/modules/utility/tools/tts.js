import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'
import googleTTS from 'google-tts-api'

const KNOWN_LANGS = ['id', 'en', 'ja', 'ko', 'zh-CN', 'ar', 'es', 'fr', 'de', 'ru', 'hi', 'it', 'pt']

async function generateTTSBuffer(text, lang = 'id', slow = false) {
  if (!text || !text.trim()) {
    throw new Error('Text tidak boleh kosong')
  }

  const parts = await googleTTS.getAllAudioBase64(text, {
    lang,
    slow,
    host: 'https://translate.google.com',
    timeout: 30000,
    splitPunct: ',.?!،、。'
  })

  if (!Array.isArray(parts) || !parts.length) {
    throw new Error('Gagal generate audio')
  }

  // Convert base64 parts to buffers and concatenate them
  const buffers = parts.map(item => Buffer.from(item.base64, 'base64'))
  return Buffer.concat(buffers)
}

export default {
  name: 'tts',
  command: ['tts', 'say', 'speak'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Text to Speech menggunakan Google TTS (Contoh: !tts Halo atau !tts en Hello)',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const text = args.join(' ').trim()

    if (!text) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide text to speak.\n\n*Usage:*\n!tts <text>\n!tts <lang> <text>\n\n*Supported langs:* id, en, ja, ko, zh-CN, ar, es, fr, de, ru' 
      }, { quoted: msg })
    }

    let lang = 'id'
    let speakText = text

    // Smart parsing: Check if the first argument is a valid language code
    if (args.length > 1 && KNOWN_LANGS.includes(args[0].toLowerCase())) {
      lang = args[0].toLowerCase()
      speakText = args.slice(1).join(' ').trim()
    }

    if (!speakText) {
      return sock.sendMessage(chat, { 
        text: '❌ Text cannot be empty after specifying language.' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔊', key: msg.key } })

    try {
      // Generate audio buffer in memory (no disk I/O needed!)
      const audioBuffer = await generateTTSBuffer(speakText, lang, false)

      // Send as Voice Note (ptt: true) for native WhatsApp feel
      await sock.sendMessage(chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true 
      }, { quoted: msg })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
    } catch (error) {
      logger.error('tts error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to generate speech: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}