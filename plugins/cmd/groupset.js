// Plugin: groupset
// Auto-generated from Alya V12
// Commands: groupset
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["groupset"],
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

        if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di grup!');
        if (!(isGroupAdmins || Ryuu)) return replytolak('❌ Hanya admin yang bisa menggunakan fitur ini!');

        try {
            // ===== Helper buat cek status ON/OFF =====
            const checkStatus = (listDB) => {
                if (!listDB) return false;
                if (Array.isArray(listDB)) return listDB.includes(m.chat);
                if (listDB instanceof Map) return listDB.get(m.chat) || false;
                if (typeof listDB === 'object') return listDB[m.chat] || false;
                return false;
            };

            // ===== Helper buat row interaktif =====
            const makeRow = (title, listDB, cmd) => {
                const isOn = checkStatus(listDB);
                return {
                    header: "",
                    title: `${title}   [${isOn ? "🟢 ON" : "🔴 OFF"}]`,
                    description: "",
                    id: `${cmd} ${isOn ? "off" : "on"}`
                };
            };

            // ===== Kategori Proteksi Link =====
            const rowsLink = [
                makeRow("Anti Link All", ntilinkall, ".antilinkall"),
                makeRow("Anti Link Grup", antilinkDb, ".antilinkgc"),
                makeRow("Anti Link Channel", ntlinkch, ".antilinkch"),
                makeRow("Anti Link YT Video", ntilinkytvid, ".antilinkyoutubevid"),
                makeRow("Anti Link YT Channel", ntilinkytch, ".antilinkyoutubech"),
                makeRow("Anti Link Instagram", ntilinkig, ".antilinkig"),
                makeRow("Anti Link Facebook", ntilinkfb, ".antilinkfb"),
                makeRow("Anti Link Telegram", ntilinktg, ".antilinktg"),
                makeRow("Anti Link TikTok", ntilinktt, ".antilinktt"),

                makeRow("Anti Link Twitter", ntilinktwt, ".antilinktwt"),
            ];

            // ===== Kategori Proteksi Chat =====
            const rowsChat = [
                makeRow("Anti Tag SW", antitagsw, ".antitagsw"),
                makeRow("Anti Toxic", nttoxic, ".antitoxic"),
                makeRow("Anti Wame", ntwame, ".antiwame"),
                makeRow("Anti NSFW Sticker", antiNSFWGroups, ".antinsfw"),
                makeRow("Anti Delete Pesan", antidelete, ".antidelete"),
    			makeRow("Anti Spam", antispam, ".antispam"),
            ];

            // ===== Kategori Fitur Tambahan =====
            const rowsExtra = [
                makeRow("Auto AI Grup", openaigc, ".autoaigrup"),
                makeRow("Auto Sticker", autosticker, ".autosticker"),
            ];

            // ===== Generate pesan interaktif =====
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: `⚙️ Pengaturan Grup *${groupMetadata.subject}*` },
                            footer: { text: `✨ ${botname} - Proteksi Grup` },
                            header: { title: "🛡️ Group Protection & Features" },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Pilih fitur untuk diatur",
                                        sections: [
                                            { title: "━━━〔 🔗 Proteksi Link 〕━━━", rows: rowsLink },
                                            { title: "━━━〔 💬 Proteksi Chat 〕━━━", rows: rowsChat },
                                            { title: "━━━〔 ⚡ Fitur Tambahan 〕━━━", rows: rowsExtra },
                                        ]
                                    })
                                }]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});

            await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

        } catch (err) {
            console.error("GROUPSET ERROR:", err);
            m.reply("❌ Gagal menampilkan pengaturan grup.");
        }
  }
}
