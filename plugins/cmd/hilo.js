// Plugin: hilo
// Commands: hilo, highlow
// Ported from Alya V10 → V13
// FIX: file lama rusak total — `case` di luar `switch`, sintaks
// `global.(...)` invalid, switch tanpa case, module.exports tidak tertutup,
// dan tidak ada handler untuk tebak high/low. Ditulis ulang dari nol.
'use strict'

class Deck {
  constructor() {
    this.deck = []
    const suits = ['♣️', '♦️', '♠️', '♥️']
    const values = [
      { n: '2', v: 2 }, { n: '3', v: 3 }, { n: '4', v: 4 }, { n: '5', v: 5 }, { n: '6', v: 6 }, { n: '7', v: 7 },
      { n: '8', v: 8 }, { n: '9', v: 9 }, { n: '10', v: 10 }, { n: 'J', v: 11 }, { n: 'Q', v: 12 }, { n: 'K', v: 13 }, { n: 'A', v: 14 }
    ]
    for (const s of suits) {
      for (const v of values) {
        this.deck.push({ name: `${v.n}${s}`, value: v.v })
      }
    }
  }
  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }
  pop() { return this.deck.pop() }
}

class HiLo {
  constructor(bet, sender) {
    this.idPemain = sender
    this.bet = bet
    this.multiplier = 1.0
    this.streak = 0
    this.deck = new Deck()
    this.deck.shuffle()
    this.currentCard = this.deck.pop()
    this.nextCard = this.deck.pop()
  }

  guess(choice) {
    const isCorrect = (choice === 'high' && this.nextCard.value >= this.currentCard.value) ||
                       (choice === 'low' && this.nextCard.value <= this.currentCard.value)

    const playedCard = this.nextCard
    if (isCorrect) {
      this.streak++
      this.multiplier += 0.25 * this.streak
      this.currentCard = this.nextCard
      this.nextCard = this.deck.pop()
      return { status: true, card: playedCard }
    }
    return { status: false, card: playedCard }
  }
}

const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

module.exports = {
  command: ['hilo', 'highlow'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, reply, replyalya } = ctx

    alya.hilo = alya.hilo || {}
    const aksi = (args[0] || '').toLowerCase()
    const arg2 = args[1]

    global.db.users[m.sender] ??= {}
    const user = global.db.users[m.sender]
    user.money ??= 0

    const existing = alya.hilo[m.chat]

    // ── Tebak (high/low) — hanya valid kalau ada game berjalan untuk sender ini ──
    if (aksi === 'high' || aksi === 'low') {
      if (!existing || existing.idPemain !== m.sender) {
        return reply(`❌ Tidak ada game Hi-Lo yang sedang kamu mainkan di chat ini.\n\nMulai dengan: \`${prefix}hilo <taruhan>\``)
      }

      const result = existing.guess(aksi)

      if (result.status) {
        const potensiMenang = Math.floor(existing.bet * existing.multiplier)
        return replyalya(
          `📈 *BENAR!* Kartu: **[ ${result.card.name} ]**\n\n` +
          `🔥 Streak: *${existing.streak}x*\n` +
          `✨ Multiplier: *${existing.multiplier.toFixed(2)}x*\n` +
          `💰 Potensi menang: *${formatter.format(potensiMenang)}*\n\n` +
          `🃏 Kartu sekarang: **[ ${existing.currentCard.name} ]**\n` +
          `Lanjut tebak atau ambil kemenangan:\n` +
          `- \`${prefix + command} high\`\n` +
          `- \`${prefix + command} low\`\n` +
          `- \`${prefix + command} cashout\` _(ambil kemenangan & berhenti)_`
        )
      }

      // Kalah — game berakhir, taruhan hilang
      delete alya.hilo[m.chat]
      return replyalya(
        `📉 *SALAH!* Kartu: **[ ${result.card.name} ]**\n\n` +
        `💸 Kamu kalah taruhan: *${formatter.format(existing.bet)}*\n` +
        `💰 Sisa saldo: *${formatter.format(user.money)}*`
      )
    }

    // ── Cashout — ambil kemenangan sesuai multiplier saat ini ──
    if (aksi === 'cashout') {
      if (!existing || existing.idPemain !== m.sender) {
        return reply(`❌ Tidak ada game Hi-Lo yang sedang berjalan untuk diambil.`)
      }
      const menang = Math.floor(existing.bet * existing.multiplier)
      user.money += menang
      delete alya.hilo[m.chat]
      return replyalya(
        `💰 *CASHOUT BERHASIL!*\n\n` +
        `🔥 Streak akhir: *${existing.streak}x*\n` +
        `✨ Multiplier: *${existing.multiplier.toFixed(2)}x*\n` +
        `💵 Kemenangan: *${formatter.format(menang)}*\n` +
        `💰 Saldo sekarang: *${formatter.format(user.money)}*`
      )
    }

    // ── Mulai game baru ──
    const betArg = aksi
    if (existing) {
      return reply(
        `*Game sedang berjalan!* Selesaikan sesi yang ada:\n` +
        `- \`${prefix + command} high\`\n- \`${prefix + command} low\`\n- \`${prefix + command} cashout\``
      )
    }

    if (!betArg) {
      return replyalya(
        `📈 *HI-LO*\n\n` +
        `Cara main:\n` +
        `• \`${prefix}hilo <taruhan>\` — Mulai game\n` +
        `• \`${prefix}hilo high\` — Tebak kartu berikutnya lebih tinggi\n` +
        `• \`${prefix}hilo low\` — Tebak kartu berikutnya lebih rendah\n` +
        `• \`${prefix}hilo cashout\` — Ambil kemenangan & berhenti\n\n` +
        `💰 Saldo kamu: *${formatter.format(user.money)}*`
      )
    }

    const bet = parseInt(betArg, 10)
    if (!bet || bet < 100) return reply('*Minimal taruhan adalah Rp100!*')
    if (user.money < bet) return reply(`*Saldo tidak cukup!* Saldo kamu: ${formatter.format(user.money)}`)

    user.money -= bet
    const game = new HiLo(bet, m.sender)
    alya.hilo[m.chat] = game

    await replyalya(
      `📈 *HI-LO START*\n\n` +
      `🃏 Kartu saat ini: **[ ${game.currentCard.name} ]**\n` +
      `💰 Taruhan: *${formatter.format(bet)}*\n\n` +
      `Tebak apakah kartu berikutnya lebih *Tinggi* atau *Rendah*?\n` +
      `- \`${prefix + command} high\` (>=)\n` +
      `- \`${prefix + command} low\` (<=)`
    )
  }
}
