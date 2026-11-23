// ============================================
// CATUR.JS — Simple Text Chess (Alya V12)
// ============================================

const PIECES = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
  empty: '⬜'
};

function initBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  // black back rank
  const back = ['R','N','B','Q','K','B','N','R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = 'b' + back[c];
    b[1][c] = 'bP';
    b[6][c] = 'wP';
    b[7][c] = 'w' + back[c];
  }
  return b;
}

function renderBoard(board, lastMove) {
  const cols = ['a','b','c','d','e','f','g','h'];
  let out = '♟ *PAPAN CATUR* ♙\n\n';
  out += '  a b c d e f g h\n';
  for (let r = 0; r < 8; r++) {
    out += `${8 - r} `;
    for (let c = 0; c < 8; c++) {
      const sq = `${cols[c]}${8 - r}`;
      const piece = board[r][c];
      const isLight = (r + c) % 2 === 0;
      if (piece) {
        out += PIECES[piece] + ' ';
      } else {
        out += (isLight ? '▫️' : '▪️') + ' ';
      }
    }
    out += `${8 - r}\n`;
  }
  out += '  a b c d e f g h';
  if (lastMove) out += `\n\n🔀 Langkah terakhir: *${lastMove}*`;
  return out;
}

function parseMove(input) {
  // format: e2e4 atau e2 e4
  const clean = input.replace(/\s+/g, '').toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8]$/.test(clean)) return null;
  const colMap = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7};
  return {
    fr: 8 - parseInt(clean[1]),
    fc: colMap[clean[0]],
    tr: 8 - parseInt(clean[3]),
    tc: colMap[clean[2]],
    raw: clean
  };
}

function isValidBasicMove(board, move, color) {
  const { fr, fc, tr, tc } = move;
  const piece = board[fr][fc];
  if (!piece) return { ok: false, reason: 'Tidak ada bidak di posisi itu.' };
  if (piece[0] !== color) return { ok: false, reason: `Bukan giliranmu! Kamu punya bidak *${color === 'w' ? 'putih' : 'hitam'}*.` };
  const target = board[tr][tc];
  if (target && target[0] === color) return { ok: false, reason: 'Tidak bisa makan bidakmu sendiri!' };

  const type = piece[1];
  const dr = tr - fr, dc = tc - fc;

  switch (type) {
    case 'P': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      if (dc === 0 && dr === dir && !target) return { ok: true };
      if (dc === 0 && dr === 2 * dir && fr === startRow && !board[fr + dir][fc] && !target) return { ok: true };
      if (Math.abs(dc) === 1 && dr === dir && target) return { ok: true };
      return { ok: false, reason: 'Langkah pion tidak valid.' };
    }
    case 'N':
      if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2))
        return { ok: true };
      return { ok: false, reason: 'Langkah kuda tidak valid.' };
    case 'B':
      if (Math.abs(dr) !== Math.abs(dc)) return { ok: false, reason: 'Gajah harus bergerak diagonal.' };
      return checkPath(board, fr, fc, tr, tc);
    case 'R':
      if (dr !== 0 && dc !== 0) return { ok: false, reason: 'Benteng harus bergerak lurus.' };
      return checkPath(board, fr, fc, tr, tc);
    case 'Q':
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc))
        return { ok: false, reason: 'Ratu tidak bisa bergerak seperti itu.' };
      return checkPath(board, fr, fc, tr, tc);
    case 'K':
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return { ok: true };
      return { ok: false, reason: 'Raja hanya bisa melangkah 1 kotak.' };
    default:
      return { ok: false, reason: 'Bidak tidak dikenal.' };
  }
}

function checkPath(board, fr, fc, tr, tc) {
  const dr = Math.sign(tr - fr), dc = Math.sign(tc - fc);
  let r = fr + dr, c = fc + dc;
  while (r !== tr || c !== tc) {
    if (board[r][c]) return { ok: false, reason: 'Jalur terhalang bidak lain.' };
    r += dr; c += dc;
  }
  return { ok: true };
}

function applyMove(board, move) {
  const newBoard = board.map(r => [...r]);
  const piece = newBoard[move.fr][move.fc];
  newBoard[move.tr][move.tc] = piece;
  newBoard[move.fr][move.fc] = null;
  // Promote pawn
  if (piece === 'wP' && move.tr === 0) newBoard[move.tr][move.tc] = 'wQ';
  if (piece === 'bP' && move.tr === 7) newBoard[move.tr][move.tc] = 'bQ';
  return newBoard;
}

function isKingDead(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === color + 'K') return false;
  return true;
}

module.exports = { initBoard, renderBoard, parseMove, isValidBasicMove, applyMove, isKingDead };
