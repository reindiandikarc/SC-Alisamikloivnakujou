// Plugin: tofigure4
// Commands: tofigure4
// AI Figurine 1/7 Scale via CreateImg (V12 native)

module.exports = {
  command: ['tofigure4'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, pushname, replyalya } = ctx
    const fs   = require('fs')
    const path = require('path')
    const CreateImg = require('../../lib/createimg')

    const COST_EDIT = 3
    const userId = m.sender
    const FIXED_PROMPT = `Create a 1/7 scale commercialized figurine of (the character in the picture). Realistic style, in a real environment. Figurine placed on a computer desk. Has a round transparent acrylic base. Next to the desk is the real person in the picture, in real size with the same attire as in the picture and the figurine, cleaning the figurine carefully with a fine brush. In a modern styled studio room, brightly lit. With some collection of toys and action figures in the background.`

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
        return replyalya(`🖼️ *Balas gambar yang ingin dijadikan figurine*\n\nContoh:\nReply gambar lalu ketik:\n*${prefix + command}*`)
      }
      let mime = m.quoted.mimetype || ""
      if (!/image\/(jpe?g|png)/.test(mime)) {
        return replyalya(`❌ *Format tidak didukung!*\n\n📄 Format yang didukung:\n• JPG\n• PNG`)
      }

      await replyalya(`⏳ *Memproses Mode Figurine 1/7 Scale...*\n\n👤 User : ${pushname}\n🧠 AI Engine : Alya Figurine Studio\n🎫 Biaya : ${COST_EDIT} Limit\n📤 Status : Rendering...`)

      const imgBuffer = await m.quoted.download()
      const tmpDir = './tmp'
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
      const tmpPath = path.join(tmpDir, `figure4-${Date.now()}.jpg`)
      fs.writeFileSync(tmpPath, imgBuffer)

      const ai = new CreateImg()
      const resultUrl = await ai.edit(FIXED_PROMPT, tmpPath)
      fs.unlinkSync(tmpPath)

      await alya.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `🧸 *FIGURINE 1/7 SCALE BERHASIL!* 🧸\n\n👤 Request By : ${pushname}\n🛠️ Mode : Commercial Figurine Studio\n🎫 Limit Terpakai : ${COST_EDIT}\n🎟️ Sisa Limit : ${userData.limit - COST_EDIT}\n\n━━━━━━━━━━━━━━━━━━\n🚀 Powered By Alya V12\n━━━━━━━━━━━━━━━━━━`
      }, { quoted: m })

      userData.limit -= COST_EDIT
      global.db.users[userId] = userData

    } catch (err) {
      console.error(err)
      replyalya(`❌ *PROSES FIGURINE GAGAL*\n\n👤 Request By : ${pushname}\n\n⚠️ Limit tidak dikurangi.\n🔧 Kemungkinan:\n• Engine error\n• File corrupt\n• API bermasalah`)
    } finally {
      delete global.editImageProcess[userId]
    }
  }
}
