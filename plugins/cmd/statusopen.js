// Plugin: statusopen
// Commands: statusopen
// Alya V20 — Status Lengkap Player (Level, HP, DEF, ATK, DEX, MP, Weapon, Guild, dll)
// Menampilkan ringkasan tempur player: dipakai buat cek build sebelum duel/guild quest.
'use strict';

const path = require('path');

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[statusopen] gagal load lib/weapons.js:', e.message);
}

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[statusopen] gagal load lib/playerlevel.js:', e.message);
}

let Origin = {};
try { Origin = require('../../lib/isekaiOrigin'); } catch (e) {
  console.error('[statusopen] gagal load lib/isekaiOrigin.js:', e.message);
}

let Guild = {};
try { Guild = require(path.join(__dirname, '..', '..', 'lib', 'guild.js')); } catch (e) {
  console.error('[statusopen] gagal load lib/guild.js:', e.message);
}

// Shared CLASSES — sama seperti duel.js/inventory.js (fallback kalau belum di-init global)
if (!global._ALYA_CLASSES) {
  global._ALYA_CLASSES = {
    warrior:  { name: 'Warrior',  emoji: '⚔️', hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15, skillName: 'Heavy Smash',    ultiName: 'Berserker Rage' },
    mage:     { name: 'Mage',     emoji: '🔮', hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10, skillName: 'Fireball',        ultiName: 'Meteor Strike' },
    assassin: { name: 'Assassin', emoji: '🗡️', hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38, skillName: 'Backstep Slash', ultiName: 'Shadow Assassination' },
    tank:     { name: 'Tank',     emoji: '🛡️', hp: 850, mana:  80, dmg: 18, skillDmg: 30, crit: 0.05, skillName: 'Shield Bash',    ultiName: 'Earthquake' }
  };
}
const CLASSES = global._ALYA_CLASSES;

// Formula bonus dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini)
const getBonus = (user) => {
  const lvl = parseInt(user.duelLvl) || 0;
  return PlayerLevel.getClassBonus
    ? PlayerLevel.getClassBonus(lvl)
    : { hp: lvl * 2, dmg: Math.round(lvl * 0.4), dex: 0, mana: 0 };
};

// Label ramah-baca untuk proc.effect weapon (dipakai konsisten dgn duel.js:applyWeaponProc)
const PROC_EFFECT_LABEL = {
  bleed:     '🩸 Bleed (damage tambahan tiap kena)',
  stun:      '⚡ Stun (lawan skip giliran)',
  manaburn:  '🔥 Mana Burn (menguras MP lawan)',
  lifesteal: '💜 Lifesteal (menyerap HP jadi milik sendiri)'
};

module.exports = {
  command: ['statusopen'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, pushname,
      reply, replyalya, replytolak
    } = ctx;

    // Boleh cek diri sendiri atau orang lain (mention / reply / nomor manual)
    const who = m.mentionedJid?.[0]
      || m.quoted?.sender
      || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender);

    const userRpg = global.db?.users?.[who];
    if (!userRpg) return replyalya('❌ User tidak ditemukan di database! Pastikan sudah pernah chat/daftar.');

    const duelLvl = parseInt(userRpg.duelLvl) || 0;
    const userClass = (userRpg.class && CLASSES[userRpg.class])
      ? CLASSES[userRpg.class]
      : { name: 'Belum Pilih Class', emoji: '👤', hp: 0, dmg: 0, mana: 0, crit: 0 };

    const bonus = getBonus(userRpg);

    // ── Stat tempur final ───────────────────────────────────────────────
    const totalHp = (userClass.hp || 0) + (bonus.hp || 0);
    const totalAtk = (userClass.dmg || 0) + (bonus.dmg || 0);
    const totalMp = (userClass.mana || 0) + (bonus.mana || 0);
    const totalDex = bonus.dex || 0;
    const dodgeChance = PlayerLevel.getDodgeChance ? PlayerLevel.getDodgeChance(duelLvl) : 0;
    const critChance = userClass.crit || 0;

    // ── Weapon equip (buat DEF & ATK tambahan) ───────────────────────────
    let weaponDef = 0;
    let weaponAtk = 0;
    let weaponLine = '┃  🗡️ *Weapon:* _Tangan kosong_';
    let weaponSkillLine = ''; // skill unik + efek proc weapon Legend/Mythic
    if (userRpg.equippedWeapon && W.getEffectiveWeaponStats) {
      const wId = userRpg.equippedWeapon;
      const owned = userRpg.weapons?.[wId];
      const wBase = W.getWeaponById ? W.getWeaponById(wId) : null;
      const eff = owned ? W.getEffectiveWeaponStats(wId, owned.level || 1) : null;
      if (wBase && eff) {
        weaponDef = eff.defBonus || 0;
        weaponAtk = eff.effectiveDmg || 0;
        const rc = W.RARITY?.[wBase.rarity]?.color || '⚪';
        weaponLine = `┃  🗡️ *Weapon:* ${rc} ${wBase.name} (${wBase.rarity}, Lv.${eff.level || owned.level || 1})\n┃      └ +${weaponAtk} ATK | DEF ${(weaponDef * 100).toFixed(0)}%`;

        // Skill unik + efek proc (khusus weapon Legend/Mythic yang punya skillName/proc)
        if (wBase.skillName || wBase.proc) {
          const procLabel = wBase.proc ? (PROC_EFFECT_LABEL[wBase.proc.effect] || wBase.proc.effect) : null;
          const procChancePct = wBase.proc ? Math.round((wBase.proc.chance || 0) * 100) : 0;
          weaponSkillLine =
            `┃      └ 🌟 *Skill Unik:* ${wBase.skillName || '-'}` +
            (wBase.proc
              ? `\n┃          └ ${procLabel} — ${procChancePct}% peluang tiap serang/skill/ulti\n┃          └ _"${wBase.proc.desc}"_`
              : '');
        }
      }
    }
    // DEF ditampilkan sebagai persentase reduksi damage masuk (dari weapon; 0 kalau tangan kosong)
    const totalDefPct = Math.min(50, Math.round(weaponDef * 100)); // dicap 50% sama seperti logic duel.js

    // ── Rank & Golongan (dari lib/playerlevel.js & lib/isekaiOrigin.js) ──
    const rankInfo = PlayerLevel.getRankInfo ? PlayerLevel.getRankInfo(duelLvl) : null;
    const titleInfo = Origin.resolveTitle ? Origin.resolveTitle(userRpg.unlockedClasses || [], duelLvl) : null;

    // ── Power Level (dipakai jadi dasar Rank Guild — lihat lib/guild.js) ──
    const powerLevel = Guild.getPowerLevel ? Guild.getPowerLevel(userRpg, W) : duelLvl;

    // ── Guild info ────────────────────────────────────────────────────
    let guildLine = '┃  🏰 *Guild:* _Belum tergabung_';
    if (Guild.isGuildMember && Guild.isGuildMember(who)) {
      // Sinkronkan rank guild dengan Power Level TERKINI setiap kali status
      // dibuka (rank guild sekarang murni dari power level, bukan kontribusi —
      // lihat lib/guild.js:getRankFromPowerLevel).
      if (Guild.refreshMemberRank) Guild.refreshMemberRank(who, userRpg, W);
      const member = Guild.getMember(who);
      const party = Guild.getPartyOfMember ? Guild.getPartyOfMember(who) : null;
      const partyTxt = party ? ` | 👥 Party: ${party.name || party.id || '-'}` : '';
      guildLine =
        `┃  🏰 *Guild:* Bergabung sejak ${new Date(member.guildJoinedAt || Date.now()).toLocaleDateString('id-ID')}\n` +
        `┃      └ 🎖️ *Rank Guild: ${member.rank || 'F'}* _(dari Power Level)_${partyTxt}\n` +
        `┃      └ 🏅 Kontribusi: ${(member.contribution || 0).toLocaleString('id-ID')} _(statistik)_\n` +
        `┃      └ 📜 Quest Solo: ${member.questsSolo || 0}x | Party: ${member.questsParty || 0}x`;
    }

    // ── Isekai origin flavor ─────────────────────────────────────────
    let originLine = '';
    if (userRpg.isekaiRegistered) {
      originLine =
        `┃  🌸 *Golongan:* ${titleInfo?.emoji || ''} ${titleInfo?.title || 'Warga Desa'}\n` +
        `┃  🏡 *Desa Asal:* ${userRpg.originVillage || '-'}\n`;
    } else {
      originLine = `┃  🌸 *Golongan:* _Belum ${prefix}loginisekai_\n`;
    }

    // ── GELAR — gabungan title Origin (Pahlawan/Sage/Pendekar/Penyihir/Ninja/
    // Guardian/Warga Desa dari lib/isekaiOrigin.js) + gelar duel "Yang Terkuat"
    // (dari kemenangan duel terakhir, lib/duel.js:winnerDb.duelTitle). Kalau
    // user punya keduanya, ditampilkan bersamaan (dipisah " & ") supaya jelas
    // player itu punya title asal-usul SEKALIGUS title prestasi duel.
    const gelarParts = [];
    if (titleInfo?.title && titleInfo.title !== 'Warga Desa') {
      gelarParts.push(`${titleInfo.emoji || ''} ${titleInfo.title}`.trim());
    }
    if (userRpg.duelTitle) {
      gelarParts.push(`🏆 ${userRpg.duelTitle}`);
    }
    const gelarLine = gelarParts.length
      ? `┃  🎗️ *Gelar:* ${gelarParts.join('  &  ')}\n`
      : `┃  🎗️ *Gelar:* _Belum punya gelar — menangkan duel atau naikkan golongan!_\n`;

    const rankLine = rankInfo ? `┃  ${rankInfo.emoji} *Peringkat Duel:* ${rankInfo.label}\n` : '';

    const caption =
      `╔═════〔 📊 *STATUS OPEN* 〕═════╗\n` +
      `┃\n` +
      `┃  👤 *Nama:* ${userRpg.name || pushname || who.split('@')[0]}\n` +
      `┃  🎭 *Class:* ${userClass.name} ${userClass.emoji || ''}\n` +
      `┃  📊 *Level Duel:* ${duelLvl}${duelLvl >= (PlayerLevel.MAX_LEVEL || 999) ? ' (MAX)' : ''}\n` +
      `┃  ⚡ *Power Level:* ${powerLevel}\n` +
      `${rankLine}` +
      `${gelarLine}` +
      `${originLine}` +
      `┃\n` +
      `┣━━〔 ⚔️ *COMBAT STATS* 〕━━┫\n` +
      `┃  ❤️ *HP:* ${totalHp.toLocaleString('id-ID')}\n` +
      `┃  🗡️ *ATK:* ${totalAtk.toLocaleString('id-ID')}${weaponAtk ? ` (+${weaponAtk} dari weapon)` : ''}\n` +
      `┃  🛡️ *DEF:* ${totalDefPct}% ${totalDefPct > 0 ? '_(reduksi dmg masuk)_' : '_(tidak ada weapon defensif)_'}\n` +
      `┃  💧 *MP:* ${totalMp.toLocaleString('id-ID')}\n` +
      `┃  🎯 *DEX:* ${totalDex} _(tiap 5 level +1 DEX)_\n` +
      `┃      └ 🌀 Dodge Chance: ${(dodgeChance * 100).toFixed(1)}%\n` +
      `┃  💥 *Crit Chance:* ${(critChance * 100).toFixed(0)}%\n` +
      `┃\n` +
      `${weaponLine}\n` +
      `${weaponSkillLine ? weaponSkillLine + '\n' : ''}` +
      `┃\n` +
      `┣━━〔 🏰 *GUILD* 〕━━┫\n` +
      `${guildLine}\n` +
      `┃\n` +
      `╚═══════════════════════════════╝\n` +
      `_💡 Tiap kelipatan 5 level (5, 10, 15, ...) DEX +1. Tiap kelipatan 50 level MP Max +50. Power Level = dasar Rank Guild._`;

    return alya.sendMessage(m.chat, { text: caption, mentions: [who] }, { quoted: m });
  }
};
