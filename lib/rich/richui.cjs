/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

// =====================================================================
//  lib/richui.js — UI kartu HTML untuk SEMUA fitur (gaya sama dengan ytPlayer / game HTML)   [v8]
//
//  Cara kerja:
//   1. install(sock) membungkus sock.sendMessage. Setiap balasan TEKS biasa (ctx.reply dll)
//      otomatis diubah jadi kartu HTML (judul, banner status, baris info, tile angka, progress bar,
//      daftar, contoh perintah, panduan lengkap, detail eksekusi).
//   2. Menu / profil / dashboard / podium memakai kartu khusus (menuApp, profile, dashboard, ...).
//   3. Gagal kirim / uiMode 'text' / perintah di daftar uiPlain  -> otomatis teks biasa (aman).
//
//  v8: NOL EMOJI. Semua ikon = Font Awesome (SVG inline, lib/fa.js). Emoji di teks mana pun otomatis jadi ikon FA.
//
//  TANPA SCROLL DI DALAM KARTU: area scroll bersarang sering tidak menerima sentuhan di WhatsApp.
//  Tinggi kartu otomatis; isi yang panjang dipecah per HALAMAN dengan tombol « ‹ n/N › ».
//
//  Pengaturan: settings.js -> global.uiMode ('rich' | 'button'), global.uiPlain, global.uiBotJid, global.uiMeta (false = tanpa detail)
// =====================================================================

'use strict'

const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')
const { AsyncLocalStorage } = require('async_hooks')

const als = new AsyncLocalStorage()
const fa = require('./fa.cjs')
const doc = require('./uidoc.cjs')

const OPTS = {
  get enabled() {
    return require('./uimode.cjs').isRich() // mode 'rich' = UI kartu; 'button' = tampilan teks + tombol
  },
  get botJid() {
    return global.uiBotJid || '867051314767696@bot'
  },
  get brand() {
    return global.botname || 'kureza'
  },
  get footer() {
    return global.footer || ''
  },
  // banner .menu / .allmenu — di-cache sekali di memori (base64), tidak dibaca ulang tiap kirim kartu
  get banner() {
    if (global.uiBanner === false) return ''
    if (OPTS._bannerCache !== undefined) return OPTS._bannerCache
    try {
      const p = path.join(__dirname, '..', '..', 'media', 'menu_banner.jpg')
      const buf = fs.readFileSync(p)
      OPTS._bannerCache = `data:image/jpeg;base64,${buf.toString('base64')}`
    } catch {
      OPTS._bannerCache = ''
    }
    return OPTS._bannerCache
  },
  get meta() {
    return global.uiMeta !== false
  },
  // perintah yang hasilnya HARUS tetap teks biasa (mudah disalin / dikirim ke chat lain)
  get plain() {
    return new Set(
      ['bc', 'broadcast', 'password', 'base64', 'hash', 'hex', 'unhex', 'rot13', 'caesar', 'urlencode', 'urldecode', 'morse', 'biner', 'shorten', 'tourl', 'qr', 'tempmail', 'getfitur']
        .concat(global.uiPlain || [])
        .map((x) => String(x).toLowerCase())
    )
  }
}

// ---------------------------------------------------------------- warna
const TONES = {
  info: ['#7c5cff', '#00d4ff'],
  ok: ['#10b981', '#2dd4bf'],
  err: ['#f43f5e', '#fb923c'],
  warn: ['#f59e0b', '#fde047'],
  denied: ['#e11d48', '#f59e0b'],
  usage: ['#8b5cf6', '#38bdf8'],
  gold: ['#f59e0b', '#fde047']
}
// warna 'info' & warna dasar kartu mengikuti tema (.tema) — lihat lib/theme.js
const theme = () => require('./theme.cjs')
Object.defineProperty(TONES, 'info', { enumerable: true, configurable: true, get: () => theme().rich().accent })
const CAT_COLORS = {
  info: ['#00c6ff', '#0072ff'],
  group: ['#43e97b', '#38f9d7'],
  sticker: ['#f093fb', '#f5576c'],
  downloader: ['#4facfe', '#00f2fe'],
  game: ['#fa709a', '#fee140'],
  fun: ['#ffb347', '#ff5e62'],
  tools: ['#a18cd1', '#fbc2eb'],
  channel: ['#25d366', '#128c7e'],
  owner: ['#f7971e', '#ffd200'],
  image: ['#6a11cb', '#2575fc'],
  audio: ['#ee0979', '#ff6a00'],
  video: ['#f12711', '#f5af19'],
  dokumen: ['#56ab2f', '#a8e063'],
  islam: ['#11998e', '#38ef7d'],
  rpg: ['#8e2de2', '#4a00e0'],
  ui: ['#00c9ff', '#92fe9d']
}
// emoji kategori dipakai MODE BUTTON (teks WhatsApp); kartu rich memakai fa.CAT
const CAT_ICONS = { info: 'ℹ️', group: '👥', sticker: '🎨', downloader: '📥', game: '🎮', fun: '🎉', tools: '🧰', image: '🖼️', audio: '🎧', video: '🎬', dokumen: '📄', islam: '🕌', channel: '📢', owner: '👑' }

function hueColors(seed) {
  let h = 0
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) % 360
  return [`hsl(${h} 85% 62%)`, `hsl(${(h + 40) % 360} 85% 56%)`]
}
const catColors = (cat) => {
  const t = theme().rich()
  if (t.flat && !theme().unify()) { // tema flat (neo brutalism): satu warna datar per kategori, stabil
    let h = 0
    for (const c of String(cat || 'x')) h = (h * 31 + c.charCodeAt(0)) % 997
    const c = t.flat[h % t.flat.length]
    return [c, c]
  }
  return theme().unify() ? t.accent : CAT_COLORS[cat] || hueColors(cat || 'x')
}

// ---------------------------------------------------------------- util teks
const esc = (t = '') =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')

// *tebal*  _miring_  ~coret~  `kode`  @mention  link
function inline(raw = '') {
  let s = esc(raw)
  s = s.replace(/```([^`]+)```/g, '<code>$1</code>')
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  s = s.replace(/(^|[\s(>])\*([^\s*][^*\n]*?)\*(?=$|[\s).,!?:;<])/g, '$1<b>$2</b>')
  s = s.replace(/(^|[\s(>])_([^\s_][^_\n]*?)_(?=$|[\s).,!?:;<])/g, '$1<i>$2</i>')
  s = s.replace(/(^|[\s(>])~([^\s~][^~\n]*?)~(?=$|[\s).,!?:;<])/g, '$1<s>$2</s>')
  s = s.replace(/@(\d{6,})/g, '<span class="mn">@$1</span>')
  s = s.replace(/(https?:\/\/[^\s<]+)/g, '<span class="lk">$1</span>')
  return s
}
const plainOf = doc.plainOf
const cut = doc.cut
const fmt = (n) => Math.floor(Number(n) || 0).toLocaleString('id-ID')
// ikon FA dari emoji / nama; tidak pernah emoji
const ficon = (x, fb = '') => fa.icon(x, 'fi', fb)

// ---------------------------------------------------------------- CSS
const CSS = `
:root{--ink:#fff;--muted:#a8a3bd;--a:#7c5cff;--b:#00d4ff;--g3:#ff5ecb;--deep:#0d0a16;--sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--line:rgba(255,255,255,.1)}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);-webkit-font-smoothing:antialiased}
.wrap{display:flex;justify-content:center;padding:10px}
.card{position:relative;width:100%;max-width:346px;border-radius:26px;overflow:hidden;background:var(--deep);box-shadow:0 26px 56px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.1);user-select:text;-webkit-user-select:text}
.fi{width:1em;height:1em;fill:currentColor;flex:none;vertical-align:-.14em}
.card::after{content:'';position:absolute;inset:0;border-radius:26px;pointer-events:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 0 50px rgba(255,255,255,.025);z-index:4}
.bg{position:absolute;inset:-30%;width:160%;height:160%;object-fit:cover;filter:blur(38px) saturate(1.6);opacity:.78}
.banner{position:relative;z-index:2;width:100%;display:block;border-radius:16px;overflow:hidden;margin-bottom:12px;box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08)}
.banner img{width:100%;display:block;object-fit:cover;max-height:168px}
.banner .bncap{position:absolute;left:0;right:0;bottom:0;padding:10px 12px 8px;background:linear-gradient(180deg,transparent,rgba(8,5,14,.92));font:700 12.5px var(--sys);letter-spacing:.2px}
.banner .bncap b{display:block;font-size:14.5px;background:linear-gradient(90deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.banner .bncap span{color:var(--muted);font-weight:600}
.orb{position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;animation:drift 9s ease-in-out infinite alternate}
.o1{width:220px;height:220px;right:-72px;top:-84px;background:var(--a);opacity:.55}
.o2{width:200px;height:200px;left:-86px;bottom:-72px;background:var(--b);opacity:.34;animation-delay:-3s}
.o3{width:130px;height:130px;left:42%;top:38%;background:var(--g3);opacity:.14;animation-delay:-6s}
.veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,10,22,.46) 0%,rgba(12,8,18,.8) 36%,rgba(9,6,13,.97) 100%)}
.grid{position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:26px 26px;-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 55%);mask-image:linear-gradient(180deg,#000 0%,transparent 55%)}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.3px);background-size:14px 14px}
.topline{position:absolute;left:0;right:0;top:0;height:3px;z-index:3;background:linear-gradient(90deg,var(--a),var(--b),var(--g3),var(--a));background-size:300% 100%;animation:slide 7s linear infinite}
.sp{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;opacity:0;pointer-events:none;box-shadow:0 0 8px 2px rgba(255,255,255,.65);animation:tw 3.6s ease-in-out infinite}
.s1{left:12%;top:9%}.s2{left:86%;top:20%;animation-delay:-1.2s}.s3{left:70%;top:62%;animation-delay:-2.1s}.s4{left:24%;top:78%;animation-delay:-.6s}.s5{left:92%;top:88%;animation-delay:-2.8s}
.content{position:relative;padding:18px 16px 14px;z-index:2}
.head{display:flex;align-items:center;gap:12px;margin-bottom:13px}
.ico{position:relative;z-index:0;width:50px;height:50px;flex:none;border-radius:17px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 10px 22px rgba(0,0,0,.45);animation:pulse 3.2s ease-in-out infinite}
.ico .fi{width:25px;height:25px;color:#fff;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))}
.ico::before{content:'';position:absolute;inset:-4px;border-radius:21px;z-index:-1;border:1px solid rgba(255,255,255,.22);box-shadow:0 0 28px var(--a)}
.ico::after{content:'';position:absolute;inset:0;border-radius:17px;background:linear-gradient(150deg,rgba(255,255,255,.38),transparent 55%);pointer-events:none}
.ht{min-width:0;flex:1}
.eyebrow{display:flex;align-items:center;gap:5px;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eyebrow .fi{width:10px;height:10px;color:var(--b)}
.title{font-size:18px;font-weight:800;line-height:1.22;word-break:break-word;margin-top:2px;background:linear-gradient(90deg,#fff 30%,#e0d9ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.badge{flex:none;display:flex;align-items:center;font-size:9.5px;font-weight:800;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);letter-spacing:.06em;text-transform:uppercase}
.badge::before{content:'';width:6px;height:6px;border-radius:50%;margin-right:6px;background:var(--b);box-shadow:0 0 8px var(--b);animation:bl 1.8s infinite}
.tone{display:flex;align-items:center;gap:11px;margin-bottom:12px;padding:10px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(90deg,var(--tb),rgba(255,255,255,.03));position:relative;overflow:hidden}
.tone::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--tc);box-shadow:0 0 14px var(--tc)}
.tone .tic{width:32px;height:32px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--tc);box-shadow:0 6px 14px rgba(0,0,0,.35)}
.tone .tic .fi{width:17px;height:17px;color:#0b0716}
.tone .tx{min-width:0}
.tone .tl{font-size:12.5px;font-weight:800;letter-spacing:.02em}
.tone .ts{font-size:10.5px;color:#d9d3ea;margin-top:1px;line-height:1.35}
.t-ok{--tc:#34d399;--tb:rgba(52,211,153,.18)}.t-err{--tc:#fb7185;--tb:rgba(251,113,133,.18)}.t-warn{--tc:#fbbf24;--tb:rgba(251,191,36,.18)}.t-denied{--tc:#fb7185;--tb:rgba(251,113,133,.18)}.t-usage{--tc:#a78bfa;--tb:rgba(167,139,250,.2)}.t-gold{--tc:#fbbf24;--tb:rgba(251,191,36,.18)}
.h-gold{--h:#fbbf24;--hb:rgba(251,191,36,.17)}.h-sky{--h:#60a5fa;--hb:rgba(96,165,250,.17)}.h-vio{--h:#a78bfa;--hb:rgba(167,139,250,.17)}.h-rose{--h:#fb7185;--hb:rgba(251,113,133,.17)}.h-mint{--h:#34d399;--hb:rgba(52,211,153,.17)}.h-amber{--h:#fb923c;--hb:rgba(251,146,60,.17)}.h-cyan{--h:#22d3ee;--hb:rgba(34,211,238,.17)}.h-pink{--h:#f472b6;--hb:rgba(244,114,182,.17)}.h-slate{--h:#94a3b8;--hb:rgba(148,163,184,.15)}
.body{display:flex;flex-direction:column;gap:10px}
.body>*{animation:up .55s cubic-bezier(.2,.8,.2,1) both}
.body>*:nth-child(2){animation-delay:.05s}.body>*:nth-child(3){animation-delay:.1s}.body>*:nth-child(4){animation-delay:.15s}.body>*:nth-child(5){animation-delay:.2s}.body>*:nth-child(6){animation-delay:.25s}.body>*:nth-child(7){animation-delay:.3s}.body>*:nth-child(n+8){animation-delay:.34s}
.panel{background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.035));border:1px solid var(--line);border-radius:17px;padding:3px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.row:last-child{border-bottom:0}
.k{display:flex;align-items:center;min-width:0;font-size:11.5px;color:var(--muted);flex:none;max-width:50%}
.ki{display:inline-flex;align-items:center;justify-content:center;flex:none;width:23px;height:23px;margin-right:8px;border-radius:8px;background:var(--hb,rgba(255,255,255,.1))}
.ki .fi{width:12px;height:12px;color:var(--h,var(--b))}
.kd{flex:none;width:7px;height:7px;margin:0 11px 0 8px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 8px var(--a)}
.v{font-size:13px;font-weight:700;text-align:right;word-break:break-word;min-width:0;font-variant-numeric:tabular-nums}
.v.pos{color:#6ee7b7}.v.neg{color:#fda4af}
.v .fi{width:12px;height:12px;margin:0 2px}
.row.st{flex-direction:column;gap:4px;align-items:stretch}
.row.st .k{max-width:100%}
.row.st .v{text-align:left;font-weight:500;line-height:1.45;padding-left:31px}
.h{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#fff;margin-top:3px}
.h::before{content:'';width:4px;height:14px;border-radius:3px;background:linear-gradient(180deg,var(--a),var(--b));box-shadow:0 0 10px var(--a)}
.h::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.3),transparent)}
.h .fi{width:12px;height:12px;color:var(--b)}
.p{font-size:13px;line-height:1.58;color:#f1ecef;word-break:break-word}
.p b,.v b,.li b{font-weight:700;color:#fff}
.p i,.li i{color:#d6cfd4}
.mn{color:#7dd3fc;font-weight:700}.lk{color:#7dd3fc;word-break:break-all}
.callout{display:flex;gap:10px;align-items:flex-start;font-size:12px;line-height:1.5;color:#f0eaf0;background:linear-gradient(90deg,var(--hb,rgba(255,255,255,.1)),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.1);border-left:3px solid var(--h,var(--a));border-radius:13px;padding:9px 12px}
.callout>.fi{width:15px;height:15px;margin-top:1px;color:var(--h,var(--b))}
.note{font-size:11px;line-height:1.5;color:var(--muted);padding-left:10px;border-left:2px solid rgba(255,255,255,.18);font-style:italic}
.ul,.ol{display:flex;flex-direction:column;gap:3px}
.li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5;padding:6px 8px;border-radius:11px;background:rgba(255,255,255,.045);word-break:break-word}
.li .dot{width:7px;height:7px;border-radius:50%;margin-top:6px;flex:none;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 8px var(--a)}
.li .n{width:23px;height:23px;flex:none;border-radius:8px;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.06));font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.li .n.m{background:none}.li .n.m .fi{width:19px;height:19px}
.li.g1{background:linear-gradient(90deg,rgba(255,210,0,.2),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1px rgba(255,210,0,.25)}
.li.g2{background:linear-gradient(90deg,rgba(200,210,225,.18),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1px rgba(200,210,225,.2)}
.li.g3{background:linear-gradient(90deg,rgba(220,140,80,.2),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1px rgba(220,140,80,.22)}
.code{position:relative;font-family:var(--mono);font-size:11.5px;line-height:1.5;background:rgba(0,0,0,.42);border:1px solid var(--line);border-left:3px solid var(--b);border-radius:13px;padding:9px 11px;white-space:pre-wrap;word-break:break-all;color:#e8e2ff}
code{font-family:var(--mono);font-size:.92em;background:rgba(255,255,255,.12);padding:1px 5px;border-radius:5px}
.cmds{display:flex;flex-direction:column;gap:6px}
.cmd{position:relative;font-family:var(--mono);font-size:12px;font-weight:700;background:linear-gradient(90deg,rgba(0,0,0,.42),rgba(0,0,0,.22));border:1px solid var(--line);border-radius:13px;padding:8px 10px 8px 30px;word-break:break-word;color:#fff}
.cmd .fi{position:absolute;left:10px;top:11px;width:12px;height:12px;color:var(--b)}
.cmd small{display:block;font-family:var(--sys);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:2px;font-weight:700}
.pb{display:flex;flex-direction:column;gap:6px;padding:9px 0}
.pb .t{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted)}
.pb .t b{color:#fff;font-size:12px}
.tr{height:9px;border-radius:9px;background:rgba(255,255,255,.14);overflow:hidden}
.fl{position:relative;overflow:hidden;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--a),var(--b));animation:grow 1.1s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 0 12px var(--a)}
.fl::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:shine 2.6s ease-in-out infinite 1.1s}
.hero{position:relative;overflow:hidden;text-align:center;padding:17px 8px 15px;background:linear-gradient(160deg,rgba(255,255,255,.11),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.13);border-radius:17px}
.hero::before{content:'';position:absolute;left:50%;top:-40%;width:170px;height:170px;margin-left:-85px;border-radius:50%;background:var(--a);opacity:.3;filter:blur(40px)}
.hero .s{position:relative;font-size:11px;color:var(--muted);margin-bottom:5px;word-break:break-word}
.hero .big{position:relative;font-size:29px;font-weight:800;line-height:1.2;word-break:break-word;background:linear-gradient(90deg,#fff,var(--b));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px var(--a))}
.reel{display:flex;align-items:center;justify-content:center;gap:12px;padding:15px 0;background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03));border:1px solid var(--line);border-radius:17px;box-shadow:inset 0 0 24px rgba(0,0,0,.3)}
.reel .fi{width:34px;height:34px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tile{position:relative;overflow:hidden;background:linear-gradient(160deg,rgba(255,255,255,.11),rgba(255,255,255,.04));border:1px solid var(--line);border-radius:16px;padding:10px 11px;min-width:0}
.tile::before{content:'';position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,var(--h,var(--a)),transparent)}
.tile .tl{display:flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.tile .tl .fi{width:11px;height:11px;color:var(--h,var(--b))}
.tile .tv{font-size:16px;font-weight:800;margin-top:4px;word-break:break-word;font-variant-numeric:tabular-nums}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.1);border:1px solid var(--line);white-space:nowrap}
.chip .fi{width:11px;height:11px;color:var(--b);margin-right:5px}
.chip.m{font-family:var(--mono);font-weight:700}
.cl{display:flex;flex-direction:column}
.ci{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.ci:last-child{border-bottom:0}
.ci .e{width:31px;height:31px;border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.17),rgba(255,255,255,.05));display:flex;align-items:center;justify-content:center;flex:none}
.ci .e .fi{width:15px;height:15px;color:var(--b)}
.ci .tx{min-width:0;flex:1}
.ci .c{font-family:var(--mono);font-size:12.5px;font-weight:800}
.ci .d{font-size:10.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ci .go{flex:none;color:var(--b);opacity:.85}.ci .go .fi{width:12px;height:12px}
.sec{background:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.09);border-radius:17px;padding:10px 11px}
.sech{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.sech .e{width:31px;height:31px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 5px 12px rgba(0,0,0,.35)}
.sech .e .fi{width:16px;height:16px;color:#fff}
.sech .n{font-size:12.5px;font-weight:800;flex:1}
.sech .c{font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.13)}
.pf{display:flex;align-items:center;gap:13px}
.avr{position:relative;z-index:0;padding:3px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--b));flex:none;box-shadow:0 0 22px var(--a)}
.avr::before{content:'';position:absolute;inset:-3px;border-radius:50%;z-index:-1;background:conic-gradient(from 0deg,var(--a),transparent 35%,var(--b),transparent 75%,var(--a));animation:spin 5s linear infinite}
.av{width:62px;height:62px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;background:#1b1530;border:3px solid var(--deep)}
.pf .nm{font-size:18px;font-weight:800;line-height:1.2;word-break:break-word}
.pf .sb{font-size:10.5px;color:var(--muted);margin-top:3px}
.sb .fi,.gr .fi{width:11px;height:11px;margin-right:3px;color:var(--b)}
.gauges{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.g{text-align:center}
.ring{position:relative;width:80px;height:80px;margin:0 auto 7px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--c) calc(var(--p)*1%),rgba(255,255,255,.12) 0);box-shadow:0 0 22px rgba(0,0,0,.35)}
.ring::before{content:'';position:absolute;inset:7px;border-radius:50%;background:#15101f}
.ring span{position:relative;font-size:16px;font-weight:800}
.g .gl{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:800}
.g .gl .fi{width:11px;height:11px;color:var(--c)}
.g .gs{font-size:9.5px;color:var(--muted);margin-top:1px}
.pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;padding-top:6px}
.pc{flex:1;text-align:center;min-width:0}
.pc .md{line-height:1;animation:fl 3s ease-in-out infinite}.pc .md .fi{width:30px;height:30px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.45))}
.pc .pn{font-size:11.5px;font-weight:800;margin:5px 2px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pc .bl{border-radius:14px 14px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:8px;font-size:21px;font-weight:800;color:#12070b;box-shadow:0 -4px 18px rgba(255,255,255,.12)}
.pc .bl small{font-size:9px;font-weight:800;letter-spacing:.08em;margin-top:2px;opacity:.75}
.meta{margin-top:12px;padding:10px 10px 8px;border-radius:16px;background:rgba(0,0,0,.26);border:1px solid rgba(255,255,255,.08)}
.meta .mh{display:flex;align-items:center;gap:7px;font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.meta .mh .fi{width:11px;height:11px;color:var(--b)}
.meta .mh::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.2),transparent)}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.mi{display:flex;align-items:center;gap:8px;min-width:0;padding:6px 8px;border-radius:11px;background:rgba(255,255,255,.05)}
.mi .ki{margin:0;width:22px;height:22px}
.mi .mt{min-width:0}
.mi i{display:block;font-style:normal;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.mi b{display:block;font-size:11.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.foot{margin-top:12px;text-align:center;font-size:10px;color:var(--muted);line-height:1.7;letter-spacing:.03em}
.foot::before{content:'';display:block;height:1px;margin:0 18px 9px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent)}
.foot .fi{width:10px;height:10px;margin:0 4px;color:var(--b)}
.pgn{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px}
.pgb{min-width:42px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.12);color:#fff;font-size:17px;font-weight:700;cursor:pointer;font-family:var(--sys);padding:0 6px}
.pgb:active{transform:scale(.93);background:rgba(255,255,255,.26)}
.pgb:disabled{opacity:.28}
.pgi{font-size:12px;color:var(--muted);min-width:58px;text-align:center;font-variant-numeric:tabular-nums}
@keyframes up{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes grow{from{width:0}}
@keyframes shine{to{left:130%}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slide{to{background-position:-300% 0}}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(20px,-16px) scale(1.16)}}
@keyframes pulse{50%{transform:scale(1.06)}}
@keyframes tw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:.95;transform:scale(1.25)}}
@keyframes fl{50%{transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

// tambahan khusus kartu menu interaktif
const CSS_APP = `
.card.app .content{padding:14px 14px 12px}
.top{display:flex;align-items:center;gap:8px;margin-bottom:11px}
.bk{width:36px;height:36px;flex:none;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.14);color:#fff;cursor:pointer;font-family:var(--sys);padding:0;display:flex;align-items:center;justify-content:center}
.bk .fi{width:15px;height:15px}
.bk:active{transform:scale(.93)}
.srw{position:relative;flex:1;min-width:0}
.srw .fi{position:absolute;left:12px;top:11px;width:14px;height:14px;color:var(--muted);pointer-events:none}
.sr{width:100%;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.34);color:#fff;font-size:13px;padding:0 13px 0 34px;outline:0;font-family:var(--sys)}
.sr:focus{border-color:var(--a);box-shadow:0 0 0 3px rgba(255,255,255,.07)}
.sr::placeholder{color:#8f878d}
.scr{display:flex;flex-direction:column;gap:10px;animation:up .4s cubic-bezier(.2,.8,.2,1) both}
.tp{cursor:pointer;-webkit-user-select:none;user-select:none;transition:transform .12s,opacity .12s}
.tp:active{opacity:.72;transform:scale(.975)}
.app .av{width:52px;height:52px;font-size:20px}
.app .pf .nm{font-size:17px}
.app .pf .sb{margin-top:2px}
.chev{flex:none;padding-right:2px;color:var(--muted)}.chev .fi{width:14px;height:14px}
.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#2dd4bf;margin-right:6px;box-shadow:0 0 8px #2dd4bf;animation:bl 1.4s infinite}
@keyframes bl{50%{opacity:.25}}
.hb{position:relative;overflow:hidden;border-radius:19px;padding:13px 13px 11px;background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14)}
.hb::before{content:'';position:absolute;right:-50px;top:-60px;width:170px;height:170px;border-radius:50%;background:var(--a);opacity:.34;filter:blur(36px)}
.hb>*{position:relative}
.gr{font-size:11px;color:#e9e3f3;letter-spacing:.02em;min-height:14px}
.gr b{color:var(--b)}
.lvp{display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:1px 8px;border-radius:99px;font-size:9.5px;font-weight:800;background:linear-gradient(135deg,var(--a),var(--b));color:#0b0716;vertical-align:2px}
.tiles3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.tile.k3{position:relative;overflow:hidden;text-align:center;padding:12px 4px 9px;background:linear-gradient(165deg,rgba(255,255,255,.13),rgba(255,255,255,.03))}
.tile.k3::before{content:'';position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,var(--a),var(--b))}
.k3 .ce{width:42px;height:42px;margin:0 auto 7px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 6px 14px rgba(0,0,0,.4);animation:fl 3.4s ease-in-out infinite}
.k3 .ce .fi{width:21px;height:21px;color:#fff;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
.tiles3 .k3:nth-child(2n) .ce{animation-delay:-1s}.tiles3 .k3:nth-child(3n) .ce{animation-delay:-2s}
.k3 .tt{font-size:10.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 3px}
.k3 .tc{font-size:9.5px;color:#d9d2ff;margin-top:2px}
.hot{position:absolute;right:6px;top:8px}.hot .fi{width:12px;height:12px;color:#fb923c}
.bigbtn{display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;font-size:13px;font-weight:800;padding:12px 0;border-radius:16px;background:linear-gradient(135deg,var(--a),var(--b));color:#10081a;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.bigbtn .fi{width:15px;height:15px}
.legal{margin-top:4px;padding:11px 13px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.32);text-align:center}
.legal .lt{display:flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--a)}
.legal .lt .fi{width:13px;height:13px}
.legal .lu{margin-top:5px;font-size:12px;font-weight:700;word-break:break-all;user-select:text}
.legal .lg{margin-top:6px;padding-left:8px;border-left:3px solid var(--a);text-align:left;font-size:11px;font-weight:700;opacity:.85}
.rnd{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px dashed rgba(255,255,255,.24)}
.rnd .e{animation:fl 2.8s ease-in-out infinite}.rnd .e .fi{width:22px;height:22px;color:#fcd34d}
.rnd .tx{min-width:0;flex:1}
.rnd .t1{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
.rnd .t2{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:13px;font-weight:800;margin-top:1px}.rnd .t2 .fi{width:13px;height:13px;color:var(--b)}
.rnd .t3{font-size:10.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dice{flex:none;width:34px;height:34px;border-radius:11px;border:0;background:rgba(255,255,255,.16);cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center}.dice .fi{width:16px;height:16px}
.dice:active{transform:rotate(180deg) scale(.9)}
.catrow{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:15px;background:linear-gradient(90deg,rgba(255,255,255,.09),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.08)}
.catrow .ce{width:39px;height:39px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex:none;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 5px 12px rgba(0,0,0,.35)}
.catrow .ce .fi{width:19px;height:19px;color:#fff}
.catrow .tx{min-width:0;flex:1}
.catrow .n{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:800}.catrow .n .fi{width:11px;height:11px;color:#fb923c}
.catrow .d{font-size:10.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.catrow .bar{height:4px;border-radius:4px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}
.catrow .bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--a),var(--b));animation:grow 1s cubic-bezier(.2,.8,.2,1) both}
.catrow .cnt{flex:none;font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.13)}
.cathead{position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)}
.cathead::before{content:'';position:absolute;right:-40px;top:-50px;width:150px;height:150px;border-radius:50%;background:var(--a);opacity:.3;filter:blur(34px)}
.cathead>*{position:relative}
.cathead .ce{width:52px;height:52px;border-radius:17px;display:flex;align-items:center;justify-content:center;flex:none;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 8px 18px rgba(0,0,0,.4);animation:pulse 3s ease-in-out infinite}
.cathead .ce .fi{width:26px;height:26px;color:#fff}
.cathead .n{font-size:16px;font-weight:800}
.cathead .d{font-size:10.5px;color:#d9d2e8;margin-top:2px;line-height:1.35}
.hl{background:linear-gradient(135deg,var(--a),var(--b));color:#0b0716;border-radius:4px;padding:0 2px}
.tabs{display:flex;gap:4px;margin-top:12px;padding:5px;background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.1);border-radius:20px}
.tab{flex:1;text-align:center;padding:7px 0 6px;border-radius:15px;font-size:9.5px;font-weight:800;letter-spacing:.02em;color:var(--muted);cursor:pointer;transition:background .2s,color .2s}
.tab .ti{display:block;line-height:1;margin-bottom:3px}.tab .ti .fi{width:17px;height:17px}
.tab:active{transform:scale(.95)}
.tab.on{background:linear-gradient(135deg,var(--a),var(--b));color:#0b0716;box-shadow:0 6px 16px rgba(0,0,0,.4)}
.empty{text-align:center;color:var(--muted);font-size:12px;padding:26px 0}.empty .fi{display:block;margin:0 auto 8px;width:26px;height:26px;color:var(--b)}
.toast{position:absolute;left:14px;right:14px;bottom:78px;background:rgba(20,16,30,.97);border:1px solid rgba(255,255,255,.2);border-radius:13px;padding:10px 12px;font-size:12px;text-align:center;opacity:0;transform:translateY(8px);transition:.2s;pointer-events:none;z-index:5;box-shadow:0 10px 24px rgba(0,0,0,.5)}
.toast.on{opacity:1;transform:none}
.bgmwrap{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14)}
.bgmwrap .bgmlabel{flex:none;font-size:10.5px;font-weight:800;letter-spacing:.02em;white-space:nowrap}
.bgmwrap audio{flex:1;min-width:0;height:32px}
`

// ---------------------------------------------------------------- script kecil di dalam kartu
// uptime berjalan (elemen dengan data-up="detik awal")
const LIVE_JS = `(function(){function f(s){s=Math.floor(s);var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;return [d&&d+' hari',h&&h+' jam',m&&m+' menit',x+' detik'].filter(Boolean).join(' ')}var t0=Date.now();function tick(){document.querySelectorAll('[data-up]').forEach(function(e){var b=Number(e.getAttribute('data-up'))||0;e.textContent=f(b+(Date.now()-t0)/1000)})}tick();setInterval(tick,1000)})();`

// pager otomatis: isi kartu yang tinggi dipecah jadi halaman (pengganti scroll)
const PAGER_JS = `(function(){
var b=document.querySelector('[data-pager]');if(!b)return;
var MAX=Number(b.getAttribute('data-pager'))||440,GAP=10;
function h(k){return k.offsetHeight+GAP}
function split(k){
  if(k.offsetHeight<=MAX||k.children.length<2)return [k];
  var kids=[].slice.call(k.children),hs=kids.map(h),out=[],cur=null,ch=0;
  kids.forEach(function(c,i){
    if(!cur||(ch+hs[i]>MAX&&cur.children.length)){cur=k.cloneNode(false);out.push(cur);ch=0}
    cur.appendChild(c);ch+=hs[i]
  });
  out.forEach(function(o){b.insertBefore(o,k)});b.removeChild(k);return out
}
var items=[];[].slice.call(b.children).forEach(function(k){items=items.concat(split(k))});
var pages=[],cur=[],ch=0;
items.forEach(function(k){var kh=h(k);if(cur.length&&ch+kh>MAX){pages.push(cur);cur=[];ch=0}cur.push(k);ch+=kh});
if(cur.length)pages.push(cur);
if(pages.length<2)return;
var i=0,nav=document.createElement('div');nav.className='pgn';
nav.innerHTML='<button class="pgb" data-a="-1">\\u2039</button><span class="pgi"></span><button class="pgb" data-a="1">\\u203a</button>';
b.parentNode.insertBefore(nav,b.nextSibling);
var bs=nav.querySelectorAll('button'),lab=nav.querySelector('.pgi');
function show(n){i=Math.max(0,Math.min(pages.length-1,n));pages.forEach(function(p,x){p.forEach(function(k){k.style.display=x===i?'':'none'})});lab.textContent=(i+1)+' / '+pages.length;bs[0].disabled=i===0;bs[1].disabled=i===pages.length-1}
nav.addEventListener('click',function(e){var t=e.target.closest?e.target.closest('button'):null;if(t&&!t.disabled)show(i+Number(t.getAttribute('data-a')))});
show(0)})();`

const APP_JS = fs.readFileSync(path.join(__dirname, 'richui.client.js'), 'utf8')

const parseUptime = (v) => {
  const m = String(v).match(/^\s*(?:(\d+)\s*hari)?\s*(?:(\d+)\s*jam)?\s*(?:(\d+)\s*menit)?\s*(?:(\d+)\s*detik)\s*$/i)
  return m ? (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : null
}

// ---------------------------------------------------------------- cangkang kartu
const accentStyle = (acc) => {
  const t = theme().rich()
  return `--a:${acc[0]};--b:${acc[1]};--ac:${acc[0]};--g3:${t.glow[2]};--deep:${t.deep}`
}

// dekorasi latar bersama: garis atas berjalan, 3 cahaya melayang, kisi halus, butiran, kilau bintang
const DECOR = '<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div class="veil"></div><div class="grid"></div><div class="grain"></div><div class="topline"></div><i class="sp s1"></i><i class="sp s2"></i><i class="sp s3"></i><i class="sp s4"></i><i class="sp s5"></i>'

// semua teks yang akan tampil -> escape + emoji jadi ikon FA
const T = (s) => fa.html(esc(s))

// shell({ icon (emoji / nama FA), eyebrow, title, badge, body, banner(html), meta(html), accent, image, foot, pager, script })
function shell({ icon = 'sparkles', eyebrow = '', title = '', badge = '', body = '', banner = '', meta = '', accent = TONES.info, image = '', foot, pager = false, script = '', cat = '' } = {}) {
  const brand = OPTS.brand
  const footer = foot === undefined ? OPTS.footer || brand : foot
  const scripts = [script, /data-up=/.test(body) ? LIVE_JS : '', pager ? PAGER_JS : ''].filter(Boolean).join('\n')
  const eb = [brand, cat ? String(cat).toUpperCase() : ''].filter(Boolean)
  return fa.withSprite(`<style>${CSS}${CSS_APP}${theme().rich().css || ''}</style>
<div class="wrap"><div class="card" style="${accentStyle(accent)}">
${image ? `<img class="bg" src="${esc(image)}" alt="">` : ''}${DECOR}
<div class="content">
${title ? `<div class="head"><div class="ico">${ficon(icon, 'sparkles') || ficon('sparkles')}</div><div class="ht"><div class="eyebrow">${eyebrow ? T(eyebrow) : eb.map((x) => esc(x)).join(' &bull; ')}</div><div class="title">${T(title)}</div></div>${badge ? `<div class="badge">${T(badge)}</div>` : ''}</div>` : ''}
${banner}
<div class="body"${pager ? ' data-pager="440"' : ''}>${fa.htmlText(body)}</div>
${meta}
${footer ? `<div class="foot">${T(footer)}</div>` : ''}
</div></div></div>${scripts ? `<script>${scripts}</script>` : ''}`)
}

// ---------------------------------------------------------------- potongan HTML reusable
const LEAD = /^((?:\p{Extended_Pictographic}️?\s*)+)/u
const kvLabel = (r) => String(r.k).replace(LEAD, '')
const POS = /^(aktif|on|ya|berhasil|sukses|online|tersedia|ok|normal|lunas|terverifikasi|sudah|menyala|dibuka|buka)$/i
const NEG = /^(nonaktif|tidak aktif|mati|off|tidak|gagal|offline|error|lambat|belum|ditutup|tutup|kosong|expired)$/i

// -> { fa, hue }  ikon FA (dari emoji di depan kunci, atau tebakan nama kunci) + warna
function kvIcon(r) {
  if (r.noIcon) return { fa: '', hue: 'slate' }
  const guess = doc.keyIcon(kvLabel(r))
  const m = String(r.k).match(LEAD)
  if (m) {
    const name = fa.nameOf(m[1].trim().replace(/\s+.*/, ''))
    if (name && !['circle', 'minus'].includes(name)) return { fa: name, hue: guess.hue }
  }
  return guess
}

const H = {
  rows(rows) {
    if (!rows.length) return ''
    return `<div class="panel">${rows
      .map((r) => {
        const long = plainOf(r.v).length > 34 || plainOf(r.k).length > 22
        const up = /^uptime$/i.test(r.k) ? parseUptime(r.v) : null
        const val = r.raw ? r.v : up !== null ? `<span data-up="${up}">${esc(r.v)}</span>` : inline(r.v)
        const ic = kvIcon(r)
        const pv = plainOf(r.v)
        const cls = POS.test(pv) ? ' pos' : NEG.test(pv) ? ' neg' : ''
        const chip = ic.fa ? `<span class="ki h-${ic.hue}">${ficon(ic.fa)}</span>` : '<span class="kd"></span>'
        return `<div class="row${long && !r.raw && up === null ? ' st' : ''}"><div class="k">${chip}${inline(kvLabel(r))}</div><div class="v${cls}">${val}</div></div>`
      })
      .join('')}</div>`
  },
  // tile angka: items [{ l, v, fa?, hue? }]
  tiles(items) {
    return `<div class="tiles">${items.map((t) => `<div class="tile h-${t.hue || 'cyan'}"><div class="tl">${t.fa ? ficon(t.fa) : ''}${T(t.l)}</div><div class="tv">${T(t.v)}</div></div>`).join('')}</div>`
  },
  bar(label, pct, right = '') {
    pct = Math.max(0, Math.min(100, Number(pct) || 0))
    return `<div class="pb"><div class="t"><span>${inline(label)}</span><span><b>${pct}%</b>${right ? ` · ${esc(right)}` : ''}</span></div><div class="tr"><div class="fl" style="width:${pct}%"></div></div></div>`
  },
  head: (t) => `<div class="h">${inline(t)}</div>`,
  p: (t) => `<div class="p">${inline(t)}</div>`,
  callout: (t, fname = 'lightbulb', hue = 'amber') => `<div class="callout h-${hue}">${ficon(fname)}<div>${inline(t)}</div></div>`,
  chips: (arr, mono) => `<div class="chips">${arr.map((c) => `<span class="chip${mono ? ' m' : ''}">${T(c)}</span>`).join('')}</div>`,
  // chip dengan ikon: [{ t, fa }]
  ichips: (arr) => `<div class="chips">${arr.map((c) => `<span class="chip">${c.fa ? ficon(c.fa) : ''}${T(c.t)}</span>`).join('')}</div>`
}

// kv numerik pendek -> tile (maks 4) kalau panel cukup besar
const NUMISH = /^[+\-−]?\s*(rp\s?)?[\d.,]+(\s?(%|[a-zA-Z]{1,6}|jt|rb|dtk|ms|mb|kb|gb))?$/i
function kvToHtml(rows) {
  if (rows.length >= 4) {
    const idx = rows.map((r, i) => (!r.raw && NUMISH.test(plainOf(r.v)) && plainOf(r.v).length <= 14 ? i : -1)).filter((i) => i >= 0)
    if (idx.length >= 3) {
      const pick = idx.slice(0, 4)
      const tiles = pick.map((i) => {
        const ic = kvIcon(rows[i])
        return { l: kvLabel(rows[i]).replace(/[*_]/g, ''), v: plainOf(rows[i].v), fa: ic.fa, hue: ic.hue === 'slate' ? 'cyan' : ic.hue }
      })
      const rest = rows.filter((_, i) => !pick.includes(i))
      return H.tiles(tiles) + (rest.length ? H.rows(rest) : '')
    }
  }
  return H.rows(rows)
}

// callout: emoji pembuka -> ikon & warna
const CALLOUT = { '💡': ['lightbulb', 'amber'], '⚠': ['triangle-exclamation', 'amber'], 'ℹ': ['circle-info', 'sky'], '📌': ['thumbtack', 'rose'], '❗': ['circle-exclamation', 'rose'], '✨': ['wand-magic-sparkles', 'vio'], '📂': ['folder-open', 'sky'], '🔔': ['bell', 'amber'] }

// ---------------------------------------------------------------- BLOK -> HTML
const RE = doc.RE
function renderBlocks(blocks, { ranking = false } = {}) {
  return blocks
    .map((b) => {
      switch (b.t) {
        case 'kv':
          return kvToHtml(b.rows)
        case 'h': {
          const lead = String(b.text).match(LEAD)
          const ic = lead ? fa.nameOf(lead[1].trim()) : ''
          return `<div class="h">${ic ? ficon(ic) : ''}${inline(String(b.text).replace(LEAD, ''))}</div>`
        }
        case 'p': {
          const t = b.text
          const c = t.match(RE.callout)
          if (c) {
            const [fname, hue] = CALLOUT[fa.norm(c[1])] || ['circle-info', 'sky']
            return H.callout(t.replace(RE.callout, '').replace(/^\s+/, '').replace(/\n/g, ' '), fname, hue)
          }
          return `<div class="p">${t.split('\n').map(inline).join('<br>')}</div>`
        }
        case 'note':
          return `<div class="note">${inline(b.text)}</div>`
        case 'code':
          return `<div class="code">${esc(b.text)}</div>`
        case 'cmds':
          return `<div class="cmds">${b.rows.map((r) => `<div class="cmd">${ficon('terminal')}${r.label ? `<small>${esc(r.label)}</small>` : ''}${esc(r.text)}</div>`).join('')}</div>`
        case 'bar':
          return `<div class="panel">${H.bar(b.label, b.pct)}</div>`
        case 'hero':
          return `<div class="hero"><div class="s">${inline(b.sub)}</div><div class="big">${esc(b.big)}</div></div>`
        case 'reel':
          return `<div class="reel">${[...b.text.matchAll(fa.EMOJI_RE)].map((m) => fa.html(m[0])).join('')}</div>`
        case 'ul':
          return `<div class="ul">${b.rows.map((r) => `<div class="li"><span class="dot"></span><div>${inline(r.text)}</div></div>`).join('')}</div>`
        case 'ol':
          return `<div class="ol">${b.rows
            .map((r, i) => {
              const medal = ranking && b.rows.length >= 3 && i < 3 && r.n === i + 1
              const mic = medal ? fa.html(['🥇', '🥈', '🥉'][i]) : ''
              return `<div class="li${medal ? ` g${i + 1}` : ''}"><span class="n${medal ? ' m' : ''}">${medal ? mic : r.n}</span><div>${inline(r.text)}</div></div>`
            })
            .join('')}</div>`
        default:
          return ''
      }
    })
    .join('')
}

// ---------------------------------------------------------------- konteks -> ikon / warna / judul
const TONE_BADGE = { ok: 'Berhasil', err: 'Gagal', warn: 'Peringatan', denied: 'Ditolak', usage: 'Cara pakai', gold: 'Spesial' }
const clock = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false }).slice(0, 5)
const classify = doc.classify
const TITLE_HINTS = doc.TITLE_HINTS
const TONE_META = { denied: { icon: '🔒', title: 'Akses Ditolak' }, err: { icon: '⚠️', title: 'Gagal' }, ok: { icon: '✅', title: 'Berhasil' }, usage: { icon: '💡', title: 'Cara Pakai' } }
const parse = doc.parse

// banner nada di atas isi kartu
function toneBanner(tone) {
  const m = doc.TONE_META[tone]
  if (!m || tone === 'info') return ''
  return `<div class="tone t-${tone}"><div class="tic">${ficon(m.fa)}</div><div class="tx"><div class="tl">${esc(m.label)}</div><div class="ts">${esc(m.sub)}</div></div></div>`
}

// strip "Detail eksekusi" di bawah isi
function metaStrip(meta, prefix) {
  if (!OPTS.meta) return ''
  const rows = doc.detailRows(meta, { prefix })
  if (!rows.length) return ''
  const hues = ['vio', 'sky', 'pink', 'cyan', 'amber', 'mint']
  return `<div class="meta"><div class="mh">${ficon('circle-info')}Detail eksekusi</div><div class="mg">${rows
    .map((r, i) => `<div class="mi h-${hues[i % hues.length]}"><span class="ki">${ficon(r.fa)}</span><div class="mt"><i>${esc(r.k)}</i><b>${T(r.v)}</b></div></div>`)
    .join('')}</div></div>`
}

// panduan lengkap otomatis dari metadata plugin (untuk nada cara pakai / gagal / ditolak)
function guideHtml(meta, prefix, tone) {
  if (!OPTS.meta || !['usage', 'err', 'denied'].includes(tone)) return ''
  const g = doc.guide(meta, prefix)
  if (!g) return ''
  const out = [`<div class="h">${ficon('book-open')}Panduan perintah</div>`]
  out.push(`<div class="cmds"><div class="cmd">${ficon('terminal')}<small>Format</small>${esc(g.format)}</div></div>`)
  const rows = []
  if (g.desc) rows.push({ k: 'Fungsi', v: g.desc })
  rows.push({ k: 'Akses', v: g.access })
  out.push(H.rows(rows.map((r) => ({ ...r, k: r.k }))))
  if (g.aliases.length) out.push(`<div class="chips">${g.aliases.map((a) => `<span class="chip m">${ficon('terminal')}${esc(prefix + a)}</span>`).join('')}</div>`)
  if (tone === 'err') out.push(H.callout(`Periksa format perintah, lalu coba lagi. Ketik *${prefix}cmd ${g.command}* untuk panduan lengkap.`, 'lightbulb', 'amber'))
  if (tone === 'denied') out.push(H.callout(`Perintah ini hanya untuk: *${g.access}*.`, 'lock', 'rose'))
  return out.join('')
}

// text -> HTML kartu lengkap.  meta: { category, command, icon, kind, prefix, t0, name, desc, usage, aliases, ... }
function fromText(text, meta = {}) {
  const prefix = meta.prefix || global.prefix || '.'
  const { title: pTitle, icon: pIcon, status, blocks } = parse(text, { prefix })
  const tone = classify(String(text), { kind: meta.kind, hasTitle: !!pTitle, status })

  let title = pTitle
  let icon = pIcon
  let accent = null
  if (title) {
    const hint = doc.TITLE_FA.find(([re]) => re.test(title))
    if (hint) {
      icon = icon || hint[1]
      if (hint[2]) accent = TONES[hint[2]]
    }
  }
  if (!accent && TONES[tone] && tone !== 'info') accent = TONES[tone]
  if (!accent) accent = meta.category ? catColors(meta.category) : TONES.info

  if (!title) {
    const tm = doc.TONE_META[tone]
    title = tone !== 'info' && tm ? tm.title : doc.titleCase(String(meta.title || meta.command || 'Info').replace(/^./, (c) => c.toUpperCase()))
    if (tone !== 'info' && meta.command) title = doc.titleCase(String(meta.title || meta.command)) // judul = nama fitur, nada ada di banner
  }
  // ikon header: emoji dari teks -> petunjuk judul -> ikon perintah -> ikon kategori -> ikon nada
  const STATUS_EMO = /^(✅|❌|⚠|🚫|📖|💡|⛔|☑|✔|✖|❎|🔒|ℹ)/u
  const pIconUse = pIcon && !STATUS_EMO.test(pIcon) ? pIcon : ''
  const iconFa = (pIconUse && fa.nameOf(pIconUse)) || (icon && fa.has(icon) ? icon : '') || (icon && !STATUS_EMO.test(icon) && fa.nameOf(icon)) || (meta.icon && fa.nameOf(meta.icon)) || fa.CAT[meta.category] || fa.TONE_FA[tone] || 'sparkles'

  const ranking = /TOP|PERINGKAT|LEADERBOARD|JUARA|RANK/i.test(title) || blocks.some((b) => b.t === 'ol' && b.rows.some((r) => /Level \d|Rp[\d.]+/.test(r.text)))
  const bodyHtml = (renderBlocks(blocks, { ranking }) || H.p(String(text))) + guideHtml(meta, prefix, tone)
  // kartu panjang -> dipecah per halaman oleh PAGER_JS (tanpa scroll)
  const long = blocks.length > 8 || String(text).length > 600
  const secs = doc.secsOf(meta)
  const foot = [OPTS.footer || OPTS.brand].filter(Boolean).join('')
  const badge = TONE_BADGE[tone] || (meta.category && String(meta.category).length <= 8 ? String(meta.category).toUpperCase() : '')
  return {
    html: shell({ icon: iconFa, cat: meta.category, title, body: bodyHtml, banner: toneBanner(tone), meta: metaStrip(meta, prefix), accent, pager: long, badge, foot }),
    label: `${title}`,
    tone,
    secs
  }
}

// ---------------------------------------------------------------- KIRIM
// Payload richResponseMessage TIDAK boleh dikirim sebagai satu stanza saja.
// Fork Baileys yang dipakai bot ini mendokumentasikan (dan commit 28ec064 membuktikan
// secara live untuk kartu game): klien Android perlu pesan utama + stanza kedua
// protocolMessage type 14 yang juga dibungkus botForwardedMessage. Payload lama
// Hitoshi/vanXone hanya mengirim satu stanza → server meng-ack, relay resolve,
// tetapi kartu tidak pernah dirender (hasilnya: pesan hening).
// AIRich dari fork melakukan dua stanza itu, menambahkan botMessageSharingInfo,
// dan meng-escape Unicode unifiedResponse. Kita pakai builder itu di sini agar
// SEMUA kartu (menu, .uimode rich, game HTML) memakai jalur yang sama.
const SAFE_RICH_WIRE_BYTES = 900 * 1024 // fork: HTML_APP_BYTE_LIMIT 960KB, pesan >1MB dibuang klien (hening)
function richWireBytes(html) {
  return Buffer.byteLength(
    JSON.stringify(String(html)).replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')),
    'utf8'
  )
}
function relayReceiptId(value) {
  if (typeof value === 'string') return value.trim() || ''
  if (value && typeof value === 'object') {
    const id = value.key?.id || value.id || value.messageId
    return id ? String(id) : ''
  }
  return ''
}

// Fork Baileys yang dipasang hanya menyuntik <biz> otomatis untuk interactive/buttons/list
// (src/Socket/messages-send.js) dan normalizeMessageContent()-nya tidak membuka
// botForwardedMessage. AI Rich butuh biz -> interactive native_flow (v:9, name:mixed)
// supaya klien menyimpan kartu sebagai pesan rich. Edit type 14 hanya memberi render
// live; tanpa biz node inilah kartu hilang saat chat dibuka ulang.
function richBizNode() {
  return {
    tag: 'biz',
    attrs: {
      actual_actors: '2',
      host_storage: '2',
      privacy_mode_ts: String(Math.floor(Date.now() / 1000)),
    },
    content: [{
      tag: 'interactive',
      attrs: { type: 'native_flow', v: '1' },
      content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
    }],
  }
}

// AIRich.send() memanggil sock.relayMessage dua kali (main + edit). Bungkus client
// dengan proxy agar kedua stanza itu dapat biz node tanpa mengubah fork/node_modules.
function withRichBizClient(sock) {
  if (!sock || typeof sock.relayMessage !== 'function') {
    throw new TypeError('[richui] withRichBizClient butuh socket dengan relayMessage')
  }
  if (sock.__richBizWrapped === true) return sock
  const client = Object.create(sock)
  Object.defineProperty(client, '__richBizWrapped', { value: true, enumerable: false })
  client.relayMessage = async (jid, message, options = {}) => {
    const nodes = Array.isArray(options.additionalNodes) ? options.additionalNodes.slice() : []
    if (!nodes.some((node) => node?.tag === 'biz')) nodes.push(richBizNode())
    return sock.relayMessage(jid, message, { ...options, additionalNodes: nodes })
  }
  return client
}

async function sendHtml(sock, jid, html, label = 'kureza') {
  const responseId = randomUUID()
  // jaring pengaman: kartu apa pun yang lewat sini tidak boleh membawa emoji (kecuali di dalam <script>/<style>)
  html = scrub(html)
  const wire = richWireBytes(html)
  if (wire > SAFE_RICH_WIRE_BYTES) {
    throw new Error(`[richui] kartu ${Math.round(wire / 1024)}KB melebihi batas aman ${Math.round(SAFE_RICH_WIRE_BYTES / 1024)}KB`)
  }

  let AIRich = null
  try {
    AIRich = require('@whiskeysockets/baileys').MessageBuilder?.AIRich
  } catch (err) {
    throw new Error(`[richui] MessageBuilder.AIRich tidak tersedia: ${err && err.message}`)
  }
  if (!AIRich) throw new Error('[richui] MessageBuilder.AIRich tidak tersedia pada fork Baileys ini')

  const rich = new AIRich(sock, { dynamic: false })
  rich.setResponseId(responseId)
  rich.setBotResponseId(responseId)
  rich.addSection(
    AIRich.newLayout('Single', {
      __typename: 'GenAIaeacdsnwHtmlPrimitive',
      payload: html,
      trusted_sources: [],
    }),
    { text: fa.strip(String(label)).trim().slice(0, 120) || OPTS.brand }
  )

  // verification:'auto' → proof sengaja dihilangkan (status UNKNOWN), bukan proof
  // palsu yang memicu masking ai_rich_response_unknown_sender_verification_masking_enabled.
  const main = await rich.build(jid, {
    messageId: responseId,
    botJid: OPTS.botJid,
    forwarded: true,
    forwardWrapper: true,
    notification: false,
    verification: 'auto',
    includesUnifiedResponse: true,
    includesSubmessages: true,
  })
  const edit = await rich.buildEdit(jid, responseId, { msg: main.message })

  // relayMessage bisa resolve tanpa hasil yang bisa dipakai. Jangan anggap itu sukses:
  // pemanggil harus tetap bisa jatuh ke menu teks legacy.
  const mainReceipt = relayReceiptId(await sock.relayMessage(jid, main.message, {
    messageId: main.key.id,
    additionalNodes: [richBizNode()],
  }))
  if (!mainReceipt) throw new Error('[richui] relay kartu tidak mengembalikan id pesan yang bisa dipakai')
  const editReceipt = relayReceiptId(await sock.relayMessage(jid, edit.message, {
    messageId: edit.key.id,
    additionalNodes: [richBizNode()],
  }))
  if (!editReceipt) throw new Error('[richui] relay edit kartu tidak mengembalikan id pesan yang bisa dipakai')

  return { key: main.key, message: main.message }
}

// ganti emoji di teks HTML (di luar <script>/<style>/atribut) dengan ikon FA; sprite ditambahkan otomatis
function scrub(html) {
  const parts = String(html).split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/i)
  const out = parts.map((seg) => (/^<(script|style)/i.test(seg) ? seg : fa.htmlText(seg))).join('')
  // sprite untuk ikon yang baru ditambahkan (yang belum punya <symbol>)
  const used = [...out.matchAll(/href="#f-([a-z0-9-]+)"/g)].map((m) => m[1])
  const have = new Set([...out.matchAll(/<symbol id="f-([a-z0-9-]+)"/g)].map((m) => m[1]))
  const need = [...new Set(used)].filter((n) => !have.has(n))
  return need.length ? fa.spriteFor(need) + out : out
}

// ---------------------------------------------------------------- TOMBOL SALIN (native WhatsApp: cta_copy)
// Kartu HTML tidak bisa dipilih teksnya di WhatsApp, jadi setelah kartu dikirim satu pesan tombol "Salin"
// (tombol native, pasti bisa menyalin): Salin semua + nilai penting (token, email, password, link, hasil).
const KEY_HINT = /token|pass|sandi|cookie|kode|code|otp|e-?mail|user(name)?|akun|key|kunci|api|hash|link|url|tautan|\bid\b|nomor|phone|telepon|alamat|address|hasil|result/i
const bare = (v) => String(v).replace(/^[`*_~\s]+|[`*_~\s]+$/g, '').trim()
const isUrl = (v) => /^https?:\/\/\S+$/i.test(v)
const isMail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const tidy = (l, n = 20) => cut(plainOf(l).replace(/^[\d.\s]+(?=\p{L})/u, '').replace(/[:：]$/, ''), n) || 'Salin'

// teks polos tanpa tanda format WhatsApp / bingkai
function plainText(raw = '') {
  return doc.unbold(String(raw))
    .split('\n')
    .map((l) => doc.cleanBox(l.replace(/^\s*>\s?/, '').trim()).replace(RE.panelTitle, '$1').replace(/\*([^*\n]+)\*/g, '$1').replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1$2').replace(/~([^~\n]+)~/g, '$1').replace(/```/g, ''))
    .filter((l, i, a) => l || (a[i - 1] && a[i + 1] !== undefined))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// -> [{ label, value, pri }]  pri kecil = lebih penting
function copyItems(raw, prefix = '.') {
  const { blocks } = parse(raw, { prefix })
  const found = []
  let head = ''
  for (const b of blocks) {
    if (b.t === 'h') head = b.text
    else if (b.t === 'code') found.push({ label: tidy(head, 18) || 'Kode', value: bare(b.text), pri: 1 })
    else if (b.t === 'hero') found.push({ label: 'Hasil', value: bare(b.big), pri: 2 })
    else if (b.t === 'kv') {
      for (const r of b.rows) {
        const v = bare(r.v)
        if (!v || v.length < 3 || v.length > 1800) continue
        if (isUrl(v)) found.push({ label: tidy(r.k, 18), value: v, pri: 3 })
        else if (isMail(v)) found.push({ label: tidy(r.k, 18), value: v, pri: 2 })
        else if (KEY_HINT.test(r.k) && !/\s{2,}/.test(v) && v.length <= 200) found.push({ label: tidy(r.k, 18), value: v, pri: 2 })
      }
    } else if (b.t === 'p') {
      for (const u of b.text.match(/https?:\/\/[^\s<>"')]+/g) || []) found.push({ label: 'Link', value: u.replace(/[*_~`.,;]+$/, ''), pri: 3 })
    }
  }
  const seen = new Set()
  const uniq = found.filter((f) => (seen.has(f.value) ? false : seen.add(f.value)))
  return uniq.sort((a, b) => a.pri - b.pri).slice(0, 4)
}

// rencana tombol salin untuk satu balasan teks. [] = tidak perlu
function copyPlan(raw, { tone = 'info', prefix = '.' } = {}) {
  const mode = String(global.uiCopy || 'auto').toLowerCase()
  if (mode === 'off' || ['err', 'denied', 'usage'].includes(tone)) return []
  const items = copyItems(raw, prefix)
  const all = plainText(raw).replace(/\n*Powering .+ Information System.*$/i, '').trim()
  if (!all) return []
  // halaman bantuan / cara pakai: tidak ada yang perlu disalin
  if (mode !== 'all' && !items.length && /(^|\n)\W*(contoh|format|cara pakai|penggunaan|usage)\b/i.test(raw) && String(raw).includes(prefix)) return []
  if (mode !== 'all' && !items.length && all.length < 160) return []
  const out = []
  if (all.length <= 3500 && (items.length !== 1 || all.length > items[0].value.length + 40)) out.push({ label: 'Salin semua', value: all })
  for (const it of items) out.push({ label: it.label, value: it.value })
  return out.slice(0, 5)
}

// label tombol native: tanpa emoji (mode rich), diberi huruf besar di awal
const btnLabel = (s) => fa.strip(String(s)).replace(/\s+/g, ' ').trim()

// kirim satu pesan tombol Salin (+ tombol aksi cepat). items: [{ label, value }], extra: tombol nativeFlow tambahan
async function sendCopy(sock, jid, items, extra = []) {
  if (!items?.length && !extra?.length) return null
  const { sendRich, btn } = require('./interactive.cjs')
  const copy = (items || []).slice(0, 4).map((i) => btn.copy(btnLabel(`Salin ${cut(i.label, 22)}`.replace(/^Salin Salin/, 'Salin')), String(i.value)))
  return sendRich(sock, jid, {
    media: null,
    body: copy.length ? '*Salin hasil* — tekan tombol untuk menyalin' : '*Butuh bantuan?* — tekan tombol di bawah',
    footer: OPTS.footer,
    buttons: [...copy, ...(extra || [])].slice(0, 6),
    hints: false
  })
}

// tombol aksi cepat di bawah kartu gagal / cara pakai / ditolak: Bantuan perintah + Menu
function quickButtons(tone, meta = {}, prefix = '.') {
  if (global.uiQuickBar === false || !['err', 'usage', 'denied'].includes(tone)) return []
  const { btn } = require('./interactive.cjs')
  const out = []
  const c = String(meta.command || '')
  if (c && !['menu', 'cmd', 'help', 'allmenu'].includes(c)) out.push(btn.reply('Bantuan perintah', `${prefix}cmd ${c}`))
  out.push(btn.reply('Menu utama', `${prefix}menu`))
  return out
}

// ---------------------------------------------------------------- PEMASANGAN OTOMATIS
// Jalankan fn dengan konteks perintah (dipakai bot.js) supaya kartu tahu kategori & ikon perintah.
const run = (meta, fn) => als.run(meta, fn)
const current = () => als.getStore() || {}

const SKIP_JID = /@(newsletter|broadcast)$|^status@/

function install(sock, config = {}) {
  if (sock.__richui) return
  sock.__richui = true
  const orig = sock.sendMessage.bind(sock)
  const denied = new Set(Object.values(config.mess?.only || {}))
  const errMsg = config.mess?.error?.fitur

  sock.sendMessage = async (jid, content, options) => {
    try {
      if (
        OPTS.enabled &&
        content &&
        typeof content.text === 'string' &&
        content.text.trim() &&
        content.text.length <= 6000 &&
        Object.keys(content).every((k) => k === 'text' || (k === 'mentions' && !content.mentions?.length)) &&
        typeof jid === 'string' &&
        !SKIP_JID.test(jid)
      ) {
        const meta = current()
        if (!meta.plain) {
          const kind = denied.has(content.text) ? 'denied' : content.text === errMsg ? 'error' : undefined
          const { html, label, tone } = fromText(content.text, { ...meta, kind, prefix: config.prefix })
          const sent = await sendHtml(sock, jid, html, label)
          try {
            await sendCopy(sock, jid, copyPlan(content.text, { tone, prefix: config.prefix }), quickButtons(tone, meta, config.prefix || global.prefix || '.'))
          } catch (err) {
            console.log('[RICHUI] tombol salin gagal:', err.message)
          }
          return sent
        }
      }
    } catch (err) {
      console.log('[RICHUI] gagal kirim kartu, pakai teks biasa:', err.message)
    }
    return orig(jid, content, options)
  }
}

// ---------------------------------------------------------------- avatar -> data URI
async function avatarUri(buf, size = 160) {
  if (!buf || !buf.length) return ''
  try {
    const out = await require('sharp')(buf).resize(size, size, { fit: 'cover' }).jpeg({ quality: 62 }).toBuffer()
    return `data:image/jpeg;base64,${out.toString('base64')}`
  } catch {
    return ''
  }
}

const initial = (name) => (String(fa.strip(name) || '?').trim().match(/\p{L}|\p{N}/u) || ['?'])[0].toUpperCase()
const avatarHtml = (uri, name) => `<div class="avr">${uri ? `<img class="av" src="${esc(uri)}" alt="">` : `<div class="av">${esc(initial(name))}</div>`}</div>`

// =====================================================================
//  KARTU KHUSUS
// =====================================================================

// emoji awal string status ("👑 Owner") -> { fa, text }
function splitLead(s) {
  const m = String(s || '').match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/su)
  return m ? { fa: fa.nameOf(m[1]), text: m[2] } : { fa: '', text: String(s || '') }
}

// Kartu menu interaktif: SATU kartu, navigasi di dalam kartu (tanpa pesan baru), pencarian,
// daftar berhalaman (tanpa scroll), jam & uptime berjalan. Logika klien: lib/richui.client.js
// d: { prefix, start:'home'|'cat'|'all', cat, link, user:{greeting,name,status,chat,avatar,level,pct,exp,expNeed,money,bank,limit,rank,rankTotal},
//      info:{mode,users,total,uptime}, cats:[{id,icon,label,desc,hot,items:[{i,c,d}]}] }
const MENU_ICON_BUDGET = () => Number(global.uiMenuIconBudget) || 46000 // byte sprite untuk ikon per-perintah (batas aman payload kartu)
function menuApp(d) {
  const st = splitLead(d.user?.status)
  const user = { ...d.user, status: st.text, statusFa: st.fa || 'user', name: fa.strip(d.user?.name || '') || d.user?.name, greeting: d.user?.greeting }
  const fixed = new Set(['magnifying-glass', 'house', 'folder-open', 'book', 'id-card', 'chevron-right', 'chevron-left', 'angle-left', 'fire', 'dice', 'lightbulb', 'clock', 'puzzle-piece', 'user-group', 'wallet', 'building-columns', 'ticket', 'trophy', 'sliders', 'terminal', 'palette', 'crown', 'user', 'shield-halved', 'comment', 'circle-play', 'play', 'bolt', 'layer-group', 'face-frown', 'ranking-star', 'ghost'])
  let budget = MENU_ICON_BUDGET()
  const cats = d.cats.map((c) => {
    const cf = fa.nameOf(c.icon) || fa.CAT[c.id] || 'layer-group'
    fixed.add(cf)
    return { ...c, icon: cf, col: catColors(c.id), _items: c.items }
  })
  const used = new Set()
  for (const c of cats) {
    c.items = c._items.map((it) => {
      let n = fa.nameOf(it.i)
      if (!n || !fa.has(n)) n = c.icon
      if (!used.has(n) && !fixed.has(n)) {
        const cost = fa.data.icons[n].d.length + 70
        if (cost <= budget && fa.data.icons[n].d.length <= 700) {
          budget -= cost
          used.add(n)
        } else n = c.icon
      }
      return { i: n, c: it.c, d: fa.strip(it.d || '').trim() }
    })
    delete c._items
    c.label = fa.strip(c.label)
    c.desc = fa.strip(c.desc || '')
  }
  const data = { ...d, user, theme: theme().rich().name, cats }
  delete data.fa
  delete data.audio // data: URI audio cuma dipakai di tag <audio>, jangan ikut di blob data (kalau ikut, ukuran kartu jadi dobel)
  const names = [...fixed, ...used, ...cats.map((c) => c.icon)]
  const b64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64')
  const bannerUri = OPTS.banner
  const bannerHtml = bannerUri
    ? `<div class="banner"><img src="${esc(bannerUri)}" alt=""><div class="bncap"><b>${esc(OPTS.brand)}</b><span>${esc(OPTS.footer || 'Rich menu')}</span></div></div>`
    : ''
  const html = fa.spriteFor(names) + `<style>${CSS}${CSS_APP}${theme().rich().css || ''}</style>
<div class="wrap"><div class="card app" style="${accentStyle(TONES.info)}">
${d.user?.avatar ? `<img class="bg" src="${esc(d.user.avatar)}" alt="">` : ''}${DECOR}
<div class="content">${bannerHtml}<div class="top"><button class="bk" id="bk" style="display:none" aria-label="Kembali">${ficon('angle-left')}</button><div class="srw">${ficon('magnifying-glass')}<input class="sr" id="sr" placeholder="Cari fitur..." autocomplete="off"></div></div><div class="scr" id="scr"></div><div class="tabs" id="tabs"></div>${d.audio ? `<div class="bgmwrap">🎧 <span class="bgmlabel">${esc(d.audioLabel || 'BGM Menu')}</span><audio controls preload="none"${d.audioLoop === false ? '' : ' loop'} src="${esc(d.audio)}"></audio></div>` : ''}<div class="foot">${T(OPTS.footer || OPTS.brand)}</div></div>
<div class="toast" id="toast"></div></div></div>
<script>window.__D='${b64}';${APP_JS}</script>`
  return { html, label: `Menu ${OPTS.brand}` }
}

// d: { name, number, status, avatar, level, pct, exp, expNeed, money, bank, limit, rank, rankTotal }
function profile(d) {
  const st = splitLead(d.status)
  const body = [
    `<div class="pf">${avatarHtml(d.avatar, d.name)}<div style="min-width:0"><div class="nm">${T(d.name)}</div><div class="sb">${esc(d.number)} &bull; ${st.fa ? ficon(st.fa) : ''}${T(st.text)}</div></div></div>`,
    `<div class="panel">${H.bar(`Level ${d.level}`, d.pct, `${d.exp} / ${d.expNeed} EXP`)}</div>`,
    H.tiles([
      { l: 'Money', v: d.money, fa: 'wallet', hue: 'gold' },
      { l: 'Bank', v: d.bank, fa: 'building-columns', hue: 'sky' },
      { l: 'Limit', v: String(d.limit), fa: 'ticket', hue: 'amber' },
      { l: 'Peringkat', v: d.rank ? `#${d.rank} / ${d.rankTotal}` : '-', fa: 'trophy', hue: 'vio' }
    ])
  ].join('')
  return { html: shell({ icon: 'id-card', eyebrow: `${OPTS.brand} • kartu player`, title: '', body, accent: TONES.info, image: d.avatar }), label: `Kartu ${fa.strip(d.name)}` }
}

// d: { gauges:[{label,pct,sub,fa?}], rows:[{k,v,raw?}] }
function dashboard(d) {
  const GF = { cpu: 'microchip', ram: 'memory', heap: 'database', disk: 'hard-drive', mem: 'memory' }
  const ring = (g) => {
    const p = Math.round(g.pct)
    const c = p >= 85 ? '#fb7185' : p >= 65 ? '#fbbf24' : '#2dd4bf'
    const ic = g.fa || GF[String(g.label).toLowerCase().split(/\s/)[0]] || 'gauge-high'
    return `<div class="g"><div class="ring" style="--p:${p};--c:${c}"><span>${p}%</span></div><div class="gl">${ficon(ic)}${esc(g.label)}</div><div class="gs">${esc(g.sub || '')}</div></div>`
  }
  const body = [`<div class="gauges">${d.gauges.map(ring).join('')}</div>`, H.rows(d.rows)].join('')
  return { html: shell({ icon: 'chart-simple', eyebrow: `${OPTS.brand} • server`, title: 'Dashboard', body, accent: TONES.ok }), label: 'Dashboard' }
}

// d: { top:[{name,level}] }
function podium(d) {
  const t = d.top
  const medals = ['🥇', '🥈', '🥉']
  const heights = [118, 92, 72]
  const colors = ['linear-gradient(180deg,#ffe27a,#f7971e)', 'linear-gradient(180deg,#e9eef5,#9aa7b8)', 'linear-gradient(180deg,#f5c08a,#c2703a)']
  const col = (i) =>
    t[i]
      ? `<div class="pc"><div class="md">${fa.html(medals[i])}</div><div class="pn">${T(cut(t[i].name, 12))}</div><div class="bl" style="height:${heights[i]}px;background:${colors[i]}">${i + 1}<small>LV ${esc(t[i].level)}</small></div></div>`
      : '<div class="pc"></div>'
  const order = [1, 0, 2]
  const rest = t.slice(3)
  const body = [
    `<div class="pod">${order.map(col).join('')}</div>`,
    rest.length
      ? `<div class="panel">${rest.map((u, i) => `<div class="row"><div class="k">#${i + 4}</div><div class="v" style="flex:1;text-align:left;padding-left:6px">${T(cut(u.name, 20))}</div><div class="k">Lv ${esc(u.level)}</div></div>`).join('')}</div>`
      : ''
  ].join('')
  return { html: shell({ icon: 'trophy', eyebrow: `${OPTS.brand} • peringkat`, title: 'Podium Level', body, accent: TONES.gold }), label: 'Podium Level' }
}

// Kartu profil / hasil pencarian (stalk, dll): foto + nama + baris info. Dipakai fitur baru.
// d: { icon, eyebrow, name, sub, avatar(data URI), chips:[], text, rows:[{k,v}], accent }
function entity(d) {
  const body = [
    `<div class="pf">${avatarHtml(d.avatar, d.name)}<div style="min-width:0"><div class="nm">${T(d.name)}</div>${d.sub ? `<div class="sb">${T(d.sub)}</div>` : ''}</div></div>`,
    d.chips && d.chips.length ? H.chips(d.chips) : '',
    d.text ? `<div class="callout">${inline(d.text)}</div>` : '',
    kvToHtml(d.rows || [])
  ].join('')
  const ic = (d.icon && (fa.has(d.icon) ? d.icon : fa.nameOf(d.icon))) || 'id-card'
  return { html: shell({ icon: ic, eyebrow: d.eyebrow || OPTS.brand, title: '', body, accent: d.accent || TONES.info, image: d.avatar, pager: (d.rows || []).length > 9 }), label: fa.strip(String(d.name)) }
}

// Mode rich: kartu + tombol Salin. Mode button: gambar + keterangan seperti biasa.
// o: { quoted, copy:[{label,value}], buffer (foto untuk mode button), caption (teks untuk mode button) }
async function sendEntity(sock, jid, d, o = {}) {
  if (OPTS.enabled) {
    try {
      const card = entity(d)
      await sendHtml(sock, jid, card.html, card.label)
      try {
        await sendCopy(sock, jid, o.copy)
      } catch (err) {
        console.log('[RICHUI] tombol salin gagal:', err.message)
      }
      return true
    } catch (err) {
      console.log('[RICHUI] kartu profil gagal, pakai gambar biasa:', err.message)
    }
  }
  if (o.buffer) return sock.sendMessage(jid, { image: o.buffer, caption: o.caption || '' }, { quoted: o.quoted })
  return sock.sendMessage(jid, { text: o.caption || '' }, { quoted: o.quoted })
}

// Diagnosa: kanal apa yang tersedia di dalam kartu WhatsApp kamu (.uitest)
function uiTest({ prefix = '.' }) {
  const probe = `
var out=[];function R(k,v,ok){out.push('<div class="row"><div class="k">'+k+'</div><div class="v '+(ok?'pos':'neg')+'">'+v+'</div></div>')}
R('JavaScript','jalan',1);
R('sendPrompt()',typeof window.sendPrompt==='function'?'ada':'tidak ada',typeof window.sendPrompt==='function');
R('Clipboard API',navigator.clipboard&&navigator.clipboard.writeText?'ada':'tidak ada',navigator.clipboard&&navigator.clipboard.writeText);
R('navigator.share',navigator.share?'ada':'tidak ada',navigator.share);
document.getElementById('res').innerHTML=out.join('');
function T(m){var t=document.getElementById('toast');t.textContent=m;t.className='toast on';setTimeout(function(){t.className='toast'},2800)}
window.t1=function(){try{navigator.clipboard.writeText('__PFX__ping').then(function(){T('Clipboard berhasil')},function(){T('Clipboard ditolak')})}catch(e){T('Clipboard error')}};
window.t2=function(){try{navigator.share({text:'__PFX__ping'}).then(function(){T('Share dibuka')},function(){T('Share dibatalkan/ditolak')})}catch(e){T('Share tidak ada')}};
window.t3=function(){try{window.sendPrompt('__PFX__ping');T('sendPrompt terpanggil')}catch(e){T('sendPrompt tidak ada')}};
`.replace(/__PFX__/g, esc(prefix))
  const body = [
    H.p('Tekan tiap tombol lalu laporkan mana yang berhasil.'),
    '<div class="panel" id="res"></div>',
    `<div class="cmds"><div class="cmd tp" onclick="t1()">${ficon('copy')}1 &middot; Salin ke clipboard</div><div class="cmd tp" onclick="t2()">${ficon('share-nodes')}2 &middot; Buka share sheet</div><div class="cmd tp" onclick="t3()">${ficon('paper-plane')}3 &middot; sendPrompt</div></div>`
  ].join('')
  const html = shell({ icon: 'flask', eyebrow: `${OPTS.brand} • diagnosa`, title: 'Tes Kanal Tombol', body, accent: TONES.usage, script: probe }) + '<div class="toast" id="toast" style="position:fixed"></div>'
  return { html, label: 'Tes Kanal Tombol' }
}

module.exports = {
  OPTS, TONES, quickButtons, clock, esc, inline, shell, H, parse, fromText, sendHtml, install, run, current,
  richBizNode, withRichBizClient,
  avatarUri, menuApp, uiTest, profile, dashboard, podium, catColors, fmt, scrub, btnLabel, ficon, T,
  isRich: () => OPTS.enabled, classify, TITLE_HINTS, TONE_META, CAT_ICONS, entity, sendEntity, sendCopy, copyItems, copyPlan, plainText
}
