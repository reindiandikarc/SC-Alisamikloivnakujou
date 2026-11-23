// Plugin: catur (chess)
// Alya V14 — Ported from SC Bell (helpers/Events/game.js)
// Engine: chess.js (machine/chess.js dari Bell) via lib/chess.js
// Board visual: https://chessboardimage.com/{fen}.png (Bell-style)
// Commands: chess, catur

'use strict';

const { Chess } = require('../../lib/chess');

module.exports = {
  command: ['chess', 'catur'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, from, pushname,
      isGroup,
      replyalya,
    } = ctx;

    // Akses penyimpanan game per-chat (persistent selama bot hidup)
    if (!global.chessGames) global.chessGames = {};
    const chatId = m.chat;
    const games  = global.chessGames[chatId] || (global.chessGames[chatId] = {});

    const senderNumber = sender.split('@')[0];
    const fullArgs     = (q || text || '').trim();
    const [action, param1, param2, param3] = fullArgs.split(/\s+/);

    // ───────────────────────────── HELP / tanpa aksi ──────────────────────────
    if (!action || action === 'help') {
      return replyalya(
        `♟️ *CHESS GAME*\n\n` +
        `*Perintah:*\n` +
        `• *${prefix}chess create <room>* — Buat game baru\n` +
        `• *${prefix}chess join <room>* — Gabung game\n` +
        `• *${prefix}chess start <room>* — Mulai game & tampilkan papan\n` +
        `• *${prefix}chess move <dari> <ke> [promosi]* — Lakukan langkah\n` +
        `  _Contoh: .chess move e2 e4_\n` +
        `  _Promosi: .chess move e7 e8 q_\n` +
        `• *${prefix}chess board <room>* — Tampilkan papan sekarang\n` +
        `• *${prefix}chess delete <room>* — Hapus game (hanya pembuat)\n` +
        `• *${prefix}chess list* — Daftar room aktif di chat ini\n\n` +
        `_Papan ditampilkan sebagai gambar (flip otomatis untuk hitam)_`
      );
    }

    // ───────────────────────────── LIST ───────────────────────────────────────
    if (action === 'list') {
      const roomList = Object.keys(games);
      if (roomList.length === 0) return replyalya('Tidak ada game aktif di chat ini.');
      const info = roomList.map(r => {
        const g = games[r];
        return `• *${r}* — ${g.players.length}/2 pemain | Giliran: ${g.turn.toUpperCase()}`;
      }).join('\n');
      return replyalya(`♟️ *Room aktif:*\n\n${info}`);
    }

    // ───────────────────────────── CREATE ─────────────────────────────────────
    if (action === 'create') {
      if (!param1) return replyalya(`❌ Masukkan nama room.\nContoh: *${prefix}chess create HanifRoom*`);
      if (games[param1]) return replyalya('❌ Room sudah ada. Pilih nama lain.');

      games[param1] = {
        fen    : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        players: [{ id: senderNumber, color: 'white' }],
        turn   : 'white',
        started: false,
        creator: senderNumber,
      };

      return replyalya(
        `✅ Room *"${param1}"* berhasil dibuat!\n` +
        `Kamu bermain sebagai *♔ Putih*\n\n` +
        `Minta lawan ketik: *${prefix}chess join ${param1}*`
      );
    }

    // ───────────────────────────── JOIN ───────────────────────────────────────
    if (action === 'join') {
      if (!param1) return replyalya(`❌ Masukkan nama room.\nContoh: *${prefix}chess join HanifRoom*`);
      const room = games[param1];
      if (!room) return replyalya('❌ Room tidak ditemukan.');
      if (room.players.length >= 2) return replyalya('⚠️ Room sudah penuh (2 pemain).');
      if (room.players.some(p => p.id === senderNumber)) return replyalya('⚠️ Kamu sudah ada di room ini!');

      room.players.push({ id: senderNumber, color: 'black' });
      return replyalya(
        `✅ Kamu bergabung di room *"${param1}"* sebagai *♚ Hitam*\n\n` +
        `Pembuat room bisa mulai dengan: *${prefix}chess start ${param1}*`
      );
    }

    // ───────────────────────────── START ──────────────────────────────────────
    if (action === 'start') {
      if (!param1) return replyalya(`❌ Masukkan nama room.\nContoh: *${prefix}chess start HanifRoom*`);
      const room = games[param1];
      if (!room) return replyalya('❌ Room tidak ditemukan.');
      if (room.players.length < 2) return replyalya('⚠️ Butuh 2 pemain untuk mulai. Minta seseorang join dulu!');

      room.started = true;

      const white = room.players.find(p => p.color === 'white');
      const black = room.players.find(p => p.color === 'black');
      const boardUrl = `https://chessboardimage.com/${room.fen}.png`;

      await alya.sendMessage(m.chat, {
        image  : { url: boardUrl },
        caption:
          `♟️ *GAME DIMULAI!*  Room: *${param1}*\n\n` +
          `♔ Putih: @${white.id}\n` +
          `♚ Hitam: @${black.id}\n\n` +
          `🎯 Giliran: *PUTIH*\n` +
          `Ketik: *${prefix}chess move e2 e4*`,
        mentions: [white.id + '@s.whatsapp.net', black.id + '@s.whatsapp.net'],
      }, { quoted: m });

      return;
    }

    // ───────────────────────────── BOARD ──────────────────────────────────────
    if (action === 'board') {
      if (!param1) return replyalya(`❌ Masukkan nama room.\nContoh: *${prefix}chess board HanifRoom*`);
      const room = games[param1];
      if (!room) return replyalya('❌ Room tidak ditemukan.');

      // Flip board jika minta dari pemain hitam
      const isBlack = room.players.find(p => p.id === senderNumber)?.color === 'black';
      const boardUrl = `https://chessboardimage.com/${room.fen}${isBlack ? '-flip' : ''}.png`;

      await alya.sendMessage(m.chat, {
        image  : { url: boardUrl },
        caption: `♟️ Room: *${param1}* | Giliran: *${room.turn.toUpperCase()}*`,
      }, { quoted: m });

      return;
    }

    // ───────────────────────────── MOVE ───────────────────────────────────────
    if (action === 'move') {
      // .chess move e2 e4 [q]
      const from      = param1?.toLowerCase();
      const to        = param2?.toLowerCase();
      const promotion = param3?.toLowerCase();

      if (!from || !to) {
        return replyalya(
          `❌ Format salah!\n\n` +
          `Contoh:\n` +
          `• *${prefix}chess move e2 e4*\n` +
          `• *${prefix}chess move e7 e8 q* (promosi)`
        );
      }

      // Cari room yang berisi sender
      const roomName = Object.keys(games).find(r =>
        games[r].players.some(p => p.id === senderNumber)
      );

      if (!roomName) {
        return replyalya('❌ Kamu belum bergabung di room manapun!\nBuat atau join dulu dengan *chess create / join*');
      }

      const room = games[roomName];

      if (!room.started) {
        return replyalya(`⚠️ Game belum dimulai!\nKetik: *${prefix}chess start ${roomName}*`);
      }

      // Cek giliran
      const player = room.players.find(p => p.id === senderNumber);
      if (!player) return replyalya('❌ Kamu bukan peserta game ini!');
      if (player.color !== room.turn) {
        return replyalya(`⏳ Bukan giliranmu!\nSekarang giliran *${room.turn.toUpperCase()}*`);
      }

      // Load FEN ke chess engine
      const chess = new Chess();
      try {
        chess.load(room.fen);
      } catch (e) {
        room.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        return replyalya('⚠️ FEN error, game direset ke posisi awal!');
      }

      // Eksekusi move
      try {
        const moveOpts = { from, to };
        if (promotion) moveOpts.promotion = promotion[0];

        const result = chess.move(moveOpts);
        if (!result) throw new Error('Langkah tidak valid!');

        // Update state
        room.fen  = chess.fen();
        room.turn = chess.turn() === 'w' ? 'white' : 'black';

        // Cek checkmate / draw
        let statusMsg = '';
        if (chess.isCheckmate()) {
          statusMsg = `\n\n🏆 *SKAKMAT!* Pemenang: *${player.color.toUpperCase()}*`;
          delete games[roomName];
        } else if (chess.isDraw()) {
          statusMsg = '\n\n🤝 *REMIS!* Permainan berakhir seri.';
          delete games[roomName];
        } else if (chess.isCheck()) {
          statusMsg = `\n\n⚠️ *SKAK!* Raja ${room.turn.toUpperCase()} dalam ancaman!`;
        }

        // Flip board untuk giliran berikutnya (Bell: -flip.png jika black)
        const isFlip   = room.turn === 'black';
        const boardUrl = `https://chessboardimage.com/${room.fen}${isFlip ? '-flip' : ''}.png`;

        const opponent = room.players.find(p => p.id !== senderNumber);
        const caption  =
          `✅ *${senderNumber}* bergerak *${from.toUpperCase()} → ${to.toUpperCase()}*\n` +
          `Giliran: *${room.turn.toUpperCase()}* (@${opponent?.id || '?'})` +
          statusMsg;

        await alya.sendMessage(m.chat, {
          image   : { url: boardUrl },
          caption,
          mentions: opponent ? [opponent.id + '@s.whatsapp.net'] : [],
        }, { quoted: m });

      } catch (err) {
        let msg = `❌ Gagal: *${err.message}*\n`;
        if (err.message.includes('invalid')) msg += 'Posisi tidak sesuai aturan catur.';
        else msg += `Contoh: *${prefix}chess move e2 e4*`;
        return replyalya(msg);
      }

      return;
    }

    // ───────────────────────────── DELETE ─────────────────────────────────────
    if (action === 'delete') {
      if (!param1) return replyalya(`❌ Masukkan nama room.\nContoh: *${prefix}chess delete HanifRoom*`);
      const room = games[param1];
      if (!room) return replyalya('❌ Room tidak ditemukan.');
      if (room.creator !== senderNumber) return replyalya('❌ Hanya pembuat room yang bisa menghapus!');

      delete games[param1];
      return replyalya(`✅ Room *"${param1}"* berhasil dihapus.`);
    }

    // fallback
    return replyalya(`❌ Perintah tidak dikenal.\nKetik *${prefix}chess help* untuk bantuan.`);
  }
};
