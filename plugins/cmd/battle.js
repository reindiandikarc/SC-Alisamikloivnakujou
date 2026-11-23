// Plugin: battle
// Commands: battle, lawan
// Subcommand: .battle start | .battle attack | .battle skill | .battle defend | .battle ult
// Ported from Alya V10 → V13
//
// ⚠️ FIX: file lama rusak total — sama pola dengan hilo.js/poker3.js/rr.js
// (sintaks `global.(...)` invalid). DITAMBAH bug yang lebih parah di sini:
// `switch (aksi) { if (...) {...} }` TIDAK PUNYA case label sama sekali,
// jadi action attack/skill/defend/ult yang disebut di teks instruksi TIDAK
// PERNAH benar-benar tertangani — hanya kode "start" yang kebetulan jalan
// (karena switch tanpa match jatuh tembus ke blok pertama). Game battle ini
// sebenarnya tidak pernah benar-benar bisa dimainkan sampai sekarang.
'use strict'

class BattleGame {
  constructor(bet, pName) {
    this.bet = bet
    this.playerName = pName
    this.player = {
      hp: 200, maxHp: 200, mana: 100, maxMana: 100,
      atk: 25, def: 12, crit: 0.2,
      stance: 'Neutral',
      ultGauge: 0
    }
    this.enemy = {
      name: 'Aetherion: God of Ruin',
      hp: 600, maxHp: 600, atk: 30, def: 18,
      berserk: false,
      shield: 0
    }
    this.turn = 1
    this.idPemain = null
  }

  getBar(current, max, length = 10, color = '■') {
    const fill = Math.max(0, Math.ceil((current / max) * length))
    return `[${color.repeat(fill)}${'□'.repeat(length - fill)}]`
  }

  getRandomEvent() {
    const events = [
      { msg: '🌌 Dimensi Retak! Serangan meningkat!', effect: () => { this.player.atk += 10 } },
      { msg: '✨ Partikel Mana meluap! Mana pulih.', effect: () => { this.player.mana += 25 } },
      { msg: '🌪️ Badai Kosmis! Akurasi musuh menurun.', effect: () => { this.enemy.atk -= 5 } },
      { msg: '🌑 Gerhana Darah! HP terkuras pelan.', effect: () => { this.player.hp -= 10 } },
      { msg: '⚡ Arus Listrik! Critical Chance melonjak!', effect: () => { this.player.crit += 0.2 } }
    ]
    if (Math.random() > 0.65) {
      const ev = events[Math.floor(Math.random() * events.length)]
      ev.effect()
      return `\n🌟 *EVENT:* ${ev.msg}`
    }
    return ''
  }

  getEnemyMove() {
    let msg = ''
    let dmg = this.enemy.atk

    if (this.enemy.hp < 200 && !this.enemy.berserk) {
      this.enemy.berserk = true
      this.enemy.atk += 25
      msg = '💢 *PHASE 2: ENRAGED!* Aura merah menyelimuti Boss!'
    }

    const rand = Math.random()
    if (rand > 0.8) {
      dmg *= 3
      msg = '🔱 *JUDGMENT RAY!* Serangan laser penghancur dunia!'
    } else if (rand > 0.5) {
      this.enemy.shield = 60
      msg = '🛡️ *DIVINE BARRIER!* Boss menciptakan perisai cahaya.'
    } else {
      msg = '⚔️ Boss menghantamkan pedang kehampaan.'
    }

    const finalDmg = Math.max(8, Math.floor(dmg - (this.player.stance === 'Defensive' ? this.player.def * 3 : this.player.def)))
    this.player.hp -= finalDmg
    return { msg, finalDmg }
  }

  executeAction(type) {
    let pMsg = ''
    let pDmg = 0
    const eventMsg = this.getRandomEvent()

    if (type === 'attack') {
      this.player.stance = 'Offensive'
      pDmg = Math.floor(Math.random() * 15) + this.player.atk
      if (Math.random() < this.player.crit) {
        pDmg = Math.floor(pDmg * 2.5)
        pMsg = '🔥 *CRITICAL SMASH!* Seranganmu menembus dimensi!'
      } else {
        pMsg = '⚔️ Kamu menyerang dengan tebasan cepat.'
      }
      this.player.ultGauge = Math.min(100, this.player.ultGauge + 20)
    } else if (type === 'skill') {
      if (this.player.mana < 35) return 'NOMANA'
      this.player.stance = 'Neutral'
      pDmg = 75 + Math.floor(Math.random() * 30)
      this.player.mana -= 35
      this.player.ultGauge = Math.min(100, this.player.ultGauge + 30)
      pMsg = '💠 *VOID BURST!* Ledakan energi biru menghantam musuh.'
    } else if (type === 'defend') {
      this.player.stance = 'Defensive'
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + 30)
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40)
      pMsg = '🛡️ *ABSOLUTE GUARD!* Memulihkan luka dan fokus.'
      pDmg = 0
    } else if (type === 'ult') {
      if (this.player.ultGauge < 100) return 'NOULT'
      pDmg = 200 + Math.floor(Math.random() * 50)
      this.player.ultGauge = 0
      this.player.stance = 'Neutral'
      pMsg = '🌌 *FINAL ART: ETERNITY SLAYER!* Cahaya putih menelan segalanya!'
    }

    if (this.enemy.shield > 0 && pDmg > 0) {
      const shieldHit = Math.min(this.enemy.shield, pDmg)
      this.enemy.shield -= shieldHit
      pDmg -= shieldHit
      pMsg += ` (Shield -${shieldHit})`
    }

    this.enemy.hp -= pDmg
    const eMove = this.getEnemyMove()
    this.turn++

    return { pMsg, pDmg, eMove, eventMsg }
  }
}

const fmt = (v) => 'Rp' + v.toLocaleString('id-ID')

module.exports = {
  command: ['battle', 'batte', 'lawan'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya } = ctx

    alya.battle = alya.battle || {}
    global.db.users[m.sender] ??= {}
    const user = global.db.users[m.sender]
    user.money ??= 0

    const aksi = (args[0] || '').toLowerCase()
    const game = alya.battle[m.chat]

    try {
      if (aksi === 'start') {
        if (game) return replyalya('Pertempuran masih berlangsung di sini!')
        const price = 100000
        if (user.money < price) return replyalya(`Modal minim dilarang masuk! Butuh ${fmt(price)}.`)

        user.money -= price
        alya.battle[m.chat] = new BattleGame(price, m.pushName)
        alya.battle[m.chat].idPemain = m.sender

        return replyalya(`*── 「 🔱 DIVINE RAID: AETHERION 🔱 」 ──*

Dewa Kehampaan telah menantangmu. Apakah duniamu akan berakhir hari ini?

*【 STATUS PENANTANG 】*
👤 Nama: ${m.pushName}
❤️ HP: 200 | ✨ Mana: 100
⚔️ Taruhan: ${fmt(price)}

*【 PERINTAH BERTEMPUR 】*
👉 \`${prefix + command} attack\` - Serang & Isi Ult
👉 \`${prefix + command} skill\` - Magic Damage (Mana -35)
👉 \`${prefix + command} defend\` - Heal HP/Mana & Tanking
👉 \`${prefix + command} ult\` - Jurus Pamungkas (Cek Gauge)`)
      }

      if (['attack', 'skill', 'defend', 'ult'].includes(aksi)) {
        if (!game || game.idPemain !== m.sender) {
          return replyalya(`❌ Tidak ada battle aktif untukmu. Mulai dengan \`${prefix + command} start\``)
        }

        const result = game.executeAction(aksi)

        if (result === 'NOMANA') return replyalya('❌ Mana tidak cukup untuk Skill! (Butuh 35)')
        if (result === 'NOULT') return replyalya(`❌ Ultimate Gauge belum penuh! (${game.player.ultGauge}/100)`)

        const { pMsg, pDmg, eMove, eventMsg } = result

        // Cek kemenangan/kekalahan
        if (game.enemy.hp <= 0) {
          const reward = game.bet * 3
          user.money += reward
          delete alya.battle[m.chat]
          return replyalya(`🏆 *VICTORY!*\n\n${pMsg}\nKamu menjatuhkan ${game.enemy.name}!\n\n💰 Reward: ${fmt(reward)}`)
        }
        if (game.player.hp <= 0) {
          delete alya.battle[m.chat]
          return replyalya(`💀 *DEFEAT...*\n\n${eMove.msg}\nKamu kalah dan kehilangan ${fmt(game.bet)}.`)
        }

        const playerBar = game.getBar(game.player.hp, game.player.maxHp)
        const enemyBar = game.getBar(game.enemy.hp, game.enemy.maxHp)

        return replyalya(
          `*── Turn ${game.turn} ──*\n\n` +
          `${pMsg}\n` +
          (pDmg > 0 ? `💥 Damage: ${pDmg}\n` : '') +
          `${eMove.msg}\n💥 Damage diterima: ${eMove.finalDmg}` +
          `${eventMsg}\n\n` +
          `👤 ${game.playerName}\n${playerBar} ${game.player.hp}/${game.player.maxHp} HP\n\n` +
          `👾 ${game.enemy.name}\n${enemyBar} ${game.enemy.hp}/${game.enemy.maxHp} HP\n\n` +
          `✨ Ult Gauge: ${game.player.ultGauge}/100`
        )
      }

      return replyalya(
        `🔱 *DIVINE RAID: AETHERION*\n\n` +
        `Cara main:\n` +
        `• \`${prefix + command} start\` — Mulai battle (Rp100.000)\n` +
        `• \`${prefix + command} attack\` — Serang\n` +
        `• \`${prefix + command} skill\` — Magic damage\n` +
        `• \`${prefix + command} defend\` — Heal & tanking\n` +
        `• \`${prefix + command} ult\` — Jurus pamungkas`
      )
    } catch (e) {
      console.error('[battle] error:', e?.message || e)
      return replyalya(`❌ Terjadi kesalahan di battle.\n_${e?.message || ''}_`)
    }
  }
}
