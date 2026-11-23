// Plugin: pinterest
// Commands: pin, pinterest
// V20 UPDATE:
//   ✅ Kirim SATU gambar saja per pencarian (bukan carousel/album lagi —
//      carousel sebelumnya tidak muncul di WhatsApp/hening)
//   ✅ Tombol "🔄 Gambar Lain" untuk lihat gambar berikutnya dari hasil
//      pencarian yang sama, tanpa perlu ketik ulang keyword
//   ✅ Multi-source API dengan 3 fallback (nexray → naoai → internal Pinterest)
//   ✅ Tidak butuh API key eksternal berbayar

'use strict';

const axios = require('axios');

// ── Baileys imports ────────────────────────────────────────────────────────
let generateWAMessageFromContent, proto, prepareWAMessageMedia;
try {
  ({ generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys'));
} catch {
  generateWAMessageFromContent = global.generateWAMessageFromContent || null;
  proto                        = global.proto                        || null;
  prepareWAMessageMedia        = global.prepareWAMessageMedia        || null;
}

// ═══════════════════════════════════════════════════════════════
// ── SUMBER DATA: 3 API Fallback
// ═══════════════════════════════════════════════════════════════

/**
 * API 1: nexray — free, stabil, return array langsung
 */
async function fromNexray(query, limit) {
  const { data } = await axios.get(
    `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(query)}`,
    { timeout: 15000 }
  );
  if (!data?.status || !Array.isArray(data.result) || !data.result.length)
    throw new Error('nexray: no result');

  return data.result.slice(0, limit).map((item, i) => ({
    imageUrl   : item.images_url,
    title      : item.grid_title || item.title || `Pin ${i + 1}`,
    description: item.description || '',
    pinUrl     : item.pin || '',
  })).filter(x => x.imageUrl);
}

/**
 * API 2: naoai — free, format sedikit beda
 */
async function fromNaoai(query, limit) {
  const { data } = await axios.get(
    `https://api.naoai.web.id/api/pinterest?query=${encodeURIComponent(query)}`,
    { timeout: 15000 }
  );
  if (!Array.isArray(data?.data) || !data.data.length)
    throw new Error('naoai: no result');

  return data.data.slice(0, limit).map((item, i) => ({
    imageUrl   : item.url || item.image || item.images_url,
    title      : item.title || `Pin ${i + 1}`,
    description: item.description || '',
    pinUrl     : item.pin || '',
  })).filter(x => x.imageUrl);
}

/**
 * API 3: Pinterest BaseSearchResource (internal API — tanpa key)
 */
async function fromPinterestInternal(query, limit) {
  const params = new URLSearchParams({
    source_url: `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
    data: JSON.stringify({
      options: { isPrefetch: false, query, scope: 'pins', no_fetch_context_on_resource: false },
      context: {},
    }),
    _: Date.now().toString(),
  });

  const { data } = await axios.get(
    `https://www.pinterest.com/resource/BaseSearchResource/get/?${params}`,
    {
      headers: {
        'User-Agent'          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept'              : 'application/json, text/javascript, */*, q=0.01',
        'Accept-Language'     : 'en-US,en;q=0.9',
        'X-Requested-With'    : 'XMLHttpRequest',
        'X-Pinterest-AppState': 'active',
        'Referer'             : `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
      },
      timeout: 15000,
    }
  );

  const results = data?.resource_response?.data?.results ?? [];
  if (!results.length) throw new Error('internal: no result');

  return results.slice(0, limit).map((item, i) => {
    const imgs = item.images ?? {};
    const imageUrl =
      imgs['736x']?.url || imgs['564x']?.url || imgs['474x']?.url ||
      imgs['236x']?.url || item.image_cover_hd_url || null;
    return {
      imageUrl,
      title      : item.grid_title || item.title || `Pin ${i + 1}`,
      description: item.description || '',
      pinUrl     : item.id ? `https://www.pinterest.com/pin/${item.id}/` : '',
    };
  }).filter(x => x.imageUrl);
}

/**
 * Master fetcher — coba 3 sumber, pakai yang berhasil pertama
 */
async function fetchPins(query, limit = 10) {
  // 1. nexray
  try {
    const items = await fromNexray(query, limit);
    if (items.length) return { source: 'nexray', items };
  } catch (e) { console.warn('[pin] nexray gagal:', e.message); }

  // 2. naoai
  try {
    const items = await fromNaoai(query, limit);
    if (items.length) return { source: 'naoai', items };
  } catch (e) { console.warn('[pin] naoai gagal:', e.message); }

  // 3. Pinterest internal
  try {
    const items = await fromPinterestInternal(query, limit);
    if (items.length) return { source: 'internal', items };
  } catch (e) { console.warn('[pin] internal gagal:', e.message); }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// ── PLUGIN EXPORT
// ═══════════════════════════════════════════════════════════════
module.exports = {
  command: ['pin', 'pinterest'],
  tags   : ['general'],
  run    : async (alya, m, ctx) => {
    const { command, text: rawText, prefix, replyalya, reply } = ctx;

    // ── Parse "keyword|index" dari tombol "Gambar Lain", atau keyword biasa ──
    // Format id tombol: .pin <keyword>|<index>
    let query = (rawText || '').trim();
    let requestedIndex = 0;

    const pipeAt = query.lastIndexOf('|');
    if (pipeAt !== -1) {
      const maybeIndex = query.slice(pipeAt + 1).trim();
      if (/^\d+$/.test(maybeIndex)) {
        requestedIndex = parseInt(maybeIndex, 10);
        query = query.slice(0, pipeAt).trim();
      }
    }

    // ── Usage hint ──
    if (!query) return reply(
      `╭─「 📌 *PINTEREST* 」\n│\n` +
      `│ Cari gambar dari Pinterest\n│\n` +
      `│ *Cara pakai:*\n│ ${prefix}${command} <keyword>\n│\n` +
      `│ *Contoh:*\n│ ${prefix}${command} anime aesthetic\n│ ${prefix}${command} nature wallpaper\n│\n` +
      `│ Setelah hasil muncul, tekan tombol\n│ *🔄 Gambar Lain* untuk lihat gambar\n│ berikutnya dari keyword yang sama.\n` +
      `╰──────────────────`
    );

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    // ── Ambil data (limit 10 hasil, dipakai bergiliran lewat tombol) ──
    let result;
    try {
      result = await fetchPins(query, 10);
    } catch (e) {
      console.error('[pin] fetchPins error:', e.message);
    }

    if (!result || !result.items.length) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return replyalya(
        `❌ *Tidak ada hasil untuk "${query}"*\n\n` +
        `_Coba gunakan kata kunci yang lebih umum_`
      );
    }

    const { items } = result;
    // Index berputar (looping) supaya tombol "Gambar Lain" tetap jalan
    // meski sudah melewati jumlah hasil yang tersedia.
    const index = ((requestedIndex % items.length) + items.length) % items.length;
    const item  = items[index];
    const nextIndex = (index + 1) % items.length;

    const caption =
      `📌 *${item.title && !/^Pin \d+$/.test(item.title) ? item.title : query}*\n` +
      (item.description ? `📝 ${item.description.slice(0, 150)}${item.description.length > 150 ? '...' : ''}\n` : '') +
      `\n🖼️ Gambar ${index + 1}/${items.length}  •  Pinterest`;

    // ── Tombol: Gambar Lain (siklus ke index berikutnya) + Lihat di Pinterest ──
    const nextButtonId = `${prefix}${command} ${query}|${nextIndex}`;
    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🔄 Gambar Lain',
          id: nextButtonId
        })
      }
    ];
    if (item.pinUrl) {
      buttons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🔗 Lihat di Pinterest',
          url: item.pinUrl,
          merchant_url: item.pinUrl
        })
      });
    }

    // ── Kirim sebagai pesan tombol tunggal (interactiveMessage, bukan carousel) ──
    let sentOk = false;
    if (generateWAMessageFromContent && proto && prepareWAMessageMedia && alya.waUploadToServer) {
      try {
        const mediaPayload = await prepareWAMessageMedia(
          { image: { url: item.imageUrl } },
          { upload: alya.waUploadToServer }
        );

        const msg = generateWAMessageFromContent(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadata       : {},
                  deviceListMetadataVersion: 2,
                },
                interactiveMessage: {
                  header: {
                    ...mediaPayload,
                    hasMediaAttachment: true
                  },
                  body: { text: caption },
                  footer: { text: '📌 Pinterest  •  Alya Bot' },
                  nativeFlowMessage: { buttons }
                }
              }
            }
          },
          { quoted: m }
        );

        await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        sentOk = true;
      } catch (e) {
        console.warn('[pin] Kirim tombol gagal, fallback ke gambar biasa:', e.message);
      }
    }

    // ── Fallback: kirim gambar biasa tanpa tombol kalau interactiveMessage gagal ──
    if (!sentOk) {
      try {
        await alya.sendMessage(m.chat, {
          image  : { url: item.imageUrl },
          caption: caption + `\n\n_Ketik ulang \`${prefix}${command} ${query}\` untuk gambar lain._`
        }, { quoted: m });
        sentOk = true;
      } catch (e) {
        console.error('[pin] Kirim gambar fallback gagal:', e.message);
      }
    }

    if (!sentOk) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return replyalya('❌ Gagal mengirim gambar. Coba keyword lain.');
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  },
};
