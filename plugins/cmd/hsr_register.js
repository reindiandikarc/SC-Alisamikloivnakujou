// ═══════════════════════════════════════════════════════
//  hsr_register.js — Honkai: Star Rail | Registrasi Player
//  Alya V13 Plugin System
//  Commands: hsrstart, hsrprofile, hsrregister
//  Database: global.db.game.hsr[userId]
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { getUser, createUser, saveUser, regenTP, timeUntilTPFull } = require(path.join(__dirname, 'hsr_db'));
const { CHARACTERS, STARTER_CHARACTERS, TRAILBLAZER } = require(path.join(__dirname, 'hsr_data'));

function fmt(n) { return (n || 0).toLocaleString('id-ID'); }

function getElementIcon(elem) {
  const m = { Physical:'⚪', Fire:'🔥', Ice:'❄️', Lightning:'⚡', Wind:'🌀', Quantum:'🌌', Imaginary:'🟡' };
  return m[elem] || '❓';
}

function getPathIcon(p) {
  const m = { TheHunt:'🏹', Destruction:'💥', Erudition:'📚', Harmony:'🎵', Nihility:'🌑', Abundance:'🌿', Preservation:'🛡️', Remembrance:'🔮' };
  return m[p] || '❓';
}

module.exports = {
  command: ['hsrstart', 'hsrregister', 'hsrprofile', 'hsrstatus'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { command, args, text, sender, pushname, replyalya } = ctx;
    const userId = sender;
    const displayName = pushname || 'Trailblazer';

    // ──────────────────────────────────────────────────
    // !hsrstart / !hsrregister — Daftar jadi player baru
    // ──────────────────────────────────────────────────
    if (command === 'hsrstart' || command === 'hsrregister') {
      const existing = getUser(userId);
      if (existing) {
        return replyalya(
          `✅ Kamu sudah terdaftar sebagai Trailblazer!\n\n` +
          `👤 Nama    : ${existing.displayName}\n` +
          `🎓 TL Lv   : ${existing.trailblazeLv}\n` +
          `💎 Jade    : ${fmt(existing.stellarJade)}\n` +
          `🔵 Credits : ${fmt(existing.credits)}\n\n` +
          `Ketik *!hsrprofile* untuk info lengkap.\n` +
          `Ketik *!hsrbattle* untuk mulai bertarung!`
        );
      }

      // Buat user baru
      const trailblazerName = args.join(' ') || displayName;
      const user = createUser(userId, displayName, trailblazerName);

      // Berikan starter character random
      const starterKey = STARTER_CHARACTERS[Math.floor(Math.random() * STARTER_CHARACTERS.length)];
      const starterBase = CHARACTERS[starterKey];
      if (starterBase && !user.characters[starterKey]) {
        user.characters[starterKey] = {
          level: 1,
          ascension: 0,
          eidolon: 0,
          energy: 0,
          hp: starterBase.baseHP,
          maxHp: starterBase.baseHP,
          skillLevels: { basic: 1, skill: 1, ult: 1, talent: 1 },
        };
        user.party = ['Trailblazer', starterKey];
      }

      saveUser(userId, user);

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  🚂 SELAMAT DATANG, TRAILBLAZER! ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `Perjalananmu di *Honkai: Star Rail* dimulai!\n\n`;
      msg += `👤 Nama Trailblazer : *${trailblazerName}*\n`;
      msg += `🎓 Trailblaze Level : 1\n`;
      msg += `💎 Stellar Jade     : ${fmt(user.stellarJade)} (bonus awal)\n`;
      msg += `🔵 Credits          : ${fmt(user.credits)}\n`;
      msg += `⚡ Trailblaze Power : ${user.trailblazePower}/240\n\n`;

      msg += `🎁 *Karakter Awal:*\n`;
      msg += `  ⚪ *Trailblazer* (Physical · Destruction)\n`;
      if (starterBase) {
        msg += `  ${getElementIcon(starterBase.element)} *${starterBase.name}* (${starterBase.element} · ${starterBase.path})\n`;
      }
      msg += `\n`;

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🚀 *Mulai Petualangan:*\n`;
      msg += `  !hsrbattle  — Mulai pertarungan\n`;
      msg += `  !hsrwarp    — Gacha karakter baru\n`;
      msg += `  !hsrparty   — Lihat party\n`;
      msg += `  !hsrchars   — Koleksi karakter\n`;
      msg += `  !hsrprofile — Profil lengkap\n\n`;
      msg += `Gunakan *!hsrmenu* untuk semua command!`;

      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrprofile / !hsrstatus — Tampilkan profil
    // ──────────────────────────────────────────────────
    if (command === 'hsrprofile' || command === 'hsrstatus') {
      const user = getUser(userId);
      if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrstart* untuk mulai.`);

      // Regen TP
      regenTP(user);
      saveUser(userId, user);

      const charCount = Object.keys(user.characters || {}).length;
      const partyCount = (user.party || []).length;
      const star5Count = Object.keys(user.characters || {}).filter(k => {
        const b = CHARACTERS[k] || (k === 'Trailblazer' ? TRAILBLAZER : null);
        return b && b.rarity === 5;
      }).length;

      const tpFull = timeUntilTPFull(user);
      const totalBattles = user.stats?.totalBattles || 0;
      const wins = user.stats?.wins || 0;
      const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) : '0.0';

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  🧑‍🚀 TRAILBLAZER PROFILE     ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `👤 *${user.trailblazerName || user.displayName}*\n`;
      msg += `🆔 Equilibrium Lv : ${user.equilibriumLv} (World Level)\n`;
      msg += `🎓 Trailblaze Lv  : ${user.trailblazeLv}\n`;
      msg += `📊 TL EXP         : ${fmt(user.trailblazeExp)}\n\n`;

      msg += `💰 *Resources:*\n`;
      msg += `  💎 Stellar Jade    : ${fmt(user.stellarJade)}\n`;
      msg += `  🔵 Credits         : ${fmt(user.credits)}\n`;
      msg += `  ⚡ Trailblaze Power: ${user.trailblazePower}/240\n`;
      msg += `     Full dalam: ${tpFull}\n\n`;

      msg += `👥 *Koleksi:*\n`;
      msg += `  🗂️ Total Karakter : ${charCount}\n`;
      msg += `  ⭐ 5★ Karakter    : ${star5Count}\n`;
      msg += `  🔵 Party aktif    : ${partyCount} slot\n\n`;

      msg += `⚔️ *Battle Stats:*\n`;
      msg += `  ⚔️ Total Battle    : ${totalBattles}\n`;
      msg += `  🏆 Menang          : ${wins}\n`;
      msg += `  💀 Kalah           : ${user.stats?.losses || 0}\n`;
      msg += `  🏃 Kabur           : ${user.stats?.escapes || 0}\n`;
      msg += `  📊 Win Rate        : ${winRate}%\n`;
      msg += `  👹 Musuh Dikalahkan: ${user.stats?.enemiesDefeated || 0}\n`;
      msg += `  🎰 Total Warp      : ${user.stats?.totalWarps || 0}\n\n`;

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (user.combat) {
        msg += `⚔️ *Sedang dalam pertarungan!*\n!hsrbattle untuk kembali ke battle.`;
      } else {
        msg += `Ketik *!hsrbattle* untuk bertarung!`;
      }

      return replyalya(msg);
    }
  }
};
