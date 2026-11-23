// ╔══════════════════════════════════════════════════════════════════╗
// ║           ANIME PLUGIN — ALYA V13 (Fixed & Enhanced)           ║
// ║  Commands: .anime <judul>  |  .anime search <judul>            ║
// ║            .anime jadwal   |  .anime detail <slug>             ║
// ║            .anime download <slug>                               ║
// ╚══════════════════════════════════════════════════════════════════╝

'use strict';

const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('@whiskeysockets/baileys');
const axios = require('axios');

// ─── scrape/anime.js helpers ─────────────────────────────────────────────────
const {
  animeSearch,
  animeDetail,
  animeSchedule,
  animeEpisode,
  animeBatch
} = require('../../scrape/anime');

// ─── Jikan API v4 (MAL resmi — 100% gratis, no API key) ──────────────────────
// FIX: Jikan v4 punya rate limit ketat (~3 req/detik, ~60 req/menit). Tanpa
// retry, setiap kali kena 429 langsung gagal dan user lihat pesan error
// mentah. Sekarang jikanGet retry otomatis dengan backoff khusus untuk
// 429 (rate limit) dan 5xx (error server sementara Jikan).
const JIKAN = 'https://api.jikan.moe/v4';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function jikanGet(path, { retries = 3, baseDelay = 1000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data } = await axios.get(JIKAN + path, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Alya-Bot)' },
        timeout: 12000
      });
      return data;
    } catch (e) {
      lastErr = e;
      const status = e.response?.status;
      const isRateLimited = status === 429;
      const isServerError = status >= 500 && status < 600;
      const isRetryable = isRateLimited || isServerError || !status; // !status = network/timeout error

      if (!isRetryable || attempt === retries) break;

      // Rate limit → hormati header Retry-After kalau ada, kalau tidak pakai backoff
      const retryAfterHeader = e.response?.headers?.['retry-after'];
      const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : null;
      const backoffMs = retryAfterMs || baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s...

      console.warn(`[jikanGet] Percobaan ${attempt + 1} gagal (${status || e.message}), retry dalam ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  // Semua percobaan gagal — lempar error yang lebih informatif
  const status = lastErr.response?.status;
  if (status === 429) {
    throw new Error('Jikan API sedang rate limit (terlalu banyak request). Coba lagi dalam beberapa detik.');
  }
  if (status >= 500) {
    throw new Error(`Jikan API sedang bermasalah di server mereka (HTTP ${status}). Coba lagi nanti.`);
  }
  if (status === 404) {
    throw new Error('Data tidak ditemukan di Jikan API (404).');
  }
  throw lastErr;
}

// ─── Helper: potong teks panjang ─────────────────────────────────────────────
function trim(str, max = 200) {
  if (!str) return '-';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ─── Helper: kirim interactiveMessage ────────────────────────────────────────
// FIX: payload sebelumnya dikirim sebagai plain object (interactiveMessage: payload)
// tanpa dibungkus proto.Message.InteractiveMessage.create(...). Baileys butuh
// instance protobuf asli, bukan object biasa — makanya SEMUA sub-command .anime
// (info, search, jadwal, detail, download) yang lewat sini gagal terkirim.
// Sekarang disamakan dengan pola listbut3() di alya.js yang sudah terbukti jalan.
async function sendInteractive(alya, m, payload) {
  const header = payload.header
    ? proto.Message.InteractiveMessage.Header.create(payload.header)
    : undefined;
  const body = payload.body
    ? proto.Message.InteractiveMessage.Body.create(payload.body)
    : undefined;
  const footer = payload.footer
    ? proto.Message.InteractiveMessage.Footer.create(payload.footer)
    : undefined;
  const nativeFlowMessage = payload.nativeFlowMessage
    ? proto.Message.InteractiveMessage.NativeFlowMessage.create(payload.nativeFlowMessage)
    : undefined;

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header,
          body,
          footer,
          nativeFlowMessage
        })
      }
    }
  }, { quoted: m });
  await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

// ─── Helper: kirim carousel ───────────────────────────────────────────────────
async function sendCarousel(alya, m, bodyText, cards) {
  // Coba kirim sebagai carousel interactiveMessage
  try {
    if (!proto?.Message?.InteractiveMessage?.CarouselMessage) throw new Error('CarouselMessage tidak tersedia');

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
          })
        }
      }
    }, { quoted: m });
    await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
  } catch (carouselErr) {
    // Fallback: kirim sebagai teks biasa
    console.warn('[sendCarousel] Carousel tidak didukung, fallback teks:', carouselErr.message);
    throw carouselErr; // biarkan caller handle fallback
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMMAND HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. .anime <judul>  — info via Jikan (MAL) ───────────────────────────────
async function handleAnimeInfo(alya, m, ctx, query) {
  const { prefix, replyalya } = ctx;
  await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  let anime;
  try {
    const json = await jikanGet(`/anime?q=${encodeURIComponent(query)}&limit=1`);
    anime = json?.data?.[0];
  } catch (e) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return replyalya(`❌ Gagal mengambil data dari Jikan API.\n_${e.message}_`);
  }

  if (!anime) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return replyalya(`❌ Anime *${query}* tidak ditemukan.`);
  }

  const genres   = (anime.genres || []).map(g => g.name).join(', ') || '-';
  const studios  = (anime.studios || []).map(s => s.name).join(', ') || '-';
  const synopsis = trim(anime.synopsis || '-', 350);

  const caption =
    `🎌 *${anime.title}*\n` +
    (anime.title_english ? `🇬🇧 *English:* ${anime.title_english}\n` : '') +
    (anime.title_japanese ? `🇯🇵 *Jepang:* ${anime.title_japanese}\n` : '') +
    `\n` +
    `⭐ *Skor:* ${anime.score ?? '-'}  |  🏆 *Rank:* #${anime.rank ?? '-'}\n` +
    `📺 *Tipe:* ${anime.type || '-'}  |  🔢 *Episode:* ${anime.episodes ?? '?'}\n` +
    `📈 *Status:* ${anime.status || '-'}\n` +
    `🗓️ *Tayang:* ${anime.aired?.string || '-'}\n` +
    `⏱️ *Durasi:* ${anime.duration || '-'}\n` +
    `🎭 *Genre:* ${genres}\n` +
    `🏢 *Studio:* ${studios}\n` +
    `🔞 *Rating:* ${anime.rating || '-'}\n` +
    `\n📝 *Sinopsis:*\n${synopsis}`;

  try {
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
    let media = {};
    if (imageUrl) {
      media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: alya.waUploadToServer });
    }

    const malId = anime.mal_id;
    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🔎 Cari Download',
          id: `${prefix}anime search ${query}`
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🌐 MAL Page',
          url: anime.url || `https://myanimelist.net/anime/${malId}`,
          merchant_url: anime.url || `https://myanimelist.net/anime/${malId}`
        })
      }
    ];

    await sendInteractive(alya, m, {
      header: imageUrl ? {
        title: anime.title,
        hasMediaAttachment: true,
        ...media
      } : { title: anime.title, hasMediaAttachment: false },
      body: { text: caption },
      footer: { text: `MAL ID: ${malId} • Powered by Jikan API` },
      nativeFlowMessage: { buttons }
    });

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('[anime info send]', e.message);
    // Fallback: kirim biasa
    const imageUrl = anime.images?.jpg?.image_url;
    if (imageUrl) {
      await alya.sendMessage(m.chat, { image: { url: imageUrl }, caption }, { quoted: m });
    } else {
      await alya.sendMessage(m.chat, { text: caption }, { quoted: m });
    }
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
}

// ─── 2. .anime search <judul> ─────────────────────────────────────────────────
async function handleAnimeSearch(alya, m, ctx, query) {
  const { prefix, replyalya } = ctx;
  await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  const res = await animeSearch(query);
  const results = res?.data?.animeList || [];

  if (results.length === 0) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return replyalya('❌ Tidak ada hasil ditemukan.');
  }

  const sections = results.slice(0, 10).map((item, i) => ({
    title: `${i + 1}. ${item.title.toUpperCase()}`,
    rows: [
      {
        header: 'DETAIL ANIME',
        title: '📜 Detail',
        description: `⭐ ${item.score ?? '-'} | ${item.status ?? '-'}`,
        id: `${prefix}anime detail ${item.animeId}`
      },
      {
        header: 'DOWNLOAD ANIME',
        title: '📥 Download',
        description: 'Lihat episode & link download',
        id: `${prefix}anime download ${item.animeId}`
      }
    ]
  }));

  try {
    await sendInteractive(alya, m, {
      header: { title: '🔎 Hasil Pencarian Anime', hasMediaAttachment: false },
      body: { text: `Menampilkan ${results.length} hasil untuk:\n_${query}_` },
      footer: { text: `${global.botname || 'Alya Bot'}` },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({ title: '📌 Pilih Anime', sections })
        }]
      }
    });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('[anime search send]', e.message);
    // Fallback teks
    let teks = `🔎 *Hasil Pencarian: ${query}*\n\n`;
    results.slice(0, 10).forEach((item, i) => {
      teks += `${i + 1}. *${item.title}*\n   ⭐ ${item.score ?? '-'} | ${item.status ?? '-'}\n   🔗 ID: ${item.animeId}\n\n`;
    });
    teks += `Ketik: *${prefix}anime detail <ID>* untuk detail`;
    await alya.sendMessage(m.chat, { text: teks }, { quoted: m });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
}

// ─── 3. .anime jadwal ─────────────────────────────────────────────────────────
// CATATAN: Sengaja pakai teks biasa (bukan carousel/interactiveMessage)
// agar 100% kompatibel semua versi WhatsApp dan tidak muncul pesan
// "versi WhatsApp Anda tidak mendukungnya"
async function handleAnimeJadwal(alya, m, ctx, hariInput) {
  const { prefix, command, reply, replyalya } = ctx;
  await alya.sendMessage(m.chat, { react: { text: '📅', key: m.key } });

  const scheduleRes = await animeSchedule();

  if (!scheduleRes || scheduleRes.status !== 'success' || !scheduleRes.data) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return replyalya(`❌ Gagal mengambil jadwal anime.\n_${scheduleRes?.message || 'API error'}_`);
  }

  // Tampilkan daftar hari jika tidak ada argumen
  if (!hariInput) {
    let teks = '╭─「 📅 *JADWAL ANIME MINGGUAN* 」\n│\n';
    scheduleRes.data.forEach(item => {
      teks += `│ 📺 *${item.day}* — ${item.anime_list?.length ?? 0} anime\n`;
      teks += `│   → ${prefix}${command} jadwal ${item.day}\n│\n`;
    });
    teks += `╰──────────────────────\n\n_Ketik perintah di atas untuk lihat anime per hari_`;
    await alya.sendMessage(m.chat, { text: teks }, { quoted: m });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    return;
  }

  // Ada argumen hari
  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let selectedData = [];
  if (hariInput.toLowerCase() === 'all') {
    scheduleRes.data.forEach(d => selectedData.push(...(d.anime_list || [])));
  } else {
    const findDay = scheduleRes.data.find(
      d => d.day && d.day.toLowerCase() === hariInput.toLowerCase()
    );
    if (findDay) selectedData = findDay.anime_list || [];
  }

  if (!selectedData.length) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return reply(
      `❌ Tidak ada jadwal anime untuk hari *${hariInput}*.\n` +
      `Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu, atau *all*.`
    );
  }

  const limitAnime = selectedData.slice(0, 20);

  // Kirim sebagai teks biasa — kompatibel semua versi WA
  let teks = `╭─「 📅 *ANIME HARI ${hariInput.toUpperCase()}* 」\n│\n`;
  limitAnime.forEach((a, i) => {
    const slug = a.slug || (a.url ? a.url.split('/').pop() : '-');
    teks += `│ ${i + 1}. *${a.title || 'Unknown'}*\n`;
    teks += `│    🔗 \`${slug}\`\n│\n`;
  });
  teks +=
    `╰──────────────────────\n` +
    `_${limitAnime.length} dari ${selectedData.length} anime_\n\n` +
    `📌 Detail: *${prefix}${command} detail <slug>*`;

  await alya.sendMessage(m.chat, { text: teks }, { quoted: m });
  await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
}

// ─── 4. .anime detail <slug> — versi enhanced ────────────────────────────────
async function handleAnimeDetail(alya, m, ctx, slug) {
  const { prefix, command, reply, replyalya } = ctx;
  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  // Coba primary API (sankavollerei) dulu
  let info = null;
  const res = await animeDetail(slug).catch(() => null);
  if (res?.status === 'success' && res?.data) {
    info = res.data;
  }

  // Fallback: Jikan jika primary gagal atau slug adalah MAL ID
  if (!info) {
    try {
      const isId = /^\d+$/.test(slug);
      if (isId) {
        const json = await jikanGet(`/anime/${slug}/full`);
        const a = json?.data;
        if (a) {
          info = {
            title: a.title,
            japanese: a.title_japanese,
            score: a.score,
            rank: a.rank,
            popularity: a.popularity,
            studios: (a.studios || []).map(s => s.name).join(', '),
            producers: (a.producers || []).map(p => p.name).join(', '),
            type: a.type,
            status: a.status,
            duration: a.duration,
            aired: a.aired?.string,
            rating: a.rating,
            genreList: a.genres?.map(g => ({ title: g.name })),
            synopsis: { paragraphs: [a.synopsis || '-'] },
            poster: a.images?.jpg?.large_image_url,
            trailer: a.trailer?.url,
            episodeList: [],
            batch: null,
            _source: 'jikan',
            _malId: a.mal_id
          };
        }
      }
    } catch (e) {
      // FIX: dulu error di-swallow diam-diam (catch kosong) — sekarang minimal
      // di-log supaya kelihatan di console kalau Jikan gagal (rate limit/dsb),
      // bukan cuma "tidak ditemukan" tanpa penjelasan.
      console.warn('[anime detail] Jikan fallback gagal:', e.message);
    }
  }

  if (!info) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return reply('❌ Detail anime tidak ditemukan.\nCek slug/ID dan coba lagi.');
  }

  const genres = info.genreList ? info.genreList.map(g => g.title).join(', ') : '-';
  const synopsis = info.synopsis?.paragraphs?.join('\n\n') || info.synopsis || '-';
  const episodeCount = info.episodeList?.length ?? 0;

  // ── Tampilan detail versi Alya (enhanced) ──────────────────────────────────
  const caption =
    `╔══〔 🎬 *ANIME DETAIL* 〕══╗\n` +
    `┃\n` +
    `┃  🎌 *${info.title}*\n` +
    (info.japanese   ? `┃  🇯🇵 *Jepang:* ${info.japanese}\n` : '') +
    `┃\n` +
    `┃  ⭐ *Skor:* ${info.score ?? '-'}` + (info.rank       ? `  🏆 *Rank:* #${info.rank}` : '') + `\n` +
    `┃  📺 *Tipe:* ${info.type || '-'}\n` +
    `┃  📈 *Status:* ${info.status || '-'}\n` +
    `┃  🕒 *Durasi:* ${info.duration || '-'}\n` +
    `┃  🗓️ *Tayang:* ${info.aired || '-'}\n` +
    (info.rating     ? `┃  🔞 *Rating:* ${info.rating}\n` : '') +
    `┃  🏢 *Studio:* ${info.studios || '-'}\n` +
    (info.producers  ? `┃  🏭 *Produser:* ${info.producers}\n` : '') +
    `┃  🎭 *Genre:* ${genres}\n` +
    (episodeCount > 0 ? `┃  📋 *Episode tersedia:* ${episodeCount}\n` : '') +
    `┃\n` +
    `┃  📝 *Sinopsis:*\n` +
    `┃  ${trim(synopsis, 400).replace(/\n/g, '\n┃  ')}\n` +
    `┃\n` +
    `╚══════════════════════════╝`;

  // ── Tombol aksi ───────────────────────────────────────────────────────────
  const buttons = [];

  // Tombol download (pilih episode/batch)
  if (episodeCount > 0 || info.batch?.batchId) {
    const dlRows = [];
    if (info.batch?.batchId) {
      dlRows.push({
        header: '📦 BATCH',
        title: 'BATCH FULL',
        description: 'Download batch semua episode',
        id: `${prefix}${command} download ${info.batch.batchId}`
      });
    }
    if (episodeCount > 0) {
      info.episodeList.slice(0, 8).forEach(ep => {
        dlRows.push({
          header: '',
          title: `Episode ${ep.eps}`,
          description: ep.date || '-',
          id: `${prefix}${command} download ${ep.episodeId}`
        });
      });
      if (episodeCount > 8) {
        dlRows.push({
          header: '',
          title: `… ${episodeCount - 8} episode lainnya`,
          description: `Gunakan: ${prefix}${command} download <slug episode>`,
          id: `${prefix}${command} download ${slug}`
        });
      }
    }
    buttons.push({
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '📥 Pilih Episode',
        sections: [{ title: '📋 Daftar Episode', rows: dlRows }]
      })
    });
  }

  // Tombol copy slug
  buttons.push({
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({
      display_text: '🆔 Salin Slug',
      copy_code: slug
    })
  });

  // Tombol trailer (jika ada)
  if (info.trailer) {
    buttons.push({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: '🎬 Trailer',
        url: info.trailer,
        merchant_url: info.trailer
      })
    });
  }

  try {
    let media = {};
    if (info.poster) {
      media = await prepareWAMessageMedia(
        { image: { url: info.poster } },
        { upload: alya.waUploadToServer }
      );
    }

    await sendInteractive(alya, m, {
      header: info.poster ? {
        title: info.title,
        hasMediaAttachment: true,
        ...media
      } : { title: info.title, hasMediaAttachment: false },
      body: { text: caption },
      footer: { text: info._source === 'jikan' ? `MAL ID: ${info._malId} • Jikan API` : `${global.botname || 'Alya Bot'}` },
      nativeFlowMessage: { buttons }
    });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('[anime detail send]', e.message);
    if (info.poster) {
      await alya.sendMessage(m.chat, { image: { url: info.poster }, caption }, { quoted: m });
    } else {
      await alya.sendMessage(m.chat, { text: caption }, { quoted: m });
    }
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
}

// ─── 5. .anime download <slug> ───────────────────────────────────────────────
// ─── Helper: deteksi & beri ikon server dari URL/title ───────────────────────
function serverIcon(titleOrUrl) {
  const s = (titleOrUrl || '').toLowerCase();
  if (s.includes('mega'))       return '🟣 Mega';
  if (s.includes('desustream') || s.includes('desu')) return '🟠 Desustream';
  if (s.includes('gdrive') || s.includes('google'))   return '🔵 GDrive';
  if (s.includes('pixeldrain') || s.includes('pd'))   return '🟡 Pixeldrain';
  if (s.includes('solidfiles') || s.includes('sf'))   return '🟢 SolidFiles';
  if (s.includes('mediafire'))  return '🔴 Mediafire';
  if (s.includes('gofile'))     return '⚪ GoFile';
  if (s.includes('catbox'))     return '📦 Catbox';
  if (s.includes('buzzheavier'))return '🟤 BuzzHeavier';
  if (s.includes('krakenfiles')) return '🐙 KrakenFiles';
  if (s.includes('racaty'))     return '🟣 Racaty';
  if (s.includes('zippyshare')) return '🟠 Zippy';
  return '🌐 Mirror';
}

// ─── Helper: cek apakah URL bisa di-animedl (Mega / Desustream / direct) ──────
function isDownloadable(url) {
  if (!url) return false;
  return (
    url.includes('mega.nz') ||
    url.includes('desustream') ||
    url.includes('pixeldrain.com') ||
    url.includes('gofile.io') ||
    url.includes('buzzheavier') ||
    url.includes('krakenfiles') ||
    url.includes('mediafire.com') ||
    /\.(mp4|mkv|webm|m4v|avi)(\?.*)?$/i.test(url)
  );
}

// ─── Helper: build rows dari daftar url (tampilkan SEMUA link per kualitas) ──
// maxPerSection: batas baris per section (WA limit ~10 per section)
function buildAllLinkRows(qualityLabel, size, urls, cmdPrefix, maxPerSection = 9) {
  const rows = [];
  for (const u of (urls || [])) {
    if (!u?.url) continue;
    const icon  = serverIcon(u.title || u.url);
    const label = u.title ? `${icon} — ${u.title}` : icon;
    const canDl = isDownloadable(u.url);
    rows.push({
      header: qualityLabel,
      title:  `${qualityLabel} • ${label}`,
      description: `📦 ${size || '-'}${canDl ? ' • ketuk untuk download' : ' • buka di browser'}`,
      id: canDl ? `.animedl ${u.url}` : `.animedl ${u.url}`,
    });
    if (rows.length >= maxPerSection) break;
  }
  return rows;
}

async function handleAnimeDownload(alya, m, ctx, slug) {
  const { prefix, command, reply, replyalya } = ctx;
  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let sections    = [];
  let contentTitle = slug;
  let isEpisodeView = false;

  // ── Cek apakah slug = halaman anime (list episode) atau episode/batch langsung ──
  const resDetail = await animeDetail(slug).catch(() => null);

  if (resDetail?.data) {
    // ── MODE ANIME: daftar episode & batch ──────────────────────────────────
    const info = resDetail.data;
    contentTitle = info.title;

    // Batch (tampilkan SEMUA link per kualitas)
    if (info.batch?.batchId) {
      const resBatch = await animeBatch(info.batch.batchId).catch(() => null);
      if (resBatch?.data?.downloadUrl?.formats) {
        const batchRows = [];
        resBatch.data.downloadUrl.formats.forEach(fmt => {
          fmt.qualities.forEach(q => {
            const rows = buildAllLinkRows(`📦 ${q.title}`, q.size, q.urls);
            batchRows.push(...rows);
          });
        });
        if (batchRows.length > 0) sections.push({ title: '📦 BATCH — Semua Server', rows: batchRows.slice(0, 10) });
      }
    }

    // List episode (pilih episode dulu → baru resolusi)
    if (info.episodeList?.length > 0) {
      const epRows = info.episodeList.slice(0, 10).map(ep => ({
        header: `Ep ${ep.eps}`,
        title:  `📺 Episode ${ep.eps}`,
        description: ep.date || 'Tersedia — pilih untuk lihat server download',
        id: `${prefix}${command} download ${ep.episodeId}`,
      }));
      sections.push({ title: '📺 LIST EPISODE', rows: epRows });
    }

  } else {
    // ── MODE EPISODE / BATCH langsung: tampilkan semua link per kualitas ────
    isEpisodeView = true;

    const [resEp, resBatch] = await Promise.all([
      animeEpisode(slug).catch(() => null),
      animeBatch(slug).catch(() => null),
    ]);

    if (resEp?.data?.downloadUrl?.qualities) {
      // ── Episode: tampilkan setiap kualitas sebagai section ──────────────
      contentTitle = resEp.data.title || slug;
      const quals = resEp.data.downloadUrl.qualities;

      // Kelompokkan per kualitas → tiap kualitas = 1 section
      for (const q of quals) {
        const rows = buildAllLinkRows(`🎞️ ${q.title}`, q.size, q.urls);
        if (rows.length > 0) {
          sections.push({ title: `🎥 ${q.title} — ${q.size || '?'}`, rows });
        }
      }

      // Fallback flat jika tidak ada section terisi
      if (sections.length === 0) {
        const flatRows = [];
        quals.forEach(q => flatRows.push(...buildAllLinkRows(`🎞️ ${q.title}`, q.size, q.urls)));
        if (flatRows.length > 0) sections.push({ title: '🎥 Resolusi Download', rows: flatRows.slice(0, 10) });
      }

    } else if (resBatch?.data?.downloadUrl?.formats) {
      // ── Batch langsung ────────────────────────────────────────────────────
      contentTitle = resBatch.data.title || slug;
      const fmts   = resBatch.data.downloadUrl.formats;

      for (const fmt of fmts) {
        for (const q of fmt.qualities) {
          const rows = buildAllLinkRows(`📦 ${q.title}`, q.size, q.urls);
          if (rows.length > 0) {
            sections.push({ title: `📦 ${fmt.title || 'BATCH'} ${q.title} — ${q.size || '?'}`, rows });
          }
        }
      }
    }
  }

  if (sections.length === 0) {
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return reply(
      '❌ Data download tidak ditemukan.\n\n' +
      '_Pastikan slug benar. Gunakan_ `.anime search <judul>` _untuk mencari slug yang valid._'
    );
  }

  // ── Batas WA: max 5 section, tiap section max 10 row ──────────────────────
  const trimmedSections = sections.slice(0, 5).map(s => ({
    ...s,
    rows: s.rows.slice(0, 10),
  }));

  try {
    await sendInteractive(alya, m, {
      header: { title: '📥 Anime Downloader', hasMediaAttachment: false },
      body: {
        text:
          `*📥 DOWNLOAD ANIME*\n` +
          `📌 _${contentTitle}_\n\n` +
          `Semua server ditampilkan per kualitas.\n` +
          `Pilih server & kualitas → bot otomatis download & kirim file!\n\n` +
          `✅ *Support:* Mega.nz, Desustream, Pixeldrain, dll\n` +
          `📁 File dikirim sebagai *dokumen*`,
      },
      footer: { text: `${global.botname || 'Alya Bot'} • .animedl <url>` },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: isEpisodeView ? '📥 Pilih Server & Kualitas' : '📋 Pilih Episode / Server',
            sections: trimmedSections,
          }),
        }],
      },
    });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('[anime download send]', e.message);
    // Fallback: teks biasa
    let teks = `📥 *DOWNLOAD: ${contentTitle}*\n\n`;
    trimmedSections.forEach(sec => {
      teks += `*${sec.title}*\n`;
      sec.rows.forEach(r => {
        teks += `• ${r.title}\n  ${r.description}\n  → \`${r.id}\`\n\n`;
      });
    });
    await alya.sendMessage(m.chat, { text: teks }, { quoted: m });
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
}

// ─── Resolver: desustream / safelink → URL final (mega.nz / mp4 / gdrive) ───
async function resolveDesustream(inputUrl) {
  // STRATEGI 1: Coba HTTP request biasa (follow redirect)
  const resp = await axios.get(inputUrl, {
    maxRedirects: 10,
    timeout: 25000,
    validateStatus: s => s >= 200 && s < 500,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      'Referer': 'https://desustream.com/',
    }
  });

  // Jika ada HTTP location header langsung
  if (resp.headers.location) return resp.headers.location;

  const html = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);

  // STRATEGI 2: Cari inline JS yang decode URL — pattern desustream
  // Desustream sering encode URL dalam base64 di dalam script tag
  // Cari pola: var url = atob("...") atau var link = atob("...")
  const atobMatch = html.match(/(?:var|let|const)\s+(?:url|link|href|target|finalUrl|dlurl)\s*=\s*atob\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)/i);
  if (atobMatch) {
    try {
      const decoded = Buffer.from(atobMatch[1], 'base64').toString('utf-8');
      if (decoded.startsWith('http')) return decoded;
    } catch {}
  }

  // STRATEGI 3: Cari semua atob() call di dalam script dan decode
  const allAtob = [...html.matchAll(/atob\(\s*["']([A-Za-z0-9+/=]{20,})["']\s*\)/gi)];
  for (const match of allAtob) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      if (decoded.startsWith('https://mega.nz')) return decoded;
      if (decoded.startsWith('https://drive.google.com')) return decoded;
      if (decoded.startsWith('http') && decoded.match(/\.(mp4|mkv|webm)/i)) return decoded;
    } catch {}
  }

  // STRATEGI 4: Parse URL ?id= parameter — desustream kadang encode mega link di sana
  try {
    const urlObj = new URL(inputUrl);
    const idParam = urlObj.searchParams.get('id');
    if (idParam) {
      // Coba decode double base64
      const layer1 = Buffer.from(idParam, 'base64').toString('utf-8');
      const layer2 = Buffer.from(layer1, 'base64').toString('utf-8');
      if (layer2.startsWith('http')) return layer2;
      if (layer1.startsWith('http')) return layer1;

      // Kadang diobfuscate dengan XOR atau crypto-js — cari key di script
      const keyMatch = html.match(/(?:key|secret|k)\s*=\s*["']([^"']{8,64})["']/i);
      if (keyMatch) {
        // Coba CryptoJS decrypt jika tersedia
        try {
          const CryptoJS = require('crypto-js');
          const decrypted = CryptoJS.AES.decrypt(idParam, keyMatch[1]).toString(CryptoJS.enc.Utf8);
          if (decrypted.startsWith('http')) return decrypted;
        } catch {}
      }
    }
  } catch {}

  // STRATEGI 5: Parse HTML dengan regex prioritas tinggi ke rendah
  const patterns = [
    // window.location assignment
    /window\.location(?:\.href)?\s*=\s*["'](https?:\/\/[^"'\s]+)["']/i,
    // href mega.nz langsung
    /href=["'](https?:\/\/mega\.nz\/[^"'\s]+)["']/i,
    // link mega.nz di teks biasa
    /https?:\/\/mega\.nz\/(?:file|folder)\/[A-Za-z0-9_#!\-]+/,
    // meta refresh
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"'>\s]+)/i,
    // data-url / data-href attr
    /data-(?:url|href|link|src)=["'](https?:\/\/[^"'\s]+)["']/i,
    // onclick dengan URL
    /onclick=[^>]*["'](https?:\/\/(?:mega\.nz|drive\.google)[^"'\s]+)["']/i,
    // href gdrive
    /href=["'](https?:\/\/drive\.google\.com\/[^"'\s]+)["']/i,
    // direct mp4/mkv link
    /https?:\/\/[^\s"'<>]+\.(?:mp4|mkv|webm)(?:\?[^\s"'<>]*)?/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = match[1] || match[0];
      if (url && url.startsWith('http')) return url;
    }
  }

  // STRATEGI 6: Coba JSDOM untuk execute JS ringan (tanpa browser penuh)
  try {
    const { JSDOM } = require('jsdom');
    let capturedUrl = null;
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: inputUrl,
      virtualConsole: (() => {
        const vc = new (require('jsdom').VirtualConsole)();
        return vc;
      })(),
      beforeParse(window) {
        // Intercept window.location assignment
        let _loc = inputUrl;
        Object.defineProperty(window, 'location', {
          get() { return { href: _loc, assign: u => { capturedUrl = u; }, replace: u => { capturedUrl = u; } }; },
          set(val) { capturedUrl = typeof val === 'string' ? val : val?.href; }
        });
      }
    });
    // Tunggu sebentar agar script jalan
    await new Promise(r => setTimeout(r, 1500));
    if (capturedUrl && capturedUrl.startsWith('http') && capturedUrl !== inputUrl) {
      return capturedUrl;
    }
  } catch (jsdomErr) {
    console.warn('[resolveDesustream] JSDOM gagal:', jsdomErr.message);
  }

  // Tidak bisa resolve — kembalikan URL asli agar caller bisa tampilkan error yang informatif
  throw new Error('UNRESOLVABLE:' + inputUrl);
}

// ─── 6. .animedl <url> — delegasi ke plugin animedl.js ─────────────────────
// Semua logika download ada di plugins/cmd/animedl.js untuk DRY
// anime.js cukup panggil ulang run() dari animedl.js
const _animedlPlugin = require('./animedl');

async function handleAnimeDl(alya, m, ctx, inputUrl) {
  const { replyalya } = ctx;
  if (!inputUrl) {
    return replyalya(
      `❌ Masukkan URL terlebih dahulu!\n\n` +
      `Contoh:\n` +
      `• \`.animedl https://mega.nz/file/ID#KEY\`\n` +
      `• \`.animedl https://desustream.me/...\`\n` +
      `• \`.animedl https://pixeldrain.com/u/ID\``
    );
  }
  // Inject url ke args lalu panggil plugin animedl.js
  const fakeCtx = { ...ctx, args: inputUrl.split(' '), text: inputUrl };
  return _animedlPlugin.run(alya, m, fakeCtx);
}


// ═════════════════════════════════════════════════════════════════════════════
// MAIN PLUGIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════
module.exports = {
  command: ['anime', 'animedl'],
  tags: ['anime'],

  run: async (alya, m, ctx) => {
    const { command, args, prefix, replyalya } = ctx;

    // ── .animedl <url> ───────────────────────────────────────────────────────
    if (command === 'animedl') {
      return handleAnimeDl(alya, m, ctx, args.join(' ').trim());
    }

    // ── .anime ───────────────────────────────────────────────────────────────
    if (!args.length) {
      return replyalya(
        `📌 *Format Perintah Anime:*\n\n` +
        `• *${prefix}anime <judul>*\n` +
        `  → Info anime dari MyAnimeList\n\n` +
        `• *${prefix}anime search <judul>*\n` +
        `  → Cari anime + link download\n\n` +
        `• *${prefix}anime jadwal*\n` +
        `  → Jadwal anime tayang mingguan\n\n` +
        `• *${prefix}anime detail <slug>*\n` +
        `  → Detail anime + list episode\n\n` +
        `• *${prefix}anime download <slug>*\n` +
        `  → Download episode/batch anime\n\n` +
        `• *${prefix}animedl <url>*\n` +
        `  → Kirim file video anime ke chat (MP4)`
      );
    }

    const sub = args[0].toLowerCase();

    try {
      if (sub === 'search') {
        const query = args.slice(1).join(' ').trim();
        if (!query) return replyalya('❌ Masukkan judul anime!\nContoh: `.anime search Naruto`');
        return handleAnimeSearch(alya, m, ctx, query);
      }

      if (sub === 'jadwal') {
        const hari = args.slice(1).join(' ').trim() || null;
        return handleAnimeJadwal(alya, m, ctx, hari);
      }

      if (sub === 'detail') {
        const slug = args.slice(1).join(' ').trim();
        if (!slug) return replyalya('❌ Masukkan slug atau ID!\nContoh: `.anime detail naruto-sub-indo`');
        return handleAnimeDetail(alya, m, ctx, slug);
      }

      if (sub === 'download') {
        const slug = args.slice(1).join(' ').trim();
        if (!slug) return replyalya('❌ Masukkan slug atau ID!\nContoh: `.anime download boruto-episode-1-sub-indo`');
        return handleAnimeDownload(alya, m, ctx, slug);
      }

      // Default: .anime <judul> → info dari Jikan
      const query = args.join(' ').trim();
      return handleAnimeInfo(alya, m, ctx, query);

    } catch (err) {
      console.error('[anime plugin]', err);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(`❌ Terjadi kesalahan:\n_${err.message}_`);
    }
  }
};
