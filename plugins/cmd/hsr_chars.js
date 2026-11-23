// ═══════════════════════════════════════════════════════
//  hsr_chars.js — Honkai: Star Rail | Character System
//  Alya V13 Plugin System
//  Commands: hsrchars, hsrcharinfo, hsrlevelup, hsrascend
//  Database: global.db.game.hsr[userId].characters
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { getUser, saveUser, calcStat, hpBar, energyBar } = require(path.join(__dirname, 'hsr_db'));
const { CHARACTERS, TRAILBLAZER, ELEMENT, PATH } = require(path.join(__dirname, 'hsr_data'));

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

// ── LEVEL UP COST (Credits) ───────────────────────────
function levelUpCost(currentLevel) {
  // Cost naik per level: base 1000, tiap 10 level +500
  const tier = Math.floor(currentLevel / 10);
  return 1000 + tier * 500;
}

// ── ASCENSION REQUIREMENTS ─────────────────────────────
const ASCENSION_REQ = [
  { level: 20, cost: 4000,  tbLvReq: 15 },
  { level: 30, cost: 8000,  tbLvReq: 25 },
  { level: 40, cost: 16000, tbLvReq: 35 },
  { level: 50, cost: 28000, tbLvReq: 45 },
  { level: 60, cost: 44000, tbLvReq: 55 },
  { level: 70, cost: 64000, tbLvReq: 60 },
];

// Level cap per ascension
const ASC_LEVEL_CAP = [20, 30, 40, 50, 60, 70, 80];

// ── CHARACTER CARD ────────────────────────────────────
function buildCharCard(charKey, save, isInParty = false) {
  const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
  if (!base) return `❌ Data karakter *${charKey}* tidak ditemukan.`;

  const stat = calcStat(charKey, save);
  const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;
  const inPartyTag = isInParty ? ' 🔵[Party]' : '';

  let msg = ``;
  msg += `${getElementIcon(base.element)} *${base.name}*${inPartyTag} ${rarityStars(base.rarity)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🛤️ Path    : ${getPathIcon(base.path)} ${base.path}\n`;
  msg += `💫 Element : ${getElementIcon(base.element)} ${base.element}\n`;
  msg += `📊 Level   : ${save.level}/${levelCap} (A${save.ascension})\n`;
  msg += `💫 Eidolon : E${save.eidolon}\n\n`;

  msg += `📈 *Stats (saat ini):*\n`;
  msg += `  ❤️ HP  : ${fmt(stat.hp)}\n`;
  msg += `  ⚔️ ATK : ${fmt(stat.atk)}\n`;
  msg += `  🛡️ DEF : ${fmt(stat.def)}\n`;
  msg += `  💨 SPD : ${stat.spd}\n`;
  msg += `  ⚡ Energy: ${save.energy || 0}/${stat.maxEnergy}\n\n`;

  msg += `🎯 *Skills:*\n`;
  msg += `  ⚔️ Basic  : ${base.skills.basic.name}\n`;
  msg += `            ${base.skills.basic.desc}\n`;
  msg += `  🔷 Skill  : ${base.skills.skill.name}\n`;
  msg += `            ${base.skills.skill.desc}\n`;
  msg += `  💫 Ult    : ${base.skills.ult.name}\n`;
  msg += `            ${base.skills.ult.desc}\n`;
  msg += `  🌟 Talent : ${base.skills.talent.name}\n`;
  msg += `            ${base.skills.talent.desc}\n\n`;

  msg += `📝 *Deskripsi:*\n${base.description}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Commands:*\n`;
  msg += `!hsrlevelup ${charKey} — Level up karakter\n`;
  msg += `!hsrascend ${charKey}  — Ascend karakter`;

  return msg;
}

// ── COLLECTION LIST ───────────────────────────────────
function buildCollectionList(user, page = 1) {
  const chars = user.characters || {};
  const keys = Object.keys(chars);

  if (keys.length === 0) {
    return `😔 Kamu belum punya karakter!\nKetik *!hsrwarp* untuk gacha karakter.`;
  }

  // Sort: 5★ dulu, lalu 4★, lalu by level desc
  const sorted = keys.sort((a, b) => {
    const baseA = CHARACTERS[a] || TRAILBLAZER;
    const baseB = CHARACTERS[b] || TRAILBLAZER;
    if ((baseB.rarity || 4) !== (baseA.rarity || 4)) return (baseB.rarity || 4) - (baseA.rarity || 4);
    return (chars[b].level || 1) - (chars[a].level || 1);
  });

  const PER_PAGE = 8;
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const slice = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  let msg = `╔══════════════════════════════╗\n`;
  msg += `║  🧑‍🚀 KOLEKSI KARAKTER        ║\n`;
  msg += `╚══════════════════════════════╝\n`;
  msg += `Total: ${keys.length} karakter | Hal. ${safePage}/${totalPages}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const partySet = new Set(user.party || []);

  for (const key of slice) {
    const save = chars[key];
    const base = CHARACTERS[key] || (key === 'Trailblazer' ? TRAILBLAZER : null);
    if (!base) continue;

    const inParty = partySet.has(key) ? ' 🔵' : '';
    const stars = rarityStars(base.rarity);
    const elem = getElementIcon(base.element);
    const pathI = getPathIcon(base.path);
    const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;

    msg += `${elem} *${base.name}*${inParty} ${stars}\n`;
    msg += `   ${pathI} ${base.path} · Lv.${save.level}/${levelCap} · E${save.eidolon}\n`;
    msg += `   ❤️ ${fmt(save.hp || base.baseHP)} / ${fmt(base.baseHP)}\n\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (totalPages > 1) {
    msg += `Hal. selanjutnya: *!hsrchars ${safePage + 1}*\n`;
  }
  msg += `Detail: *!hsrcharinfo [NamaKarakter]*\n`;
  msg += `🔵 = Anggota party aktif`;

  return msg;
}

// ── LEVEL UP LOGIC ────────────────────────────────────
function doLevelUp(user, charKey, times = 1) {
  const save = user.characters[charKey];
  if (!save) return { success: false, msg: `❌ Kamu tidak punya karakter *${charKey}*!` };

  const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
  if (!base) return { success: false, msg: `❌ Data karakter tidak ditemukan.` };

  const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;
  if (save.level >= levelCap) {
    return {
      success: false,
      msg: `⚠️ *${base.name}* sudah di level cap (${levelCap})!\nLakukan Ascend untuk menaikkan cap.\nKetik *!hsrascend ${charKey}*`
    };
  }

  let levelsGained = 0;
  let totalCost = 0;
  const maxLevels = Math.min(times, levelCap - save.level);

  for (let i = 0; i < maxLevels; i++) {
    const cost = levelUpCost(save.level);
    if (user.credits < cost) {
      if (i === 0) {
        return {
          success: false,
          msg: `❌ *Credits tidak cukup!*\nDibutuhkan: ${fmt(cost)} 🔵\nKamu punya: ${fmt(user.credits)} 🔵`
        };
      }
      break; // Level up sebanyak yang bisa dibayar
    }
    user.credits -= cost;
    totalCost += cost;
    save.level++;
    levelsGained++;
  }

  if (levelsGained === 0) return { success: false, msg: `❌ Tidak bisa level up.` };

  // Update HP
  const newStat = calcStat(charKey, save);
  save.hp = newStat.hp;
  save.maxHp = newStat.hp;

  return {
    success: true,
    levelsGained,
    totalCost,
    newLevel: save.level,
    newStat,
    msg: null
  };
}

// ── ASCEND LOGIC ──────────────────────────────────────
function doAscend(user, charKey) {
  const save = user.characters[charKey];
  if (!save) return { success: false, msg: `❌ Kamu tidak punya karakter *${charKey}*!` };

  const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
  if (!base) return { success: false, msg: `❌ Data karakter tidak ditemukan.` };

  if (save.ascension >= 6) {
    return { success: false, msg: `✅ *${base.name}* sudah di Ascension maksimal (A6)!` };
  }

  const req = ASCENSION_REQ[save.ascension];
  if (!req) return { success: false, msg: `❌ Data ascension tidak ditemukan.` };

  if (save.level < req.level) {
    return {
      success: false,
      msg: `❌ Level belum cukup!\n*${base.name}* harus Lv.${req.level} untuk Ascend.\nLevel sekarang: ${save.level}`
    };
  }

  if (user.trailblazeLv < req.tbLvReq) {
    return {
      success: false,
      msg: `❌ Trailblaze Level kamu kurang!\nDibutuhkan TL ${req.tbLvReq}, kamu TL ${user.trailblazeLv}.`
    };
  }

  if (user.credits < req.cost) {
    return {
      success: false,
      msg: `❌ *Credits tidak cukup!*\nDibutuhkan: ${fmt(req.cost)} 🔵\nKamu punya: ${fmt(user.credits)} 🔵`
    };
  }

  user.credits -= req.cost;
  save.ascension++;

  const newCap = ASC_LEVEL_CAP[save.ascension];
  const newStat = calcStat(charKey, save);
  save.hp = newStat.hp;
  save.maxHp = newStat.hp;

  return {
    success: true,
    newAscension: save.ascension,
    newLevelCap: newCap,
    cost: req.cost,
    newStat
  };
}

// ══════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ══════════════════════════════════════════════════════
module.exports = {
  command: ['hsrchars', 'hsrcharinfo', 'hsrlevelup', 'hsrascend', 'hsrallchars'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { command, args, sender, reply, replyalya } = ctx;
    const userId = sender;

    const user = getUser(userId);
    if (!user) {
      return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrstart* untuk mulai.`);
    }

    // ──────────────────────────────────────────────────
    // !hsrchars [page] — Lihat koleksi
    // ──────────────────────────────────────────────────
    if (command === 'hsrchars') {
      const page = parseInt(args[0]) || 1;
      return replyalya(buildCollectionList(user, page));
    }

    // ──────────────────────────────────────────────────
    // !hsrallchars — Lihat semua karakter di game
    // ──────────────────────────────────────────────────
    if (command === 'hsrallchars') {
      const page = parseInt(args[0]) || 1;
      const allKeys = Object.keys(CHARACTERS);
      const PER_PAGE = 10;
      const totalPages = Math.ceil(allKeys.length / PER_PAGE);
      const safePage = Math.max(1, Math.min(page, totalPages));
      const slice = allKeys.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

      const owned = new Set(Object.keys(user.characters || {}));

      let msg = `📖 *DAFTAR KARAKTER HSR*\n`;
      msg += `Total: ${allKeys.length} karakter | Hal. ${safePage}/${totalPages}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      for (const key of slice) {
        const c = CHARACTERS[key];
        if (!c) continue;
        const ownTag = owned.has(key) ? ' ✅' : '';
        const elem = getElementIcon(c.element);
        const pathI = getPathIcon(c.path);
        msg += `${elem} *${c.name}*${ownTag} ${rarityStars(c.rarity)}\n`;
        msg += `   ${pathI} ${c.path} · ${c.element}\n\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (totalPages > 1) msg += `Hal berikut: *!hsrallchars ${safePage + 1}*\n`;
      msg += `✅ = sudah dimiliki`;
      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrcharinfo [nama] — Detail karakter
    // ──────────────────────────────────────────────────
    if (command === 'hsrcharinfo') {
      if (!args[0]) {
        return replyalya(`❌ Masukkan nama karakter!\nContoh: *!hsrcharinfo Seele*`);
      }

      const query = args.join(' ').toLowerCase();
      // Cari by key atau nama
      let foundKey = null;
      for (const key of Object.keys(CHARACTERS)) {
        const c = CHARACTERS[key];
        if (key.toLowerCase() === query || c.name.toLowerCase() === query || c.name.toLowerCase().includes(query)) {
          foundKey = key;
          break;
        }
      }
      if (!foundKey && query.includes('trailblazer')) foundKey = 'Trailblazer';

      if (!foundKey) {
        return replyalya(`❌ Karakter *${args.join(' ')}* tidak ditemukan.\nKetik *!hsrallchars* untuk daftar lengkap.`);
      }

      const save = user.characters[foundKey] || {
        level: 0, ascension: 0, eidolon: 0, energy: 0,
        hp: (CHARACTERS[foundKey] || TRAILBLAZER).baseHP,
        maxHp: (CHARACTERS[foundKey] || TRAILBLAZER).baseHP
      };
      const isInParty = (user.party || []).includes(foundKey);
      const owned = !!user.characters[foundKey];

      let msg = ``;
      if (!owned) {
        const base = CHARACTERS[foundKey];
        msg += `⚠️ Kamu belum punya karakter ini!\n\n`;
        msg += `${getElementIcon(base.element)} *${base.name}* ${rarityStars(base.rarity)}\n`;
        msg += `${getPathIcon(base.path)} ${base.path} · ${base.element}\n\n`;
        msg += `📝 ${base.description}\n\n`;
        msg += `🎯 *Skills:*\n`;
        msg += `  ⚔️ Basic  : ${base.skills.basic.name}\n`;
        msg += `  🔷 Skill  : ${base.skills.skill.name}\n`;
        msg += `  💫 Ult    : ${base.skills.ult.name}\n`;
        msg += `  🌟 Talent : ${base.skills.talent.name}\n\n`;
        msg += `Dapatkan dari: *!hsrwarp*`;
        return replyalya(msg);
      }

      return replyalya(buildCharCard(foundKey, save, isInParty));
    }

    // ──────────────────────────────────────────────────
    // !hsrlevelup [nama] [jumlah] — Level up karakter
    // ──────────────────────────────────────────────────
    if (command === 'hsrlevelup') {
      if (!args[0]) {
        return replyalya(
          `❌ Format: *!hsrlevelup [NamaKarakter] [jumlah]*\n` +
          `Contoh: *!hsrlevelup Seele 5*\n\n` +
          `Ketik *!hsrchars* untuk lihat koleksimu.`
        );
      }

      // Parse: bisa "Seele 5" atau "DanHeng_IL 10"
      let charArg = args[0];
      let times = parseInt(args[1]) || 1;
      times = Math.max(1, Math.min(times, 20)); // max 20 level sekaligus

      // Cari karakter
      let foundKey = null;
      const owned = Object.keys(user.characters || {});
      for (const key of owned) {
        const base = CHARACTERS[key] || TRAILBLAZER;
        if (key.toLowerCase() === charArg.toLowerCase() || base.name.toLowerCase() === charArg.toLowerCase()) {
          foundKey = key;
          break;
        }
      }

      if (!foundKey) {
        return replyalya(`❌ Karakter *${charArg}* tidak ditemukan di koleksimu.\nKetik *!hsrchars* untuk lihat koleksimu.`);
      }

      const result = doLevelUp(user, foundKey, times);
      if (!result.success) {
        return replyalya(result.msg);
      }

      saveUser(userId, user);

      const base = CHARACTERS[foundKey] || TRAILBLAZER;
      const save = user.characters[foundKey];

      let msg = `✅ *Level Up Berhasil!*\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}* ${rarityStars(base.rarity)}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📊 Level: *${save.level - result.levelsGained}* → *${save.level}*\n`;
      msg += `💰 Credits terpakai: ${fmt(result.totalCost)}\n`;
      msg += `💰 Sisa Credits: ${fmt(user.credits)}\n\n`;
      msg += `📈 *Stats Baru:*\n`;
      msg += `  ❤️ HP  : ${fmt(result.newStat.hp)}\n`;
      msg += `  ⚔️ ATK : ${fmt(result.newStat.atk)}\n`;
      msg += `  🛡️ DEF : ${fmt(result.newStat.def)}\n`;
      msg += `  💨 SPD : ${result.newStat.spd}\n\n`;

      const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;
      if (save.level >= levelCap) {
        msg += `⚠️ Sudah di level cap (${levelCap})!\nKetik *!hsrascend ${foundKey}* untuk Ascend.`;
      } else {
        msg += `Ketik *!hsrlevelup ${foundKey}* lagi untuk naik lebih tinggi!`;
      }

      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrascend [nama] — Ascend karakter
    // ──────────────────────────────────────────────────
    if (command === 'hsrascend') {
      if (!args[0]) {
        return replyalya(
          `❌ Format: *!hsrascend [NamaKarakter]*\n` +
          `Contoh: *!hsrascend Seele*`
        );
      }

      // Cari karakter
      let foundKey = null;
      const owned = Object.keys(user.characters || {});
      for (const key of owned) {
        const base = CHARACTERS[key] || TRAILBLAZER;
        if (key.toLowerCase() === args[0].toLowerCase() || base.name.toLowerCase() === args[0].toLowerCase()) {
          foundKey = key;
          break;
        }
      }

      if (!foundKey) {
        return replyalya(`❌ Karakter *${args[0]}* tidak ditemukan di koleksimu.`);
      }

      const save = user.characters[foundKey];
      const base = CHARACTERS[foundKey] || TRAILBLAZER;
      const req = ASCENSION_REQ[save.ascension];

      // Preview sebelum ascend
      if (!req || save.ascension >= 6) {
        const result = doAscend(user, foundKey);
        return replyalya(result.msg);
      }

      // Tampil preview jika belum siap
      if (save.level < req.level || user.trailblazeLv < req.tbLvReq) {
        let msg = `🔮 *Ascend Preview: ${base.name}*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `Ascension sekarang: A${save.ascension}\n`;
        msg += `Target: A${save.ascension + 1}\n\n`;
        msg += `📋 *Syarat Ascend:*\n`;
        msg += `  📊 Level Karakter: ${save.level}/${req.level} ${save.level >= req.level ? '✅' : '❌'}\n`;
        msg += `  🎯 Trailblaze Lv : ${user.trailblazeLv}/${req.tbLvReq} ${user.trailblazeLv >= req.tbLvReq ? '✅' : '❌'}\n`;
        msg += `  🔵 Credits       : ${fmt(user.credits)}/${fmt(req.cost)} ${user.credits >= req.cost ? '✅' : '❌'}\n\n`;

        if (save.level < req.level) {
          msg += `⚠️ Level karakter belum cukup!\nLevel up dulu ke Lv.${req.level}`;
        } else if (user.trailblazeLv < req.tbLvReq) {
          msg += `⚠️ Trailblaze Level kurang!\nMain game lebih banyak untuk naik TL.`;
        } else if (user.credits < req.cost) {
          msg += `⚠️ Credits tidak cukup!\nKurang ${fmt(req.cost - user.credits)} 🔵`;
        }
        return replyalya(msg);
      }

      // Lakukan Ascend
      const result = doAscend(user, foundKey);
      if (!result.success) return replyalya(result.msg);

      saveUser(userId, user);

      let msg = `🌟 *Ascend Berhasil!*\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}* ${rarityStars(base.rarity)}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🔮 Ascension: A${result.newAscension - 1} → *A${result.newAscension}*\n`;
      msg += `📊 Level Cap baru: *${result.newLevelCap}*\n`;
      msg += `💰 Credits terpakai: ${fmt(result.cost)}\n`;
      msg += `💰 Sisa Credits: ${fmt(user.credits)}\n\n`;
      msg += `📈 *Stats Baru:*\n`;
      msg += `  ❤️ HP  : ${fmt(result.newStat.hp)}\n`;
      msg += `  ⚔️ ATK : ${fmt(result.newStat.atk)}\n`;
      msg += `  🛡️ DEF : ${fmt(result.newStat.def)}\n`;
      msg += `  💨 SPD : ${result.newStat.spd}\n\n`;
      msg += `Ketik *!hsrlevelup ${foundKey}* untuk naik level!`;

      return replyalya(msg);
    }
  }
};
