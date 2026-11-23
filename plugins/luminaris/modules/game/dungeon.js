import { CHAT } from '../../_runtime/core-shim.js'

const SESSION_TIMEOUT = 5 * 60 * 1000
const STAMINA_COST = 30

const DUNGEONS = [
  { id: 1, name: '🌲 Hutan Gelap', levelReq: 1, monsters: ['Goblin Liar', 'Slime Raksasa', 'Serigala Malam', 'Bandit Hutan'], minReward: 100, maxReward: 300, dropChance: 40 },
  { id: 2, name: '🍄 Rawa Beracun', levelReq: 5, monsters: ['Kodok Mutan', 'Pohon Berjalan', 'Laba-laba Racun', 'Viper Rawa'], minReward: 250, maxReward: 500, dropChance: 45 },
  { id: 3, name: '🏰 Kastil Tua', levelReq: 10, monsters: ['Prajurit Tengkorak', 'Zombie Kelaparan', 'Hantu Penasaran', 'Gargoyle Batu'], minReward: 400, maxReward: 800, dropChance: 50 },
  { id: 4, name: '🏜️ Padang Pasir Kematian', levelReq: 15, monsters: ['Kalajengking Raksasa', 'Mummy Bangkit', 'Worm Gurun', 'Jin Jahat'], minReward: 600, maxReward: 1200, dropChance: 55 },
  { id: 5, name: '🌋 Gunung Api', levelReq: 20, monsters: ['Elemental Api', 'Golem Magma', 'Naga Kecil', 'Hellhound'], minReward: 900, maxReward: 1700, dropChance: 60 },
  { id: 6, name: '🧊 Gua Es Abadi', levelReq: 25, monsters: ['Golem Es', 'Raksasa Frost', 'Yeti Ganas', 'Serigala Salju'], minReward: 1300, maxReward: 2400, dropChance: 65 },
  { id: 7, name: '☁️ Reruntuhan Langit', levelReq: 30, monsters: ['Harpy Petir', 'Griffin Liar', 'Valkyrie Jatuh', 'Golem Angin'], minReward: 1800, maxReward: 3300, dropChance: 70 },
  { id: 8, name: '🌊 Lautan Bayangan', levelReq: 35, monsters: ['Kraken Bayi', 'Siren Pemikat', 'Hiu Hantu', 'Leviathan Merah'], minReward: 2500, maxReward: 4500, dropChance: 75 },
  { id: 9, name: '🕳️ Jurang Ketiadaan', levelReq: 40, monsters: ['Malaikat Kematian', 'Void Walker', 'Shadow Fiend', 'Behemoth'], minReward: 3500, maxReward: 6000, dropChance: 80 },
  { id: 10, name: '👹 Neraka Terdalam', levelReq: 50, monsters: ['Iblis Merah', 'Succubus Mematikan', 'Cerberus', 'Raja Iblis'], minReward: 5000, maxReward: 10000, dropChance: 90 },
]

const LOOT_TABLE = [
  { item: 'iron', chance: 40, qty: [1, 5], icon: '⛏️' },
  { item: 'gold', chance: 20, qty: [1, 3], icon: '🪙' },
  { item: 'diamond', chance: 5, qty: [1, 2], icon: '💎' },
  { item: 'potion', chance: 30, qty: [1, 3], icon: '🧪' },
  { item: 'herb', chance: 25, qty: [2, 6], icon: '🌿' },
  { item: 'leather', chance: 35, qty: [2, 5], icon: '👞' },
  { item: 'mysterybox', chance: 3, qty: [1, 1], icon: '📦' },
]

function initStats() {
  return {
    level: 1,
    exp: 0,
    attack: 10,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
  }
}

function expNeeded(level) {
  return level * 1000
}

function applyExp(stats, amount) {
  stats.exp += amount
  let leveled = 0
  while (stats.exp >= expNeeded(stats.level)) {
    stats.exp -= expNeeded(stats.level)
    stats.level++
    stats.attack += 2
    stats.maxHealth += 10
    stats.health = stats.maxHealth
    stats.maxStamina += 5
    leveled++
  }
  return leveled
}

function save(user) {
  return user.moduleData.user.set(user.sender, 'dungeon', user.dungeon)
}

async function handler(ctx) {
  const { sock, msg, chat, sender, moduleData } = ctx
  const [rawDungeon, rookie] = await Promise.all([
    moduleData.user.get(sender, 'dungeon'),
    moduleData.user.get(sender, 'rookie'),
  ])
  const dungeon = rawDungeon || initStats()
  dungeon.session = dungeon.session || null

  if (dungeon.session) {
    if (Date.now() - dungeon.session.time > SESSION_TIMEOUT) {
      dungeon.session = null
      try { await save({ moduleData, sender, dungeon }) } catch { ctx.helpers.ui.react(sock, chat, msg.key, '❌'); return }
    } else {
      return sock.sendMessage(chat, {
        text: [
          '⚔️ *SESI DUNGEON MASIH AKTIF*',
          '',
          'Kamu sedang berada di pertengahan eksplorasi!',
          '> Balas chat terakhir bot untuk membatalkan (ketik `batal`) atau melanjutkan aksi (ketik `serang` / `lari`).',
        ].join('\n')
      }, { quoted: msg })
    }
  }

  let txt = ['🏰 *LOBI DUNGEON*', '', '📊 *Statistik Kamu:*', `> Level: *${dungeon.level}*`, `> Stamina: *${dungeon.stamina}/${dungeon.maxStamina}*`, '']
  txt.push('Pilih lokasi yang ingin kamu jelajahi:', '')

  for (const d of DUNGEONS) {
    if (dungeon.level >= d.levelReq) {
      txt.push(`🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)`)
    } else {
      txt.push(`> 🔒 *${d.id}.* ${d.name} (Butuh Lv ${d.levelReq})`)
    }
  }
  txt.push('', '> 💡 Balas pesan ini dengan *angka* lokasi yang 🔓 (contoh: `1`) atau ketik `batal` untuk keluar.')

  dungeon.session = { stage: 'lobi', time: Date.now() }
  try { await save({ moduleData, sender, dungeon }) } catch { ctx.helpers.ui.react(sock, chat, msg.key, '❌'); return }

  await sock.sendMessage(chat, { text: txt.join('\n') }, { quoted: msg })
}

async function answerHandler(ctx) {
  const { sock, msg, chat, sender, text, moduleData } = ctx
  if (!text) return false
  const t = text.trim().toLowerCase()

  const rawDungeon = await moduleData.user.get(sender, 'dungeon')
  if (!rawDungeon?.session) return false

  const dungeon = rawDungeon
  const session = dungeon.session

  if (Date.now() - session.time > SESSION_TIMEOUT) {
    dungeon.session = null
    try {
      await Promise.all([save({ moduleData, sender, dungeon })])
    } catch { /* ignore */ }
    await sock.sendMessage(chat, {
      text: '⏰ *SESI DUNGEON KEDALUWARSA*\n\n> Sesi dungeon kamu sudah hangus karena tidak aktif selama 5 menit.'
    })
    return true
  }

  const [rawCoins, rawInv] = await Promise.all([
    moduleData.user.get(sender, 'coins'),
    moduleData.user.get(sender, 'inventory'),
  ])
  let coins = typeof rawCoins === 'number' ? rawCoins : 0
  const inventory = rawInv || {}

  const writeAll = async () => {
    try {
      await Promise.all([
        save({ moduleData, sender, dungeon }),
        moduleData.user.set(sender, 'coins', coins),
        moduleData.user.set(sender, 'inventory', inventory),
      ])
      return true
    } catch {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return false
    }
  }

  if (t === 'batal' || t === 'cancel' || t === 'keluar') {
    dungeon.session = null
    if (!(await writeAll())) return true
    await sock.sendMessage(chat, { text: '🚪 Kamu berhasil keluar dari Lobi Dungeon dengan selamat.' })
    return true
  }

  if (session.stage === 'lobi') {
    const choiceId = parseInt(t, 10)
    if (isNaN(choiceId)) return false

    const target = DUNGEONS.find((d) => d.id === choiceId)

    if (!target) {
      await sock.sendMessage(chat, {
        text: `❌ *PILIHAN TIDAK VALID*\n\n> Dungeon nomor ${choiceId} tidak ditemukan.`
      })
      return true
    }

    if (dungeon.level < target.levelReq) {
      await sock.sendMessage(chat, {
        text: `🔒 *DUNGEON TERKUNCI*\n\n> Level kamu (*Lv ${dungeon.level}*) belum cukup untuk memasuki *${target.name}*.\n> Kamu butuh minimal *Lv ${target.levelReq}*.`
      })
      return true
    }

    if (dungeon.stamina < STAMINA_COST) {
      await sock.sendMessage(chat, {
        text: `⚡ *STAMINA TIDAK CUKUP*\n\n> Kamu butuh setidaknya *${STAMINA_COST} stamina* untuk masuk.\n> Sisa stamina kamu saat ini hanya *${dungeon.stamina}*.\n\n> 💡 *Tips:* Istirahat dulu sebentar, atau ketik \`batal\`.`
      })
      return true
    }

    dungeon.stamina -= STAMINA_COST
    const monster = target.monsters[Math.floor(Math.random() * target.monsters.length)]
    const monsterPower = target.levelReq * 10 + Math.floor(Math.random() * 30)

    dungeon.session = {
      stage: 'encounter',
      dungeonId: target.id,
      dungeonName: target.name,
      levelReq: target.levelReq,
      monster,
      monsterPower,
      maxReward: target.maxReward,
      minReward: target.minReward,
      dropChance: target.dropChance,
      time: Date.now(),
    }

    if (!(await writeAll())) return true

    await sock.sendMessage(chat, { react: { text: '🚪', key: msg.key } })
    await sock.sendMessage(chat, {
      text: [
        '🚪 *MEMASUKI DUNGEON*',
        '',
        `Kamu melangkah perlahan ke dalam *${target.name}*...`,
        `> ⚡ Stamina berkurang *${STAMINA_COST}*`,
        '',
        `Tiba-tiba, seekor *👹 ${monster}* muncul dari kegelapan dan menghadang jalanmu!`,
        '',
        '*⚔️ APA YANG INGIN KAMU LAKUKAN?*',
        '> Balas pesan ini dengan `serang` untuk melawan',
        '> Balas pesan ini dengan `lari` untuk kabur (berisiko)',
      ].join('\n')
    })
    return true
  }

  if (session.stage === 'encounter') {
    if (t === 'serang' || t === 'attack' || t === 'lawan') {
      const isWin = dungeon.attack + dungeon.level * 4 + Math.floor(Math.random() * 20) >= session.monsterPower || Math.random() > 0.4
      let reportText = ''

      if (isWin) {
        const expReward = 150 * (session.levelReq / 2) + Math.floor(Math.random() * 200)
        const goldReward = Math.floor(Math.random() * (session.maxReward - session.minReward)) + session.minReward
        const droppedItems = []

        for (const loot of LOOT_TABLE) {
          if (Math.random() * 100 < loot.chance * (session.dropChance / 50)) {
            const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0]
            inventory[loot.item] = (inventory[loot.item] || 0) + qty
            droppedItems.push(`${loot.icon} ${loot.item} (x${qty})`)
          }
        }

        const leveled = applyExp(dungeon, expReward)
        coins += goldReward

        dungeon.session = null

        reportText += '🎉 *KEMENANGAN GEMILANG!*\n\n'
        reportText += `Dengan serangan mematikan, kamu berhasil menebas *${session.monster}*!\n\n`
        reportText += '*🎁 HADIAH YANG DIDAPAT:*\n'
        reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`
        reportText += `> 💰 Koin: *+${goldReward.toLocaleString()}*\n`

        if (droppedItems.length > 0) {
          reportText += `\n*📦 BARANG JARAHAN (LOOT):*\n`
          reportText += `> ${droppedItems.join('\n> ')}\n`
        }
        if (leveled > 0) {
          reportText += `\n🎉 *LEVEL UP!* Kamu sekarang *Lv ${dungeon.level}*!\n`
        }

        await sock.sendMessage(chat, { react: { text: '🏆', key: msg.key } })
        await writeAll()
        await sock.sendMessage(chat, { text: reportText })
        return true
      }

      // ─── LOSS ───
      const goldLoss = Math.floor(coins * 0.15)
      dungeon.health = Math.max(1, dungeon.health - 40)
      coins = Math.max(0, coins - goldLoss)

      dungeon.session = null

      reportText += '💀 *KEKALAHAN TRAGIS!*\n\n'
      reportText += `Kekuatanmu belum sebanding! *${session.monster}* memukul mundur dirimu dengan telak.\n`
      reportText += 'Kamu berhasil merangkak keluar dengan tubuh penuh luka.\n\n'
      reportText += '*💔 KERUGIAN:*\n'
      reportText += `> 💸 Uang jatuh: *-${goldLoss.toLocaleString()} Koin*\n`
      reportText += `> ❤️ Darah berkurang: *-40 HP*\n\n`
      reportText += '> 💡 *Tips:* Naikan levelmu, atau perkuat dirimu di dungeon lain!'

      await sock.sendMessage(chat, { react: { text: '💀', key: msg.key } })
      await writeAll()
      await sock.sendMessage(chat, { text: reportText })
      return true
    }

    if (t === 'lari' || t === 'kabur' || t === 'run') {
      const escapeChance = Math.random() > 0.5
      let reportText = ''

      if (escapeChance) {
        reportText += '🏃‍♂️ *BERHASIL KABUR!*\n\n'
        reportText += `Kamu berbalik dan berlari sekuat tenaga. *${session.monster}* kehilangan jejakmu!\n`
        reportText += 'Kamu selamat tanpa cedera, tapi petualangan ini sia-sia.'
        await sock.sendMessage(chat, { react: { text: '💨', key: msg.key } })
      } else {
        dungeon.health = Math.max(1, dungeon.health - 25)
        reportText += '💥 *GAGAL KABUR!*\n\n'
        reportText += `Kakimu tersandung bebatuan! *${session.monster}* mengejarmu dan mendaratkan cakarnya di tubuhmu!\n\n`
        reportText += '*💔 KERUGIAN:*\n'
        reportText += '> ❤️ Darah berkurang: *-25 HP*'
        await sock.sendMessage(chat, { react: { text: '🩸', key: msg.key } })
      }

      dungeon.session = null
      await writeAll()
      await sock.sendMessage(chat, { text: reportText })
      return true
    }

    await sock.sendMessage(chat, {
      text: '❓ *PILIHAN TIDAK DIKENAL*\n\n> Balas dengan `serang` untuk melawan monster.\n> Balas dengan `lari` untuk kabur.\n> Balas dengan `batal` jika benar-benar menyerah.'
    })
    return true
  }

  return false
}

export default {
  name: 'dungeon',
  command: ['dungeon', 'dg', 'explore', 'labirin'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'game',
  description: 'Jelajahi dungeon dan lawan monster secara interaktif',
  handle: handler,
  answerHandler,
}