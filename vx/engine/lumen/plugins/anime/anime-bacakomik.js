/**
  *» Nama :* — [ BACA KOMIK ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://bacakomik.my
  *» Saluran :* https://whatsapp.com/channel/0029VbBS8ys0G0XnmJFRiV2v/2641
  *» Creator :* Dwi-Merajah
**/

import {
    getRekomendasi,
    searchComic,
    getAllChapters,
    getChapterImages,
    formatSearch,
    formatPopular,
    formatChapters
} from '../../lib/scrape/bacakomik.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const sub = (args[0] || 'help').toLowerCase();

        if (['help', 'menu', '?'].includes(sub) || args.length === 0 && !['populer', 'popular'].includes(sub)) {
            return await conn.sendMessage(m.chat, {
                text: [
                    '📚 *BacaKomik Scraper*',
                    '',
                    `• ${usedPrefix + command} cari <judul>`,
                    `• ${usedPrefix + command} populer [limit]`,
                    `• ${usedPrefix + command} chapters <judul/url>`,
                    `• ${usedPrefix + command} chapter <judul/url> <nomor>`,
                    `• ${usedPrefix + command} chapter <url-chapter>`,
                    '',
                    '*Contoh:*',
                    `${usedPrefix + command} cari solo leveling`,
                    `${usedPrefix + command} populer 10`,
                    `${usedPrefix + command} chapter solo leveling 1`
                ].join('\n')
            }, { quoted: m });
        }

        if (['cari', 'search'].includes(sub)) {
            const query = args.slice(1).join(' ').trim();
            if (!query) return m.reply(`❌ Masukkan judul komik.\nContoh: ${usedPrefix + command} cari solo leveling`);

            m.reply(`🔎 Mencari komik *${query}*...`);
            const res = await searchComic(query);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(`🔎 *Hasil pencarian: ${query}*\n\n${formatSearch(res.data)}`);
        }

        if (['populer', 'popular', 'rekomendasi'].includes(sub)) {
            const limit = parseInt(args[1], 10) || 15;
            m.reply('📈 Mengambil komik populer...');
            const res = await getRekomendasi(limit);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(`📈 *Komik Populer BacaKomik*\n\n${formatPopular(res.data)}`);
        }

        if (['chapters', 'chapterlist', 'listchapter'].includes(sub)) {
            const target = args.slice(1).join(' ').trim();
            if (!target) return m.reply(`❌ Masukkan judul atau URL komik.\nContoh: ${usedPrefix + command} chapters solo leveling`);

            m.reply('📖 Mengambil daftar chapter...');
            const res = await getAllChapters(target);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(formatChapters(res.data));
        }

        if (['chapter', 'read', 'baca'].includes(sub)) {
            const commandArgs = args.slice(1);
            if (!commandArgs.length) {
                return m.reply(`❌ Masukkan URL chapter atau judul + nomor chapter.\nContoh:\n${usedPrefix + command} chapter solo leveling 1`);
            }

            let target = '';
            let chapterNum = null;

            if (commandArgs[0]?.startsWith('http')) {
                target = commandArgs[0];
            } else {
                chapterNum = commandArgs.length > 1 ? commandArgs.pop() : null;
                target = commandArgs.join(' ').trim();
            }

            m.reply('🖼️ Mengambil gambar chapter...');
            const res = await getChapterImages(target, chapterNum);
            if (!res.status) return m.reply(`❌ ${res.message}`);

            const images = res.data?.image_url || [];
            if (!images.length) return m.reply('❌ Tidak menemukan gambar pada chapter tersebut.');

            const MAX_IMAGES = 30;
            const sendImages = images.slice(0, MAX_IMAGES);

            await conn.sendMessage(m.chat, {
                text: [
                    `📖 *${res.data.title || 'Komik'}*`,
                    `📑 *${res.data.chapter || 'Chapter'}*`,
                    `🖼️ Total gambar: ${images.length}`,
                    '',
                    images.length > MAX_IMAGES ? `⚠️ Menampilkan ${MAX_IMAGES} gambar pertama.` : 'Mengirim halaman...'
                ].join('\n')
            }, { quoted: m });

            for (let i = 0; i < sendImages.length; i++) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: sendImages[i] },
                        caption: `📖 ${res.data.title || 'Komik'}\n📑 ${res.data.chapter || 'Chapter'}\n🖼️ Halaman ${i + 1}/${images.length}`
                    }, { quoted: m });
                } catch (err) {
                    console.error(`Gagal mengirim gambar ${i + 1}:`, err);
                }
            }
            return;
        }

        return m.reply(`❌ Subcommand *${sub}* tidak dikenal.\nGunakan ${usedPrefix + command} help untuk melihat penggunaan.`);
    } catch (err) {
        console.error('[BacaKomik]', err);
        return m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
};

handler.help = ['bacakomik', 'komik'];
handler.tags = ['anime'];
handler.command = /^(bacakomik|komik|komiksearch|komikpopuler)$/i;

export default handler;