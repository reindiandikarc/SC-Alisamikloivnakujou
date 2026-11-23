// Plugin: chess
// Alya V19 — Game catur multiplayer per room per grup
// Board ditampilkan sebagai gambar ASCII (tanpa canvas, kompatibel semua env)
// Commands: chess create/join/start/move/board/delete/list
// 
// Storage: global._chessRooms = { [roomId]: { ...state } }
// State per room: { id, creator, players: [w, b], chess (Chess instance),
//                   groupId, started, createdAt, lastMove }

'use strict';

const { Chess } = require('../../lib/chess');

// ─── State ─────────────────────────────────────────────────────────────────────
if (!global._chessRooms) global._chessRooms = {};

// ─── Board renderer (teks emoji, auto-flip untuk hitam) ────────────────────────
function renderBoard(fen, flipForBlack = false) {
  const chess    = new Chess(fen);
  const board    = chess.board(); // 8x8 array

  const PIECES = {
    'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
    'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟',
  };

  const files = ['a','b','c','d','e','f','g','h'];
  const ranks  = [8,7,6,5,4,3,2,1];

  // Flip papan untuk pemain hitam
  const dispRanks = flipForBlack ? [...ranks].reverse() : ranks;
  const dispFiles = flipForBlack ? [...files].reverse() : files;

  let out = '';
  out += `  ${dispFiles.map(f => f).join(' ')}\n`;

  for (let ri = 0; ri < 8; ri++) {
    const rank    = dispRanks[ri];
    const rowIdx  = 8 - rank;
    const row     = flipForBlack ? [...board[rowIdx]].reverse() : board[rowIdx];
    let rowStr    = `${rank} `;

    for (let ci = 0; ci < 8; ci++) {
      const cell  = row[ci];
      const isDark = (rowIdx + (flipForBlack ? 7 - ci : ci)) % 2 === 1;
      if (!cell) {
        rowStr += isDark ? '▪' : '▫';
      } else {
        rowStr += PIECES[cell.color + cell.type.toUpperCase()] || '?';
      }
      rowStr += ' ';
    }

    rowStr += `${rank}`;
    out += rowStr.trimEnd() + '\n';
  }

  out += `  ${dispFiles.map(f => f).join(' ')}`;
  return out;
}

// ─── Format info permainan ─────────────────────────────────────────────────────
function formatRoomInfo(room, prefix = '') {
  const chess = new Chess(room.fen);
  const turn  = chess.turn() === 'w' ? '♔ Putih' : '♚ Hitam';
  const wName = room.players.w || '(belum ada)';
  const bName = room.players.b || '(belum ada)';

  let status = '';
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? '♚ Hitam' : '♔ Putih';
    status = `\n🏆 *CHECKMATE! ${winner} menang!*`;
  } else if (chess.isDraw()) {
    status = `\n🤝 *DRAW!*`;
  } else if (chess.isCheck()) {
    status = `\n⚠️ *CHECK!*`;
  }

  return (
    `♟️ *Room: ${room.id}*\n` +
    `♔ Putih : ${wName}\n` +
    `♚ Hitam : ${bName}\n` +
    `🎯 Giliran: ${turn}${status}\n` +
    `📊 Langkah ke-${chess.moveNumber()}`
  );
}

// ─── Main plugin ───────────────────────────────────────────────────────────────
module.exports = {
  command: ['chess'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, sender, pushname, replyalya, isGroup } = ctx;

    const sub    = (args[0] || '').toLowerCase();
    const roomId = (args[1] || '').toLowerCase();

    // ── chess list ─────────────────────────────────────────────────────────────
    if (sub === 'list') {
      const rooms = Object.values(global._chessRooms)
        .filter(r => r.groupId === m.chat);

      if (!rooms.length) {
        return replyalya(`📋 Belum ada room catur aktif di grup ini.\n\nBuat dengan: *${prefix}chess create <namaroom>*`);
      }

      let msg = `♟️ *Room Catur Aktif*\n━━━━━━━━━━━━━━━\n`;
      for (const r of rooms) {
        const chess = new Chess(r.fen);
        const done  = chess.isGameOver();
        msg += `• *${r.id}* — ${r.started ? (done ? '✅ Selesai' : '🟢 Berlangsung') : '⏳ Menunggu pemain'}\n`;
        msg += `  ♔ ${r.players.w || '-'} vs ♚ ${r.players.b || '-'}\n`;
      }
      return replyalya(msg.trim());
    }

    // ── chess create <room> ────────────────────────────────────────────────────
    if (sub === 'create') {
      if (!roomId) return replyalya(`❌ Format: *${prefix}chess create <namaroom>*`);
      if (global._chessRooms[roomId]) {
        return replyalya(`❌ Room *${roomId}* sudah ada! Pilih nama lain.`);
      }

      global._chessRooms[roomId] = {
        id       : roomId,
        creator  : sender,
        groupId  : m.chat,
        players  : { w: pushname || sender, b: null },
        senders  : { w: sender, b: null },
        fen      : new Chess().fen(),
        started  : false,
        createdAt: Date.now(),
        lastMove : null,
      };

      return replyalya(
        `♟️ *Room Catur Dibuat!*\n\n` +
        `🏠 Room : *${roomId}*\n` +
        `♔ Putih : *${pushname || sender}* (kamu)\n` +
        `♚ Hitam : _(menunggu lawan)_\n\n` +
        `📌 Minta lawan join dengan:\n*${prefix}chess join ${roomId}*`
      );
    }

    // ── chess join <room> ─────────────────────────────────────────────────────
    if (sub === 'join') {
      if (!roomId) return replyalya(`❌ Format: *${prefix}chess join <namaroom>*`);
      const room = global._chessRooms[roomId];
      if (!room) return replyalya(`❌ Room *${roomId}* tidak ditemukan.`);
      if (room.groupId !== m.chat) return replyalya(`❌ Room ini bukan dari grup ini.`);
      if (room.senders.w === sender) return replyalya(`❌ Kamu sudah di room ini sebagai ♔ Putih!`);
      if (room.senders.b) return replyalya(`❌ Room sudah penuh! Cari room lain ya.`);
      if (room.started) return replyalya(`❌ Game sudah dimulai!`);

      room.players.b = pushname || sender;
      room.senders.b = sender;

      return replyalya(
        `♟️ *Bergabung ke Room ${roomId}!*\n\n` +
        `♔ Putih : *${room.players.w}*\n` +
        `♚ Hitam : *${pushname || sender}* (kamu)\n\n` +
        `📌 Pembuat room bisa mulai dengan:\n*${prefix}chess start ${roomId}*`
      );
    }

    // ── chess start <room> ────────────────────────────────────────────────────
    if (sub === 'start') {
      if (!roomId) return replyalya(`❌ Format: *${prefix}chess start <namaroom>*`);
      const room = global._chessRooms[roomId];
      if (!room) return replyalya(`❌ Room *${roomId}* tidak ditemukan.`);
      if (room.groupId !== m.chat) return replyalya(`❌ Room ini bukan dari grup ini.`);
      if (room.senders.w !== sender && room.senders.b !== sender) {
        return replyalya(`❌ Kamu bukan pemain di room *${roomId}*.`);
      }
      if (!room.senders.b) return replyalya(`❌ Masih butuh 1 pemain lagi! Tunggu lawan join dulu.`);
      if (room.started) return replyalya(`❌ Game sudah dimulai!`);

      room.started = true;

      const boardStr = renderBoard(room.fen, false);
      const info     = formatRoomInfo(room, prefix);

      await alya.sendMessage(m.chat, {
        text:
          `🚀 *Game Catur Dimulai!*\n\n` +
          `${info}\n\n` +
          `\`\`\`\n${boardStr}\n\`\`\`\n\n` +
          `📌 Cara gerak: *${prefix}chess move <dari> <ke>*\n` +
          `Contoh: *${prefix}chess move e2 e4*\n` +
          `Promosi: *${prefix}chess move e7 e8 q*\n\n` +
          `♔ Putih (*${room.players.w}*) jalan duluan!`,
      }, { quoted: m });
      return;
    }

    // ── chess move <dari> <ke> [promosi] ──────────────────────────────────────
    if (sub === 'move') {
      // Cari room aktif milik sender di grup ini
      const myRoom = Object.values(global._chessRooms).find(r =>
        r.groupId === m.chat &&
        r.started &&
        (r.senders.w === sender || r.senders.b === sender)
      );

      if (!myRoom) {
        return replyalya(
          `❌ Kamu tidak sedang main di room manapun di grup ini.\n` +
          `Buat: *${prefix}chess create <room>* atau join: *${prefix}chess join <room>*`
        );
      }

      const chess = new Chess(myRoom.fen);

      if (chess.isGameOver()) {
        return replyalya(`✅ Game di room *${myRoom.id}* sudah selesai!`);
      }

      // Cek giliran
      const myColor  = myRoom.senders.w === sender ? 'w' : 'b';
      const curTurn  = chess.turn();
      if (myColor !== curTurn) {
        const opName = curTurn === 'w' ? myRoom.players.w : myRoom.players.b;
        return replyalya(`⏳ Bukan giliran kamu! Sekarang giliran *${opName}*.`);
      }

      const from      = (args[1] || '').toLowerCase();
      const to        = (args[2] || '').toLowerCase();
      const promotion = (args[3] || '').toLowerCase() || undefined;

      if (!from || !to) {
        return replyalya(
          `❌ Format: *${prefix}chess move <dari> <ke> [promosi]*\n` +
          `Contoh: *${prefix}chess move e2 e4*\n` +
          `Promosi: *${prefix}chess move e7 e8 q*`
        );
      }

      let result;
      try {
        result = chess.move({ from, to, promotion });
      } catch (e) {
        result = null;
      }

      if (!result) {
        // Tunjukkan langkah valid dari kotak ini
        const validMoves = chess.moves({ square: from, verbose: true });
        let hint = '';
        if (validMoves.length > 0) {
          hint = `\n\n💡 Langkah valid dari *${from}*: ${validMoves.map(mv => mv.to).join(', ')}`;
        }
        return replyalya(`❌ Langkah *${from} → ${to}* tidak valid!${hint}`);
      }

      // Update FEN
      myRoom.fen      = chess.fen();
      myRoom.lastMove = { from, to, san: result.san, by: sender };

      // Render papan (flip untuk pemain hitam)
      const isBlack  = myColor === 'b';
      const boardStr = renderBoard(myRoom.fen, isBlack);
      const info     = formatRoomInfo(myRoom, prefix);

      // Cek status game
      let endMsg = '';
      if (chess.isCheckmate()) {
        const winner = myColor === 'w' ? myRoom.players.w : myRoom.players.b;
        endMsg = `\n\n🏆 *CHECKMATE! ${winner} MENANG!* 🎉\n_Room akan tetap tersimpan untuk dilihat._`;
      } else if (chess.isDraw()) {
        const reason = chess.isStalemate() ? 'Stalemate'
          : chess.isThreefoldRepetition() ? 'Threefold repetition'
          : chess.isInsufficientMaterial() ? 'Insufficient material'
          : 'Draw';
        endMsg = `\n\n🤝 *DRAW! (${reason})*\n_Room akan tetap tersimpan._`;
      } else if (chess.isCheck()) {
        const inCheckName = chess.turn() === 'w' ? myRoom.players.w : myRoom.players.b;
        endMsg = `\n\n⚠️ *CHECK! ${inCheckName} dalam bahaya!*`;
      }

      const nextName = chess.turn() === 'w' ? myRoom.players.w : myRoom.players.b;

      await alya.sendMessage(m.chat, {
        text:
          `♟️ *Langkah: ${result.san}* (${from} → ${to})\n` +
          `━━━━━━━━━━━━━━━\n` +
          `${info}\n\n` +
          `\`\`\`\n${boardStr}\n\`\`\`${endMsg}` +
          (endMsg ? '' : `\n\n⏳ Giliran *${nextName}*`),
      }, { quoted: m });
      return;
    }

    // ── chess board <room> ────────────────────────────────────────────────────
    if (sub === 'board') {
      if (!roomId) return replyalya(`❌ Format: *${prefix}chess board <namaroom>*`);
      const room = global._chessRooms[roomId];
      if (!room) return replyalya(`❌ Room *${roomId}* tidak ditemukan.`);
      if (room.groupId !== m.chat) return replyalya(`❌ Room ini bukan dari grup ini.`);
      if (!room.started) return replyalya(`⏳ Game belum dimulai. Start dulu: *${prefix}chess start ${roomId}*`);

      const isBlack  = room.senders.b === sender;
      const boardStr = renderBoard(room.fen, isBlack);
      const info     = formatRoomInfo(room, prefix);

      await alya.sendMessage(m.chat, {
        text:
          `📋 *Papan Catur - Room ${roomId}*\n` +
          `━━━━━━━━━━━━━━━\n` +
          `${info}\n\n` +
          `\`\`\`\n${boardStr}\n\`\`\``,
      }, { quoted: m });
      return;
    }

    // ── chess delete <room> ───────────────────────────────────────────────────
    if (sub === 'delete') {
      if (!roomId) return replyalya(`❌ Format: *${prefix}chess delete <namaroom>*`);
      const room = global._chessRooms[roomId];
      if (!room) return replyalya(`❌ Room *${roomId}* tidak ditemukan.`);
      if (room.groupId !== m.chat) return replyalya(`❌ Room ini bukan dari grup ini.`);
      if (room.creator !== sender) return replyalya(`❌ Hanya pembuat room yang bisa menghapus!`);

      delete global._chessRooms[roomId];
      return replyalya(`🗑️ Room *${roomId}* berhasil dihapus!`);
    }

    // ── Tidak ada subcommand yang cocok ──────────────────────────────────────
    return replyalya(
      `♟️ *CHESS GAME*\n\n` +
      `*Perintah:*\n` +
      `• *${prefix}chess create <room>* — Buat game baru\n` +
      `• *${prefix}chess join <room>* — Gabung game\n` +
      `• *${prefix}chess start <room>* — Mulai game & tampilkan papan\n` +
      `• *${prefix}chess move <dari> <ke> [promosi]* — Lakukan langkah\n` +
      `  _Contoh: ${prefix}chess move e2 e4_\n` +
      `  _Promosi: ${prefix}chess move e7 e8 q_\n` +
      `• *${prefix}chess board <room>* — Tampilkan papan sekarang\n` +
      `• *${prefix}chess delete <room>* — Hapus game (hanya pembuat)\n` +
      `• *${prefix}chess list* — Daftar room aktif di chat ini\n\n` +
      `_Papan ditampilkan sebagai teks (flip otomatis untuk hitam)_`
    );
  }
};
