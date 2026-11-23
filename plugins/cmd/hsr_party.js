// ═══════════════════════════════════════════════════════
//  hsr_party.js — Honkai: Star Rail | Party Management
//  Alya V13 Plugin System
//  Commands: hsrparty, hsrsetparty, hsrswap, hsrheal
//  Database: global.db.game.hsr[userId].party
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { getUser, saveUser, calcStat, setParty, hpBar, energyBar } = require(path.join(__dirname, 'hsr_db'));
const { CHARACTERS, TRAILBLAZER } = require(path.join(__dirname, 'hsr_data'));

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

// ── PARTY DISPLAY ─────────────────────────────────────
function buildPartyDisplay(user) {
  const partyKeys = user.party || ['Trailblazer'];
  const chars = user.characters || {};

  let msg = `╔══════════════════════════════╗\n`;
  msg += `║  🧑‍🚀 PARTY AKTIF              ║\n`;
  msg += `╚══════════════════════════════╝\n\n`;

  for (let i = 0; i < partyKeys.length; i++) {
    const key = partyKeys[i];
    const save = chars[key];
    const base = CHARACTERS[key] || (key === 'Trailblazer' ? TRAILBLAZER : null);
    if (!base || !save) {
      msg += `[${i + 1}] ❌ ${key} — Data tidak ditemukan\n\n`;
      continue;
    }

    const stat = calcStat(key, save);
    const hpRatio = (save.hp || base.baseHP) / stat.hp;
    const hpColor = hpRatio > 0.6 ? '🟩' : hpRatio > 0.3 ? '🟨' : '🟥';
    const energyFull = (save.energy || 0) >= stat.maxEnergy;

    msg += `*[${i + 1}]* ${getElementIcon(base.element)} *${base.name}* ${rarityStars(base.rarity)}\n`;
    msg += `     ${getPathIcon(base.path)} ${base.path} | Lv.${save.level} E${save.eidolon}\n`;
    msg += `     ❤️ HP : ${hpBar(save.hp || base.baseHP, stat.hp, 8)}\n`;
    msg += `           ${fmt(save.hp || base.baseHP)} / ${fmt(stat.hp)}\n`;
    msg += `     ⚡ En : ${energyBar(save.energy || 0, stat.maxEnergy, 8)}\n`;
    msg += `           ${save.energy || 0}/${stat.maxEnergy}${energyFull ? ' 💫 READY!' : ''}\n`;
    msg += `     ⚔️ ATK: ${fmt(stat.atk)} | 🛡️ DEF: ${fmt(stat.def)} | 💨 SPD: ${stat.spd}\n\n`;
  }

  // Synergy analysis
  const elements = partyKeys.map(k => {
    const b = CHARACTERS[k] || TRAILBLAZER;
    return b.element;
  });
  const paths = partyKeys.map(k => {
    const b = CHARACTERS[k] || TRAILBLAZER;
    return b.path;
  });

  const hasDPS    = paths.some(p => ['TheHunt','Destruction','Erudition'].includes(p));
  const hasSupport= paths.some(p => ['Harmony','Nihility'].includes(p));
  const hasHeal   = paths.some(p => p === 'Abundance');
  const hasTank   = paths.some(p => p === 'Preservation');

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⚗️ *Analisis Party:*\n`;
  msg += `  ⚔️ DPS    : ${hasDPS ? '✅' : '❌ Tidak ada DPS!'}\n`;
  msg += `  🎵 Support: ${hasSupport ? '✅' : '⚠️ Tidak ada buffer/debuffer'}\n`;
  msg += `  💚 Healer : ${hasHeal ? '✅' : '⚠️ Tidak ada healer'}\n`;
  msg += `  🛡️ Tank   : ${hasTank ? '✅' : '⚠️ Tidak ada tank'}\n\n`;

  msg += `🎨 *Elemen Party:*\n  `;
  msg += [...new Set(elements)].map(e => `${getElementIcon(e)} ${e}`).join(' · ');
  msg += `\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Commands:*\n`;
  msg += `!hsrsetparty [nama1,nama2,...]  — Atur party\n`;
  msg += `!hsrswap [slot] [nama]          — Swap karakter\n`;
  msg += `!hsrheal                        — Pulihkan HP (pakai Credits)\n`;
  msg += `\nMax 4 slot. Contoh:\n`;
  msg += `!hsrsetparty Seele,Bronya,Gepard,Tingyun`;

  return msg;
}

// ── HEAL COST ─────────────────────────────────────────
function getHealCost(user) {
  // Biaya heal berdasarkan total HP yang hilang
  let totalMissing = 0;
  for (const key of (user.party || [])) {
    const save = user.characters?.[key];
    const base = CHARACTERS[key] || (key === 'Trailblazer' ? TRAILBLAZER : null);
    if (!save || !base) continue;
    const maxHp = calcStat(key, save).hp;
    totalMissing += Math.max(0, maxHp - (save.hp || 0));
  }
  return Math.floor(totalMissing / 10) * 100; // 100 credits per 10 HP missing
}

// ── FIND KEY FROM NAME ────────────────────────────────
function findCharKey(user, query) {
  const q = query.toLowerCase().trim();
  const ownedKeys = Object.keys(user.characters || {});
  for (const key of ownedKeys) {
    const base = CHARACTERS[key] || TRAILBLAZER;
    if (key.toLowerCase() === q || base.name.toLowerCase() === q || base.name.toLowerCase().includes(q)) {
      return key;
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ══════════════════════════════════════════════════════
module.exports = {
  command: ['hsrparty', 'hsrsetparty', 'hsrswap', 'hsrheal', 'hsrpartystats'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { command, args, text, sender, reply, replyalya } = ctx;
    const userId = sender;

    const user = getUser(userId);
    if (!user) {
      return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrstart* untuk mulai.`);
    }

    // ──────────────────────────────────────────────────
    // !hsrparty — Tampilkan party aktif
    // ──────────────────────────────────────────────────
    if (command === 'hsrparty') {
      return replyalya(buildPartyDisplay(user));
    }

    // ──────────────────────────────────────────────────
    // !hsrsetparty [nama1,nama2,...] — Set party baru
    // ──────────────────────────────────────────────────
    if (command === 'hsrsetparty') {
      if (!args[0]) {
        return replyalya(
          `❌ Format: *!hsrsetparty [nama1,nama2,nama3,nama4]*\n\n` +
          `Contoh:\n!hsrsetparty Seele,Bronya,Gepard,Tingyun\n\n` +
          `Ketik *!hsrchars* untuk lihat koleksimu.\n` +
          `Max 4 karakter, min 1 karakter.`
        );
      }

      if (user.combat && user.combat.phase !== 'end') {
        return replyalya(`❌ Tidak bisa ganti party saat sedang dalam pertarungan!\nSelesaikan atau kabur dulu: *!hsrescape*`);
      }

      // Parse nama karakter, pisah dengan koma atau spasi
      const rawNames = args.join(' ').split(/[,;|]+/).map(s => s.trim()).filter(Boolean);

      if (rawNames.length > 4) {
        return replyalya(`❌ Party maksimal 4 karakter!\nKamu memasukkan ${rawNames.length} karakter.`);
      }

      if (rawNames.length === 0) {
        return replyalya(`❌ Masukkan minimal 1 karakter!`);
      }

      // Resolve semua nama ke key
      const resolvedKeys = [];
      const notFound = [];

      for (const name of rawNames) {
        const key = findCharKey(user, name);
        if (!key) notFound.push(name);
        else if (!resolvedKeys.includes(key)) resolvedKeys.push(key);
        // Duplikat: abaikan
      }

      if (notFound.length > 0) {
        return replyalya(
          `❌ Karakter tidak ditemukan di koleksimu:\n${notFound.map(n => `  • ${n}`).join('\n')}\n\n` +
          `Ketik *!hsrchars* untuk lihat koleksimu.`
        );
      }

      const result = setParty(user, resolvedKeys);
      if (!result.success) return replyalya(`❌ ${result.msg}`);

      saveUser(userId, user);

      const partyNames = resolvedKeys.map(k => {
        const base = CHARACTERS[k] || TRAILBLAZER;
        return `${getElementIcon(base.element)} ${base.name}`;
      }).join(', ');

      return replyalya(
        `✅ *Party berhasil diubah!*\n\n` +
        `🧑‍🚀 Party baru:\n${partyNames}\n\n` +
        buildPartyDisplay(user)
      );
    }

    // ──────────────────────────────────────────────────
    // !hsrswap [slot] [nama] — Swap satu karakter di slot
    // ──────────────────────────────────────────────────
    if (command === 'hsrswap') {
      if (!args[0] || !args[1]) {
        return replyalya(
          `❌ Format: *!hsrswap [slot] [nama]*\n` +
          `Contoh: *!hsrswap 2 Kafka*\n\n` +
          `Slot 1-4 sesuai posisi party kamu.`
        );
      }

      if (user.combat && user.combat.phase !== 'end') {
        return replyalya(`❌ Tidak bisa swap party saat dalam pertarungan!`);
      }

      const slot = parseInt(args[0]);
      if (isNaN(slot) || slot < 1 || slot > 4) {
        return replyalya(`❌ Slot harus antara 1-4!`);
      }

      const newCharName = args.slice(1).join(' ');
      const newKey = findCharKey(user, newCharName);

      if (!newKey) {
        return replyalya(`❌ Karakter *${newCharName}* tidak ditemukan di koleksimu!\nKetik *!hsrchars* untuk cek.`);
      }

      const party = [...(user.party || ['Trailblazer'])];

      // Cek apakah sudah ada di party (swap posisi)
      const existingIdx = party.indexOf(newKey);
      const targetIdx = slot - 1;

      if (existingIdx !== -1 && existingIdx !== targetIdx) {
        // Swap posisi
        const temp = party[targetIdx];
        party[targetIdx] = newKey;
        party[existingIdx] = temp;
      } else if (existingIdx === -1) {
        // Taruh di slot, hapus overflow
        if (targetIdx >= party.length) {
          party.push(newKey);
        } else {
          party[targetIdx] = newKey;
        }
      }

      // Pastikan tidak ada duplikat
      const unique = [...new Set(party)].filter(k => k && user.characters[k]);

      if (unique.length === 0) {
        return replyalya(`❌ Party tidak boleh kosong!`);
      }

      user.party = unique.slice(0, 4);
      saveUser(userId, user);

      const base = CHARACTERS[newKey] || TRAILBLAZER;
      return replyalya(
        `✅ *Swap berhasil!*\n` +
        `${getElementIcon(base.element)} *${base.name}* masuk ke slot ${slot}.\n\n` +
        buildPartyDisplay(user)
      );
    }

    // ──────────────────────────────────────────────────
    // !hsrheal — Heal party dengan Credits
    // ──────────────────────────────────────────────────
    if (command === 'hsrheal') {
      if (user.combat && user.combat.phase !== 'end') {
        return replyalya(`❌ Tidak bisa heal saat dalam pertarungan!`);
      }

      const party = user.party || ['Trailblazer'];
      let totalMissing = 0;
      let allFull = true;

      for (const key of party) {
        const save = user.characters?.[key];
        if (!save) continue;
        const stat = calcStat(key, save);
        const missing = stat.hp - (save.hp || 0);
        if (missing > 0) {
          allFull = false;
          totalMissing += missing;
        }
      }

      if (allFull) {
        return replyalya(`✅ Semua anggota party sudah *HP penuh*!\n\nKetik *!hsrbattle* untuk bertarung!`);
      }

      const healCost = Math.max(500, Math.floor(totalMissing / 10) * 100);

      // Preview heal
      if (!args[0] || args[0].toLowerCase() !== 'confirm') {
        let msg = `💊 *Heal Party*\n\n`;
        msg += `📋 *Status HP Party:*\n`;
        for (const key of party) {
          const save = user.characters?.[key];
          const base = CHARACTERS[key] || TRAILBLAZER;
          if (!save || !base) continue;
          const stat = calcStat(key, save);
          const missing = stat.hp - (save.hp || base.baseHP);
          msg += `  ${getElementIcon(base.element)} *${base.name}*\n`;
          msg += `    HP: ${fmt(save.hp || 0)} / ${fmt(stat.hp)}`;
          msg += missing > 0 ? ` (kurang ${fmt(missing)})\n` : ` ✅\n`;
        }
        msg += `\n💰 *Biaya Heal:* ${fmt(healCost)} 🔵 Credits\n`;
        msg += `💰 *Credits kamu:* ${fmt(user.credits)}\n\n`;

        if (user.credits < healCost) {
          msg += `❌ Credits tidak cukup!\nKurang ${fmt(healCost - user.credits)} 🔵`;
        } else {
          msg += `Ketik *!hsrheal confirm* untuk heal!`;
        }
        return replyalya(msg);
      }

      // Lakukan Heal
      if (user.credits < healCost) {
        return replyalya(`❌ *Credits tidak cukup!*\nDibutuhkan: ${fmt(healCost)} 🔵\nKamu punya: ${fmt(user.credits)} 🔵`);
      }

      user.credits -= healCost;

      for (const key of party) {
        const save = user.characters?.[key];
        if (!save) continue;
        const stat = calcStat(key, save);
        save.hp = stat.hp;
        save.maxHp = stat.hp;
      }

      saveUser(userId, user);

      let msg = `💊 *Heal Berhasil!*\n\n`;
      msg += `✅ Semua anggota party telah dipulihkan ke HP penuh!\n`;
      msg += `💰 Credits terpakai: ${fmt(healCost)}\n`;
      msg += `💰 Sisa Credits: ${fmt(user.credits)}\n\n`;
      msg += `Ketik *!hsrbattle* untuk bertarung!`;

      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrpartystats — Statistik lengkap party
    // ──────────────────────────────────────────────────
    if (command === 'hsrpartystats') {
      const partyKeys = user.party || ['Trailblazer'];
      let msg = `📊 *STATISTIK PARTY*\n\n`;

      let totalAtk = 0, totalDef = 0, totalHp = 0, totalSpd = 0;

      for (let i = 0; i < partyKeys.length; i++) {
        const key = partyKeys[i];
        const save = user.characters?.[key];
        const base = CHARACTERS[key] || (key === 'Trailblazer' ? TRAILBLAZER : null);
        if (!save || !base) continue;

        const stat = calcStat(key, save);
        totalAtk += stat.atk;
        totalDef += stat.def;
        totalHp  += stat.hp;
        totalSpd += stat.spd;

        msg += `*[${i + 1}] ${getElementIcon(base.element)} ${base.name}*\n`;
        msg += `   ❤️ HP : ${fmt(stat.hp)} | ⚔️ ATK: ${fmt(stat.atk)}\n`;
        msg += `   🛡️ DEF: ${fmt(stat.def)} | 💨 SPD: ${stat.spd}\n`;
        msg += `   ⚡ Max Energy: ${stat.maxEnergy}\n\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📈 *Total Party Stats:*\n`;
      msg += `  ❤️ Total HP  : ${fmt(totalHp)}\n`;
      msg += `  ⚔️ Total ATK : ${fmt(totalAtk)}\n`;
      msg += `  🛡️ Total DEF : ${fmt(totalDef)}\n`;
      msg += `  💨 Avg SPD   : ${Math.floor(totalSpd / partyKeys.length)}\n`;

      return replyalya(msg);
    }
  }
};
