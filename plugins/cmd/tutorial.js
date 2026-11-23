// Plugin: tutorial
// Auto-generated from Alya V12
// Commands: tutorial

const path = require('path')

module.exports = {
  command: ["tutorial"],
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

    const text12 = AlyaWaktu + ` *@${sender.split("@")[0]}*

    ▭▬▭( *TUTORIAL RUN PANEL* )▭▬▭

    1. *VERSI NODE:* Wajib menggunakan Node.js minimal *v20* (Rekomendasi *v22/v24*). Cek di menu Startup.
    2. *UPLOAD:* Upload file bot format .zip ke menu *Files*, lalu klik kanan dan *Unarchive*.
    3. *INSTALL:* Ke menu *Console*, ketik: *npm install*.
    4. *RUNNING:* Ketik perintah: *npm start*.
    5. *CONNECT:* Masukkan nomor HP di Console, tunggu 8 digit kode muncul, lalu masukkan kode itu ke WhatsApp (Menu Perangkat Tertaut > Tautkan nomor telepon).

    ▭▬▭( *SETTING OWNER* )▭▬▭

    1. Buka *settings.js* -> Ubah nomor di variabel *global.owner*.
    2. Buka folder *database* -> file *owner.json* -> Masukkan nomor kamu.
    3. *RESTART:* Wajib klik Restart pada Panel setelah mengubah data owner.

    Powered By *@${owned.split("@")[0]}*
    ▬▭▬▭▬▭▬▭▬▭▬▭▬`
    alya.sendMessage(from, { text: text12, contextInfo: { mentionedJid: [sender, owned] }}, { quoted: m })
  }
}
