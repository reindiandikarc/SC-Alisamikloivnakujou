// Plugin: konversi
// Commands: konversi
// Konversi mata uang real-time menggunakan ExchangeRate-API
// API gratis: https://app.exchangerate-api.com/sign-up (1500 req/bulan)
// Set API key di settings.js: global.exchangeRateApiKey = 'KEY_KAMU'
// Jika tidak ada key: otomatis pakai open.er-api.com (tanpa key, lebih terbatas)

const axios = require('axios');

// ── Semua mata uang yang didukung + nama ──
const CURRENCIES = {
  // Asia Tenggara
  IDR: { name: 'Rupiah Indonesia',     flag: '🇮🇩' },
  SGD: { name: 'Dollar Singapura',     flag: '🇸🇬' },
  MYR: { name: 'Ringgit Malaysia',     flag: '🇲🇾' },
  THB: { name: 'Baht Thailand',        flag: '🇹🇭' },
  PHP: { name: 'Peso Filipina',        flag: '🇵🇭' },
  VND: { name: 'Dong Vietnam',         flag: '🇻🇳' },
  MMK: { name: 'Kyat Myanmar',         flag: '🇲🇲' },
  BND: { name: 'Dollar Brunei',        flag: '🇧🇳' },
  KHR: { name: 'Riel Kamboja',         flag: '🇰🇭' },
  // Asia Timur & Selatan
  JPY: { name: 'Yen Jepang',           flag: '🇯🇵' },
  KRW: { name: 'Won Korea',            flag: '🇰🇷' },
  CNY: { name: 'Yuan China',           flag: '🇨🇳' },
  INR: { name: 'Rupee India',          flag: '🇮🇳' },
  PKR: { name: 'Rupee Pakistan',       flag: '🇵🇰' },
  BDT: { name: 'Taka Bangladesh',      flag: '🇧🇩' },
  TWD: { name: 'Dollar Taiwan',        flag: '🇹🇼' },
  HKD: { name: 'Dollar Hong Kong',     flag: '🇭🇰' },
  // Timur Tengah
  SAR: { name: 'Riyal Arab Saudi',     flag: '🇸🇦' },
  AED: { name: 'Dirham UAE',           flag: '🇦🇪' },
  QAR: { name: 'Riyal Qatar',          flag: '🇶🇦' },
  KWD: { name: 'Dinar Kuwait',         flag: '🇰🇼' },
  // Amerika & Eropa
  USD: { name: 'Dollar Amerika',       flag: '🇺🇸' },
  EUR: { name: 'Euro',                 flag: '🇪🇺' },
  GBP: { name: 'Pound Inggris',        flag: '🇬🇧' },
  CHF: { name: 'Franc Swiss',          flag: '🇨🇭' },
  CAD: { name: 'Dollar Kanada',        flag: '🇨🇦' },
  AUD: { name: 'Dollar Australia',     flag: '🇦🇺' },
  NZD: { name: 'Dollar Selandia Baru', flag: '🇳🇿' },
  BRL: { name: 'Real Brasil',          flag: '🇧🇷' },
  MXN: { name: 'Peso Meksiko',         flag: '🇲🇽' },
  // Eropa lain
  RUB: { name: 'Ruble Rusia',          flag: '🇷🇺' },
  TRY: { name: 'Lira Turki',           flag: '🇹🇷' },
  SEK: { name: 'Krona Swedia',         flag: '🇸🇪' },
  NOK: { name: 'Krone Norwegia',       flag: '🇳🇴' },
  DKK: { name: 'Krone Denmark',        flag: '🇩🇰' },
  PLN: { name: 'Zloty Polandia',       flag: '🇵🇱' },
};

// ── Grup mata uang populer untuk tampilan menu ──
const POPULAR_GROUPS = [
  { label: 'Asia Tenggara', codes: ['IDR', 'SGD', 'MYR', 'THB', 'PHP', 'VND'] },
  { label: 'Asia Timur',    codes: ['JPY', 'KRW', 'CNY', 'HKD', 'TWD'] },
  { label: 'Timur Tengah',  codes: ['SAR', 'AED', 'QAR', 'KWD'] },
  { label: 'Barat',         codes: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
];

// ── Format angka ──
function fmtNum(num, decimals = 6) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  // Pilih jumlah desimal otomatis berdasarkan besar angka
  let dec = decimals;
  if (num >= 1000) dec = 2;
  else if (num >= 1) dec = 4;
  else if (num >= 0.01) dec = 6;
  else dec = 8;
  return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

// ── Fetch kurs via ExchangeRate-API ──
async function fetchRate(from, to, amount) {
  const apiKey = (global.exchangeRateApiKey || global.exchangerateApiKey || '').trim();
  const hasKey = apiKey && apiKey.length > 10;

  if (hasKey) {
    // Gunakan endpoint /pair yang langsung kasih hasil konversi
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;
    const res = await axios.get(url, { timeout: 10000 });
    const d = res.data;
    if (d.result === 'error') throw new Error(d['error-type'] || 'API error');
    return {
      rate:           d.conversion_rate,
      result:         d.conversion_result,
      nextUpdate:     d.time_next_update_utc || null,
      provider:       'ExchangeRate-API (key)',
    };
  } else {
    // Endpoint open.er-api.com — tanpa key
    const url = `https://open.er-api.com/v6/latest/${from}`;
    const res = await axios.get(url, { timeout: 10000 });
    const d = res.data;
    if (d.result === 'error' || !d.rates) throw new Error('Tidak dapat mengambil data kurs');
    if (!d.rates[to]) throw new Error(`Mata uang ${to} tidak ditemukan`);
    const rate = d.rates[to];
    return {
      rate,
      result:     amount * rate,
      nextUpdate: d.time_next_update_utc || null,
      provider:   'open.er-api.com (tanpa key)',
    };
  }
}

module.exports = {
  command: ['konversi', 'currency', 'kurs'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, reply, replyalya } = ctx;

    // ── Buat menu berdasarkan grup ──
    const groupLines = POPULAR_GROUPS.map(g => {
      const row = g.codes.map(c => {
        const flag = CURRENCIES[c]?.flag || '';
        return `${flag}${c}`;
      }).join(' • ');
      return `│ _${g.label}:_ ${row}`;
    }).join('\n');

    const USAGE =
      `╭─「 💱 *KONVERSI MATA UANG* 」\n` +
      `│\n` +
      `│ *Format:*\n` +
      `│ ${prefix}${command} <jumlah> <dari> <ke>\n` +
      `│\n` +
      `│ *Contoh:*\n` +
      `│ ${prefix}${command} 100 USD IDR\n` +
      `│ ${prefix}${command} 1000000 IDR JPY\n` +
      `│ ${prefix}${command} 50 EUR SGD\n` +
      `│ ${prefix}${command} 500 SAR IDR\n` +
      `│\n` +
      `├─ *Mata uang populer:*\n` +
      groupLines + `\n` +
      `│\n` +
      `│ _Powered by ExchangeRate-API_\n` +
      `╰──────────────────`;

    if (!text) return reply(USAGE);

    const parts = text.trim().split(/\s+/);
    if (parts.length < 3) return reply(USAGE);

    const [rawAmount, fromRaw, toRaw] = parts;
    // Bersihkan format angka (boleh pakai titik/koma sebagai separator)
    const cleanAmount = rawAmount.replace(/\./g, '').replace(/,/g, '.');
    const amount = parseFloat(cleanAmount);
    const from = fromRaw.toUpperCase();
    const to   = toRaw.toUpperCase();

    if (isNaN(amount) || amount <= 0) {
      return replyalya(
        `❌ *Jumlah tidak valid!*\n\n` +
        `Masukkan angka yang benar.\n` +
        `Contoh: \`.${command} 100 USD IDR\``
      );
    }

    if (from === to) {
      return replyalya(`❌ Mata uang asal dan tujuan tidak boleh sama!`);
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      const data = await fetchRate(from, to, amount);

      const fromInfo = CURRENCIES[from];
      const toInfo   = CURRENCIES[to];
      const fromName = fromInfo?.name  || from;
      const toName   = toInfo?.name    || to;
      const fromFlag = fromInfo?.flag  || '💵';
      const toFlag   = toInfo?.flag    || '💴';

      const now = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      // Format teks update berikutnya (jika ada)
      let nextUpdateStr = '';
      if (data.nextUpdate) {
        try {
          const next = new Date(data.nextUpdate).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          });
          nextUpdateStr = `\n│ 🔄 *Update kurs:* ${next} WIB`;
        } catch {}
      }

      const msg =
        `╭─「 💱 *HASIL KONVERSI* 」\n` +
        `│\n` +
        `│ ${fromFlag} *${fmtNum(amount)} ${from}*\n` +
        `│         ↓\n` +
        `│ ${toFlag} *${fmtNum(data.result)} ${to}*\n` +
        `│\n` +
        `├─────────────────\n` +
        `│ 📊 *Kurs:* 1 ${from} = ${fmtNum(data.rate)} ${to}\n` +
        `│ 🏷️ *Dari:* ${fromName}\n` +
        `│ 🏷️ *Ke:*   ${toName}\n` +
        `│ 🕐 *Cek:*  ${now} WIB` +
        nextUpdateStr + `\n` +
        `│\n` +
        `│ _${data.provider}_\n` +
        `╰──────────────────`;

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      reply(msg);

    } catch (err) {
      console.error('[konversi error]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      const msg = err.message || '';

      // Pesan error spesifik
      if (msg.includes('unsupported-code') || msg.includes('tidak ditemukan')) {
        return replyalya(
          `❌ *Mata uang tidak dikenali!*\n\n` +
          `• \`${from}\` atau \`${to}\` bukan kode valid\n` +
          `• Gunakan kode ISO 4217 (3 huruf kapital)\n` +
          `• Contoh: USD, IDR, EUR, JPY, SGD\n\n` +
          `_Ketik \`${prefix}${command}\` untuk lihat daftar_`
        );
      }

      if (msg.includes('invalid-key') || msg.includes('inactive-account')) {
        return replyalya(
          `❌ *API key tidak valid!*\n\n` +
          `Daftar gratis di: https://app.exchangerate-api.com/sign-up\n` +
          `Lalu set di settings.js:\n` +
          `\`global.exchangeRateApiKey = 'KEY_KAMU'\``
        );
      }

      replyalya(
        `❌ *Gagal mengambil kurs!*\n\n` +
        `*Error:* ${msg || 'Unknown error'}\n\n` +
        `_Coba lagi beberapa saat ya~_`
      );
    }
  }
};
