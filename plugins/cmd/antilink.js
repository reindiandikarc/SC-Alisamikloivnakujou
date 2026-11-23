// Plugin: antilink / groupset
// Ported from Alya V12 alya.js
// Commands: antilink, groupset

const fs = require('fs')

function loadJSON(file) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch { return [] }
}
function loadJSONObj(file) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '{}')
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch { return {} }
}

module.exports = {
  command: ['antilink', 'groupset'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      prefix, isGroup, isGroupAdmins, isBotAdmins, Ryuu,
      groupMetadata, reply, replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di grup!')
    if (!(isGroupAdmins || Ryuu)) return replytolak('❌ Hanya admin yang bisa menggunakan fitur ini!')

    // Load semua DB status
    const antilinkall = loadJSON('./database/antilinkall.json')
    const antilinkDb  = loadJSON('./database/antilinkgc.json')
    const ntlinkch    = loadJSON('./database/antilinkch.json')
    const ntilinkytvid= loadJSON('./database/antilinkytvideo.json')
    const ntilinkytch = loadJSON('./database/antilinkytchannel.json')
    const ntilinkig   = loadJSON('./database/antilinkinstagram.json')
    const ntilinkfb   = loadJSON('./database/antilinkfacebook.json')
    const ntilinktg   = loadJSON('./database/antilinktelegram.json')
    const ntilinktt   = loadJSON('./database/antilinktiktok.json')
    const ntilinktwt  = loadJSON('./database/antilinktwitter.json')
    const antitagsw   = loadJSON('./database/antitagsw.json')
    const nttoxic     = loadJSON('./database/antitoxic.json')
    const ntwame      = loadJSON('./database/antiwame.json')
    const antiNSFW    = loadJSON('./database/antinsfw.json')
    const antidelete  = loadJSON('./database/antidelete.json')
    const antispam    = loadJSONObj('./database/antispam.json')
    const openaigc    = loadJSON('./database/openaigc.json')
    const autosticker = loadJSON('./database/autosticker.json')

    const checkStatus = (listDB) => {
      if (!listDB) return false
      if (Array.isArray(listDB)) return listDB.includes(m.chat)
      if (typeof listDB === 'object') return listDB[m.chat] || false
      return false
    }

    const statusStr = (listDB) => checkStatus(listDB) ? '🟢 ON' : '🔴 OFF'

    const msgTeks =
      `⚙️ *Pengaturan Grup: ${groupMetadata?.subject || m.chat}*\n\n` +
      `━━━〔 🔗 *Proteksi Link* 〕━━━\n` +
      `• Anti Link All : ${statusStr(antilinkall)} → *${prefix}antilinkall on/off*\n` +
      `• Anti Link GC  : ${statusStr(antilinkDb)} → *${prefix}antilinkgc on/off*\n` +
      `• Anti Link CH  : ${statusStr(ntlinkch)} → *${prefix}antilinkch on/off*\n` +
      `• Anti Link YT  : ${statusStr(ntilinkytvid)} → *${prefix}antilinkyoutubevid on/off*\n` +
      `• Anti Link IG  : ${statusStr(ntilinkig)} → *${prefix}antilinkig on/off*\n` +
      `• Anti Link FB  : ${statusStr(ntilinkfb)} → *${prefix}antilinkfb on/off*\n` +
      `• Anti Link TG  : ${statusStr(ntilinktg)} → *${prefix}antilinktg on/off*\n` +
      `• Anti Link TT  : ${statusStr(ntilinktt)} → *${prefix}antilinktt on/off*\n` +
      `• Anti Link TWT : ${statusStr(ntilinktwt)} → *${prefix}antilinktwt on/off*\n\n` +
      `━━━〔 💬 *Proteksi Chat* 〕━━━\n` +
      `• Anti Tag SW   : ${statusStr(antitagsw)} → *${prefix}antitagsw on/off*\n` +
      `• Anti Toxic    : ${statusStr(nttoxic)} → *${prefix}antitoxic on/off*\n` +
      `• Anti Wame     : ${statusStr(ntwame)} → *${prefix}antiwame on/off*\n` +
      `• Anti NSFW     : ${statusStr(antiNSFW)} → *${prefix}antinsfw on/off*\n` +
      `• Anti Delete   : ${statusStr(antidelete)} → *${prefix}antidelete on/off*\n` +
      `• Anti Spam     : ${statusStr(antispam)} → *${prefix}antispam on/off*\n\n` +
      `━━━〔 ⚡ *Fitur Tambahan* 〕━━━\n` +
      `• Auto AI GC    : ${statusStr(openaigc)} → *${prefix}autoaigrup on/off*\n` +
      `• Auto Sticker  : ${statusStr(autosticker)} → *${prefix}autosticker on/off*\n\n` +
      `_Ketik perintah di atas untuk mengubah status_`

    await replyalya(msgTeks)
  }
}
