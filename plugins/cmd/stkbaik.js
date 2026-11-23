// Plugin: stkbaik
// Migrated from Alya V10 → V13 Plugin Architecture
// Commands: stkbaik

module.exports = {
  command: ["stkbaik"],
  tags: ['general'],
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

    await generateAndSendCertificate(alya, m, pushname, 'Anda dinyatakan Baik!')
  }
}

async function generateAndSendCertificate(alya, m, recipientName, achievementText) {
  try {
    const { createCanvas, loadImage } = require('canvas')
    const width = 1000, height = 700
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    try {
      const bg = await loadImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXesWUGxIerARGsveu1mOdGdXM0icRcBLtSA-L5UNSdUaRjEYRez9ngnc&s=10')
      ctx.drawImage(bg, 0, 0, width, height)
    } catch (_) { ctx.fillStyle = '#f8f8f8'; ctx.fillRect(0, 0, width, height) }
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, 'rgba(255,255,255,0.3)'); grad.addColorStop(1, 'rgba(255,255,255,0.7)')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)
    ctx.lineWidth = 8
    const bgrad = ctx.createLinearGradient(0, 0, width, height)
    bgrad.addColorStop(0, '#ff7f50'); bgrad.addColorStop(1, '#ff1493'); ctx.strokeStyle = bgrad
    ctx.beginPath(); ctx.roundRect(10, 10, width - 20, height - 20, 30); ctx.stroke()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2
    ctx.fillStyle = '#333'; ctx.font = 'bold 50px Georgia'; ctx.textAlign = 'center'
    ctx.fillText('SERTIFIKAT SIFAT', width / 2, 120); ctx.shadowColor = 'transparent'
    ctx.font = 'italic 30px Georgia'; ctx.fillStyle = '#555'; ctx.fillText('Presented To', width / 2, 180)
    ctx.font = 'bold 40px Georgia'; ctx.fillStyle = '#000'; ctx.fillText(recipientName, width / 2, 260)
    ctx.font = '30px Georgia'; ctx.fillStyle = '#333'; ctx.fillText(achievementText, width / 2, 330)
    ctx.strokeStyle = '#ff1493'; ctx.lineWidth = 3; ctx.beginPath()
    ctx.moveTo(width / 4, 360); ctx.lineTo(width * 3 / 4, 360); ctx.stroke()
    ctx.font = '20px Georgia'; ctx.textAlign = 'right'; ctx.fillStyle = '#000'
    ctx.fillText('Tanggal: ' + new Date().toLocaleDateString('id-ID'), width - 40, height - 40)
    ctx.font = '24px Georgia'; ctx.textAlign = 'left'; ctx.fillText('Alya chan - Offc', 50, height - 50)
    const buffer = canvas.toBuffer('image/png')
    await alya.sendMessage(m.chat, {
      image: buffer,
      caption: `_Sukses Membuat Sertifikat dengan Nama ${recipientName}_`
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    await alya.sendMessage(m.chat, { text: '❌ Gagal membuat sertifikat: ' + e.message }, { quoted: m })
  }
}
