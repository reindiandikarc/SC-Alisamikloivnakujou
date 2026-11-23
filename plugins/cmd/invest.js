// Plugin: invest
// FIXED V20:
//   ✅ Bug fatal: 'type' dari ctx (tipe pesan) diganti 'mType' untuk market type
//   ✅ npcTrade() didefinisikan sebelum dipakai
//   ✅ Semua subcommand pakai 'mType' (bukan 'type' yang crash)
//   ✅ Portofolio auto-close SL/TP/Likuidasi diperbaiki
//   ✅ Harga subcommand loop fix (iterasi semua market)
// UPDATED V20.2 — Auto Market Tick System:
//   ✅ Tiap 5 menit: 1-2 market PASTI naik, variatif besar-kecil
//   ✅ Terkadang semua market turun serentak (BEAR WAVE)
//   ✅ Event langka: semua pasar naik serentak (BULL WAVE, chance kecil 3%)
//   ✅ Tick logic dipisah ke autoMarketTick() — dipanggil dari index.js tiap 5 menit
//      atau fallback trigger on-command jika belum running

'use strict'

// ─────────────────────────────────────────────────────────────────
//  AUTO MARKET TICK — dipanggil interval tiap 5 menit
//  Export function ini dan panggil dari index.js:
//    const { autoMarketTick } = require('./plugins/cmd/invest')
//    setInterval(autoMarketTick, 5 * 60 * 1000)
// ─────────────────────────────────────────────────────────────────

const MARKETS_DEF = {
  crypto: { name: '🪙 Crypto', vol: 2.2 },
  emas:   { name: '🥇 Emas',   vol: 0.5 },
  saham:  { name: '📈 Saham',  vol: 1   },
  minyak: { name: '🛢️ Minyak', vol: 1.4 },
  forex:  { name: '💱 Forex',  vol: 1.6 }
}
const MARKET_KEYS = Object.keys(MARKETS_DEF)

function ensureMarketState() {
  if (!global.db) return
  if (!global.db.market)      global.db.market      = { trend: 'SIDEWAYS', npc: 0, lastEvent: 0, lastTick: 0 }
  if (!global.db.marketPrice) global.db.marketPrice = {}
  if (!global.db.marketCandle) global.db.marketCandle = {}

  for (const k of MARKET_KEYS) {
    if (!global.db.marketPrice[k]) {
      global.db.marketPrice[k] = {
        price:   100 + Math.random() * 20,
        last:    Date.now() - 60000,
        lastNPC: Date.now() - 60000,
        history: []
      }
    }
  }
}

/**
 * autoMarketTick()
 * Dipanggil tiap 5 menit (dari setInterval di index.js).
 * Menentukan skenario tick berdasarkan probabilitas:
 *
 *  Skenario          Chance   Deskripsi
 *  ──────────────────────────────────────────────────────
 *  RARE_BULL_WAVE    3%       Semua market naik besar (event langka)
 *  BEAR_WAVE         12%      Semua market turun serentak
 *  MIXED_RISE        85%      1-2 market naik (bervariasi besar/kecil),
 *                             sisanya sideways / slight noise
 */
function autoMarketTick() {
  try {
    ensureMarketState()
    if (!global.db) return

    const now = Date.now()
    global.db.market.lastTick = now

    const roll = Math.random()

    // ── RARE BULL WAVE (3%) ────────────────────────────────────────
    if (roll < 0.03) {
      for (const k of MARKET_KEYS) {
        const move = 2.5 + Math.random() * 5  // +2.5% ~ +7.5%
        applyPriceMove(k, move * MARKETS_DEF[k].vol)
      }
      global.db.market.trend = 'BULL'
      global.db.market._lastTickEvent = 'RARE_BULL_WAVE'
      return
    }

    // ── BEAR WAVE (12%) ───────────────────────────────────────────
    if (roll < 0.15) {
      for (const k of MARKET_KEYS) {
        const move = -(0.8 + Math.random() * 3.5) // -0.8% ~ -4.3%
        applyPriceMove(k, move * MARKETS_DEF[k].vol)
      }
      global.db.market.trend = 'BEAR'
      global.db.market._lastTickEvent = 'BEAR_WAVE'
      return
    }

    // ── MIXED RISE (85%) ─────────────────────────────────────────
    // Pilih 1-2 market yang naik (dijamin)
    const shuffled = [...MARKET_KEYS].sort(() => Math.random() - 0.5)
    const riseCount = Math.random() < 0.45 ? 2 : 1  // 45% chance 2 naik, 55% 1 naik
    const risingMarkets = new Set(shuffled.slice(0, riseCount))

    for (const k of MARKET_KEYS) {
      if (risingMarkets.has(k)) {
        // Naik: variatif — kecil (0.3-1.5%) atau gede (1.5-6%)
        const bigGain = Math.random() < 0.3  // 30% chance gede
        const move = bigGain
          ? 1.5 + Math.random() * 4.5   // +1.5% ~ +6%
          : 0.3 + Math.random() * 1.2   // +0.3% ~ +1.5%
        applyPriceMove(k, move * MARKETS_DEF[k].vol)
      } else {
        // Sideways noise ±0.2%
        const noise = (Math.random() * 0.4 - 0.2)
        applyPriceMove(k, noise * MARKETS_DEF[k].vol)
      }
    }

    global.db.market.trend = 'SIDEWAYS'
    global.db.market._lastTickEvent = 'MIXED_RISE'
  } catch (e) {
    console.error('[invest:autoMarketTick]', e?.message)
  }
}

/**
 * applyPriceMove(marketKey, movePct)
 * Terapkan pergerakan % ke harga market, simpan ke history candle
 */
function applyPriceMove(marketKey, movePct) {
  const p = global.db.marketPrice[marketKey]
  if (!p) return
  p.price = Math.max(10, p.price * (1 + movePct / 100))
  p.last  = Date.now()
  // Push ke history (max 50 titik)
  if (!p.history) p.history = []
  p.history.push({ price: p.price, at: Date.now() })
  if (p.history.length > 50) p.history.shift()
}

// Ekspos autoMarketTick supaya bisa dipanggil dari index.js
module.exports.autoMarketTick = autoMarketTick

// ─────────────────────────────────────────────────────────────────
//  Command handler .invest
// ─────────────────────────────────────────────────────────────────

module.exports.command = ['invest']
module.exports.tags    = ['general']
module.exports.run     = async (alya, m, ctx) => {
  const {
    command, args, text, q, prefix,
    sender, from, pushname,
    isGroup,
    Ryuu, isPrem, isAly, isAlya, isSewa,
    reply, replyalya, replytolak, replyprem,
    senderNumber, setting, user
  } = ctx

  if (!isGroup) return replytolak('❌ Command ini hanya bisa digunakan di grup!')

  let u = global.db.users[m.sender]
  if (!u.invest) u.invest = {}

  ensureMarketState()

  const markets = MARKETS_DEF
  const sub   = (args[0] || '').toLowerCase()
  const mType = args[1]?.toLowerCase() || ''

  // ── Fallback tick jika autoMarketTick belum jalan di index.js ────
  // Trigger manual jika sudah > 5 menit sejak tick terakhir
  const now = Date.now()
  if (now - (global.db.market.lastTick || 0) >= 300000) {
    autoMarketTick()
  }

  const trend = global.db.market.trend

  /* ========= HELP ========= */
  if (!sub) return replyalya(`
╭─「 📊 *INVEST COMMAND* 」
│
│ 📥 *Buka Posisi*
│ • .invest crypto 10000000 x5
│ • .invest emas 10000000 x1
│ • .invest saham 10000000 x2
│ • .invest minyak 10000000 x5
│ • .invest forex 10000000 x2
│
│ 💰 *Cek Harga*
│ • .invest harga
│ • .invest harga crypto
│
│ 🕯️ *Candle Chart*
│ • .invest candle crypto 1m
│ • .invest candle crypto 5m
│
│ ⚙️ *Set Risk*
│ • .invest set crypto sl 90
│ • .invest set crypto tp 140
│
│ 💼 *Portofolio*
│ • .invest portofolio
│
│ 🏦 *Tarik Dana*
│ • .invest tarik crypto
│
│ 🎉 *Market Event*
│ • .invest event
│
│ 📊 *Status Tick*
│ • .invest tick
│
│ 📌 *Market:* crypto, emas, saham, minyak, forex
│ 📌 *Leverage:* x1, x2, x5
│ 📌 *Min invest:* Rp 5.000.000
│ 📌 *Auto-tick:* setiap 5 menit
╰──────────────────`)

  /* ── Market trend update (25% chance per command, ringan) ── */
  const flow = {
    BULL:     ['BULL', 'BULL', 'SIDEWAYS'],
    BEAR:     ['BEAR', 'SIDEWAYS', 'CRASH'],
    SIDEWAYS: ['SIDEWAYS', 'BULL', 'BEAR'],
    CRASH:    ['CRASH', 'BEAR']
  }
  if (Math.random() < 0.25) {
    const f = flow[global.db.market.trend]
    global.db.market.trend = f[Math.floor(Math.random() * f.length)]
  }

  const baseMove = {
    BULL:     [0.3,  1.3],
    BEAR:     [-1.3, -0.3],
    SIDEWAYS: [-0.2,  0.4],
    CRASH:    [-4,   -1.5]
  }

  /* ── NPC Trade ── */
  function npcTrade() {
    const npcRoll = Math.random()
    if (npcRoll < 0.4) global.db.market.npc += (Math.random() * 2 - 0.5)
    else if (npcRoll < 0.7) global.db.market.npc -= (Math.random() * 2)
    else global.db.market.npc += (Math.random() * 4)
  }

  /* ── Price Tick (on-demand, beda dari autoMarketTick) ── */
  function priceTick(marketKey) {
    const p = global.db.marketPrice[marketKey]
    const n = Date.now()

    if (n - (p.lastNPC || 0) >= 60000) {
      npcTrade()
      p.lastNPC = n
    }

    let [min, max] = baseMove[trend]
    min *= markets[marketKey].vol
    max *= markets[marketKey].vol

    const elapsed = Math.max(1, Math.floor((n - (p.last || n - 60000)) / 60000))
    let move = (Math.random() * (max - min) + min) * elapsed
    move += (global.db.market.npc || 0) * 0.1

    p.price = Math.max(10, (p.price || 100) + move)
    p.last  = n
    global.db.market.npc = (global.db.market.npc || 0) * 0.9
    return p.price
  }

  /* ── TICK STATUS ── */
  if (sub === 'tick') {
    const lastTick = global.db.market.lastTick || 0
    const diffSec  = Math.floor((now - lastTick) / 1000)
    const nextSec  = Math.max(0, 300 - diffSec)
    const lastEvt  = global.db.market._lastTickEvent || '-'
    return replyalya(
      `⏱️ *STATUS AUTO-TICK*\n\n` +
      `🕐 Tick terakhir: ${diffSec}s yang lalu\n` +
      `⏭️ Tick berikutnya: ~${nextSec}s lagi\n` +
      `📋 Event terakhir: ${lastEvt}\n` +
      `🌍 Trend saat ini: *${trend}*`
    )
  }

  /* ── EVENT (manual, user-triggered) ── */
  if (sub === 'event') {
    const ev = [
      { t: '🐋 Whale Dump',          m: -6  },
      { t: '🏦 FED Pivot',           m:  5  },
      { t: '💣 Perang Global',        m: -10 },
      { t: '🚀 ETF Approval',         m:  8  },
      { t: '📰 Good News',            m:  3  },
      { t: '💥 Liquidation Cascade',  m: -5  }
    ]
    const e = ev[Math.floor(Math.random() * ev.length)]

    if (Date.now() - global.db.market.lastEvent > 300000) {
      global.db.market.npc += e.m
      global.db.market.lastEvent = Date.now()
    } else {
      return replyalya('⏳ Event masih cooldown (5 menit sekali)')
    }

    return replyalya(
      `⚠️ *MARKET EVENT TERJADI!*\n\n` +
      `${e.t}\n` +
      `📊 Dampak: ${e.m > 0 ? '+' : ''}${e.m}% pada seluruh market\n` +
      `🌍 Trend saat ini: *${trend}*`
    )
  }

  /* ── HARGA ── */
  if (sub === 'harga') {
    const targetMarkets = (mType && markets[mType]) ? [mType] : Object.keys(markets)
    const lastTick = global.db.market.lastTick || 0
    const diffSec  = Math.floor((now - lastTick) / 1000)
    let out = `📊 *HARGA MARKET*\n🌍 Trend: *${trend}*\n⏱️ Last auto-tick: ${diffSec}s lalu\n\n`
    for (const k of targetMarkets) {
      const pr    = priceTick(k)
      const arrow = pr > 100 ? '📈' : '📉'
      out += `${markets[k].name}\n💹 *${pr.toFixed(2)}* ${arrow}\n\n`
    }
    return replyalya(out.trim())
  }

  /* ── CANDLE ── */
  if (sub === 'candle') {
    const cMarket = mType
    const tf      = (args[2] || '1m').toLowerCase()

    if (!markets[cMarket]) return replyalya('❌ Market tidak dikenal!\nPilihan: crypto, emas, saham, minyak, forex')

    const tfMs = { '1m': 60000, '5m': 300000, '1h': 3600000 }[tf]
    if (!tfMs) return replyalya('❌ Timeframe salah!\nPilihan: 1m, 5m, 1h')

    if (!global.db.marketCandle[cMarket]) global.db.marketCandle[cMarket] = {}
    if (!global.db.marketCandle[cMarket][tf]) global.db.marketCandle[cMarket][tf] = []

    const price = priceTick(cMarket)
    const arr   = global.db.marketCandle[cMarket][tf]
    const last  = arr[arr.length - 1]

    if (!last || now - last.t > tfMs) {
      arr.push({ o: price, h: price, l: price, c: price, t: now })
      if (arr.length > 12) arr.shift()
    } else {
      last.h = Math.max(last.h, price)
      last.l = Math.min(last.l, price)
      last.c = price
    }

    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
    const prices = arr.map(v => v.c)
    const minP   = Math.min(...prices)
    const maxP   = Math.max(...prices)
    const scaleP = p => blocks[Math.floor((p - minP) / (maxP - minP + 0.0001) * 7)]
    const graph  = prices.map(p => scaleP(p)).join('')

    return replyalya(
      `🕯️ *CANDLE ${markets[cMarket].name} (${tf})*\n\n` +
      `${graph}\n\n` +
      `📉 Low  : ${minP.toFixed(2)}\n` +
      `📈 High : ${maxP.toFixed(2)}\n` +
      `🌍 Trend: *${trend}*\n` +
      `📊 Candle: ${arr.length} titik`
    )
  }

  /* ── SET SL/TP ── */
  if (sub === 'set') {
    const sMarket = mType
    const mode    = (args[2] || '').toLowerCase()
    const val     = parseFloat(args[3])

    if (!markets[sMarket]) return replyalya('❌ Market tidak dikenal!\nContoh: .invest set crypto sl 90')
    if (!u.invest[sMarket]) return replyalya(`❌ Kamu belum punya posisi di ${markets[sMarket].name}`)
    if (!['sl', 'tp'].includes(mode)) return replyalya('❌ Mode harus *sl* (stop loss) atau *tp* (take profit)')
    if (isNaN(val) || val <= 0) return replyalya('❌ Nilai tidak valid!')

    u.invest[sMarket][mode] = val
    return replyalya(
      `✅ *${mode.toUpperCase()} diset!*\n\n` +
      `${markets[sMarket].name}\n` +
      `🎯 ${mode.toUpperCase()}: ${val}`
    )
  }

  /* ── PORTOFOLIO ── */
  if (sub === 'portofolio' || sub === 'porto') {
    let t   = `📈 *PORTOFOLIO ${pushname}*\n🌍 Trend: ${trend}\n\n`
    let ada = false

    for (const k in u.invest) {
      if (!markets[k]) continue
      ada = true
      const inv = u.invest[k]
      const pr  = priceTick(k)

      const diff = (pr - inv.buyPrice) / inv.buyPrice
      let val    = Math.floor(inv.modal + (inv.modal * diff * inv.leverage))
      if (val < 0) val = 0

      const hitSL  = inv.sl && pr <= inv.sl
      const hitTP  = inv.tp && pr >= inv.tp
      const hitLiq = val === 0

      if (hitSL || hitTP || hitLiq) {
        u.bank = (u.bank || 0) + val
        delete u.invest[k]
        t += `${markets[k].name} ⚠️ *AUTO CLOSE*\n`
        t += hitLiq ? `💥 Likuidasi! Modal hangus.\n` : ''
        t += hitSL  ? `🔴 Stop Loss tercapai!\n` : ''
        t += hitTP  ? `🟢 Take Profit tercapai!\n` : ''
        t += `💰 Hasil: ${val.toLocaleString()} masuk bank\n\n`
        continue
      }

      const pnl      = val - inv.modal
      const pnlPct   = ((pnl / inv.modal) * 100).toFixed(2)
      const pnlEmoji = pnl >= 0 ? '🟢' : '🔴'

      t += `${markets[k].name}\n`
      t += `💸 Modal    : Rp ${inv.modal.toLocaleString()}\n`
      t += `💰 Nilai    : Rp ${val.toLocaleString()}\n`
      t += `${pnlEmoji} PNL      : ${pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} (${pnlPct}%)\n`
      t += `⚡ Leverage : x${inv.leverage}\n`
      t += `💹 Harga    : ${pr.toFixed(2)}\n`
      t += `🎯 SL/TP    : ${inv.sl || '-'} / ${inv.tp || '-'}\n\n`
    }

    return replyalya(ada ? t.trim() : '📭 Porto kosong. Buka posisi dulu!\nContoh: .invest crypto 10000000 x5')
  }

  /* ── TARIK ── */
  if (sub === 'tarik') {
    const tMarket = mType
    if (!markets[tMarket]) return replyalya('❌ Market tidak dikenal!\nContoh: .invest tarik crypto')
    if (!u.invest[tMarket]) return replyalya(`❌ Kamu tidak punya posisi di ${markets[tMarket].name}`)

    const pr  = priceTick(tMarket)
    const inv = u.invest[tMarket]

    const diff  = (pr - inv.buyPrice) / inv.buyPrice
    let hasil   = Math.floor(inv.modal + (inv.modal * diff * inv.leverage))
    if (hasil < 0) hasil = 0

    const pnl    = hasil - inv.modal
    const pnlPct = ((pnl / inv.modal) * 100).toFixed(2)

    u.bank = (u.bank || 0) + hasil
    delete u.invest[tMarket]

    return replyalya(
      `🏦 *POSISI DITUTUP*\n\n` +
      `${markets[tMarket].name}\n` +
      `💸 Modal  : Rp ${inv.modal.toLocaleString()}\n` +
      `💰 Hasil  : Rp ${hasil.toLocaleString()}\n` +
      `${pnl >= 0 ? '🟢' : '🔴'} PNL    : ${pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} (${pnlPct}%)\n\n` +
      `🏦 Dana masuk ke Bank`
    )
  }

  /* ── BUKA POSISI ── */
  const openMarket = sub
  const amount     = parseInt(args[1])
  const levRaw     = parseInt((args[2] || 'x1').replace('x', ''))
  const lev        = [1, 2, 5].includes(levRaw) ? levRaw : 1

  if (!markets[openMarket]) {
    return replyalya(
      `❌ Sub-command tidak dikenal: *${sub}*\n\n` +
      `Ketik *.invest* untuk melihat daftar command.\n` +
      `Atau buka posisi: *.invest crypto 10000000 x5*`
    )
  }
  if (!amount || amount < 5000000) return replyalya('❌ Minimal investasi Rp 5.000.000')
  if ((u.money || 0) < amount) return replyalya('💸 Uang di dompet tidak cukup!')
  if (u.invest[openMarket]) return replyalya(`⚠️ Kamu sudah punya posisi di ${markets[openMarket].name}!\nTutup dulu dengan: *.invest tarik ${openMarket}*`)

  const pr    = priceTick(openMarket)
  u.money    -= amount
  u.invest[openMarket] = {
    modal    : amount,
    buyPrice : pr,
    unit     : amount / pr,
    leverage : lev,
    sl       : null,
    tp       : null,
    openAt   : Date.now()
  }

  return replyalya(
    `📥 *POSISI DIBUKA!*\n\n` +
    `${markets[openMarket].name}\n` +
    `💹 Harga Masuk : ${pr.toFixed(2)}\n` +
    `📦 Unit        : ${(amount / pr).toFixed(4)}\n` +
    `💸 Modal       : Rp ${amount.toLocaleString()}\n` +
    `⚡ Leverage    : x${lev}\n` +
    `🌍 Trend       : ${trend}\n\n` +
    `💡 Set SL/TP: *.invest set ${openMarket} sl <harga>*\n` +
    `💡 Tutup: *.invest tarik ${openMarket}*`
  )
}
