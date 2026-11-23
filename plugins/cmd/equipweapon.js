// Plugin: equipweapon
// Commands: equipweapon, unequipweapon
// Alya V20 — Pilih weapon aktif yang dipakai saat .duel
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[equipweapon] gagal load lib/weapons.js:', e.message);
}

module.exports = {
  command: ['equipweapon', 'unequipweapon'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      reply, replyalya, replytolak,
      sender
    } = ctx;

    if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const user = global.db.users[sender];

    if (command === 'unequipweapon') {
      if (!user.equippedWeapon) return replyalya('⚠️ Kamu memang belum pakai weapon apapun.');
      const old = W.getWeaponById(user.equippedWeapon);
      user.equippedWeapon = null;
      return replyalya(`✅ *${old?.name || user.equippedWeapon}* dilepas. Sekarang lu duel modal tangan kosong lagi!`);
    }

    if (!user.weapons || !Object.keys(user.weapons).length) {
      return replyalya(
        `❌ *Lu belum punya weapon!*\n\n` +
        `Tarik dulu gacha: *${prefix}gachaweapon* (Rp ${W.GACHA_PRICE.toLocaleString('id-ID')})`
      );
    }

    const weaponId = args[0]?.toLowerCase();
    if (!weaponId) {
      const list = Object.keys(user.weapons).map(id => {
        const w = W.getWeaponById(id);
        const lvl = user.weapons[id]?.level || 1;
        const active = user.equippedWeapon === id ? ' ✅ (aktif)' : '';
        return `• *${id}* — ${w?.name || id} Lv.${lvl}${active}`;
      }).join('\n');

      return replyalya(
        `⚔️ *PILIH WEAPON YANG DI-EQUIP*\n\n${list}\n\n` +
        `Ketik: *${prefix}equipweapon <id_weapon>*`
      );
    }

    if (!user.weapons[weaponId]) {
      return replyalya(`❌ Kamu tidak punya weapon dengan id *${weaponId}*. Cek *${prefix}inventoryweapon*`);
    }

    const w = W.getWeaponById(weaponId);
    user.equippedWeapon = weaponId;

    const rarityColor = W.RARITY[w.rarity]?.color || '⚪';
    return replyalya(
      `✅ *WEAPON DI-EQUIP!*\n\n` +
      `${rarityColor} *${w.name}* (${w.rarity}) — Lv.${user.weapons[weaponId].level || 1}\n\n` +
      `Siap dipakai di *${prefix}duel*!`
    );
  }
};
