// Plugin: bomb
// Commands: bomb, jinakkan
// Subcommand: .bomb start | .bomb potong <nomor>
// Ported from Alya V10 → V13
//
// ⚠️ FIX: file lama rusak total — sama pola dengan hilo.js/poker3.js/rr.js/
// battle.js (sintaks `global.(...)` invalid, switch tanpa case label).
// DITAMBAH bug yang lebih parah: teks instruksi menyebut
// `${prefix+command} potong <nomor>` tapi action "potong" TIDAK PERNAH
// diimplementasikan sama sekali di kode lama — game ini tidak pernah bisa
// benar-benar dimainkan sampai sekarang.
'use strict'

class BombGame {
  constructor() {
    this.colors = ['🔴 Merah', '🔵 Biru', '🟡 Kuning', '🟢 Hijau', '⚪ Putih']
    this.bombKabel = ''
    this.cutCards = []
    this.state = 'playing'
    this.totalSafeNeeded = 4
  }

  start() {
    const randomIndex = Math.floor(Math.random() * this.colors.length)
    this.bombKabel = this.colors[randomIndex]
    return this.colors
  }

  cut(choice) {
    const chosenColor = this.colors[choice - 1]
    if (!chosenColor) throw new Error('Nomor kabel tidak valid! Pilih 1-5.')
    if (this.cutCards.includes(chosenColor)) {
      throw new Error('Kabel ini sudah dipotong sebelumnya!')
    }
    if (chosenColor === this.bombKabel) {
      this.state = 'exploded'
      return { success: false, color: chosenColor }
    }
    this.cutCards.push(chosenColor)
    if (this.cutCards.length === this.totalSafeNeeded) {
      this.state = 'defused'
    }
    return { success: true, color: chosenColor }
  }
}

const REWARD = 150000

module.exports = {
  command: ['bomb', 'jinakkan'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya } = ctx

    alya.bomb = alya.bomb || {}
    global.db.users[m.sender] ??= {}
    const user = global.db.users[m.sender]
    user.money ??= 0

    const aksi = (args[0] || '').toLowerCase()
    const game = alya.bomb[m.chat]

    try {
      if (aksi === 'start') {
        if (game) return replyalya(`*Bom masih aktif!* Gunakan \`${prefix + command} potong <nomor>\`.`)

        alya.bomb[m.chat] = new BombGame()
        alya.bomb[m.chat].idPemain = m.sender
        const kabelList = alya.bomb[m.chat].start()

        const menuKabel = kabelList.map((c, i) => `${i + 1}. ${c}`).join('\n')

        return replyalya(`*\`💣 • MISI PENJINAK BOM •\`*

Ada 5 kabel, tapi hanya *SATU* yang merupakan pemicu bom.
Untuk menjinakkan bom ini, kamu harus memotong *SEMUA KABEL AMAN* (4 kabel).

*Daftar Kabel:*
${menuKabel}

Ketik: *\`${prefix + command} potong <nomor>\`*
*Progress:* [ 0 / 4 ]`)
      }

      if (aksi === 'potong') {
        if (!game || game.idPemain !== m.sender) {
          return replyalya(`❌ Tidak ada bom aktif untukmu. Mulai dengan \`${prefix + command} start\``)
        }

        const nomor = parseInt(args[1], 10)
        if (!nomor || nomor < 1 || nomor > 5) {
          return replyalya('❌ Pilih nomor kabel 1-5.')
        }

        let result
        try {
          result = game.cut(nomor)
        } catch (e) {
          return replyalya(`❌ ${e.message}`)
        }

        if (!result.success) {
          delete alya.bomb[m.chat]
          return replyalya(`💥 *BOOOM!*\n\nKabel ${result.color} adalah pemicunya! Bom meledak...\n\nMisi gagal. Coba lagi dengan \`${prefix + command} start\``)
        }

        if (game.state === 'defused') {
          user.money += REWARD
          delete alya.bomb[m.chat]
          return replyalya(`✅ *BOM BERHASIL DIJINAKKAN!*\n\nKabel ${result.color} aman. Semua kabel aman sudah dipotong!\n\n💰 Reward: Rp${REWARD.toLocaleString('id-ID')}`)
        }

        return replyalya(`✂️ *Kabel ${result.color} aman!*\n\n*Progress:* [ ${game.cutCards.length} / ${game.totalSafeNeeded} ]\nLanjut potong kabel lain dengan \`${prefix + command} potong <nomor>\``)
      }

      return replyalya(
        `💣 *MISI PENJINAK BOM*\n\n` +
        `Cara main:\n` +
        `• \`${prefix + command} start\` — Mulai misi\n` +
        `• \`${prefix + command} potong <nomor>\` — Potong kabel`
      )
    } catch (e) {
      console.error('[bomb] error:', e?.message || e)
      return replyalya(`❌ Terjadi kesalahan.\n_${e?.message || ''}_`)
    }
  }
}
