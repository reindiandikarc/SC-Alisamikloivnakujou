// Plugin: bossraid
// Command: bossraid
// Alya V20 — Raid boss koperatif santai: butuh minimal 2 warga isekai terdaftar
// aktif di grup yang sama, siapapun bisa ikut ketik command ini (tanpa perlu
// bikin party formal). Reward dibagi kecil per orang, cooldown singkat.
//
// BEDA dengan fitur RPG lain (biar tidak dobel):
// - .tantangbos = SOLO, tier terstruktur (Common->King Devil), reward jutaan,
//   syarat level tinggi di tier atas.
// - .guild party/quest = party FORMAL (harus dibentuk & disetujui anggota dulu),
//   proses lebih panjang (checkpoint, voting terima/tolak).
// .bossraid = santai, siapa saja anggota grup yang sudah .loginisekai otomatis
// "ikut" begitu salah satu dari mereka trigger command ini — cocok buat grup
// ramai yang mau eventtempo cepat tanpa setup party.
//
// Diadaptasi dari fitur "bossraid" SC (tema Tensura), di-reskin total + reward
// dikalibrasi jauh lebih kecil dari .tantangbos supaya tidak menyaingi sistem
// boss solo yang sudah ada.
'use strict';

const path = require('path');
const Content = require(path.join(__dirname, '..', '..', 'lib', 'isekaiContent'));

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 jam (per-grup, bukan per-user)
const MIN_PARTICIPANTS = 2; // minimal warga isekai terdaftar di grup (selain penantang)

module.exports = {
  command: ['bossraid', 'raidbos'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, sender, isGroup, groupMembers } = ctx;

    if (!isGroup) return replyalya('⚠️ Raid boss cuma bisa di grup — butuh kerja sama warga sekitar!');

    if (!global.db) global.db = {};
    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const u = global.db.users[sender];

    if (!u.isekaiRegistered) {
      return replyalya(`❌ Kamu belum masuk Dunia Isekai!\nKetik *${prefix}loginisekai* dulu ya.`);
    }

    // Hitung anggota grup lain yang juga sudah terdaftar isekai (partisipan raid)
    const memberJids = Array.isArray(groupMembers)
      ? groupMembers.map(gm => (typeof gm === 'string' ? gm : gm.id)).filter(Boolean)
      : [];
    const registeredOthers = memberJids.filter(jid =>
      jid !== sender && global.db.users?.[jid]?.isekaiRegistered
    );

    if (registeredOthers.length < MIN_PARTICIPANTS) {
      return replyalya(
        `❌ *Butuh lebih banyak warga isekai di grup ini!*\n\n` +
        `Minimal *${MIN_PARTICIPANTS} warga lain* yang sudah *${prefix}loginisekai* ` +
        `supaya raid boss bisa dimulai (sekarang baru ${registeredOthers.length}).\n\n` +
        `Ajak teman grup ketik *${prefix}loginisekai* dulu ya!`
      );
    }

    if (!alya.bossRaidCd) alya.bossRaidCd = {};
    const now = Date.now();
    const lastRaid = alya.bossRaidCd[m.chat] || 0;
    if (now - lastRaid < COOLDOWN_MS) {
      const sisa = COOLDOWN_MS - (now - lastRaid);
      const h = Math.floor(sisa / 3600000);
      const mm = Math.floor((sisa % 3600000) / 60000);
      return replyalya(`⏳ *Raid boss grup ini masih cooldown!*\nCoba lagi dalam *${h}j ${mm}m*.`);
    }

    const boss = Content.pickRandom(Content.RAID_BOSSES);

    // Total "kekuatan" gabungan berdasarkan exp semua partisipan (termasuk penantang)
    const participantIds = [sender, ...registeredOthers.slice(0, 6)]; // cap 7 orang biar reward tetap wajar
    const totalPower = participantIds.reduce((sum, jid) => sum + ((global.db.users[jid]?.exp || 0) / 100), 0);
    const winChance = Math.min(0.9, 0.45 + Math.min(0.4, totalPower / 5000));
    const win = Math.random() < winChance;

    alya.bossRaidCd[m.chat] = now;

    await alya.sendMessage(m.chat, { react: { text: win ? '🎉' : '💀', key: m.key } });

    if (win) {
      const rewardPerPerson = Math.floor(Math.random() * 25000) + 20000;
      const xpPerPerson = Math.floor(Math.random() * 200) + 150;

      const mentions = [];
      for (const jid of participantIds) {
        if (!global.db.users[jid]) continue;
        global.db.users[jid].money = (global.db.users[jid].money || 0) + rewardPerPerson;
        global.db.users[jid].exp = (global.db.users[jid].exp || 0) + xpPerPerson;
        mentions.push(jid);
      }

      const participantTags = participantIds.map(jid => `@${jid.split('@')[0]}`).join(', ');

      return alya.sendMessage(m.chat, {
        text:
          `╭─「 🎉 *RAID BOSS — MENANG!* 」\n` +
          `│\n` +
          `│ 👹 *Boss    :* ${boss}\n` +
          `│ 🎖️ *Hasil   :* ✅ Berhasil dikalahkan bersama!\n` +
          `│ 👥 *Peserta :* ${participantIds.length} orang\n` +
          `│\n` +
          `│ 💰 *Tiap orang dapat:* +Rp ${rewardPerPerson.toLocaleString('id-ID')}\n` +
          `│ ✨ *Tiap orang dapat:* +${xpPerPerson} EXP\n` +
          `│\n` +
          `│ 🙌 ${participantTags}\n` +
          `│\n` +
          `│ ⏰ Raid boss grup ini lagi dalam *2 jam*\n` +
          `╰──────────────────`,
        mentions,
      }, { quoted: m });
    } else {
      return alya.sendMessage(m.chat, {
        text:
          `╭─「 💀 *RAID BOSS — KALAH* 」\n` +
          `│\n` +
          `│ 👹 *Boss    :* ${boss}\n` +
          `│ 🎖️ *Hasil   :* ❌ Terlalu kuat, tim mundur!\n` +
          `│ 👥 *Peserta :* ${participantIds.length} orang\n` +
          `│\n` +
          `│ 💡 Naikkan level dulu lewat *${prefix}duel* atau *${prefix}explore*!\n` +
          `│ ⏰ Coba lagi dalam *2 jam*\n` +
          `╰──────────────────`,
        mentions: participantIds,
      }, { quoted: m });
    }
  }
};
