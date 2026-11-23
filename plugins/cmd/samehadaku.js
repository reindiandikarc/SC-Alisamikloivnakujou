// Plugin: samehadaku
// Scraper untuk situs streaming anime sub-indo Samehadaku.
// Scraper murni ada di scrape/samehadaku.js, plugin ini cuma command layer.
// CATATAN: resolve streaming URL (embed player) sengaja tidak diikutkan —
// versi CLI aslinya pakai puppeteer + Chromium path khusus Termux yang tidak
// portable ke server/panel. Command .samehadaku episode tetap kasih daftar
// nama player & link download, cukup untuk kebanyakan kebutuhan.
'use strict';

const {
  scrapeHome,
  scrapeJadwalRilis,
  scrapeDaftarBatch,
  scrapeBatchDetail,
  scrapeDetailAnime,
  scrapeEpisode,
} = require('../../scrape/samehadaku');

function trim(str, max = 400) {
  if (!str) return '-';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

const HELP =
`🎬 *SAMEHADAKU — Scraper Samehadaku*

*home* — top 10 + rilis terbaru
*jadwal [hari]* — jadwal rilis mingguan
*batch* — daftar batch tersedia
*batchdetail <url>* — link download dari 1 batch
*detail <url>* — info anime + daftar episode
*episode <url>* — daftar player & link download episode`;

module.exports = {
  command: ['samehadaku', 'shdk'],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { args, prefix, reply } = ctx;
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ').trim();

    if (!sub) return reply(HELP);

    try {
      if (sub === 'home') {
        const data = await scrapeHome();
        const top10 = data.top_10_minggu_ini.slice(0, 10)
          .map((a) => `${a.rank}. *${a.title}* (⭐${a.rating || '-'})`).join('\n') || '-';
        const latest = data.latest_anime.slice(0, 10)
          .map((a) => `• *${a.title}* — ${a.episode || '-'}\n  ${a.url}`).join('\n') || '-';

        const teks =
          `🏠 *SAMEHADAKU — Home*\n\n` +
          `🏆 *Top 10 Minggu Ini:*\n${top10}\n\n` +
          `🆕 *Rilis Terbaru:*\n${latest}`;
        return reply(teks);
      }

      if (sub === 'jadwal') {
        const data = await scrapeJadwalRilis();
        const dayFilter = rest ? rest.charAt(0).toUpperCase() + rest.slice(1).toLowerCase() : null;

        if (dayFilter && data[dayFilter]) {
          const list = data[dayFilter].slice(0, 15)
            .map((a) => `• *${a.title}* — ${a.time || '-'} WIB\n  ${a.url}`).join('\n') || 'Tidak ada rilis.';
          return reply(`📅 *Jadwal Rilis — ${dayFilter}*\n\n${list}`);
        }

        const summary = Object.entries(data)
          .map(([day, items]) => `• ${day}: ${items.length} judul`).join('\n');
        return reply(`📅 *Jadwal Rilis Mingguan*\n\n${summary}\n\n_Ketik ${prefix}samehadaku jadwal <hari> untuk detail_`);
      }

      if (sub === 'batch') {
        const data = await scrapeDaftarBatch();
        if (!data.length) return reply('❌ Tidak ada data batch saat ini.');
        const teks = `📦 *Daftar Batch*\n\n` + data.slice(0, 15)
          .map((b, i) => `${i + 1}. *${b.title}*\n   Status: ${b.status || '-'} | Skor: ${b.score || '-'}\n   ${b.url}`)
          .join('\n\n');
        return reply(teks);
      }

      if (sub === 'batchdetail') {
        if (!rest) return reply(`❌ Format: ${prefix}samehadaku batchdetail <url>`);
        const data = await scrapeBatchDetail(rest);
        if (!data?.title) return reply('❌ Data tidak ditemukan / gagal parse halaman.');
        const downloads = (data.downloads || [])
          .map((d) => `*${d.format}*\n` + d.links.map((l) => `  • ${l.quality}: ` + l.providers.map((p) => p.provider).join(', ')).join('\n'))
          .join('\n\n') || '-';
        return reply(`📦 *${data.title}*\n\n${downloads}`);
      }

      if (sub === 'detail') {
        if (!rest) return reply(`❌ Format: ${prefix}samehadaku detail <url>`);
        const d = await scrapeDetailAnime(rest);
        if (!d?.title) return reply('❌ Data tidak ditemukan / gagal parse halaman.');

        const infoText = Object.entries(d.info || {}).map(([k, v]) => `${k}: ${v}`).join('\n') || '-';
        const epList = (d.episodes || []).slice(0, 15).map((e) => `• ${e.title}\n  ${e.url}`).join('\n');

        const teks =
          `📖 *${d.title}*\n\n` +
          `${infoText}\n` +
          `🏷️ Genre: ${(d.genres || []).join(', ') || '-'}\n\n` +
          `📝 Sinopsis:\n${trim(d.synopsis, 500)}\n\n` +
          (epList ? `📂 *Episode:*\n${epList}\n\n` : '') +
          `_Ketik ${prefix}samehadaku episode <link episode> untuk lihat player_`;

        if (d.image) {
          return alya.sendMessage(m.chat, { image: { url: d.image }, caption: teks }, { quoted: m });
        }
        return reply(teks);
      }

      if (sub === 'episode') {
        if (!rest) return reply(`❌ Format: ${prefix}samehadaku episode <url>`);
        const e = await scrapeEpisode(rest);
        if (!e?.title) return reply('❌ Data tidak ditemukan / gagal parse halaman.');

        const players = (e.players || []).map((p) => `• ${p.name}`).join('\n') || '-';
        const downloads = (e.downloads || [])
          .map((d) => `*${d.format}*\n` + d.links.map((l) => `  • ${l.quality}: ` + l.providers.map((p) => p.provider).join(', ')).join('\n'))
          .join('\n\n') || '-';

        const teks =
          `▶️ *${e.title}*\n\n` +
          `🖥️ Player tersedia:\n${players}\n\n` +
          `⬇️ Link download:\n${downloads}`;
        return reply(teks);
      }

      return reply(HELP);
    } catch (err) {
      return reply(`❌ Terjadi error saat mengambil data: ${err.message}`);
    }
  },
};
