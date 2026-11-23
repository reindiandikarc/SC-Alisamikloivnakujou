// Plugin: quote
// Auto-generated from Alya V12
// Commands: quote

const path = require('path')

module.exports = {
  command: ["quote"],
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

    try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!text) {
    return replyalya(`*Example:*

    ➜ ${prefix + command} Reindiandikarc @Reindiandikarc "5:47 AM · Sep 27, 2025" true Hello world https://example.com/pfp.jpg

    ➜ Reply/kirim gambar dengan:
    ${prefix + command} Reindiandikarc @Reindiandikarc "5:47 AM · Sep 27, 2025" false Hello world

    *Format:*
    username handle time verified tweet pfp

    *Parameter:*
    • *username* : Nama akun yang tampil
    • *handle* : Username akun *(contoh: @Reindiandikarc)*
    • *time* : Waktu tweet ditampilkan
    • *verified* : Status centang akun *(true / false)*
    • *pfp* : Link foto profil *(opsional / bisa reply gambar)*
    • *tweet* : Isi tweet / quote`)
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let username, handle, time, verified, tweet, pfp = null

    if (text.includes('"')) {

    const args = text.match(/"[^"]+"|\S+/g) || []

    username = args[0]
    handle = args[1]
    time = args[2]?.replace(/"/g, '')
    verified = args[3]

    const isUrl = s => /^https?:\/\//i.test(s || '')

    let remaining = args.slice(4)

    const urlIndex = remaining.findIndex(v => isUrl(v))

    if (urlIndex !== -1) {
    pfp = remaining[urlIndex]
    remaining.splice(urlIndex, 1)
    }

    tweet = remaining.join(' ')

    } else {

    const parts = text.trim().split(/\s+/)

    username = parts.shift()
    handle = parts.shift()

    let verifiedIndex = parts.findIndex(v => /^(true|false)$/i.test(v))

    if (verifiedIndex === -1) {
    return replyalya('🍂 *Parameter verified tidak ditemukan.*')
    }

    time = parts.slice(0, verifiedIndex).join(' ')
    verified = parts[verifiedIndex]

    let remaining = parts.slice(verifiedIndex + 1)

    const isUrl = s => /^https?:\/\//i.test(s || '')

    const urlIndex = remaining.findIndex(v => isUrl(v))

    if (urlIndex !== -1) {
    pfp = remaining[urlIndex]
    remaining.splice(urlIndex, 1)
    }

    tweet = remaining.join(' ')
    }

    verified = String(verified).toLowerCase() === 'true'

    if (!tweet) {
    return replyalya('🍂 *Teks quote tidak ditemukan.*')
    }

    if (!pfp && mime.startsWith('image/')) {

    let media = await q.download()

    const FormData = require('form-data')
    const axios = require('axios')

    let form = new FormData()
    form.append('files[]', media, 'image.jpg')

    let upload = await axios.post(
    'https://uguu.se/upload.php',
    form,
    { headers: form.getHeaders() }
    )

    pfp = upload.data.files?.[0]?.url
    }

    if (!pfp) {
    return replyalya('🍂 *Foto profil tidak ditemukan.*\n\nKirim atau reply gambar, atau sertakan URL gambar.')
    }

    let api = `https://myapi.radzzoffc.tech/gen/quote?username=${encodeURIComponent(username)}&handle=${encodeURIComponent(handle)}&text=${encodeURIComponent(tweet)}&time=${encodeURIComponent(time)}&verified=${verified}&pfp=${encodeURIComponent(pfp)}`

    const axios = require('axios')

    let res = await axios.get(api, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(res.data)

    await alya.sendMessage(m.chat, {
    image: buffer
    }, { quoted: m })

    } catch (e) {
    replyalya(`🍂 *Gagal membuat quote image.*

    *Error:* ${e.message}`)
    }

    await alya.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}
