// Plugin: delprem
// Fix: update runtime prem array + tulis premium.json
// Commands: delprem

module.exports = {
  command: ["delprem"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      reply, replyalya, replytolak,
      fs, mess,
      prem  // reference ke array prem dari alya.js (module scope)
    } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner!')
    if (!args[0]) return replyalya(`Use ${prefix + command} nomor\nExample ${prefix + command} 6283166570663`)

    let nomor = q.split('|')[0].replace(/[^0-9]/g, '')
    // Konversi 08xxx → 628xxx
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1)
    let ya = nomor + '@s.whatsapp.net'

    let unp = prem.indexOf(ya)
    if (unp === -1) return replyalya(`Nomor ${nomor} tidak ada di daftar premium!`)

    // Splice array RUNTIME (reference asli dari alya.js module scope)
    prem.splice(unp, 1)
    // Tulis ke file agar persist setelah restart
    fs.writeFileSync('./database/premium.json', JSON.stringify(prem))

    replyalya(`✅ Nomor *${nomor}* berhasil dihapus dari Premium!\n\n📋 Sisa premium: *${prem.length}*`)
  }
}
