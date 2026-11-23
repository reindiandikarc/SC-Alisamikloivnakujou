// ═══════════════════════════════════════════════════════
//  hsr_warp.js — Honkai: Star Rail | Gacha / Warp System
//  Alya V13 Plugin System
//  Commands: hsrwarp, hsrwarp10, hsrpity, hsrbanner
//  Database: global.db.game.hsr[userId].warp
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { getUser, saveUser, addCharacter } = require(path.join(__dirname, 'hsr_db'));
const {
  CHARACTERS, WARP_POOLS, TRAILBLAZER, LIGHT_CONES,
  ELEMENT, PATH
} = require(path.join(__dirname, 'hsr_data'));

// ── CONFIG ────────────────────────────────────────────
const SINGLE_COST = 160;   // Stellar Jade
const TEN_COST    = 1600;
const SOFT_PITY   = 74;    // Mulai dari pull ke-74 rate 5★ meningkat
const HARD_PITY5  = 90;    // Pasti 5★ di pull ke-90
const HARD_PITY4  = 10;    // Pasti 4★ tiap 10 pull

// ── CURRENT BANNER (bisa diubah admin) ───────────────
// Untuk demo, featured character adalah Acheron
const CURRENT_BANNER = {
  featuredFive: 'Acheron',
  featuredFour: ['Pela', 'Gallagher', 'Guinaifen'],
  name: '✨ Acheron Event Banner',
  description: 'Featured 5★: Acheron (Lightning · Nihility)',
};

// ── HELPERS ───────────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('id-ID'); }

function getElementIcon(elem) {
  const m = { Physical:'⚪', Fire:'🔥', Ice:'❄️', Lightning:'⚡', Wind:'🌀', Quantum:'🌌', Imaginary:'🟡' };
  return m[elem] || '❓';
}

function getPathIcon(p) {
  const m = { TheHunt:'🏹', Destruction:'💥', Erudition:'📚', Harmony:'🎵', Nihility:'🌑', Abundance:'🌿', Preservation:'🛡️', Remembrance:'🔮' };
  return m[p] || '❓';
}

function rarityStars(r) {
  return r === 5 ? '⭐⭐⭐⭐⭐' : r === 4 ? '⭐⭐⭐⭐' : '⭐⭐⭐';
}

// ── PITY RATE CALC ────────────────────────────────────
function calc5StarRate(pity5) {
  if (pity5 >= HARD_PITY5 - 1) return 1.0; // guaranteed
  if (pity5 >= SOFT_PITY) {
    // Soft pity: rate increases by ~6% per pull past softPity
    const bonus = (pity5 - SOFT_PITY + 1) * 0.06;
    return Math.min(1.0, 0.006 + bonus);
  }
  return 0.006;
}

function calc4StarRate(pity4) {
  if (pity4 >= HARD_PITY4 - 1) return 1.0;
  return 0.051;
}

// ── SINGLE PULL ───────────────────────────────────────
function doPull(warpState, bannerType) {
  const isCharBanner = bannerType === 'character';
  warpState.pulls  = (warpState.pulls  || 0) + 1;
  warpState.pity5  = (warpState.pity5  || 0) + 1;
  warpState.pity4  = (warpState.pity4  || 0) + 1;

  const rate5 = calc5StarRate(warpState.pity5);
  const rate4 = calc4StarRate(warpState.pity4);

  const roll = Math.random();

  // ── 5★ ────────────────────────────────────────────
  if (roll < rate5 || warpState.pity5 >= HARD_PITY5) {
    warpState.pity5 = 0;
    warpState.pity4 = 0; // reset 4-pity on 5★

    if (isCharBanner) {
      // 50/50 system
      if (warpState.guaranteed || Math.random() < 0.5) {
        // Win 50/50: featured character
        warpState.guaranteed = false;
        return { rarity: 5, type: 'character', key: CURRENT_BANNER.featuredFive, isFeatured: true };
      } else {
        // Lose 50/50: random standard 5★
        warpState.guaranteed = true;
        const std5 = WARP_POOLS.standard.pool5;
        const key = std5[Math.floor(Math.random() * std5.length)];
        return { rarity: 5, type: 'character', key, isFeatured: false };
      }
    } else {
      // Standard banner
      const std5 = WARP_POOLS.standard.pool5;
      const key = std5[Math.floor(Math.random() * std5.length)];
      return { rarity: 5, type: 'character', key, isFeatured: false };
    }
  }

  // ── 4★ ────────────────────────────────────────────
  if (roll < rate5 + rate4 || warpState.pity4 >= HARD_PITY4) {
    warpState.pity4 = 0;
    const pool4 = isCharBanner
      ? [...CURRENT_BANNER.featuredFour, ...WARP_POOLS.standard.pool4]
      : WARP_POOLS.standard.pool4;
    const key = pool4[Math.floor(Math.random() * pool4.length)];
    return { rarity: 4, type: 'character', key, isFeatured: isCharBanner && CURRENT_BANNER.featuredFour.includes(key) };
  }

  // ── 3★ (Light Cone) ───────────────────────────────
  const lc3 = Object.keys(LIGHT_CONES).filter(k => LIGHT_CONES[k].rarity === 3);
  const key3 = lc3[Math.floor(Math.random() * lc3.length)];
  return { rarity: 3, type: 'lightcone', key: key3, isFeatured: false };
}

// ── FORMAT PULL RESULT ─────────────────────────────────
function formatPullResult(result, user, idx) {
  const { rarity, type, key, isFeatured } = result;

  let line = '';

  if (rarity === 5) {
    line += `\n🌟🌟🌟 *DAPAT 5★!* 🌟🌟🌟\n`;
    if (type === 'character') {
      const c = CHARACTERS[key];
      if (c) {
        line += `${getElementIcon(c.element)} *${c.name}*\n`;
        line += `${getPathIcon(c.path)} ${c.path} | ${c.element}\n`;
        if (isFeatured) line += `✨ *Featured Character!*\n`;
        // check if dupe
        if (user.characters[key]) {
          const newE = (user.characters[key].eidolon || 0) + 1;
          line += `📌 Sudah punya → E${Math.min(newE, 6)} Eidolon\n`;
        } else {
          line += `🆕 *Karakter Baru!*\n`;
        }
      } else {
        line += `*${key}* (5★ Character)\n`;
      }
    }
  } else if (rarity === 4) {
    line += `⭐⭐⭐⭐ *4★* `;
    if (type === 'character') {
      const c = CHARACTERS[key];
      line += c ? `${getElementIcon(c.element)} *${c.name}*` : `*${key}*`;
      if (isFeatured) line += ` ✨Featured`;
      if (user.characters[key]) {
        const newE = (user.characters[key].eidolon || 0) + 1;
        line += ` (E${Math.min(newE, 6)})`;
      } else {
        line += ` 🆕`;
      }
    } else {
      const lc = LIGHT_CONES[key];
      line += lc ? `🗡️ *${lc.name}*` : `🗡️ *${key}*`;
    }
    line += `\n`;
  } else {
    // 3★
    const lc = LIGHT_CONES[key];
    line += `⭐⭐⭐ ${lc ? lc.name : key} (3★ Light Cone)\n`;
  }

  return line;
}

// ── APPLY PULLS TO USER ───────────────────────────────
function applyPullsToUser(user, results) {
  for (const r of results) {
    if (r.type === 'character' && r.rarity >= 4) {
      addCharacter(user, r.key);
    }
    // Light cones: tambahkan ke inventory (simplified)
    if (r.type === 'lightcone') {
      if (!user.lightcones) user.lightcones = {};
      if (!user.lightcones[r.key]) {
        user.lightcones[r.key] = { count: 1, superimposition: 1 };
      } else {
        user.lightcones[r.key].count++;
        user.lightcones[r.key].superimposition = Math.min(5, user.lightcones[r.key].superimposition + 1);
      }
    }
  }
}

// ── BANNER INFO ───────────────────────────────────────
function buildBannerInfo(user) {
  const wChar  = user.warp?.character || { pity5: 0, pity4: 0, pulls: 0, guaranteed: false };
  const wStd   = user.warp?.standard  || { pity5: 0, pity4: 0, pulls: 0 };

  const feat5 = CHARACTERS[CURRENT_BANNER.featuredFive];
  const feat4Names = CURRENT_BANNER.featuredFour.map(k => {
    const c = CHARACTERS[k]; return c ? c.name : k;
  }).join(', ');

  let msg = `╔══════════════════════════════╗\n`;
  msg += `║  🌌 HSR WARP SYSTEM         ║\n`;
  msg += `╚══════════════════════════════╝\n\n`;

  msg += `💎 *Stellar Jade:* ${fmt(user.stellarJade)}\n`;
  msg += `🎟️  *Undying Starlight:* ${fmt(user.undyingStarlight || 0)}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✨ *${CURRENT_BANNER.name}*\n`;
  msg += `${CURRENT_BANNER.description}\n\n`;
  msg += `Featured 4★: ${feat4Names}\n\n`;

  msg += `📊 *Pity Status (Character Banner):*\n`;
  msg += `  ⭐⭐⭐⭐⭐ Pity: ${wChar.pity5 || 0}/90 `;
  msg += `${(wChar.pity5 || 0) >= SOFT_PITY ? '🔥 Soft Pity!' : ''}\n`;
  msg += `  50/50: ${wChar.guaranteed ? '✅ Guaranteed!' : '❌ 50/50 aktif'}\n`;
  msg += `  ⭐⭐⭐⭐  Pity: ${wChar.pity4 || 0}/10\n\n`;

  msg += `📊 *Pity Status (Standard Banner):*\n`;
  msg += `  ⭐⭐⭐⭐⭐ Pity: ${wStd.pity5 || 0}/90\n`;
  msg += `  ⭐⭐⭐⭐  Pity: ${wStd.pity4 || 0}/10\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Cara Warp:*\n`;
  msg += `!hsrwarp     — 1x Character Banner (160 Jade)\n`;
  msg += `!hsrwarp10   — 10x Character Banner (1600 Jade)\n`;
  msg += `!hsrwarpstd  — 1x Standard Banner (160 Jade)\n`;
  msg += `!hsrwarp10std— 10x Standard Banner (1600 Jade)\n`;
  msg += `!hsrpity     — Cek pity detail\n`;
  msg += `!hsrbanner   — Info banner ini`;

  return msg;
}

// ── PITY INFO ─────────────────────────────────────────
function buildPityInfo(user) {
  const wChar = user.warp?.character || { pity5: 0, pity4: 0, pulls: 0, guaranteed: false };
  const wStd  = user.warp?.standard  || { pity5: 0, pity4: 0, pulls: 0 };

  const rate5Char = (calc5StarRate(wChar.pity5) * 100).toFixed(2);
  const rate5Std  = (calc5StarRate(wStd.pity5) * 100).toFixed(2);

  let msg = `🎯 *Detail Pity HSR*\n\n`;
  msg += `💎 Stellar Jade: ${fmt(user.stellarJade)}\n\n`;

  msg += `✨ *Character Banner (${CURRENT_BANNER.name}):*\n`;
  msg += `  Pull ke-     : ${wChar.pulls || 0} total\n`;
  msg += `  Pity 5★      : ${wChar.pity5 || 0}/90\n`;
  msg += `  Rate 5★ skrng: ${rate5Char}%\n`;
  msg += `  Pity 4★      : ${wChar.pity4 || 0}/10\n`;
  msg += `  50/50 status : ${wChar.guaranteed ? '✅ Guaranteed featured!' : '❌ 50/50 normal'}\n`;
  msg += `  Sisa ke hard : ${HARD_PITY5 - (wChar.pity5 || 0)} pull lagi ke pity 5★\n\n`;

  msg += `🌟 *Standard Banner:*\n`;
  msg += `  Pull ke-     : ${wStd.pulls || 0} total\n`;
  msg += `  Pity 5★      : ${wStd.pity5 || 0}/90\n`;
  msg += `  Rate 5★ skrng: ${rate5Std}%\n`;
  msg += `  Pity 4★      : ${wStd.pity4 || 0}/10\n`;
  msg += `  Sisa ke hard : ${HARD_PITY5 - (wStd.pity5 || 0)} pull lagi ke pity 5★\n\n`;

  const jadeFor1 = user.stellarJade >= SINGLE_COST;
  const jadeFor10 = user.stellarJade >= TEN_COST;
  msg += `💡 *Dengan Jade-mu:*\n`;
  msg += `  Bisa 1x pull : ${jadeFor1 ? '✅' : '❌'} (butuh ${SINGLE_COST})\n`;
  msg += `  Bisa 10x pull: ${jadeFor10 ? '✅' : '❌'} (butuh ${TEN_COST})\n`;
  msg += `  Estimasi pull: ${Math.floor((user.stellarJade || 0) / SINGLE_COST)}x`;

  return msg;
}

// ══════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ══════════════════════════════════════════════════════
module.exports = {
  command: ['hsrwarp', 'hsrwarp10', 'hsrwarpstd', 'hsrwarp10std', 'hsrpity', 'hsrbanner'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { command, args, sender, reply, replyalya } = ctx;
    const userId = sender;

    const user = getUser(userId);
    if (!user) {
      return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrstart* untuk mulai.`);
    }

    // ── Ensure warp state ─────────────────────────────
    if (!user.warp) user.warp = {};
    if (!user.warp.character) user.warp.character = { pulls: 0, pity5: 0, pity4: 0, guaranteed: false };
    if (!user.warp.standard)  user.warp.standard  = { pulls: 0, pity5: 0, pity4: 0 };

    // ──────────────────────────────────────────────────
    // !hsrbanner — Info banner
    // ──────────────────────────────────────────────────
    if (command === 'hsrbanner') {
      return replyalya(buildBannerInfo(user));
    }

    // ──────────────────────────────────────────────────
    // !hsrpity — Cek pity
    // ──────────────────────────────────────────────────
    if (command === 'hsrpity') {
      return replyalya(buildPityInfo(user));
    }

    // ──────────────────────────────────────────────────
    // Tentukan banner dan jumlah pull
    // ──────────────────────────────────────────────────
    const isStd   = command.includes('std');
    const isTen   = command.includes('10');
    const bannerType = isStd ? 'standard' : 'character';
    const count   = isTen ? 10 : 1;
    const cost    = isTen ? TEN_COST : SINGLE_COST;

    if ((user.stellarJade || 0) < cost) {
      return replyalya(
        `❌ *Stellar Jade tidak cukup!*\n` +
        `Dibutuhkan: ${fmt(cost)} 💎\n` +
        `Kamu punya: ${fmt(user.stellarJade)} 💎\n\n` +
        `Kekurangan: ${fmt(cost - (user.stellarJade || 0))} 💎`
      );
    }

    // ── Lakukan Pull(s) ───────────────────────────────
    user.stellarJade -= cost;
    user.stats = user.stats || {};
    user.stats.totalWarps = (user.stats.totalWarps || 0) + count;

    const warpState = user.warp[bannerType];
    const results = [];

    for (let i = 0; i < count; i++) {
      const result = doPull(warpState, bannerType);
      results.push(result);
    }

    // ── Apply ke user data ────────────────────────────
    applyPullsToUser(user, results);
    saveUser(userId, user);

    // ── Build Result Message ──────────────────────────
    const bannerLabel = isStd ? '🌟 Standard Warp' : `✨ ${CURRENT_BANNER.name}`;
    let msg = `╔══════════════════════════════╗\n`;
    msg += `║  🎰 WARP RESULTS             ║\n`;
    msg += `╚══════════════════════════════╝\n`;
    msg += `📍 Banner: ${bannerLabel}\n`;
    msg += `💎 Jade tersisa: ${fmt(user.stellarJade)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    let got5star = false;
    let got4star = false;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (count === 10) msg += `[${i + 1}] `;
      msg += formatPullResult(r, user, i);
      if (r.rarity === 5) got5star = true;
      if (r.rarity === 4) got4star = true;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    // Summary
    const counts = { 5: 0, 4: 0, 3: 0 };
    results.forEach(r => counts[r.rarity]++);
    msg += `📊 *Ringkasan:*\n`;
    if (counts[5]) msg += `  ⭐⭐⭐⭐⭐: ${counts[5]}x\n`;
    if (counts[4]) msg += `  ⭐⭐⭐⭐  : ${counts[4]}x\n`;
    if (counts[3]) msg += `  ⭐⭐⭐    : ${counts[3]}x\n`;

    msg += `\n📊 *Pity Sekarang:*\n`;
    msg += `  5★: ${warpState.pity5}/90`;
    if (warpState.pity5 >= SOFT_PITY) msg += ` 🔥 SOFT PITY!`;
    msg += `\n`;
    msg += `  4★: ${warpState.pity4}/10\n`;
    if (!isStd) {
      msg += `  50/50: ${warpState.guaranteed ? '✅ Guaranteed next!' : '❌ 50/50 aktif'}\n`;
    }

    // Hint if first 5★
    if (!got5star && !got4star) {
      msg += `\n💡 Ketik *!hsrwarp* atau *!hsrwarp10* lagi!`;
    }

    return replyalya(msg);
  }
};
