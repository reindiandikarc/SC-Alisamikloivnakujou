// Plugin: translate
// Commands: translate, terjemah, tr
// Fix V19: axios sekarang require lokal, ganti fetch ke gtranslate v2 yg lebih stabil
// Fix error: invalid format response, timeout, & edge case quoted

'use strict';

const axios = require('axios');

const LANG_MAP = {
  id: 'id', in: 'id', indo: 'id', indonesia: 'id',
  en: 'en', ing: 'en', inggris: 'en', english: 'en',
  ja: 'ja', jp: 'ja', jepang: 'ja', japanese: 'ja',
  ko: 'ko', kr: 'ko', korea: 'ko', korean: 'ko',
  zh: 'zh', cn: 'zh', china: 'zh', chinese: 'zh',
  ar: 'ar', arab: 'ar', arabic: 'ar',
  fr: 'fr', prancis: 'fr', french: 'fr',
  de: 'de', jerman: 'de', german: 'de',
  es: 'es', spanyol: 'es', spanish: 'es',
  pt: 'pt', portugis: 'pt',
  ru: 'ru', rusia: 'ru', russian: 'ru',
  th: 'th', thai: 'th', thailand: 'th',
  ms: 'ms', malay: 'ms', melayu: 'ms',
  tr: 'tr', turki: 'tr', turkish: 'tr',
  it: 'it', italia: 'it', italian: 'it',
  nl: 'nl', belanda: 'nl', dutch: 'nl',
  vi: 'vi', vietnam: 'vi', vietnamese: 'vi',
  tl: 'tl', tagalog: 'tl', filipina: 'tl',
  hi: 'hi', hindi: 'hi', india: 'hi',
};

const LANG_NAMES = {
  id: '🇮🇩 Indonesia', en: '🇬🇧 Inggris', ja: '🇯🇵 Jepang',
  ko: '🇰🇷 Korea', zh: '🇨🇳 Mandarin', ar: '🇸🇦 Arab',
  fr: '🇫🇷 Prancis', de: '🇩🇪 Jerman', es: '🇪🇸 Spanyol',
  pt: '🇵🇹 Portugis', ru: '🇷🇺 Rusia', th: '🇹🇭 Thailand',
  ms: '🇲🇾 Melayu', tr: '🇹🇷 Turki', it: '🇮🇹 Italia',
  nl: '🇳🇱 Belanda', vi: '🇻🇳 Vietnam', tl: '🇵🇭 Tagalog',
  hi: '🇮🇳 Hindi',
};

/**
 * Terjemahkan teks via Google Translate (tidak perlu key)
 * Pakai endpoint v2 yang lebih stabil dan tidak butuh parse nested array
 */
async function translateText(text, targetLang = 'id', sourceLang = 'auto') {
  // Coba endpoint v2 dulu (lebih stabil, return JSON flat)
  try {
    const res = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        dt: 't',
        q: text,
      },
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const data = res.data;

    // Format return: [ [ ["translated","original",...], ...], ...]
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error('Format respons tidak dikenali');
    }

    const translated = data[0]
      .filter(part => Array.isArray(part) && typeof part[0] === 'string')
      .map(part => part[0])
      .join('');

    if (!translated) throw new Error('Hasil terjemahan kosong');
    return translated;

  } catch (err) {
    // Fallback ke endpoint alternatif (api.mymemory.translated.net)
    const res2 = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${sourceLang === 'auto' ? '' : sourceLang}|${targetLang}`,
      },
      timeout: 12000,
    });

    const result = res2.data?.responseData?.translatedText;
    if (!result) throw new Error('Semua API terjemahan gagal');
    return result;
  }
}

module.exports = {
  command: ['translate', 'terjemah', 'tr'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { prefix, command, text, quoted, replyalya } = ctx;

    // ── HELP ─────────────────────────────────────────────────────
    if (!text && !quoted) {
      return replyalya(
`╭─「 🌐 *TRANSLATE* 」
│
│ Terjemahkan teks ke Bahasa Indonesia.
│
│ *Cara pakai:*
│
│ 1️⃣ Teks biasa:
│ *${prefix}${command}* <teks>
│
│ 2️⃣ Dengan bahasa tujuan:
│ *${prefix}${command}* <kode_bahasa> <teks>
│
│ 3️⃣ Reply pesan:
│    Reply pesan + *${prefix}${command}*
│    (atau tambah kode bahasa setelah perintah)
│
│ *Kode bahasa:*
│ id • en • ja • ko • zh • ar
│ fr • de • es • ru • th • ms
│
│ *Contoh:*
│ ${prefix}${command} Halo dunia
│ ${prefix}${command} en こんにちは
│ ${prefix}${command} ja Selamat pagi
╰──────────────────`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      let targetLang = 'id';
      let inputText  = '';

      if (quoted) {
        // Ambil teks dari pesan yang di-reply
        inputText = (
          quoted.text ||
          quoted.caption ||
          quoted.msg?.text ||
          quoted.msg?.caption ||
          ''
        ).trim();

        // Cek apakah ada kode bahasa di argumen command
        if (text) {
          const firstWord = text.trim().split(/\s+/)[0].toLowerCase();
          if (LANG_MAP[firstWord]) {
            targetLang = LANG_MAP[firstWord];
          } else if (!inputText) {
            inputText = text.trim();
          }
        }
      } else {
        // Parse argumen: [kode_bahasa?] <teks>
        const args = text.trim().split(/\s+/);
        const firstWord = args[0].toLowerCase();
        if (LANG_MAP[firstWord] && args.length > 1) {
          targetLang = LANG_MAP[firstWord];
          inputText  = args.slice(1).join(' ');
        } else {
          inputText = text.trim();
        }
      }

      if (!inputText) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya(`❌ Tidak ada teks yang bisa diterjemahkan.\n\nContoh: *${prefix}${command}* Halo dunia`);
      }

      // Batasi panjang input agar tidak timeout
      if (inputText.length > 2000) {
        inputText = inputText.slice(0, 2000);
      }

      const hasil     = await translateText(inputText, targetLang);
      const namaLang  = LANG_NAMES[targetLang] || targetLang.toUpperCase();

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      replyalya(
`🌐 *HASIL TERJEMAHAN*

📝 *Teks Asli:*
${inputText}

✨ *Terjemahan (${namaLang}):*
${hasil}`
      );

    } catch (err) {
      console.error('[translate]', err.message || err);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(
        `❌ *Gagal menerjemahkan teks*\n\n` +
        `Kemungkinan penyebab:\n` +
        `• Teks terlalu pendek / tidak valid\n` +
        `• API sedang tidak stabil\n\n` +
        `_Coba lagi dalam beberapa detik_ 🔄`
      );
    }
  },
};
