/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

// =====================================================================
//  lib/uidoc.js — MODEL DOKUMEN bersama untuk kartu RICH dan panel BUTTON   [v8]
//
//  Semua balasan teks bot (apa pun gaya penulisannya) dibaca di sini menjadi:
//     { title, icon, status, tone, blocks:[{t:'h'|'kv'|'p'|'ul'|'ol'|'bar'|'code'|'cmds'|'hero'|'reel'|'note'}] }
//  lalu dirender oleh lib/richui.js (HTML).
//  Di sini juga: ikon & warna per jenis baris (nama FA), peta judul -> ikon, dan "detail eksekusi" per perintah
//  (perintah, kategori, pemohon, chat, waktu proses, jam) yang ditambahkan otomatis ke SETIAP balasan fitur.
// =====================================================================

'use strict'

const TZ = 'Asia/Jakarta'

// ---------------------------------------------------------------- util teks
// huruf tebal Unicode (𝗧𝗘𝗞𝗦 / 𝟭𝟮) -> ASCII biasa
function unbold(s) {
  return String(s == null ? '' : s).replace(/[\u{1D5D4}-\u{1D607}\u{1D7EC}-\u{1D7F5}]/gu, (c) => {
    const n = c.codePointAt(0)
    if (n >= 0x1d5d4 && n <= 0x1d5ed) return String.fromCharCode(65 + n - 0x1d5d4)
    if (n >= 0x1d5ee && n <= 0x1d607) return String.fromCharCode(97 + n - 0x1d5ee)
    return String.fromCharCode(48 + n - 0x1d7ec)
  })
}
const ACR = new Set(['AI', 'QR', 'PDF', 'URL', 'TTS', 'IG', 'WA', 'API', 'MP3', 'MP4', 'HD', 'ID', 'RPG', 'OTP', 'NIK', 'IPK', 'BMI', 'GIF', 'RGB', 'HEX', 'CPU', 'RAM', 'JSON', 'HTML', 'CSS', 'SQL', 'VPN', 'DNS', 'IP', 'NF', 'TV', 'FB', 'YT', 'OS', 'UI', 'XP', 'EXP', 'THR', 'PPN', 'DM', 'GC', 'PM', 'AM', 'WIB', 'ATM', 'SMS', 'USD', 'IDR', 'GPS', 'ZIP', 'APK', 'TXT', 'SVG', 'PNG', 'JPG', 'AFK', 'LV', 'VS', 'NSFW', 'FAQ'])
function titleCase(s) {
  s = String(s || '').trim()
  if (!s) return s
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '')
  if (letters.length < 3 || letters !== letters.toUpperCase()) return s // sudah bercampur huruf besar/kecil
  return s
    .toLowerCase()
    .replace(/(^|[\s\-/(])([a-zà-ÿ0-9]+)/g, (m, sep, w) => sep + (ACR.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
}
const plainOf = (t = '') => String(t).replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim()
const cut = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s))

// ---------------------------------------------------------------- ikon & warna baris (nama Font Awesome)
// [regex kunci, ikon FA, warna]  warna: gold sky vio rose mint amber cyan pink slate
const KEYFA = [
  [/^(nama|name|user|pengguna|pemain|pemilik|penerima|dari|pengirim|oleh|pemohon|diminta)\b/i, 'user', 'sky'],
  [/uploader|author|artis|penyanyi|channel|kanal|pembuat|creator|akun|username/i, 'circle-user', 'sky'],
  [/level|lvl/i, 'ranking-star', 'vio'],
  [/\bexp\b|xp|poin|point/i, 'wand-magic-sparkles', 'vio'],
  [/money|saldo|uang|dompet|kas\b|gaji|upah|untung|rugi|menang|kalah|hadiah|bonus|harga|biaya|tarif|bayar|total bayar|rp\b|modal|taruhan|bet\b/i, 'wallet', 'gold'],
  [/bank|tabungan|rekening/i, 'building-columns', 'gold'],
  [/limit|kuota|sisa|tiket/i, 'ticket', 'amber'],
  [/rank|peringkat|posisi|juara/i, 'trophy', 'amber'],
  [/uptime|runtime|aktif sejak|durasi|lama\b|panjang waktu/i, 'hourglass-half', 'vio'],
  [/waktu|jam\b|pukul|clock|time|tanggal|date|hari|bulan|tahun|ultah|lahir|diposting|rilis|upload|dibuat/i, 'calendar-days', 'vio'],
  [/status|kondisi|state/i, 'signal', 'mint'],
  [/ping|speed|latency|latensi|kecepatan|respons/i, 'bolt', 'amber'],
  [/view|tonton|putar|dilihat/i, 'eye', 'cyan'],
  [/like|suka|disukai|digg/i, 'heart', 'rose'],
  [/komen|comment|balasan/i, 'comment', 'cyan'],
  [/share|bagikan|dibagikan|repost/i, 'share-nodes', 'cyan'],
  [/simpan|favorit|save|collect/i, 'bookmark', 'amber'],
  [/follower|pengikut|subscriber|subs/i, 'users', 'sky'],
  [/following|mengikuti/i, 'user-plus', 'sky'],
  [/total|jumlah|banyak|count|item|entri/i, 'calculator', 'cyan'],
  [/mode/i, 'sliders', 'slate'],
  [/prefix/i, 'terminal', 'slate'],
  [/link|url|tautan|situs|sumber|source|website|domain/i, 'link', 'cyan'],
  [/\bid\b|jid|nomor|number|phone|telepon|\bhp\b|\bwa\b|no\.?\s?(hp|wa)/i, 'id-badge', 'slate'],
  [/hasil|result|jawaban|answer|skor|score|nilai|kesimpulan/i, 'bullseye', 'mint'],
  [/ukuran|size|kapasitas|berat file|storage|disk/i, 'database', 'slate'],
  [/memori|memory|ram|heap|rss/i, 'memory', 'sky'],
  [/cpu|prosesor|core|beban|load/i, 'microchip', 'rose'],
  [/judul|title|lagu|film|video|musik|sound|audio|track/i, 'clapperboard', 'pink'],
  [/suhu|temp|panas|dingin|derajat/i, 'temperature-half', 'rose'],
  [/cuaca|weather|angin|hujan|kelembapan|awan/i, 'cloud-sun', 'sky'],
  [/kategori|jenis|tipe|type|kelas|format|ekstensi|mime/i, 'tag', 'vio'],
  [/deskripsi|keterangan|catatan|info\b|arti|makna|isi|pesan|caption|bio|alasan|detail/i, 'align-left', 'slate'],
  [/lokasi|kota|negara|alamat|tempat|wilayah|provinsi|daerah|region|asal/i, 'location-dot', 'rose'],
  [/berat|massa|\bkg\b/i, 'weight-scale', 'amber'],
  [/tinggi|lebar|jarak|panjang|ketinggian/i, 'ruler-combined', 'amber'],
  [/umur|usia|age/i, 'cake-candles', 'pink'],
  [/e-?mail|surel/i, 'envelope', 'sky'],
  [/pass|sandi|token|key|kunci|kode|code|otp|hash|cookie|secret/i, 'key', 'amber'],
  [/bahasa|language|terjemah|lang\b/i, 'language', 'cyan'],
  [/warna|color|colour/i, 'palette', 'pink'],
  [/owner|dev|admin|developer/i, 'crown', 'gold'],
  [/grup|group|anggota|member|peserta/i, 'user-group', 'sky'],
  [/versi|version|node|platform|sistem|\bos\b/i, 'microchip', 'slate'],
  [/kualitas|resolusi|quality|bitrate|fps|codec/i, 'film', 'pink'],
  [/mesin|engine|server|host|provider|layanan/i, 'server', 'slate'],
  [/perintah|command|cmd|fitur|plugin|alias/i, 'terminal', 'slate'],
  [/sedang|giliran|ronde|babak|langkah|step/i, 'flag-checkered', 'mint'],
  [/gender|kelamin|jenis kelamin/i, 'venus-mars', 'pink'],
  [/zodiak|shio/i, 'star', 'vio'],
  [/agama|religi/i, 'mosque', 'mint'],
  [/pekerjaan|profesi|jabatan|kerja/i, 'briefcase', 'slate'],
  [/bunga|pajak|diskon|persen|\b%\b|rate|margin|laba|roi/i, 'percent', 'gold'],
  [/rumus|formula|persamaan/i, 'square-root-variable', 'vio']
]
function keyIcon(k) {
  const key = String(k || '').replace(/[*_~`]/g, '').trim()
  for (const [re, fa, hue] of KEYFA) if (re.test(key)) return { fa, hue }
  return { fa: '', hue: 'slate' }
}

// judul -> [ikon FA, nada]
const TITLE_FA = [
  [/DOMPET|SALDO|BALANCE|MONEY|BANK|DEPOSIT|TARIK|TRANSFER|UANG|TABUNG|GAJI|HUTANG|KAS\b/i, 'wallet', 'gold'],
  [/PROFIL|KARTU|ID CARD|IDENTITAS/i, 'id-card'],
  [/STATUS|STATISTIK|SERVER|DASHBOARD|SISTEM/i, 'chart-simple'],
  [/CUACA|WEATHER/i, 'cloud-sun'],
  [/KURS|MATA UANG|CURRENCY/i, 'money-bill-transfer'],
  [/TOP |PERINGKAT|LEADERBOARD|JUARA|PODIUM/i, 'trophy', 'gold'],
  [/WARN|PERINGATAN|PELANGGARAN/i, 'triangle-exclamation', 'warn'],
  [/ADMIN/i, 'shield-halved'],
  [/GRUP|GROUP/i, 'user-group'],
  [/BMI|IMT|SEHAT|KALORI|KESEHATAN|JANTUNG|GIZI/i, 'heart-pulse'],
  [/JADWAL|WAKTU|JAM|KALENDER|HIJRI|HARI|TANGGAL/i, 'calendar-days'],
  [/SHOLAT|SALAT|ADZAN|ZAKAT|DOA/i, 'mosque'],
  [/QUR|SURAT|AYAT|HADIS/i, 'book-quran'],
  [/GEMPA/i, 'house-crack'],
  [/RAMAL|ZODIAK|JODOH|KHODAM|TAROT/i, 'wand-magic-sparkles'],
  [/QUIZ|KUIS|TEBAK/i, 'brain'],
  [/DOWNLOAD|UNDUH|DOWNLOADER/i, 'download'],
  [/YOUTUBE|YT/i, 'b-youtube'],
  [/TIKTOK/i, 'b-tiktok'],
  [/INSTAGRAM|IGSTALK/i, 'b-instagram'],
  [/FACEBOOK/i, 'b-facebook'],
  [/TWITTER|TWIT/i, 'b-x-twitter'],
  [/SPOTIFY/i, 'b-spotify'],
  [/GITHUB|GIT /i, 'b-github'],
  [/TELEGRAM/i, 'b-telegram'],
  [/WHATSAPP/i, 'b-whatsapp'],
  [/ERROR|GAGAL/i, 'circle-xmark', 'err']
]

// judul -> [emoji, nada]  (dipakai mode BUTTON, teks WhatsApp bisa emoji)
const TITLE_HINTS = [
  [/DOMPET|SALDO|BALANCE|MONEY|BANK|DEPOSIT|TARIK|TRANSFER|UANG|TABUNG|GAJI/i, '💰', 'gold'],
  [/PROFIL|KARTU|ID CARD/i, '🪪'],
  [/STATUS|STATISTIK|SERVER|DASHBOARD/i, '📡'],
  [/CUACA|WEATHER/i, '🌦️'],
  [/KURS|MATA UANG|CURRENCY/i, '💱'],
  [/TOP |PERINGKAT|LEADERBOARD|JUARA|PODIUM/i, '🏆', 'gold'],
  [/WARN|PERINGATAN|PELANGGARAN/i, '⚠️', 'warn'],
  [/ADMIN/i, '🛡️'],
  [/GRUP|GROUP/i, '👥'],
  [/BMI|IMT|SEHAT|KALORI|KESEHATAN|JANTUNG/i, '❤️'],
  [/JADWAL|WAKTU|JAM|KALENDER|HIJRI|HARI|TANGGAL/i, '🕒'],
  [/SHOLAT|SALAT|ADZAN|ZAKAT/i, '🕌'],
  [/QUR|SURAT|AYAT/i, '📖'],
  [/GEMPA/i, '🌋'],
  [/RAMAL|ZODIAK|JODOH|KHODAM/i, '🔮'],
  [/QUIZ|KUIS|TEBAK/i, '🧠'],
  [/DOWNLOAD|UNDUH/i, '📥'],
  [/ERROR|GAGAL/i, '❌', 'err']
]

const CAT_LABEL = { info: 'Info', group: 'Grup', sticker: 'Stiker', downloader: 'Downloader', game: 'Game', fun: 'Fun', tools: 'Tools', image: 'Gambar', audio: 'Audio', video: 'Video', dokumen: 'Dokumen', islam: 'Islami', channel: 'Saluran', owner: 'Owner', rpg: 'RPG', ui: 'Tampilan' }
const catLabel = (c) => CAT_LABEL[c] || (c ? String(c).replace(/^./, (x) => x.toUpperCase()) : 'Bot')

// nada: label, ikon FA, keterangan singkat (dipakai kartu rich dan panel button)
const TONE_META = {
  ok: { label: 'Berhasil', fa: 'circle-check', title: 'Berhasil', sub: 'Perintah dijalankan dengan sukses' },
  err: { label: 'Gagal', fa: 'circle-xmark', title: 'Gagal', sub: 'Perintah tidak dapat diproses' },
  warn: { label: 'Peringatan', fa: 'triangle-exclamation', title: 'Peringatan', sub: 'Perlu perhatian' },
  denied: { label: 'Ditolak', fa: 'lock', title: 'Akses Ditolak', sub: 'Kamu tidak punya izin untuk perintah ini' },
  usage: { label: 'Cara pakai', fa: 'book-open', title: 'Cara Pakai', sub: 'Panduan penggunaan perintah' },
  info: { label: 'Info', fa: 'circle-info', title: 'Info', sub: '' },
  gold: { label: 'Spesial', fa: 'star', title: 'Spesial', sub: '' }
}

// ---------------------------------------------------------------- PARSER TEKS -> BLOK
const BUL = '▬➥•▪›➤✦◦·'
const RE = {
  panelTitle: /^[\s―—–─=-]*[《「]\s*❝?\s*\*?(.+?)\*?\s*❞?\s*[》」][\s―—–─=-]*$/u,
  boxTop: /^[┌┏╭╔]+[─━═┄┈╌-]*\s*[《「]\s*(.+?)\s*[》」]\s*$/u,
  fancyHead: /^[✦✧❖◆]?[┈─━~-]{1,}\s*[๑•]?\s*(.+?)\s*[๑•]?\s*[┈─━~-]{1,}[✦✧❖◆]?$/u,
  emojiBold: /^(\p{Extended_Pictographic}️?)\s+\*([^*]+)\*\s*$/u,
  boldOnly: /^\*([^*]+)\*:?$/,
  head: /^\[\s*(.+?)\s*\]$/,
  reel: /^\[\s*((?:\p{Extended_Pictographic}️?\s*\|?\s*)+)\]$/u,
  div: /^[─—―=_~-]{4,}$/,
  kvBold: new RegExp(`^\\s*[${BUL}-]?\\s*(\\p{Extended_Pictographic}\\uFE0F?\\s*)?\\*([^*]+?)(:?)\\*\\s*(:?)\\s*(.*)$`, 'u'),
  kvBullet: new RegExp(`^\\s*[${BUL}-]\\s*([^:：\\n]{1,30}?)\\s*[:：]\\s+(.+)$`),
  kvPlain: /^([A-Za-zÀ-ÿ][^:：\n]{0,24}?)\s*[:：]\s+(\S.*)$/,
  ol: /^\s*(\d{1,3})[.)]\s+(.+)$/,
  ul: new RegExp(`^\\s*(?:[${BUL}]|[-–])\\s+(.+)$`),
  note: /^_([^_].*[^_])_$/,
  example: /^(Contoh|Misal|Ex|Format|Cara pakai|Gunakan|Pakai)\s*\d*\s*:?\s*(.*)$/i,
  hero: /^(.{1,70}?)\s=\s\*([^*]+)\*$/,
  bar: /([■▰█▮●]+)([□▱░▯○]*)/,
  pct: /(\d{1,3}(?:[.,]\d+)?)\s*%/,
  callout: /^(💡|⚠️|ℹ️|📌|❗|✨|📂|🔔)/u,
  longTok: /^\S{28,}$/,
  statusLine: /^\[\s*(\S(?: {1,3}\S)+)\s*\]$/,
  foot: /^(Powering .+ Information System|©\s)/i
}
const isCmdLine = (l, px) => px && l.startsWith(px) && /^[a-z0-9]/i.test(l.slice(px.length)) && l.length < 160

// buang sudut/garis kotak di awal baris: "┌─ *Judul*" -> "*Judul*", "│ ◦ A : b" -> "◦ A : b", "└──────" -> ""
function cleanBox(l) {
  l = l.replace(/^[┌┏╭└┗╰├┝╠╔╚]+[─━═┄┈╌-]*\s*/u, '')
  l = l.replace(/^[│┃║]+\s*/u, '')
  return l.trim()
}

// "[ G A G A L ]" / "[ C A R A   P A K A I ]" -> "GAGAL" / "CARA PAKAI"
function despace(inner) {
  const words = inner.split(/\s{3,}/)
  const out = []
  for (const w of words) {
    const ch = w.split(' ')
    if (!ch.every((c) => [...c].length === 1)) return ''
    out.push(ch.join(''))
  }
  return out.join(' ')
}

function parse(text, { prefix = '.' } = {}) {
  let src = unbold(String(text || '').replace(/\r/g, ''))
  // markdown ringan (balasan AI): **tebal** -> *tebal*, ### Judul -> *Judul*
  src = src.replace(/\*\*([^*\n]+)\*\*/g, '*$1*').replace(/^#{1,4}\s+(.+)$/gm, '*$1*')
  let lines = src.split('\n').map((l) => l.replace(/\s+$/, ''))

  // kutipan WhatsApp ("> ...") dan bingkai kotak: kepala kotak jadi sub-judul, sudut/garis dibuang
  lines = lines.map((raw) => {
    const l = raw.replace(/^\s*>\s?/, '').trim()
    const bt = l.match(RE.boxTop)
    if (bt) return `\u0001${bt[1].replace(/[*_]/g, '').trim()}`
    return cleanBox(l)
  })

  // baris status ala fmt.card: "[ B E R H A S I L ]"
  let status = ''
  {
    const fi0 = lines.findIndex((l) => l)
    const m0 = fi0 >= 0 && lines[fi0].match(RE.statusLine)
    if (m0) {
      const s = despace(m0[1])
      if (s) {
        status = s
        lines.splice(fi0, 1)
      }
    }
  }

  // ---- judul
  let title = ''
  let icon = ''
  const fi = lines.findIndex((l) => l)
  if (fi >= 0) {
    let m
    if ((m = lines[fi].match(RE.panelTitle))) {
      title = m[1]
      lines.splice(fi, 1)
    } else if ((m = lines[fi].match(RE.emojiBold))) {
      icon = m[1]
      title = m[2]
      lines.splice(fi, 1)
    } else if ((m = lines[fi].match(RE.boldOnly)) && m[1].length <= 64) {
      const next = lines.slice(fi + 1).find((l) => l !== undefined)
      if (next === '' || next === undefined || RE.kvBold.test(next) || RE.kvBullet.test(next) || RE.head.test(next)) {
        title = m[1]
        lines.splice(fi, 1)
      }
    }
    const tm = title.match(/^(\p{Extended_Pictographic}️?)\s*(.+)$/u)
    if (tm) {
      icon = icon || tm[1]
      title = tm[2]
    }
    title = titleCase(title.replace(/[*_]/g, '').replace(/\s+/g, ' ').trim())
  }

  const blocks = []
  const push = (b) => blocks.push(b)
  const last = () => blocks[blocks.length - 1]
  let para = []
  let kvRun = [] // kv polos: baru sah kalau >= 2 baris berurutan
  const flushPara = () => {
    if (para.length) push({ t: 'p', text: para.join('\n') })
    para = []
  }
  const flushKv = () => {
    if (!kvRun.length) return
    if (kvRun.length >= 2) push({ t: 'kv', rows: kvRun })
    else para.push(`${kvRun[0].k}: ${kvRun[0].v}`)
    kvRun = []
  }
  const flushAll = () => {
    flushKv()
    flushPara()
  }
  const addTo = (type, item) => {
    flushAll()
    const l = last()
    if (l && l.t === type) l.rows.push(item)
    else push({ t: type, rows: [item] })
  }

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]

    if (l.startsWith('```')) {
      flushAll()
      const buf = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      push({ t: 'code', text: buf.join('\n') })
      continue
    }
    if (!l) {
      flushAll()
      continue
    }
    if (l.startsWith('\u0001')) {
      flushAll()
      push({ t: 'h', text: titleCase(l.slice(1)) })
      continue
    }
    if (RE.foot.test(l)) continue
    if (RE.div.test(l)) {
      flushAll()
      continue
    }

    let m
    if (RE.reel.test(l)) {
      flushAll()
      push({ t: 'reel', text: l.replace(/^\[\s*|\s*\]$/g, '') })
      continue
    }
    if ((m = l.match(RE.fancyHead)) && /\p{L}{2,}/u.test(m[1]) && /[┈๑]/u.test(l)) {
      flushAll()
      push({ t: 'h', text: titleCase(m[1].replace(/[*_]/g, '')) })
      continue
    }
    if ((m = l.match(RE.panelTitle))) {
      // baris 「 judul 」 di tengah/akhir = catatan kaki
      flushAll()
      push({ t: 'note', text: m[1].replace(/[*_]/g, '').trim() })
      continue
    }
    if ((m = l.match(RE.emojiBold)) && m[2].length <= 60) {
      flushAll()
      push({ t: 'h', text: `${m[1]} ${m[2].replace(/:$/, '')}` })
      continue
    }
    if ((m = l.match(RE.head)) && /\p{L}{3,}/u.test(m[1]) && !m[1].includes('|')) {
      flushAll()
      push({ t: 'h', text: m[1] })
      continue
    }
    if ((m = l.match(RE.boldOnly)) && m[1].length <= 60 && !/^\d+[.)]/.test(m[1])) {
      flushAll()
      push({ t: 'h', text: m[1].replace(/:$/, '') })
      continue
    }
    // baris progress: ▰▰▱▱ 45%
    if (RE.bar.test(l) && RE.pct.test(l)) {
      const pct = Number(l.match(RE.pct)[1].replace(',', '.'))
      const label = l
        .replace(RE.pct, '')
        .replace(RE.bar, '')
        .replace(new RegExp(`^[${BUL}\\s-]+`), '')
        .replace(/[\[\]()]/g, '')
        .replace(/\s*[:：]\s*$/, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
      flushAll()
      push({ t: 'bar', label: label || 'Progres', pct })
      continue
    }
    if ((m = l.match(RE.hero)) && !/[:：]\s*$/.test(m[1]) && m[2].length <= 40) {
      flushAll()
      push({ t: 'hero', sub: m[1], big: m[2] })
      continue
    }
    if ((m = l.match(RE.example))) {
      const rest = m[2]
      flushAll()
      if (rest && isCmdLine(rest, prefix)) push({ t: 'cmds', rows: [{ label: m[1], text: rest }] })
      else if (rest) push({ t: 'p', text: l })
      else {
        // "Contoh:" lalu baris-baris perintah
        const rows = []
        while (i + 1 < lines.length && lines[i + 1] && isCmdLine(lines[i + 1], prefix)) rows.push({ label: rows.length ? '' : m[1], text: lines[++i] })
        if (rows.length) push({ t: 'cmds', rows })
        else push({ t: 'p', text: l })
      }
      continue
    }
    if (isCmdLine(l, prefix) && !/\s{2,}/.test(l)) {
      flushAll()
      const lb = last()
      if (lb && lb.t === 'cmds') lb.rows.push({ label: '', text: l })
      else push({ t: 'cmds', rows: [{ label: '', text: l }] })
      continue
    }
    // baris kv ala fmt.card: "› *Contoh* : .cmd ..." -> contoh perintah
    if ((m = l.match(RE.kvBold)) && (m[3] || m[4])) {
      const key = `${m[1] ? m[1].trim() + ' ' : ''}${m[2]}`.replace(/:$/, '').trim()
      const val = m[5].trim()
      if (/^(contoh|format)\s*\d*$/i.test(m[2].trim()) && isCmdLine(val, prefix)) {
        flushAll()
        const lb = last()
        const row = { label: m[2].trim(), text: val }
        if (lb && lb.t === 'cmds') lb.rows.push(row)
        else push({ t: 'cmds', rows: [row] })
        continue
      }
      addTo('kv', { k: key, v: val })
      continue
    }
    if ((m = l.match(RE.kvBullet))) {
      addTo('kv', { k: m[1].trim(), v: m[2].trim() })
      continue
    }
    if ((m = l.match(RE.ol))) {
      if (/[:：]$/.test(m[2]) && m[2].length <= 40) {
        // "1. Token:" lalu nilainya di baris berikut -> judul kecil
        flushAll()
        push({ t: 'h', text: `${m[1]}. ${m[2].replace(/[:：]$/, '')}` })
        continue
      }
      addTo('ol', { n: Number(m[1]), text: m[2] })
      continue
    }
    if ((m = l.match(RE.ul))) {
      if (isCmdLine(m[1], prefix)) {
        flushAll()
        const lb = last()
        if (lb && lb.t === 'cmds') lb.rows.push({ label: '', text: m[1] })
        else push({ t: 'cmds', rows: [{ label: '', text: m[1] }] })
      } else addTo('ul', { text: m[1] })
      continue
    }
    if ((m = l.match(RE.note))) {
      flushAll()
      push({ t: 'note', text: m[1].replace(/^(\p{Extended_Pictographic}️?\s*)+/u, '') })
      continue
    }
    if ((m = l.match(RE.kvPlain)) && m[1].split(/\s+/).length <= 3 && !/^https?$/i.test(m[1])) {
      flushPara()
      kvRun.push({ k: m[1].trim(), v: m[2].trim() })
      continue
    }
    // "Judul:" diikuti daftar -> sub judul
    if (/^[^:：\n]{2,28}[:：]$/.test(l) && lines[i + 1] && (RE.ol.test(lines[i + 1]) || RE.ul.test(lines[i + 1]) || RE.kvBold.test(lines[i + 1]) || RE.kvBullet.test(lines[i + 1]))) {
      flushAll()
      push({ t: 'h', text: l.replace(/[:：]$/, '') })
      continue
    }
    if (RE.longTok.test(l)) {
      // token / link panjang tanpa spasi -> kotak kode (mudah dilihat & disalin)
      flushAll()
      push({ t: 'code', text: l })
      continue
    }
    flushKv()
    para.push(l)
  }
  flushAll()
  return { title, icon, status, blocks }
}

// ---------------------------------------------------------------- klasifikasi nada
const FAIL_RE = /^\s*(❌|⚠️)|gagal|tidak ditemukan|tidak bisa|tidak valid|tidak dikenali|\berror\b|ditolak|kesalahan|salah\b|tidak cukup|belum (ada|bisa)|terlalu|maksimal|minimal/i
const OK_RE = /^\s*✅|berhasil|sukses|diterima|selesai|telah (diubah|diatur|ditambah|dihapus)|sudah (aktif|diatur)|dinyalakan|dimatikan/i
const USAGE_RE = /^\s*(contoh|masukkan|masukan|gunakan|format|cara|balas|kirim|reply|tag|ketik|tulis|pilih)\b/i
const STATUS_TONE = [
  [/CARA PAKAI|PANDUAN|BANTUAN/i, 'usage'],
  [/GAGAL|ERROR|KESALAHAN|TERJADI KESALAHAN/i, 'err'],
  [/BERHASIL|SUKSES|SELESAI/i, 'ok'],
  [/DITOLAK|AKSES/i, 'denied'],
  [/PERINGATAN|WARNING/i, 'warn']
]
function classify(text, { kind, hasTitle, status } = {}) {
  if (kind === 'denied') return 'denied'
  if (kind === 'error') return 'err'
  if (status) {
    for (const [re, t] of STATUS_TONE) if (re.test(status)) return t
  }
  if (hasTitle) {
    const t0 = unbold(String(text).split('\n').find((l) => l.trim()) || '')
    if (/^\W*\*?(CARA PAKAI)/i.test(t0)) return 'usage'
    if (/^\W*\*?(GAGAL|TERJADI KESALAHAN)\*?/i.test(t0)) return 'err'
    if (/^\W*\*?BERHASIL\*?/i.test(t0)) return 'ok'
    if (/^\W*\*?AKSES DITOLAK\*?/i.test(t0)) return 'denied'
  }
  const head = unbold(String(text)).replace(/^\s*(\[[^\]]*\]\s*)/, '').slice(0, 160)
  if (hasTitle && !status) {
    // judul buatan plugin sendiri: tetap cek kata kunci pada isi
    const body = head.replace(/^.*\n/, '')
    if (USAGE_RE.test(body)) return 'usage'
    if (FAIL_RE.test(body)) return 'err'
    return 'info'
  }
  if (USAGE_RE.test(head)) return 'usage'
  if (FAIL_RE.test(head)) return 'err'
  if (OK_RE.test(head)) return 'ok'
  return 'info'
}

// ---------------------------------------------------------------- DETAIL EKSEKUSI per balasan
const nowWib = () => new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour12: false }).slice(0, 5)
const dateWib = () => new Date().toLocaleDateString('id-ID', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' })
const secsOf = (meta) => (meta && meta.t0 ? Math.max(0.01, (Date.now() - meta.t0) / 1000) : 0)
const fmtSecs = (s) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} dtk`)

function accessOf(meta = {}) {
  const a = []
  if (meta.owner) a.push('Owner')
  else if (meta.admin) a.push('Admin grup')
  if (meta.group) a.push('Khusus grup')
  if (meta.botAdmin) a.push('Bot harus admin')
  return a.length ? a.join(' + ') : 'Semua pengguna'
}

// baris detail yang ditampilkan di akhir kartu / panel: [{ k, v, fa }]
function detailRows(meta = {}, { prefix = '.' } = {}) {
  if (!meta.command) return []
  const secs = secsOf(meta)
  const rows = [{ k: 'Perintah', v: `${prefix}${meta.command}`, fa: 'terminal' }]
  if (meta.category) rows.push({ k: 'Kategori', v: catLabel(meta.category), fa: CAT_FA(meta.category) })
  if (meta.name) rows.push({ k: 'Diminta oleh', v: cut(meta.name, 24), fa: 'user' })
  if (meta.isGroup !== undefined) rows.push({ k: 'Chat', v: meta.isGroup ? (meta.groupName ? cut(meta.groupName, 22) : 'Grup') : 'Pribadi', fa: meta.isGroup ? 'user-group' : 'message' })
  if (secs) rows.push({ k: 'Waktu proses', v: fmtSecs(secs), fa: 'stopwatch' })
  rows.push({ k: 'Waktu', v: `${nowWib()} WIB`, fa: 'clock' })
  return rows
}
const CAT_FA = (c) => require('./fa.cjs').CAT[c] || 'layer-group'

// panduan lengkap dari metadata plugin (untuk balasan "cara pakai" / gagal)
function guide(meta = {}, prefix = '.') {
  if (!meta.command) return null
  const main = (meta.aliases && meta.aliases[0]) || meta.command
  const others = (meta.aliases || []).filter((a) => a !== meta.command)
  return {
    command: meta.command,
    format: `${prefix}${meta.command}${meta.usage ? ' ' + meta.usage : ''}`.trim(),
    desc: meta.desc || '',
    aliases: others.slice(0, 8),
    access: accessOf(meta),
    main
  }
}

module.exports = {
  TZ, RE, BUL, parse, classify, cleanBox, unbold, titleCase, plainOf, cut, keyIcon, KEYFA, TITLE_HINTS, TITLE_FA, CAT_LABEL, catLabel, TONE_META,
  detailRows, guide, accessOf, nowWib, dateWib, secsOf, fmtSecs, isCmdLine
}
