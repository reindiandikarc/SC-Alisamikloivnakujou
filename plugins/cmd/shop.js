// Plugin: shop
// Commands: shop
// RPG Item Shop — Fixed V13
'use strict';

module.exports = {
  command: ['shop'],
  tags: ['rpg'],
  run: async (alya, m, ctx) => {
    const { prefix, sender, args, reply, replyalya } = ctx;

    const userData = global.db?.users?.[sender] || {};
    const money = Number(userData.money) || 0;

    const ITEMS = [
      { id: 'antibegal', name: '🛡️ Anti Begal', price: 500_000_000, desc: 'Melindungi dari rampok' },
      { id: 'healthpotion', name: '🧪 Health Potion', price: 50_000, desc: 'Pulihkan 50 HP dalam battle' },
      { id: 'xpboost', name: '⚡ XP Boost (x2)', price: 200_000, desc: 'Gandakan XP selama 1 jam' },
    ];

    if (!args[0]) {
      const list = ITEMS.map((it, i) =>
        `${i + 1}. *${it.name}* — Rp ${it.price.toLocaleString('id-ID')}\n   📌 ${it.desc}`
      ).join('\n\n');
      return replyalya(
        `🏪 *RPG ITEM SHOP*\n\n${list}\n\n💰 Uangmu: Rp ${money.toLocaleString('id-ID')}\n\n📌 Cara beli: *${prefix}shop <nama_item>*\nContoh: *${prefix}shop antibegal*`
      );
    }

    const itemKey = args[0].toLowerCase();
    const item = ITEMS.find(it => it.id === itemKey);
    if (!item) return replyalya(`❌ Item *${itemKey}* tidak tersedia!\n\nKetik *${prefix}shop* untuk melihat daftar item.`);

    if (money < item.price) {
      return replyalya(
        `❌ Uang tidak cukup!\n\n💰 Harga  : Rp ${item.price.toLocaleString('id-ID')}\n💸 Milik  : Rp ${money.toLocaleString('id-ID')}\n\n📌 Cari uang dulu pakai *${prefix}kerja* atau *${prefix}rampok*`
      );
    }

    userData.money = money - item.price;
    userData[item.id] = (Number(userData[item.id]) || 0) + 1;

    replyalya(
      `✅ *PEMBELIAN BERHASIL!*\n\n🛒 Item    : ${item.name}\n💰 Harga   : Rp ${item.price.toLocaleString('id-ID')}\n📦 Stok    : ${userData[item.id]} pcs\n💵 Sisa    : Rp ${userData.money.toLocaleString('id-ID')}`
    );
  },
};
