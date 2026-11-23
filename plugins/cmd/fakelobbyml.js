// Plugin: fakelobbyml
// Auto-generated from Alya V12
// Commands: fakelobby, fakelobbyml

const path = require('path')

module.exports = {
  command: ["fakelobby", "fakelobbyml"],
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

        const biaya = 2
        let limitUser = global.db.users[m.sender].limit

        if (limitUser < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit dibutuhkan : ${biaya}
    📊 Limit kamu : ${limitUser}`)
        }

        const { createCanvas, loadImage, registerFont } = require('canvas');
        const fs = require('fs');
        const path = require('path');
        const axios = require('axios');

        let qAlt = m.quoted ? m.quoted : m;
        let mimeAlt = (qAlt.msg || q).mimetype || '';
        const nickname = args.length > 0 ? args.join(" ").trim() : 'alya';

        if (!mimeAlt.startsWith('image/')) {
            return replyalya(
    `✨━━━〔 🎮 *Fake Lobby ML* 〕━━━✨

    📌 *Cara Pakai*:
    1. Reply gambar/foto yang ingin dipakai.
    2. Ketik:  \`${prefix + command} <nick>\`

    💡 *Contoh*:
    > Reply gambar lalu kirim:
    \`${prefix + command} Yuusuke\``
            );
        }

        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        global.db.users[m.sender].limit -= biaya

        replyalya(`⏳ *Sedang membuat Fake Lobby ML dengan nama* ➜ *${nickname}*
    🎨 Mohon tunggu sebentar...`);

        const tmpDir = process.cwd();
        const fontPath = path.join(tmpDir, 'CL8QHRYN.ttf');

        try {
            if (fs.existsSync(fontPath)) {
                registerFont(fontPath, { family: 'CustomFont' });
            }
        } catch (e) {
            console.warn("Gagal load font custom, pakai font default");
        }

        try {
            const mediaBuffer = await qAlt.download();
            const userImage = await loadImage(mediaBuffer).catch(() => null);
            if (!userImage) return replyalya("❌ Gagal memproses gambar avatar.");

            const bg = await loadImage('https://files.catbox.moe/liplnf.jpg').catch(() => null);
            const frameOverlay = await loadImage('https://files.catbox.moe/2vm2lt.png').catch(() => null);

            if (!bg || !frameOverlay) return replyalya("❌ Gagal load background atau frame. Coba lagi nanti.");

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            const avatarSize = 205;
            const frameSize = 293;
            const centerX = (canvas.width - frameSize) / 2;
            const centerY = (canvas.height - frameSize) / 2 - 282;
            const avatarX = centerX + (frameSize - avatarSize) / 2;
            const avatarY = centerY + (frameSize - avatarSize) / 2 - 3;

            const { width, height } = userImage;
            const minSide = Math.min(width, height);
            const cropX = (width - minSide) / 2;
            const cropY = (height - minSide) / 2;

            ctx.drawImage(userImage, cropX, cropY, minSide, minSide, avatarX, avatarY, avatarSize, avatarSize);
            ctx.drawImage(frameOverlay, centerX, centerY, frameSize, frameSize);

            const maxFontSize = 36;
            const minFontSize = 24;
            const maxChar = 11;
            let fontSize = maxFontSize;

            if (nickname.length > maxChar) {
                const excess = nickname.length - maxChar;
                fontSize -= excess * 2;
                if (fontSize < minFontSize) fontSize = minFontSize;
            }

            ctx.font = `${fontSize}px CustomFont`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(nickname, canvas.width / 2 + 13, centerY + frameSize + 15);

            const buffer = canvas.toBuffer('image/png');

            await alya.sendMessage(m.chat, {
                image: buffer,
                caption: `✨━━━〔 ✅ *Fake Lobby ML* 〕━━━✨

    🖼 *Nama*: ${nickname}
    🛠 *Status*: Sukses dibuat

    💳 *Limit terpakai*: ${biaya}
    📊 *Sisa limit*: ${global.db.users[m.sender].limit}

    ⚡ Dibuat oleh Alya`
            }, { quoted: m });

            await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e);
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            replyalya(`❌ Terjadi kesalahan saat membuat fake lobby.`);
        }
  }
}
