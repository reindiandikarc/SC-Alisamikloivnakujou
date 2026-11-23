// Plugin: growagarden
// Commands: growagarden, gardeninfo, ggshop, tokokebun
// Live marketplace monitor untuk game Grow a Garden
// API: api.theresav.biz.id — key via global.therasav di settings.js

'use strict'

const axios = require('axios')

module.exports = {
  command: ['growagarden', 'gardeninfo', 'ggshop', 'tokokebun'],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const { replytolak } = ctx

    const apikey = global.therasav
    if (!apikey) {
      return m.reply(
        `⚠️ *Config Error*\n\n` +
        `Variabel \`global.therasav\` belum diset di \`settings.js\`.\n` +
        `Tambahkan baris berikut ke settings.js:\n\n` +
        `\`global.therasav = 'API_KEY_KAMU'\``
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '🌱', key: m.key } })

    try {
      const { data: api } = await axios.get(
        `https://api.theresav.biz.id/info/growagarden?apikey=${apikey}`,
        { timeout: 15000 }
      )

      if (!api?.status || !api?.result) {
        throw new Error('Gagal memuat data inventaris toko dari server API.')
      }

      const { seeds, gear, crates } = api.result
      const weather      = seeds?.current_weather || 'Unknown'
      const weatherEmoji = seeds?.weather_emoji   || '🌤️'

      // ─── Rarity badge map ──────────────────────────────────────
      const RARITY_BADGE = {
        common   : '⚪', uncommon : '🟢', rare    : '🔵',
        epic     : '🟣', legendary: '🟡', mythic  : '🔴',
        super    : '🟠', prismatic: '🌈'
      }

      // ─── Helper: parse satu kategori ──────────────────────────
      const parseCategory = (title, cat) => {
        if (!cat?.items?.length) return ''

        const inStock  = []
        const outStock = []

        for (const item of cat.items) {
          const badge = RARITY_BADGE[(item.rarity || '').toLowerCase()] || '🔹'
          if (item.in_stock > 0) {
            inStock.push(
              `  • ${badge} *${item.item_name}* (x${item.quantity})\n` +
              `    🪙 Price: ${item.price} | Rarity: _${item.rarity}_`
            )
          } else {
            outStock.push(item.item_name)
          }
        }

        let txt = `*${title}*\n`
        txt += inStock.length
          ? `🛒 *Ready Stock:*\n${inStock.join('\n')}\n`
          : `🛒 *Ready Stock:* _Kosong/Belum Restock_\n`
        if (outStock.length) {
          txt += `📦 *Out of Stock:* ~${outStock.join(', ')}~\n`
        }
        return txt + '\n'
      }

      // ─── Susun caption ─────────────────────────────────────────
      let caption = `✨ *GROW A GARDEN LIVE MARKETPLACE* ✨\n\n`
      caption += `${weatherEmoji} *Weather:* ${weather}\n`
      caption += `──────────────────────────────\n\n`
      caption += parseCategory('🌾 SEEDS (BENIH)', seeds)
      caption += `──────────────────────────────\n\n`
      caption += parseCategory('🛠️ GEAR (PERALATAN)', gear)
      caption += `──────────────────────────────\n\n`
      caption += parseCategory('📦 CRATES (KOTAK)', crates)
      caption += `\n💗 _Powered by Alya Bot V20_`

      await m.reply(caption)
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[growagarden]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply(`❌ *Garden Marketplace Error:* ${e.message}`)
    }
  }
}
