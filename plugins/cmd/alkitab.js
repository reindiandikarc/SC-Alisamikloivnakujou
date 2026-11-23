// Plugin: alkitab
// Commands: alkitab
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['alkitab'],
  tags: ['islami'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!text) return reply( `uhm.. teksnya mana?\n\ncontoh:\n${prefix + command} kejadian`)
     let res = await axios.get(`https://alkitab.me/search?q=${encodeURIComponent(text)}`, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36" } }) 
  
     let $ = cheerio.load(res.data) 
     let result = [] 
     $('div.vw').each(function (a, b) { 
         let teks = $(b).find('p').text().trim() 
         let link = $(b).find('a').attr('href') 
         let title = $(b).find('a').text().trim() 
         result.push({ teks, link, title }) 
     }) 
 
   let foto = 'https://telegra.ph/file/a333442553b1bc336cc55.jpg'
   let judul = '*────────「 Alkitab 」 ────────*'
     let caption = result.map(v => `💌 ${v.title}\n📮 ${v.teks}`).join('\n┄┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┄\n') 
      alya.sendFile(m.chat, foto, 'alkitab.jpg', `${judul}\n\n${caption}`, m)
  }
};
