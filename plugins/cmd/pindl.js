// Plugin: pindl
// Auto-generated from Alya V12
// Commands: pinterestdl, pindl

const path = require('path')

module.exports = {
  command: ["pinterestdl", "pindl"],
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

    const db = global.db
        const axios = require('axios');
        const cheerio = require('cheerio');
        let biaya = 3;

        if (!db.users[m.sender]) db.users[m.sender] = { limit: 0 };
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Butuh: ${biaya}\n😒 Punya kamu: ${db.users[m.sender].limit}`);
        }

        if (!text) return replyalya(`Hadeh... linknya mana coba? 😒\nContoh: ${prefix + command} https://pin.it/xxxxx`);

        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            const homePage = await axios.get('https://snappin.app/id/pinterest-video-downloader-1', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0'
                }
            });

            const cookie = homePage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            const $home = cheerio.load(homePage.data);
            const csrfToken = $home('meta[name="csrf-token"]').attr('content') || "";

            const commonHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0',
                'Accept': '*/*',
                'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
                'Origin': 'https://snappin.app',
                'Referer': 'https://snappin.app/id/pinterest-video-downloader-1',
                'Cookie': cookie,
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json'
            };

            const resolveRes = await axios.post('https://snappin.app/api/resolve',
                { url: text },
                { headers: commonHeaders }
            );

            const resolvedUrl = resolveRes.data.url;
            if (!resolvedUrl) throw 'Gagal me-resolve URL Pinterest.';

            const downloadPage = await axios.post('https://snappin.app/',
                { url: resolvedUrl },
                { headers: commonHeaders }
            );

            const $ = cheerio.load(downloadPage.data);
            const videoHref = $('a[href*="download-file"]').attr('href');
            const imageHref = $('a[href*="download-image"]').attr('href');
            const thumb = $('img[style*="object-fit: cover"]').attr('src');

            if (!videoHref && !imageHref) throw 'Media tidak ditemukan. Pastikan link benar.';

            let isVideo = !!videoHref;
            let finalDownloadPath = isVideo ? videoHref : imageHref;
            let finalDownloadUrl = finalDownloadPath.startsWith('http') ? finalDownloadPath : `https://snappin.app${finalDownloadPath}`;

            const caption = `📥 *Pinterest Downloader*
    👤 Request: @${pushname.split('\n')[0]}
    📊 Type: ${isVideo ? 'VIDEO' : 'IMAGE'}

    💸 Limit kepotong: ${biaya}
    Jangan manja... ini ga gratis 😏`;

            if (isVideo) {
                await alya.sendMessage(m.chat, {
                    video: { url: finalDownloadUrl },
                    caption: caption,
                    mentions: [m.sender]
                }, { quoted: m });
            } else {
                await alya.sendMessage(m.chat, {
                    image: { url: finalDownloadUrl },
                    caption: caption,
                    mentions: [m.sender]
                }, { quoted: m });
            }
            db.users[m.sender].limit -= biaya;
            await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('Pinterest Error:', err.response?.data || err.message);
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let msg = err.response?.data?.message || err;
            if (msg.includes('CSRF')) msg = "Session expired, coba lagi beberapa saat lagi.";
            replyalya(`❌ Gagal: ${msg}`);
        }

//     		case 'clearbackup': {
        if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di grup!')
        if (!(isGroupAdmins || Ryuu)) return replytolak('❌ Hanya admin yang bisa menggunakan fitur ini!')

        let args_local = text.split(' ')
        let deletedCount = 0
        const now = Date.now()

        const totalBefore = messagesBackup.size

        if (!text || args_local[0].toLowerCase() === 'all') {
            deletedCount = messagesBackup.size
            messagesBackup.clear()

            fs.writeFileSync(
                './database/messagesBackup.json',
                JSON.stringify([], null, 2)
            )

            return replyalya(
                `🧹 *CLEAR BACKUP PESAN*\n\n` +
                `📦 Total sebelum  : ${totalBefore}\n` +
                `🗑️ Dihapus        : ${deletedCount}\n` +
                `📊 Sisa           : 0\n` +
                `⏰ Mode           : HAPUS SEMUA\n` +
                `✅ Status         : Berhasil`
            )
        }

        const days = parseInt(args_local[0])
        if (isNaN(days) || days <= 0)
            return m.reply('❌ Format salah!\nGunakan:\n.clearbackup all\n.clearbackup <hari>')

        const maxAge = days * 24 * 60 * 60 * 1000
        let oldest = now
        let newest = 0

        for (let [id, msg] of messagesBackup) {
            const timestamp =
                msg.messageTimestamp?.low ||
                msg.messageTimestamp ||
                now

            if (timestamp < oldest) oldest = timestamp
            if (timestamp > newest) newest = timestamp

            if (now - timestamp > maxAge) {
                messagesBackup.delete(id)
                deletedCount++
            }
        }

        const totalAfter = messagesBackup.size

        fs.writeFileSync(
            './database/messagesBackup.json',
            JSON.stringify([...messagesBackup], null, 2)
        )

        const ageOldest = Math.floor((now - oldest) / (1000 * 60 * 60 * 24))
        const ageNewest = Math.floor((now - newest) / (1000 * 60 * 60 * 24))

        replyalya(
            `🧹 *CLEAR BACKUP PESAN*\n\n` +
            `📦 Total sebelum  : ${totalBefore}\n` +
            `🗑️ Dihapus        : ${deletedCount}\n` +
            `📊 Sisa           : ${totalAfter}\n\n` +
            `⏰ Mode           : > ${days} Hari\n` +
            `🕒 Pesan tertua   : ~${ageOldest} hari lalu\n` +
            `🕒 Pesan terbaru  : ~${ageNewest} hari lalu\n` +
            `✅ Status         : Berhasil`
        )
// [REMOVED]     		case 'mlhero':
// [REMOVED]     		case 'mobilelegends': {
    		const ml = require('../../lib/ml.js')
    		await ml.run(alya, m, args)
  }
}
