// Plugin: sendupgc / sendstatus
// Fix: handle command dari upswgc button, decode content, kirim ke grup
// Commands: sendupgc, sendstatus, sendstatusall

const { fromBuffer } = require('file-type')
const fs = require('fs')

module.exports = {
  command: ['sendupgc', 'sendstatus', 'sendstatusall'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      Ryuu, isPrem, pler, mess,
      replyalya, replytolak
    } = ctx

    if (!Ryuu && !isPrem) return replytolak(mess?.only?.owner || '❌ Khusus Owner/Premium!')

    // sendstatusall: kirim ke semua grup
    if (command === 'sendstatusall') {
      const [encodedContent] = args
      if (!encodedContent) return replyalya('❌ Konten tidak ditemukan.')

      let contentDecoded
      try { contentDecoded = JSON.parse(decodeURIComponent(encodedContent)) }
      catch (e) { return replyalya('❌ Gagal decode konten: ' + e.message) }

      let getGroups = await alya.groupFetchAllParticipating()
      let groups = Object.values(getGroups)
      if (groups.length === 0) return replyalya('❌ Bot tidak ada di grup manapun.')

      let berhasil = 0, gagal = 0
      for (let group of groups) {
        try {
          await kirimKeGrup(alya, group.id, contentDecoded)
          berhasil++
        } catch { gagal++ }
        await new Promise(r => setTimeout(r, 500))
      }

      bersihkanFile(contentDecoded)
      return replyalya(`✅ Selesai broadcast!\n\n✔️ Berhasil: ${berhasil}\n❌ Gagal: ${gagal}`)
    }

    // sendstatus / sendupgc: kirim ke 1 grup
    const [groupId, ...contentARR] = args
    if (!groupId) return replyalya('❌ ID grup tidak ditemukan.')
    if (!contentARR.length) return replyalya('❌ Konten kosong.')

    let contentDecoded
    try { contentDecoded = JSON.parse(decodeURIComponent(contentARR.join(' '))) }
    catch (e) { return replyalya('❌ Gagal decode konten: ' + e.message) }

    // Cek denda jika premium kirim ke grup tidak terdaftar
    if (!Ryuu && isPrem && !pler.includes(groupId)) {
      const DENDA = 50000
      const userData = global.db?.users?.[m.sender]
      if (userData) {
        const limitNow = userData.limit || 0
        if (limitNow >= DENDA) userData.limit -= DENDA
      }
      bersihkanFile(contentDecoded)
      return replyalya(`⛔ *DENDA DIJATUHKAN!*\n\nKamu broadcast ke grup tidak terdaftar!\n💸 *-50.000 Limit dipotong!*\n🛑 Broadcast dibatalkan.`)
    }

    try {
      await kirimKeGrup(alya, groupId, contentDecoded)
      alya.sendMessage(m.chat, { text: `✅ Berhasil kirim ke:\n${groupId}` }, { quoted: m })
    } catch (e) {
      alya.sendMessage(m.chat, { text: `❌ Gagal kirim ke:\n${groupId}\n${e.message}` }, { quoted: m })
    } finally {
      bersihkanFile(contentDecoded)
    }
  }
}

async function kirimKeGrup(alya, groupId, content) {
  const sendOpts = { contextInfo: {} }
  if (content.image?.url) {
    await alya.sendMessage(groupId, { image: { url: content.image.url }, caption: content.caption || '', ...sendOpts })
  } else if (content.video?.url) {
    await alya.sendMessage(groupId, { video: { url: content.video.url }, caption: content.caption || '', ...sendOpts })
  } else if (content.audio?.url) {
    const audioBuffer = fs.readFileSync(content.audio.url)
    const ftype = await fromBuffer(audioBuffer)
    await alya.sendMessage(groupId, { audio: audioBuffer, mimetype: ftype?.mime || 'audio/mpeg', ptt: false, ...sendOpts })
  } else if (content.text) {
    await alya.sendMessage(groupId, { text: content.text, ...sendOpts })
  } else {
    throw new Error('Format konten tidak dikenal')
  }
}

function bersihkanFile(content) {
  ;['image', 'video', 'audio'].forEach(t => {
    try {
      if (content?.[t]?.url && fs.existsSync(content[t].url)) fs.unlinkSync(content[t].url)
    } catch {}
  })
}
