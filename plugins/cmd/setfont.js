// Plugin: setfont
// Command: .setfont [nama_font | list | reset]
// Owner only — mengatur style font Unicode untuk semua balasan bot

const { FONTS, setCurrentFont, getCurrentFont, applyFont } = require('../../lib/fontStyle')

module.exports = {
  command: ['setfont'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      reply, replyalya, replytolak,
    } = ctx

    // ── Hanya owner ──────────────────────────────────────────────────────
    if (!Ryuu) return replytolak(`❌ Fitur ini hanya untuk *Owner* bot.`)

    const input = (text || '').trim().toLowerCase()

    // ── Tampilkan daftar font ────────────────────────────────────────────
    if (!input || input === 'list' || input === 'daftar') {
      const currentFont = getCurrentFont()

      let msg = `🎨 *Daftar Style Font Bot*\n`
      msg += `┌─────────────────────────────\n`

      const entries = Object.entries(FONTS)
      for (const [key, info] of entries) {
        const active = key === currentFont ? ' ✅ *aktif*' : ''
        msg += `│ • \`${key}\`${active}\n`
        msg += `│   ${info.label}\n`
        msg += `│   Preview: ${info.preview}\n`
        msg += `│\n`
      }

      msg += `└─────────────────────────────\n`
      msg += `📝 *Cara pakai:*\n`
      msg += `${prefix}${command} <nama_font>\n`
      msg += `Contoh: \`${prefix}${command} bold\`\n\n`
      msg += `💡 Sekarang aktif: *${currentFont}*`

      return replyalya(msg)
    }

    // ── Reset ke default ─────────────────────────────────────────────────
    if (input === 'reset' || input === 'default' || input === 'normal') {
      const ok = setCurrentFont('default')
      if (!ok) return replyalya(`❌ Gagal mereset font.`)
      return replyalya(
        `✅ Font berhasil direset ke *default* (teks normal).\n` +
        `Semua balasan bot sekarang pakai gaya biasa.`
      )
    }

    // ── Set font baru ────────────────────────────────────────────────────
    if (!FONTS[input]) {
      const validList = Object.keys(FONTS).join(', ')
      return replyalya(
        `❌ Font *"${input}"* tidak ditemukan.\n\n` +
        `Font yang tersedia:\n${validList}\n\n` +
        `Gunakan \`${prefix}${command} list\` untuk lihat preview.`
      )
    }

    const ok = setCurrentFont(input)
    if (!ok) return replyalya(`❌ Gagal menyimpan setting font. Cek permission database/.`)

    // Preview dengan font baru
    const sampleText = `Halo! Ini adalah preview font ${input}. Alya siap melayani!`
    const preview    = applyFont(sampleText, input)
    const fontInfo   = FONTS[input]

    return replyalya(
      `✅ Font bot berhasil diubah ke *${input}*!\n\n` +
      `Nama style: ${fontInfo.label}\n\n` +
      `📝 Preview:\n${preview}\n\n` +
      `Semua balasan bot sekarang pakai font ini. 🎉`
    )
  }
}
