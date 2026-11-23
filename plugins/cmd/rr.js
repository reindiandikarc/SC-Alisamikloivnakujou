// Plugin: rr (Russian Roulette)
// Commands: roulette, rr
// Subcommand: .rr join <bet> | .rr fire | .rr claim
// Ported from Alya V10 → V13
// FIX: file lama rusak total — sama persis seperti hilo.js/poker3.js (case
// di luar switch, sintaks `global.(...)` invalid, switch tanpa case,
// module.exports tidak tertutup).
//
// FIX TAMBAHAN — bug arsitektur registry: versi lama mendaftarkan "join",
// "fire", "claim" sebagai COMMAND TERPISAH di cmd_registry.json. Padahal
// "join" sudah dipakai plugin join.js (owner/group rental) dan "claim"
// sudah dipakai repair.js (AI). Akibatnya .join dan .claim yang disebut di
// teks instruksi roulette ini sebenarnya memicu plugin LAIN, bukan
// roulette — fitur tidak pernah benar-benar berfungsi sesuai teksnya.
// Sekarang "join"/"fire"/"claim" jadi SUBCOMMAND di bawah .rr / .roulette
// saja (.rr join 5000, .rr fire, .rr claim), tidak lagi mendaftar command
// global terpisah, sehingga tidak menimpa plugin lain.
'use strict'

const fmt = (v) => 'Rp' + v.toLocaleString('id-ID')

module.exports = {
  command: ['roulette', 'rr'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, args, replyalya } = ctx

    alya.rr = alya.rr || {}
    global.db.users[m.sender] ??= {}
    const user = global.db.users[m.sender]
    user.money ??= 0
    if (user.rrStreak === undefined) user.rrStreak = 0

    const aksi = (args[0] || '').toLowerCase()
    const bet = args[1]

    if (!aksi || !['join', 'fire', 'claim'].includes(aksi)) {
      return replyalya(
        `🔫 *RUSSIAN ROULETTE*\n\n` +
        `Cara main:\n` +
        `• \`${prefix}rr join <taruhan>\` — Mulai game\n` +
        `• \`${prefix}rr fire\` — Tarik pelatuk\n` +
        `• \`${prefix}rr claim\` — Ambil kemenangan & berhenti\n\n` +
        `💰 Saldo kamu: *${fmt(user.money)}*`
      )
    }

    // ── JOIN: mulai game baru ──
    if (aksi === 'join') {
      if (alya.rr[m.chat]) return replyalya('Permainan sedang berlangsung! Tunggu sampai peluru ditembakkan.')

      const amount = parseInt(bet, 10)
      if (!amount || amount < 1000) return replyalya(`❌ Masukkan jumlah taruhan! Contoh: \`${prefix}rr join 5000\``)
      if (user.money < amount) return replyalya('❌ Uang kamu tidak cukup untuk taruhan ini.')

      user.money -= amount

      const cylinder = [false, false, false, false, false, false]
      const dangerZone = Math.random() * 100
      let bulletIndex

      if (user.rrStreak > 0 && dangerZone < (user.rrStreak * 15)) {
        bulletIndex = Math.floor(Math.random() * 2)
      } else {
        bulletIndex = Math.floor(Math.random() * 6)
      }
      cylinder[bulletIndex] = true

      if (amount >= 50000 && Math.random() < 0.25) {
        const secondBullet = (bulletIndex + 1) % 6
        cylinder[secondBullet] = true
      }

      alya.rr[m.chat] = {
        player: m.sender,
        pName: m.pushName,
        bet: amount,
        cylinder,
        step: 0
      }

      return replyalya(
        `*── 「 🔫 RUSSIAN ROULETTE 」 ──*\n\n` +
        `👤 *Pemain:* ${m.pushName}\n` +
        `💰 *Taruhan:* ${fmt(amount)}\n` +
        `🔫 *Silinder:* [ ● ● ● ● ● ● ]\n\n` +
        `Ketik \`${prefix}rr fire\` untuk menarik pelatuk!`
      )
    }

    // ── FIRE: tarik pelatuk ──
    if (aksi === 'fire') {
      const game = alya.rr[m.chat]
      if (!game || game.player !== m.sender) return replyalya('Bukan giliranmu atau tidak ada game aktif!')

      const isBullet = game.cylinder[game.step]
      const visualCylinder = game.cylinder.map((_, i) => i <= game.step ? '○' : '●').join(' ')

      if (isBullet) {
        user.rrStreak = 0
        await replyalya(`🔫 *[ ${visualCylinder} ]*`)
        await replyalya(`*BOOM!* 💥\n\nOtak ${game.pName} berceceran... Kamu kalah dan kehilangan ${fmt(game.bet)}`)
        delete alya.rr[m.chat]
        return
      }

      game.step++
      if (game.step < 5) {
        const bonus = game.step > 3 ? 0.2 : 0.3
        const multiplier = 1 + (game.step * bonus)
        const currentWin = Math.floor(game.bet * multiplier)

        const txt = `*── 「 CLICK! 」 ──*\n\n` +
          `💨 Kamu selamat! (Sisa slot: ${6 - game.step})\n` +
          `💰 Win saat ini: *${fmt(currentWin)}*\n\n` +
          `Pilih:\n` +
          `1. \`${prefix}rr fire\` (Lanjut)\n` +
          `2. \`${prefix}rr claim\` (Ambil uang & berhenti)`
        return replyalya(`🔫 *[ ${visualCylinder} ]*\n\n${txt}`)
      }

      // Berhasil kosongkan seluruh silinder tanpa kena peluru → jackpot otomatis
      const jackpot = (game.bet * 10) + 10000
      user.money += jackpot
      user.rrStreak++
      await replyalya(`🎊 *Kamu mengosongkan silinder! Jackpot: ${fmt(jackpot)}*`)
      delete alya.rr[m.chat]
      return
    }

    // ── CLAIM: ambil kemenangan saat ini & berhenti (sebelum silinder kosong) ──
    if (aksi === 'claim') {
      const game = alya.rr[m.chat]
      if (!game || game.player !== m.sender) return replyalya('Tidak ada game aktif untuk diambil.')
      if (game.step === 0) return replyalya(`Belum ada kemenangan untuk diambil — tarik pelatuk dulu dengan \`${prefix}rr fire\`.`)

      const bonus = game.step > 3 ? 0.2 : 0.3
      const multiplier = 1 + (game.step * bonus)
      const winAmount = Math.floor(game.bet * multiplier)

      user.money += winAmount
      user.rrStreak++
      delete alya.rr[m.chat]

      return replyalya(
        `💰 *CLAIM BERHASIL!*\n\n` +
        `💨 Slot aman: *${game.step}*\n` +
        `💵 Kemenangan: *${fmt(winAmount)}*\n` +
        `💰 Saldo sekarang: *${fmt(user.money)}*`
      )
    }
  }
}
