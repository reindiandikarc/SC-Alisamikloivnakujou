// Plugin: fakethread
// Commands: fakethread, faketh, fth
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['fakethread', 'faketh', 'fth'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return reply(`Example:\n${prefix}${command} username|text|like (reply foto)`);

    const [username, teks, like] = text.split("|");
    if (!username || !teks || !like)
        return reply(`Example:\n${prefix}${command} username|text|like (reply foto)`);

    const targetMsg = m.quoted ? m.quoted : m;
    const targetMime = (targetMsg.msg || targetMsg).mimetype || "";

    if (!/image/.test(targetMime))
        return reply("Kirim/Reply foto sebagai profil!");

    try {
        const buffer = await targetMsg.download();

        const FormData = require("form-data");
        const fetch = require("node-fetch");
        const form = new FormData();
        form.append("files[]", buffer, "avatar.jpg");

        const uploadRes = await (await fetch("https://uguu.se/upload.php", { method: "POST", body: form })).json();
        const avatarURL = uploadRes.files?.[0]?.url;

        if (!avatarURL) return reply("Gagal upload foto ke Uguu!");

        await reply("Processing...");

        const apiLink = `https://api.elrayyxml.web.id/api/maker/fakethreads?username=${encodeURIComponent(
            username
        )}&avatar=${encodeURIComponent(avatarURL)}&text=${encodeURIComponent(teks)}&count_like=${encodeURIComponent(
            like
        )}`;

        const resultBuffer = Buffer.from(await (await fetch(apiLink)).arrayBuffer());

        await alya.sendMessage(
            m.chat,
            { image: resultBuffer, caption: `Result fake threads` },
            { quoted: m }
        );

    } catch (err) {
        console.error('[fakethread] error:', err?.message || err);
        reply("Terjadi kesalahan saat memproses fake thread.");
    }
  }
};
