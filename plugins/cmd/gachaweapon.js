// Plugin: gachaweapon
// Commands: gachaweapon
// Alya V20 — Gacha Weapon untuk sistem Duel (kategori: Common/Epic/Legend/Mythic)
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[gachaweapon] gagal load lib/weapons.js:', e.message);
}

module.exports = {
  command: ['gachaweapon'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      reply, replyalya, replytolak,
      sender, pushname
    } = ctx;

    if (!W.rollWeapon) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const user = global.db.users[sender];

    const PRICE = W.GACHA_PRICE;

    if ((user.money || 0) < PRICE) {
      return replyalya(
        `💸 *Dompet lu kering, Bos!*\n\n` +
        `Butuh *Rp ${PRICE.toLocaleString('id-ID')}* buat sekali tarik Gacha Weapon.\n` +
        `Saldo sekarang: *Rp ${(user.money || 0).toLocaleString('id-ID')}*`
      );
    }

    // Potong saldo
    user.money -= PRICE;

    // Roll weapon
    const result = W.rollWeapon();
    if (!result) return replyalya('❌ Gagal roll weapon, coba lagi!');

    // Inventory weapon disimpan di user.weapons = { [weaponId]: { level, xp } }
    if (!user.weapons) user.weapons = {};

    const rarityColor = W.RARITY[result.rarity]?.color || '⚪';
    let statusText;
    let isDupe = false;

    if (user.weapons[result.id]) {
      // Duplikat -> konversi jadi XP
      isDupe = true;
      const dupeXpMap = { Common: 40, Epic: 90, Legend: 180, Mythic: 400 };
      const gainedXp = dupeXpMap[result.rarity] || 40;
      user.weapons[result.id].xp = (user.weapons[result.id].xp || 0) + gainedXp;

      // Auto level-up kalau XP cukup (bisa naik berkali-kali kalau overflow)
      let leveledUp = 0;
      while (true) {
        const lvl = user.weapons[result.id].level || 1;
        const needed = W.xpNeeded(lvl);
        if (user.weapons[result.id].xp >= needed) {
          user.weapons[result.id].xp -= needed;
          user.weapons[result.id].level = lvl + 1;
          leveledUp++;
        } else break;
      }

      statusText =
        `♻️ *DUPLIKAT!* Weapon ini udah lu punya.\n` +
        `✨ Dikonversi jadi *+${gainedXp} XP* buat upgrade!\n` +
        (leveledUp > 0
          ? `🆙 *LEVEL UP OTOMATIS!* Sekarang Level ${user.weapons[result.id].level} (naik ${leveledUp}x)!\n`
          : `📊 XP sekarang: ${user.weapons[result.id].xp}/${W.xpNeeded(user.weapons[result.id].level || 1)}\n`);
    } else {
      // Weapon baru
      user.weapons[result.id] = { level: 1, xp: 0 };
      statusText = `🆕 *WEAPON BARU MASUK GUDANG SENJATA!*\n`;
    }

    // Kalau belum punya equipped weapon, auto-equip yang baru didapat
    if (!user.equippedWeapon) {
      user.equippedWeapon = result.id;
      statusText += `⚔️ Otomatis di-equip karena ini weapon pertamamu!\n`;
    }

    const roleLabel = {
      tank: '🛡️ Tank', assassin: '🗡️ Assassin', fighter: '👊 Fighter', mage: '🔮 Mage'
    }[result.role] || result.role;

    const typeLabel = {
      sword: '🗡️ Pedang', bow: '🏹 Busur', spear: '🔱 Tombak', dagger: '🔪 Belati',
      staff: '🪄 Tongkat', hammer: '🔨 Palu', scythe: '⚰️ Sabit', gauntlet: '🥊 Sarung Tinju'
    }[result.type] || result.type;

    let extraLine = '';
    if (result.proc) {
      extraLine += `\n💫 *Efek Spesial:* ${result.proc.desc} _(±${Math.round(result.proc.chance * 100)}% chance/serang)_`;
    }
    if (result.skillName) {
      extraLine += `\n🌟 *Skill Spesial:* ${result.skillName}`;
    }

    const caption =
      `╭─「 🎰 *GACHA WEAPON* 」\n` +
      `│\n` +
      `│ ${rarityColor} *Rarity:* ${result.rarity}\n` +
      `│ ${typeLabel}\n` +
      `│ 🏷️ *Nama:* ${result.name}\n` +
      `│ 👤 *Cocok untuk:* ${roleLabel}\n` +
      `│ ⚔️ *Base DMG:* +${result.dmg}\n` +
      (result.critBonus ? `│ 🎯 *Bonus Crit:* +${Math.round(result.critBonus * 100)}%\n` : '') +
      (result.defBonus ? `│ 🛡️ *Bonus DEF:* +${Math.round(result.defBonus * 100)}%\n` : '') +
      `│${extraLine}\n` +
      `│\n` +
      `│ 💰 *Sisa Saldo:* Rp ${user.money.toLocaleString('id-ID')}\n` +
      `╰──────────────────\n\n` +
      statusText +
      `\n📦 Cek gudang senjata: *${prefix}inventoryweapon*\n` +
      `⚔️ Pakai di duel otomatis kalau sudah di-equip.\n` +
      `🆙 Upgrade: *${prefix}upgradeweapon ${result.id}*`;

    await alya.sendMessage(m.chat, { react: { text: rarityColor, key: m.key } });
    return replyalya(caption);
  }
};
