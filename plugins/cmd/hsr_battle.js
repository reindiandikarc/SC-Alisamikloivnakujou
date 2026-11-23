// ═══════════════════════════════════════════════════════
//  hsr_battle.js — Honkai: Star Rail | Combat System
//  Alya V13 Plugin System
//  Commands: hsrbattle, hsratk, hsrskill, hsrult, hsrescape, hsrenemy
//  Database: global.db.game.hsr[userId].combat
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const {
  getUser, saveUser, calcStat,
  initCombat, calcDamage, isWeaknessMatch, applyDamage,
  calcRewards, applyExp, hpBar, toughnessBar, energyBar,
  formatCombatDisplay, sortActionOrder, getActorName
} = require(path.join(__dirname, 'hsr_db'));
const { CHARACTERS, ENEMIES, TRAILBLAZER } = require(path.join(__dirname, 'hsr_data'));

// ── HELPERS ───────────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('id-ID'); }
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getElementIcon(elem) {
  const m = { Physical:'⚪', Fire:'🔥', Ice:'❄️', Lightning:'⚡', Wind:'🌀', Quantum:'🌌', Imaginary:'🟡' };
  return m[elem] || '❓';
}

// ── ENEMY SELECTION ───────────────────────────────────
function pickEnemy(trailblazeLv) {
  const pool = Object.entries(ENEMIES).filter(([key, e]) => {
    if (trailblazeLv < 10) return e.type === 'basic';
    if (trailblazeLv < 30) return e.type === 'basic' || e.type === 'elite';
    return true;
  });
  const [key, data] = pool[Math.floor(Math.random() * pool.length)];
  return { key, data };
}

// ── ENEMY AI TURN ─────────────────────────────────────
function doEnemyTurn(combat) {
  const e = combat.enemy;
  const aliveMembers = combat.party.filter(m => m.isAlive);
  if (aliveMembers.length === 0) return [];

  const logs = [];
  const skill = e.skills[e.currentSkillIdx % e.skills.length];
  e.currentSkillIdx++;

  // Pick random target
  const target = aliveMembers[Math.floor(Math.random() * aliveMembers.length)];

  // Scale enemy ATK from level
  const enemyAtk = Math.floor(50 + e.maxHp * 0.04 * (e.currentSkillIdx % 3 === 0 ? 1.5 : 1));

  let dmg = Math.floor(enemyAtk * (skill.dmgMult || 0.6));

  // DEF mitigation from target
  const targetDef = target.def || 0;
  const enemyLevel = e.level || 20;
  const defMit = targetDef > 0
    ? targetDef / (targetDef + 200 + enemyLevel * 10)
    : 0;
  dmg = Math.max(1, Math.floor(dmg * (1 - defMit)));

  // Variance ±15%
  dmg = Math.floor(dmg * (0.85 + Math.random() * 0.3));

  // Apply weakness broken debuff (if broken, enemy does less damage)
  if (e.isWeaknessBreoken) dmg = Math.floor(dmg * 0.7);

  target.hp = Math.max(0, target.hp - dmg);
  if (target.hp <= 0) {
    target.isAlive = false;
    logs.push(`💀 *${target.name}* tumbang! (-${fmt(dmg)} HP)`);
  } else {
    logs.push(`${getElementIcon('Physical')} *${e.name}* menggunakan *${skill.name}*!`);
    logs.push(`  ➤ *${target.name}* terkena ${fmt(dmg)} DMG! HP: ${target.hp}/${target.maxHp}`);
  }

  // Regen enemy energy on attack
  if (e.energy !== undefined) {
    e.energy = Math.min(e.maxEnergy || 100, (e.energy || 0) + 20);
  }

  return logs;
}

// ── PROCESS PLAYER ACTION ─────────────────────────────
function processPlayerAction(user, actionType) {
  const combat = user.combat;
  if (!combat || combat.phase === 'end') return { success: false, msg: `❌ Tidak ada pertarungan aktif.` };

  if (combat.phase !== 'player_turn') return { success: false, msg: `⏳ Bukan giliranmu sekarang!` };

  const actor = combat.party.find(m => m.key === combat.currentActor && m.isAlive);
  if (!actor) return { success: false, msg: `❌ Tidak ada karakter aktif.` };

  const e = combat.enemy;
  const logs = [];
  let spDelta = 0;

  const skillLevels = (user.characters[actor.key]?.skillLevels) || { basic:1, skill:1, ult:1, talent:1 };

  // ── Basic Attack ─────────────────────────────────
  if (actionType === 'basic') {
    const skillData = (CHARACTERS[actor.key] || TRAILBLAZER)?.skills?.basic;
    spDelta = +1;

    if (combat.sp + spDelta > combat.maxSp) spDelta = combat.maxSp - combat.sp;
    combat.sp = Math.min(combat.maxSp, combat.sp + spDelta);

    const isWeak = isWeaknessMatch(actor.element, e.weaknesses);
    const dmgMult = (skillData?.dmgMult || 0.5) * (1 + (skillLevels.basic - 1) * 0.05);
    const { damage, isCrit, toughnessReduction } = calcDamage(actor, dmgMult, e, isWeak);

    applyDamage(e, damage, toughnessReduction);

    logs.push(`⚔️ *${actor.name}* Basic Attack: *${skillData?.name || 'Attack'}*`);
    logs.push(`  ➤ ${fmt(damage)} DMG${isCrit ? ' 💥 CRIT!' : ''}${isWeak ? ' ✨ Weak Hit!' : ''}`);
    if (e.toughness === 0 && !e.isWeaknessBreoken) logs.push(`  ⚠️ *WEAKNESS BROKEN!*`);

    // Energy regen
    actor.energy = Math.min(actor.maxEnergy, (actor.energy || 0) + 20);
  }

  // ── Skill ─────────────────────────────────────────
  else if (actionType === 'skill') {
    if (combat.sp < 1) return { success: false, msg: `❌ SP tidak cukup! (perlu 1 SP)\nGunakan *!hsratk* untuk dapat SP.` };

    const skillData = (CHARACTERS[actor.key] || TRAILBLAZER)?.skills?.skill;
    spDelta = skillData?.sp ?? -1;
    combat.sp = Math.max(0, combat.sp + spDelta);

    if (skillData && skillData.dmgMult > 0) {
      const isWeak = isWeaknessMatch(actor.element, e.weaknesses);
      const dmgMult = skillData.dmgMult * (1 + (skillLevels.skill - 1) * 0.05);
      const { damage, isCrit, toughnessReduction } = calcDamage(actor, dmgMult, e, isWeak);
      applyDamage(e, damage, toughnessReduction);

      logs.push(`🔷 *${actor.name}* Skill: *${skillData.name}*`);
      logs.push(`  ➤ ${fmt(damage)} DMG${isCrit ? ' 💥 CRIT!' : ''}${isWeak ? ' ✨ Weak Hit!' : ''}`);
      if (e.toughness === 0 && e.hp > 0) logs.push(`  ⚠️ *WEAKNESS BROKEN!*`);
    } else {
      // Buff/heal skill
      logs.push(`🔷 *${actor.name}* menggunakan Skill: *${skillData?.name || 'Skill'}*`);
      logs.push(`  ✨ ${skillData?.desc || 'Efek buff aktif!'}`);
      // Simple heal effect for healers
      if (skillData?.type === 'heal') {
        const healAmt = Math.floor(actor.atk * 0.4);
        const lowestHP = [...combat.party].filter(m => m.isAlive).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
        if (lowestHP) {
          lowestHP.hp = Math.min(lowestHP.maxHp, lowestHP.hp + healAmt);
          logs.push(`  💚 *${lowestHP.name}* pulih ${fmt(healAmt)} HP!`);
        }
      }
    }
    // Energy regen on skill
    actor.energy = Math.min(actor.maxEnergy, (actor.energy || 0) + 30);
  }

  // ── Ultimate ──────────────────────────────────────
  else if (actionType === 'ult') {
    if ((actor.energy || 0) < actor.maxEnergy) {
      return { success: false, msg: `❌ Energy belum penuh!\nEnergy: ${actor.energy}/${actor.maxEnergy}\n\nGunakan *!hsratk* atau *!hsrskill* untuk isi energy.` };
    }

    const skillData = (CHARACTERS[actor.key] || TRAILBLAZER)?.skills?.ult;
    const dmgMult = (skillData?.dmgMult || 1.5) * (1 + (skillLevels.ult - 1) * 0.05);

    if (dmgMult > 0) {
      const isWeak = isWeaknessMatch(actor.element, e.weaknesses);
      const { damage, isCrit, toughnessReduction } = calcDamage(actor, dmgMult * 1.5, e, isWeak);
      applyDamage(e, damage, toughnessReduction);

      logs.push(`✨✨ *${actor.name}* Ultimate: *${skillData?.name || 'Ultimate'}* ✨✨`);
      logs.push(`  🌟 ${fmt(damage)} DMG${isCrit ? ' 💥 CRIT!' : ''}${isWeak ? ' ✨ Weak Hit!' : ''}`);
    } else if (skillData?.type === 'heal') {
      const healAmt = Math.floor(actor.atk * 0.8 + actor.maxHp * 0.15);
      combat.party.filter(m => m.isAlive).forEach(m => {
        const h = Math.floor(healAmt * (0.8 + Math.random() * 0.4));
        m.hp = Math.min(m.maxHp, m.hp + h);
      });
      logs.push(`💊 *${actor.name}* Ultimate: *${skillData?.name || 'Heal'}*`);
      logs.push(`  💚 Seluruh party dipulihkan HP-nya!`);
    } else if (skillData?.type === 'buff' || skillData?.type === 'shield') {
      logs.push(`🌟 *${actor.name}* Ultimate: *${skillData?.name || 'Buff'}*`);
      logs.push(`  ✨ ${skillData?.desc || 'Buff tim aktif!'}`);
    }

    // Reset energy after ult
    actor.energy = 0;
  }

  // Check enemy defeated
  if (e.hp <= 0) {
    combat.phase = 'end';
    combat.result = 'win';
    return { success: true, logs, ended: true, result: 'win' };
  }

  // Check all party dead
  const anyAlive = combat.party.some(m => m.isAlive);
  if (!anyAlive) {
    combat.phase = 'end';
    combat.result = 'lose';
    return { success: true, logs, ended: true, result: 'lose' };
  }

  // ── Enemy turn ────────────────────────────────────
  const enemyLogs = doEnemyTurn(combat);
  logs.push(...enemyLogs);

  // Check party again after enemy attack
  const stillAlive = combat.party.some(m => m.isAlive);
  if (!stillAlive) {
    combat.phase = 'end';
    combat.result = 'lose';
    return { success: true, logs, ended: true, result: 'lose' };
  }

  // Advance turn / action order
  combat.turn++;
  const aliveKeys = combat.party.filter(m => m.isAlive).map(m => m.key);
  const nextIdx = (combat.actionOrder.indexOf(combat.currentActor) + 1) % aliveKeys.length;
  combat.currentActor = aliveKeys[nextIdx] || aliveKeys[0];

  return { success: true, logs, ended: false };
}

// ── BUILD COMBAT UI ───────────────────────────────────
function buildCombatUI(combat) {
  const e = combat.enemy;
  let msg = `╔══════════════════════════════╗\n`;
  msg += `║ ⚔️ BATTLE — Turn ${combat.turn}         ║\n`;
  msg += `╚══════════════════════════════╝\n\n`;

  msg += `👾 *${e.name}* [${e.type.toUpperCase()}]\n`;
  msg += `HP: ${hpBar(e.hp, e.maxHp, 10)} ${fmt(e.hp)}/${fmt(e.maxHp)}\n`;
  if (!e.isWeaknessBreoken) {
    msg += `🔶 ${toughnessBar(e.toughness, e.maxToughness)} ${e.toughness}/${e.maxToughness}\n`;
    msg += `Weakness: ${e.weaknesses.join(' · ')}\n`;
  } else {
    msg += `⚠️ *WEAKNESS BROKEN* — DEF ↓\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⚡ SP: ${'🟡'.repeat(combat.sp)}${'⚫'.repeat(combat.maxSp - combat.sp)} (${combat.sp}/${combat.maxSp})\n\n`;

  msg += `🧑‍🚀 *Party:*\n`;
  for (const member of combat.party) {
    const tag = member.key === combat.currentActor ? '▶' : '  ';
    if (!member.isAlive) {
      msg += `${tag} ❌ *${member.name}* [DEFEATED]\n`;
      continue;
    }
    msg += `${tag} ${getElementIcon(member.element)} *${member.name}* Lv.${member.level}\n`;
    msg += `    HP: ${hpBar(member.hp, member.maxHp, 8)} ${member.hp}/${member.maxHp}\n`;
    msg += `    ⚡ ${energyBar(member.energy, member.maxEnergy, 6)} ${member.energy}/${member.maxEnergy}`;
    if (member.energy >= member.maxEnergy) msg += ` 💫 ULT READY!`;
    msg += `\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Giliran: *${getActorName(combat)}*\n\n`;
  msg += `⚔️ *Aksi:*\n`;
  msg += `!hsratk    — Basic Attack (+1 SP)\n`;
  msg += `!hsrskill  — Skill (-1 SP)\n`;
  msg += `!hsrult    — Ultimate (butuh Energy penuh)\n`;
  msg += `!hsrescape — Kabur dari pertarungan\n`;

  return msg;
}

// ── BUILD WIN/LOSE RESULT ─────────────────────────────
function buildResultMsg(user, combat, result, rewards) {
  const e = combat.enemy;
  let msg = '';

  if (result === 'win') {
    msg += `╔══════════════════════════════╗\n`;
    msg += `║  🏆 KEMENANGAN!              ║\n`;
    msg += `╚══════════════════════════════╝\n\n`;
    msg += `👾 *${e.name}* telah dikalahkan!\n`;
    msg += `⚔️ Durasi: Turn ke-${combat.turn}\n\n`;
    msg += `🎁 *Rewards:*\n`;
    msg += `  🔵 Credits : +${fmt(rewards.credits)}\n`;
    msg += `  📊 TL EXP  : +${fmt(rewards.exp)}\n`;
    if (rewards.material) msg += `  🔮 Material: ${rewards.material}\n`;
    msg += `\n`;
    if (rewards.leveled) {
      msg += `🎉 *Trailblaze Level Up!* → Lv.${user.trailblazeLv}\n\n`;
    }
    msg += `💰 Credits sekarang: ${fmt(user.credits)}\n`;
    msg += `💎 Jade sekarang   : ${fmt(user.stellarJade)}\n\n`;
    msg += `Ketik *!hsrbattle* untuk battle lagi!`;
  } else {
    msg += `╔══════════════════════════════╗\n`;
    msg += `║  💀 KEKALAHAN                ║\n`;
    msg += `╚══════════════════════════════╝\n\n`;
    msg += `❌ Seluruh party telah gugur...\n`;
    msg += `👾 *${e.name}* masih bertahan!\n\n`;
    msg += `💡 *Tips:* Level up karakter atau ubah party!\n`;
    msg += `  !hsrlevelup — Level up karakter\n`;
    msg += `  !hsrsetparty — Ubah party\n`;
    msg += `  !hsrheal — Pulihkan HP\n\n`;
    msg += `Ketik *!hsrbattle* untuk coba lagi!`;
  }
  return msg;
}

// ══════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ══════════════════════════════════════════════════════
module.exports = {
  command: ['hsrbattle', 'hsratk', 'hsrskill', 'hsrult', 'hsrescape', 'hsrenemy'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { command, args, sender, replyalya } = ctx;
    const userId = sender;

    const user = getUser(userId);
    if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrstart* untuk mulai.`);

    // ──────────────────────────────────────────────────
    // !hsrenemy — Daftar musuh yang tersedia
    // ──────────────────────────────────────────────────
    if (command === 'hsrenemy') {
      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  👾 DAFTAR MUSUH HSR         ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;

      const groups = { basic: [], elite: [], boss: [] };
      for (const [key, e] of Object.entries(ENEMIES)) {
        groups[e.type]?.push({ key, ...e });
      }

      for (const [type, list] of Object.entries(groups)) {
        const label = type === 'basic' ? '⚔️ Basic' : type === 'elite' ? '🔴 Elite' : '👑 Boss';
        msg += `*${label}:*\n`;
        for (const e of list) {
          msg += `  • *${e.name}*\n`;
          msg += `    HP: ${fmt(e.hp)} | Toughness: ${e.toughness}\n`;
          msg += `    Weakness: ${e.weaknesses.join(', ')}\n`;
        }
        msg += `\n`;
      }
      msg += `Ketik *!hsrbattle* untuk lawan musuh random!`;
      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrbattle — Mulai pertarungan baru
    // ──────────────────────────────────────────────────
    if (command === 'hsrbattle') {
      // Jika sudah ada combat aktif, tampilkan state
      if (user.combat && user.combat.phase !== 'end') {
        return replyalya(
          `⚔️ Kamu sedang dalam pertarungan!\n\n` +
          buildCombatUI(user.combat)
        );
      }

      // Cek party ada dan valid
      const party = user.party || [];
      if (party.length === 0) return replyalya(`❌ Party kosong!\nKetik *!hsrsetparty* untuk atur party.`);

      const aliveInParty = party.filter(k => {
        const save = user.characters[k];
        return save && (save.hp || 0) > 0;
      });

      if (aliveInParty.length === 0) {
        return replyalya(
          `❌ Semua anggota party HP-nya habis!\n\n` +
          `Ketik *!hsrheal confirm* untuk pulihkan HP party.\n` +
          `Biaya: Credits`
        );
      }

      // Pilih musuh
      const { key: enemyKey, data: enemyData } = pickEnemy(user.trailblazeLv);

      // Init combat
      user.combat = initCombat(user, enemyData, enemyKey);
      saveUser(userId, user);

      let msg = `⚔️ *Pertarungan Dimulai!*\n\n`;
      msg += `👾 Musuh: *${enemyData.name}* [${enemyData.type.toUpperCase()}]\n`;
      msg += `🔴 Weakness: ${enemyData.weaknesses.join(', ')}\n\n`;
      msg += buildCombatUI(user.combat);

      return replyalya(msg);
    }

    // ──────────────────────────────────────────────────
    // !hsrescape — Kabur dari pertarungan
    // ──────────────────────────────────────────────────
    if (command === 'hsrescape') {
      if (!user.combat || user.combat.phase === 'end') {
        return replyalya(`❌ Kamu tidak sedang bertarung.`);
      }

      user.stats = user.stats || {};
      user.stats.escapes = (user.stats.escapes || 0) + 1;
      user.combat = null;
      saveUser(userId, user);

      return replyalya(
        `🏃 *Berhasil kabur!*\n\n` +
        `Kamu melarikan diri dari pertarungan.\n` +
        `Tidak ada reward yang didapat.\n\n` +
        `Pulihkan HP dengan *!hsrheal*\n` +
        `Ketik *!hsrbattle* untuk coba lagi!`
      );
    }

    // ──────────────────────────────────────────────────
    // Actions: !hsratk, !hsrskill, !hsrult
    // ──────────────────────────────────────────────────
    if (['hsratk', 'hsrskill', 'hsrult'].includes(command)) {
      if (!user.combat || user.combat.phase === 'end') {
        return replyalya(`❌ Tidak ada pertarungan aktif!\nKetik *!hsrbattle* untuk mulai.`);
      }

      const actionMap = { hsratk: 'basic', hsrskill: 'skill', hsrult: 'ult' };
      const actionType = actionMap[command];

      const actionResult = processPlayerAction(user, actionType);
      if (!actionResult.success) return replyalya(actionResult.msg);

      // Build log output
      let msg = ``;
      for (const log of actionResult.logs) msg += `${log}\n`;
      msg += `\n`;

      if (actionResult.ended) {
        const result = actionResult.result;
        user.stats = user.stats || {};
        user.stats.totalBattles = (user.stats.totalBattles || 0) + 1;

        if (result === 'win') {
          user.stats.wins = (user.stats.wins || 0) + 1;
          user.stats.enemiesDefeated = (user.stats.enemiesDefeated || 0) + 1;

          const enemyKey = user.combat.enemyKey;
          const enemyData = ENEMIES[enemyKey];
          const combatTurn = user.combat.turn; // ✅ simpan sebelum null
          const rewards = calcRewards(enemyData, user.party.length);

          user.credits += rewards.credits;
          user.stellarJade = (user.stellarJade || 0) + rnd(5, 15);
          const jadeGained = rnd(5, 15); // sudah ditambahkan di atas, pakai nilai tetap untuk display

          const expResult = applyExp(user, rewards.exp);
          rewards.leveled = expResult.leveled;

          // Sync HP back to user.characters from combat party
          for (const member of user.combat.party) {
            if (user.characters[member.key]) {
              user.characters[member.key].hp = member.hp;
              user.characters[member.key].energy = member.energy || 0;
            }
          }

          user.combat = null;
          saveUser(userId, user);

          msg = (actionResult.logs.map(l => l).join('\n')) + '\n\n' +
            `╔══════════════════════════════╗\n║  🏆 KEMENANGAN!              ║\n╚══════════════════════════════╝\n\n` +
            `👾 *${enemyData.name}* telah dikalahkan!\n` +
            `⚔️ Durasi: Turn ke-${combatTurn}\n\n` +
            `🎁 *Rewards:*\n` +
            `  🔵 Credits : +${fmt(rewards.credits)}\n` +
            `  📊 TL EXP  : +${fmt(rewards.exp)}\n` +
            `  💎 Jade    : +${jadeGained}\n` +
            (rewards.material ? `  🔮 Material: ${rewards.material}\n` : '') +
            (expResult.leveled ? `\n🎉 *Trailblaze Level Up!* → Lv.${user.trailblazeLv}\n` : '') +
            `\n💰 Credits: ${fmt(user.credits)} | 💎 Jade: ${fmt(user.stellarJade)}\n\n` +
            `Ketik *!hsrbattle* untuk battle lagi!`;

        } else {
          user.stats.losses = (user.stats.losses || 0) + 1;

          // Keep HP at 1 for all party members (not dead permanently)
          for (const member of user.combat.party) {
            if (user.characters[member.key]) {
              user.characters[member.key].hp = 1;
            }
          }

          user.combat = null;
          saveUser(userId, user);

          msg += `╔══════════════════════════════╗\n║  💀 KEKALAHAN                ║\n╚══════════════════════════════╝\n\n`;
          msg += `❌ Seluruh party gugur...\n\n`;
          msg += `💡 *Tips:*\n  !hsrlevelup — Level up karakter\n  !hsrheal — Pulihkan HP\n  !hsrsetparty — Ubah party\n\n`;
          msg += `Ketik *!hsrbattle* untuk coba lagi!`;
        }
      } else {
        // Battle ongoing
        saveUser(userId, user);
        msg += buildCombatUI(user.combat);
      }

      return replyalya(msg);
    }
  }
};
