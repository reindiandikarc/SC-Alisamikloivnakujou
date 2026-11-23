// Plugin: ultraman
// Ported from Alya V12 alya.js
// Commands: ultraman, hero, villain, lanjutultra, serang, abaikan, useplasmaspark, ultramanreset

const fs = require('fs')
const path = require('path')

// ── Kaiju List ──────────────────────────────────────────────────
const KAIJU_LIST = [
  { name: 'Baltan Seijin',    emoji: '🦞', power: 'Sinar Laser Alien',       reward: 45000  },
  { name: 'Red King',         emoji: '🔴', power: 'Serangan Brutal',           reward: 38000  },
  { name: 'Gomora',           emoji: '🦕', power: 'Tanduk Superoscillation',   reward: 50000  },
  { name: 'Zetton',           emoji: '⚫', power: 'Zetton Shutter',            reward: 90000  },
  { name: 'Eleking',          emoji: '⚡', power: 'Petir Plasma',              reward: 55000  },
  { name: 'Tyrant',           emoji: '👾', power: 'Kekuatan Gabungan',         reward: 80000  },
  { name: 'Bemular',          emoji: '💀', power: 'Blue Sphere',               reward: 35000  },
  { name: 'Dada',             emoji: '🌀', power: 'Telekinesis Alien',         reward: 30000  },
  { name: 'Gatanothor',       emoji: '🕳️', power: 'Kegelapan Mutlak',          reward: 100000 },
  { name: 'Golza',            emoji: '🗻', power: 'Ultrasonic Beam',           reward: 60000  },
  { name: 'Gan-Q',            emoji: '👁️', power: 'Tembakan Mata',             reward: 65000  },
  { name: 'King Joe',         emoji: '🤖', power: 'King Beam',                 reward: 70000  },
  { name: 'Alien Metron',     emoji: '🧬', power: 'Metron Ray',                reward: 55000  },
  { name: 'Bogarl',           emoji: '🐊', power: 'Bogarl Spit',               reward: 48000  },
  { name: 'Lugiel',           emoji: '🖤', power: 'Darkness Shard',             reward: 95000  },
  { name: 'Grigio',           emoji: '🐲', power: 'Grigio Beam',                reward: 42000  },
  { name: 'Gudon',            emoji: '🐍', power: 'Tentacle Whip',             reward: 36000  },
  { name: 'Twintail',         emoji: '🦂', power: 'Twin Stinger',               reward: 37000  },
  { name: 'Jamila',           emoji: '☠️', power: 'Acid Mist',                  reward: 33000  },
  { name: 'Neronga',          emoji: '🐘', power: 'Electric Horn',              reward: 34000  },
  { name: 'Pandon',           emoji: '🔥', power: 'Twin Flame Breath',          reward: 52000  },
  { name: 'Alien Guts',       emoji: '🩸', power: 'Guts Beam',                  reward: 46000  },
  { name: 'Black King',       emoji: '🖤', power: 'Dark Matter Punch',          reward: 68000  },
  { name: 'Yapool',           emoji: '🔮', power: 'Dimensional Rift',           reward: 85000  },
  { name: 'Ace Killer',       emoji: '🗡️', power: 'Dark Blade',                 reward: 75000  },
  { name: 'Commander Black',  emoji: '🛸', power: 'Black Hole Bomb',            reward: 88000  },
  { name: 'Silvergon',        emoji: '🥈', power: 'Silver Shield Crush',        reward: 61000  },
  { name: 'Zogu',             emoji: '🦋', power: 'Butterfly Devastation',      reward: 92000  },
  { name: 'Chaos Header',     emoji: '⚠️', power: 'Chaos Infection',            reward: 77000  },
  { name: 'Victory Killer',   emoji: '⚔️', power: 'V-Kill Slash',               reward: 82000  },
  { name: 'Five King',        emoji: '👑', power: 'Royal Destruction',          reward: 97000  },
  { name: 'Maga-Orochi',      emoji: '🐉', power: 'Serpent of Origin',          reward: 98000  },
  { name: 'Tregear',          emoji: '😈', power: 'Evil Tiga Spear',            reward: 96000  },
  { name: 'Celebro',          emoji: '🪄', power: 'Parasite Possession',        reward: 94000  },
  { name: 'Greeza',           emoji: '🕳️', power: 'Void Consumption',           reward: 99000  }
]

// ── Ultraman Types ──────────────────────────────────────────────
const ULTRAMAN_TYPES = {
  hero: {
    label: '✨ HERO', title: 'Ultraman of Light', color: '🔵',
    forms: ['Ultraman','Ultraseven','Ultraman Ace','Ultraman Tiga','Ultraman Dyna','Ultraman Gaia',
            'Ultraman Nexus','Ultraman Mebius','Ultraman Zero','Ultraman Ginga','Ultraman X',
            'Ultraman Orb','Ultraman Geed','Ultraman R/B','Ultraman Taiga','Ultraman Z',
            'Ultraman Trigger','Ultraman Decker'],
    attackMoves: ['Specium Ray ⚡','Ultra Slash 🌀','Strium Beam 🌟','Zepellion Ray 💫','Wide Shot ✨','Meta Field 🌐','Glitter Zepellion Ray 🌈']
  },
  villain: {
    label: '😈 VILLAIN', title: 'Dark Ultra', color: '🔴',
    forms: ['Ultraman Belial','Ultraman Tregear','Ultraman Noa (Dark)','Evil Tiga','Imit-Ultraman',
            'Dark Lugiel','Dark Zagi','Ultraman Reiga','Mold Spectre','Absoluto','Leugocyte',
            'Grimdo','Reibatos','Ultra Dark Killer'],
    attackMoves: ['Dark Field 🖤','Kaiser Darkness Blade ⚔️','Deathcium Ray ☠️','Evil Tiga Spear 🔱','Dark Lucifer ⛧','Vile Spear of Darkness 🗡️','Belial Atrocious 💥']
  }
}

const ULTRAMAN_IMAGES = {
  'Ultraman': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Ultraman_Series_Character_Ultraman.jpg',
  'Ultraseven': 'https://static.wikia.nocookie.net/ultraman/images/4/47/Seven2.png',
  'Ultraman Ace': 'https://static.wikia.nocookie.net/ultraman/images/5/5e/AceProfiler.png',
  'Ultraman Tiga': 'https://static.wikia.nocookie.net/ultraman/images/8/81/TigaProfile.png',
  'Ultraman Dyna': 'https://static.wikia.nocookie.net/ultraman/images/3/3f/DynaProfile.png',
  'Ultraman Gaia': 'https://static.wikia.nocookie.net/ultraman/images/2/2e/GaiaProfile.png',
  'Ultraman Nexus': 'https://static.wikia.nocookie.net/ultraman/images/5/5b/NexusProfile.png',
  'Ultraman Mebius': 'https://static.wikia.nocookie.net/ultraman/images/0/0b/MebiusProfile.png',
  'Ultraman Zero': 'https://static.wikia.nocookie.net/ultraman/images/8/8b/ZeroProfile.png',
  'Ultraman Ginga': 'https://static.wikia.nocookie.net/ultraman/images/4/4f/GingaProfile.png',
  'Ultraman X': 'https://static.wikia.nocookie.net/ultraman/images/f/f1/XProfile.png',
  'Ultraman Orb': 'https://static.wikia.nocookie.net/ultraman/images/4/4e/OrbProfile.png',
  'Ultraman Geed': 'https://static.wikia.nocookie.net/ultraman/images/0/0c/GeedProfile.png',
  'Ultraman R/B': 'https://static.wikia.nocookie.net/ultraman/images/8/8e/RBProfile.png',
  'Ultraman Taiga': 'https://static.wikia.nocookie.net/ultraman/images/4/4d/TaigaProfile.png',
  'Ultraman Z': 'https://static.wikia.nocookie.net/ultraman/images/f/f2/ZedProfile.png',
  'Ultraman Trigger': 'https://static.wikia.nocookie.net/ultraman/images/d/de/TriggerProfile.png',
  'Ultraman Decker': 'https://static.wikia.nocookie.net/ultraman/images/e/e8/DeckerProfile.png',
  'Ultraman Belial': 'https://static.wikia.nocookie.net/ultraman/images/0/07/BelialProfile.png',
  'Ultraman Tregear': 'https://static.wikia.nocookie.net/ultraman/images/0/07/TregearProfile.png',
  'Ultraman Noa (Dark)': 'https://static.wikia.nocookie.net/ultraman/images/4/4e/NoahProfile.png',
  'Evil Tiga': 'https://static.wikia.nocookie.net/ultraman/images/d/d3/EvilTigaProfile.png',
  'Dark Lugiel': 'https://static.wikia.nocookie.net/ultraman/images/0/08/LugielProfile.png',
  'Dark Zagi': 'https://static.wikia.nocookie.net/ultraman/images/8/86/ZagiProfile.png',
  '_default': 'https://i.pinimg.com/736x/e2/f6/1c/e2f61cd1b00c88266cfa7a64dac92c52.jpg'
}

// ── DB Helpers ──────────────────────────────────────────────────
const ULTRAMAN_DB_PATH = './database/ultraman.json'
function loadUltramanDB() {
  try {
    if (!fs.existsSync(ULTRAMAN_DB_PATH)) fs.writeFileSync(ULTRAMAN_DB_PATH, '{}')
    return JSON.parse(fs.readFileSync(ULTRAMAN_DB_PATH, 'utf-8'))
  } catch { return {} }
}
function saveUltramanDB(data) {
  fs.writeFileSync(ULTRAMAN_DB_PATH, JSON.stringify(data, null, 2))
}
function getUltraData(jid) { const d = loadUltramanDB(); return d[jid] || null }
function setUltraData(jid, data) { const d = loadUltramanDB(); d[jid] = data; saveUltramanDB(d) }
function getRandomKaiju() { return KAIJU_LIST[Math.floor(Math.random() * KAIJU_LIST.length)] }
function getRandomForm(type) { const f = ULTRAMAN_TYPES[type].forms; return f[Math.floor(Math.random() * f.length)] }
function getRandomAttack(type) { const m = ULTRAMAN_TYPES[type].attackMoves; return m[Math.floor(Math.random() * m.length)] }
function getUltraImg(form) { return ULTRAMAN_IMAGES[form] || ULTRAMAN_IMAGES['_default'] }
function formatHPBar(hp, max = 100) {
  const filled = Math.round((hp / max) * 10)
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, 10 - filled))
}

module.exports = {
  command: ['ultraman','hero','villain','lanjutultra','serang','abaikan','useplasmaspark','ultramanreset'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, reply, replyalya, replytolak
    } = ctx

    const sub = command.toLowerCase()

    // ── Helper kirim gambar ──────────────────────────────────────
    async function replyUltraImg(imgUrl, caption) {
      try {
        await alya.sendMessage(m.chat, { image: { url: imgUrl }, caption }, { quoted: m })
      } catch(e) {
        replyalya(caption)
      }
    }

    // ── .ultraman — Menu / Status ────────────────────────────────
    if (sub === 'ultraman') {
      const uData = getUltraData(sender)
      const u = global.db?.users?.[sender] || {}
      const hp = u.health ?? 100
      if (!uData) {
        return replyalya(
`╔═══〔 🌟 *ULTRAMAN GAME* 〕═══╗
┃
┃  Selamat datang, pejuang!
┃  Bumi membutuhkan pelindungnya.
┃
┃  ${prefix}hero  → Menjadi Ultraman cahaya ✨
┃  ${prefix}villain → Menjadi Dark Ultra 😈
┃
╠═══〔 📖 *CARA MAIN* 〕═══╣
┃  1. Pilih jalur Hero atau Villain
┃  2. Gunakan ${prefix}lanjutultra untuk spawn Kaiju
┃  3. ${prefix}serang → Lawan Kaiju
┃  4. ${prefix}abaikan → Kabur (kena denda!)
┃
╠═══〔 💊 *ITEM* 〕═══╣
┃  🔵 Plasma Spark — Rp 50.000
┃  ╰ Beli: ${prefix}buy plasmaspark
┃
╚════════════════════════════╝`)
      }
      const typeData = ULTRAMAN_TYPES[uData.type]
      const kaijuInfo = uData.activeKaiju
        ? `\n┃  👾 Kaiju Aktif: *${uData.activeKaiju.name}*\n┃  ╰ Gunakan ${prefix}serang atau ${prefix}abaikan`
        : `\n┃  ✅ Tidak ada Kaiju. Gunakan ${prefix}lanjutultra`
      return replyalya(
`╔═══〔 ${typeData.color} *STATUS ULTRAMAN* 〕═══╗
┃
┃  🦸 Form: *${uData.form}*
┃  ${typeData.label} — ${typeData.title}
┃
┃  ❤️ HP: ${hp}/100
┃  [${formatHPBar(hp)}]
┃
┃  ⭐ Total Kemenangan: ${uData.wins || 0}
┃  💀 Total Kekalahan: ${uData.losses || 0}
┃  🗡️ Kaiju Dikalahkan: ${uData.kills || 0}
┃  ${kaijuInfo}
┃
╠═══〔 ⚡ *SERANGAN* 〕═══╣
┃  ${typeData.attackMoves.slice(0, 3).join('\n┃  ')}
┃
╠═══〔 🛒 *ITEM* 〕═══╣
┃  🔵 Plasma Spark: ${uData.plasmaSpark || 0}x
┃  ╰ ${prefix}useplasmaspark untuk heal +25 HP
┃
╚════════════════════════════╝`)
    }

    // ── .hero ────────────────────────────────────────────────────
    if (sub === 'hero') {
      const existing = getUltraData(sender)
      if (existing) return replyalya(`❌ Kamu sudah terdaftar sebagai *${existing.form}*!\nGunakan ${prefix}ultraman untuk cek statusmu.`)
      const u = global.db?.users?.[sender]
      if (!u) return replyalya('❌ Daftarkan diri dulu sebelum bermain!')
      if (u.health === undefined) u.health = 100
      const form = getRandomForm('hero')
      setUltraData(sender, { type: 'hero', form, wins: 0, losses: 0, kills: 0, activeKaiju: null, plasmaSpark: 0, joinedAt: Date.now() })
      return replyUltraImg(getUltraImg(form),
`╔═══〔 ✨ *KAMU ADALAH ULTRAMAN!* 〕═══╗
┃
┃  🌟 Form: *${form}*
┃  ❤️ HP Awal: 100/100  [██████████]
┃
┃  ${prefix}lanjutultra — Panggil Kaiju
┃  ${prefix}serang — Serang Kaiju
┃  ${prefix}abaikan — Kabur (kena denda!)
┃  ${prefix}useplasmaspark — Heal +25 HP
┃
╚════════════════════════════════╝
Gunakan *${prefix}lanjutultra* untuk mulai!`)
    }

    // ── .villain ─────────────────────────────────────────────────
    if (sub === 'villain') {
      const existing = getUltraData(sender)
      if (existing) return replyalya(`❌ Kamu sudah terdaftar sebagai *${existing.form}*!\nGunakan ${prefix}ultraman untuk cek statusmu.`)
      const u = global.db?.users?.[sender]
      if (!u) return replyalya('❌ Daftarkan diri dulu sebelum bermain!')
      if (u.health === undefined) u.health = 100
      const form = getRandomForm('villain')
      setUltraData(sender, { type: 'villain', form, wins: 0, losses: 0, kills: 0, activeKaiju: null, plasmaSpark: 0, joinedAt: Date.now() })
      return replyUltraImg(getUltraImg(form),
`╔═══〔 😈 *KAMU ADALAH DARK ULTRA!* 〕═══╗
┃
┃  🖤 Form: *${form}*
┃  ❤️ HP Awal: 100/100  [██████████]
┃
┃  ${prefix}lanjutultra — Panggil Kaiju
┃  ${prefix}serang — Serang Kaiju
┃  ${prefix}abaikan — Kabur (kena denda!)
┃  ${prefix}useplasmaspark — Heal +25 HP
┃
╚══════════════════════════════════╝
Gunakan *${prefix}lanjutultra* untuk mulai!`)
    }

    // ── .lanjutultra ─────────────────────────────────────────────
    if (sub === 'lanjutultra') {
      const uData = getUltraData(sender)
      if (!uData) return replyalya(`❌ Kamu belum terdaftar!\nGunakan ${prefix}hero atau ${prefix}villain untuk memulai.`)
      const u = global.db?.users?.[sender] || {}
      const hp = u.health ?? 100
      if (hp < 10) return replyalya(
`⚠️ *KONDISI KRITIS — ISTIRAHAT DULU!*
❤️ HP kamu hanya *${hp}/100*
╠ Cara pulihkan HP:
┃  ${prefix}useplasmaspark → +25 HP
┃  ${prefix}buy plasmaspark → Beli Rp 50.000`)
      if (uData.activeKaiju) return replyalya(`⚠️ Masih ada Kaiju aktif: *${uData.activeKaiju.name}*!\nSelesaikan dulu dengan ${prefix}serang atau ${prefix}abaikan.`)
      const kaiju = getRandomKaiju()
      const typeData = ULTRAMAN_TYPES[uData.type]
      const color = uData.type === 'hero' ? '🔵' : '🔴'
      uData.activeKaiju = kaiju
      setUltraData(sender, uData)
      const munculTexts = ['Alarm di seluruh kota berbunyi keras!','Tanah bergetar... sesuatu yang besar mendekat!','Radar Science Patrol mendeteksi ancaman!','Langit menjadi gelap dan awan berkumpul!','Monster Alert Level RED telah diaktifkan!']
      const munculText = munculTexts[Math.floor(Math.random() * munculTexts.length)]
      return replyalya(
`╔═══〔 🚨 *KAIJU MUNCUL!* 〕═══╗
┃  ${munculText}
┃
┃  ${kaiju.emoji} *${kaiju.name.toUpperCase()}*
┃  ╰ Kekuatan: ${kaiju.power}
┃  ╰ Bahaya: ⭐⭐⭐ Tinggi
┃
╠═══〔 ${color} *${uData.form}* 〕═══╣
┃  ❤️ HP Kamu: ${hp}/100  [${formatHPBar(hp)}]
┃
╠═══〔 ⚔️ *PILIH AKSIMU!* 〕═══╣
┃  ⚡ *${prefix}serang* — Lawan ${kaiju.name}!
┃  🏃 *${prefix}abaikan* — Kabur (DENDA Rp 20jt!)
┃
╚════════════════════════════╝`)
    }

    // ── .serang ──────────────────────────────────────────────────
    if (sub === 'serang') {
      const uData = getUltraData(sender)
      if (!uData) return replyalya(`❌ Kamu belum terdaftar!\nGunakan ${prefix}hero atau ${prefix}villain untuk memulai.`)
      if (!uData.activeKaiju) return replyalya(`Tidak ada Kaiju saat ini!\nGunakan *${prefix}lanjutultra* untuk memanggil Kaiju.`)
      const u = global.db?.users?.[sender] || {}
      const hp = u.health ?? 100
      if (hp < 10) return replyalya(`⚠️ *HP KRITIS — TIDAK BISA BERTARUNG!*\nIstirahat dulu!\n╰ Gunakan ${prefix}useplasmaspark`)
      const kaiju = uData.activeKaiju
      const typeData = ULTRAMAN_TYPES[uData.type]
      const attack = getRandomAttack(uData.type)
      const isWin = Math.random() < 0.85
      const dmgReceived = isWin ? Math.floor(Math.random() * 16) + 10 : Math.floor(Math.random() * 16) + 30
      const newHp = Math.max(0, hp - dmgReceived)
      u.health = newHp
      const color = uData.type === 'hero' ? '✨' : '😈'
      if (isWin) {
        const rewardMultiplier = uData.type === 'villain' ? 0.8 : 1
        const rewardMoney = Math.floor(kaiju.reward * rewardMultiplier)
        const rewardLimit = Math.floor(rewardMoney / 15000)
        const rewardExp = Math.floor(rewardMoney / 5000)
        u.money = (u.money || 0) + rewardMoney
        u.exp = (u.exp || 0) + rewardExp
        u.limit = (u.limit || 0) + rewardLimit
        uData.wins = (uData.wins || 0) + 1
        uData.kills = (uData.kills || 0) + 1
        uData.activeKaiju = null
        setUltraData(sender, uData)
        const flavors = uData.type === 'hero'
          ? ['Sinar raksasa menerobos awan gelap!','Energi cahaya meledak dari kedua tanganmu!','Color Timer berkedip — serangan terakhir dilepaskan!']
          : ['Kegelapan melumat sang Kaiju!','Dark energy membungkus korbanmu!','Tawa jahat menggema saat Kaiju jatuh!']
        const flavor = flavors[Math.floor(Math.random() * flavors.length)]
        return replyalya(
`╔═══〔 ${color} *KEMENANGAN!* 〕═══╗
┃  ${flavor}
┃
┃  🗡️ Serangan: *${attack}*
┃  ${kaiju.emoji} *${kaiju.name}* → 💥 DIKALAHKAN!
┃
╠═══〔 🏆 *REWARD* 〕═══╣
┃  💰 Money: +Rp ${rewardMoney.toLocaleString()}
┃  📊 Exp: +${rewardExp}
┃  💳 Limit: +${rewardLimit}
┃
╠═══〔 ❤️ *STATUS* 〕═══╣
┃  HP: ${newHp}/100  [${formatHPBar(newHp)}]  (-${dmgReceived} HP)
┃  ${newHp < 10 ? '⚠️ HP KRITIS!' : newHp < 30 ? '⚠️ HP rendah' : '✅ Kondisi baik'}
┃  ⭐ Total Kill: ${uData.kills}
┃
┃  ${prefix}lanjutultra — Panggil kaiju baru
╚════════════════════════════╝`)
      } else {
        uData.losses = (uData.losses || 0) + 1
        setUltraData(sender, uData)
        const flavors = uData.type === 'hero'
          ? ['Kamu terpental jauh... kekuatanmu belum cukup!',`${kaiju.name} memantulkan seranganmu!`,'Color Timer merah berkedip kencang!']
          : ['Bahkan kegelapanmu tidak cukup!',`${kaiju.name} menolak dikuasai!`,'Monster itu ternyata lebih kuat!']
        const flavor = flavors[Math.floor(Math.random() * flavors.length)]
        return replyalya(
`╔═══〔 💥 *SERANGAN GAGAL!* 〕═══╗
┃  ${flavor}
┃
┃  🗡️ Serangan: *${attack}*
┃  ${kaiju.emoji} *${kaiju.name}* masih bertahan!
┃
╠═══〔 ❤️ *STATUS* 〕═══╣
┃  HP: ${newHp}/100  [${formatHPBar(newHp)}]  (-${dmgReceived} HP)
┃  ${newHp < 10 ? '⚠️ HP KRITIS! Gunakan Plasma Spark!' : ''}
┃
┃  ${prefix}serang — Coba lagi!
┃  ${prefix}useplasmaspark — Heal dulu
╚════════════════════════════╝`)
      }
    }

    // ── .abaikan ─────────────────────────────────────────────────
    if (sub === 'abaikan') {
      const uData = getUltraData(sender)
      if (!uData) return replyalya(`❌ Kamu belum terdaftar!\nGunakan ${prefix}hero atau ${prefix}villain untuk memulai.`)
      if (!uData.activeKaiju) return replyalya(`Tidak ada Kaiju aktif!\nGunakan *${prefix}lanjutultra* untuk memanggil Kaiju.`)
      const kaiju = uData.activeKaiju
      const u = global.db?.users?.[sender] || {}
      const DENDA = 20000000
      const userMoney = u.money || 0
      const actualDenda = Math.min(DENDA, userMoney)
      u.money = Math.max(0, userMoney - actualDenda)
      const hpLoss = Math.floor(Math.random() * 15) + 15
      const newHp = Math.max(0, (u.health ?? 100) - hpLoss)
      u.health = newHp
      uData.losses = (uData.losses || 0) + 1
      uData.activeKaiju = null
      setUltraData(sender, uData)
      return replyalya(
`╔═══〔 😱 *KAMU MENGABAIKAN KAIJU!* 〕═══╗
┃  ${kaiju.emoji} *${kaiju.name}* mengamuk tanpa hambatan!
┃  Kota hancur... rakyat menangis...
┃
╠═══〔 💸 *HUKUMAN DOSA* 〕═══╣
┃  🔴 Denda: -Rp ${actualDenda.toLocaleString()}
┃  💰 Sisa Uang: Rp ${u.money.toLocaleString()}
┃
╠═══〔 ❤️ *STATUS* 〕═══╣
┃  HP: ${newHp}/100 (-${hpLoss} HP)  [${formatHPBar(newHp)}]
┃  ${newHp < 10 ? '⚠️ HP KRITIS! Istirahat dulu!' : ''}
┃
┃  ${prefix}lanjutultra — Tebus dosamu!
╚════════════════════════════════╝`)
    }

    // ── .useplasmaspark ──────────────────────────────────────────
    if (sub === 'useplasmaspark') {
      const uData = getUltraData(sender)

      // FIX: Tampilkan pesan "terintegrasi dengan Ultraman Plugins" jika belum daftar
      if (!uData) {
        return replyalya(
`╔═══〔 🔵 *PLASMA SPARK* 〕═══╗
┃
┃  ⚡ Ini fitur terintegrasi dengan
┃     *Ultraman Plugins* !
┃
┃  Untuk menggunakan Plasma Spark,
┃  kamu harus bergabung dulu ke
┃  game Ultraman.
┃
╠═══〔 📋 *CARA DAFTAR* 〕═══╣
┃  ✨ ${prefix}hero   → Jadi Ultraman cahaya
┃  😈 ${prefix}villain → Jadi Dark Ultra
┃
╠═══〔 🛒 *CARA BELI* 〕═══╣
┃  ${prefix}buy plasmaspark
┃  💰 Harga: Rp 50.000 / buah
┃
╚════════════════════════════╝`)
      }

      const u = global.db?.users?.[sender] || {}
      const stock = uData.plasmaSpark || 0
      if (stock < 1) return replyalya(
`╔═══〔 🔵 *PLASMA SPARK* 〕═══╗
┃
┃  ❌ *Plasma Spark Habis!*
┃  Kamu tidak punya stok.
┃
┃  ⚡ Ini fitur terintegrasi dengan
┃     *Ultraman Plugins* !
┃
╠═══〔 🛒 *BELI SEKARANG* 〕═══╣
┃  ${prefix}buy plasmaspark
┃  💰 Harga: Rp 50.000 per buah
┃
╚════════════════════════════╝`)
      const hp = u.health ?? 100
      if (hp >= 100) return replyalya(`✅ HP kamu sudah penuh (${hp}/100)!\nPlasma Spark tidak digunakan.`)
      const newHp = Math.min(100, hp + 25)
      u.health = newHp
      uData.plasmaSpark -= 1
      setUltraData(sender, uData)
      return replyalya(
`╔═══〔 🔵 *PLASMA SPARK AKTIF!* 〕═══╗
┃
┃  ⚡ Ini fitur terintegrasi dengan
┃     *Ultraman Plugins* !
┃
┃  ❤️ HP: ${hp} → *${newHp}/100* (+25)
┃  [${formatHPBar(newHp)}]
┃  🔵 Sisa Plasma Spark: ${uData.plasmaSpark}x
┃
╚════════════════════════════╝`)
    }

    // ── .ultramanreset ───────────────────────────────────────────
    if (sub === 'ultramanreset') {
      const uData = getUltraData(sender)
      if (!uData) return replyalya('Kamu belum punya data Ultraman untuk di-reset.')
      const db2 = loadUltramanDB()
      delete db2[sender]
      saveUltramanDB(db2)
      return replyalya(`✅ Data Ultraman kamu telah di-reset!\nGunakan ${prefix}hero atau ${prefix}villain untuk mulai baru.`)
    }
  }
}
