// lib/guild.js
// Alya V20 — Guild System Core
// Menyimpan & mengelola data guild (member, party, quest board, log)
// Terpisah dari global.db.users, tapi referensi ke sana untuk class & duelLvl
'use strict';

// ═══════════════════════════════════════════════════════════════
// INIT DB
// ═══════════════════════════════════════════════════════════════
function ensureGuildDb() {
  if (!global.db) global.db = {};
  if (!global.db.guild) {
    global.db.guild = {
      members: {},
      parties: {},
      questBoardSolo: {},   // { [jid]: [ quest, quest, ... ] } papan misi per-user (biar unik)
      questBoardParty: {},  // { [partyId]: [ quest, ... ] }
      boardRefreshedAt: {}, // { [jid or partyId]: timestamp }
      log: []
    };
  }
  const g = global.db.guild;
  if (!g.members) g.members = {};
  if (!g.parties) g.parties = {};
  if (!g.questBoardSolo) g.questBoardSolo = {};
  if (!g.questBoardParty) g.questBoardParty = {};
  if (!g.boardRefreshedAt) g.boardRefreshedAt = {};
  if (!g.log) g.log = [];
  return g;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const QUEST_TYPES = {
  serang: {
    key: 'serang', label: 'Penyerangan', emoji: '⚔️',
    verbs: ['Menyerang sarang monster', 'Membersihkan gerombolan bandit', 'Menghancurkan markas Orc', 'Membunuh Boss Goblin', 'Menumpas gerombolan Slime beracun'],
    checkpoints: [
      'Bertemu gerombolan monster kecil di gerbang',
      'Terlibat baku hantam dengan penjaga sarang',
      'Menemukan jalur rahasia menuju ruang inti musuh',
      'Bertarung melawan unit elit musuh',
      'Menghadapi boss utama target serangan',
      'Membersihkan sisa monster yang kabur'
    ]
  },
  penjagaan: {
    key: 'penjagaan', label: 'Penjagaan', emoji: '🛡️',
    verbs: ['Mengawal rombongan bangsawan', 'Menjaga gerbang desa dari serangan malam', 'Mengawal karavan dagang', 'Menjaga perbatasan wilayah', 'Melindungi upacara pemujaan kuil'],
    checkpoints: [
      'Memulai pengawalan dari titik kumpul',
      'Menghalau percobaan penyergapan pertama',
      'Menenangkan warga yang panik akibat gangguan monster',
      'Bertahan dari gelombang serangan malam',
      'Mengawal target hingga titik aman',
      'Melakukan patroli akhir memastikan tidak ada ancaman tersisa'
    ]
  },
  ekspedisi: {
    key: 'ekspedisi', label: 'Ekspedisi', emoji: '🗺️',
    verbs: ['Menjelajahi Dungeon Reruntuhan Kuno', 'Memetakan Hutan Terlarang', 'Mencari material ramuan langka', 'Menyelidiki Gua Kristal', 'Menjelajahi Menara Terbengkalai'],
    checkpoints: [
      'Memasuki gerbang dungeon/area eksplorasi',
      'Menemukan jalur bercabang dan memilih arah',
      'Mengumpulkan material/herbal langka di sepanjang jalan',
      'Menghindari jebakan kuno yang mematikan',
      'Menemukan ruangan tersembunyi berisi harta karun',
      'Mencapai titik terdalam dan mengamankan temuan utama'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// REWARD SCALE (v3) — reward quest sekarang dihitung dari KOMBINASI:
//   1) Rank kesulitan misi guild (E/D/C/B/A)   -> moneyBase/xpBase di bawah
//   2) Peringkat DUEL player (E..A)            -> RANK_DUEL_MULTIPLIER (lib/playerlevel.js RANK_TIERS)
// Hasil akhir money selalu di-clamp ke range Rp1.000.000 - Rp50.000.000 untuk papan reguler (rank E-A).
// Peringkat duel S/SS/SSR TIDAK memakai papan ini — mereka punya papan quest terpisah
// (lihat generateEliteBoard / QUEST_ELITE_MULT) dengan reward = base tertinggi (rank A) x 5.
// ═══════════════════════════════════════════════════════════════
const DIFFICULTIES = [
  { stars: 1, label: 'E', durationMin: 15, moneyBase: 1000000,  xpBase: 400,  contribBase: 5,  minRank: 'F' },
  { stars: 2, label: 'D', durationMin: 25, moneyBase: 3000000,  xpBase: 900,  contribBase: 10, minRank: 'F' },
  { stars: 3, label: 'C', durationMin: 40, moneyBase: 8000000,  xpBase: 2000, contribBase: 18, minRank: 'E' },
  { stars: 4, label: 'B', durationMin: 60, moneyBase: 20000000, xpBase: 4200, contribBase: 30, minRank: 'D' },
  { stars: 5, label: 'A', durationMin: 90, moneyBase: 35000000, xpBase: 8000, contribBase: 50, minRank: 'C' }
];

const MIN_QUEST_MONEY = 1000000;   // Rp1jt — lantai reward papan reguler
const MAX_QUEST_MONEY = 50000000;  // Rp50jt — plafon reward papan reguler

// Multiplier reward berdasarkan PERINGKAT DUEL player (bukan rank guild F-A internal).
// Player rank rendah (E) dapat reward dekat moneyBase, player rank tinggi (A) dapat
// mendekati/menyentuh plafon Rp50jt di quest rank A. Peringkat di atas A (S/SS/SSR)
// tidak dipakai di sini — mereka pakai papan quest elite terpisah (QUEST_ELITE_MULT).
const RANK_DUEL_MULTIPLIER = {
  WARGA: 1,   // fallback, seharusnya tidak pernah kepakai (guild min level 10 = rank E)
  E: 1,
  D: 1.15,
  C: 1.3,
  B: 1.45,
  A: 1.6
};

function getQuestMoneyMultiplier(duelRankKey) {
  return RANK_DUEL_MULTIPLIER[duelRankKey] || 1;
}

const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'Legend'];
// ✅ FIX — Rank guild sekarang ditentukan dari POWER LEVEL (utama), BUKAN dari
// kontribusi lagi. Kontribusi tetap dicatat sebagai statistik (buat leaderboard/
// flavor), tapi sudah tidak lagi menaik-turunkan rank guild siapapun.
// Threshold power level di bawah diselaraskan dengan RANK_TIERS peringkat duel
// di lib/playerlevel.js (Warga Biasa < E10, D20, C30, B50, A100, S200, SS499,
// Legend/SSR 999) supaya rank guild dan peringkat duel terasa konsisten.
const RANK_THRESHOLD = { F: 0, E: 10, D: 20, C: 30, B: 50, A: 100, S: 200, SS: 499, Legend: 999 };
// (RANK_THRESHOLD lama berbasis kontribusi disimpan sbg referensi historis saja,
// tidak dipakai lagi: { F:0, E:50, D:150, C:350, B:700, A:1300, S:2200, SS:3500, Legend:5500 })

const PARTY_CREATE_COST = 1000000;
const PARTY_CREATE_MIN_DUELLVL = 10;
const PARTY_MAX_MEMBER = 4;
const CHECKQUEST_STALE_MS = 60 * 60 * 1000; // 1 jam
const PARTY_VOTE_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit

// ═══════════════════════════════════════════════════════════════
// SEEDED RNG (biar checkpoint log konsisten selama misi sama)
// ═══════════════════════════════════════════════════════════════
function seededRng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════
// RANK HELPERS
// ═══════════════════════════════════════════════════════════════
// ✅ FIX KRITIS — Rank guild sekarang berbasis POWER LEVEL, bukan kontribusi.
// Power Level = representasi kekuatan tempur riil player: duelLvl (bobot utama)
// + sedikit tambahan dari weapon yang sedang di-equip (effectiveDmg weapon,
// dikonversi ke skala level yang sama dengan pembagi 5 supaya weapon kelas
// atas bisa menambah ~1-2 "power level" tapi TIDAK mendominasi duelLvl —
// duelLvl tetap komponen utama sesuai permintaan).
// userDb di sini adalah entri global.db.users[jid] (butuh field duelLvl,
// equippedWeapon, weapons). W = require('./weapons.js') diteruskan dari
// pemanggil supaya lib/guild.js tidak perlu require lib/weapons.js langsung
// (hindari circular require, konsisten dgn pola di plugins/cmd/duel.js).
function getPowerLevel(userDb, W) {
  const duelLvl = parseInt(userDb?.duelLvl) || 0;
  let weaponPower = 0;
  if (W && W.getEffectiveWeaponStats && userDb?.equippedWeapon) {
    const wId = userDb.equippedWeapon;
    const owned = userDb.weapons?.[wId];
    if (owned) {
      const eff = W.getEffectiveWeaponStats(wId, owned.level || 1);
      if (eff?.effectiveDmg) weaponPower = Math.round(eff.effectiveDmg / 5);
    }
  }
  return duelLvl + weaponPower;
}

// Rank guild dari Power Level (dipakai saat daftar & setiap kali status di-refresh)
function getRankFromPowerLevel(powerLevel) {
  const pl = Math.max(0, parseInt(powerLevel) || 0);
  let rank = 'F';
  for (const r of RANKS) {
    if (pl >= RANK_THRESHOLD[r]) rank = r;
  }
  return rank;
}

// Legacy — kontribusi TIDAK LAGI dipakai untuk menentukan rank guild (lihat
// getRankFromPowerLevel di atas), fungsi ini disimpan hanya untuk kompatibilitas
// kalau ada kode lama yang masih memanggilnya; jangan pakai untuk rank baru.
function getRankFromContribution(contribution) {
  let rank = 'F';
  for (const r of RANKS) {
    if (contribution >= RANK_THRESHOLD[r]) rank = r;
  }
  return rank;
}

function rankIndex(rank) {
  return RANKS.indexOf(rank);
}

// ═══════════════════════════════════════════════════════════════
// MEMBER HELPERS
// ═══════════════════════════════════════════════════════════════
function isGuildMember(jid) {
  const g = ensureGuildDb();
  return !!g.members[jid];
}

function getMember(jid) {
  const g = ensureGuildDb();
  return g.members[jid] || null;
}

function registerMember(jid, initialRank) {
  const g = ensureGuildDb();
  if (!g.members[jid]) {
    g.members[jid] = {
      guildJoinedAt: Date.now(),
      rank: initialRank || 'F',
      contribution: 0,
      questsSolo: 0,
      questsParty: 0,
      earnings: 0,
      activeQuest: null,
      partyId: null
    };
  }
  return g.members[jid];
}

// ✅ FIX: kontribusi sekarang HANYA statistik (leaderboard/riwayat quest),
// tidak lagi mengubah rank guild. Rank guild murni dari Power Level — lihat
// getRankFromPowerLevel() & refreshMemberRank() di bawah, dipanggil terpisah
// (biasanya oleh statusopen.js/guildstats.js setiap kali ingin sinkronkan
// rank member dengan power level terbarunya).
function addContribution(jid, amount) {
  const m = getMember(jid);
  if (!m) return;
  m.contribution = (m.contribution || 0) + amount;
}

// Sinkronkan rank member dengan Power Level TERKINI (dipanggil setelah level
// naik/turun — misal habis menang/kalah duel, atau upgrade weapon — supaya
// rank guild yang tertera selalu representasi power level terbaru, bukan cuma
// snapshot saat pendaftaran).
function refreshMemberRank(jid, userDb, W) {
  const m = getMember(jid);
  if (!m) return null;
  const power = getPowerLevel(userDb, W);
  m.rank = getRankFromPowerLevel(power);
  return m.rank;
}

// ═══════════════════════════════════════════════════════════════
// QUEST GENERATION
// ═══════════════════════════════════════════════════════════════
function genQuestId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function generateQuest(typeKey, difficultyIdx, isParty, duelRankKey = 'E') {
  const type = QUEST_TYPES[typeKey];
  const diff = DIFFICULTIES[difficultyIdx];
  const partyMult = isParty ? 1.8 : 1;
  const rankMult = getQuestMoneyMultiplier(duelRankKey);

  const rawMoney = diff.moneyBase * partyMult * rankMult;
  const moneyReward = Math.min(MAX_QUEST_MONEY, Math.max(MIN_QUEST_MONEY, Math.round(rawMoney)));

  return {
    id: genQuestId(isParty ? 'PQ' : 'SQ'),
    type: type.key,
    typeLabel: type.label,
    typeEmoji: type.emoji,
    name: pick(type.verbs, Math.random),
    stars: diff.stars,
    diffLabel: diff.label,
    minRank: diff.minRank,
    durationMs: diff.durationMin * 60 * 1000,
    moneyReward,
    xpReward: Math.round(diff.xpBase * partyMult * rankMult),
    contribReward: Math.round(diff.contribBase * partyMult),
    isParty,
    isElite: false,
    minMember: isParty ? Math.min(2 + difficultyIdx, PARTY_MAX_MEMBER) : 1
  };
}

function generateBoard(isParty, count = 5, duelRankKey = 'E') {
  const board = [];
  for (let i = 0; i < count; i++) {
    const typeKeys = Object.keys(QUEST_TYPES);
    const typeKey = pick(typeKeys, Math.random);
    const difficultyIdx = Math.floor(Math.random() * DIFFICULTIES.length);
    board.push(generateQuest(typeKey, difficultyIdx, isParty, duelRankKey));
  }
  return board;
}

const BOARD_REFRESH_MS = 15 * 60 * 1000; // papan misi refresh tiap 15 menit

// ═══════════════════════════════════════════════════════════════
// PAPAN QUEST ELITE (khusus peringkat duel S / SS / SSR)
// Terpisah total dari papan reguler E-A. Soal & reward beda:
// reward = moneyBase RANK A (tertinggi papan reguler) x 5, TIDAK di-clamp ke 50jt
// karena memang didesain melampaui plafon papan reguler sebagai reward eksklusif.
// ═══════════════════════════════════════════════════════════════
const QUEST_ELITE_MULT = 5;
const ELITE_RANKS = ['S', 'SS', 'SSR'];

const ELITE_QUEST_TYPES = {
  perburuan_elit: {
    key: 'perburuan_elit', label: 'Perburuan Elit', emoji: '🌟',
    verbs: ['Memburu Naga Bayangan di Puncak Gunung Terlarang', 'Menumpas Raja Iblis Kegelapan yang Bangkit', 'Menaklukkan Titan Purba di Reruntuhan Dewa', 'Membasmi Wabah Monster Mitos di Kota Hantu'],
    checkpoints: [
      'Melacak jejak kekuatan elit di penjuru benua',
      'Menembus penjagaan pasukan elit musuh',
      'Bertarung melawan jenderal kegelapan',
      'Menyingkap rahasia kelemahan target elit',
      'Pertarungan puncak melawan target utama',
      'Mengamankan wilayah dari sisa kekuatan elit'
    ]
  }
};

function generateEliteQuest(isParty) {
  const type = ELITE_QUEST_TYPES.perburuan_elit;
  const topDiff = DIFFICULTIES[DIFFICULTIES.length - 1]; // Rank A, tertinggi papan reguler
  const partyMult = isParty ? 1.8 : 1;
  return {
    id: genQuestId(isParty ? 'PQE' : 'SQE'),
    type: type.key,
    typeLabel: type.label,
    typeEmoji: type.emoji,
    name: pick(type.verbs, Math.random),
    stars: topDiff.stars,
    diffLabel: 'ELITE',
    minRank: 'S',
    durationMs: topDiff.durationMin * 60 * 1000,
    moneyReward: Math.round(topDiff.moneyBase * QUEST_ELITE_MULT * partyMult),
    xpReward: Math.round(topDiff.xpBase * QUEST_ELITE_MULT * partyMult),
    contribReward: Math.round(topDiff.contribBase * QUEST_ELITE_MULT * partyMult),
    isParty,
    isElite: true,
    minMember: isParty ? Math.min(2, PARTY_MAX_MEMBER) : 1
  };
}

function generateEliteBoard(isParty, count = 5) {
  const board = [];
  for (let i = 0; i < count; i++) board.push(generateEliteQuest(isParty));
  return board;
}

function getSoloBoard(jid, filterType = null, duelRankKey = 'E') {
  const g = ensureGuildDb();
  const isElite = ELITE_RANKS.includes(duelRankKey);
  const boardKey = isElite ? jid + '_elite' : jid;
  const lastRefresh = g.boardRefreshedAt[boardKey] || 0;
  if (!g.questBoardSolo[boardKey] || Date.now() - lastRefresh > BOARD_REFRESH_MS) {
    g.questBoardSolo[boardKey] = isElite ? generateEliteBoard(false, 6) : generateBoard(false, 6, duelRankKey);
    g.boardRefreshedAt[boardKey] = Date.now();
  }
  let board = g.questBoardSolo[boardKey];
  if (filterType) board = board.filter(q => q.type === filterType);
  return board;
}

function getPartyBoard(partyId, filterType = null, duelRankKey = 'E') {
  const g = ensureGuildDb();
  const isElite = ELITE_RANKS.includes(duelRankKey);
  const key = (isElite ? 'p_elite_' : 'p_') + partyId;
  const boardKey = isElite ? partyId + '_elite' : partyId;
  const lastRefresh = g.boardRefreshedAt[key] || 0;
  if (!g.questBoardParty[boardKey] || Date.now() - lastRefresh > BOARD_REFRESH_MS) {
    g.questBoardParty[boardKey] = isElite ? generateEliteBoard(true, 6) : generateBoard(true, 6, duelRankKey);
    g.boardRefreshedAt[key] = Date.now();
  }
  let board = g.questBoardParty[boardKey];
  if (filterType) board = board.filter(q => q.type === filterType);
  return board;
}

// ═══════════════════════════════════════════════════════════════
// PARTY HELPERS
// ═══════════════════════════════════════════════════════════════
function genPartyId() {
  return 'PT' + Math.floor(Math.random() * 900000 + 100000);
}

function createParty(leaderJid) {
  const g = ensureGuildDb();
  const partyId = genPartyId();
  g.parties[partyId] = {
    id: partyId,
    leader: leaderJid,
    members: [leaderJid],
    maxMember: PARTY_MAX_MEMBER,
    createdAt: Date.now(),
    activeQuest: null
  };
  const m = registerMember(leaderJid);
  m.partyId = partyId;
  return g.parties[partyId];
}

function listOpenParties() {
  const g = ensureGuildDb();
  return Object.values(g.parties).filter(p => p.members.length < p.maxMember && !p.activeQuest);
}

function getParty(partyId) {
  const g = ensureGuildDb();
  return g.parties[partyId] || null;
}

function getPartyOfMember(jid) {
  const m = getMember(jid);
  if (!m || !m.partyId) return null;
  return getParty(m.partyId);
}

function joinParty(jid, partyId) {
  const g = ensureGuildDb();
  const party = g.parties[partyId];
  if (!party) return { ok: false, reason: 'notfound' };
  if (party.members.length >= party.maxMember) return { ok: false, reason: 'full' };
  if (party.members.includes(jid)) return { ok: false, reason: 'already' };
  if (party.activeQuest) return { ok: false, reason: 'busy' };
  party.members.push(jid);
  const m = registerMember(jid);
  m.partyId = partyId;
  return { ok: true, party };
}

// ═══════════════════════════════════════════════════════════════
// CHECKPOINT / PROGRESS LOG (deterministic, seeded by quest id + startedAt)
// ═══════════════════════════════════════════════════════════════
// Menghasilkan daftar checkpoint yang "sudah terjadi" berdasarkan progres waktu
function buildCheckpointLog(activeQuest, now = Date.now()) {
  const type = QUEST_TYPES[activeQuest.type];
  if (!type) return [];
  const rng = seededRng(activeQuest.questId + '_' + activeQuest.startedAt);

  const elapsed = now - activeQuest.startedAt;
  const totalDuration = activeQuest.durationMs || (30 * 60 * 1000);
  // progress dihitung dari elapsed vs total durasi misi, dicap di 100%
  const progressRatio = Math.min(1, elapsed / totalDuration);

  const pool = type.checkpoints;
  // urutan checkpoint di-shuffle sekali per quest pakai seeded rng, lalu diambil sesuai progres
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const revealCount = Math.max(1, Math.round(progressRatio * shuffled.length));
  const revealed = shuffled.slice(0, revealCount);

  // kasih timestamp relatif tiap checkpoint biar berasa progresif
  return revealed.map((text, idx) => {
    const stepTime = activeQuest.startedAt + Math.round((idx + 1) / shuffled.length * totalDuration);
    return { text, at: Math.min(stepTime, now) };
  });
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

function isQuestStale(activeQuest, now = Date.now()) {
  return (now - activeQuest.startedAt) >= CHECKQUEST_STALE_MS;
}

function isQuestReadyToComplete(activeQuest, now = Date.now()) {
  return (now - activeQuest.startedAt) >= (activeQuest.durationMs || 0);
}

module.exports = {
  ensureGuildDb,
  QUEST_TYPES,
  ELITE_QUEST_TYPES,
  DIFFICULTIES,
  RANKS,
  RANK_THRESHOLD,
  RANK_DUEL_MULTIPLIER,
  MIN_QUEST_MONEY,
  MAX_QUEST_MONEY,
  QUEST_ELITE_MULT,
  ELITE_RANKS,
  PARTY_CREATE_COST,
  PARTY_CREATE_MIN_DUELLVL,
  PARTY_MAX_MEMBER,
  CHECKQUEST_STALE_MS,
  PARTY_VOTE_TIMEOUT_MS,
  BOARD_REFRESH_MS,
  getRankFromContribution,
  getPowerLevel,
  getRankFromPowerLevel,
  refreshMemberRank,
  getQuestMoneyMultiplier,
  rankIndex,
  isGuildMember,
  getMember,
  registerMember,
  addContribution,
  generateQuest,
  generateEliteQuest,
  generateBoard,
  generateEliteBoard,
  getSoloBoard,
  getPartyBoard,
  genPartyId,
  createParty,
  listOpenParties,
  getParty,
  getPartyOfMember,
  joinParty,
  buildCheckpointLog,
  formatDuration,
  isQuestStale,
  isQuestReadyToComplete,
  seededRng,
  pick
};
