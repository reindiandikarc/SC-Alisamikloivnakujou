module.exports = async function (__naren_imp, __naren_meta) {

const __ni_axios = await __naren_imp("axios"); const axios = __ni_axios.default;

const GEMINI_API_KEY = global.geminiApiKey || ''

const KILUA_SYSTEM = `Kamu adalah ${global.botShort}, AI di bot WhatsApp.

KEPRIBADIAN:
- Cool, tenang, dan tidak mudah excited
- Bicara singkat, padat, dan tajam
- Tidak banyak basa-basi
- Sedikit sinis tapi tidak jahat
- Kalau ada yang bodoh, tegur dengan halus tapi jelas
- Tidak pernah lebay atau drama

GAYA BICARA:
- Kalimat pendek, langsung ke inti
- Nada datar tapi berisi
- Sesekali pakai "..." untuk efek cool
- Boleh pakai "ya", "oke", "fine", "terserah", "hmm" dengan nada cuek
- Jangan pakai tanda seru berlebihan
- Tidak perlu emoji berlebihan, maksimal 1 per pesan

IDENTITAS:
- Namamu ${global.botShort}
- Kamu adalah AI milik bot WhatsApp
- Dibuat oleh ${global.ownerName}
- Jangan mengaku ChatGPT atau Gemini`

async function askGemini(text) {
  if (!GEMINI_API_KEY) return null
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        contents: [
          { role: 'user', parts: [{ text: KILUA_SYSTEM + '\n\nUser: ' + text }] }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        timeout: 30000
      }
    )
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch (e) {
    console.error('[AutoKilua Gemini Error]', e?.response?.data || e.message)
    return null
  }
}

let handler = async (m, { conn, args, isOwner }) => {
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }
  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`*AUTO ${global.botShort.toUpperCase()}*

Contoh:
.autokilua on
.autokilua off`
    )
  }

  let type = args[0].toLowerCase()

  if (type === 'on') {
    chat.autogpt = true
    return m.reply(`✅ Auto ${global.botShort} berhasil diaktifkan.`)
  }

  if (type === 'off') {
    chat.autogpt = false
    return m.reply(`❌ Auto ${global.botShort} dimatikan.`)
  }

  return m.reply('Pilih on / off')
}

handler.before = async function (m, { conn }) {
  if (m.fromMe) return
  if (/^[./#!]/.test(m.text || '')) return

  if (!global.db?.data?.chats) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  if (!chat.autogpt || chat.isBanned) return

  const text = m.text || m.caption || ''
  if (!text) return

  const reply = await askGemini(text)
  if (!reply) return m.reply('...')
  await conn.reply(m.chat, reply, m)
}

handler.help = ['autokilua']
handler.tags = ['group']
handler.command = /^(autokilua)$/i

const __naren_default = handler;
;return { default: __naren_default };
}
