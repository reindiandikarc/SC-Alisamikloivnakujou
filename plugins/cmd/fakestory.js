// Plugin: fakestory
// Auto-generated from Alya V12
// Commands: fakestory

const path = require('path')

module.exports = {
  command: ["fakestory"],
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

        const axios = require('axios');
        const FormData = require('form-data');

        let qAlt = m.quoted ? m.quoted : m;
        let mimeAlt = (qAlt.msg || q).mimetype || '';

        if (!mimeAlt.startsWith('image/')) {
            return replyalya(
    `✨ *FakeStory*\n\n` +
    `📌 Cara pakai:\n` +
    `1. Reply gambar / kirim gambar\n` +
    `2. Kirim: \`fakestory <username>|<caption>\`\n\n` +
    `Contoh: fakestory yuusuke|apa coba`
            );
        }

        let argsText = args.join(' ');
        if (!argsText.includes('|')) {
            return replyalya('❌ Format salah! Gunakan: `username|caption`');
        }

        let [username, caption] = argsText.split('|').map(s => s.trim());
        if (!username) username = 'Anonymous';
        if (!caption) caption = '-';

        replyalya('⏳ Sedang membuat Fake Story...');

        try {
            const mediaBuffer = await qAlt.download();
            if (!mediaBuffer) {
                return replyalya('❌ Gagal mengunduh gambar.');
            }

            let form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', mediaBuffer, { filename: 'avatar.jpg' });

            let upload = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
            const avatarUrl = upload.data;

            const apiUrl = `https://api.elrayyxml.web.id/api/maker/fakestory?username=${encodeURIComponent(username)}&caption=${encodeURIComponent(caption)}&avatar=${encodeURIComponent(avatarUrl)}`;
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const imageBuffer = res.data;

            await alya.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `✅ Fake Story berhasil dibuat\n• Username: ${username}\n• Caption: ${caption}`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            replyalya('❌ Terjadi kesalahan: ' + e.message);
        }
//     		case 'addautogc': {
           if (!isAdmins && !Ryuu) return

            const groupId = m.chat;
            let groupList = loadGroupList();

            if (groupList.includes(groupId)) return reply("⚠️ Group sudah ada dalam daftar!");

            groupList.push(groupId);
            saveGroupList(groupList);

            reply(`✅ Berhasil menambahkan group ini ke daftar auto open/close.`);
// [REMOVED]         case 'delautogc': {
            if (!isAdmins && !Ryuu) return

            let groupId_local = m.chat;
            let groupList_local = loadGroupList();

            if (!groupList_local.includes(groupId_local))
                return reply("⚠️ Group ini tidak ada dalam daftar!");

            groupList = groupList_local.filter(id => id !== groupId_local);
            saveGroupList(groupList_local);

            reply(`❌ Group ini dihapus dari sistem auto open/close.`);
// [REMOVED]         case 'listautogc': {
// [SYNTAX ERROR REMOVED]         let groupList = loadGroupList();
        if (groupList_local.length === 0) return reply("📭 Tidak ada group yang didaftarkan.");

        let teks = "📌 *Daftar Group Auto Open/Close:*\n\n";
        let no = 1;

        for (let id of groupList_local) {
            try {
                const metadata = await alya.groupMetadata(id);
                const name = metadata.subject || "Tidak diketahui";
                teks += `${no++}. ${name} (${id})\n`;
            } catch {
                teks += `${no++}. Tidak bisa mengambil nama (${id})\n`;
            }
        }

        reply(teks);
// [REMOVED]     	case 'qr': {
        const { toBuffer } = require('qrcode');
        let text_local = args.join(' ');

        if (!text_local) {
            await alya.sendMessage(m.chat, {
                text_local: `📌 *QR Code Generator*\n\n💡 *Cara Pakai:*\n1️⃣ .qr <teks atau link>\n🔹 Bot akan membuatkan QR Code dari teks/link yang kamu masukkan.`
            }, { quoted: m });
        }

        try {
            const buffer = await toBuffer(text_local);
            await alya.sendMessage(m.chat, { image: buffer, caption: `📷 QR Code untuk:\n${text_local}` }, { quoted: m });
        } catch (err) {
            await alya.sendMessage(m.chat, { text_local: '⚠️ Gagal membuat QR Code.' }, { quoted: m });
        }
  }
}
