// Plugin: setvoice / voicemodel
// Mengatur voice model ElevenLabs untuk VN AI Interaktif Alya
// Commands: setvoice, voicemodel

module.exports = {
  command: ['setvoice', 'voicemodel'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      Ryuu,
      reply, replyalya,
      // AI Interactive functions — dipass via ctx dari alya.js
      setVoiceModel,
      getVoiceModel,
      getVoiceList,
    } = ctx

    // Deskripsi tiap voice
    const VOICE_DESC = {
      prabowo:      'Prabowo Subianto',
      yanzgpt:      'Yanz (Cowok Indonesia)',
      bella:        'Bella (Default — Cewek halus)',
      megawati:     'Megawati Soekarnoputri',
      echilling:    'E-Chilling (Santai)',
      adam:         'Adam (Cowok EN)',
      thomas_shelby:'Thomas Shelby',
      michi_jkt48:  'Michi JKT48',
      nokotan:      'Nokotan (Anime cewek)',
      jokowi:       'Joko Widodo',
      boboiboy:     'BoBoiBoy',
      keqing:       'Keqing (Genshin)',
      anya:         'Anya (Spy x Family)',
      yanami_anna:  'Yanami Anna (Anime)',
      MasKhanID:    'Mas Khan Indonesia',
      Myka:         'Myka (Cewek EN)',
      raiden:       'Raiden (Genshin)',
      CelzoID:      'Celzo Indonesia',
    }

    const voices       = getVoiceList()
    const currentVoice = getVoiceModel()

    // ── Tanpa argumen: tampilkan daftar voice ──
    if (!text) {
      const voiceRows = voices.map((v, i) => {
        const desc   = VOICE_DESC[v] || v
        const active = v.toLowerCase() === currentVoice.toLowerCase() ? ' ◄ *aktif*' : ''
        return `│ ${String(i + 1).padStart(2, ' ')}. \`${v}\`  _${desc}_${active}`
      }).join('\n')

      return replyalya(
        `╭─「 🎙️ *VOICE MODEL AI ALYA* 」\n` +
        `│\n` +
        `│ 📌 *Voice aktif :* \`${currentVoice}\`\n` +
        `│ 🔊 *Provider    :* ElevenLabs via Termai API\n` +
        `│\n` +
        `├─ *Daftar Voice (${voices.length} tersedia):*\n` +
        voiceRows + `\n` +
        `│\n` +
        `├─ *Cara pakai:*\n` +
        `│ ${prefix}${command} bella\n` +
        `│ ${prefix}${command} anya\n` +
        `│ ${prefix}${command} jokowi\n` +
        `│\n` +
        `│ _Voice dipakai saat Alya mengirim VN/ptt_\n` +
        `╰──────────────────`
      )
    }

    // ── Ada argumen: set voice ──
    const inputVoice  = text.trim().toLowerCase()
    const matchedVoice = voices.find(v => v.toLowerCase() === inputVoice)

    if (!matchedVoice) {
      const voiceList = voices.map(v => `\`${v}\``).join(', ')
      return replyalya(
        `❌ *Voice "${text}" tidak ditemukan!*\n\n` +
        `📋 *Voice tersedia:*\n${voiceList}\n\n` +
        `*Contoh:* ${prefix}${command} bella`
      )
    }

    if (matchedVoice.toLowerCase() === currentVoice.toLowerCase()) {
      return replyalya(
        `ℹ️ Voice \`${matchedVoice}\` *sudah aktif!*\n\n` +
        `_Coba minta Alya kirim VN untuk mencoba._`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    // Test API voice sebelum set
    let apiOk = false
    try {
      const { TERMAI_KEY, TERMAI_URL } = require('../../machine/reasoner')
      const testUrl = `${TERMAI_URL}/api/text2speech/elevenlabs?key=${TERMAI_KEY}&text=${encodeURIComponent('Halo')}&voice=${matchedVoice}`
      const res = await fetch(testUrl, { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) {
          const buf = Buffer.from(await res.arrayBuffer())
          apiOk = buf.length > 1000
        }
      }
    } catch {}

    // Set voice model via ctx function (dari interactive_ai.js via alya.js)
    const success = setVoiceModel(matchedVoice)

    if (!success) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya('❌ Gagal mengubah voice model. Coba lagi.')
    }

    await alya.sendMessage(m.chat, { react: { text: '🎙️', key: m.key } })

    const desc      = VOICE_DESC[matchedVoice] || matchedVoice
    const apiStatus = apiOk
      ? `✅ API ElevenLabs: *online*`
      : `⚠️ API ElevenLabs: *sibuk/limit* — VN mungkin fallback sementara`

    reply(
      `╭─「 🎙️ *VOICE BERHASIL DIUBAH!* 」\n` +
      `│\n` +
      `│ 🔊 *Voice aktif :* \`${matchedVoice}\`\n` +
      `│ 👤 *Deskripsi   :* ${desc}\n` +
      `│ ${apiStatus}\n` +
      `│\n` +
      `│ _Coba minta Alya kirim voice note sekarang!_\n` +
      `│ _Contoh: "Alya kirim VN dong"_\n` +
      `╰──────────────────`
    )
  }
}
