// Plugin: jpm
// Auto-generated from Alya V12
// Commands: jpm

const path = require('path')

module.exports = {
  command: ["jpm"],
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
    if (!text) return reply(`*Penggunaan Salah Silahkan Gunakan Seperti Ini*\n${prefix+command} teks|jeda\n\nReply Gambar Untuk Mengirim Gambar Ke Semua Group\nUntuk Jeda Itu Delay Jadi Nominal Jeda Itu 1000 = 1 detik`)
    await replyalya("_Wait Tuan Ku✅_")
    let getGroups = await alya.groupFetchAllParticipating()
    let groups = Object.entries(getGroups).slice(0).map((entry) => entry[1])
    let anu = groups.map((v) => v.id)
    for (let xnxx of anu) {
    let metadat72 = await alya.groupMetadata(xnxx)
    let participanh = await metadat72.participants
    if (/image/.test(mime)) {
    media = await alya.downloadAndSaveMediaMessage(quoted)
    mem = await uploadwidipe(media)
    await alya.sendMessage(xnxx, { image: { url: mem }, caption: text.split('|')[0], mentions: participanh.map(a => a.id) })
    await sleep(text.split('|')[1])
    } else {
    await alya.sendMessage(xnxx, { text: text.split('|')[0], mentions: participanh.map(a => a.id) })
    await sleep(text.split('|')[1])
    }}
    replyalya("*SUCCESFUL TUAN ONWER✅*")
  }
}
