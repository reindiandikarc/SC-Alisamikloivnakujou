// Plugin: blackjack
// Dibuat baru untuk Alya V13
// Commands: blackjack

const path = require('path')

module.exports = {
  command: ["blackjack", "bj"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    const delay = (ms) => new Promise(res => setTimeout(res, ms))

    // Deck & card helpers
    const SUITS = ['♠️', '♥️', '♦️', '♣️']
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    const createDeck = () => {
      let deck = []
      for (let s of SUITS) for (let r of RANKS) deck.push({ suit: s, rank: r })
      return deck.sort(() => Math.random() - 0.5)
    }

    const cardValue = (rank) => {
      if (['J', 'Q', 'K'].includes(rank)) return 10
      if (rank === 'A') return 11
      return parseInt(rank)
    }

    const handTotal = (hand) => {
      let total = hand.reduce((s, c) => s + cardValue(c.rank), 0)
      let aces = hand.filter(c => c.rank === 'A').length
      while (total > 21 && aces > 0) { total -= 10; aces-- }
      return total
    }

    const handStr = (hand) => hand.map(c => `${c.rank}${c.suit}`).join(' ')

    // Game state stored on alya object
    alya.bjGames = alya.bjGames || {}

    const userAlt = global.db.users[m.sender]
    if (!userAlt) return replyalya('❌ Data user tidak ditemukan. Daftar dulu!')
    userAlt.money ??= 0

    const COOLDOWN = 30 * 1000 // 30 detik cooldown antar game
    const sub = args[0]?.toLowerCase()

    // Sub-command: hit / ambil
    if (sub === 'hit' || sub === 'ambil') {
      const game = alya.bjGames[m.sender]
      if (!game) return replyalya(`❌ Kamu tidak sedang main blackjack. Ketik *${prefix}blackjack <taruhan>* untuk mulai!`)

      const deck = game.deck
      game.player.push(deck.pop())
      const total = handTotal(game.player)

      if (total > 21) {
        delete alya.bjGames[m.sender]
        return replyalya(`🃏 Kartu kamu: ${handStr(game.player)}\n💥 *BUST!* Total: ${total}\n\n💸 Kamu kalah Rp. ${game.bet.toLocaleString()}\n💰 Sisa money: ${userAlt.money.toLocaleString()}`)
      }

      return replyalya(`🃏 Kartu kamu: ${handStr(game.player)} (Total: ${total})\n🃏 Kartu dealer: ${game.dealer[0].rank}${game.dealer[0].suit} | 🂠\n\n➤ *${prefix}blackjack hit* — Ambil kartu\n➤ *${prefix}blackjack stand* — Berhenti`)
    }

    // Sub-command: stand / berhenti
    if (sub === 'stand' || sub === 'stop' || sub === 'berhenti') {
      const game = alya.bjGames[m.sender]
      if (!game) return replyalya(`❌ Kamu tidak sedang main blackjack. Ketik *${prefix}blackjack <taruhan>* untuk mulai!`)

      const deck = game.deck
      // Dealer draws until 17
      while (handTotal(game.dealer) < 17) game.dealer.push(deck.pop())

      const playerTotal = handTotal(game.player)
      const dealerTotal = handTotal(game.dealer)

      let result = ''
      if (dealerTotal > 21) {
        userAlt.money += game.bet
        result = `🎉 *DEALER BUST!* Dealer total: ${dealerTotal}\n\n✅ Kamu MENANG!\n💰 +Rp. ${game.bet.toLocaleString()}`
      } else if (playerTotal > dealerTotal) {
        userAlt.money += game.bet
        result = `🏆 *MENANG!* Kamu: ${playerTotal} vs Dealer: ${dealerTotal}\n\n💰 +Rp. ${game.bet.toLocaleString()}`
      } else if (playerTotal < dealerTotal) {
        result = `💀 *KALAH!* Kamu: ${playerTotal} vs Dealer: ${dealerTotal}\n\n💸 -Rp. ${game.bet.toLocaleString()}`
      } else {
        userAlt.money += game.bet
        result = `🤝 *DRAW!* Kamu: ${playerTotal} vs Dealer: ${dealerTotal}\n\nTaruhan dikembalikan.`
      }

      delete alya.bjGames[m.sender]
      return replyalya(`🃏 Kartu kamu: ${handStr(game.player)} (Total: ${playerTotal})\n🃏 Kartu dealer: ${handStr(game.dealer)} (Total: ${dealerTotal})\n\n${result}\n\n💰 Money kamu: ${userAlt.money.toLocaleString()}`)
    }

    // Start new game
    if (!sub || isNaN(parseInt(sub))) {
      return replyalya(`🃏 *BLACKJACK*\n\nCara main:\n• *${prefix}blackjack <taruhan>* — Mulai game baru\n• *${prefix}blackjack hit* — Ambil kartu lagi\n• *${prefix}blackjack stand* — Berhenti & lihat hasil\n\nTarget: dapat kartu lebih tinggi dari dealer tanpa melebihi 21!\n\n💰 Money kamu: ${userAlt.money.toLocaleString()}`)
    }

    // Start game with bet
    if (alya.bjGames[m.sender]) return replyalya(`⚠️ Kamu masih ada game yang berjalan!\nKetik *${prefix}blackjack hit* atau *${prefix}blackjack stand*`)

    const bet = parseInt(sub)
    if (!bet || bet < 1000) return replyalya('❌ Minimal taruhan Rp. 1.000')
    if (bet > userAlt.money) return replyalya(`💸 Money tidak cukup! Kamu punya: Rp. ${userAlt.money.toLocaleString()}`)

    userAlt.money -= bet

    const deck = createDeck()
    const playerHand = [deck.pop(), deck.pop()]
    const dealerHand = [deck.pop(), deck.pop()]

    alya.bjGames[m.sender] = {
      deck,
      player: playerHand,
      dealer: dealerHand,
      bet
    }

    const playerTotal = handTotal(playerHand)

    // Blackjack on deal!
    if (playerTotal === 21) {
      const dealerTotal = handTotal(dealerHand)
      const prize = Math.floor(bet * 1.5)
      userAlt.money += bet + prize
      delete alya.bjGames[m.sender]
      return replyalya(`🃏 Kartu kamu: ${handStr(playerHand)} (Total: 21)\n🃏 Kartu dealer: ${handStr(dealerHand)} (Total: ${dealerTotal})\n\n🎰 *BLACKJACK! MENANG INSTAN!*\n💰 +Rp. ${prize.toLocaleString()} (1.5x)\n💰 Money kamu: ${userAlt.money.toLocaleString()}`)
    }

    return replyalya(`🃏 *BLACKJACK DIMULAI!*\n\n🃏 Kartu kamu: ${handStr(playerHand)} (Total: ${playerTotal})\n🃏 Kartu dealer: ${dealerHand[0].rank}${dealerHand[0].suit} | 🂠\n\n💰 Taruhan: Rp. ${bet.toLocaleString()}\n\n➤ *${prefix}blackjack hit* — Ambil kartu lagi\n➤ *${prefix}blackjack stand* — Berhenti`)
  }
}
