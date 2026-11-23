// Plugin: savekontakv2
// Auto-generated from Alya V12
// Commands: savekontakv2

const path = require('path')

module.exports = {
  command: ["savekontakv2"],
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

    if (!Ryuu) return replytolak(`Khusus Owner Aja`)
    if (!m.isGroup) return replytolak(mess.only.private)
    if (!text) return reply(`Penggunaan Salah Silahkan Gunakan Command Seperti Ini\n${prefix+command} idgroup\nUntuk Liat Id Group Silahkan Ketik .cekidgc`)
    await replyalya("_Wᴀɪᴛɪɴɢ ɪɴ ᴘʀᴏɢʀᴇss !!_")
    const groupMetadataa = !m.isGroup? await alya.groupMetadata(`${text}`).catch(e => {}) : ""
    const participants = !m.isGroup? await groupMetadataa.participants : ""
    const halls = await participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
    for (let mem of halls) {
    if (isContacts) return
    contacts.push(mem)
    fs.writeFileSync('./database/contacts.json', JSON.stringify(contacts))
    }
    try {
    const uniqueContacts = [...new Set(contacts)];
    const vcardContent = uniqueContacts.map((contact, index) => {
    const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:WA[${createSerial(2)}] ${contact.split("@")[0]}`,
    `TEL;type=CELL;type=VOICE;waid=${contact.split("@")[0]}:+${contact.split("@")[0]}`,
    "END:VCARD",
    "", ].join("\n");
    return vcard; }).join("");
    fs.writeFileSync("./all/database/contacts.vcf", vcardContent, "utf8");
    } catch (err) {
    reply(util.format(err))
    } finally {
    await alya.sendMessage(from, { document: fs.readFileSync("./database/contacts.vcf"), fileName: "contacts.vcf", caption: "Sukses Tinggal Save Ya Kakak", mimetype: "text/vcard", }, { quoted: m })
    contacts.splice(0, contacts.length)
    fs.writeFileSync("./database/contacts.json", JSON.stringify(contacts))
    }
  }
}
