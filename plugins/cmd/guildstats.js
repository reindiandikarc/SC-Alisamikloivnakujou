// plugins/cmd/guildstats.js
// Alya V20 — Guild System
// Command: guildstats
// Menampilkan status guild: anggota, kontribusi, penyelesaian misi, pendapatan
'use strict';

const path = require('path');
const Guild = require(path.join(__dirname, '..', '..', 'lib', 'guild.js'));

let W = {};
try { W = require(path.join(__dirname, '..', '..', 'lib', 'weapons.js')); } catch (e) {
  console.error('[guildstats] gagal load lib/weapons.js:', e.message);
}

function fmtMoney(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
}

module.exports = {
  command: ['guildstats'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak, sender, pushname } = ctx;
    const g = Guild.ensureGuildDb();

    if (!Guild.isGuildMember(sender)) {
      return replytolak(`❌ Kamu belum terdaftar di Guild!\nKetik *${prefix}guild daftar* dulu.`);
    }

    const member = Guild.getMember(sender);
    const myParty = Guild.getPartyOfMember(sender);

    // ✅ FIX — Rank Guild sekarang murni dari POWER LEVEL (bukan kontribusi
    // lagi). Sinkronkan rank member dengan power level TERKINI setiap kali
    // .guildstats dibuka, supaya rank yang tampil selalu up-to-date (misal
    // habis naik level/upgrade weapon setelah daftar guild).
    const userDataLive = global.db?.users?.[sender] || {};
    const powerLevel = Guild.getPowerLevel(userDataLive, W);
    Guild.refreshMemberRank(sender, userDataLive, W);

    const nextRankIdx = Guild.rankIndex(member.rank) + 1;
    const nextRank = Guild.RANKS[nextRankIdx];
    const nextThreshold = nextRank ? Guild.RANK_THRESHOLD[nextRank] : null;

    let text = `╭─「 🏰 *GUILD STATS* 」\n│\n`;
    text += `│ 👤 *Nama       :* ${pushname}\n`;
    text += `│ ⚡ *Power Level:* ${powerLevel}\n`;
    text += `│ 🎖️ *Rank Guild :* ${member.rank}` +
      (nextRank ? ` (${Math.max(0, nextThreshold - powerLevel)} power lagi ke ${nextRank})` : ' (MAX)') + `\n`;
    text += `│ 🏅 *Kontribusi :* ${member.contribution.toLocaleString('id-ID')} _(statistik, tidak memengaruhi rank)_\n`;
    text += `│\n`;
    text += `│ 📜 *Misi Solo Selesai  :* ${member.questsSolo || 0}\n`;
    text += `│ 📜 *Misi Party Selesai :* ${member.questsParty || 0}\n`;
    text += `│ 💰 *Total Pendapatan   :* ${fmtMoney(member.earnings || 0)}\n`;

    if (member.activeQuest) {
      text += `│\n│ 🔄 *Misi Aktif:* ${member.activeQuest.name} (cek: *${prefix}guildcheckquest*)\n`;
    }

    if (myParty) {
      text += `│\n│ ━━━━━━━━━━━━━━━━━━━\n`;
      text += `│ 👥 *PARTY: ${myParty.id}*\n`;
      text += `│ 👑 Leader: ${myParty.leader === sender ? 'Kamu' : '@' + myParty.leader.split('@')[0]}\n`;
      text += `│ 👤 Anggota (${myParty.members.length}/${myParty.maxMember}):\n`;
      myParty.members.forEach(jid => {
        text += `│   • @${jid.split('@')[0]}${jid === myParty.leader ? ' 👑' : ''}\n`;
      });
      if (myParty.activeQuest) {
        text += `│ 🔄 Misi Aktif: ${myParty.activeQuest.name} (cek: *${prefix}guildcheckquest*)\n`;
      } else if (myParty.pendingQuest) {
        const acceptedCount = Object.values(myParty.pendingQuest.votes).filter(v => v === 'accept').length;
        text += `│ 📨 Proposal Misi: ${myParty.pendingQuest.quest.name} (${acceptedCount}/${myParty.members.length} setuju)\n`;
      } else {
        text += `│ 🟢 Status: Menunggu misi\n`;
      }
    }

    // Statistik global guild
    const allMembers = Object.entries(g.members);
    const totalMembers = allMembers.length;
    const totalQuestsSolo = allMembers.reduce((s, [, v]) => s + (v.questsSolo || 0), 0);
    const totalQuestsParty = g.log.filter(l => l.type === 'party').length;
    const totalIncome = allMembers.reduce((s, [, v]) => s + (v.earnings || 0), 0);

    const top3 = allMembers
      .sort((a, b) => (b[1].contribution || 0) - (a[1].contribution || 0))
      .slice(0, 3);

    text += `│\n│ ━━━━━━━━━━━━━━━━━━━\n`;
    text += `│ 🌐 *STATISTIK GUILD GLOBAL*\n`;
    text += `│ 👥 Total Anggota      : ${totalMembers}\n`;
    text += `│ ✅ Misi Solo Selesai  : ${totalQuestsSolo}\n`;
    text += `│ ✅ Misi Party Selesai : ${totalQuestsParty}\n`;
    text += `│ 💰 Total Pendapatan Guild : ${fmtMoney(totalIncome)}\n`;
    if (top3.length) {
      text += `│\n│ 🏆 *Top Kontributor:*\n`;
      top3.forEach(([jid, v], i) => {
        const medal = ['🥇', '🥈', '🥉'][i];
        text += `│   ${medal} @${jid.split('@')[0]} — ${v.contribution.toLocaleString('id-ID')} poin (${v.rank})\n`;
      });
    }
    text += `╰──────────────────`;

    const mentionSet = new Set();
    if (myParty) myParty.members.forEach(j => mentionSet.add(j));
    top3.forEach(([jid]) => mentionSet.add(jid));

    await alya.sendMessage(m.chat, { react: { text: '📊', key: m.key } });
    return replyalya(text, { mentions: [...mentionSet] });
  }
};
