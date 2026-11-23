// Plugin: currency
// Auto-generated from Alya V12
// Commands: kurs, currency

const path = require('path')

module.exports = {
  command: ["kurs", "currency"],
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

        if (!text) return replyalya(
            `*• Format:* ${prefix + command} [jumlah] [dari] [ke]\n\n` +
            `*• Contoh:*\n` +
            `  ${prefix + command} 100 USD IDR\n` +
            `  ${prefix + command} 50000 IDR USD\n` +
            `  ${prefix + command} 1 EUR SGD\n\n` +
            `_💱 Powered by ExchangeRate-API_`
        );

        await alya.sendMessage(m.chat, { react: { text: '💱', key: m.key } });

        try {
            if (!global.exchangeRateApiKey || global.exchangeRateApiKey === 'ISI_EXCHANGERATE_API_KEY_DISINI') {
                return replyalya('❌ ExchangeRate API Key belum diisi!\nSilakan isi *global.exchangeRateApiKey* di *settings.js*\n📌 Daftar: https://www.exchangerate-api.com');
            }

            const args = text.trim().split(/\s+/);
            if (args.length < 3) return replyalya(`❌ Format salah!\n*Contoh:* ${prefix + command} 100 USD IDR`);

            const amount = parseFloat(args[0]);
            const fromCurrency = args[1].toUpperCase();
            const toCurrency = args[2].toUpperCase();

            if (isNaN(amount) || amount <= 0) return replyalya('❌ Jumlah tidak valid! Masukkan angka yang benar.');

            const apiUrl = `https://v6.exchangerate-api.com/v6/${global.exchangeRateApiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`;
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.result === 'success') {
                const rate = data.conversion_rate;
                const converted = data.conversion_result;
                const lastUpdate = data.time_last_update_utc ? data.time_last_update_utc.split(' 00:')[0] : 'N/A';

                const formatNumber = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

                reply(
                    `💱 *KONVERSI MATA UANG*\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `💰 *Jumlah:* ${formatNumber(amount)} ${fromCurrency}\n` +
                    `🔄 *Hasil:* ${formatNumber(converted)} ${toCurrency}\n\n` +
                    `📊 *Kurs:* 1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}\n` +
                    `🕐 *Update:* ${lastUpdate}\n\n` +
                    `_💱 Powered by ExchangeRate-API_`
                );
            } else if (data['error-type'] === 'unsupported-code') {
                reply(`❌ Kode mata uang *${fromCurrency}* atau *${toCurrency}* tidak valid!\nContoh kode: USD, IDR, EUR, SGD, JPY, GBP, MYR`);
            } else if (data['error-type'] === 'invalid-key') {
                reply('❌ ExchangeRate API Key tidak valid! Periksa kembali *settings.js*');
            } else {
                reply(`❌ Gagal mengambil data kurs. Error: ${data['error-type'] || 'Unknown'}`);
            }
        } catch (e) {
            console.error('[Konversi Command Error]', e);
            reply('❌ Terjadi error saat konversi mata uang.');
        }
    }
    //=========================================\\======
  }
