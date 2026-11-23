// Plugin: autosahur
// Commands: autosahur
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['autosahur'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!Ryuu) return replytolak(mess.only.owner)

    let grupList = await store.chats.all()
        .filter(v => v.id.endsWith('@g.us'))
        .map(v => v.id)

    if (!grupList.length) return replyalya("Bot tidak ada di grup manapun.")

    let rows = []

    for (let gid of grupList) {
        try {
            let metadata = await alya.groupMetadata(gid)
            let status = autosahurData[gid] ? "✅ Aktif" : "❌ Nonaktif"

            rows.push({
                title: metadata.subject,
                description: status,
                id: `.autosahurtoggle ${gid}`
            })
        } catch {}
    }

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: "🌙 *Pengaturan Auto Sahur*\nKlik grup untuk ON/OFF" },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "PILIH GRUP",
                                sections: [{
                                    title: "Daftar Grup",
                                    rows
                                }]
                            })
                        }]
                    }
                }
            }
        }
    }, { quoted: m })

    await alya.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
    })
  }
};
