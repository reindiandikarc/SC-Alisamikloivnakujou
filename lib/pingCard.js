// lib/pingCard.js
// Generator canvas real-time untuk .ping — HUD Diagnostic Panel
// Setiap kali dipanggil, render ulang gambar dengan data status bot terbaru.
// Mengembalikan Buffer JPEG, atau null kalau canvas gagal (caller harus fallback).

const path = require('path')
const fs = require('fs')

const FONT_DIR_MEDIA = path.join(process.cwd(), 'media', 'fonts')
const FONT_DIR_LIB = path.join(process.cwd(), 'lib')

let fontsRegistered = false
let canvasLib = null

// ───────────────────────── Lazy load + font registration ─────────────────────────
function loadCanvas() {
  if (canvasLib) return canvasLib
  // eslint-disable-next-line global-require
  canvasLib = require('canvas')
  if (!fontsRegistered) {
    const { registerFont } = canvasLib
    const tryRegister = (file, opts) => {
      try {
        if (fs.existsSync(file)) registerFont(file, opts)
      } catch (_) { /* font tidak valid, skip diam-diam */ }
    }
    // Display font (judul besar HUD) — Agency FB: condensed, techy
    tryRegister(path.join(FONT_DIR_LIB, 'AGENCYB.TTF'), { family: 'AlyaHUDDisplay', weight: 'bold' })
    // Body/data font — Roboto Medium: bersih, mudah dibaca di ukuran kecil
    tryRegister(path.join(FONT_DIR_MEDIA, 'Roboto_Medium.ttf'), { family: 'AlyaHUDBody' })
    // Label compact — Arial Narrow
    tryRegister(path.join(FONT_DIR_LIB, 'arialnarrow.ttf'), { family: 'AlyaHUDLabel' })
    fontsRegistered = true
  }
  return canvasLib
}

// ───────────────────────── Helpers desain ─────────────────────────
function hexagonPath(ctx, cx, cy, r) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function drawHexTrace(ctx, w, h) {
  ctx.save()
  ctx.strokeStyle = 'rgba(0,229,255,0.07)'
  ctx.lineWidth = 1
  const r = 46
  const dx = r * 1.5
  const dy = r * Math.sqrt(3) / 2
  for (let row = 0, y = -r; y < h + r; row++, y += dy) {
    const offset = (row % 2) * (dx / 2)
    for (let x = -r + offset; x < w + r; x += dx) {
      hexagonPath(ctx, x, y, r * 0.55)
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawCornerBracket(ctx, x, y, size, flipX, flipY, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.lineCap = 'square'
  // L utama
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(0, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()
  // tick detached (signature)
  ctx.beginPath()
  ctx.moveTo(size * 0.45, 10)
  ctx.lineTo(size * 0.75, 10)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(10, size * 0.45)
  ctx.lineTo(10, size * 0.75)
  ctx.stroke()
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

function statusColor(level) {
  // level: 'good' | 'warn' | 'bad'
  if (level === 'bad') return '#FF3DAE'
  if (level === 'warn') return '#FFC85C'
  return '#00E5FF'
}

// ───────────────────────── Main generator ─────────────────────────
/**
 * @param {Object} data - status bot real-time, lihat ping.js untuk shape lengkap
 * @returns {Promise<Buffer|null>} JPEG buffer, atau null kalau gagal total
 */
async function generatePingCard(data) {
  try {
    const { createCanvas } = loadCanvas()
    const W = 1600, H = 900
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    const hasDisplay = (() => {
      try { ctx.font = '10px AlyaHUDDisplay'; return true } catch (_) { return false }
    })()
    const FONT_DISPLAY = hasDisplay ? 'AlyaHUDDisplay' : 'sans-serif'
    const FONT_BODY = 'AlyaHUDBody, sans-serif'
    const FONT_LABEL = 'AlyaHUDLabel, sans-serif'

    // ── Background base ──
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#0B0E1F')
    bgGrad.addColorStop(1, '#11142B')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Dual radial glow
    const glow1 = ctx.createRadialGradient(W * 0.22, H * 0.3, 0, W * 0.22, H * 0.3, 520)
    glow1.addColorStop(0, 'rgba(0,229,255,0.14)')
    glow1.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, W, H)

    const glow2 = ctx.createRadialGradient(W * 0.85, H * 0.78, 0, W * 0.85, H * 0.78, 480)
    glow2.addColorStop(0, 'rgba(255,61,174,0.10)')
    glow2.addColorStop(1, 'rgba(255,61,174,0)')
    ctx.fillStyle = glow2
    ctx.fillRect(0, 0, W, H)

    drawHexTrace(ctx, W, H)

    // ── Frame border ──
    ctx.strokeStyle = 'rgba(0,229,255,0.25)'
    ctx.lineWidth = 2
    roundRect(ctx, 20, 20, W - 40, H - 40, 6)
    ctx.stroke()

    // ── Corner brackets (signature element) ──
    const BR = 60
    drawCornerBracket(ctx, 40, 40, BR, false, false, '#00E5FF')
    drawCornerBracket(ctx, W - 40, 40, BR, true, false, '#FF3DAE')
    drawCornerBracket(ctx, 40, H - 40, BR, false, true, '#FF3DAE')
    drawCornerBracket(ctx, W - 40, H - 40, BR, true, true, '#00E5FF')

    // ── Header ──
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#00E5FF'
    ctx.font = `22px ${FONT_LABEL}`
    ctx.fillText('[ ALYA-OS ]  REALTIME LINK', 80, 92)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold 54px ${FONT_DISPLAY}`
    ctx.fillText('SYSTEM DIAGNOSTIC', 78, 150)

    // status pill kanan atas
    const pillColor = statusColor(data.overall.level)
    const pillLabel = data.overall.label
    ctx.font = `bold 20px ${FONT_LABEL}`
    const pillW = ctx.measureText(pillLabel).width + 70
    const pillX = W - 80 - pillW
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, pillX, 64, pillW, 44, 22)
    ctx.fill()
    ctx.strokeStyle = pillColor
    ctx.lineWidth = 1.5
    roundRect(ctx, pillX, 64, pillW, 44, 22)
    ctx.stroke()
    ctx.fillStyle = pillColor
    ctx.beginPath()
    ctx.arc(pillX + 24, 86, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold 18px ${FONT_LABEL}`
    ctx.fillText(pillLabel, pillX + 42, 92)
    ctx.restore()

    // divider bawah header
    ctx.strokeStyle = 'rgba(0,229,255,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(78, 178)
    ctx.lineTo(W - 78, 178)
    ctx.stroke()

    // ── Layout: kolom kiri identity, kolom kanan grid module ──
    const leftX = 78
    const leftW = 430
    const rightX = leftX + leftW + 50
    const rightW = W - rightX - 78
    const topY = 210
    const bottomLimit = H - 96 // batas sebelum footer

    // === LEFT: Identity panel ===
    ctx.fillStyle = '#A9B4D0'
    ctx.font = `16px ${FONT_LABEL}`
    ctx.fillText('IDENTITY MATRIX', leftX, topY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold 42px ${FONT_DISPLAY}`
    ctx.fillText('ALYA', leftX, topY + 64)
    ctx.fillStyle = '#FF3DAE'
    ctx.font = `bold 42px ${FONT_DISPLAY}`
    ctx.fillText(' BOT', leftX + ctx.measureText('ALYA').width, topY + 64)

    ctx.fillStyle = '#7C88AE'
    ctx.font = `18px ${FONT_BODY}`
    ctx.fillText(`Build ${data.identity.version}  ·  ${data.identity.owner}`, leftX, topY + 96)

    // waveform dekoratif (signal-trace) — merepresentasikan ping realtime
    const waveY = topY + 150
    const waveH = 70
    ctx.save()
    ctx.strokeStyle = pillColor
    ctx.lineWidth = 2
    ctx.beginPath()
    const points = 40
    const seedBase = (data.network.pingMs || 50)
    for (let i = 0; i <= points; i++) {
      const px = leftX + (leftW - 20) * (i / points)
      const n = Math.sin(i * 0.7 + seedBase * 0.05) * 0.5 + Math.sin(i * 1.9) * 0.25
      const py = waveY + n * (waveH / 2)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = '#5A6690'
    ctx.font = `14px ${FONT_LABEL}`
    ctx.fillText('LIVE SIGNAL TRACE', leftX, waveY + waveH / 2 + 30)

    // mini stat strip di bawah identity (uptime besar)
    const upY = topY + 290
    ctx.fillStyle = '#A9B4D0'
    ctx.font = `16px ${FONT_LABEL}`
    ctx.fillText('UPTIME', leftX, upY)
    ctx.fillStyle = '#00E5FF'
    ctx.font = `bold 40px ${FONT_DISPLAY}`
    ctx.fillText(data.runtime.short, leftX, upY + 48)
    ctx.fillStyle = '#5A6690'
    ctx.font = `15px ${FONT_BODY}`
    ctx.fillText(data.runtime.full, leftX, upY + 76)

    // command/plugin count chip
    const chipY = upY + 120
    const chips = [
      { label: 'PLUGINS', value: data.identity.pluginCount },
      { label: 'COMMANDS', value: data.identity.commandCount }
    ]
    let chipX = leftX
    chips.forEach((c) => {
      const cw = 175
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      roundRect(ctx, chipX, chipY, cw, 78, 10)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,229,255,0.18)'
      ctx.lineWidth = 1
      roundRect(ctx, chipX, chipY, cw, 78, 10)
      ctx.stroke()
      ctx.fillStyle = '#7C88AE'
      ctx.font = `13px ${FONT_LABEL}`
      ctx.fillText(c.label, chipX + 16, chipY + 26)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold 26px ${FONT_DISPLAY}`
      ctx.fillText(String(c.value), chipX + 16, chipY + 58)
      ctx.restore()
      chipX += cw + 16
    })

    // === RIGHT: Module cards grid (data realtime) ===
    ctx.fillStyle = '#A9B4D0'
    ctx.font = `16px ${FONT_LABEL}`
    ctx.fillText('LIVE MODULE STATUS', rightX, topY)

    const cards = [
      {
        tag: '01 · NETWORK',
        color: '#00E5FF',
        rows: [
          ['Internet Ping', data.network.pingText],
          ['Internal Latency', data.network.latencyText],
          ['Total Response', data.network.totalResponseText],
          ['Quality', data.network.quality]
        ]
      },
      {
        tag: '02 · CPU CORE',
        color: '#00E5FF',
        rows: [
          ['Usage', data.cpu.usageText],
          ['Cores', data.cpu.coreText],
          ['Avg Speed', data.cpu.speedText],
          ['Load', data.cpu.load]
        ]
      },
      {
        tag: '03 · MEMORY',
        color: '#FF3DAE',
        rows: [
          ['Used', data.memory.usedText],
          ['Total', data.memory.totalText],
          ['Utilization', data.memory.percentText],
          ['Status', data.memory.status]
        ]
      },
      {
        tag: '04 · ENVIRONMENT',
        color: '#FF3DAE',
        rows: [
          ['OS', data.env.osText],
          ['Platform', data.env.platform],
          ['Date', data.env.dateText],
          ['Time (WIB)', data.env.timeText]
        ]
      }
    ]

    const gridTop = topY + 28
    const gap = 14
    const cardH = clamp((bottomLimit - gridTop - gap * 3) / 4, 124, 165)
    const cardW = rightW

    cards.forEach((card, idx) => {
      const cy = gridTop + idx * (cardH + gap)
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.025)'
      roundRect(ctx, rightX, cy, cardW, cardH, 10)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      roundRect(ctx, rightX, cy, cardW, cardH, 10)
      ctx.stroke()
      // left accent bar
      ctx.fillStyle = card.color
      roundRect(ctx, rightX, cy, 4, cardH, 2)
      ctx.fill()

      // tag
      ctx.fillStyle = card.color
      ctx.font = `bold 14px ${FONT_LABEL}`
      ctx.fillText(card.tag, rightX + 22, cy + 24)

      // rows: 2 kolom dalam card. Hitung tinggi blok label+value dari ruang
      // yang BENAR-BENAR tersedia di card ini (bukan angka tetap sembarang),
      // supaya tidak overflow ke card berikutnya saat cardH mengecil.
      const colW = (cardW - 44) / 2
      const availRows = cardH - 46 // sisakan ruang utk tag header di atas
      const lineBlockH = availRows / 2
      card.rows.forEach((row, ri) => {
        const col = ri % 2
        const line = Math.floor(ri / 2)
        const rx = rightX + 22 + col * colW
        const ry = cy + 44 + line * lineBlockH
        ctx.fillStyle = '#6B76A0'
        ctx.font = `12px ${FONT_LABEL}`
        ctx.fillText(row[0].toUpperCase(), rx, ry)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `bold 19px ${FONT_BODY}`
        ctx.fillText(String(row[1]), rx, ry + 24)
      })
      ctx.restore()
    })

    // ── Footer ──
    ctx.strokeStyle = 'rgba(0,229,255,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(78, H - 78)
    ctx.lineTo(W - 78, H - 78)
    ctx.stroke()

    ctx.fillStyle = '#5A6690'
    ctx.font = `14px ${FONT_LABEL}`
    ctx.textAlign = 'left'
    ctx.fillText(`© ${data.identity.owner.toUpperCase()}  ·  ALYA ${data.identity.version}`, 110, H - 46)

    ctx.textAlign = 'right'
    ctx.fillStyle = pillColor
    ctx.fillText(`REGENERATED LIVE · ${data.env.timeText} WIB`, W - 110, H - 46)
    ctx.textAlign = 'left'

    // ── Output: JPEG q92 (konsisten dengan optimasi sebelumnya) ──
    return canvas.toBuffer('image/jpeg', { quality: 0.92 })
  } catch (err) {
    console.error('[pingCard] gagal generate canvas:', err?.message || err)
    return null
  }
}

module.exports = { generatePingCard }
