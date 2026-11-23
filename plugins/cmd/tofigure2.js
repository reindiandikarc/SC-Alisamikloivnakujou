// Plugin: tofigure2
// Commands: tofigure2
// AI Keychain Figure via CreateImg (V12 native)

module.exports = {
  command: ['tofigure2'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, pushname, replyalya } = ctx
    const fs   = require('fs')
    const path = require('path')
    const CreateImg = require('../../lib/createimg')

    const COST_EDIT = 3
    const userId = m.sender

    if (!global.editImageProcess) global.editImageProcess = {}
    if (global.editImageProcess[userId]) {
      return replyalya(`⏳ *SEDANG DIPROSES*\n\n👤 User : ${pushname}\n🚫 Tidak bisa menjalankan proses bersamaan.\n📦 Tunggu sampai selesai.`)
    }
    global.editImageProcess[userId] = true

    try {
      if (!global.db.users[userId]) global.db.users[userId] = { limit: 0 }
      let userData = global.db.users[userId]

      if (userData.limit < COST_EDIT) {
        return replyalya(`❌ *Limit tidak mencukupi!*\n\n🎫 Limit kamu : ${userData.limit}\n🖼️ Biaya : ${COST_EDIT}\n\n💡 Silakan beli limit dulu.`)
      }
      if (!m.quoted) {
        return replyalya(`🖼️ *Balas gambar yang ingin dijadikan keychain figure*\n\nContoh:\nReply gambar lalu ketik:\n*${prefix + command}*`)
      }
      let mime = m.quoted.mimetype || ""
      if (!/image\/(jpe?g|png)/.test(mime)) {
        return replyalya(`❌ *Format tidak didukung!*\n\n📄 Format yang didukung:\n• JPG\n• PNG`)
      }

      await replyalya(`⏳ *Memproses Figure...*\n\n👤 User : ${pushname}\n🧠 AI Engine : Alya figurine tools\n🎫 Biaya : ${COST_EDIT} Limit\n📤 Status : Rendering ...`)

      const imgBuffer = await m.quoted.download()
      const tmpDir = './tmp'
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
      const tmpPath = path.join(tmpDir, `tofigure2-${Date.now()}.jpg`)
      fs.writeFileSync(tmpPath, imgBuffer)

      const FIXED_PROMPT = `Ultra-realistic product photography, soft studio lighting with a glossy sheen. A collectible miniature keychain, with the character's face and pose based on the illustration provided. Not a photo of a real person, but a premium action-figure style toy. Designed with stylized proportions and sculpted details, made from 3D printed plastic or PVC vinyl. The surface is smoothly painted, there are visible molding seam lines, sculpted hair, simplified facial features, and clothing folds that look like they came from a factory. The figure has a glossy and matte paint finish. The keychain strap is color-coordinated with the figure's theme, adorned with simple motifs and bold text like a brand name or a cool phrase. A real human hand gently pinches the keychain, captured in sharp focus. The background is a softly blurred interior of a mall with cinematic bokeh, highlighting the charm of this miniature collectible toy. The name "${pushname}" is on the keychain.`

      const ai = new CreateImg()
      const resultUrl = await ai.edit(FIXED_PROMPT, tmpPath)
      fs.unlinkSync(tmpPath)

      await alya.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `🔑 *TOFIGURE2 BERHASIL!* 🔑\n\n👤 Request By : ${pushname}\n🧸 Mode : Ultra Realistic Keychain Figure\n🎫 Limit Terpakai : ${COST_EDIT}\n🎟️ Sisa Limit : ${userData.limit - COST_EDIT}\n\n━━━━━━━━━━━━━━━━━━\n🚀 Powered By Alya V12\n━━━━━━━━━━━━━━━━━━`
      }, { quoted: m })

      userData.limit -= COST_EDIT
      global.db.users[userId] = userData

    } catch (err) {
      console.error(err)
      replyalya(`❌ *PROSES TOFIGURE2 GAGAL*\n\n👤 Request By : ${pushname}\n\n⚠️ Limit tidak dikurangi.\n🔧 Kemungkinan:\n• Engine error\n• File corrupt\n• API bermasalah`)
    } finally {
      delete global.editImageProcess[userId]
    }
  }
}
