// Plugin: alyachatv2
// Commands: alyachatv2
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['alyachatv2'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!m.isGroup) return replyalya('Fitur Khusus Group!')
    if (!isAdmins && !m.key.fromMe) return replyalya('Fitur Khusus admin!')
    
    if (args[0] === "on") {
        if (ChatAlya1.includes(m.chat)) return replyalya(`Alya Chat sudah aktif di grup ini, Ryuu.`)
        ChatAlya1.push(m.chat)
        fs.writeFileSync('./database/ChatAlya1.json', JSON.stringify(ChatAlya1, null, 2))
        m.reply('_Successfully Activated Alya Auto Chat!_ ✨\nSekarang Alya akan merespon setiap pesan di grup ini.')
    } else if (args[0] === "off") {
        if (!ChatAlya1.includes(m.chat)) return m.reply(`Alya Chat memang sudah nonaktif.`)
        let anu = ChatAlya.indexOf(m.chat)
        ChatAlya1.splice(anu, 1)
        fs.writeFileSync('./database/ChatAlya1.json', JSON.stringify(ChatAlya1, null, 2))
        delete global.alyaHistory[m.chat]
        replyalya('_Successfully Disabled Alya Auto Chat._')
    } else {
        replyalya(`Contoh: ${prefix + command} on/off`)
    }
  }
};
