// Plugin: crafting
// Commands: craft, crafting
// Fixed V19 — switch variable bug fixed (type → _type), group check fixed, menu tampil kalau no arg

'use strict';
const path = require('path');

module.exports = {
  command: ['craft', 'crafting'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const {
      args, command, prefix,
      isGroup,
      Ryuu,
      reply, replyalya, replytolak,
      user, setting,
    } = ctx;

    if (!isGroup) return replytolak('Command ini hanya bisa digunakan di grup!');
    if (!user) return replytolak('Data user kamu tidak ditemukan.');

    const stock = setting?.stock || {};
    const _type = (args[0] || '').toLowerCase();

    const caption =
`╔══════════════════════╗
║   🔨 *CRAFTING TABLE*   ║
╚══════════════════════╝

Gunakan: *${prefix}${command} [item]*
Contoh : *${prefix}${command} pickaxe*

*📦 Item yang bisa di Craft:*
▧ *pickaxe* ⛏️
▧ *sword* ⚔️
▧ *fishingrod* 🎣
▧ *armor* 🥼
▧ *atm* 💳

*📜 Recipe:*

⛏️ *Pickaxe*
  → 10 Kayu 🪵 | 5 Batu 🪨
  → 5 Iron ⛓ | 20 String 🕸️

⚔️ *Sword*
  → 10 Kayu 🪵 | 15 Iron ⛓️

🎣 *Fishingrod*
  → 10 Kayu 🪵 | 2 Iron ⛓
  → 20 String 🕸️

🥼 *Armor*
  → 30 Iron ⛓️ | 1 Emerald ❇️
  → 5 Diamond 💎

💳 *ATM*
  → 3 Emerald ❇️ | 6 Diamond 💎
  → 10.000 Money 💹`;

    // Tidak ada argumen → tampilkan menu
    if (!_type) return replyalya(caption);

    try {
      switch (_type) {
        case 'pickaxe': {
          if (user.pickaxe > 0) return replyalya('Kamu sudah punya *Pickaxe* ⛏️!');
          if (user.wood < 10 || user.rock < 5 || user.iron < 5 || user.string < 20) {
            return replyalya(
              `❌ Material tidak cukup untuk membuat *Pickaxe* ⛏️\n\n` +
              `Butuh:` +
              (user.wood  < 10 ? `\n  • ${10 - user.wood} Kayu 🪵`     : '') +
              (user.rock  < 5  ? `\n  • ${5  - user.rock} Batu 🪨`     : '') +
              (user.iron  < 5  ? `\n  • ${5  - user.iron} Iron ⛓`      : '') +
              (user.string< 20 ? `\n  • ${20 - user.string} String 🕸️` : '')
            );
          }
          user.wood   -= 10; if (stock.wood   !== undefined) stock.wood   += 10;
          user.rock   -= 5;  if (stock.rock   !== undefined) stock.rock   += 5;
          user.iron   -= 5;  if (stock.iron   !== undefined) stock.iron   += 5;
          user.string -= 20; if (stock.string !== undefined) stock.string += 20;
          user.pickaxe = (user.pickaxe || 0) + 1;
          user.pickaxedurability = 40;
          return replyalya('✅ Berhasil membuat *1 Pickaxe* ⛏️\nDurabilitas: 40');
        }

        case 'sword': {
          if (user.sword > 0) return replyalya('Kamu sudah punya *Sword* ⚔️!');
          if (user.wood < 10 || user.iron < 15) {
            return replyalya(
              `❌ Material tidak cukup untuk membuat *Sword* ⚔️\n\nButuh:` +
              (user.wood < 10  ? `\n  • ${10 - user.wood} Kayu 🪵`  : '') +
              (user.iron < 15  ? `\n  • ${15 - user.iron} Iron ⛓️`  : '')
            );
          }
          user.wood -= 10; if (stock.wood !== undefined) stock.wood += 10;
          user.iron -= 15; if (stock.iron !== undefined) stock.iron += 15;
          user.sword = (user.sword || 0) + 1;
          user.sworddurability = 40;
          return replyalya('✅ Berhasil membuat *1 Sword* ⚔️\nDurabilitas: 40');
        }

        case 'fishingrod': {
          if (user.fishingrod > 0) return replyalya('Kamu sudah punya *Fishingrod* 🎣!');
          if (user.wood < 10 || user.iron < 2 || user.string < 20) {
            return replyalya(
              `❌ Material tidak cukup untuk membuat *Fishingrod* 🎣\n\nButuh:` +
              (user.wood   < 10 ? `\n  • ${10 - user.wood} Kayu 🪵`     : '') +
              (user.iron   < 2  ? `\n  • ${2  - user.iron} Iron ⛓`      : '') +
              (user.string < 20 ? `\n  • ${20 - user.string} String 🕸️` : '')
            );
          }
          user.wood   -= 10; if (stock.wood   !== undefined) stock.wood   += 10;
          user.iron   -= 2;  if (stock.iron   !== undefined) stock.iron   += 2;
          user.string -= 20; if (stock.string !== undefined) stock.string += 20;
          user.fishingrod = (user.fishingrod || 0) + 1;
          user.fishingroddurability = 40;
          return replyalya('✅ Berhasil membuat *1 Fishingrod* 🎣\nDurabilitas: 40');
        }

        case 'armor': {
          if (user.armor > 0) return replyalya('Kamu sudah punya *Armor* 🥼!');
          if (user.iron < 30 || user.emerald < 1 || user.diamond < 5) {
            return replyalya(
              `❌ Material tidak cukup untuk membuat *Armor* 🥼\n\nButuh:` +
              (user.iron    < 30 ? `\n  • ${30 - user.iron} Iron ⛓️`     : '') +
              (user.emerald < 1  ? `\n  • ${1  - user.emerald} Emerald ❇️` : '') +
              (user.diamond < 5  ? `\n  • ${5  - user.diamond} Diamond 💎`  : '')
            );
          }
          user.iron    -= 30; if (stock.iron    !== undefined) stock.iron    += 30;
          user.emerald -= 1;  if (stock.emerald !== undefined) stock.emerald += 1;
          user.diamond -= 5;  if (stock.diamond !== undefined) stock.diamond += 5;
          user.armor = (user.armor || 0) + 1;
          user.armordurability = 50;
          return replyalya('✅ Berhasil membuat *1 Armor* 🥼\nDurabilitas: 50');
        }

        case 'atm': {
          if (user.atm > 0) return replyalya('Kamu sudah punya *ATM* 💳!');
          if (user.emerald < 3 || user.diamond < 6 || user.money < 10000) {
            return replyalya(
              `❌ Material tidak cukup untuk membuat *ATM* 💳\n\nButuh:` +
              (user.emerald < 3     ? `\n  • ${3     - user.emerald} Emerald ❇️` : '') +
              (user.diamond < 6     ? `\n  • ${6     - user.diamond} Diamond 💎`  : '') +
              (user.money   < 10000 ? `\n  • ${10000 - user.money} Money 💹`      : '')
            );
          }
          user.emerald -= 3;
          user.diamond -= 6;
          user.money   -= 10000;
          if (stock.emerald !== undefined) stock.emerald += 3;
          if (stock.diamond !== undefined) stock.diamond += 6;
          user.atm = (user.atm || 0) + 1;
          user.fullatm = 500000000;
          return replyalya('✅ Berhasil membuat *1 ATM* 💳\nKapasitas: 500.000.000');
        }

        default:
          return replyalya(`❓ Item *${_type}* tidak ada di crafting table.\n\nKetik *${prefix}${command}* untuk lihat daftar item.`);
      }
    } catch (err) {
      console.error('[crafting.js]', err);
      replyalya('❌ Terjadi error saat crafting.\n\n' + err.message);
    }
  }
};
