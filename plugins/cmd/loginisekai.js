// plugins/cmd/loginisekai.js
// Alya V20 — Gerbang Masuk Dunia Isekai
// Command: loginisekai
// Membuat akun RPG (class, level, exp, money) + menentukan golongan kelahiran:
//   80% Warga Desa (harus .pilihclass sendiri)
//   18% Sage (langsung 2 class, level 499, siap tempur)
//    2% Pahlawan (langsung semua class, level 999, siap tempur)
'use strict';

const fs = require('fs');
const path = require('path');
const Origin = require(path.join(__dirname, '..', '..', 'lib', 'isekaiOrigin.js'));
const PlayerLevel = require(path.join(__dirname, '..', '..', 'lib', 'playerlevel.js'));

const CLASS_INFO = {
  warrior: { name: 'Warrior', emoji: '⚔️' },
  mage: { name: 'Mage', emoji: '🔮' },
  assassin: { name: 'Assassin', emoji: '🗡️' },
  tank: { name: 'Tank', emoji: '🛡️' }
};

const STARTING_MONEY = 100000;

// Video intro "gerbang isekai" — dikirim sekali di awal proses .loginisekai
// sebelum kartu hasil kelahiran. Aman kalau file belum ada (skip diam-diam,
// tidak menggagalkan proses registrasi).
const INTRO_VIDEO_PATH = path.join(__dirname, '..', '..', 'media', 'loginisekai', 'intro.mp4');

module.exports = {
  command: ['loginisekai'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak, sender, pushname } = ctx;

    if (!global.db) global.db = {};
    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const userDb = global.db.users[sender];

    if (userDb.isekaiRegistered) {
      const rankInfo = PlayerLevel.getRankInfo(userDb.duelLvl || 0);
      const titleInfo = Origin.resolveTitle(userDb.unlockedClasses || [], userDb.duelLvl || 0);
      return replytolak(
        `⚠️ *${pushname}, kamu sudah pernah masuk ke Dunia Isekai!*\n\n` +
        `${titleInfo.emoji} Golongan: *${titleInfo.title}*\n` +
        `${rankInfo.emoji} Peringkat: *${rankInfo.label}* (Level ${userDb.duelLvl || 0})\n\n` +
        `Ketik *${prefix}duel* atau *${prefix}pilihclass* untuk lanjut berpetualang.`
      );
    }

    // ── ROLL KELAHIRAN ──────────────────────────────────────────────────
    const birth = Origin.rollBirth();
    const parents = Origin.generateParents();

    userDb.isekaiRegistered = true;
    userDb.isekaiJoinedAt = Date.now();
    userDb.parentFather = parents.father;
    userDb.parentMother = parents.mother;
    userDb.originVillage = parents.village;
    userDb.money = (userDb.money || 0) + STARTING_MONEY;
    userDb.exp = userDb.exp || 0;
    userDb.golongan = birth.golongan;

    let bodyText = '';
    await alya.sendMessage(m.chat, { react: { text: '🌍', key: m.key } });

    // ── Kirim video intro gerbang isekai (kalau asetnya ada) ────────────
    try {
      if (fs.existsSync(INTRO_VIDEO_PATH)) {
        await alya.sendMessage(m.chat, {
          video: fs.readFileSync(INTRO_VIDEO_PATH),
          caption: '🌌 *Gerbang menuju Dunia Isekai terbuka...*',
          gifPlayback: false,
        }, { quoted: m });
      }
    } catch (e) {
      console.error('[loginisekai] Gagal kirim video intro:', e.message);
      // Tidak menggagalkan proses registrasi kalau video gagal terkirim
    }

    if (birth.golongan === 'warga') {
      // 80% — Warga Desa, belum ada class
      userDb.duelLvl = 0;
      userDb.unlockedClasses = [];
      userDb.class = null;

      bodyText =
        `╭─「 🌍 *KAMU TERLAHIR KEMBALI!* 」\n` +
        `│\n` +
        `│ 👤 *Nama    :* ${pushname}\n` +
        `│ 👨 *Ayah    :* ${parents.father}\n` +
        `│ 👩 *Ibu     :* ${parents.mother}\n` +
        `│ 🏘️ *Asal    :* ${parents.village}\n` +
        `│\n` +
        `│ 👤 *Golongan:* Warga Desa\n` +
        `│ 🎖️ *Level   :* 0 (Warga Biasa)\n` +
        `│ 💰 *Bekal   :* Rp ${STARTING_MONEY.toLocaleString('id-ID')}\n` +
        `│\n` +
        `│ 📖 Kamu terlahir sebagai warga desa biasa,\n` +
        `│ tanpa kekuatan istimewa apapun. Namun jangan\n` +
        `│ berkecil hati — banyak Pahlawan besar pun\n` +
        `│ memulai dari titik yang sama sepertimu!\n` +
        `│\n` +
        `│ 📌 Langkah pertama: pilih jalan hidupmu.\n` +
        `│ Ketik *${prefix}pilihclass* untuk memilih class\n` +
        `│ dan mulai berlatih agar bisa mendaftar Guild.\n` +
        `╰──────────────────`;

    } else if (birth.golongan === 'sage') {
      // 18% — Sage, 2 class langsung terbuka, level 499
      userDb.duelLvl = birth.startLevel;
      userDb.unlockedClasses = birth.classes;
      userDb.class = birth.classes[0];

      const classLines = birth.classes.map(c => `${CLASS_INFO[c].emoji} ${CLASS_INFO[c].name}`).join(' & ');

      bodyText =
        `╭─「 📖 *KELAHIRAN ISTIMEWA!* 」\n` +
        `│\n` +
        `│ 👤 *Nama    :* ${pushname}\n` +
        `│ 👨 *Ayah    :* ${parents.father}\n` +
        `│ 👩 *Ibu     :* ${parents.mother}\n` +
        `│ 🏘️ *Asal    :* ${parents.village}\n` +
        `│\n` +
        `│ 📖 *Golongan:* SAGE\n` +
        `│ 🎖️ *Level   :* ${birth.startLevel} (langsung siap tempur!)\n` +
        `│ ⚔️ *Class Terbuka:* ${classLines}\n` +
        `│ 💰 *Bekal   :* Rp ${STARTING_MONEY.toLocaleString('id-ID')}\n` +
        `│\n` +
        `│ ✨ Kamu terlahir dengan bakat langka — seorang\n` +
        `│ SAGE yang menguasai DUA aliran kekuatan sekaligus!\n` +
        `│ Hanya 18 dari 100 jiwa yang lahir seperti ini.\n` +
        `│\n` +
        `│ 📌 Kamu sudah siap bertempur sekarang juga.\n` +
        `│ Ketik *${prefix}duel @lawan* untuk mulai bertarung,\n` +
        `│ atau *${prefix}guild daftar* untuk gabung Guild!\n` +
        `╰──────────────────`;

    } else {
      // 2% — Pahlawan, semua class, level 999
      userDb.duelLvl = birth.startLevel;
      userDb.unlockedClasses = birth.classes;
      userDb.class = birth.classes[0];

      bodyText =
        `╭─「 👑 *KELAHIRAN LEGENDARIS!* 」\n` +
        `│\n` +
        `│ 👤 *Nama    :* ${pushname}\n` +
        `│ 👨 *Ayah    :* ${parents.father}\n` +
        `│ 👩 *Ibu     :* ${parents.mother}\n` +
        `│ 🏘️ *Asal    :* ${parents.village}\n` +
        `│\n` +
        `│ 👑 *Golongan:* PAHLAWAN\n` +
        `│ 🎖️ *Level   :* ${birth.startLevel} (PUNCAK — terkunci maksimal!)\n` +
        `│ ⚔️ *Class Terbuka:* SEMUA (Warrior, Mage, Assassin, Tank)\n` +
        `│ 💰 *Bekal   :* Rp ${STARTING_MONEY.toLocaleString('id-ID')}\n` +
        `│\n` +
        `│ 🌟 TAKDIR TELAH MEMILIHMU! Kamu terlahir sebagai\n` +
        `│ PAHLAWAN — golongan langka yang hanya muncul\n` +
        `│ pada 2 dari 100 jiwa. Kamu menguasai SELURUH\n` +
        `│ aliran kekuatan sejak lahir dan siap menghadapi\n` +
        `│ ancaman terbesar sekalipun.\n` +
        `│\n` +
        `│ 📌 Ketik *${prefix}duel @lawan* untuk unjuk kekuatan,\n` +
        `│ atau *${prefix}guild daftar* untuk gabung Guild!\n` +
        `╰──────────────────`;
    }

    return replyalya(bodyText);
  }
};
