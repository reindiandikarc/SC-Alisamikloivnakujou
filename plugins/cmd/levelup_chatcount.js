// ╔══════════════════════════════════════════════════════════════╗
// ║  LEVELUP CHATCOUNT — Alya V13 Plugin                        ║
// ║  Sistem Level Up berdasarkan hitungan chat user              ║
// ║  Desain ID Card Futuristik menggunakan node-canvas           ║
// ║  Commands: chatstat, mystats                                 ║
// ║  Auto-trigger: setiap pesan (background count)              ║
// ╚══════════════════════════════════════════════════════════════╝
'use strict';

let createCanvas, loadImage;
try {
    ({ createCanvas, loadImage } = require('canvas'));
} catch { /* canvas tidak tersedia, fitur level card nonaktif */ }
const path = require('path');
const fs   = require('fs');

// ──────────────────────────────────────────────────────────────
//  KONFIGURASI LEVEL
// ──────────────────────────────────────────────────────────────
const LEVEL_CONFIG = [
  { level: 1,  chatReq:    50,  title: '🌱 Newcomer',    color: '#4ade80', glow: '#22c55e' },
  { level: 2,  chatReq:   150,  title: '💬 Chatter',     color: '#60a5fa', glow: '#3b82f6' },
  { level: 3,  chatReq:   300,  title: '🗣️ Talker',      color: '#a78bfa', glow: '#8b5cf6' },
  { level: 4,  chatReq:   500,  title: '⚡ Active',       color: '#fbbf24', glow: '#f59e0b' },
  { level: 5,  chatReq:   750,  title: '🔥 Energetic',   color: '#f97316', glow: '#ea580c' },
  { level: 6,  chatReq:  1000,  title: '💎 Regular',     color: '#38bdf8', glow: '#0ea5e9' },
  { level: 7,  chatReq:  1500,  title: '🌟 Veteran',     color: '#e879f9', glow: '#d946ef' },
  { level: 8,  chatReq:  2000,  title: '🏆 Champion',    color: '#fb923c', glow: '#f97316' },
  { level: 9,  chatReq:  3000,  title: '👑 Elite',       color: '#facc15', glow: '#eab308' },
  { level: 10, chatReq:  5000,  title: '🌌 Legend',      color: '#f43f5e', glow: '#e11d48' },
  { level: 11, chatReq:  7500,  title: '💫 Mythic',      color: '#c084fc', glow: '#a855f7' },
  { level: 12, chatReq: 10000,  title: '🌀 Immortal',   color: '#67e8f9', glow: '#06b6d4' },
  { level: 13, chatReq: 15000,  title: '⚜️ Transcendent',color: '#fde68a', glow: '#fcd34d' },
  { level: 14, chatReq: 20000,  title: '🌠 Celestial',  color: '#86efac', glow: '#4ade80' },
  { level: 15, chatReq: 30000,  title: '♾️ Eternal',    color: '#ffffff', glow: '#e2e8f0' },
];

function getLevelData(chatCount) {
  let current = null;
  let next    = null;
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (chatCount >= LEVEL_CONFIG[i].chatReq) {
      current = LEVEL_CONFIG[i];
      next    = LEVEL_CONFIG[i + 1] || null;
      break;
    }
  }
  if (!current) {
    current = { level: 0, chatReq: 0,   title: '🌑 Lurker',  color: '#94a3b8', glow: '#64748b' };
    next    = LEVEL_CONFIG[0];
  }
  return { current, next };
}

// ──────────────────────────────────────────────────────────────
//  GENERATE FUTURISTIC ID CARD  (800 × 440 px)
// ──────────────────────────────────────────────────────────────
async function generateLevelCard({
  username,
  chatCount,
  levelData,
  avatarUrl,
  isLevelUp = false,
  oldLevel  = null,
}) {
  const W = 800, H = 440;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  const { current, next } = levelData;
  const accent = current.color;
  const glow   = current.glow;

  // ── BACKGROUND: deep space gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0,    '#020617');
  bgGrad.addColorStop(0.45, '#0a0f2e');
  bgGrad.addColorStop(1,    '#0f0820');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── GRID LINES (scanline feel) ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 1;
  for (let y = 0; y < H; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }

  // ── GLOWING CIRCUIT LINES ──
  function drawCircuit(sx, sy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 60, sy);
    ctx.lineTo(sx + 60, sy + 30);
    ctx.lineTo(sx + 100, sy + 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx + 100, sy + 30, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  drawCircuit(10,  10,  `${accent}60`);
  drawCircuit(W - 120, H - 50, `${accent}60`);

  // ── OUTER BORDER (glowing) ──
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 2;
  ctx.shadowBlur  = 20;
  ctx.shadowColor = glow;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.restore();

  // ── CORNER BRACKETS ──
  function corner(x, y, dx, dy) {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 3;
    ctx.shadowBlur  = 15;
    ctx.shadowColor = glow;
    ctx.beginPath();
    ctx.moveTo(x + dx * 30, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 30);
    ctx.stroke();
    ctx.restore();
  }
  corner(18, 18,  1,  1);
  corner(W - 18, 18,  -1,  1);
  corner(18, H - 18,  1, -1);
  corner(W - 18, H - 18, -1, -1);

  // ── AVATAR CIRCLE ──
  const AX = 100, AY = 150, AR = 72;
  let avatarLoaded = false;
  try {
    if (avatarUrl) {
      const img = await loadImage(avatarUrl);
      ctx.save();
      // Outer glow ring
      ctx.beginPath();
      ctx.arc(AX, AY, AR + 8, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth   = 3;
      ctx.shadowBlur  = 25;
      ctx.shadowColor = glow;
      ctx.stroke();
      // Inner ring
      ctx.beginPath();
      ctx.arc(AX, AY, AR + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth   = 1;
      ctx.stroke();
      // Clip avatar
      ctx.beginPath();
      ctx.arc(AX, AY, AR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, AX - AR, AY - AR, AR * 2, AR * 2);
      ctx.restore();
      avatarLoaded = true;
    }
  } catch (_) {}

  if (!avatarLoaded) {
    // Fallback: hex icon
    ctx.save();
    ctx.beginPath();
    ctx.arc(AX, AY, AR, 0, Math.PI * 2);
    const fbGrad = ctx.createRadialGradient(AX, AY, 0, AX, AY, AR);
    fbGrad.addColorStop(0, `${accent}40`);
    fbGrad.addColorStop(1, '#0a0f2e');
    ctx.fillStyle = fbGrad;
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 20;
    ctx.shadowColor = glow;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font      = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((username || '?')[0].toUpperCase(), AX, AY);
    ctx.restore();
  }

  // ── LEVEL BADGE (below avatar) ──
  ctx.save();
  ctx.fillStyle   = accent;
  ctx.shadowBlur  = 12;
  ctx.shadowColor = glow;
  ctx.font        = 'bold 13px monospace';
  ctx.textAlign   = 'center';
  ctx.fillText(`LV. ${current.level}`, AX, AY + AR + 20);
  ctx.restore();

  // ── USERNAME ──
  ctx.save();
  ctx.fillStyle   = '#ffffff';
  ctx.shadowBlur  = 10;
  ctx.shadowColor = accent;
  ctx.font        = 'bold 28px sans-serif';
  ctx.textAlign   = 'left';
  ctx.textBaseline = 'middle';
  const uname = (username || 'User').slice(0, 20);
  ctx.fillText(uname, 210, 90);
  ctx.restore();

  // ── TITLE BADGE ──
  const titleText = current.title;
  ctx.save();
  const titleW = ctx.measureText(titleText).width + 24;
  const titleX = 210, titleY = 110;
  // Badge BG
  const badgeGrad = ctx.createLinearGradient(titleX, 0, titleX + titleW, 0);
  badgeGrad.addColorStop(0, `${accent}30`);
  badgeGrad.addColorStop(1, `${accent}10`);
  ctx.fillStyle   = badgeGrad;
  ctx.strokeStyle = `${accent}80`;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.roundRect(titleX, titleY, titleW, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle   = accent;
  ctx.font        = 'bold 13px monospace';
  ctx.textAlign   = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleText, titleX + 12, titleY + 13);
  ctx.restore();

  // ── STATS GRID ──
  const stats = [
    { label: 'TOTAL CHAT',  value: chatCount.toLocaleString('id-ID') + ' msg' },
    { label: 'LEVEL',       value: String(current.level)                       },
    { label: 'RANK',        value: `#${current.level + 1}`                     },
  ];
  stats.forEach((s, i) => {
    const sx = 210 + i * 185, sy = 160;
    ctx.save();
    // Box
    ctx.fillStyle   = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = `${accent}40`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(sx, sy, 160, 55, 6);
    ctx.fill();
    ctx.stroke();
    // Label
    ctx.fillStyle = `${accent}cc`;
    ctx.font      = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(s.label, sx + 10, sy + 8);
    // Value
    ctx.fillStyle   = '#ffffff';
    ctx.shadowBlur  = 6;
    ctx.shadowColor = accent;
    ctx.font        = 'bold 18px monospace';
    ctx.textBaseline = 'bottom';
    ctx.fillText(s.value, sx + 10, sy + 48);
    ctx.restore();
  });

  // ── PROGRESS BAR ──
  const PX = 210, PY = 240, PW = 540, PH = 22;
  let progress = 0, progressLabel = '';
  if (next) {
    const needed = next.chatReq - current.chatReq;
    const done   = chatCount   - current.chatReq;
    progress      = Math.min(1, Math.max(0, done / needed));
    progressLabel = `${chatCount.toLocaleString('id-ID')} / ${next.chatReq.toLocaleString('id-ID')} chat`;
  } else {
    progress      = 1;
    progressLabel = 'MAX LEVEL ∞';
  }

  // Bar BG
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.roundRect(PX, PY, PW, PH, PH / 2);
  ctx.fill();

  // Bar FILL
  if (progress > 0) {
    const fillW  = PW * progress;
    const barGrad = ctx.createLinearGradient(PX, 0, PX + fillW, 0);
    barGrad.addColorStop(0, `${accent}99`);
    barGrad.addColorStop(1, accent);
    ctx.fillStyle   = barGrad;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = glow;
    ctx.beginPath();
    ctx.roundRect(PX, PY, fillW, PH, PH / 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(PX, PY, fillW, PH / 2, [PH / 2, PH / 2, 0, 0]);
    ctx.fill();
  }

  // Progress label
  ctx.fillStyle    = '#ffffff';
  ctx.shadowBlur   = 0;
  ctx.font         = 'bold 11px monospace';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(progressLabel, PX + PW, PY - 4);
  ctx.textAlign = 'left';
  ctx.fillStyle = `${accent}bb`;
  ctx.fillText(next ? `NEXT: ${next.title}` : '✦ MAX RANK', PX, PY - 4);
  ctx.restore();

  // ── DIVIDER ──
  ctx.save();
  ctx.strokeStyle = `${accent}40`;
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(210, 275);
  ctx.lineTo(W - 30, 275);
  ctx.stroke();
  ctx.restore();

  // ── HEX DECORATION (right side) ──
  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i - Math.PI / 6;
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  [
    [W - 55, 80, 40],
    [W - 55, 80, 35],
    [W - 120, 140, 18],
    [W - 30,  170, 12],
  ].forEach(([hx, hy, hr], idx) => {
    ctx.save();
    ctx.strokeStyle = idx < 2 ? `${accent}${idx === 0 ? '30' : '60'}` : `${accent}40`;
    ctx.lineWidth   = idx < 2 ? 2 : 1;
    if (idx < 2) { ctx.shadowBlur = 15; ctx.shadowColor = glow; }
    hexPath(hx, hy, hr);
    ctx.stroke();
    ctx.restore();
  });

  // ── BOT TAG ──
  ctx.save();
  ctx.fillStyle    = 'rgba(255,255,255,0.25)';
  ctx.font         = '11px monospace';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('✦ ALYA BOT V13 ✦', W - 20, H - 12);
  ctx.restore();

  // ── LEVEL UP BANNER (jika trigger levelup) ──
  if (isLevelUp) {
    ctx.save();
    // Semi overlay strip
    const bannerGrad = ctx.createLinearGradient(0, 310, 0, 390);
    bannerGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bannerGrad.addColorStop(0.3, `${accent}22`);
    bannerGrad.addColorStop(0.7, `${accent}22`);
    bannerGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, 310, W, 80);

    ctx.fillStyle   = accent;
    ctx.shadowBlur  = 25;
    ctx.shadowColor = glow;
    ctx.font        = 'bold 32px sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⬆ LEVEL UP!  ${oldLevel} ➜ ${current.level}`, W / 2, 350);
    ctx.restore();
  }

  // ── BOTTOM INFO BAR ──
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(20, H - 45, W - 40, 30);
  ctx.fillStyle    = `${accent}99`;
  ctx.font         = '10px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `SYSTEM: CHAT LEVEL MATRIX v1.0  ◆  BADGE: ${current.title.toUpperCase()}  ◆  STATUS: ACTIVE`,
    30, H - 30
  );
  ctx.restore();

  return canvas.toBuffer('image/png');
}

// ──────────────────────────────────────────────────────────────
//  PLUGIN COMMANDS: chatstat / mystats
// ──────────────────────────────────────────────────────────────
module.exports = [

  // ── .chatstat / .mystats ──────────────────────────────────
  {
    command: ['chatstat', 'mystats', 'statcku', 'levelchat'],
    tags:    ['info'],
    run: async (alya, m, ctx) => {
      const { sender, pushname, reply, replyalya } = ctx;

      const userData  = global.db?.users?.[sender] || {};
      const chatCount = Number(userData.chatCount || 0);
      const levelData = getLevelData(chatCount);

      await alya.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

      let avatarUrl = null;
      try {
        avatarUrl = await alya.profilePictureUrl(sender, 'image');
      } catch (_) {}

      try {
        const buf = await generateLevelCard({
          username:  pushname || 'User',
          chatCount,
          levelData,
          avatarUrl,
          isLevelUp: false,
        });

        await alya.sendMessage(m.chat, {
          image:   buf,
          caption: [
            `╔══[ 📊 *CHAT LEVEL STATS* ]══╗`,
            ``,
            `👤 User   : ${pushname || 'User'}`,
            `💬 Chat   : ${chatCount.toLocaleString('id-ID')} pesan`,
            `🎖️ Level  : ${levelData.current.level} — ${levelData.current.title}`,
            levelData.next
              ? `⬆️ Next   : ${levelData.next.chatReq.toLocaleString('id-ID')} chat → ${levelData.next.title}`
              : `🌌 Status : MAX LEVEL TERCAPAI!`,
            ``,
            `╚═══════════════════════════╝`,
          ].join('\n'),
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } catch (err) {
        console.error('[chatstat] Canvas error:', err.message);
        replyalya([
          `📊 *CHAT LEVEL STATS*`,
          ``,
          `👤 ${pushname || 'User'}`,
          `💬 Total Chat : ${chatCount.toLocaleString('id-ID')} pesan`,
          `🎖️ Level      : ${levelData.current.level}`,
          `✨ Title       : ${levelData.current.title}`,
          levelData.next
            ? `⬆️ Next Level : ${levelData.next.chatReq.toLocaleString('id-ID')} chat`
            : `🌌 MAX LEVEL!`,
        ].join('\n'));

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    },
  },

  // ── .leaderboardchat / .topchat ──────────────────────────────
  {
    command: ['leaderboardchat', 'topchat', 'topchatter'],
    tags:    ['info'],
    run: async (alya, m, ctx) => {
      const { replyalya } = ctx;

      const users = global.db?.users || {};
      const ranked = Object.entries(users)
        .map(([jid, u]) => ({ jid, chatCount: Number(u.chatCount || 0), name: u.name || jid.split('@')[0] }))
        .filter(u => u.chatCount > 0)
        .sort((a, b) => b.chatCount - a.chatCount)
        .slice(0, 10);

      if (ranked.length === 0) return replyalya('📊 Belum ada data chat.');

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const list = ranked.map((u, i) => {
        const ld = getLevelData(u.chatCount);
        return `${medals[i]} *${u.name}*\n   💬 ${u.chatCount.toLocaleString('id-ID')} chat | Lv.${ld.current.level} ${ld.current.title}`;
      }).join('\n\n');

      replyalya(`🏆 *TOP CHATTER LEADERBOARD*\n\n${list}\n\n📌 Update real-time berdasarkan total chat di bot ini.`);
    },
  },

  // ── Internal: processLevelUpChat (dipanggil dari alya.js) ───
  // Exported untuk dipakai via require jika diintegrasikan
];

// ──────────────────────────────────────────────────────────────
//  EXPORTED UTILITY — dipanggil dari alya.js setiap message
// ──────────────────────────────────────────────────────────────
module.exports.processChat = async function processChat(alya, m) {
  try {
    if (!global.db?.users?.[m.sender]) return;
    const user = global.db.users[m.sender];

    // Init counter
    user.chatCount = Number(user.chatCount || 0);
    const oldCount = user.chatCount;
    user.chatCount += 1;

    const oldLevel = getLevelData(oldCount).current.level;
    const newLevel = getLevelData(user.chatCount).current.level;

    if (newLevel > oldLevel) {
      // Level Up terjadi!
      const levelData = getLevelData(user.chatCount);
      const current   = levelData.current;

      // Reward
      const rewardMoney = current.level * 1000;
      const rewardLimit = Math.floor(current.level / 3) + 1;
      user.money = (user.money || 0) + rewardMoney;
      user.limit = (user.limit || 0) + rewardLimit;

      let avatarUrl = null;
      try {
        avatarUrl = await alya.profilePictureUrl(m.sender, 'image');
      } catch (_) {}

      try {
        const buf = await generateLevelCard({
          username:  m.pushName || user.name || 'User',
          chatCount: user.chatCount,
          levelData,
          avatarUrl,
          isLevelUp: true,
          oldLevel,
        });

        await alya.sendMessage(m.chat, {
          image:    buf,
          caption:  [
            `🎉 *LEVEL UP — CHAT COUNT!*`,
            ``,
            `@${m.sender.split('@')[0]} berhasil naik level!`,
            ``,
            `💬 Total Chat : ${user.chatCount.toLocaleString('id-ID')} pesan`,
            `⬆️ Level      : ${oldLevel} ➜ *${current.level}*`,
            `✨ Title       : *${current.title}*`,
            ``,
            `🎁 *Reward Diterima:*`,
            `💰 Money  : +Rp ${rewardMoney.toLocaleString('id-ID')}`,
            `⚡ Limit   : +${rewardLimit}`,
          ].join('\n'),
          mentions: [m.sender],
        }, { quoted: m });

      } catch (imgErr) {
        // Fallback tanpa gambar
        await alya.sendMessage(m.chat, {
          text: [
            `🎉 *LEVEL UP!*`,
            ``,
            `@${m.sender.split('@')[0]} naik ke Level ${current.level}!`,
            `✨ ${current.title}`,
            ``,
            `💰 +Rp ${rewardMoney.toLocaleString('id-ID')} | ⚡ +${rewardLimit} limit`,
          ].join('\n'),
          mentions: [m.sender],
        });
      }
    }

  } catch (err) {
    console.error('[processChat levelup]', err.message);
  }
};

module.exports.getLevelData   = getLevelData;
module.exports.LEVEL_CONFIG   = LEVEL_CONFIG;
module.exports.generateLevelCard = generateLevelCard;
