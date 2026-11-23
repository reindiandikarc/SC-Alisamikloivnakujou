// Plugin: explore
// Commands: explore, jelajah, jelajahi
// Alya V20 — Petualangan ringan cooldown 90 menit, TANPA syarat weapon/guild.
//
// KENAPA FITUR INI ADA (bukan duplikat .dungeon/.mining/.guild):
// - .dungeon butuh weapon ter-equip (gacha dulu) — barrier tinggi buat pemula.
// - .guild butuh level 10+ (GUILD_MIN_LEVEL, lib/playerlevel.js) — Warga Desa
//   baru (80% hasil .loginisekai, level 0) belum bisa akses sama sekali.
// - .mining fokus gathering material crafting (rock/wood/iron/diamond), bukan
//   XP/uang umum.
// .explore mengisi celah: aktivitas ringan tanpa syarat apapun selain sudah
// .loginisekai, supaya Warga Desa punya cara jelas naik ke level 10 (syarat
// Guild) sambil menunggu siap gacha weapon / cari party.
//
// Diadaptasi dari fitur "explore" milik SC (tema Tensura/Rimuru), di-reskin
// total ke tema isekai Alya (lib/isekaiOrigin.js) dan reward dikalibrasi ulang
// supaya nyambung wajar ke kurva XP lib/playerlevel.js (bukan skala asli SC
// yang ratusan-ribu XP per aktivitas).
'use strict';

const path = require('path');
const Content = require(path.join(__dirname, '..', '..', 'lib', 'isekaiContent'));
const PlayerLevel = require(path.join(__dirname, '..', '..', 'lib', 'playerlevel'));

const COOLDOWN_MS = 90 * 60 * 1000; // 90 menit

function formatSisa(ms) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}j ${mm}m` : `${mm}m`;
}

module.exports = {
  command: ['explore', 'jelajah', 'jelajahi'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, sender } = ctx;

    if (!global.db) global.db = {};
    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const u = global.db.users[sender];

    if (!u.isekaiRegistered) {
      return replyalya(`❌ Kamu belum masuk Dunia Isekai!\nKetik *${prefix}loginisekai* dulu ya.`);
    }

    const now = Date.now();
    if (now - (u.lastExplore || 0) < COOLDOWN_MS) {
      const sisa = COOLDOWN_MS - (now - (u.lastExplore || 0));
      return replyalya(`⏳ *Masih dalam perjalanan!*\nKembali lagi dalam *${formatSisa(sisa)}*.`);
    }

    const loc = Content.pickRandom(Content.EXPLORE_LOCATIONS);
    const found = Content.pickRandom(Content.EXPLORE_FINDS);
    const isRare = Math.random() > 0.7;

    const baseMoney = Math.floor(Math.random() * 15000) + 8000;
    const baseXp = Math.floor(Math.random() * 150) + 100;
    const money = baseMoney * (isRare ? 3 : 1);
    const xp = baseXp * (isRare ? 2 : 1);

    const prevLevel = u.duelLvl || 0;
    u.money = (u.money || 0) + money;
    u.exp = (u.exp || 0) + xp;
    u.lastExplore = now;

    // Sinkronkan level dari total exp (pakai kurva resmi playerlevel.js — SAMA
    // sistem dengan .duel, bukan kurva terpisah), supaya explore beneran nyambung
    // bantu user tembus GUILD_MIN_LEVEL.
    const leveled = PlayerLevel.levelFromExp(u.exp, 0);
    const didLevelUp = leveled.level > prevLevel;
    if (didLevelUp) {
      u.duelLvl = leveled.level;
    }

    await alya.sendMessage(m.chat, { react: { text: '🗺️', key: m.key } });

    let text =
      `╭─「 🗺️ *HASIL PENJELAJAHAN* 」\n` +
      `│\n` +
      `│ 📍 *Lokasi :* ${loc}\n` +
      `│ 🎒 *Temuan :* ${found}${isRare ? ' ✨ *LANGKA!*' : ''}\n` +
      `│\n` +
      `│ 💰 *Uang   :* +Rp ${money.toLocaleString('id-ID')}\n` +
      `│ ✨ *EXP    :* +${xp.toLocaleString('id-ID')}\n`;

    if (didLevelUp) {
      text += `│ 🆙 *LEVEL UP!* ➜ Level ${u.duelLvl}\n`;
    }

    text += `│\n│ ⏰ Jelajah lagi dalam *90 menit*\n`;

    if (!didLevelUp && (u.duelLvl || 0) < PlayerLevel.GUILD_MIN_LEVEL) {
      const remaining = PlayerLevel.GUILD_MIN_LEVEL - (u.duelLvl || 0);
      text += `│ 💡 ${remaining} level lagi menuju syarat Guild (level ${PlayerLevel.GUILD_MIN_LEVEL})!\n`;
    } else if (didLevelUp && u.duelLvl >= PlayerLevel.GUILD_MIN_LEVEL) {
      text += `│ 🎉 Kamu sudah memenuhi syarat Guild! Coba *${prefix}guild daftar*\n`;
    }

    text += `╰──────────────────`;

    return replyalya(text);
  }
};
