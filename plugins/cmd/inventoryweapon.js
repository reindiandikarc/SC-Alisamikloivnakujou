// Plugin: inventoryweapon
// Commands: inventoryweapon, gudangsenjata, myweapons
// Alya V20 — Lihat semua weapon hasil .gachaweapon
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[inventoryweapon] gagal load lib/weapons.js:', e.message);
}

module.exports = {
  command: ['inventoryweapon', 'gudangsenjata', 'myweapons'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix, pushname,
      reply, replyalya, replytolak,
      sender, resolveTarget
    } = ctx;

    if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

    // Bisa cek punya orang lain juga (mention/reply)
    const target = (resolveTarget ? resolveTarget(ctx) : null) || sender;
    const user = global.db?.users?.[target];

    if (!user || !user.weapons || !Object.keys(user.weapons).length) {
      return replyalya(
        target === sender
          ? `📦 Gudang senjatamu masih kosong.\n\nTarik dulu: *${prefix}gachaweapon* (Rp ${W.GACHA_PRICE.toLocaleString('id-ID')})`
          : `📦 Orang itu belum punya weapon apapun.`
      );
    }

    const rarityOrder = { Mythic: 0, Legend: 1, Epic: 2, Common: 3 };
    const entries = Object.entries(user.weapons)
      .map(([id, data]) => ({ id, data, base: W.getWeaponById(id) }))
      .filter(v => v.base)
      .sort((a, b) => rarityOrder[a.base.rarity] - rarityOrder[b.base.rarity]);

    const typeLabel = {
      sword: '🗡️', bow: '🏹', spear: '🔱', dagger: '🔪',
      staff: '🪄', hammer: '🔨', scythe: '⚰️', gauntlet: '🥊'
    };

    const lines = entries.map(({ id, data, base }) => {
      const rarityColor = W.RARITY[base.rarity]?.color || '⚪';
      const active = user.equippedWeapon === id ? ' ⚡*EQUIPPED*' : '';
      const needed = W.xpNeeded(data.level || 1);
      return (
        `${rarityColor} *${base.name}*${active}\n` +
        `   ${typeLabel[base.type] || '⚔️'} ${base.rarity} • Lv.${data.level || 1} • XP ${data.xp || 0}/${needed}\n` +
        `   🆔 \`${id}\``
      );
    }).join('\n\n');

    const nama = target === sender ? (pushname || 'Kamu') : `@${target.split('@')[0]}`;

    const caption =
      `╭─「 🗡️ *GUDANG SENJATA* 」\n` +
      `│ 👤 ${nama}\n` +
      `│ 📦 Total: ${entries.length} weapon\n` +
      `╰──────────────────\n\n` +
      lines +
      `\n\n_Equip: ${prefix}equipweapon <id> | Upgrade: ${prefix}upgradeweapon <id>_`;

    return alya.sendMessage(m.chat, { text: caption, mentions: target !== sender ? [target] : [] }, { quoted: m });
  }
};
