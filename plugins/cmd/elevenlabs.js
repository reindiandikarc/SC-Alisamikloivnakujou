'use strict'

const VOICE_SHORTCUTS = [
  'prabowo', 'yanzgpt', 'bella', 'megawati', 'echilling',
  'adam', 'thomas_shelby', 'michi_jkt48', 'nokotan', 'jokowi',
  'boboiboy', 'keqing', 'yanami_anna', 'maskhanid', 'myka',
  'raiden', 'celzoid',
]

function helpers(ctx) {
  const mod = typeof ctx?.generateVoice === 'function' && typeof ctx?.getVoiceList === 'function'
    ? null
    : require('../../machine/interactive_ai')
  return {
    generateVoice: typeof ctx?.generateVoice === 'function' ? ctx.generateVoice : mod.generateVoice,
    getVoiceList: typeof ctx?.getVoiceList === 'function' ? ctx.getVoiceList : mod.getVoiceList,
  }
}

function quotedText(quoted) {
  return quoted?.text || quoted?.msg?.text || quoted?.caption || quoted?.msg?.caption || ''
}

module.exports = {
  command: ['elevenlabs', 'eleven', 'ttsel', ...VOICE_SHORTCUTS],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, text, q, replyalya, quoted } = ctx || {}
    const { generateVoice, getVoiceList } = helpers(ctx)
    const voices = getVoiceList()
    const usage = 'List voice models:\n' + voices.join('\n') +
      '\nContoh: ' + (prefix || '.') + 'elevenlabs prabowo|halo'

    const sendReply = async (message) => {
      if (typeof replyalya === 'function') return replyalya(message)
      return alya.sendMessage(m.chat, { text: String(message) }, { quoted: m })
    }

    const cmd = String(command || '').toLowerCase()
    const isVoiceShortcut = VOICE_SHORTCUTS.includes(cmd)
    let voice = null
    let spoken = ''

    if (isVoiceShortcut) {
      voice = voices.find(v => v.toLowerCase() === cmd) || cmd
      spoken = String(text || q || '').trim()
    } else {
      const parts = String(text || q || '').split('|')
      const requested = parts.shift().trim()
      spoken = parts.join('|').trim()
      voice = voices.find(v => v === requested) ||
        voices.find(v => v.toLowerCase() === requested.toLowerCase()) || null
    }

    if (!voice || !spoken) {
      spoken = spoken || quotedText(quoted)
    }
    if (!voice || !spoken) return sendReply(usage)

    try { await alya.sendPresenceUpdate?.('recording', m.chat) } catch {}

    let audio
    try {
      audio = await generateVoice(spoken, { voice, strict: true, raw: true, speed: 0.9 })
    } catch (e) {
      const status = e?.status || ''
      const message = e?.message || 'Gagal membuat audio'
      return sendReply(
        '❗ *API RESPONSE STATUS: ' + status + '*\n\n' + message +
        '\n\nHarap Beli/Gunakan plan yang lebih tinggi untuk menggunakan fitur ini: https://termai.cc#pricing' +
        '\nCek waktu reset dengan perintah: ' + (prefix || '.') + 'cekapikey'
      )
    }

    if (!audio) return sendReply('❌ Gagal membuat audio dari ElevenLabs.')

    return alya.sendMessage(m.chat, {
      audio,
      mimetype: 'audio/mpeg',
      ai: true,
      ptt: true,
    }, { quoted: m })
  },
}
