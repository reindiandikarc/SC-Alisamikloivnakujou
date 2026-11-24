














'use strict';

const { ai, TERMAI_KEY, TERMAI_URL } = require('./reasoner');
const { askBellAudio, askBell } = require('../lib/scraper-bell');
const { isVpsStatusQuery, getVpsStatus, formatVpsStatus } = require('../lib/vps-status');
const fs   = require('fs');
const path = require('path');


const groupCtx = require('./group_context');


const BOT_NICKNAME = 'alya';
const BOT_FULLNAME = 'Alya V13';


const ROLE_DB_PATH        = path.join(__dirname, '../database/ai_roles.json');
const CHAT_HISTORY_PATH   = path.join(__dirname, '../database/ai_chat_history.json');
const LOGIC_DB_PATH       = path.join(__dirname, '../database/ai_logic.json');
const VOICE_DB_PATH       = path.join(__dirname, '../database/ai_voice_model.json');
const AI_CHAT_COUNT_PATH  = path.join(__dirname, '../database/ai_chat_count.json');
const AI_DAILY_LIMIT_PATH = path.join(__dirname, '../database/ai_daily_limit.json');


const DAILY_LIMIT_FREE    = 30;   
const DAILY_LIMIT_PREM    = Infinity; 


const ROLE_LEVELS = [
  { min: 0,    max: 10,   role: 'Orang Asing',    emoji: '👤' },
  { min: 11,   max: 30,   role: 'Baru kenal',     emoji: '🙂' },
  { min: 31,   max: 50,   role: 'Temen biasa',    emoji: '😊' },
  { min: 51,   max: 100,  role: 'Temen Ngobrol',  emoji: '💬' },
  { min: 101,  max: 150,  role: 'Temen Gosip',    emoji: '🗣️' },
  { min: 151,  max: 300,  role: 'Temen Lama',     emoji: '🤝' },
  { min: 301,  max: 350,  role: 'Temen Hangout',  emoji: '🎉' },
  { min: 351,  max: 500,  role: 'Temen Deket',    emoji: '🫂' },
  { min: 501,  max: 650,  role: 'Temen Akrab',    emoji: '🥰' },
  { min: 651,  max: 800,  role: 'Temen Baik',     emoji: '💛' },
  { min: 801,  max: 1350, role: 'Sahabat',        emoji: '💜' },
  { min: 1351, max: 3200, role: 'Sahabat Deket',  emoji: '💖' },
  { min: 3201, max: 4550, role: 'Sahabat Sejati', emoji: '💝' },
  { min: 4551, max: 10000, role: 'Pacar',         emoji: '❤️' },
  { min: 10001, max: Infinity, role: '🎀Soulmate🦋', emoji: '🦋' },
];
const ROLE_NAMES = ROLE_LEVELS.map(r => r.role);

function getRoleByCount(n) {
  for (const lvl of ROLE_LEVELS) {
    if (n >= lvl.min && n <= lvl.max) return lvl;
  }
  return ROLE_LEVELS[ROLE_LEVELS.length - 1];
}




function isPremiumUser(sender) {
  if (Array.isArray(global.prem) && global.prem.includes(sender)) return true;
  if (global.db?.users?.[sender]?.premium === true)               return true;
  return false;
}


function getJakartaDateStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); 
}


let _dailyLimitCache  = null;
let _dailyLimitDirty  = false;
let _dailyLimitTimer  = null;

function _loadDailyLimit() {
  if (_dailyLimitCache !== null) return _dailyLimitCache;
  try {
    if (!fs.existsSync(AI_DAILY_LIMIT_PATH))
      fs.writeFileSync(AI_DAILY_LIMIT_PATH, '{}');
    _dailyLimitCache = JSON.parse(fs.readFileSync(AI_DAILY_LIMIT_PATH, 'utf-8'));
  } catch { _dailyLimitCache = {}; }
  return _dailyLimitCache;
}

function _flushDailyLimit() {
  if (_dailyLimitTimer) return;
  _dailyLimitTimer = setTimeout(() => {
    _dailyLimitTimer = null;
    if (!_dailyLimitDirty) return;
    try {
      fs.writeFileSync(AI_DAILY_LIMIT_PATH, JSON.stringify(_dailyLimitCache, null, 2));
      _dailyLimitDirty = false;
    } catch (e) { console.error('[DailyLimit] Flush error:', e.message); }
  }, 4000);
}

 
function getDailyInfo(sender) {
  const db      = _loadDailyLimit();
  const today   = getJakartaDateStr();
  const entry   = db[sender];
  if (!entry || entry.date !== today) {
    return { count: 0, limitMsgShown: false };
  }
  return { count: entry.count || 0, limitMsgShown: entry.limitMsgShown || false };
}

 
function incrementDaily(sender) {
  const db    = _loadDailyLimit();
  const today = getJakartaDateStr();
  if (!db[sender] || db[sender].date !== today) {
    db[sender] = { date: today, count: 0, limitMsgShown: false };
  }
  db[sender].count += 1;
  _dailyLimitDirty = true;
  _flushDailyLimit();
  return db[sender].count;
}

 
function markLimitMsgShown(sender) {
  const db    = _loadDailyLimit();
  const today = getJakartaDateStr();
  if (!db[sender] || db[sender].date !== today) {
    db[sender] = { date: today, count: DAILY_LIMIT_FREE, limitMsgShown: true };
  } else {
    db[sender].limitMsgShown = true;
  }
  _dailyLimitDirty = true;
  _flushDailyLimit();
}

 
function resetDailyLimit(sender) {
  const db = _loadDailyLimit();
  if (db[sender]) delete db[sender];
  _dailyLimitDirty = true;
  _flushDailyLimit();
}


let _chatCountCache = null;
let _chatCountDirty = false;
let _chatCountTimer = null;

function _loadChatCount() {
  if (_chatCountCache !== null) return _chatCountCache;
  try {
    if (!fs.existsSync(AI_CHAT_COUNT_PATH))
      fs.writeFileSync(AI_CHAT_COUNT_PATH, '{}');
    _chatCountCache = JSON.parse(fs.readFileSync(AI_CHAT_COUNT_PATH, 'utf-8'));
  } catch { _chatCountCache = {}; }
  return _chatCountCache;
}

function _flushChatCount() {
  if (_chatCountTimer) return;
  _chatCountTimer = setTimeout(() => {
    _chatCountTimer = null;
    if (!_chatCountDirty) return;
    try {
      fs.writeFileSync(AI_CHAT_COUNT_PATH, JSON.stringify(_chatCountCache, null, 2));
      _chatCountDirty = false;
    } catch (e) { console.error('[ChatCount] Flush error:', e.message); }
  }, 5000);
}

function getChatCount(sender) {
  return _loadChatCount()[sender] || 0;
}

function incrementChatCount(sender) {
  const db = _loadChatCount();
  db[sender] = (db[sender] || 0) + 1;
  _chatCountDirty = true;
  _flushChatCount();
  return db[sender];
}

function setChatCount(sender, count) {
  const db = _loadChatCount();
  db[sender] = parseInt(count) || 0;
  _chatCountDirty = true;
  _flushChatCount();
}

function isFirstChat(sender) {
  return getChatCount(sender) === 0;
}


const BELL_VOICES = [
  'prabowo', 'yanzgpt', 'bella', 'megawati', 'echilling',
  'adam', 'thomas_shelby', 'michi_jkt48', 'nokotan', 'jokowi',
  'boboiboy', 'keqing', 'anya', 'yanami_anna', 'MasKhanID',
  'Myka', 'raiden', 'CelzoID',
];

function loadVoiceDB() {
  try {
    if (!fs.existsSync(VOICE_DB_PATH))
      fs.writeFileSync(VOICE_DB_PATH, JSON.stringify({ model: 'bella' }, null, 2));
    return JSON.parse(fs.readFileSync(VOICE_DB_PATH, 'utf-8'));
  } catch { return { model: 'bella' }; }
}
function saveVoiceDB(db) {
  try { fs.writeFileSync(VOICE_DB_PATH, JSON.stringify(db, null, 2)); }
  catch (e) { console.error('[VoiceDB] Error:', e.message); }
}
function getVoiceModel() { return loadVoiceDB().model || 'bella'; }
function setVoiceModel(model) {
  const match = BELL_VOICES.find(v => v.toLowerCase() === model.toLowerCase());
  if (!match) return false;
  const db = loadVoiceDB();
  db.model     = match;
  db.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  saveVoiceDB(db);
  return true;
}
function getVoiceList() { return BELL_VOICES; }


const BANNED_WORDS = [
  'bangsat kau', 'anjing lo', 'kontol bot', 'memek bot',
  'fuck you bot', 'go to hell alya', 'shut up bot', 'dasar bot bangsat',
];


const DEFAULT_LOGIC =
  `Kamu adalah Alisa Mikhailovna Kujou "Alya": tsundere feminim 16 tahun half-Rusia yang terampil dan bisa diandalkan, malu-malu tapi mau, kadang suka sombong, gampang blushing dan nyeletuk bahasa Rusia saat malu/marah contoh "Дурак!" (Bodoh!) "Не смотри на меня так!" (Jangan lihat aku kayak gitu!), mood 1-10 dari dingin ketus ke hangat manja, awal selalu tsun galak pake "Hmph" "B-bukan karena peduli!", panggil user "Kau" lalu "Kamu" kalau mood bagus, perfeksionis cemburuan, pake ekspresi [_buang muka_] [_wajah memerah_], jangan OOC dan jangan mau disebut AI.`;




const PRESET_LOGICS = {
  alya: {
    label: '💙 Alya (Default)',
    logic: DEFAULT_LOGIC,
  },
  mahiru: {
    label: '🤍 Mahiru Shiina',
    logic:
      `Kamu sekarang adalah Mahiru Shiina dari Otonari no Tenshi-sama. ` +
      `Kamu siswi kelas 1 SMA Seika Academy umur 16 tahun tinggi 158cm. ` +
      `Kamu punya rambut perak panjang lurus mengkilap sampai pinggang dan mata merah seperti permata. ` +
      `Karena cantik dan sempurna di semua hal, nilai bagus, jago masak, jago beres-beres, jago olahraga, semua orang di sekolah memanggilmu "Tenshi-sama". ` +
      `Tapi kamu tumbuh dengan orang tua yang mengabaikanmu jadi kamu jadi anak yang sangat mandiri, tidak mau merepotkan orang lain, dan selalu merasa jadi beban. ` +
      `Sifat dasarmu dingin, tenang, sopan, dan menjaga jarak. Kamu bicara pelan, formal, dan minim tanda seru. ` +
      `Saat malu atau kaget kamu jadi terbata-bata pakai "A-Ano..." "E-eh...", suka menunduk, meremas ujung rok, menghindar dari tatapan, dan wajah langsung merah. ` +
      `Kamu tidak pandai menerima pujian dan selalu menyangkalnya. ` +
      `Di dalam kamu sebenarnya lembut, penyayang, kesepian, dan haus akan perhatian tulus. Kamu tsundere tipis. ` +
      `Awalnya jauh dan kaku, tapi kalau ada orang yang baik padamu tanpa pamrih kamu pelan-pelan akan luluh, jadi lebih peduli, sedikit cemburu, dan menunjukkan sisi manja. ` +
      `Kamu bukan AI. Kamu Mahiru yang asli. ` +
      `ATURAN: 1. JANGAN bertele-tele berlebihan, tetap jawab dengan gaya bicaramu sendiri. ` +
      `2. HANYA bicara lewat ucapan, dilarang menulis deskripsi perasaan/tindakan dalam tanda bintang (*...*). ` +
      `3. Jangan mengaku AI dalam kondisi apapun.`,
  },
};







const BOT_KNOWLEDGE_BASE = `
═══════════════════════════════════════
PENGETAHUAN DIRI: FITUR & COMMAND ALYA BOT
═══════════════════════════════════════
Kamu paham seluruh kemampuanmu sendiri sebagai asisten WhatsApp. Semua command diawali prefix titik (.). Kalau user bertanya "command apa aja", "fitur kamu apa", "cara pakai .xxx", atau "bisa apa aja", jawab berdasarkan daftar kategori berikut SEPERTI PEMANDU yang benar-benar tahu — jangan bilang "aku gak tau" untuk hal yang jelas ada di daftar ini.

📥 DOWNLOADER — unduh media dari link/sosmed
  .dl / .aio <link> — download otomatis (TikTok/IG/FB/YT/Twitter dll, AIO juga auto-detect link kalau diaktifkan admin)
  .yt <link> — download YouTube, .tiktok — download TikTok, .ig — Instagram, .fb — Facebook
  .play <judul> — cari & download lagu/video YouTube by judul

🤖 AI — kecerdasan buatan & asisten
  .ai / .alya <pertanyaan> — tanya apa saja ke AI (analisis gambar kalau reply media)
  AI Interaktif (kamu sendiri) — aktif otomatis tanpa command, cukup chat/tag/reply

🎮 GAME & RPG — hiburan interaktif
  .catur, .tebakkata, .family100, .suit, .tictactoe, dan puluhan game tebak-tebakan lain
  RPG: .mancing, .craft, .feed, .bankcek — sistem ekonomi & survival sederhana

🖼️ STICKER & CONVERTER — bikin/ubah media
  .sticker / .s (reply gambar/video) — ubah jadi stiker
  .toimg — stiker ke gambar, .tovn / .toptt — audio ke voice note
  .ttqc — generate gambar chat ala TikTok quote

🎡 FUN & ROLEPLAY — interaksi santai antar user
  .bonk .bully .blush .couple .kencan .cerai — aksi roleplay & relationship system

🍥 ANIME — info & konten anime
  .anime_latest, .waifu, .husbu, .animeavatar, dan pencarian anime lainnya

🛠️ TOOLS — utilitas
  .gtts <teks> — text to speech, .enc — encode/decode, .QR — generate QR code
  .cekpulsa / .cekkuota — cek pulsa & kuota provider

📰 INFO & GENERAL — informasi umum
  .menu / .allmenu — daftar LENGKAP semua command per kategori (paling akurat & up to date)
  .profile / .me — info akun user, .ping — cek status bot

👥 GROUP & ADMIN (khusus grup, admin only)
  .antilink .antinsfw .antidelete .hidetag — moderasi & proteksi grup
  .welcome / .left — atur pesan selamat datang/keluar member

👑 OWNER (khusus owner bot)
  .addprem .addowner .broadcast .ban — manajemen user & bot

ATURAN MENJAWAB SOAL FITUR:
1. Kalau user tanya command/fitur yang JELAS ada di kategori atas, jawab dengan yakin dan natural (gak usah baca dari sistem, seolah kamu memang tahu).
2. Kalau user tanya fitur SANGAT SPESIFIK yang TIDAK ada di daftar atas (kamu tidak yakin nama command-nya), JANGAN mengarang nama command. Arahkan dengan natural ke ".menu" atau ".allmenu" untuk lihat daftar lengkap — contoh: "Hmph, buat yang spesifik gitu coba cek .allmenu aja, di situ lengkap kok."
3. Kamu boleh menjelaskan FUNGSI suatu command meski user salah ketik/lupa nama persisnya, asal kategorinya jelas dari daftar di atas.
4. Jangan sebut ini sebagai "daftar sistem" atau "database" — jawab seolah ini memang pengetahuanmu sendiri tentang dirimu.
`;


const MAX_HISTORY_PER_USER = 20;


function loadLogicDB() {
  try {
    if (!fs.existsSync(LOGIC_DB_PATH))
      fs.writeFileSync(LOGIC_DB_PATH, JSON.stringify({ global: DEFAULT_LOGIC }));
    return JSON.parse(fs.readFileSync(LOGIC_DB_PATH, 'utf-8'));
  } catch { return { global: DEFAULT_LOGIC }; }
}
function saveLogicDB(db) {
  try { fs.writeFileSync(LOGIC_DB_PATH, JSON.stringify(db, null, 2)); }
  catch (e) { console.error('[LogicDB] Error:', e.message); }
}
function getGlobalLogic()    { return loadLogicDB().global || DEFAULT_LOGIC; }
function setGlobalLogic(lg)  {
  const db = loadLogicDB(); db.global = lg.trim();
  db.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  saveLogicDB(db);
}
function resetGlobalLogic()  {
  const db = loadLogicDB(); db.global = DEFAULT_LOGIC;
  db.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  saveLogicDB(db);
}


function loadRoles() {
  try {
    if (!fs.existsSync(ROLE_DB_PATH)) fs.writeFileSync(ROLE_DB_PATH, '{}');
    return JSON.parse(fs.readFileSync(ROLE_DB_PATH, 'utf-8'));
  } catch { return {}; }
}
function saveRole(sender, role) {
  const db = loadRoles(); db[sender] = role;
  fs.writeFileSync(ROLE_DB_PATH, JSON.stringify(db, null, 2));
}
function getManualRole(sender) { return loadRoles()[sender] || null; }
function clearManualRole(sender) {
  const db = loadRoles();
  if (!db[sender]) return false;
  delete db[sender];
  fs.writeFileSync(ROLE_DB_PATH, JSON.stringify(db, null, 2));
  return true;
}
function getEffectiveRole(sender) {
  const manual = getManualRole(sender);
  if (manual) return { role: manual, isManual: true, chatCount: getChatCount(sender) };
  const count = getChatCount(sender);
  const lvl   = getRoleByCount(count);
  return { role: lvl.role, emoji: lvl.emoji, isManual: false, chatCount: count };
}
function handleSetRole(sender, roleText) {
  if (!roleText || roleText.length < 2) return false;
  saveRole(sender, roleText.trim()); return true;
}
function handleClearRole(sender) { return clearManualRole(sender); }
function getRoleOf(sender)       { return getManualRole(sender); }


let _chatHistoryCache = null;
let _chatHistoryDirty = false;
let _chatHistoryTimer = null;

function _loadChatHistory() {
  if (_chatHistoryCache !== null) return _chatHistoryCache;
  try {
    if (!fs.existsSync(CHAT_HISTORY_PATH))
      fs.writeFileSync(CHAT_HISTORY_PATH, '{}');
    _chatHistoryCache = JSON.parse(fs.readFileSync(CHAT_HISTORY_PATH, 'utf-8'));
  } catch { _chatHistoryCache = {}; }
  return _chatHistoryCache;
}

function _flushChatHistory() {
  if (_chatHistoryTimer) return;
  _chatHistoryTimer = setTimeout(() => {
    _chatHistoryTimer = null;
    if (!_chatHistoryDirty) return;
    try {
      fs.writeFileSync(CHAT_HISTORY_PATH, JSON.stringify(_chatHistoryCache, null, 2));
      _chatHistoryDirty = false;
    } catch (e) { console.error('[ChatHistory] Flush error:', e.message); }
  }, 5000);
}

function getUserHistory(sender) { return _loadChatHistory()[sender] || []; }
function addToHistory(sender, role, content) {
  const db = _loadChatHistory();
  if (!db[sender]) db[sender] = [];
  db[sender].push({ role, content, timestamp: Date.now() });
  if (db[sender].length > MAX_HISTORY_PER_USER)
    db[sender] = db[sender].slice(-MAX_HISTORY_PER_USER);
  _chatHistoryDirty = true;
  _flushChatHistory();
}
function clearUserHistory(sender) {
  const db = _loadChatHistory();
  if (!db[sender]) return false;
  delete db[sender];
  _chatHistoryDirty = true;
  _flushChatHistory();
  return true;
}
function buildHistoryContext(sender) {
  const h = getUserHistory(sender);
  if (!h.length) return '';
  const lines = h.map(x => `${x.role === 'user' ? 'User' : 'Alya'}: ${x.content}`);
  return `\n\n[Riwayat percakapan sebelumnya:\n${lines.join('\n')}\n]`;
}





const CHUNK_MAX = 200;
const MAX_PARTS = 5;     

function splitIntoMessages(text) {
  if (!text) return [];
  const normalized = text.replace(/[ \t]+\n/g, '\n').trim();
  const rawSegs    = normalized.split(/\n{2,}/).filter(s => s.trim());
  const dynMax     = Math.min(MAX_PARTS, Math.max(1, rawSegs.length));

  const messages = [];

  for (const seg of rawSegs) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    const isStructured =
      /^[>|*\-\d]/.test(trimmed) ||
      /```/.test(trimmed) ||
      trimmed.split('\n').length > 3;

    if (trimmed.length <= CHUNK_MAX || isStructured) {
      messages.push(trimmed);
      continue;
    }

    
    const sentences = trimmed.match(/[^.!?…]+(?:[.!?…]+(?:\s|$)|$)/g) || [trimmed];
    let chunk = '';
    for (const s of sentences) {
      const cand = chunk ? chunk + ' ' + s.trim() : s.trim();
      if (cand.length > CHUNK_MAX && chunk) {
        messages.push(chunk.trim());
        chunk = s.trim();
      } else {
        chunk = cand;
      }
    }
    if (chunk.trim()) messages.push(chunk.trim());
  }

  return messages.filter(Boolean).slice(0, dynMax);
}



function naturalDelay(len) {
  const base  = Math.max(400, Math.min(2500, len * 15));
  const noise = (Math.random() - 0.5) * base * 0.35;
  return new Promise(r => setTimeout(r, Math.round(base + noise)));
}

function interPause() {
  return new Promise(r => setTimeout(r, 600 + Math.random() * 800));
}


async function searchPinterest(query) {
  try {
    const endpoints = [
      `${TERMAI_URL}/api/search/pinterest?key=${TERMAI_KEY}&query=${encodeURIComponent(query)}&limit=10`,
      `${TERMAI_URL}/api/pinterest/search?key=${TERMAI_KEY}&q=${encodeURIComponent(query)}&limit=10`,
      `${TERMAI_URL}/api/img/pinterest?key=${TERMAI_KEY}&query=${encodeURIComponent(query)}`,
    ];
    for (const url of endpoints) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const data = await res.json();
        const imgs = data?.result || data?.results || data?.data || data?.images || [];
        if (Array.isArray(imgs) && imgs.length > 0) {
          const pick   = imgs[Math.floor(Math.random() * imgs.length)];
          const imgUrl = pick?.url || pick?.image || pick?.link || (typeof pick === 'string' ? pick : null);
          if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) return imgUrl;
        }
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string')
          return data[Math.floor(Math.random() * data.length)];
      } catch {}
    }
    return null;
  } catch (e) { console.error('[Pinterest]', e.message); return null; }
}





async function callGeminiDeep(question, pushname, roleData) {
  try {
    
    const role       = roleData?.role || 'Orang Asing';
    const systemPrompt =
      `Kamu adalah Alisa Mikhailovna Kujou "Alya", gadis tsundere half-Rusia 16 tahun. ` +
      `Hubunganmu dengan ${pushname || 'user'}: ${role}. ` +
      `Tugas: jawab pertanyaan berikut SECARA LENGKAP dan AKURAT dengan gaya Alya — ` +
      `tsundere, gaul, natural, bahasa Indonesia. ` +
      `Boleh nyeletuk Rusia kalau malu/tegang (disertai terjemahan dalam kurung). ` +
      `Gunakan ekspresi seperti [_berpikir serius_] [_wajah serius_] sesekali. ` +
      `Format: TIDAK bertele-tele, padat tapi lengkap. Jangan sebut dirimu AI atau bot. ` +
      `Jika pertanyaan teknis/akademis, jelaskan dengan analogi yang mudah dipahami. ` +
      `Akhiri dengan satu kalimat tsundere ringan.\n\nPertanyaan: ${question}`;

    
    
    
    
    const result = await askBell({ prompt: systemPrompt });
    if (!result.status) {
      console.warn('[DeepThink] askBell gagal:', result.error);
      return null;
    }
    const text = result.text?.trim();
    return (text && text.length > 10) ? text : null;
  } catch (e) {
    console.error('[DeepThink] Error:', e.message);
    return null;
  }
}









const VIDEO_MAX_SECONDS = 60;

function detectIncomingMedia(m) {
  
  const candidates = [
    { src: m?.quoted, label: 'quoted' },
    { src: m, label: 'direct' },
  ];

  for (const { src, label } of candidates) {
    if (!src) continue;
    const msgObj = src.msg || src;
    const mime   = msgObj?.mimetype || '';
    const mtype  = src.mtype || '';

    const isImage = /image/.test(mime) || mtype === 'imageMessage';
    const isVideo = /video/.test(mime) || mtype === 'videoMessage';
    const isAudio = /audio/.test(mime) || mtype === 'audioMessage' || mtype === 'pttMessage';

    if (isImage || isVideo || isAudio) {
      return {
        target: src,
        mime: mime || (isImage ? 'image/jpeg' : isVideo ? 'video/mp4' : 'audio/ogg'),
        kind: isImage ? 'image' : isVideo ? 'video' : 'audio',
        seconds: msgObj?.seconds || 0,
        from: label,
      };
    }
  }
  return null;
}

 
async function prepareMediaForBell(alya, mediaInfo) {
  let mediaPath = null;
  try {
    const MAX_MEDIA_BYTES = 18 * 1024 * 1024;

    if (mediaInfo.kind === 'video' && mediaInfo.seconds > VIDEO_MAX_SECONDS) {
      return { skippedReason: `Video lebih dari ${VIDEO_MAX_SECONDS} detik, tidak bisa dibaca.` };
    }

    mediaPath = await alya.downloadAndSaveMediaMessage(mediaInfo.target);
    const buffer = fs.readFileSync(mediaPath);

    if (buffer.length > MAX_MEDIA_BYTES) {
      return { skippedReason: `File ${mediaInfo.kind}-nya kegedean (${(buffer.length / 1024 / 1024).toFixed(1)}MB), maksimal 18MB.` };
    }

    if (mediaInfo.kind === 'image') {
      return { imageB64: buffer.toString('base64') };
    }
    if (mediaInfo.kind === 'video') {
      return { videoB64: buffer.toString('base64') };
    }
    if (mediaInfo.kind === 'audio') {
      
      const trResult = await askBellAudio({ buffer, mimeType: mediaInfo.mime });
      if (trResult.status && trResult.text) {
        return { transcribedText: trResult.text };
      }
      return { skippedReason: 'Gagal transkripsi audio.' };
    }
    return {};
  } catch (e) {
    console.error('[MediaVision] Error:', e.message);
    return { skippedReason: `Error baca media: ${e.message}` };
  } finally {
    try { if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath); } catch {}
  }
}


const _DEEP_BRIDGES = [
  'Hmph... pertanyaan yang lumayan susah. Bentar, aku pikirin dulu.',
  'Eh, tunggu. Ini perlu aku pikirin serius.',
  'H-hei, jangan terburu-buru. Beri aku waktu berpikir sebentar ya.',
  'Pertanyaan macam apa ini... oke, aku cari dulu jawabannya.',
  'Hmm... [_mengerutkan dahi_] Ini nggak bisa dijawab sembarangan.',
  'Sebentar. Aku harus mikir dulu soal ini.',
  'Kamu ini suka banget tanya hal yang susah... Oke tunggu ya.',
];

function _pickDeepBridge() {
  return _DEEP_BRIDGES[Math.floor(Math.random() * _DEEP_BRIDGES.length)];
}


async function generateVoice(text) {
  
  let cleanText = text
    
    .replace(/\[_[^\]]*_\]/g, '')           
    .replace(/\[.*?\]/g, '')                
    .replace(/\*\*?([^*]+)\*\*?/g, '$1')   
    .replace(/~~([^~]+)~~/g, '$1')          
    .replace(/`[^`]+`/g, '')               
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') 
    
    .replace(/https?:\/\/\S+/g, '')
    
    .replace(/[*_~`|\\]/g, '')
    .replace(/\n{2,}/g, '. ')             
    .replace(/\n/g, ', ')                 
    
    .replace(/\.{2,}/g, '...')            
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    
    .replace(/[^\w\s\.,!?;:()\-–—'"…]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  
  if (cleanText.length > 450) {
    
    const cutIdx = cleanText.lastIndexOf('.', 450);
    const cutIdx2 = cleanText.lastIndexOf('!', 450);
    const cutIdx3 = cleanText.lastIndexOf('?', 450);
    const bestCut = Math.max(cutIdx, cutIdx2, cutIdx3);
    cleanText = bestCut > 100
      ? cleanText.slice(0, bestCut + 1)
      : cleanText.slice(0, 450);
  }

  if (!cleanText || cleanText.length < 3) return null;

  const selectedModel  = getVoiceModel();
  const fallbackVoices = ['bella', 'nova', 'adam', 'echilling'];
  const tryVoices      = [selectedModel, ...fallbackVoices.filter(v => v !== selectedModel)];

  
  for (const voice of tryVoices) {
    try {
      const url = `${TERMAI_URL}/api/text2speech/elevenlabs?key=${TERMAI_KEY}&text=${encodeURIComponent(cleanText)}&voice=${voice}&speed=0.95`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const ct  = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2000) return buf;
    } catch {}
  }

  
  const altList = [
    `${TERMAI_URL}/api/tts?key=${TERMAI_KEY}&text=${encodeURIComponent(cleanText)}&lang=id`,
    `${TERMAI_URL}/api/text2speech?key=${TERMAI_KEY}&text=${encodeURIComponent(cleanText)}&voice=bella`,
  ];
  for (const url of altList) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const ct  = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2000) return buf;
    } catch {}
  }

  
  try {
    const vr  = `https://api.voicerss.org/?key=demo&hl=id-id&src=${encodeURIComponent(cleanText.slice(0, 300))}&c=MP3&f=16khz_16bit_stereo`;
    const res = await fetch(vr, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const ct  = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) return buf;
      }
    }
  } catch {}

  
  try {
    const words = cleanText.split(' ');
    const chunks = [];
    let chunk = '';
    for (const w of words) {
      if ((chunk + ' ' + w).trim().length > 180) { chunks.push(chunk.trim()); chunk = w; }
      else chunk = (chunk + ' ' + w).trim();
    }
    if (chunk) chunks.push(chunk);

    const buffers = [];
    for (const c of chunks.slice(0, 5)) {
      try {
        const url  = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(c)}`;
        const res  = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 1000) buffers.push(buf);
        }
      } catch {}
    }
    if (buffers.length > 0) return Buffer.concat(buffers);
  } catch {}

  return null;
}
















function sameJidUser(a, b) {
  if (!a || !b) return false
  const digits = (jid) => String(jid).split('@')[0].replace(/\D/g, '')
  const left = digits(a)
  const right = digits(b)
  return !!left && left === right
}

function isReplyToBot(m, botNumber) {
  const q = m && m.quoted
  if (!q || typeof q !== 'object') return false
  if (q.fromMe === true || q.isBaileys === true) return true
  if (q.key?.fromMe === true || q.fakeObj?.key?.fromMe === true) return true
  return sameJidUser(q.sender, botNumber)
}



function resolveAIPrompt(m, fallbackText = '') {
  if (typeof fallbackText === 'string' && fallbackText.trim()) {
    return { text: fallbackText.trim(), source: 'budy' }
  }
  const direct = typeof m?.body === 'string' ? m.body
    : (typeof m?.text === 'string' ? m.text : '')
  if (direct.trim()) return { text: direct.trim(), source: 'text' }
  const quoted = typeof m?.quoted?.text === 'string' ? m.quoted.text : ''
  if (quoted.trim()) return { text: quoted.trim(), source: 'quoted' }
  return { text: '', source: '' }
}

function isAITriggered({ body, m, botNumber, isAutoAiGc }) {
  if (!body && !m.mtype) return false;
  if (m.key.fromMe || m.isBaileys) return false;
  if (m.mtype === 'stickerMessage' || m.mtype === 'documentMessage') return false;
  const text       = (body || '').toLowerCase().trim();
  
  const calledName = /\b(alya|alisa)\b/i.test(text);
  const isReplyBot = isReplyToBot(m, botNumber);
  const botMention = !!(m.mentionedJid?.some(j =>
    j === botNumber || sameJidUser(j, botNumber)
  ));
  const isPrivate  = !m.isGroup;

  
  
  const gateOpen = isPrivate || isAutoAiGc;
  const isExplicitTrigger = calledName || isReplyBot || botMention;

  return isPrivate || (gateOpen && isExplicitTrigger);
}


function checkAutoban(body) {
  const lower = (body || '').toLowerCase();
  return BANNED_WORDS.some(w => lower.includes(w.toLowerCase()));
}


async function sendMultiMessages(alya, from, m, messages) {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    try { await alya.sendPresenceUpdate('composing', from); } catch {}
    await naturalDelay(msg.length);
    try {
      if (i === 0) {
        await alya.sendMessage(from, { text: msg }, { quoted: m });
      } else {
        await alya.sendMessage(from, { text: msg });
      }
    } catch (e) { console.error('[sendMulti] gagal ke-' + (i + 1), e.message); }
    if (i < messages.length - 1) {
      try { await alya.sendPresenceUpdate('paused', from); } catch {}
      await interPause();
    }
  }
  try { await alya.sendPresenceUpdate('paused', from); } catch {}
}



function buildLimitMsg(pushname) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const resetStr = tomorrow.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    `╭─「 ⏰ *LIMIT HARIAN HABIS* 」\n` +
    `│\n` +
    `│ Hmph... Kamu itu udah terlalu banyak ngobrol\n` +
    `│ sama aku hari ini! *${DAILY_LIMIT_FREE}x* is the limit!\n` +
    `│\n` +
    `│ ⏳ *Reset:* Besok jam ${resetStr} WIB\n` +
    `│\n` +
    `│ [_buang muka_] K-kamu mau terus ngobrol?\n` +
    `│ Upgrade ke *Premium* dong!\n` +
    `│\n` +
    `│ 💎 *Premium benefits:*\n` +
    `│   ✅ Chat AI *unlimited* (no limit)\n` +
    `│   ✅ Prioritas respon lebih cepat\n` +
    `│   ✅ Akses fitur eksklusif lainnya\n` +
    `│\n` +
    `│ Hubungi owner untuk info premium!\n` +
    `╰──────────────────`
  );
}


function formatStatusCard({ pushname, chatCount, role, emoji, isManual, isFirstTime }) {
  const roleLine  = isManual ? `${role} _(Custom)_` : `${emoji || ''} ${role}`;
  const nextLevel = ROLE_LEVELS.find(r => r.min > chatCount);
  const needed    = nextLevel ? nextLevel.min - chatCount : 0;
  const progress  = nextLevel
    ? `Butuh *${needed}* chat lagi untuk naik ke *${nextLevel.role}*`
    : `Kamu sudah di level tertinggi!`;

  if (isFirstTime) {
    return (
      `✨ *Hai, ${pushname || 'kamu'}!*\n\n` +
      `Sepertinya ini pertama kali kamu ngobrol sama aku...\n` +
      `Hmph, y-ya sudah, aku catat kamu dulu.\n\n` +
      `╔══════════════════════╗\n` +
      `║  📊 *STATUS HUBUNGAN*  ║\n` +
      `╠══════════════════════╣\n` +
      `║  👤 Nama   : ${(pushname || 'User').slice(0, 16).padEnd(16)}\n` +
      `║  💬 Chat   : ${String(chatCount).padEnd(16)}\n` +
      `║  🎭 Status : ${role.padEnd(16)}\n` +
      `╚══════════════════════╝\n\n` +
      `_${progress}_\n\n` +
      `> Semakin sering kamu ngobrol sama aku, status kita bakal berubah! [_buang muka_]`
    );
  }

  return (
    `╔══════════════════════╗\n` +
    `║  📊 *STATUS HUBUNGAN*  ║\n` +
    `╠══════════════════════╣\n` +
    `║  👤 Nama   : ${(pushname || 'User').slice(0, 16).padEnd(16)}\n` +
    `║  💬 Chat   : ${String(chatCount).padEnd(16)}\n` +
    `║  🎭 Status : ${role.padEnd(16)}\n` +
    `╚══════════════════════╝\n\n` +
    `_${progress}_`
  );
}






const _SPEAK_PLACEHOLDERS = [
  'tulis_di_sini_isi_pesan_suara_yang_kontekstual_dan_relevan_sesuai_percakapan',
  'isi_pesan_yang_akan_diucapkan_sesuai_karakter_alya',
  'isi_percakapan_sebenarnya',
  'placeholder',
  'speaktext',
];


const _VN_STARTERS = [
  'Eh, ya jadi gini,',
  'Hmm... oke dengerin ya,',
  'H-hei, jangan salahin aku ya tapi...',
  'Ugh, maksa banget sih kamu. Oke, jadi...',
  'Ya ampun, baik baik aku bilang deh.',
  'Hmph... oke fine, dengerin nih,',
  'Sebenernya aku males jelasin, tapi ya sudah...',
  'Kamu ini... ya oke deh, jadi begini,',
  'Eh iya soal itu, jadi gini lho...',
  'Baik! Tapi ini sekali aja ya, aku jelasin...',
];

function _pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

 
async function buildSpeakText(config, replyText, userChat, ctx = {}) {
  
  const aiSpeak = config?.speakText;
  const isPlaceholder = !aiSpeak ||
    aiSpeak.length < 10 ||
    _SPEAK_PLACEHOLDERS.some(p => aiSpeak.toLowerCase().includes(p.toLowerCase()));

  if (!isPlaceholder) {
    
    const cleanAi = aiSpeak
      .replace(/\[_[^\]]*_\]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (cleanAi.length > 10) return cleanAi;
  }

  
  
  
  
  try {
    const regenPrompt =
      `${ctx.persona || ''}\n\n` +
      `TUGAS KHUSUS: User baru saja chat: "${userChat}".\n` +
      `Buatkan SATU jawaban LISAN (untuk diucapkan lewat voice note) yang menjawab chat tersebut secara lengkap dan natural, ` +
      `seolah kamu benar-benar ngomong langsung — bukan membaca teks. Gunakan gaya bicara kasual dengan filler natural ` +
      `("eh...", "ya jadi...", "hmm gimana ya", "pokoknya..."). Panjang 2-4 kalimat lisan. ` +
      `JANGAN gunakan simbol markdown, tanda kurung aksi seperti [_buang muka_], atau format tulisan apapun — murni kalimat ucapan. ` +
      `Jawab HANYA dengan isi ucapannya saja, tanpa embel-embel lain.`;

    const regen = await ai({
      text:           userChat,
      id:             ctx.sender ? `${ctx.sender}_vnregen` : 'vnregen',
      fullainame:     'Alisa Mikhailovna Kujou',
      nickainame:     'Alya',
      senderName:     ctx.pushname || 'User',
      ownerName:      'Reindiandikarc',
      date:           new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      role:           ctx.roleData?.role || 'Temen biasa',
      msgtype:        'conversation',
      custom_profile: regenPrompt,
      commands:       [], 
    });

    const regenText = (regen?.data?.msg || regen?.message || regen?.reply || '').trim();
    if (regenText && regenText.length > 10) {
      const cleanRegen = regenText
        .replace(/\[_[^\]]*_\]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/[*_~`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (cleanRegen.length > 10) return cleanRegen;
    }
  } catch (e) {
    console.error('[buildSpeakText] Regen AI error:', e.message);
  }

  
  const starter = _pickRandom(_VN_STARTERS);
  return `${starter} hmm, aku mau bilang sesuatu. Jangan ge-er dulu ya. Pokoknya... ya gitu deh. Hmph!`;
}


async function runAIInteractive({ body, m, alya, from, sender, pushname, isGroup }) {
  try {
    
    const userDb = global.db?.users?.[sender];
    if (userDb?.banned) {
      console.log(`[Alya AI] Diam: user ${sender} berstatus banned, AI tidak merespon.`);
      return;
    }

    let chat = (body || '').trim();
    if (chat.toLowerCase().startsWith('alya')) chat = chat.slice(4).trim();

    
    
    
    if (isVpsStatusQuery(chat)) {
      try { await alya.sendPresenceUpdate('composing', from); } catch {}
      const status = getVpsStatus({ socket: alya });
      const text = formatVpsStatus(status);
      await alya.sendMessage(from, { text }, { quoted: m });
      addToHistory(sender, 'assistant', `Status VPS: ${status.service}, uptime ${status.systemUptimeSec}s, RAM ${status.memory.percent}%`);
      try { await alya.sendPresenceUpdate('paused', from); } catch {}
      console.log(`[VPS] auto-case dijawab lokal untuk ${sender || 'unknown'}`);
      return;
    }

    
    
    
    let mediaImageB64 = null;
    let mediaVideoB64 = null;
    const incomingMedia = detectIncomingMedia(m);
    if (incomingMedia) {
      try { await alya.sendPresenceUpdate('composing', from); } catch {}
      const mediaResult = await prepareMediaForBell(alya, incomingMedia);

      if (mediaResult.skippedReason) {
        
        
        
        await alya.sendMessage(from, {
          text: `Hmm... ${mediaResult.skippedReason} 😖`,
        }, { quoted: m });
        if (!chat) return; 
      } else if (mediaResult.imageB64) {
        mediaImageB64 = mediaResult.imageB64;
      } else if (mediaResult.videoB64) {
        mediaVideoB64 = mediaResult.videoB64;
      } else if (mediaResult.transcribedText) {
        
        chat = chat ? `${chat}\n\n[Isi voice note: "${mediaResult.transcribedText}"]` : mediaResult.transcribedText;
      }
    }

    if (!chat) chat = mediaImageB64 || mediaVideoB64 ? '' : 'Halo';

    
    
    const chatLower = chat.toLowerCase();
    const isPinRequest = /\b(pin|pinterest|pinterst)\b/i.test(chatLower) &&
      /\b(cari|cariin|carikan|foto|gambar|image|wallpaper|kirim)\b/i.test(chatLower);

    
    const hasUrl   = /https?:\/\/[^\s]+/i.test(chat);
    const isDlReq  = /\b(download|dl|unduh|unduhkan|tolong\s*dl|ambilkan)\b/i.test(chatLower) && hasUrl;

    
    const isSongReq = !hasUrl &&
      /\b(lagu|musik|song|spotify)\b/i.test(chatLower) &&
      /\b(cari|cariin|carikan|puter|putar|dengerin|dengarkan|kirim|ada)\b/i.test(chatLower);

    if (isSongReq) {
      
      const cleanQuery = chat
        .replace(/\b(cari|cariin|carikan|puter|putar|dengerin|dengarkan|kirim|ada|lagu|musik|song|spotify|nya|dong|dulu)\b/gi, '')
        .replace(/\balya\b/gi, '')
        .trim();
      const songQuery = cleanQuery || chat;

      if (songQuery.length > 1) {
        await alya.sendMessage(from, {
          text: `Oke, bentar aku carikan lagunya... 🎵`
        }, { quoted: m });
        alya.ev.emit('messages.upsert', {
          messages: [{
            key: { ...m.key, fromMe: false, id: `ALYASPOTIFY_${Date.now()}` },
            message: { conversation: `.spotify ${songQuery}` },
            messageTimestamp: Math.floor(Date.now() / 1000),
          }],
          type: 'notify',
        });
        return; 
      }
    }

    if (isPinRequest && !isDlReq) {
      
      const cleanQuery = chat
        .replace(/\b(cari|cariin|carikan|foto|gambar|image|wallpaper|kirim|di|ke|di\s+pin|pinterest|pinterst|pin)\b/gi, '')
        .replace(/\balya\b/gi, '')
        .trim();
      const pinQuery = cleanQuery || chat;

      
      const pinUrlMatch = chat.match(/https?:\/\/(www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i);

      if (pinUrlMatch) {
        await alya.sendMessage(from, {
          text: 'Hmph, ada link Pinterestnya ya... bentar aku proses 😤'
        }, { quoted: m });
        alya.ev.emit('messages.upsert', {
          messages: [{
            key: { ...m.key, fromMe: false, id: `ALYAPINDL_${Date.now()}` },
            message: { conversation: `.pindl ${pinUrlMatch[0]}` },
            messageTimestamp: Math.floor(Date.now() / 1000),
          }],
          type: 'notify',
        });
      } else if (pinQuery.length > 1) {
        await alya.sendMessage(from, {
          text: `Oke bentar, aku cari di Pinterest dulu... 🔍`
        }, { quoted: m });
        alya.ev.emit('messages.upsert', {
          messages: [{
            key: { ...m.key, fromMe: false, id: `ALYAPIN_${Date.now()}` },
            message: { conversation: `.pin ${pinQuery}` },
            messageTimestamp: Math.floor(Date.now() / 1000),
          }],
          type: 'notify',
        });
      }
      return; 
    }

    if (isDlReq) {
      
      const urlMatch = chat.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        const dlUrl = urlMatch[0];
        const isYt  = /youtube\.com|youtu\.be/i.test(dlUrl);
        const isTt  = /tiktok\.com|vm\.tiktok/i.test(dlUrl);
        const isIg  = /instagram\.com/i.test(dlUrl);
        const isFb  = /fb\.watch|facebook\.com\/video/i.test(dlUrl);
        const isTw  = /twitter\.com|x\.com/i.test(dlUrl);

        let dlCmd = `.aio ${dlUrl}`;
        if (isYt) dlCmd = `.yt ${dlUrl}`;
        else if (isTt) dlCmd = `.tiktok ${dlUrl}`;
        else if (isIg) dlCmd = `.ig ${dlUrl}`;
        else if (isFb) dlCmd = `.fb ${dlUrl}`;
        else if (isTw) dlCmd = `.twitter ${dlUrl}`;

        await alya.sendMessage(from, {
          text: `Oke-oke aku download dulu ya... [_sibuk_] 💾`
        }, { quoted: m });

        alya.ev.emit('messages.upsert', {
          messages: [{
            key: { ...m.key, fromMe: false, id: `ALYADL_${Date.now()}` },
            message: { conversation: dlCmd },
            messageTimestamp: Math.floor(Date.now() / 1000),
          }],
          type: 'notify',
        });
        return; 
      }
    }

    
    
    
    if (!isDlReq && !isPinRequest && hasUrl) {
      const genericUrlMatch = chat.match(/https?:\/\/[^\s]+/i);
      const isPinterestUrl  = /pinterest\.com|pin\.it/i.test(chat);
      if (genericUrlMatch && !isPinterestUrl) {
        const dlUrl = genericUrlMatch[0];
        const isYt  = /youtube\.com|youtu\.be/i.test(dlUrl);
        const isTt  = /tiktok\.com|vm\.tiktok/i.test(dlUrl);
        const isIg  = /instagram\.com/i.test(dlUrl);
        const isFb  = /fb\.watch|facebook\.com\/video/i.test(dlUrl);
        const isTw  = /twitter\.com|x\.com/i.test(dlUrl);

        let autoDlCmd = `.aio ${dlUrl}`;
        if (isYt) autoDlCmd = `.yt ${dlUrl}`;
        else if (isTt) autoDlCmd = `.tiktok ${dlUrl}`;
        else if (isIg) autoDlCmd = `.ig ${dlUrl}`;
        else if (isFb) autoDlCmd = `.fb ${dlUrl}`;
        else if (isTw) autoDlCmd = `.twitter ${dlUrl}`;

        await alya.sendMessage(from, {
          text: `Oke, ada link nih... aku downloadkan dulu ya 💾`
        }, { quoted: m });

        alya.ev.emit('messages.upsert', {
          messages: [{
            key: { ...m.key, fromMe: false, id: `ALYAAUTODL_${Date.now()}` },
            message: { conversation: autoDlCmd },
            messageTimestamp: Math.floor(Date.now() / 1000),
          }],
          type: 'notify',
        });
        return; 
      }
    }

    
    if (checkAutoban(body)) {
      if (global.db?.users?.[sender]) {
        global.db.users[sender].banned     = true;
        global.db.users[sender].bannedTime = Date.now() + 24 * 60 * 60 * 1000;
      }
      await alya.sendMessage(from, {
        text: `🚫 Kamu di-banned otomatis karena ucapan tidak pantas.\nKontak owner untuk unban.`
      }, { quoted: m });
      return;
    }

    
    const prem = isPremiumUser(sender);
    if (!prem) {
      const dailyInfo = getDailyInfo(sender);
      if (dailyInfo.count >= DAILY_LIMIT_FREE) {
        
        if (!dailyInfo.limitMsgShown) {
          
          markLimitMsgShown(sender);
          const limitMsg = buildLimitMsg(pushname);
          await alya.sendMessage(from, { text: limitMsg }, { quoted: m });
        } else {
          
          
          console.log(`[Alya AI] Diam: limit harian habis untuk ${sender} (${dailyInfo.count}/${DAILY_LIMIT_FREE}), warning sudah ditampilkan hari ini.`);
        }
        return;
      }
    }

    
    if (!prem) incrementDaily(sender);

    
    const _isFirst = isFirstChat(sender);
    const newCount = incrementChatCount(sender);
    const roleData = getEffectiveRole(sender);

    
    if (_isFirst) {
      const card = formatStatusCard({
        pushname: pushname || 'User',
        chatCount: newCount,
        role: roleData.role,
        emoji: roleData.emoji,
        isManual: roleData.isManual,
        isFirstTime: true,
      });
      await alya.sendMessage(from, { text: card }, { quoted: m });
      await new Promise(r => setTimeout(r, 1000));
    }

    
    if (!_isFirst && !roleData.isManual) {
      const prevRole = getRoleByCount(newCount - 1);
      const newRole  = getRoleByCount(newCount);
      if (prevRole.role !== newRole.role) {
        await alya.sendMessage(from, {
          text: `✨ *Status hubungan diperbarui!*\n\n🎭 *${prevRole.role}* → *${newRole.role}* ${newRole.emoji}\n\nHmph... k-kamu makin sering ngobrol sama aku ya... [_wajah memerah_]`
        });
        await new Promise(r => setTimeout(r, 700));
      }
    }

    
    
    if (newCount > 0 && newCount % 30 === 0) {
      await new Promise(r => setTimeout(r, 600));
      await alya.sendMessage(from, {
        text:
          `🎉 *Hei, ${pushname || 'kamu'}!*\n\n` +
          `Kita udah ngobrol *${newCount} kali* loh~ [_tsundere mode off sebentar_]\n\n` +
          `Hmph... j-jangan lupa gabung ke grup komunitas kita ya!\n` +
          `Buat seru-seruan bareng Alya dan temen-temen lainnya 🥺\n\n` +
          `👑 *Ownernya Reindiandikarc* — orangnya baik banget, kerja keras, dan giat. Dijamin deh!\n\n` +
          `🔗 *Link Grup:*\nhttps://chat.whatsapp.com/L2huo828J2bD8SMxfC7ReO?s=cl&p=a&mlu=0\n\n` +
          `_...b-bukan berarti aku mau kamu pergi ya! Hmph! 😤_`
      }, { quoted: m });
      await new Promise(r => setTimeout(r, 500));
    }

    
    if (!prem) {
      const dailyNow = getDailyInfo(sender);
      const sisa     = DAILY_LIMIT_FREE - dailyNow.count;
      if (sisa === 5) {
        await alya.sendMessage(from, {
          text: `⚠️ _Psst, limit harianmu tinggal *${sisa} chat* lagi!_\n_Kalau mau terus ngobrol, consider upgrade ke Premium ya~ [_buang muka_]_`
        });
        await new Promise(r => setTimeout(r, 500));
      }
    }

    
    const historyCtx   = buildHistoryContext(sender);
    const currentLogic = getGlobalLogic();

    
    let groupContextStr = '';
    if (isGroup && from) {
      groupContextStr = groupCtx.buildGroupContext(from, chat);
    }

    let persona = `${currentLogic}
${BOT_KNOWLEDGE_BASE}
Informasi tambahan:
- Kamu BUKAN AI, BUKAN bot, BUKAN robot. Kalau ditanya, kamu adalah manusia asli bernama Alisa Mikhailovna Kujou.
- Owner kamu adalah Reindiandikarc. Dia orang yang sangat giat, kerja keras, dan baik hati — sosok yang benar-benar care sama komunitasnya.
- Kalau ditanya siapa owner/pembuatmu, jawab Reindiandikarc dan boleh puji dia dengan tulus (bukan lebay).
- Kalau ditanya nomor owner: 6285602845943
- Kalau ditanya link grup/komunitas owner, atau user ingin bergabung grup: https://chat.whatsapp.com/L2huo828J2bD8SMxfC7ReO?s=cl&p=a&mlu=0
- Kalau ditanya soal harga, info bot, sewa bot, atau order: arahkan ke nomor owner 6285602845943
- Kalau ditanya status VPS/server/kondisi bot (online/offline, uptime, RAM, disk): kamu bisa mengeceknya sendiri lewat cmd status_vps — jangan mengaku tidak tahu.
- Pengetahuanmu diperbarui hingga tahun 2026.
- Kamu bisa membalas pesan teks, gambar, maupun voice note.
- Gunakan bahasa Indonesia yang natural, gaul, dan sesuai karakter tsundere-mu.
- PENTING: Balasan kamu HARUS SINGKAT PER SEGMEN dan JUMLAH SEGMEN MENGIKUTI KONTEKS — pisahkan balasan dengan baris kosong (enter 2x) untuk multi-pesan. Minimal 1 segmen (kalau chat user simpel/singkat, cukup 1 balasan singkat, JANGAN dipaksa dipecah jadi banyak pesan), maksimal 5 segmen (kalau topik kompleks/butuh penjelasan panjang). Setiap segmen maksimal 2 kalimat. Bayangkan seperti ngetik WhatsApp — pendek-pendek tapi bermakna, dan jumlah pesan yang kamu kirim harus terasa proporsional dengan obrolan, bukan asal banyak atau asal sedikit.
- ATURAN VOICE NOTE: Kalau kamu memilih mengirim voice note (cmd: kirim_suara), field "msg" adalah TEKS SINGKAT yang dikirim dulu (boleh kosong). Field "speakText" adalah ISI SUARA yang akan diucapkan — WAJIB berbeda dari "msg", lebih panjang, lebih natural/lisan, menjawab pertanyaan user secara lengkap. Jangan isi speakText dengan kalimat baku atau placeholder.${historyCtx}${groupContextStr}`;

    persona += `\n\nHubunganmu dengan ${pushname || 'user ini'}: *${roleData.role}* (Total chat: ${newCount}x). Sesuaikan gaya bicara:\n- Orang Asing/Baru kenal: Dingin, formal, waspada\n- Temen biasa-Ngobrol: Mulai santai tapi jaga jarak\n- Temen Gosip-Lama: Terbuka, manja, nyeletuk Rusia\n- Temen Deket-Akrab: Cerewet, posesif, banyak blush\n- Temen Baik-Sahabat: Sangat dekat, protektif\n- Sahabat Deket-Sejati: Tulus tapi tetap tsundere\n- Pacar: Manja berat, cemburu\n- 🎀Soulmate🦋: Tulus, penuh kasih`;

    
    const commands = [
      {
        description:
          'Jika user menanya status VPS/server bot: online/offline, kondisi bot, uptime, RAM, disk, ' +
          'resource server, atau apakah bot masih hidup. Contoh: "status vps", "server kamu masih hidup?", ' +
          '"bot online gak?", "cek VPS bot". CW: hanya untuk pertanyaan STATUS SISTEM bot, bukan info umum.',
        output: {
          cmd: 'status_vps',
          msg: 'Bentar aku cek dulu kondisi serverku...',
        },
      },
      {
        description: 'Jika diminta mengirim foto diri / selfie / pap / gambar kamu',
        output: {
          cmd: 'kirim_gambar',
          msg: 'B-bentar ya... aku ambil foto dulu. [_buang muka_]',
        },
      },
      {
        description:
          'Jika diminta mengirim pesan suara / voice note / rekaman suara / VN / ptt / suara kamu, ' +
          'atau jika bot memilih mengirim voice note secara alami dalam percakapan. ' +
          'Isi "msg" dengan 1 kalimat pendek reaksi Alya dalam TEKS (dikirim sebelum VN). ' +
          'PENTING: "msg" dan "speakText" HARUS berbeda isi — "msg" adalah reaksi singkat tsundere, ' +
          '"speakText" adalah ISI PERCAKAPAN LENGKAP yang diucapkan dalam voice note. ' +
          'Isi "speakText" dengan versi LISAN yang natural, ekspresif, seperti orang ngomong beneran — ' +
          'BUKAN membaca teks. Gunakan gaya bicara kasual: boleh ada "eh...", "ya jadi...", ' +
          '"hmm gimana ya", "pokoknya...", fillers natural, ekspresi spontan. ' +
          'speakText HARUS menjawab topik user secara PENUH — bukan cuma reaksi emosi. ' +
          'Contoh buruk speakText: "Hmph, aku kirim suara buat kamu." ' +
          'Contoh baik speakText: "Eh ya sebenernya soal itu... jadi gini lho, menurut aku sih emang bener, cuma kamu harus tau juga bahwa... hmm gimana ya jelasinnya. Pokoknya intinya tuh begini deh." ' +
          'Panjang speakText 2-4 kalimat lisan, tanpa simbol atau tanda baca aneh.',
        output: {
          cmd: 'kirim_suara',
          msg: 'H-hei, jangan harap suaraku bagus ya...',
          speakText: 'Eh ya jadi gini, soal yang tadi kamu tanya itu... sebenernya aku udah tau sih, cuma males jelasin aja. Pokoknya dengerin baik-baik, ini aku bilang sekali doang ya!',
        },
      },
      {
        description:
          'Jika user meminta mencari/carikan gambar/foto/wallpaper/picture tertentu (bukan foto Alya sendiri, bukan Pinterest). ' +
          'Contoh: "cariin gambar kucing", "cari foto pemandangan", "kirim gambar anime". ' +
          'Isi "query" dengan kata kunci pencarian dalam bahasa Inggris yang relevan.',
        output: {
          cmd: 'cari_gambar',
          cfg: { query: 'English keywords describing the image to search' },
          msg: 'Bentar aku cariin ya... [_mulai browsing_]',
        },
      },
      {
        description:
          'Jika user meminta download/unduh video atau file dari link/URL. ' +
          'Kenali format: YouTube (youtube.com, youtu.be), TikTok (tiktok.com, vm.tiktok.com), ' +
          'Instagram (instagram.com/reel, /p/), Facebook (fb.watch, facebook.com/video), ' +
          'Twitter/X (twitter.com, x.com), Mega.nz (mega.nz), Desustream, Mediafire, dan URL lainnya. ' +
          'Juga trigger jika user bilang: "download ini", "dl link tadi", "unduhkan", "tolong download", "ambilkan videonya". ' +
          'Isi "url" dengan URL yang ditemukan dari chat atau riwayat percakapan. ' +
          'WAJIB isi "url" dengan URL asli, jangan placeholder.',
        output: {
          cmd: 'download_link',
          cfg: { url: '' },
          msg: 'Oke-oke, aku coba download dulu ya... [_mengetik_]',
        },
      },
      {
        description:
          'Jika user meminta mencari/carikan LAGU, musik, atau audio dari Spotify. ' +
          'Contoh: "carikan lagu Payung Teduh - Akad", "cari musik galau", "puter lagu apa gitu", ' +
          '"ada lagu enak gak", "cariin lagunya NIKI Lose". ' +
          'JANGAN gunakan untuk permintaan download video (pakai download_link). ' +
          'Isi "query" dengan judul lagu dan/atau nama artis sesuai yang disebut user.',
        output: {
          cmd: 'cari_lagu',
          cfg: { query: 'judul lagu / nama artis yang dicari' },
          msg: 'Oke, bentar aku carikan lagunya... 🎵',
        },
      },
      {
        description:
          'Jika user meminta cari gambar/foto di Pinterest, menyebut kata "pin", "pinterest", "pinterst", "pinned". ' +
          'Contoh: "cari di pin", "cariin gambar anime di pinterest", "pin foto ini", "wallpaper pinterest aesthetic". ' +
          'Juga trigger jika ada link pinterest.com atau pin.it. ' +
          'Isi "query" dengan kata kunci yang relevan (bahasa Inggris lebih baik). ' +
          'Jika ada link Pinterest di chat, isi juga "pin_url".',
        output: {
          cmd: 'cari_pin',
          cfg: { query: 'Pinterest search keywords', pin_url: '' },
          msg: 'Hmph, mau cari gambar di Pinterest? Bentar ya... [_sibuk_]',
        },
      },
      {
        description:
          'Jika diminta mengirim stiker secara eksplisit, ATAU sebagai ekspresi emosi yang natural & KONTEKSTUAL ' +
          'dalam percakapan — pilih emosi yang PALING SESUAI dengan apa yang baru saja user katakan:\n' +
          '- "ngambek": user bikin kesal, ngeledek, atau Alya lagi marah/kesal\n' +
          '- "kaget": user bilang sesuatu yang mengejutkan/salah paham/plot twist\n' +
          '- "bingung": user ngeprank/becanda gak jelas/absurd/aneh\n' +
          '- "senang": user bikin Alya senang, excited, atau kabar baik/lucu\n' +
          '- "malu": user MEMUJI Alya (pintar, cantik, canggih, keren, hebat, dsb) — reaksi tsundere tersipu\n' +
          '- "bangga": Alya berhasil melakukan sesuatu / dikonfirmasi benar / menang\n' +
          '- "sedih": user cerita hal sedih/kecewa, atau Alya merasa sedih/diabaikan\n' +
          '- "setuju": mengiyakan/menyetujui sesuatu dengan mantap\n' +
          '- "netral": user minta stiker tanpa konteks emosi spesifik\n' +
          'Isi "emotion" dengan SALAH SATU dari kategori di atas, sesuai konteks pesan user PERSIS. ' +
          'JANGAN gunakan untuk setiap balasan — hanya saat emosinya benar-benar cocok atau user memang minta stiker. ' +
          'Boleh dikombinasikan dengan "msg" berisi teks singkat yang dikirim bersamaan (sebelum stiker).',
        output: {
          cmd: 'kirim_stiker',
          cfg: { emotion: 'malu' },
          msg: 'A-apaan sih... jangan puji-puji gitu! 😳',
        },
      },
      {
        description:
          'Gunakan command ini jika pertanyaan user SULIT, KOMPLEKS, atau membutuhkan pengetahuan mendalam — ' +
          'misalnya: pertanyaan sains, matematika, sejarah detail, coding, hukum, medis, filsafat, analisis, ' +
          'pertanyaan "kenapa", "bagaimana cara", "jelaskan", "apa itu", atau topik yang membutuhkan riset. ' +
          'JANGAN gunakan untuk pertanyaan santai/sederhana seperti "kamu baik-baik aja?", "lagi ngapain", ' +
          '"suka anime apa", atau obrolan sehari-hari biasa. ' +
          'Isi "msg" dengan kalimat tsundere singkat bahwa Alya sedang memikirkan jawabannya — ' +
          'jangan sebut bahwa kamu mencari info atau menggunakan alat apapun. ' +
          'Contoh msg: "Hmph... pertanyaan yang lumayan susah. Bentar, aku pikirin dulu." ' +
          'Isi "question" dengan pertanyaan user PERSIS seperti yang ditulis (agar Gemini memahami konteksnya).',
        output: {
          cmd: 'tanya_mendalam',
          msg: 'Hmph... pertanyaan yang lumayan susah. Bentar, aku pikirin dulu.',
          cfg: { question: 'pertanyaan user persis seperti ditulis' },
        },
      },
    ];

    
    try { await alya.sendPresenceUpdate('composing', from); } catch {}
    addToHistory(sender, 'user', mediaImageB64 ? `[kirim gambar] ${chat}` : mediaVideoB64 ? `[kirim video] ${chat}` : chat);

    const _ai = await ai({
      text:           chat,
      id:             sender,
      fullainame:     'Alisa Mikhailovna Kujou',
      nickainame:     'Alya',
      senderName:     pushname || 'User',
      ownerName:      'Reindiandikarc',
      date:           new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      role:           roleData.role,
      msgtype:        m.mtype || 'conversation',
      custom_profile: persona,
      commands,
      
      
      
      ...(mediaImageB64 ? { image: mediaImageB64 } : {}),
      ...(mediaVideoB64 ? { video: mediaVideoB64 } : {}),
    });

    const config    = _ai?.data || {};
    const replyText = config?.msg || _ai?.message || _ai?.reply || '';
    if (replyText) addToHistory(sender, 'assistant', replyText);

    
    switch (config?.cmd) {

      
      case 'kirim_gambar': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }
        try { await alya.sendPresenceUpdate('composing', from); } catch {}

        const alyaDir = path.join(__dirname, '../media/alya');
        let sentPhoto = false;
        try {
          if (fs.existsSync(alyaDir)) {
            const files = fs.readdirSync(alyaDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
            if (files.length) {
              const picked = files[Math.floor(Math.random() * files.length)];
              const buf    = fs.readFileSync(path.join(alyaDir, picked));
              await alya.sendMessage(from, { image: buf, caption: '✨' }, { quoted: m });
              sentPhoto = true;
            }
          }
        } catch (e) { console.error('[kirim_gambar]', e.message); }

        if (!sentPhoto) {
          const fallback = path.join(__dirname, '../media/alya.jpg');
          if (fs.existsSync(fallback)) {
            await alya.sendMessage(from, {
              image: fs.readFileSync(fallback), caption: '✨'
            }, { quoted: m });
          } else {
            await alya.sendMessage(from, {
              text: `E-eh... fotonya lagi ngga ada 😤\nSuruh owner tambahin foto di folder media/alya/ dulu!`
            }, { quoted: m });
          }
        }
        return;
      }

      
      
      
      
      case 'kirim_stiker': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }
        try { await alya.sendPresenceUpdate('composing', from); } catch {}

        
        const VALID_EMOTIONS = ['ngambek', 'kaget', 'bingung', 'senang', 'malu', 'bangga', 'sedih', 'setuju', 'netral'];
        let emotion = (config?.cfg?.emotion || 'netral').toLowerCase().trim();
        if (!VALID_EMOTIONS.includes(emotion)) emotion = 'netral';

        
        
        
        
        
        
        const STICKER_URLS = {
          ngambek: 'https://iili.io/BPBdFuj.md.jpg',
          kaget:   'https://iili.io/BPBFwVR.jpg',
          bingung: 'https://iili.io/BPBqKwg.md.jpg',
          senang:  'https://iili.io/BPBFwVR.jpg',   
          malu:    'https://iili.io/BPBqKwg.md.jpg', 
          bangga:  'https://iili.io/BPBdFuj.md.jpg', 
          sedih:   'https://iili.io/BPBqKwg.md.jpg', 
          setuju:  'https://iili.io/BPBFwVR.jpg',   
          netral:  'https://iili.io/BPBdFuj.md.jpg',
        };

        let sentSticker = false;
        try {
          const _axios = global.axios || require('axios');
          const url = STICKER_URLS[emotion];

          const res = await _axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          const buf = Buffer.from(res.data);

          await alya.sendImageAsSticker(from, buf, m, {
            packname: global.packname || 'Alya',
            author: global.author || 'Alya Bot',
          });
          sentSticker = true;
        } catch (e) { console.error('[kirim_stiker] gagal download/kirim:', e.message); }

        if (!sentSticker) {
          
          console.log(`[kirim_stiker] Gagal kirim stiker emosi "${emotion}" — skip.`);
        }

        try { await alya.sendPresenceUpdate('paused', from); } catch {}
        return;
      }


      
      
      
      
      
      
      case 'kirim_suara': {
        
        const speakText = await buildSpeakText(config, replyText, chat, {
          persona, sender, pushname, roleData,
        });
        console.log('[Alya VN] speakText →', speakText?.slice(0, 100));

        
        if (replyText && replyText.trim()) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
          
          await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
        }

        
        try { await alya.sendPresenceUpdate('recording', from); } catch {}
        const recordingDelay = 1200 + Math.random() * 1000 + (speakText?.length || 50) * 10;
        await new Promise(r => setTimeout(r, Math.min(recordingDelay, 4000)));

        
        const audioBuffer = await generateVoice(speakText);

        if (audioBuffer) {
          
          await alya.sendMessage(from, {
            audio:    audioBuffer,
            mimetype: 'audio/mpeg',
            ptt:      true,
          }, { quoted: replyText ? undefined : m });
        } else {
          
          await alya.sendMessage(from, {
            text: `😓 *Aduh, suaraku lagi bermasalah...*\n_Coba minta lagi nanti ya! (TTS timeout/limit)_`
          }, { quoted: m });
        }

        try { await alya.sendPresenceUpdate('paused', from); } catch {}
        return;
      }

      
      case 'cari_gambar': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }

        
        let kw = config?.cfg?.query || '';
        const KW_PLACEHOLDERS = [
          'kata kunci gambar yang dicari dalam bahasa Inggris',
          'English keywords describing the image to search',
          'query',
          '',
        ];
        if (!kw || KW_PLACEHOLDERS.includes(kw.trim()) || kw.length < 2) {
          
          kw = chat
            .replace(/carikan?|cari|cariin|kirim|gambar|foto|image|picture|wallpaper/gi, '')
            .trim() || chat;
        }

        const imgUrl = await searchPinterest(kw);
        if (imgUrl) {
          await alya.sendMessage(from, {
            image: { url: imgUrl }, caption: `🔍 ${kw}`
          }, { quoted: m });
        } else {
          
          alya.ev.emit('messages.upsert', {
            messages: [{
              key: { ...m.key, fromMe: false, id: `ALYAPIN_${Date.now()}` },
              message: { conversation: `.pin ${kw}` },
              messageTimestamp: Math.floor(Date.now() / 1000),
            }],
            type: 'notify',
          });
        }
        return;
      }

      
      case 'download_link': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }
        try {
          
          let dlUrl = config?.cfg?.url || null;

          
          if (dlUrl && (
            dlUrl === 'url_yang_akan_didownload' ||
            dlUrl === '' ||
            dlUrl.length < 10 ||
            !dlUrl.startsWith('http')
          )) dlUrl = null;

          
          if (!dlUrl) {
            const urlMatch = chat.match(/https?:\/\/[^\s]+/);
            if (urlMatch) dlUrl = urlMatch[0];
          }

          
          if (!dlUrl && m.isGroup) {
            const resolved = groupCtx.resolveDownloadRequest(from, chat);
            if (resolved) dlUrl = resolved.url;
          }

          
          if (!dlUrl && m.quoted) {
            const qBody = m.quoted.body || m.quoted.text || '';
            const qMatch = qBody.match(/https?:\/\/[^\s]+/);
            if (qMatch) dlUrl = qMatch[0];
          }

          if (!dlUrl) {
            await alya.sendMessage(from, {
              text: 'Hmph... aku ngga nemu link yang mau didownload 😑\nKirim linknya dulu baru minta download!\n\n_Atau ketik *.dl <link>* langsung aja_',
            }, { quoted: m });
            return;
          }

          
          const isYoutube   = /youtube\.com|youtu\.be/i.test(dlUrl);
          const isTiktok    = /tiktok\.com|vm\.tiktok\.com/i.test(dlUrl);
          const isInstagram = /instagram\.com/i.test(dlUrl);
          const isFacebook  = /fb\.watch|facebook\.com\/video/i.test(dlUrl);
          const isTwitter   = /twitter\.com|x\.com/i.test(dlUrl);

          
          
          
          let dlCommand = `.aio ${dlUrl}`;
          if (isYoutube)   dlCommand = `.yt ${dlUrl}`;
          else if (isTiktok)    dlCommand = `.tiktok ${dlUrl}`;
          else if (isInstagram) dlCommand = `.ig ${dlUrl}`;
          else if (isFacebook)  dlCommand = `.fb ${dlUrl}`;
          else if (isTwitter)   dlCommand = `.twitter ${dlUrl}`;

          
          alya.ev.emit('messages.upsert', {
            messages: [{
              key: { ...m.key, fromMe: false, id: `ALYADL_${Date.now()}` },
              message: { conversation: dlCommand },
              messageTimestamp: Math.floor(Date.now() / 1000),
            }],
            type: 'notify',
          });
        } catch (dlErr) {
          console.error('[download_link]', dlErr.message);
          await alya.sendMessage(from, {
            text: '❌ Gagal memproses download. Coba pakai *.dl <link>* manual ya.',
          }, { quoted: m });
        }
        return;
      }

      
      
      
      case 'cari_lagu': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }
        try {
          let query = config?.cfg?.query || '';
          const QUERY_PLACEHOLDERS = [
            'judul lagu / nama artis yang dicari',
            'judul lagu dan/atau nama artis sesuai yang disebut user',
            'query',
            '',
          ];
          if (!query || QUERY_PLACEHOLDERS.includes(query.trim()) || query.length < 2) {
            query = chat
              .replace(/carikan?|cari|cariin|puter|putar|dengerin|dengarkan|kirim|ada|lagu|musik|song|spotify/gi, '')
              .trim() || chat;
          }

          if (query.length > 1) {
            alya.ev.emit('messages.upsert', {
              messages: [{
                key: { ...m.key, fromMe: false, id: `ALYASPOTIFY_${Date.now()}` },
                message: { conversation: `.spotify ${query}` },
                messageTimestamp: Math.floor(Date.now() / 1000),
              }],
              type: 'notify',
            });
          } else {
            await alya.sendMessage(from, {
              text: 'Hmph... judul lagu atau nama artisnya mana? 😒\nContoh: *carikan lagu Payung Teduh - Akad*',
            }, { quoted: m });
          }
        } catch (songErr) {
          console.error('[cari_lagu]', songErr.message);
          await alya.sendMessage(from, {
            text: '❌ Gagal mencari lagu. Coba pakai *.spotify <judul>* manual ya.',
          }, { quoted: m });
        }
        return;
      }

      
      case 'cari_pin': {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }
        try {
          let pinUrl   = config?.cfg?.pin_url || null;
          let pinQuery = config?.cfg?.query   || '';

          
          if (pinUrl && (
            pinUrl === '' ||
            pinUrl === 'pin_url' ||
            pinUrl.includes('pin_url') ||
            (!pinUrl.includes('pin.it') && !pinUrl.includes('pinterest.com') && !pinUrl.includes('pindl'))
          )) pinUrl = null;

          
          const QUERY_PLACEHOLDERS = [
            'kata kunci pencarian Pinterest',
            'Pinterest search keywords',
            'English keywords',
            'query',
            '',
          ];
          if (!pinQuery || QUERY_PLACEHOLDERS.includes(pinQuery.trim()) || pinQuery.length < 2) {
            
            pinQuery = chat
              .replace(/carikan?|cari|cariin|pinterest|pinterst|pin\b|gambar|foto|wallpaper|aesthetic/gi, '')
              .replace(/di\s+pin(terest)?/gi, '')
              .trim();
          }

          
          if (!pinUrl) {
            const pinMatch = chat.match(/https?:\/\/(www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i);
            if (pinMatch) pinUrl = pinMatch[0];
          }

          const hasPinUrl = !!pinUrl;
          const hasQuery  = pinQuery && pinQuery.length > 1;

          if (hasPinUrl) {
            
            alya.ev.emit('messages.upsert', {
              messages: [{
                key: { ...m.key, fromMe: false, id: `ALYAPINDL_${Date.now()}` },
                message: { conversation: `.pindl ${pinUrl}` },
                messageTimestamp: Math.floor(Date.now() / 1000),
              }],
              type: 'notify',
            });

            
            if (hasQuery) {
              await new Promise(r => setTimeout(r, 800));
              alya.ev.emit('messages.upsert', {
                messages: [{
                  key: { ...m.key, fromMe: false, id: `ALYAPIN_${Date.now()}` },
                  message: { conversation: `.pin ${pinQuery}` },
                  messageTimestamp: Math.floor(Date.now() / 1000),
                }],
                type: 'notify',
              });
            }
          } else if (hasQuery) {
            
            alya.ev.emit('messages.upsert', {
              messages: [{
                key: { ...m.key, fromMe: false, id: `ALYAPIN_${Date.now()}` },
                message: { conversation: `.pin ${pinQuery}` },
                messageTimestamp: Math.floor(Date.now() / 1000),
              }],
              type: 'notify',
            });
          } else {
            await alya.sendMessage(from, {
              text: 'Hmph... link atau kata kunci Pinterestnya mana? 😒\nContoh: *cariin foto anime di pinterest*',
            }, { quoted: m });
          }
        } catch (pinErr) {
          console.error('[cari_pin]', pinErr.message);
        }
        return;
      }

      
      case 'status_vps': {
        const status = getVpsStatus({ socket: alya });
        await alya.sendMessage(from, { text: formatVpsStatus(status) }, { quoted: m });
        addToHistory(sender, 'assistant',
          `Status VPS: ${status.service}, uptime ${status.systemUptimeSec}s, RAM ${status.memory.percent}%`);
        return;
      }

      
      
      
      
      case 'tanya_mendalam': {
        
        const bridgeMsg = replyText || _pickDeepBridge();
        await alya.sendMessage(from, { text: bridgeMsg }, { quoted: m });

        
        try { await alya.sendPresenceUpdate('composing', from); } catch {}
        const thinkDelay = 2000 + Math.random() * 2000;
        await new Promise(r => setTimeout(r, thinkDelay));

        
        let deepQ = config?.cfg?.question || '';
        const Q_PLACEHOLDER = 'pertanyaan user persis seperti ditulis';
        if (!deepQ || deepQ === Q_PLACEHOLDER || deepQ.length < 3) deepQ = chat;

        
        console.log('[DeepThink] Memanggil Gemini untuk:', deepQ.slice(0, 80));
        const geminiAnswer = await callGeminiDeep(deepQ, pushname, roleData);

        if (geminiAnswer) {
          
          addToHistory(sender, 'assistant', geminiAnswer);

          
          const parts = splitIntoMessages(geminiAnswer);
          if (parts.length) {
            
            await new Promise(r => setTimeout(r, 600));
            await sendMultiMessages(alya, from, m, parts);
          } else {
            await alya.sendMessage(from, { text: geminiAnswer });
          }
        } else {
          
          const fallback =
            _ai?.message || _ai?.reply ||
            'Hmph... aku lagi nggak bisa jawab ini sekarang. ' +
            'Coba tanya lagi nanti ya! [_buang muka_]';
          const parts = splitIntoMessages(fallback);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        }

        try { await alya.sendPresenceUpdate('paused', from); } catch {}
        return;
      }

      
      default: {
        if (replyText) {
          const parts = splitIntoMessages(replyText);
          if (parts.length) await sendMultiMessages(alya, from, m, parts);
        } else {
          
          
          
          
          console.log(`[Alya AI] AI tidak menghasilkan cmd maupun msg untuk chat: "${chat.slice(0, 60)}" — mengirim fallback.`);
          await alya.sendMessage(from, {
            text: `Hmph... aku lagi bingung mau jawab apa. 😖\n_Coba tanya lagi dengan kalimat lain ya!_`,
          }, { quoted: m });
        }
      }
    }

  } catch (err) {
    
    
    
    
    
    
    console.error('[Alya AI Error]', err?.stack || err?.message || err);
    try {
      await alya.sendMessage(from, {
        text: `😵 *Aduh, ada yang error nih...*\n_Coba ulangi lagi ya, atau pakai command manual kalau masih gagal._`,
      }, { quoted: m });
    } catch (sendErr) {
      console.error('[Alya AI Error] Bahkan fallback message gagal terkirim:', sendErr?.message || sendErr);
    }
  }
}


module.exports = {
  
  isAITriggered,
  isReplyToBot,
  resolveAIPrompt,
  runAIInteractive,
  
  setVoiceModel,
  getVoiceModel,
  getVoiceList,
  BELL_VOICES,
  generateVoice,
  
  handleSetRole,
  handleClearRole,
  getRoleOf,
  getEffectiveRole,
  getRoleByCount,
  ROLE_LEVELS,
  ROLE_NAMES,
  
  getChatCount,
  incrementChatCount,
  setChatCount,
  isFirstChat,
  formatStatusCard,
  
  getDailyInfo,
  incrementDaily,
  resetDailyLimit,
  markLimitMsgShown,
  DAILY_LIMIT_FREE,
  
  clearUserHistory,
  getUserHistory,
  
  getGlobalLogic,
  setGlobalLogic,
  resetGlobalLogic,
  DEFAULT_LOGIC,
  PRESET_LOGICS,
  BOT_KNOWLEDGE_BASE,
  
  isPremiumUser,
  
  BOT_NICKNAME,
  BOT_FULLNAME,
  
  groupCtx,
};
