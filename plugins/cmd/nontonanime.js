// Plugin: nontonanime
// Scraper untuk situs streaming anime sub-indo NontonAnimeID.
// Diadaptasi dari CLI (nontonanime.js) — scraper class disimpan di
// scrape/nontonanime.js, plugin ini cuma jadi lapisan command WhatsApp.
'use strict';

const { NontonAnimeIDScraper } = require('../../scrape/nontonanime');
const scraper = new NontonAnimeIDScraper();

function trim(str, max = 250) {
  if (!str) return '-';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function renderCard(item, i) {
  return (
    `${i != null ? `${i + 1}. ` : ''}*${item.title || '-'}*\n` +
    `   📺 ${item.type || '-'} | ⭐ ${item.rating || '-'} | 📅 ${item.season || '-'}\n` +
    `   🔗 ${item.link || '-'}`
  );
}

const HELP =
`🎬 *NONTONANIME — Scraper NontonAnimeID*

*search <judul>* — cari anime
*ongoing [halaman]* — anime ongoing terbaru
*popular [halaman]* — anime paling populer
*detail <slug/url>* — info lengkap + daftar episode
*stream <slug/url episode>* — link nonton & download episode`;

module.exports = {
  command: ['nontonanime', 'nanime'],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { args, prefix, reply } = ctx;
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ').trim();

    if (!sub) return reply(HELP);

    try {
      if (sub === 'search') {
        if (!rest) return reply(`❌ Format: ${prefix}nontonanime search <judul>`);
        const results = await scraper.searchAnime(rest);
        if (!results.length) return reply('❌ Tidak ditemukan hasil untuk pencarian itu.');
        const teks = `🔍 *Hasil pencarian: ${rest}*\n\n` + results.slice(0, 15).map(renderCard).join('\n\n');
        return reply(teks);
      }

      if (sub === 'ongoing') {
        const page = parseInt(rest, 10) || 1;
        const results = await scraper.getOngoingList(page);
        if (!results.length) return reply('❌ Tidak ada data ongoing untuk halaman ini.');
        const teks = `📡 *Anime Ongoing — Halaman ${page}*\n\n` + results.slice(0, 15).map(renderCard).join('\n\n');
        return reply(teks);
      }

      if (sub === 'popular') {
        const page = parseInt(rest, 10) || 1;
        const results = await scraper.getPopularSeries(page);
        if (!results.length) return reply('❌ Tidak ada data populer untuk halaman ini.');
        const teks = `🔥 *Anime Populer — Halaman ${page}*\n\n` + results.slice(0, 15).map(renderCard).join('\n\n');
        return reply(teks);
      }

      if (sub === 'detail') {
        if (!rest) return reply(`❌ Format: ${prefix}nontonanime detail <slug/url>`);
        const d = await scraper.getAnimeDetail(rest);
        if (!d?.title) return reply('❌ Data tidak ditemukan / gagal parse halaman.');

        const genreList = (d.genres || []).map((g) => g.name).join(', ') || '-';
        const epList = (d.episodes || []).slice(0, 15)
          .map((e) => `   • ${e.title}${e.date ? ` (${e.date})` : ''}\n     ${e.link}`)
          .join('\n');

        const teks =
          `📖 *${d.title}*\n\n` +
          `⭐ Skor: ${d.score || '-'} (${d.type || '-'})\n` +
          `📌 Status: ${d.status || '-'}\n` +
          `🎞️ Total Episode: ${d.total_episodes || '-'}\n` +
          `⏱️ Durasi: ${d.episode_duration || '-'}\n` +
          `📅 Season: ${d.season || '-'}\n` +
          `🏷️ Genre: ${genreList}\n\n` +
          `📝 Sinopsis:\n${trim(d.synopsis, 500)}\n\n` +
          (epList ? `📂 *Episode terbaru:*\n${epList}\n\n` : '') +
          `_Ketik ${prefix}nontonanime stream <link episode> untuk nonton_`;

        if (d.poster) {
          return alya.sendMessage(m.chat, { image: { url: d.poster }, caption: teks }, { quoted: m });
        }
        return reply(teks);
      }

      if (sub === 'stream') {
        if (!rest) return reply(`❌ Format: ${prefix}nontonanime stream <slug/url episode>`);
        const s = await scraper.getStreamingDetail(rest);
        if (!s?.title) return reply('❌ Data tidak ditemukan / gagal parse halaman episode.');

        const servers = (s.video_servers || []).map((v) => `   • ${v.server_name}${v.is_active ? ' (aktif)' : ''}`).join('\n') || '-';
        const downloads = (s.download_links || [])
          .map((d) => `   *${d.format}*: ` + (d.links || []).map((l) => l.label).join(', '))
          .join('\n') || '-';

        const teks =
          `▶️ *${s.title}*\n` +
          `📖 Anime: ${s.anime_title || '-'}\n\n` +
          `🖥️ Video default:\n${s.default_video_url || '-'}\n\n` +
          `🖥️ Server tersedia:\n${servers}\n\n` +
          `⬇️ Link download:\n${downloads}`;

        return reply(teks);
      }

      return reply(HELP);
    } catch (e) {
      return reply(`❌ Terjadi error saat mengambil data: ${e.message}`);
    }
  },
};
