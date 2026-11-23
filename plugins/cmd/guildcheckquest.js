// plugins/cmd/guildcheckquest.js
// Alya V20 — Guild System
// Command: guildcheckquest
// Cek progress misi (solo/party) yang sedang berjalan.
// Jika sudah >= 1 jam dan belum diselesaikan (.guild selesai), tampilkan rekap lengkap perjalanan.
'use strict';

const path = require('path');
const Guild = require(path.join(__dirname, '..', '..', 'lib', 'guild.js'));

function fmtMoney(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
}

function fmtClock(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function renderCheckpoints(checkpoints) {
  return checkpoints.map((c, i) => `   ${i + 1}. [${fmtClock(c.at)}] ${c.text}`).join('\n');
}

function renderQuestStatus(aq, prefix, ctxLabel) {
  const now = Date.now();
  const elapsed = now - aq.startedAt;
  const remaining = Math.max(0, aq.durationMs - elapsed);
  const progressRatio = Math.min(1, elapsed / aq.durationMs);
  const barLen = 10;
  const filled = Math.round(progressRatio * barLen);
  const bar = '▰'.repeat(filled) + '▱'.repeat(barLen - filled);

  const checkpoints = Guild.buildCheckpointLog(aq, now);
  const stale = Guild.isQuestStale(aq, now);
  const ready = Guild.isQuestReadyToComplete(aq, now);

  let header = `${aq.typeEmoji} *${aq.name}*`;
  let body =
    `│ Tipe: ${aq.typeLabel} | Rank ${aq.diffLabel} ${'⭐'.repeat(aq.stars)}\n` +
    `│ ${ctxLabel}\n` +
    `│\n` +
    `│ 📊 Progress: ${bar} ${Math.round(progressRatio * 100)}%\n` +
    `│ ⏱️ Berjalan: ${Guild.formatDuration(elapsed)} | Sisa: ${ready ? 'SELESAI ✅' : Guild.formatDuration(remaining)}\n` +
    `│\n` +
    `│ 📝 *Log Perjalanan:*\n` +
    checkpoints.map(c => `│   • [${fmtClock(c.at)}] ${c.text}`).join('\n');

  let footer;
  if (stale) {
    footer =
      `\n│\n` +
      `│ ⚠️ *Misi sudah didiamkan lebih dari 1 jam!*\n` +
      `│ Berikut rekap LENGKAP semua yang telah terjadi selama misi ini` +
      (ready ? `.\n│ Segera ketik *${prefix}guild selesai* untuk klaim reward!` : `, misi masih berjalan hingga waktu estimasi selesai.`);
  } else if (ready) {
    footer = `\n│\n│ ✅ Misi sudah bisa diselesaikan!\n│ Ketik *${prefix}guild selesai* untuk klaim reward.`;
  } else {
    footer = `\n│\n│ 📌 Ketik *${prefix}guildcheckquest* lagi untuk update progress.`;
  }

  return `╭─「 🔎 *STATUS MISI* 」\n│\n│ ${header}\n${body}${footer}\n╰──────────────────`;
}

module.exports = {
  command: ['guildcheckquest'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak, sender, pushname } = ctx;

    if (!Guild.isGuildMember(sender)) {
      return replytolak(`❌ Kamu belum terdaftar di Guild!\nKetik *${prefix}guild daftar* dulu.`);
    }

    const member = Guild.getMember(sender);
    const myParty = Guild.getPartyOfMember(sender);

    // Cek misi party dulu (kalau kamu leader/anggota party yang sedang jalan misi)
    if (myParty && myParty.activeQuest) {
      const aq = myParty.activeQuest;
      const ctxLabel = `👥 Party ${myParty.id} (${myParty.members.length} anggota)`;
      await alya.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });
      return replyalya(renderQuestStatus(aq, prefix, ctxLabel));
    }

    // Cek misi solo
    if (member.activeQuest) {
      const aq = member.activeQuest;
      const ctxLabel = `👤 Misi Solo — ${pushname}`;
      await alya.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });
      return replyalya(renderQuestStatus(aq, prefix, ctxLabel));
    }

    // Tidak ada misi aktif sama sekali
    if (myParty) {
      return replyalya(
        `📋 Party kamu (*${myParty.id}*) tidak sedang menjalankan misi apapun.\n` +
        `Ketik *${prefix}guild quest* untuk lihat papan misi party.`
      );
    }
    return replyalya(
      `📋 Kamu tidak sedang menjalankan misi apapun.\n` +
      `Ketik *${prefix}guild quest* untuk lihat papan misi solo.`
    );
  }
};
