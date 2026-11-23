// plugins/cmd/guild.js
// Alya V20 — Guild System
// Commands: guild daftar | quest | start <no> | serang | penjagaan | ekspedisi
//           guild party join <no> | guild create | guild accept | guild reject | guild selesai
'use strict';

const path = require('path');
const Guild = require(path.join(__dirname, '..', '..', 'lib', 'guild.js'));

let PlayerLevel = {};
try { PlayerLevel = require(path.join(__dirname, '..', '..', 'lib', 'playerlevel.js')); } catch (e) {
  console.error('[guild] gagal load lib/playerlevel.js:', e.message);
}

let W = {};
try { W = require(path.join(__dirname, '..', '..', 'lib', 'weapons.js')); } catch (e) {
  console.error('[guild] gagal load lib/weapons.js:', e.message);
}

function fmtMoney(n) {
  return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
}

// Ambil peringkat duel player (E..SSR) dari lib/playerlevel.js, dipakai untuk
// menentukan papan quest mana yang ditampilkan (reguler E-A vs elite S/SS/SSR)
// dan sebagai multiplier reward uang/XP quest.
function getDuelRankKey(duelLvl) {
  if (!PlayerLevel.getRankInfo) return 'E';
  const tier = PlayerLevel.getRankInfo(duelLvl);
  return tier.key === 'WARGA' ? 'E' : tier.key;
}

function questLine(q, idx) {
  const stars = '⭐'.repeat(q.stars);
  const eliteTag = q.isElite ? ' 🌟 *[ELITE]*' : '';
  return (
    `*[${idx + 1}]* ${q.typeEmoji} *${q.name}*${eliteTag}\n` +
    `     Tipe: ${q.typeLabel} | Rank ${q.diffLabel} ${stars}\n` +
    `     ⏱️ Durasi: ${Guild.formatDuration(q.durationMs)} | 💰 ${fmtMoney(q.moneyReward)} | ✨ ${q.xpReward} XP | 🏅 +${q.contribReward} Kontribusi` +
    (q.isParty ? `\n     👥 Min. Anggota: ${q.minMember}` : '')
  );
}

function boardText(board, headerTitle) {
  if (!board.length) {
    return `╭─「 📋 *${headerTitle}* 」\n│\n│ Tidak ada misi tersedia saat ini.\n╰──────────────────`;
  }
  const lines = board.map((q, i) => questLine(q, i)).join('\n\n');
  return (
    `╭─「 📋 *${headerTitle}* 」\n│\n` +
    lines.replace(/^/gm, '│ ').replace(/│ $/gm, '│') +
    `\n│\n╰──────────────────`
  );
}

module.exports = {
  command: ['guild'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, reply, replyalya, replytolak, sender, pushname } = ctx;
    const g = Guild.ensureGuildDb();

    const userData = global.db?.users?.[sender] || {};
    const sub = (args[0] || '').toLowerCase();

    // ══════════════════════════════════════════════
    // .guild daftar
    // ══════════════════════════════════════════════
    if (sub === 'daftar') {
      if (!userData.class) {
        return replytolak(
          `❌ Kamu belum pilih class!\n` +
          `Ketik *${prefix}selectclass* dulu sebelum daftar guild.`
        );
      }
      if (Guild.isGuildMember(sender)) {
        return replytolak(`⚠️ Kamu sudah terdaftar di Guild, ${pushname}!`);
      }

      // ── CEK LEVEL DUEL DULU (syarat masuk Guild Petualang) ──────────────
      const duelLvl = parseInt(userData.duelLvl) || 0;
      if (PlayerLevel.getRankInfo) {
        const rankSummary = PlayerLevel.buildRankSummary(duelLvl, pushname);
        if (!rankSummary.eligible) {
          // Belum cukup level (masih Warga Biasa, level 0-9) — tolak + kasih motivasi
          await alya.sendMessage(m.chat, { react: { text: '💭', key: m.key } });
          return replytolak(
            `╭─「 🏰 *PENDAFTARAN GUILD DITOLAK* 」\n│\n` +
            rankSummary.text.split('\n').map(l => `│ ${l}`).join('\n') +
            `\n╰──────────────────`
          );
        }

        Guild.registerMember(sender);
        const member = Guild.getMember(sender);
        // ✅ FIX KRITIS — Rank Guild sekarang ditentukan dari POWER LEVEL saat
        // mendaftar (duelLvl + sedikit tambahan dari weapon yang di-equip),
        // BUKAN selalu mulai dari F lagi, dan BUKAN dari kontribusi. Power
        // level tinggi = rank guild awal langsung tinggi, sesuai kekuatan
        // tempur riil player saat itu.
        const powerLevel = Guild.getPowerLevel(userData, W);
        const guildRank = Guild.getRankFromPowerLevel(powerLevel);
        member.rank = guildRank;

        await alya.sendMessage(m.chat, { react: { text: '🏰', key: m.key } });
        return replyalya(
          `╭─「 🏰 *SELAMAT DATANG DI GUILD!* 」\n` +
          `│\n` +
          `│ 👤 *Nama          :* ${pushname}\n` +
          `│ ${rankSummary.tier.emoji} *Peringkat Duel :* ${rankSummary.tier.label} (Level ${duelLvl})\n` +
          `│ ⚡ *Power Level   :* ${powerLevel}\n` +
          `│ 🎖️ *Rank Guild    :* ${guildRank}\n` +
          `│\n│ ${rankSummary.tier.desc}\n` +
          `│\n` +
          `│ 📌 Kamu sekarang resmi jadi anggota Guild Petualang!\n` +
          `│ Rank Guild kamu ditentukan dari Power Level (level + weapon),\n` +
          `│ jadi makin kuat build kamu, makin tinggi rank guild awalmu.\n` +
          `│ Ketik *${prefix}guild quest* untuk lihat papan misi.\n` +
          `╰──────────────────`
        );
      }

      // Fallback kalau lib/playerlevel.js gagal load
      Guild.registerMember(sender);
      const powerLevelFallback = Guild.getPowerLevel(userData, W);
      const guildRankFallback = Guild.getRankFromPowerLevel(powerLevelFallback);
      const memberFallback = Guild.getMember(sender);
      memberFallback.rank = guildRankFallback;
      await alya.sendMessage(m.chat, { react: { text: '🏰', key: m.key } });
      return replyalya(
        `╭─「 🏰 *SELAMAT DATANG DI GUILD!* 」\n` +
        `│\n` +
        `│ 👤 *Nama :* ${pushname}\n` +
        `│ ⚡ *Power Level :* ${powerLevelFallback}\n` +
        `│ 🎖️ *Rank :* ${guildRankFallback}\n` +
        `│\n` +
        `│ 📌 Kamu sekarang resmi jadi anggota Guild Petualang!\n` +
        `│ Ketik *${prefix}guild quest* untuk lihat papan misi.\n` +
        `╰──────────────────`
      );
    }

    // Guard: semua subcommand di bawah ini butuh sudah daftar guild
    const isPartyCmd = sub === 'party' || sub === 'create';
    if (!Guild.isGuildMember(sender) && sub !== '') {
      return replytolak(
        `❌ Kamu belum terdaftar di Guild!\n` +
        `Ketik *${prefix}guild daftar* dulu.`
      );
    }

    const member = Guild.getMember(sender);
    const myParty = Guild.getPartyOfMember(sender);
    const duelLvlNow = parseInt(userData.duelLvl) || 0;
    const duelRankKey = getDuelRankKey(duelLvlNow);
    const isEliteRank = Guild.ELITE_RANKS.includes(duelRankKey);

    // ══════════════════════════════════════════════
    // .guild create  (bikin party)
    // ══════════════════════════════════════════════
    if (sub === 'create') {
      if (myParty) {
        return replytolak(`⚠️ Kamu sudah tergabung di party *${myParty.id}*!`);
      }
      const duelLvl = parseInt(userData.duelLvl) || 0;
      const money = parseInt(userData.money) || 0;
      if (duelLvl < Guild.PARTY_CREATE_MIN_DUELLVL) {
        return replytolak(
          `❌ Level class kamu belum cukup!\n` +
          `Butuh: Level ${Guild.PARTY_CREATE_MIN_DUELLVL} | Level kamu: ${duelLvl}`
        );
      }
      if (money < Guild.PARTY_CREATE_COST) {
        return replytolak(
          `❌ Uang kamu tidak cukup untuk membuat party!\n` +
          `Butuh: ${fmtMoney(Guild.PARTY_CREATE_COST)} | Uang kamu: ${fmtMoney(money)}`
        );
      }
      global.db.users[sender].money = money - Guild.PARTY_CREATE_COST;
      const party = Guild.createParty(sender);
      await alya.sendMessage(m.chat, { react: { text: '👥', key: m.key } });
      return replyalya(
        `╭─「 👥 *PARTY DIBUAT!* 」\n` +
        `│\n` +
        `│ 🆔 *ID Party :* ${party.id}\n` +
        `│ 👑 *Leader   :* ${pushname}\n` +
        `│ 💰 *Biaya    :* -${fmtMoney(Guild.PARTY_CREATE_COST)}\n` +
        `│\n` +
        `│ 📌 Ajak teman ikut dengan:\n` +
        `│ *${prefix}guild party join ${party.id.replace('PT', '')}*\n` +
        `╰──────────────────`
      );
    }

    // ══════════════════════════════════════════════
    // .guild party join <nomor>
    // ══════════════════════════════════════════════
    if (sub === 'party') {
      const action = (args[1] || '').toLowerCase();
      if (action === 'join') {
        if (myParty) return replytolak(`⚠️ Kamu sudah tergabung di party *${myParty.id}*!`);
        const num = (args[2] || '').replace(/^PT/i, '');
        const partyId = 'PT' + num;
        const result = Guild.joinParty(sender, partyId);
        if (!result.ok) {
          const reasonMsg = {
            notfound: 'Party tidak ditemukan.',
            full: 'Party sudah penuh.',
            already: 'Kamu sudah ada di party ini.',
            busy: 'Party sedang menjalankan misi, tidak bisa menerima anggota baru.'
          }[result.reason] || 'Gagal join party.';
          return replytolak(`❌ ${reasonMsg}`);
        }
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return replyalya(
          `╭─「 ✅ *BERGABUNG KE PARTY* 」\n` +
          `│\n` +
          `│ 🆔 *Party  :* ${result.party.id}\n` +
          `│ 👥 *Anggota:* ${result.party.members.length}/${result.party.maxMember}\n` +
          `│\n` +
          `│ Ketik *${prefix}guild quest* untuk lihat misi party.\n` +
          `╰──────────────────`
        );
      }

      // .guild party  → list party terbuka
      const open = Guild.listOpenParties();
      if (!open.length) {
        return replyalya(`📋 Belum ada party terbuka. Buat sendiri dengan *${prefix}guild create*.`);
      }
      const lines = open.map(p => `• *${p.id.replace('PT', '')}* — ${p.members.length}/${p.maxMember} anggota`).join('\n');
      return replyalya(
        `╭─「 👥 *DAFTAR PARTY TERBUKA* 」\n│\n${lines}\n│\n│ Join: *${prefix}guild party join <nomor>*\n╰──────────────────`
      );
    }

    // Helper: tentukan konteks solo/party buat quest, start, dan tipe misi
    const inParty = !!myParty;

    // ══════════════════════════════════════════════
    // .guild quest
    // ══════════════════════════════════════════════
    if (sub === 'quest' || sub === '') {
      if (inParty) {
        if (myParty.leader !== sender) {
          // member biasa tetap boleh lihat papan misi party
        }
        if (myParty.activeQuest) {
          return replytolak(
            `⚠️ Party kamu sedang menjalankan misi *${myParty.activeQuest.name}*.\n` +
            `Cek progress: *${prefix}guildcheckquest*`
          );
        }
        const board = Guild.getPartyBoard(myParty.id, null, duelRankKey);
        const partyHeader = isEliteRank ? `🌟 PAPAN MISI ELITE PARTY (${myParty.id})` : `PAPAN MISI PARTY (${myParty.id})`;
        return replyalya(boardText(board, partyHeader) +
          `\n\n📌 Ambil misi: *${prefix}guild start <nomor>* (khusus leader)`);
      } else {
        if (member.activeQuest) {
          return replytolak(
            `⚠️ Kamu sedang menjalankan misi *${member.activeQuest.name}*.\n` +
            `Cek progress: *${prefix}guildcheckquest*`
          );
        }
        const board = Guild.getSoloBoard(sender, null, duelRankKey);
        const soloHeader = isEliteRank ? `🌟 PAPAN MISI ELITE (Peringkat ${duelRankKey})` : 'PAPAN MISI SOLO';
        return replyalya(boardText(board, soloHeader) +
          (isEliteRank ? `\n\n✨ Kamu membuka papan quest ELITE khusus Peringkat ${duelRankKey} — reward 5x lipat!` : '') +
          `\n\n📌 Ambil misi: *${prefix}guild start <nomor>*`);
      }
    }

    // ══════════════════════════════════════════════
    // .guild serang / penjagaan / ekspedisi  (shortcut filter solo)
    // ══════════════════════════════════════════════
    if (['serang', 'penjagaan', 'ekspedisi'].includes(sub)) {
      const typeMap = { serang: 'serang', penjagaan: 'penjagaan', ekspedisi: 'ekspedisi' };
      const typeKey = typeMap[sub];
      const typeInfo = Guild.QUEST_TYPES[typeKey];

      // Filter tipe misi (serang/penjagaan/ekspedisi) cuma ada di papan REGULER.
      // Player peringkat elite (S/SS/SSR) diarahkan pakai papan elite penuh via .guild quest.
      if (isEliteRank) {
        return replytolak(
          `🌟 Peringkat kamu (*${duelRankKey}*) sudah membuka papan quest ELITE khusus!\n` +
          `Papan elite tidak dibagi per tipe misi. Ketik *${prefix}guild quest* untuk melihatnya.`
        );
      }

      if (inParty) {
        if (myParty.activeQuest) {
          return replytolak(`⚠️ Party kamu sedang menjalankan misi. Cek: *${prefix}guildcheckquest*`);
        }
        const board = Guild.getPartyBoard(myParty.id, typeKey, duelRankKey);
        return replyalya(boardText(board, `MISI PARTY — ${typeInfo.emoji} ${typeInfo.label.toUpperCase()}`) +
          `\n\n📌 Ambil misi: *${prefix}guild start <nomor>* (khusus leader)`);
      } else {
        if (member.activeQuest) {
          return replytolak(`⚠️ Kamu sedang menjalankan misi. Cek: *${prefix}guildcheckquest*`);
        }
        const board = Guild.getSoloBoard(sender, typeKey, duelRankKey);
        return replyalya(boardText(board, `MISI SOLO — ${typeInfo.emoji} ${typeInfo.label.toUpperCase()}`) +
          `\n\n📌 Ambil misi: *${prefix}guild start <nomor>*`);
      }
    }

    // ══════════════════════════════════════════════
    // .guild start <nomor>
    // ══════════════════════════════════════════════
    if (sub === 'start') {
      const num = parseInt(args[1]);
      if (!num || num < 1) {
        return replytolak(`❌ Format salah!\nContoh: *${prefix}guild start 1*`);
      }

      if (inParty) {
        if (myParty.leader !== sender) {
          return replytolak(`❌ Hanya leader party yang bisa mengambil misi!`);
        }
        if (myParty.activeQuest) {
          return replytolak(`⚠️ Party sedang menjalankan misi lain.`);
        }
        const board = Guild.getPartyBoard(myParty.id, null, duelRankKey);
        const quest = board[num - 1];
        if (!quest) return replytolak(`❌ Misi nomor ${num} tidak ditemukan.`);
        if (myParty.members.length < quest.minMember) {
          return replytolak(
            `❌ Anggota party belum cukup!\n` +
            `Butuh minimal ${quest.minMember} anggota, party kamu baru ${myParty.members.length}.`
          );
        }

        // Buat proposal misi, minta approval semua anggota
        myParty.pendingQuest = {
          quest,
          proposedAt: Date.now(),
          votes: {}
        };
        myParty.members.forEach(jid => {
          myParty.pendingQuest.votes[jid] = jid === sender ? 'accept' : null;
        });

        await alya.sendMessage(m.chat, { react: { text: '📨', key: m.key } });

        const mentionList = myParty.members.map(jid => `@${jid.split('@')[0]}`).join(' ');
        return replyalya(
          `╭─「 📨 *PROPOSAL MISI PARTY* 」\n` +
          `│\n` +
          `│ ${quest.typeEmoji} *${quest.name}*\n` +
          `│ Rank ${quest.diffLabel} ${'⭐'.repeat(quest.stars)}\n` +
          `│ ⏱️ ${Guild.formatDuration(quest.durationMs)} | 💰 ${fmtMoney(quest.moneyReward)} | ✨ ${quest.xpReward} XP\n` +
          `│\n` +
          `│ 👑 Leader *${pushname}* mengajukan misi ini.\n` +
          `│ Semua anggota wajib konfirmasi:\n` +
          `│ ✅ *${prefix}guild accept*\n` +
          `│ ❌ *${prefix}guild reject*\n` +
          `│\n` +
          `│ ⏳ Batas waktu: 5 menit\n` +
          `╰──────────────────\n\n${mentionList}`,
          { mentions: myParty.members }
        );
      } else {
        if (member.activeQuest) {
          return replytolak(`⚠️ Kamu sedang menjalankan misi lain.`);
        }
        const board = Guild.getSoloBoard(sender, null, duelRankKey);
        const quest = board[num - 1];
        if (!quest) return replytolak(`❌ Misi nomor ${num} tidak ditemukan.`);

        member.activeQuest = {
          questId: quest.id,
          type: quest.type,
          name: quest.name,
          typeEmoji: quest.typeEmoji,
          typeLabel: quest.typeLabel,
          stars: quest.stars,
          diffLabel: quest.diffLabel,
          moneyReward: quest.moneyReward,
          xpReward: quest.xpReward,
          contribReward: quest.contribReward,
          durationMs: quest.durationMs,
          startedAt: Date.now()
        };

        await alya.sendMessage(m.chat, { react: { text: quest.typeEmoji, key: m.key } });
        return replyalya(
          `╭─「 ${quest.typeEmoji} *MISI DIMULAI!* 」\n` +
          `│\n` +
          `│ 📜 *${quest.name}*\n` +
          `│ Tipe: ${quest.typeLabel} | Rank ${quest.diffLabel} ${'⭐'.repeat(quest.stars)}\n` +
          `│ ⏱️ Estimasi selesai: ${Guild.formatDuration(quest.durationMs)}\n` +
          `│\n` +
          `│ 📌 Cek progress: *${prefix}guildcheckquest*\n` +
          `│ 📌 Klaim reward setelah waktu habis: *${prefix}guild selesai*\n` +
          `╰──────────────────`
        );
      }
    }

    // ══════════════════════════════════════════════
    // .guild accept / .guild reject
    // ══════════════════════════════════════════════
    if (sub === 'accept' || sub === 'reject') {
      if (!inParty) return replytolak(`❌ Kamu tidak tergabung di party manapun.`);
      if (!myParty.pendingQuest) return replytolak(`❌ Tidak ada proposal misi yang menunggu konfirmasi.`);

      const pq = myParty.pendingQuest;
      if (Date.now() - pq.proposedAt > Guild.PARTY_VOTE_TIMEOUT_MS) {
        myParty.pendingQuest = null;
        return replytolak(`⌛ Waktu konfirmasi habis, proposal misi otomatis dibatalkan. Silakan ajukan ulang.`);
      }

      pq.votes[sender] = sub === 'accept' ? 'accept' : 'reject';

      if (sub === 'reject') {
        myParty.pendingQuest = null;
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya(
          `╭─「 ❌ *MISI DIBATALKAN* 」\n│\n│ ${pushname} menolak misi *${pq.quest.name}*.\n│ Party bisa mengajukan misi lain.\n╰──────────────────`
        );
      }

      const allAccepted = myParty.members.every(jid => pq.votes[jid] === 'accept');
      if (allAccepted) {
        myParty.activeQuest = {
          questId: pq.quest.id,
          type: pq.quest.type,
          name: pq.quest.name,
          typeEmoji: pq.quest.typeEmoji,
          typeLabel: pq.quest.typeLabel,
          stars: pq.quest.stars,
          diffLabel: pq.quest.diffLabel,
          moneyReward: pq.quest.moneyReward,
          xpReward: pq.quest.xpReward,
          contribReward: pq.quest.contribReward,
          durationMs: pq.quest.durationMs,
          startedAt: Date.now()
        };
        myParty.pendingQuest = null;
        await alya.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });
        return replyalya(
          `╭─「 🚀 *MISI PARTY DIMULAI!* 」\n` +
          `│\n│ 📜 *${myParty.activeQuest.name}*\n` +
          `│ Semua anggota telah menyetujui!\n` +
          `│ ⏱️ Estimasi selesai: ${Guild.formatDuration(myParty.activeQuest.durationMs)}\n` +
          `│\n│ 📌 Cek progress: *${prefix}guildcheckquest*\n╰──────────────────`
        );
      }

      const acceptedCount = Object.values(pq.votes).filter(v => v === 'accept').length;
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya(
        `✅ ${pushname} menyetujui misi.\nProgress konfirmasi: ${acceptedCount}/${myParty.members.length} anggota.`
      );
    }

    // ══════════════════════════════════════════════
    // .guild selesai  (klaim reward setelah waktu habis)
    // ══════════════════════════════════════════════
    if (sub === 'selesai') {
      if (inParty && myParty.activeQuest) {
        if (myParty.leader !== sender) {
          return replytolak(`❌ Hanya leader yang bisa menyelesaikan misi party.`);
        }
        const aq = myParty.activeQuest;
        if (!Guild.isQuestReadyToComplete(aq)) {
          const remaining = aq.durationMs - (Date.now() - aq.startedAt);
          return replytolak(
            `⏳ Misi belum selesai! Sisa waktu: ${Guild.formatDuration(Math.max(0, remaining))}\n` +
            `Cek progress: *${prefix}guildcheckquest*`
          );
        }
        const memberCount = myParty.members.length;
        let summaryLines = [];
        myParty.members.forEach(jid => {
          if (!global.db.users) global.db.users = {};
          if (!global.db.users[jid]) global.db.users[jid] = {};
          global.db.users[jid].money = (global.db.users[jid].money || 0) + aq.moneyReward;
          global.db.users[jid].exp = (global.db.users[jid].exp || 0) + aq.xpReward;
          Guild.registerMember(jid);
          Guild.addContribution(jid, aq.contribReward);
          const gm = Guild.getMember(jid);
          gm.questsParty = (gm.questsParty || 0) + 1;
          gm.earnings = (gm.earnings || 0) + aq.moneyReward;
          summaryLines.push(`@${jid.split('@')[0]}`);
        });
        g.log.push({ type: 'party', questName: aq.name, partyId: myParty.id, members: [...myParty.members], completedAt: Date.now(), moneyReward: aq.moneyReward, contribReward: aq.contribReward });
        myParty.activeQuest = null;

        await alya.sendMessage(m.chat, { react: { text: '🏆', key: m.key } });
        return replyalya(
          `╭─「 🏆 *MISI PARTY SELESAI!* 」\n` +
          `│\n│ 📜 *${aq.name}*\n` +
          `│ 👥 Dikerjakan oleh ${memberCount} anggota\n` +
          `│\n│ 💰 *Reward per orang:* ${fmtMoney(aq.moneyReward)}\n` +
          `│ ✨ *XP per orang:* ${aq.xpReward}\n` +
          `│ 🏅 *Kontribusi:* +${aq.contribReward}\n` +
          `│\n╰──────────────────\n\n${summaryLines.join(' ')}`,
          { mentions: myParty.members }
        );
      }

      if (!inParty && member.activeQuest) {
        const aq = member.activeQuest;
        if (!Guild.isQuestReadyToComplete(aq)) {
          const remaining = aq.durationMs - (Date.now() - aq.startedAt);
          return replytolak(
            `⏳ Misi belum selesai! Sisa waktu: ${Guild.formatDuration(Math.max(0, remaining))}\n` +
            `Cek progress: *${prefix}guildcheckquest*`
          );
        }
        if (!global.db.users) global.db.users = {};
        if (!global.db.users[sender]) global.db.users[sender] = {};
        global.db.users[sender].money = (global.db.users[sender].money || 0) + aq.moneyReward;
        global.db.users[sender].exp = (global.db.users[sender].exp || 0) + aq.xpReward;
        Guild.addContribution(sender, aq.contribReward);
        member.questsSolo = (member.questsSolo || 0) + 1;
        member.earnings = (member.earnings || 0) + aq.moneyReward;
        g.log.push({ type: 'solo', questName: aq.name, member: sender, completedAt: Date.now(), moneyReward: aq.moneyReward, contribReward: aq.contribReward });
        member.activeQuest = null;

        await alya.sendMessage(m.chat, { react: { text: '🏆', key: m.key } });
        return replyalya(
          `╭─「 🏆 *MISI SELESAI!* 」\n` +
          `│\n│ 📜 *${aq.name}*\n` +
          `│\n│ 💰 *Reward:* ${fmtMoney(aq.moneyReward)}\n` +
          `│ ✨ *XP:* ${aq.xpReward}\n` +
          `│ 🏅 *Kontribusi:* +${aq.contribReward} (Rank: ${Guild.getMember(sender).rank})\n` +
          `│\n╰──────────────────`
        );
      }

      return replytolak(`❌ Kamu tidak sedang menjalankan misi apapun.`);
    }

    // ══════════════════════════════════════════════
    // Default: help menu
    // ══════════════════════════════════════════════
    return replyalya(
      `╭─「 🏰 *GUILD MENU* 」\n` +
      `│\n` +
      `│ *Solo:*\n` +
      `│ ${prefix}guild daftar\n` +
      `│ ${prefix}guild quest\n` +
      `│ ${prefix}guild start <nomor>\n` +
      `│ ${prefix}guild serang\n` +
      `│ ${prefix}guild penjagaan\n` +
      `│ ${prefix}guild ekspedisi\n` +
      `│ ${prefix}guild selesai\n` +
      `│\n` +
      `│ *Party:*\n` +
      `│ ${prefix}guild create\n` +
      `│ ${prefix}guild party join <nomor>\n` +
      `│ ${prefix}guild accept / reject\n` +
      `│\n` +
      `│ *Lainnya:*\n` +
      `│ ${prefix}guildcheckquest\n` +
      `│ ${prefix}guildstats\n` +
      `╰──────────────────`
    );
  }
};
