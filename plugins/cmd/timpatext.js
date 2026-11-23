// Plugin: timpatext
// Auto-generated from Alya V12
// Commands: timpatext

const path = require('path')

module.exports = {
  command: ["timpatext"],
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

    if (!m.quoted) return replyalya('❌ Reply gambar!\n\nContoh:\n.timpatext nanobanana.js|Sora Eng ay')

    let qAlt = m.quoted
    let mimeAlt = (qAlt.msg || q).mimetype || ''
    if (!/image/.test(mime)) return replyalya('❌ Reply gambar!')

    if (!text.includes('|')) return replyalya('❌ Format salah!\n\nContoh:\n.timpatext nanobanana.js|Sora Eng ay')

    let [originalteks, replacetext] = text.split('|')

    await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})

    try {

    const fs = require('fs')
    const FormData = require('form-data')
    const path = require('path')
    const axios = require('axios')

    function genserial() {
    let s = ''
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16)
    return s
    }

    async function upimage(filename) {
    const form = new FormData()
    form.append('file_name', filename)

    const res = await axios.post(
    'https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    {
    headers: {
    ...form.getHeaders(),
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
    origin: 'https://imgupscaler.ai',
    referer: 'https://imgupscaler.ai/'
    }
    }
    )

    return res.data.result
    }

    async function uploadtoOSS(put, filepath) {

    const type = path.extname(filepath).toLowerCase() === '.png'
    ? 'image/png'
    : 'image/jpeg'

    const stream = fs.createReadStream(filepath)

    const res = await axios.put(
    put,
    stream,
    {
    headers: {
    'Content-Type': type
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
    }
    )

    return res.status === 200
    }

    async function createJob(imgurl, originalteks, replacetext) {

    const form = new FormData()
    form.append('original_image_url', imgurl)
    form.append('original_text', originalteks)
    form.append('replace_text', replacetext)

    const res = await axios.post(
    'https://api.magiceraser.org/api/magiceraser/v2/text-replace/create-job',
    form,
    {
    headers: {
    ...form.getHeaders(),
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
    'product-code': 'magiceraser',
    'product-serial': genserial(),
    origin: 'https://imgupscaler.ai',
    referer: 'https://imgupscaler.ai/'
    }
    }
    )

    return res.data.result.job_id
    }

    async function cekjob(jobId) {

    const res = await axios.get(
    `https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    {
    headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
    origin: 'https://imgupscaler.ai',
    referer: 'https://imgupscaler.ai/'
    }
    }
    )

    return res.data
    }

    async function textreplace(img, originalteks, replacetext) {

    const filename = path.basename(img)

    const uploadInfo = await upimage(filename)
    await uploadtoOSS(uploadInfo.url, img)

    const cdn = 'https://cdn.imgupscaler.ai/' + uploadInfo.object_name

    const jobId = await createJob(cdn, originalteks, replacetext)

    let result
    let retry = 0
    let maxRetry = 20

    while (retry < maxRetry) {

    await new Promise(r => setTimeout(r, 3000))

    result = await cekjob(jobId)

    if (result.result && result.result.output_url) {
    return {
    job_id: jobId,
    image: result.result.output_url[0]
    }
    }

    retry++
    }

    throw 'Timeout proses AI'
    }

    let media = await qAlt.download()
    let filepath = `./tmp/${Date.now()}.jpg`

    fs.writeFileSync(filepath, media)

    let hasil = await textreplace(filepath, originalteks, replacetext)

    await alya.sendMessage(m.chat, {
    image: { url: hasil.image },
    caption: `✨ *Text berhasil diganti!*`
    }, { quoted: m })

    fs.unlinkSync(filepath)

    } catch (e) {
    console.log(e)
    replyalya('❌ Gagal memproses gambar / AI timeout')
    }

  }
}
