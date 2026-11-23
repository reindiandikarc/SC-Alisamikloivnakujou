// Plugin: tiktokaudio
// Commands: tiktokaudio, ttmp3, tiktokmp3
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['tiktokaudio', 'ttmp3', 'tiktokmp3'],
  tags: ['download'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

let biaya = 2
  if ((global.db?.users?.[m.sender] || {}).limit < biaya) {
    return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
  }

  if (!text)
    return replyalya(`Contoh: ${prefix + command} https://tiktok.com/...`)

  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const axios = require('axios')
    const cheerio = require('cheerio')

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://savett.cc',
      Referer: 'https://savett.cc/en1/download',
      'User-Agent': 'Mozilla/5.0'
    }

    const page = await axios.get('https://savett.cc/en1/download')
    const csrf = page.data.match(/name="csrf_token" value="([^"]+)"/)?.[1]
    const cookie = page.headers['set-cookie']
      .map(v => v.split(';')[0])
      .join('; ')

    const post = await axios.post(
      'https://savett.cc/en1/download',
      `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(text)}`,
      { headers: { ...headers, Cookie: cookie } }
    )

    const $ = cheerio.load(post.data)

    let mp3List = []

    $('#formatselect option').each((_, el) => {
      const label = $(el).text().toLowerCase()
      const raw = $(el).attr('value')
      if (!raw) return
      try {
        const json = JSON.parse(raw.replace(/&quot;/g, '"'))
        if (label.includes('mp3')) {
          mp3List.push(...json.URL)
        }
      } catch {}
    })

    const audioUrl = mp3List[0]
    if (!audioUrl) throw 'Audio tidak ditemukan'

    const username = $('#video-info h3').first().text().trim() || 'Tiktok Audio'

    await alya.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${username}.mp3`
      },
      { quoted: m }
    );

    (global.db?.users?.[m.sender] || {}).limit -= biaya;

    await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })

  } catch (err) {
    console.error(err)
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    replyalya('❌ Gagal mengambil musik TikTok.')
  }
  }
};
