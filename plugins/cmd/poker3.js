// Plugin: poker3
// Commands: poker3, p3
// Ported from Alya V10 → V13
// FIX: file lama rusak total — sama persis seperti hilo.js (case di luar
// switch, sintaks `global.(...)` invalid, switch tanpa case, module.exports
// tidak tertutup). Logic permainan (evaluasi kartu 3-card poker) asli
// dipertahankan, hanya struktur plugin-nya yang ditulis ulang.
'use strict'

class Deck {
  constructor() {
    this.deck = []
    const suits = ['♣️', '♦️', '♠️', '♥️']
    const values = [
      { n: '2', v: 2 }, { n: '3', v: 3 }, { n: '4', v: 4 }, { n: '5', v: 5 }, { n: '6', v: 6 }, { n: '7', v: 7 },
      { n: '8', v: 8 }, { n: '9', v: 9 }, { n: '10', v: 10 }, { n: 'J', v: 11 }, { n: 'Q', v: 12 }, { n: 'K', v: 13 }, { n: 'A', v: 14 }
    ]
    for (const s of suits) for (const v of values) this.deck.push({ name: `${v.n}${s}`, value: v.v, suit: s })
  }
  shuffleDeck(n) { for (let i = 0; i < n; i++) this.deck.sort(() => Math.random() - 0.5) }
  dealCard(num) { return this.deck.splice(0, num) }
}

class Poker3 {
  constructor(totalWins = 0) {
    this.player = []
    this.dealer = []
    this.table = { bet: 0, payout: 0, rank: '', dRank: '' }
    this.cards = new Deck()
    this.nerf = Math.min(totalWins * 2, 150)
  }

  start(bet) {
    this.table.bet = bet
    this.cards.shuffleDeck(5)
    this.player = this.cards.dealCard(3)
    this.dealer = this.cards.dealCard(3)
    return this.evaluate()
  }

  evaluate() {
    const pScore = this.getHandValue(this.player)
    const dScore = this.getHandValue(this.dealer)
    this.table.rank = pScore.rankName
    this.table.dRank = dScore.rankName

    const adjustedPlayerValue = pScore.value - this.nerf

    if (adjustedPlayerValue > dScore.value) {
      let multiplier = 2
      if (pScore.rankName === 'Straight Flush') multiplier = 50
      if (pScore.rankName === 'Three of a Kind') multiplier = 35
      if (pScore.rankName === 'Straight') multiplier = 8
      if (pScore.rankName === 'Flush') multiplier = 5

      this.table.payout = Math.floor(this.table.bet * multiplier)
      this.state = 'win'
    } else if (adjustedPlayerValue < dScore.value) {
      this.table.payout = 0
      this.state = 'lose'
    } else {
      this.table.payout = this.table.bet
      this.state = 'draw'
    }
    return this.table
  }

  getHandValue(cards) {
    cards.sort((a, b) => b.value - a.value)
    const v = cards.map(c => c.value)
    const s = cards.map(c => c.suit)
    const isFlush = s[0] === s[1] && s[1] === s[2]
    const isStraight = (v[0] - v[1] === 1 && v[1] - v[2] === 1) || (v[0] === 14 && v[1] === 3 && v[2] === 2)
    const isThree = v[0] === v[1] && v[1] === v[2]
    const isPair = v[0] === v[1] || v[1] === v[2] || v[0] === v[2]

    if (isStraight && isFlush) return { value: 800 + v[0], rankName: 'Straight Flush' }
    if (isThree) return { value: 700 + v[0], rankName: 'Three of a Kind' }
    if (isStraight) return { value: 600 + v[0], rankName: 'Straight' }
    if (isFlush) return { value: 500 + v[0], rankName: 'Flush' }
    if (isPair) {
      const pairVal = (v[0] === v[1]) ? v[0] : (v[1] === v[2] ? v[1] : v[0])
      return { value: 400 + pairVal, rankName: 'Pair' }
    }
    return { value: v[0], rankName: 'High Card' }
  }
}

const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

const getTitle = (wins) => {
  if (wins > 100) return '🎰 God of Gamblers'
  if (wins > 50) return '🦈 Card Shark'
  if (wins > 20) return '🎩 Professional'
  return '🃏 Casual Player'
}

module.exports = {
  command: ['poker3', 'p3'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, reply, replyalya } = ctx

    global.db.users[m.sender] ??= {}
    const user = global.db.users[m.sender]
    user.money ??= 0
    if (user.poker3TotalWins === undefined) user.poker3TotalWins = 0

    const nominal = args[0]
    const bet = parseInt(nominal, 10)

    if (!bet) {
      return replyalya(
        `🃏 *POKER3 (3-Card Poker)*\n\n` +
        `Cara main:\n• \`${prefix}poker3 <taruhan>\` — Mulai game\n\n` +
        `🏆 *${getTitle(user.poker3TotalWins)}*\n` +
        `💰 Saldo: *${formatter.format(user.money)}*\n` +
        `🎯 Total Wins: *${user.poker3TotalWins}*`
      )
    }
    if (bet < 100) return reply('*Minimal bet adalah Rp100!*')
    if (user.money < bet) return reply('*Uang kamu tidak cukup untuk taruhan ini!*')

    user.money -= bet
    const game = new Poker3(user.poker3TotalWins)
    const res = game.start(bet)

    const { key } = await alya.sendMessage(m.chat, { text: '🃏 *Dealer sedang mengocok kartu...*' }, { quoted: m })
    await new Promise(r => setTimeout(r, 1500))

    await alya.sendMessage(m.chat, { text: '🎴 *Membagikan kartumu...*', edit: key })
    await new Promise(r => setTimeout(r, 1500))

    const displayHand = game.player.map(c => c.name).join(' ')
    const header = `*${getTitle(user.poker3TotalWins)}*\n\`👤 Player:\` [ ${displayHand} ]\n\`Rank:\` _${res.rank}_\n\n`

    await alya.sendMessage(m.chat, { text: header + '🎴 *Dealer sedang membuka kartu...*', edit: key })
    await new Promise(r => setTimeout(r, 1500))

    let status = '', emoj = ''
    if (game.state === 'win') {
      status = 'MENANG'; emoj = '🎉'
      user.poker3TotalWins += 1
    } else if (game.state === 'lose') {
      status = 'KALAH'; emoj = '💀'
    } else {
      status = 'DRAW'; emoj = '🤝'
    }

    user.money += res.payout

    const finalTex = `*${getTitle(user.poker3TotalWins)}*

╭───┈ • 👤 *KARTUMU*
│ [ ${displayHand} ]
│ *Rank:* \`${res.rank}\`
╰───┈ •

╭───┈ • 🤖 *KARTU DEALER*
│ [ ${game.dealer.map(c => c.name).join(' ')} ]
│ *Rank:* \`${res.dRank}\`
╰───┈ •

> ${emoj} *HASIL:* **${status}**
> 💰 *Payout:* **${formatter.format(res.payout)}**
${game.nerf > 0 ? `> ⚠️ *Difficulty:* \`+${game.nerf} pts for Dealer\`` : ''}

*Sisa Saldo:* ${formatter.format(user.money)}
*Total Wins:* ${user.poker3TotalWins}`

    await alya.sendMessage(m.chat, { text: finalTex, edit: key })
  }
}
