// Plugin: opencrate
// Commands: open
// Buka crate dari inventory untuk mendapat item random
// V20 — by Alya

'use strict'

// ── Tabel loot per rarity ──────────────────────────────────────────────────
const LOOT_TABLE = {
  common: {
    emoji: '📦',
    label: 'Common',
    rolls: 2,       // berapa item yang keluar
    pool: [
      { item: 'wood',     weight: 30, min: 3,  max: 8  },
      { item: 'rock',     weight: 30, min: 3,  max: 8  },
      { item: 'iron',     weight: 20, min: 1,  max: 3  },
      { item: 'potion',   weight: 10, min: 1,  max: 2  },
      { item: 'umpan',    weight: 10, min: 2,  max: 5  },
    ]
  },
  uncommon: {
    emoji: '🛍️',
    label: 'Uncommon',
    rolls: 3,
    pool: [
      { item: 'iron',     weight: 25, min: 2,  max: 6  },
      { item: 'gold',     weight: 20, min: 1,  max: 3  },
      { item: 'potion',   weight: 20, min: 2,  max: 4  },
      { item: 'umpan',    weight: 15, min: 3,  max: 7  },
      { item: 'string',   weight: 10, min: 1,  max: 3  },
      { item: 'emerald',  weight: 10, min: 1,  max: 2  },
    ]
  },
  mythic: {
    emoji: '🔮',
    label: 'Mythic',
    rolls: 4,
    pool: [
      { item: 'emerald',  weight: 25, min: 2,  max: 5  },
      { item: 'diamond',  weight: 20, min: 1,  max: 3  },
      { item: 'gold',     weight: 20, min: 3,  max: 8  },
      { item: 'potion',   weight: 15, min: 3,  max: 6  },
      { item: 'upgrader', weight: 10, min: 1,  max: 1  },
      { item: 'petfood',  weight: 10, min: 1,  max: 3  },
    ]
  },
  legendary: {
    emoji: '🔱',
    label: 'Legendary',
    rolls: 5,
    pool: [
      { item: 'diamond',  weight: 25, min: 3,  max: 7  },
      { item: 'emerald',  weight: 20, min: 3,  max: 6  },
      { item: 'upgrader', weight: 20, min: 1,  max: 2  },
      { item: 'petfood',  weight: 15, min: 2,  max: 5  },
      { item: 'pet',      weight: 10, min: 1,  max: 1  },
      { item: 'potion',   weight: 10, min: 5,  max: 10 },
    ]
  }
}

const EMOJI_MAP = {
  wood: '🪵', rock: '🪨', iron: '⛓️', gold: '🔸', string: '🕸️',
  emerald: '💚', diamond: '💎', potion: '🧪', umpan: '🪱',
  upgrader: '🆙', petfood: '🥩', pet: '🔖'
}

// Weighted random pick dari pool
function weightedPick(pool) {
  const total = pool.reduce((s, x) => s + x.weight, 0)
  let r = Math.random() * total
  for (const entry of pool) {
    r -= entry.weight
    if (r <= 0) return entry
  }
  return pool[pool.length - 1]
}

// Roll loot dari satu crate
function rollLoot(type) {
  const table = LOOT_TABLE[type]
  const result = {}
  for (let i = 0; i < table.rolls; i++) {
    const picked = weightedPick(table.pool)
    const qty = picked.min + Math.floor(Math.random() * (picked.max - picked.min + 1))
    result[picked.item] = (result[picked.item] || 0) + qty
  }
  return result
}

module.exports = {
  command: ['open'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const { args, q, prefix, sender, reply, replyalya, replytolak, user } = ctx

    const VALID = ['common', 'uncommon', 'mythic', 'legendary']

    // Tanpa argumen → tampilkan stok crate
    if (!args[0]) {
      const stok = VALID.map(t => {
        const tbl = LOOT_TABLE[t]
        const jml = user[t] || 0
        return `${tbl.emoji} *${tbl.label}*: ${jml} pcs`
      }).join('\n')

      return replyalya(
        `╔══〔 🎁 *CRATE INVENTORY* 〕══╗\n` +
        `┃\n` +
        `${stok.split('\n').map(l => `┃  ${l}`).join('\n')}\n` +
        `┃\n` +
        `╠══════════════════════════════╣\n` +
        `┃  Cara buka:\n` +
        `┃  *${prefix}open common*\n` +
        `┃  *${prefix}open uncommon 3*  (buka 3x)\n` +
        `┃  *${prefix}open all*  (buka semua)\n` +
        `╚══════════════════════════════╝`
      )
    }

    const typeArg = args[0].toLowerCase()

    // .open all → buka semua crate yang ada
    if (typeArg === 'all') {
      const hasCrate = VALID.some(t => (user[t] || 0) > 0)
      if (!hasCrate) return replytolak('❌ Kamu tidak punya crate apapun!')

      alya.sendMessage(m.chat, { react: { text: '🎁', key: m.key } })

      let totalReport = ''
      const grandTotal = {}
      let totalOpened = 0

      for (const type of VALID) {
        const jumlah = user[type] || 0
        if (jumlah <= 0) continue

        const tbl = LOOT_TABLE[type]
        const loot = {}
        for (let i = 0; i < jumlah; i++) {
          const r = rollLoot(type)
          for (const [item, qty] of Object.entries(r)) {
            loot[item] = (loot[item] || 0) + qty
            grandTotal[item] = (grandTotal[item] || 0) + qty
          }
        }
        user[type] = 0
        totalOpened += jumlah

        const lootLine = Object.entries(loot).map(([item, qty]) =>
          `  ${EMOJI_MAP[item] || '📦'} ${item}: +${qty}`
        ).join('\n')
        totalReport += `\n${tbl.emoji} *${tbl.label}* (${jumlah}x):\n${lootLine}\n`
      }

      // Tambahkan ke inventory user
      for (const [item, qty] of Object.entries(grandTotal)) {
        user[item] = (user[item] || 0) + qty
      }

      return replyalya(
        `╔══〔 🎁 *BUKA SEMUA CRATE!* 〕══╗\n` +
        `┃  Total dibuka: *${totalOpened} crate*\n` +
        `╠════════════════════════════════╣\n` +
        totalReport +
        `╠════════════════════════════════╣\n` +
        `┃  📦 *Grand Total Loot:*\n` +
        Object.entries(grandTotal).map(([item, qty]) =>
          `┃  ${EMOJI_MAP[item] || '📦'} ${item}: +${qty}`
        ).join('\n') + '\n' +
        `╚════════════════════════════════╝`
      )
    }

    // .open <type> [jumlah]
    if (!VALID.includes(typeArg)) {
      return replytolak(
        `❌ Tipe crate tidak valid!\n\nYang tersedia: *common, uncommon, mythic, legendary*\nAtau: *${prefix}open all*`
      )
    }

    const tbl = LOOT_TABLE[typeArg]
    let jumlah = parseInt(args[1]) || 1
    if (isNaN(jumlah) || jumlah < 1) jumlah = 1

    const punya = user[typeArg] || 0
    if (punya <= 0) return replytolak(`❌ Kamu tidak punya ${tbl.emoji} *${tbl.label} Crate*!`)
    if (jumlah > punya) {
      return replytolak(
        `❌ Crate tidak cukup!\n\n` +
        `${tbl.emoji} Punya: *${punya}*\n` +
        `📦 Mau buka: *${jumlah}*`
      )
    }

    alya.sendMessage(m.chat, { react: { text: '🎁', key: m.key } })

    // Roll semua crate
    const totalLoot = {}
    for (let i = 0; i < jumlah; i++) {
      const r = rollLoot(typeArg)
      for (const [item, qty] of Object.entries(r)) {
        totalLoot[item] = (totalLoot[item] || 0) + qty
      }
    }

    // Kurangi crate, tambah item
    user[typeArg] -= jumlah
    for (const [item, qty] of Object.entries(totalLoot)) {
      user[item] = (user[item] || 0) + qty
    }

    const lootLines = Object.entries(totalLoot).map(([item, qty]) =>
      `┃  ${EMOJI_MAP[item] || '📦'} ${item}: *+${qty}*`
    ).join('\n')

    return replyalya(
      `╔══〔 ${tbl.emoji} *BUKA ${tbl.label.toUpperCase()} CRATE!* 〕══╗\n` +
      (jumlah > 1 ? `┃  Membuka *${jumlah}x* crate...\n` : '') +
      `╠════════════════════════════════╣\n` +
      `┃  🎉 *LOOT DIDAPAT:*\n` +
      lootLines + '\n' +
      `╠════════════════════════════════╣\n` +
      `┃  ${tbl.emoji} Sisa ${tbl.label}: *${user[typeArg]}*\n` +
      `╚════════════════════════════════╝`
    )
  }
}
