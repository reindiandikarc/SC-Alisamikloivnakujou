// Plugin: fakedana
// Commands: fakedana
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['fakedana'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!text) {
        return replyalya(`💳 *FAKE DANA MAKER*

Contoh:
${prefix + command} 1000000`)
    }

    await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    const fs = require('fs')
    const path = require('path')
    const axios = require('axios')

    let skia
    try {
        skia = require('skia-canvas')
    } catch {
        await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        return replyalya("❌ Install dulu: npm install skia-canvas")
    }

    const { Canvas, loadImage, FontLibrary } = skia

    const fontDir = path.resolve(process.cwd(), 'lib')
    if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true })

    const fontPath = path.join(fontDir, 'DanaFont.otf')

    try {
        if (!fs.existsSync(fontPath)) {
            let f = await axios.get('https://s.id/tvNgt', { responseType: 'arraybuffer' })
            fs.writeFileSync(fontPath, Buffer.from(f.data))
        }
        FontLibrary.use('DanaFont', fontPath)
    } catch {
        return replyalya('❌ Gagal load font!')
    }

    try {
        let angkaRaw = text.replace(/[^0-9]/g, '')
        if (!angkaRaw) return replyalya('❌ Nominal tidak valid!')

        let angka = Number(angkaRaw).toLocaleString('id-ID')

        const bgUrl = 'https://raw.githubusercontent.com/uploader762/dat3/main/uploads/9c18e0-1772932032348.jpg'
        const logoUrl = 'https://raw.githubusercontent.com/uploader762/dat3/main/uploads/d0f081-1772929197100.png'

        const bg = await loadImage(bgUrl)
        const logo = await loadImage(logoUrl)

        const canvas = new Canvas(bg.width, bg.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(bg, 0, 0)

        ctx.font = '205px DanaFont'
        ctx.fillStyle = '#ffffff'
        ctx.textBaseline = 'top'

        const x = 664
        const y = 293

        ctx.fillText(angka, x, y)

        const textWidth = ctx.measureText(angka).width
        const logoSize = 370

        ctx.drawImage(
            logo,
            x + textWidth + 11,
            y - 31,
            logoSize,
            logoSize
        )

        const buffer = await canvas.png

        const tanggal = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

        await alya.sendMessage(m.chat, {
            image: buffer,
            caption: `💳 *FAKE DANA*

💰 Nominal : Rp ${angka}
✅ Status  : Sukses
📅 Tanggal : ${tanggal}`
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

    } catch (e) {
        console.error(e)
        await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        replyalya(`❌ Error:\n${e.message}`)
    }
  }
};
