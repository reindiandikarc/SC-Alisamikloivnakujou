// Plugin: stickerinfo
// Auto-generated from Alya V12
// Commands: stickersearch, stickerinfo

const path = require('path')

module.exports = {
  command: ["stickersearch", "stickerinfo"],
  tags: ['sticker'],
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

        try {
            if (!text) {
                return replyalya(
    `✨━━━〔 🔍 *Cari Stiker Telegram* 〕━━━✨

    📌 *Cara Pakai*:
    • Nama stiker → .fstik kucing lucu 10
    • Link paket → .fstik https://t.me/addstickers/nama_paket 10

    ⚠️ *Jumlah WAJIB diisi*
    💡 Maksimal 30 stiker`
                );
            }

            const parts = text.trim().split(' ');
            const last = parts[parts.length - 1];
            if (isNaN(last)) {
                return replyalya('❌ Jumlah stiker WAJIB diisi di akhir\n\nContoh:\n.fstik kucing lucu 10');
            }

            let stickerCount = parseInt(parts.pop());
            if (stickerCount < 1) return replyalya('❌ Minimal 1 stiker');
            if (stickerCount > 30) stickerCount = 30;

            const query = parts.join(' ').trim();
            if (!query) return replyalya('❌ Query atau link tidak valid');

            replyalya(`⏳ *Mencari paket stiker*\n🔎 Query: _${query}_\n📦 Jumlah: *${stickerCount}*`);

            const fstik = {
                api: {
                    base: 'https://api.fstik.app',
                    endpoints: {
                        direct: '/getStickerSetByName',
                        search: '/searchStickerSet'
                    }
                },
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                    'origin': 'https://webapp.fstik.app',
                    'referer': 'https://webapp.fstik.app/',
                    'user-agent': 'NB Android/1.0.0'
                },

                search: async (query) => {
                    const isLink = query.startsWith('https://t.me/addstickers/');
                    if (isLink) {
                        const name = query.split('/addstickers/')[1];
                        if (!name) throw new Error('Link paket tidak valid');

                        const res = await axios.post(
                            fstik.api.base + fstik.api.endpoints.direct,
                            { name, user_token: null },
                            { headers: fstik.headers, timeout: 10000 }
                        );

                        const result = res.data?.result;
                        if (!result?.stickers?.length) throw new Error('Paket stiker tidak ditemukan');

                        const stickers = result.stickers
                            .slice(0, stickerCount) // 🔥 FIX UTAMA
                            .map(s => ({
                                image_url: s.thumb?.file_id
                                    ? `${fstik.api.base}/file/${s.thumb.file_id}/sticker.webp`
                                    : null,
                                video_url: s.video?.file_id
                                    ? `${fstik.api.base}/file/${s.video.file_id}/sticker.webm`
                                    : null,
                                is_video: !!s.video?.file_id
                            }));

                        return {
                            title: result.title,
                            name: result.name,
                            description: result.description,
                            tags: result.tags,
                            total: result.stickers.length,
                            stickers
                        };
                    }
                    const res = await axios.post(
                        fstik.api.base + fstik.api.endpoints.search,
                        { query, skip: 0, limit: 1, type: '', kind: 'regular', user_token: null },
                        { headers: fstik.headers, timeout: 10000 }
                    );

                    const set = res.data?.result?.stickerSets?.[0];
                    if (!set?.stickers?.length) throw new Error('Paket stiker tidak ditemukan');

                    const stickers = set.stickers
                        .slice(0, stickerCount)
                        .map(s => ({
                            image_url: s.thumb?.file_id
                                ? `${fstik.api.base}/file/${s.thumb.file_id}/sticker.webp`
                                : null,
                            video_url: s.video?.file_id
                                ? `${fstik.api.base}/file/${s.video.file_id}/sticker.webm`
                                : null,
                            is_video: !!s.video?.file_id
                        }));

                    return {
                        title: set.title,
                        name: set.name,
                        description: set.description,
                        tags: set.tags,
                        total: set.stickers.length,
                        stickers
                    };
                }
            };

            const result = await fstik.search(query);

            const info = `✨━━━〔 📦 *Info Paket Stiker* 〕━━━✨
    🖼 *Judul*: ${result.title}
    📛 *Nama*: ${result.name}
    📝 *Deskripsi*: ${result.description || '-'}
    🏷 *Tags*: ${result.tags?.join(', ') || '-'}
    📦 *Total Paket*: ${result.total}
    📤 *Dikirim*: ${result.stickers.length}
    🔗 https://t.me/addstickers/${result.name}`;

            await alya.sendMessage(m.chat, {
                image: { url: result.stickers[0]?.image_url },
                caption: info
            }, { quoted: m });

            for (const stiker of result.stickers) {
                if (stiker.is_video && stiker.video_url) {
                    await alya.sendMessage(
                        m.chat,
                        { video: { url: stiker.video_url }, gifPlayback: true },
                        { quoted: m }
                    );
                } else if (stiker.image_url) {
                    await alya.sendMessage(
                        m.chat,
                        { sticker: { url: stiker.image_url } },
                        { quoted: m }
                    );
                }
                await new Promise(r => setTimeout(r, 5000));
            }

        } catch (e) {
            replyalya(`❌ Error: ${e.message}`);
        }
  }
}
