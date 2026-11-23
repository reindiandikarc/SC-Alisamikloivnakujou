// Plugin: konsumsi
// Commands: konsumsi, makan, minum
// Konsumsi buah dan potion dari inventory untuk efek RPG
// V20 — by Alya

'use strict'

// ── Definisi item yang bisa dikonsumsi ────────────────────────────────────
const KONSUMSI_ITEMS = {
  // ── BUAH (memberikan efek permanen kecil + exp) ──
  pisang: {
    emoji: '🍌',
    type: 'buah',
    label: 'Pisang',
    hpGain: 5,
    expGain: 50,
    moneyGain: 0,
    desc: 'Mengenyangkan. HP +5, EXP +50'
  },
  anggur: {
    emoji: '🍇',
    type: 'buah',
    label: 'Anggur',
    hpGain: 8,
    expGain: 80,
    moneyGain: 0,
    desc: 'Manis & menyegarkan. HP +8, EXP +80'
  },
  mangga: {
    emoji: '🥭',
    type: 'buah',
    label: 'Mangga',
    hpGain: 10,
    expGain: 100,
    moneyGain: 0,
    desc: 'Buah raja! HP +10, EXP +100'
  },
  apel: {
    emoji: '🍎',
    type: 'buah',
    label: 'Apel',
    hpGain: 7,
    expGain: 70,
    moneyGain: 0,
    desc: 'Sehat dan renyah. HP +7, EXP +70'
  },
  jeruk: {
    emoji: '🍊',
    type: 'buah',
    label: 'Jeruk',
    hpGain: 6,
    expGain: 60,
    moneyGain: 0,
    desc: 'Segar & vitamin C. HP +6, EXP +60'
  },

  // ── POTION (heal HP) ──
  potion: {
    emoji: '🧪',
    type: 'potion',
    label: 'Health Potion',
    hpGain: 20,
    expGain: 0,
    moneyGain: 0,
    desc: 'Pulihkan HP +20'
  },

  // ── PETFOOD (beri makan pet, naikin level) ──
  petfood: {
    emoji: '🥩',
    type: 'petfood',
    label: 'Pet Food',
    hpGain: 0,
    expGain: 0,
    moneyGain: 0,
    desc: 'Beri makan pet kamu'
  }
}

const MAX_HEALTH = 100
const MAX_PET_LV = 10

module.exports = {
  command: ['konsumsi', 'makan', 'minum'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, reply, replyalya, replytolak, user } = ctx

    // Tanpa argumen → tampilkan stok item yang bisa dikonsumsi
    if (!args[0]) {
      const buahList = ['pisang', 'anggur', 'mangga', 'apel', 'jeruk']
      const potionList = ['potion']
      const extraList = ['petfood']

      const buahTxt = buahList.map(k => {
        const d = KONSUMSI_ITEMS[k]
        const jml = user[k] || 0
        return `┃  ${d.emoji} *${d.label}*: ${jml}x  — ${d.desc}`
      }).join('\n')

      const potionTxt = potionList.map(k => {
        const d = KONSUMSI_ITEMS[k]
        const jml = user[k] || 0
        return `┃  ${d.emoji} *${d.label}*: ${jml}x  — ${d.desc}`
      }).join('\n')

      const extraTxt = extraList.map(k => {
        const d = KONSUMSI_ITEMS[k]
        const jml = user[k] || 0
        return `┃  ${d.emoji} *${d.label}*: ${jml}x  — ${d.desc}`
      }).join('\n')

      return replyalya(
        `╔══〔 🍽️ *KONSUMSI ITEM* 〕══╗\n` +
        `┃  ❤️ HP Sekarang: *${user.health || 0}/${MAX_HEALTH}*\n` +
        `╠══════════════════════════╣\n` +
        `┃  🍃 *BUAH:*\n` +
        `${buahTxt}\n` +
        `╠══════════════════════════╣\n` +
        `┃  🧪 *POTION:*\n` +
        `${potionTxt}\n` +
        `╠══════════════════════════╣\n` +
        `┃  🐾 *LAINNYA:*\n` +
        `${extraTxt}\n` +
        `╠══════════════════════════╣\n` +
        `┃  Cara pakai:\n` +
        `┃  *${prefix}konsumsi pisang*\n` +
        `┃  *${prefix}konsumsi potion 3*  (3x sekaligus)\n` +
        `┃  *${prefix}konsumsi all*  (konsumsi semua buah)\n` +
        `╚══════════════════════════╝`
      )
    }

    const itemKey = args[0].toLowerCase()

    // .konsumsi all → konsumsi semua buah
    if (itemKey === 'all' || itemKey === 'semua') {
      const buahList = ['pisang', 'anggur', 'mangga', 'apel', 'jeruk']
      const hasBuah = buahList.some(k => (user[k] || 0) > 0)
      if (!hasBuah) return replytolak('❌ Kamu tidak punya buah apapun!')

      let totalHp = 0, totalExp = 0
      let report = ''

      for (const key of buahList) {
        const jml = user[key] || 0
        if (jml <= 0) continue
        const d = KONSUMSI_ITEMS[key]

        const hpAdd = d.hpGain * jml
        const expAdd = d.expGain * jml
        totalHp += hpAdd
        totalExp += expAdd

        user[key] = 0
        report += `┃  ${d.emoji} ${d.label} x${jml} → HP +${hpAdd}, EXP +${expAdd}\n`
      }

      const hpBefore = user.health || 0
      user.health = Math.min(hpBefore + totalHp, MAX_HEALTH)
      const actualHpGain = user.health - hpBefore
      user.exp = (user.exp || 0) + totalExp

      alya.sendMessage(m.chat, { react: { text: '🍽️', key: m.key } })
      return replyalya(
        `╔══〔 🍽️ *MAKAN SEMUA BUAH!* 〕══╗\n` +
        `╠══════════════════════════════╣\n` +
        report +
        `╠══════════════════════════════╣\n` +
        `┃  ❤️ HP: *${hpBefore}* → *${user.health}/${MAX_HEALTH}* (+${actualHpGain})\n` +
        `┃  ✨ EXP +${totalExp}\n` +
        `╚══════════════════════════════╝`
      )
    }

    // Cek item valid
    if (!KONSUMSI_ITEMS[itemKey]) {
      return replytolak(
        `❌ Item *${itemKey}* tidak bisa dikonsumsi!\n\n` +
        `Item yang bisa:\n` +
        Object.keys(KONSUMSI_ITEMS).map(k => `• ${KONSUMSI_ITEMS[k].emoji} ${k}`).join('\n')
      )
    }

    const item = KONSUMSI_ITEMS[itemKey]
    let jumlah = parseInt(args[1]) || 1
    if (isNaN(jumlah) || jumlah < 1) jumlah = 1

    const punya = user[itemKey] || 0
    if (punya <= 0) {
      return replytolak(`❌ Kamu tidak punya ${item.emoji} *${item.label}*!`)
    }
    if (jumlah > punya) {
      return replytolak(
        `❌ ${item.emoji} *${item.label}* tidak cukup!\n\n` +
        `Punya: *${punya}*\n` +
        `Mau konsumsi: *${jumlah}*`
      )
    }

    // ── PETFOOD: beri makan pet ──
    if (item.type === 'petfood') {
      const petLv = user.pet || 0
      if (petLv <= 0) return replytolak('❌ Kamu belum punya pet!\n\nDapat pet dari dungeon floor 10+.')
      if (petLv >= MAX_PET_LV) return replytolak(`✅ Pet kamu sudah MAX level (${MAX_PET_LV})!`)

      const lvBefore = petLv
      const feedable = Math.min(jumlah, MAX_PET_LV - petLv)
      user.petfood -= feedable
      user.pet = Math.min(petLv + feedable, MAX_PET_LV)

      alya.sendMessage(m.chat, { react: { text: '🥩', key: m.key } })
      return replyalya(
        `╔══〔 🐾 *BERI MAKAN PET* 〕══╗\n` +
        `┃\n` +
        `┃  🥩 Pet Food digunakan: *${feedable}x*\n` +
        `┃  🐾 Level Pet: *${lvBefore}* → *${user.pet}/${MAX_PET_LV}*\n` +
        `┃  🥩 Sisa Pet Food: *${user.petfood}*\n` +
        `┃\n` +
        (user.pet >= MAX_PET_LV ? `┃  🏆 *PET SUDAH MAX LEVEL!*\n` : '') +
        `╚══════════════════════════╝`
      )
    }

    // ── POTION / BUAH: batasi jika HP sudah penuh untuk buah ──
    const hpBefore = user.health || 0

    if (item.type === 'buah' && hpBefore >= MAX_HEALTH) {
      // Tetap bisa makan buah, tapi HP tidak bertambah (hanya EXP)
      user[itemKey] -= jumlah
      const totalExp = item.expGain * jumlah
      user.exp = (user.exp || 0) + totalExp
      alya.sendMessage(m.chat, { react: { text: item.emoji, key: m.key } })
      return replyalya(
        `╔══〔 ${item.emoji} *MAKAN ${item.label.toUpperCase()}* 〕══╗\n` +
        `┃\n` +
        `┃  ${item.emoji} Dimakan: *${jumlah}x ${item.label}*\n` +
        `┃  ❤️ HP sudah penuh: *${MAX_HEALTH}/${MAX_HEALTH}*\n` +
        `┃  ✨ EXP: *+${totalExp}*\n` +
        `┃  📦 Sisa: *${user[itemKey]}*\n` +
        `┃\n` +
        `╚══════════════════════════╝`
      )
    }

    if (item.type === 'potion' && hpBefore >= MAX_HEALTH) {
      return replytolak(`❤️ HP kamu sudah penuh! (*${hpBefore}/${MAX_HEALTH}*)`)
    }

    // Kalau potion, batasi jumlah agar tidak waste (jangan heal melebihi max)
    let actualJumlah = jumlah
    if (item.type === 'potion') {
      const needed = Math.ceil((MAX_HEALTH - hpBefore) / item.hpGain)
      actualJumlah = Math.min(jumlah, needed)
      if (actualJumlah < jumlah) {
        // Cukup pakai segini aja
      }
    }

    // Hitung gain
    const totalHpGain = item.hpGain * actualJumlah
    const totalExpGain = item.expGain * actualJumlah

    user[itemKey] -= actualJumlah
    user.health = Math.min(hpBefore + totalHpGain, MAX_HEALTH)
    const actualHpAdded = user.health - hpBefore

    if (totalExpGain > 0) {
      user.exp = (user.exp || 0) + totalExpGain
    }

    alya.sendMessage(m.chat, { react: { text: item.emoji, key: m.key } })

    const wasted = actualJumlah < jumlah
      ? `\n┃  ⚠️ HP sudah cukup, hanya pakai *${actualJumlah}x*`
      : ''

    return replyalya(
      `╔══〔 ${item.emoji} *${command.toUpperCase()} ${item.label.toUpperCase()}* 〕══╗\n` +
      `┃\n` +
      `┃  ${item.emoji} Digunakan: *${actualJumlah}x ${item.label}*\n` +
      `┃  ❤️ HP: *${hpBefore}* → *${user.health}/${MAX_HEALTH}* (+${actualHpAdded})\n` +
      (totalExpGain > 0 ? `┃  ✨ EXP: *+${totalExpGain}*\n` : '') +
      `┃  📦 Sisa: *${user[itemKey]}*\n` +
      wasted + '\n' +
      (user.health >= MAX_HEALTH ? `┃  🏆 HP penuh!\n` : '') +
      `╚══════════════════════════╝`
    )
  }
}
