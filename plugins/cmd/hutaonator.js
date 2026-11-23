// Plugin: hutaonator
// Game tebak-karakter Genshin Impact ala Akinator, dibawakan Hu Tao.
// Sumber API publik: https://hutaonator.satriadeveloperz.workers.dev
// Diadaptasi dari CLI (hutaonator.js) menjadi command WhatsApp berbasis sesi
// per-chat, pola sama seperti plugins/cmd/tebakbendera.js (alya.<state>[chatId]).
'use strict';

const BASE = 'https://hutaonator.satriadeveloperz.workers.dev';

async function apiPost(path, body) {
  const axios = require('axios');
  const { data } = await axios.post(BASE + path, body || {}, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  return data;
}

async function apiGet(path) {
  const axios = require('axios');
  const { data } = await axios.get(BASE + path, { timeout: 15000 });
  return data;
}

const ANSWER_MAP = { '1': 'yes', '2': 'no', '3': 'idk', '4': 'probably', '5': 'probably not' };

function renderQuestion(game, prefix) {
  return (
    `🀄 *HUTAONATOR — Tebak Karakter*\n\n` +
    `Pertanyaan #${game.step + 1}: *${game.question}*\n` +
    `Keyakinan Hu Tao: ${game.progression}%\n\n` +
    `1️⃣ Iya\n2️⃣ Tidak\n3️⃣ Tidak tahu\n4️⃣ Mungkin\n5️⃣ Mungkin tidak\n\n` +
    `Jawab dengan: *${prefix}hutao <1-5>*\n` +
    `Menyerah? Ketik *${prefix}hutao nyerah*`
  );
}

async function renderGuess(alya, m, game, prefix) {
  const caption =
    `🎯 *Hu Tao menebak...*\n\n` +
    `Nama: *${game.guess?.name || '-'}*\n` +
    `Deskripsi: ${game.guess?.description || '-'}\n\n` +
    `Benar? Balas *${prefix}hutao benar* atau *${prefix}hutao salah*`;
  if (game.guess?.photo) {
    await alya.sendMessage(m.chat, { image: { url: game.guess.photo }, caption }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { text: caption }, { quoted: m });
  }
}

module.exports = {
  command: ['hutao', 'hutaonator'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, reply, replyalya } = ctx;

    if (!m.isGroup) return reply('❌ Game ini cuma bisa dimainkan di grup.');

    alya.hutaoGame = alya.hutaoGame || {};
    const id = m.chat;
    const sub = (args[0] || '').toLowerCase();

    // Belum ada sesi -> mulai game baru (abaikan sub-command apa pun)
    if (!alya.hutaoGame[id]) {
      try {
        const data = await apiPost('/api/game/start', { childMode: false });
        if (!data?.game) return reply('❌ Gagal memulai game, coba lagi nanti.');
        alya.hutaoGame[id] = data.game;
        return reply(renderQuestion(data.game, prefix));
      } catch (e) {
        return reply(`❌ Gagal menghubungi server Hutaonator: ${e.message}`);
      }
    }

    const game = alya.hutaoGame[id];

    // Nyerah dari state manapun
    if (sub === 'nyerah' || sub === 'menyerah' || sub === 'cancel') {
      delete alya.hutaoGame[id];
      return reply('🏳️ Game dibatalkan.');
    }

    try {
      if (game.status === 'playing') {
        const answer = ANSWER_MAP[sub];
        if (!answer) {
          return reply(`❌ Jawaban tidak valid.\n\n${renderQuestion(game, prefix)}`);
        }
        const data = await apiPost(`/api/game/${game.id}/answer`, { answer });
        if (!data?.game) return reply('❌ Gagal memproses jawaban, coba lagi.');
        alya.hutaoGame[id] = data.game;

        if (data.game.status === 'guessing') {
          return renderGuess(alya, m, data.game, prefix);
        }
        if (data.game.status === 'won') {
          delete alya.hutaoGame[id];
          return reply(`🎉 *Hu Tao menang!* Ditebak dalam ${data.game.step} pertanyaan.`);
        }
        if (data.game.status === 'lost') {
          delete alya.hutaoGame[id];
          return reply(`🏆 *Kamu menang!* Hu Tao menyerah setelah ${data.game.step} pertanyaan.`);
        }
        return reply(renderQuestion(data.game, prefix));
      }

      if (game.status === 'guessing') {
        if (sub === 'benar' || sub === 'y' || sub === 'yes') {
          const data = await apiPost(`/api/game/${game.id}/confirm`);
          delete alya.hutaoGame[id];
          return reply(`🎉 *Hu Tao menang!* Ditebak dalam ${data.game?.step ?? '-'} pertanyaan.`);
        }
        if (sub === 'salah' || sub === 'n' || sub === 'no') {
          const data = await apiPost(`/api/game/${game.id}/reject`);
          if (!data?.game) return reply('❌ Gagal memproses, coba lagi.');
          alya.hutaoGame[id] = data.game;
          if (data.game.status === 'lost') {
            delete alya.hutaoGame[id];
            return reply(`🏆 *Kamu menang!* Hu Tao menyerah setelah ${data.game.step} pertanyaan.\n\nMau kasih tahu jawabannya? Ketik *${prefix}hutao reveal <nama>*`);
          }
          return renderQuestion(data.game, prefix)
            ? reply(renderQuestion(data.game, prefix))
            : reply('Lanjut...');
        }
        return reply(`❌ Balas *${prefix}hutao benar* atau *${prefix}hutao salah*.`);
      }

      // status lost menunggu reveal opsional
      if (sub === 'reveal') {
        const name = args.slice(1).join(' ').trim();
        if (!name) return reply(`❌ Format: ${prefix}hutao reveal <nama karakter>`);
        await apiPost(`/api/game/${game.id}/reveal`, { name });
        delete alya.hutaoGame[id];
        return reply(`✅ Terima kasih! Dicatat sebagai: *${name}*`);
      }

      delete alya.hutaoGame[id];
      return reply('Sesi game sudah berakhir. Ketik lagi untuk main baru.');
    } catch (e) {
      delete alya.hutaoGame[id];
      return reply(`❌ Terjadi error: ${e.message}. Sesi direset, silakan mulai ulang.`);
    }
  },
};
