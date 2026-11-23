// Plugin: addprem
// Fix: konversi nomor, pakai JID dari WA, push ke runtime + tulis file
// Commands: addprem

module.exports = {
  command: ['addprem'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      Ryuu,
      replyalya, replytolak,
      fs, mess,
      prem  // reference ke array prem dari alya.js module scope
    } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || 'Hanya owner!')
    if (!args[0]) return replyalya(`Use ${prefix + command} nomor\nExample ${prefix + command} 6283166570663`)

    let nomor = q.split('|')[0].replace(/[^0-9]/g, '')
    // Konversi 08xxx → 628xxx
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1)

    let prrkek = nomor + '@s.whatsapp.net'

    // Validasi nomor terdaftar di WA
    let ceknya
    try { ceknya = await alya.onWhatsApp(prrkek) } catch (_) {}
    if (!ceknya || ceknya.length === 0) return replyalya('Masukkan nomor yang valid dan terdaftar di WhatsApp!!!')

    // Gunakan JID resmi dari WA (normalized), fallback ke prrkek
    const jid = (ceknya[0]?.jid) || prrkek

    if (prem.includes(jid)) return replyalya(`Nomor ${nomor} sudah premium!`)

    // Push ke runtime array (reference asli dari alya.js)
    prem.push(jid)
    // Tulis ke file agar persist setelah restart
    fs.writeFileSync('./database/premium.json', JSON.stringify(prem))

    replyalya(`✅ Nomor *${nomor}* berhasil ditambahkan sebagai Premium!\n\n📋 Total premium: *${prem.length}*`)
  }
}
