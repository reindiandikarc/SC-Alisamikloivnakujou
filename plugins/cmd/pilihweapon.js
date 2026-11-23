// Plugin: pilihweapon
// Commands: pilihweapon
// Alya V20 — Beli weapon LANGSUNG (pasti dapat) sesuai rarity pilihan sendiri.
// Beda dari .gachaweapon yang untung-untungan, di sini user pilih rarity + weapon spesifik.
// Harga makin tinggi rarity-nya makin mahal, dikali 2x lipat tiap naik tingkat:
//   Common -> Epic -> Legend -> Mythic
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[pilihweapon] gagal load lib/weapons.js:', e.message);
}

const RARITY_ORDER = ['common', 'epic', 'legend', 'mythic'];
const RARITY_DISPLAY = { common: 'Common', epic: 'Epic', legend: 'Legend', mythic: 'Mythic' };

const TYPE_LABEL = {
  sword: '🗡️ Pedang', bow: '🏹 Busur', spear: '🔱 Tombak', dagger: '🔪 Belati',
  staff: '🪄 Tongkat', hammer: '🔨 Palu', scythe: '⚰️ Sabit', gauntlet: '🥊 Sarung Tinju'
};
const ROLE_LABEL = { tank: '🛡️ Tank', assassin: '🗡️ Assassin', fighter: '👊 Fighter', mage: '🔮 Mage' };

module.exports = {
  command: ['pilihweapon'],
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

    const arg0 = args[0]?.toLowerCase();

    // ── Mode 1: tanpa argumen -> tampilkan daftar rarity + harga ──────────
    if (!arg0) {
      const rarityLines = RARITY_ORDER.map(r => {
        const rarityKey = RARITY_DISPLAY[r];
        const price = W.getBuyPrice(rarityKey);
        const color = W.RARITY[rarityKey]?.color || '⚪';
        const count = W.getWeaponsByRarity(rarityKey).length;
        return `${color} *${rarityKey}* — Rp ${price.toLocaleString('id-ID')} _(${count} pilihan)_`;
      }).join('\n');

      return replyalya(
        `╭─「 🛒 *PILIH WEAPON* 」\n` +
        `│\n` +
        `│ Beda sama *${prefix}gachaweapon* yang untung-untungan,\n` +
        `│ di sini kamu *PASTI DAPAT* weapon yang kamu mau!\n` +
        `│ Makin tinggi rarity, makin mahal (2x lipat tiap naik):\n` +
        `│\n` +
        `│ ${rarityLines}\n` +
        `│\n` +
        `╰──────────────────\n\n` +
        `📌 *Cara pakai:*\n` +
        `*${prefix}pilihweapon <rarity>* — lihat daftar weapon di rarity itu\n` +
        `_Contoh: ${prefix}pilihweapon legend_\n\n` +
        `*${prefix}pilihweapon <id_weapon>* — langsung beli weapon tsb\n` +
        `_Contoh: ${prefix}pilihweapon kusanagi_no_tsurugi_`
      );
    }

    // ── Mode 2: argumen adalah nama rarity -> tampilkan daftar weapon ─────
    if (RARITY_ORDER.includes(arg0)) {
      const rarityKey = RARITY_DISPLAY[arg0];
      const price = W.getBuyPrice(rarityKey);
      const color = W.RARITY[rarityKey]?.color || '⚪';
      const pool = W.getWeaponsByRarity(rarityKey);

      const list = pool.map(w => {
        const owned = user.weapons?.[w.id] ? ' ✅' : '';
        const extra = [];
        if (w.critBonus) extra.push(`Crit +${Math.round(w.critBonus * 100)}%`);
        if (w.defBonus) extra.push(`DEF +${Math.round(w.defBonus * 100)}%`);
        const extraTxt = extra.length ? ` (${extra.join(', ')})` : '';
        return (
          `• *${w.id}*${owned}\n` +
          `  ${TYPE_LABEL[w.type] || '⚔️'} — *${w.name}* (${ROLE_LABEL[w.role] || w.role})\n` +
          `  DMG +${w.dmg}${extraTxt}` +
          (w.skillName ? `\n  🌟 Skill: ${w.skillName}` : '')
        );
      }).join('\n\n');

      return replyalya(
        `╭─「 ${color} *WEAPON ${rarityKey.toUpperCase()}* 」\n` +
        `│ 💰 Harga: Rp ${price.toLocaleString('id-ID')} / weapon\n` +
        `╰──────────────────\n\n` +
        `${list}\n\n` +
        `📌 Beli: *${prefix}pilihweapon <id_weapon>*\n` +
        `_(✅ = sudah kamu punya)_`
      );
    }

    // ── Mode 3: argumen adalah id weapon -> proses pembelian ──────────────
    const weaponId = arg0;
    const base = W.getWeaponById(weaponId);
    if (!base) {
      return replyalya(
        `❌ Weapon *${weaponId}* tidak ditemukan.\n\n` +
        `Cek daftar dulu: *${prefix}pilihweapon* atau *${prefix}pilihweapon <rarity>*\n` +
        `_(rarity: common, epic, legend, mythic)_`
      );
    }

    const price = W.getBuyPrice(base.rarity);
    const rarityColor = W.RARITY[base.rarity]?.color || '⚪';

    if ((user.money || 0) < price) {
      return replyalya(
        `💸 *Dompet kurang, Bos!*\n\n` +
        `${rarityColor} *${base.name}* (${base.rarity}) harganya *Rp ${price.toLocaleString('id-ID')}*\n` +
        `Saldo kamu: Rp ${(user.money || 0).toLocaleString('id-ID')}`
      );
    }

    if (!user.weapons) user.weapons = {};

    let statusText;
    if (user.weapons[weaponId]) {
      // Sudah punya -> beli lagi dianggap "investasi ulang", langsung disetarakan XP kayak dupe gacha
      const dupeXpMap = { Common: 40, Epic: 90, Legend: 180, Mythic: 400 };
      const gainedXp = dupeXpMap[base.rarity] || 40;
      user.money -= price;
      user.weapons[weaponId].xp = (user.weapons[weaponId].xp || 0) + gainedXp;

      let leveledUp = 0;
      while (true) {
        const lvl = user.weapons[weaponId].level || 1;
        const needed = W.xpNeeded(lvl);
        if (user.weapons[weaponId].xp >= needed) {
          user.weapons[weaponId].xp -= needed;
          user.weapons[weaponId].level = lvl + 1;
          leveledUp++;
        } else break;
      }

      statusText =
        `♻️ *SUDAH PUNYA WEAPON INI!*\n` +
        `Pembelian ulang dikonversi jadi *+${gainedXp} XP* (kayak dupe gacha).\n` +
        (leveledUp > 0
          ? `🆙 *LEVEL UP!* Sekarang Level ${user.weapons[weaponId].level} (naik ${leveledUp}x)!`
          : `📊 XP sekarang: ${user.weapons[weaponId].xp}/${W.xpNeeded(user.weapons[weaponId].level || 1)}`);
    } else {
      user.money -= price;
      user.weapons[weaponId] = { level: 1, xp: 0 };
      statusText = `🆕 *WEAPON BARU MASUK GUDANG SENJATA!*`;

      if (!user.equippedWeapon) {
        user.equippedWeapon = weaponId;
        statusText += `\n⚔️ Otomatis di-equip karena ini weapon pertamamu!`;
      }
    }

    let extraLine = '';
    if (base.critBonus) extraLine += `\n│ 🎯 *Bonus Crit:* +${Math.round(base.critBonus * 100)}%`;
    if (base.defBonus) extraLine += `\n│ 🛡️ *Bonus DEF:* +${Math.round(base.defBonus * 100)}%`;
    if (base.proc) extraLine += `\n│ 💫 *Efek Spesial:* ${base.proc.desc} _(±${Math.round(base.proc.chance * 100)}%/serang)_`;
    if (base.skillName) extraLine += `\n│ 🌟 *Skill Spesial:* ${base.skillName}`;

    const caption =
      `╭─「 🛒 *PEMBELIAN BERHASIL* 」\n` +
      `│\n` +
      `│ ${rarityColor} *${base.rarity}* — ${TYPE_LABEL[base.type] || base.type}: *${base.name}*\n` +
      `│ 👤 *Cocok untuk:* ${ROLE_LABEL[base.role] || base.role}\n` +
      `│ ⚔️ *Base DMG:* +${base.dmg}` +
      extraLine + `\n` +
      `│\n` +
      `│ 💰 *Harga:* Rp ${price.toLocaleString('id-ID')}\n` +
      `│ 💰 *Sisa Saldo:* Rp ${user.money.toLocaleString('id-ID')}\n` +
      `╰──────────────────\n\n` +
      statusText +
      `\n\n📦 Cek gudang senjata: *${prefix}inventoryweapon*\n` +
      `🆙 Upgrade: *${prefix}upgradeweapon ${weaponId}*`;

    await alya.sendMessage(m.chat, { react: { text: rarityColor, key: m.key } });
    return replyalya(caption);
  }
};
