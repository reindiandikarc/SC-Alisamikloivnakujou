// Plugin: upgradeweapon
// Commands: upgradeweapon
// Alya V20 — Upgrade level weapon hasil .gachaweapon
// Level 1 -> 2 butuh 100 XP, tiap naik level kebutuhan XP dikali 2
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[upgradeweapon] gagal load lib/weapons.js:', e.message);
}

// XP yang didapat per pemakaian .upgradeweapon (nge-grind pakai uang, bukan cuma nunggu dupe)
const XP_PER_TRY = 35;
const COST_PER_TRY = 75000;

module.exports = {
  command: ['upgradeweapon'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      reply, replyalya, replytolak,
      sender, pushname
    } = ctx;

    if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const user = global.db.users[sender];

    if (!user.weapons || !Object.keys(user.weapons).length) {
      return replyalya(
        `❌ *Lu belum punya weapon!*\n\n` +
        `Tarik dulu gacha: *${prefix}gachaweapon* (Rp ${W.GACHA_PRICE.toLocaleString('id-ID')})`
      );
    }

    let weaponId = args[0]?.toLowerCase();

    // Kalau tidak diisi, pakai weapon yang sedang di-equip
    if (!weaponId) {
      if (!user.equippedWeapon) {
        const owned = Object.keys(user.weapons).map(id => W.getWeaponById(id)?.name || id).join(', ');
        return replyalya(
          `⚠️ *Mau upgrade weapon apa?*\n\n` +
          `Ketik: *${prefix}upgradeweapon <id_weapon>*\n\n` +
          `📦 Weapon yang kamu punya:\n${owned}\n\n` +
          `_Tips: pakai id weapon (contoh: kusanagi_no_tsurugi), cek *${prefix}inventoryweapon*_`
        );
      }
      weaponId = user.equippedWeapon;
    }

    const base = W.getWeaponById(weaponId);
    if (!base) return replyalya(`❌ Weapon *${weaponId}* tidak dikenali. Cek daftar di *${prefix}inventoryweapon*`);
    if (!user.weapons[weaponId]) return replyalya(`❌ Lu belum punya weapon *${base.name}*!`);

    const wData = user.weapons[weaponId];
    const currentLvl = wData.level || 1;
    const needed = W.xpNeeded(currentLvl);

    if ((user.money || 0) < COST_PER_TRY) {
      return replyalya(
        `💸 Dompet tipis! Butuh *Rp ${COST_PER_TRY.toLocaleString('id-ID')}* buat latihan upgrade.\n` +
        `Saldo sekarang: Rp ${(user.money || 0).toLocaleString('id-ID')}`
      );
    }

    user.money -= COST_PER_TRY;
    wData.xp = (wData.xp || 0) + XP_PER_TRY;

    let leveledUp = false;
    if (wData.xp >= needed) {
      wData.xp -= needed;
      wData.level = currentLvl + 1;
      leveledUp = true;
    }

    const rarityColor = W.RARITY[base.rarity]?.color || '⚪';
    const newLvl = wData.level || 1;
    const newNeeded = W.xpNeeded(newLvl);
    const effNew = W.getEffectiveWeaponStats(weaponId, newLvl);
    const barLen = 10;
    const pct = Math.min(barLen, Math.round((wData.xp / newNeeded) * barLen));
    const bar = '▰'.repeat(pct) + '▱'.repeat(barLen - pct);

    let caption =
      `╭─「 🆙 *UPGRADE WEAPON* 」\n` +
      `│\n` +
      `│ ${rarityColor} *${base.name}* (${base.rarity})\n` +
      `│\n`;

    if (leveledUp) {
      caption +=
        `│ 🎉 *LEVEL UP!* ${currentLvl} ➜ ${newLvl}\n` +
        `│ ⚔️ DMG sekarang: +${effNew.effectiveDmg}\n` +
        `│\n`;
    } else {
      caption += `│ ✨ +${XP_PER_TRY} XP didapat.\n│\n`;
    }

    caption +=
      `│ 📊 *Level:* ${newLvl}\n` +
      `│ 📈 *XP:* ${wData.xp}/${newNeeded}\n` +
      `│ ${bar}\n` +
      `│ 💰 *Sisa Saldo:* Rp ${user.money.toLocaleString('id-ID')}\n` +
      `╰──────────────────\n\n` +
      `_Ulangi *${prefix}upgradeweapon ${weaponId}* buat lanjut grinding, Rp ${COST_PER_TRY.toLocaleString('id-ID')}/percobaan._`;

    await alya.sendMessage(m.chat, { react: { text: leveledUp ? '🆙' : '✨', key: m.key } });
    return replyalya(caption);
  }
};
