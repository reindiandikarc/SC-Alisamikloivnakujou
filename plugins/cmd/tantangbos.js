// plugins/cmd/tantangbos.js
// Alya V20 — Command .tantangbos
// Fitur SOLO player (BUKAN party/guild). Player menantang Boss sesuai tier,
// tier makin tinggi butuh level duel minimal makin besar & reward makin besar.
// Tier: Common -> Epic -> Legend -> Mythic -> King Devil
// Menang: dapat uang + exp besar (dipengaruhi peringkat duel: S/SS/SSR dapat lebih besar),
//         lalu tier itu masuk cooldown (1-3 jam tergantung tier).
// Kalah : kena penalti kecil uang & exp sebagai risiko, boleh coba lagi kapan saja
//         (kecuali tier tsb masih cooldown dari kemenangan sebelumnya).
'use strict';

const path = require('path');
const Boss = require(path.join(__dirname, '..', '..', 'lib', 'guildboss.js'));

let PlayerLevel = {};
try { PlayerLevel = require(path.join(__dirname, '..', '..', 'lib', 'playerlevel.js')); } catch (e) {
  console.error('[tantangbos] gagal load lib/playerlevel.js:', e.message);
}

function fmtMoney(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
}

function fmtDuration(ms) {
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

function tierListText(prefix, duelLvl) {
  const lines = Boss.BOSS_TIERS.map((t, i) => {
    const eligible = duelLvl >= t.minLevel;
    const mark = eligible ? '✅' : '🔒';
    return (
      `${mark} *[${i + 1}] ${t.emoji} ${t.label}* ${'⭐'.repeat(t.stars)}\n` +
      `     Syarat Level: *${t.minLevel}+* | Min. Reward: ${fmtMoney(t.moneyBase)}`
    );
  }).join('\n\n');
  return (
    `╭─「 👹 *TANTANG BOSS* 」\n│\n` +
    lines.replace(/^/gm, '│ ').replace(/│ $/gm, '│') +
    `\n│\n│ 📌 Cara main: *${prefix}tantangbos <nomor/nama tier>*\n` +
    `│ Contoh: *${prefix}tantangbos common* atau *${prefix}tantangbos 1*\n` +
    `╰──────────────────`
  );
}

function resolveTierArg(arg) {
  if (!arg) return null;
  const a = arg.toLowerCase().trim();
  const byIndex = Boss.BOSS_TIERS[parseInt(a) - 1];
  if (byIndex) return byIndex.key;
  const aliasMap = {
    common: 'common',
    epic: 'epic',
    legend: 'legend', legendary: 'legend',
    mythic: 'mythic',
    kingdevil: 'kingdevil', 'king-devil': 'kingdevil', king: 'kingdevil', devil: 'kingdevil'
  };
  const normalized = a.replace(/\s+/g, '');
  if (aliasMap[normalized]) return aliasMap[normalized];
  const found = Boss.BOSS_TIERS.find(t => t.key === normalized || t.label.toLowerCase().replace(/\s+/g, '') === normalized);
  return found ? found.key : null;
}

module.exports = {
  command: ['tantangbos', 'tantangboss'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, prefix, reply, replyalya, replytolak, sender, pushname } = ctx;

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const userData = global.db.users[sender];
    const duelLvl = parseInt(userData.duelLvl) || 0;

    // ── Tanpa argumen -> tampilkan daftar tier ──────────────────────────
    if (!args[0]) {
      return replyalya(tierListText(prefix, duelLvl));
    }

    const tierKey = resolveTierArg(args[0]);
    if (!tierKey) {
      return replytolak(
        `❌ Tier boss tidak dikenali!\n` +
        `Ketik *${prefix}tantangbos* untuk lihat daftar tier yang tersedia.`
      );
    }

    const tier = Boss.getTier(tierKey);

    // ── Cek eligibility (level minimal & cooldown) ──────────────────────
    const check = Boss.checkEligibility(sender, tierKey, duelLvl);
    if (!check.ok) {
      if (check.reason === 'level') {
        return replytolak(
          `╭─「 🔒 *BELUM MEMENUHI SYARAT* 」\n│\n` +
          `│ Boss ${tier.emoji} *${tier.label}* butuh minimal level *${check.needLevel}*.\n` +
          `│ Level kamu saat ini: *${check.haveLevel}*\n│\n` +
          `│ Terus berlatih lewat *.duel* dan selesaikan misi guild\n` +
          `│ untuk menaikkan level, ${pushname}!\n` +
          `╰──────────────────`
        );
      }
      if (check.reason === 'cooldown') {
        return replytolak(
          `⏳ Boss ${tier.emoji} *${tier.label}* masih cooldown!\n` +
          `Kamu baru saja mengalahkannya. Coba lagi dalam *${fmtDuration(check.remainingMs)}*.`
        );
      }
      return replytolak(`❌ Tidak bisa menantang boss ini saat ini.`);
    }

    // ── Tentukan peringkat duel player (buat scaling reward) ────────────
    let duelRankKey = 'E';
    if (PlayerLevel.getRankInfo) {
      const tierInfo = PlayerLevel.getRankInfo(duelLvl);
      duelRankKey = tierInfo.key === 'WARGA' ? 'E' : tierInfo.key;
    }

    const bossName = Boss.pickBossName(tier);
    await alya.sendMessage(m.chat, { react: { text: tier.emoji, key: m.key } });

    // ── Resolusi pertarungan ─────────────────────────────────────────────
    const battle = Boss.resolveBattle(tierKey, duelLvl);

    if (battle.won) {
      const reward = Boss.calcBossReward(tierKey, duelRankKey);
      userData.money = (userData.money || 0) + reward.money;
      userData.exp = (userData.exp || 0) + reward.xp;
      Boss.recordWin(sender, tierKey);

      return replyalya(
        `╭─「 🏆 *BOSS TUMBANG!* 」\n│\n` +
        `│ ${tier.emoji} Kamu berhasil mengalahkan\n` +
        `│ *${bossName}*\n` +
        `│ Tier: ${tier.label} ${'⭐'.repeat(tier.stars)}\n│\n` +
        `│ 💰 *Reward Uang:* ${fmtMoney(reward.money)}\n` +
        `│ ✨ *Reward EXP:* ${reward.xp.toLocaleString('id-ID')}\n` +
        `│ ${PlayerLevel.getRankInfo ? PlayerLevel.getRankInfo(duelLvl).emoji : ''} *Peringkat:* ${duelRankKey}\n│\n` +
        `│ ⏳ Boss ini cooldown *${fmtDuration(tier.cooldownMs)}* sebelum bisa ditantang lagi.\n` +
        `╰──────────────────`
      );
    } else {
      const penalty = Boss.calcLoseePenalty(userData.money);
      userData.money = Math.max(0, (userData.money || 0) - penalty.money);
      userData.exp = Math.max(0, (userData.exp || 0) - penalty.exp);
      Boss.recordLoss(sender, tierKey);

      return replytolak(
        `╭─「 💀 *KALAH!* 」\n│\n` +
        `│ ${tier.emoji} *${bossName}* terlalu kuat...\n` +
        `│ Tier: ${tier.label} ${'⭐'.repeat(tier.stars)}\n│\n` +
        `│ 📉 *Kehilangan Uang:* -${fmtMoney(penalty.money)}\n` +
        `│ 📉 *Kehilangan EXP:* -${penalty.exp}\n│\n` +
        `│ Latihan lebih giat dan coba lagi, ${pushname}!\n` +
        `│ (Tidak ada cooldown tambahan karena kalah)\n` +
        `╰──────────────────`
      );
    }
  }
};
