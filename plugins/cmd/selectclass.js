// Plugin: selectclass / pilihclass / setclass
// Commands: selectclass, pilihclass, setclass
// Alya V13 — Pilih Class sebelum Duel (terintegrasi dengan duel.js)
// Ported & upgraded dari Alya V10
'use strict';

const path = require('path');
const Origin = require(path.join(__dirname, '..', '..', 'lib', 'isekaiOrigin.js'));

// ═══════════════════════════════════════════════════════════════
// CLASSES DEFINITION (harus sama persis dengan duel.js)
// Disimpan di global agar duel.js bisa akses
// ═══════════════════════════════════════════════════════════════
if (!global._ALYA_CLASSES) {
  global._ALYA_CLASSES = {
    warrior: {
      name: 'Warrior', emoji: '⚔️',
      hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15,
      skillName: 'Heavy Smash', ultiName: 'Berserker Rage',
      desc: 'Petarung tangguh dengan HP tinggi dan serangan fisik kuat.'
    },
    mage: {
      name: 'Mage', emoji: '🔮',
      hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10,
      skillName: 'Fireball', ultiName: 'Meteor Strike',
      desc: 'Penyihir dengan skill damage tertinggi dan mana besar.'
    },
    assassin: {
      name: 'Assassin', emoji: '🗡️',
      hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38,
      skillName: 'Backstep Slash', ultiName: 'Shadow Assassination',
      desc: 'Pembunuh bayaran dengan crit rate tertinggi. High risk, high reward!'
    },
    tank: {
      name: 'Tank', emoji: '🛡️',
      hp: 850, mana: 80, dmg: 18, skillDmg: 30, crit: 0.05,
      skillName: 'Shield Bash', ultiName: 'Earthquake',
      desc: 'Benteng berjalan dengan HP raksasa. Susah mati, sabar jadi kunci!'
    }
  };
}

const CLASSES = global._ALYA_CLASSES;

module.exports = {
  command: ['selectclass', 'pilihclass', 'setclass'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      reply, replyalya, replytolak,
      sender, pushname
    } = ctx;

    const userData = global.db?.users?.[sender] || {};
    const classList = Object.keys(CLASSES);
    const chosenArg = args[0]?.toLowerCase();

    // ── Jika user sudah pilih class via argumen langsung ──────────────────
    if (chosenArg && classList.includes(chosenArg)) {
      const cls = CLASSES[chosenArg];
      const oldClass = userData.class;

      if (!global.db.users) global.db.users = {};
      if (!global.db.users[sender]) global.db.users[sender] = {};
      global.db.users[sender].class = chosenArg;

      const unlockedClasses = new Set(global.db.users[sender].unlockedClasses || []);
      unlockedClasses.add(chosenArg);
      global.db.users[sender].unlockedClasses = [...unlockedClasses];

      const changeNote = oldClass
        ? `\n│ 🔄 *Sebelumnya :* ${CLASSES[oldClass]?.name || oldClass} ${CLASSES[oldClass]?.emoji || ''}`
        : '';

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await replyalya(
        `╭─「 ${cls.emoji} *CLASS TERPILIH!* 」\n` +
        `│\n` +
        `│ 👤 *Nama       :* ${pushname}\n` +
        `│ ⚔️  *Class      :* ${cls.name} ${cls.emoji}` +
        changeNote + `\n` +
        `│\n` +
        `│ 📊 *STATS BASE:*\n` +
        `│ ❤️  HP      : ${cls.hp}\n` +
        `│ 💠 Mana    : ${cls.mana}\n` +
        `│ 🗡️  DMG     : ${cls.dmg}\n` +
        `│ ✨ Skill   : ${cls.skillDmg} (${cls.skillName})\n` +
        `│ 🎯 Crit    : ${(cls.crit * 100).toFixed(0)}%\n` +
        `│ 💥 Ulti    : ${cls.ultiName}\n` +
        `│\n` +
        `│ 💡 ${cls.desc}\n` +
        `│\n` +
        `│ ✅ *Kamu siap untuk DUEL!*\n` +
        `│ Ketik *${prefix}duel @mention* untuk bertarung.\n` +
        `╰──────────────────`
      );

      const titleNotif = Origin.checkTitleUnlockNotif(
        global.db.users[sender].unlockedClasses,
        global.db.users[sender].duelLvl || 0
      );
      if (titleNotif) {
        if ([...unlockedClasses].length >= 4 && (global.db.users[sender].duelLvl || 0) >= Origin.PAHLAWAN_UNLOCK_LEVEL) {
          global.db.users[sender].duelLvl = Origin.PAHLAWAN_UNLOCK_LEVEL;
        }
        await alya.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });
        await replyalya(titleNotif);
      }
      return;
    }

    // ── Jika argumen tidak valid ───────────────────────────────────────────
    if (chosenArg && !classList.includes(chosenArg)) {
      return replyalya(
        `❌ Class *${chosenArg}* tidak ada!\n\n` +
        `📝 Class tersedia: *${classList.join(', ')}*\n` +
        `Contoh: *${prefix}${command} warrior*`
      );
    }

    // ── Tampilkan menu pilih class (interaktif) ───────────────────────────
    const currentClass = userData.class;
    const currentInfo = currentClass
      ? `\n│ 🎖️ *Class Kamu Saat Ini:* ${CLASSES[currentClass]?.name || currentClass} ${CLASSES[currentClass]?.emoji || ''}`
      : `\n│ ⚠️ *Kamu belum punya class!* Pilih sekarang untuk bisa duel.`;

    const rows = classList.map(key => ({
      title: `${CLASSES[key].emoji} ${CLASSES[key].name}`,
      description: CLASSES[key].desc,
      id: `${prefix}setclass ${key}`
    }));

    // Coba kirim dengan interactiveMessage (nativeFlow)
    try {
      const introText =
        `╭─「 ⚔️ *PILIH CLASS DUEL* 」\n` +
        `│` + currentInfo + `\n` +
        `│\n` +
        `│ 📋 *Daftar Class:*\n` +
        `│\n` +
        `│ ⚔️  *Warrior* — HP 380, Crit 15%\n` +
        `│    Tank Fisik, damage stabil\n` +
        `│\n` +
        `│ 🔮 *Mage* — HP 310, Skill 75 dmg\n` +
        `│    Mana besar, skill damage tinggi\n` +
        `│\n` +
        `│ 🗡️  *Assassin* — HP 325, Crit 38%\n` +
        `│    Crit tertinggi, bisa 1-shot!\n` +
        `│\n` +
        `│ 🛡️  *Tank* — HP 850, Crit 5%\n` +
        `│    HP raksasa, susah dibunuh\n` +
        `│\n` +
        `│ 📌 Pilih class di bawah atau:\n` +
        `│ *${prefix}${command} <class>* untuk langsung pilih\n` +
        `╰──────────────────`;

      const msg = require('@whiskeysockets/baileys').generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: introText },
              footer: { text: '⚔️ Alya Bot — Duel System' },
              header: {
                title: '🏟️ Arena Class Selection',
                hasSubtitle: false
              },
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: '👁️ Lihat & Pilih Class',
                    sections: [{
                      title: '⚔️ Tersedia',
                      rows
                    }]
                  })
                }]
              }
            }
          }
        }
      }, { quoted: m });

      await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (e) {
      // Fallback: teks biasa dengan petunjuk
      const classText = classList.map(key => {
        const cls = CLASSES[key];
        return (
          `${cls.emoji} *${cls.name}*\n` +
          `   HP: ${cls.hp} | DMG: ${cls.dmg} | Crit: ${(cls.crit*100).toFixed(0)}%\n` +
          `   Skill: ${cls.skillName} (${cls.skillDmg} dmg)\n` +
          `   Ulti: ${cls.ultiName}\n` +
          `   ${cls.desc}`
        );
      }).join('\n\n');

      const currentInfo2 = currentClass
        ? `🎖️ Class sekarang: *${CLASSES[currentClass]?.name}* ${CLASSES[currentClass]?.emoji}`
        : '⚠️ Kamu belum punya class!';

      replyalya(
        `╭─「 ⚔️ *PILIH CLASS DUEL* 」\n│\n│ ${currentInfo2}\n╰──────────────────\n\n` +
        classText +
        `\n\n📌 *Cara pilih:*\n*${prefix}${command} warrior* / *mage* / *assassin* / *tank*`
      );
    }
  }
};
