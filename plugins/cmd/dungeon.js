// Plugin: dungeon
// Commands: dungeon (start, serang, keluar) — TIDAK BERUBAH
// Alya V20 — DUNGEON: THE ABYSS, versi terintegrasi WEAPON SYSTEM (lib/weapons.js)
// Ported dari V12, isi/cerita dirombak total, command & alur dasar dipertahankan.
//
// Perubahan utama dari versi lama:
// - Syarat masuk BUKAN lagi user.sword/user.sworddurability, tapi WEAPON SYSTEM
//   (user.weapons + user.equippedWeapon dari .gachaweapon/.pilihweapon/.equipweapon).
//   Kalau player sudah punya weapon yang di-equip, tinggal pakai itu — tidak perlu craft sword lagi.
// - Damage weapon (effectiveDmg, critBonus, role synergy, proc effect Legend/Mythic) dipakai
//   untuk mempengaruhi winChance & besar EXP/loot, senada dengan .duel.
// - Tiap lantai dapat narasi berbeda (bukan cuma nama monster), makin dalam makin gelap ceritanya.
// - Kerusakan sekarang mengurangi durability weapon (kalau ada field durability-nya) alih-alih sword lama.
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[dungeon] gagal load lib/weapons.js:', e.message);
}

Array.prototype.getRandom = Array.prototype.getRandom || function () {
  return this[Math.floor(Math.random() * this.length)];
};

// ═══════════════════════════════════════════════════════════════
// NARASI PEMBUKA per rentang lantai — dipanggil setiap kali menang di lantai itu
// ═══════════════════════════════════════════════════════════════
function getFloorNarration(floor) {
  if (floor <= 3) {
    return [
      'Lorong batu lembap menetes air dari langit-langit. Suara tetesan itu terdengar seperti detak jantung yang gugup.',
      'Lumut menyala samar di dinding, menuntunmu masuk lebih dalam. Udara mulai terasa lebih dingin dari seharusnya.',
      'Jejak cakar besar tergores di lantai batu. Sesuatu yang lebih besar dari tikus goa pernah lewat sini.',
    ].getRandom();
  }
  if (floor <= 9) {
    return [
      'Api obor padam sendiri saat kau lewat, lalu menyala lagi begitu kau berlalu — seolah dungeon ini hidup dan mengawasimu.',
      'Tulang-belulang berserakan rapi di sudut ruangan, seperti sengaja ditata sebagai peringatan.',
      'Gemerincing rantai terdengar dari kegelapan, tapi tak ada apapun yang terlihat saat kau menoleh.',
    ].getRandom();
  }
  if (floor <= 20) {
    return [
      'Ukiran kuno di dinding menggambarkan ksatria yang gugur satu per satu. Kau bertanya-tanya siapa yang akan diukir selanjutnya.',
      'Hawa membara menyambar dari lorong di depan. Sesuatu yang besar sedang menunggu, dan sepertinya ia tahu kau datang.',
      'Lantai bergetar pelan, berirama, seperti langkah kaki raksasa yang masih jauh — tapi mendekat.',
    ].getRandom();
  }
  return [
    'Realitas di sekitarmu terasa retak. Bayangan bergerak tanpa sumber cahaya, dan bisikan bahasa kuno menggema dari segala arah.',
    'Singgasana tulang berdiri di ujung lorong, dikelilingi aura yang membuat weapon-mu ikut bergetar gelisah.',
    'Langit dungeon (jika bisa disebut langit) berubah warna jadi merah darah. Kau sudah masuk terlalu dalam untuk mundur.',
  ].getRandom();
}

// ═══════════════════════════════════════════════════════════════
// MONSTER POOL — makin dalam makin kuat
// ═══════════════════════════════════════════════════════════════
function getMonster(floor) {
  let monsters = [
    { name: 'Slime Hijau', msg: 'membuncratkan asam lambung ke arahmu!', tier: 1 },
    { name: 'Kelelawar Goa', msg: 'mencoba menghisap darahmu dari balik kegelapan!', tier: 1 },
    { name: 'Goblin Pencuri', msg: 'mengayunkan pisau karatan sambil menjerit serak!', tier: 1 },
  ];
  if (floor > 5) monsters.push(
    { name: 'Skeleton Archer', msg: 'melepaskan hujan anak panah tulang!', tier: 2 },
    { name: 'Orc Warrior', msg: 'menghantamkan gada raksasa ke tanah hingga retak!', tier: 2 },
  );
  if (floor > 12) monsters.push(
    { name: 'Dark Knight', msg: 'menebas dengan pedang terkutuk berlapis kabut hitam!', tier: 3 },
    { name: 'Cerberus', msg: 'menyemburkan api neraka dari tiga mulutnya sekaligus!', tier: 3 },
  );
  if (floor > 25) monsters.push(
    { name: 'Ancient Dragon', msg: 'membakar seluruh ruangan dengan napas naga purba!', tier: 4 },
    { name: 'Lich King', msg: 'menjerat kakimu dengan rantai arwah gentayangan!', tier: 4 },
  );
  return monsters.getRandom();
}

// Ambil data weapon efektif yang di-equip user (null kalau tangan kosong / lib blm siap)
function getEquippedWeaponData(userDb) {
  if (!W.getWeaponById || !userDb?.equippedWeapon) return null;
  const wId = userDb.equippedWeapon;
  const owned = userDb.weapons?.[wId];
  if (!owned) return null;
  const eff = W.getEffectiveWeaponStats(wId, owned.level || 1);
  if (!eff) return null;
  return { id: wId, ...eff, durability: owned.durability };
}

module.exports = {
  command: ['dungeon'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      reply, replyalya, replytolak,
      sender, pushname, user
    } = ctx;

    if (!m.isGroup) return replytolak(global.mess.only.group);

    let userAlt = global.db.users[m.sender];
    let [aksi] = args;
    const cooldown = 1800000;

    user.lastdungeon = user.lastdungeon || 0;
    user.pet = user.pet || 0;
    alya.dungeon = alya.dungeon || {};

    const weapon = getEquippedWeaponData(user);

    try {
      switch (aksi) {
        // ═══════════════════════════════════════════════════════
        case 'start': {
          if (alya.dungeon[m.sender]) return replytolak('⚠️ *Kamu masih berada di dalam!* Hadapi monster di depanmu, atau ketik `.dungeon keluar`.');

          // ── SYARAT MASUK: WEAPON, bukan lagi sword lama ──
          if (!weapon) {
            return replytolak(
              `⚔️ *Akses Ditolak!*\n\n` +
              `Gerbang Abyss menolak membuka diri — ia hanya merespons pemilik senjata.\n\n` +
              `Kamu butuh weapon yang ter-*equip* untuk masuk:\n` +
              `➤ Belum punya weapon? Tarik gacha: *${prefix}gachaweapon* atau beli langsung: *${prefix}pilihweapon*\n` +
              `➤ Sudah punya tapi belum dipakai? *${prefix}equipweapon <id_weapon>*`
            );
          }
          if (weapon.durability !== undefined && weapon.durability <= 10) {
            return replytolak(
              `⚠️ *${weapon.name}* sudah nyaris hancur (durability ${weapon.durability})!\n` +
              `Perbaiki dulu sebelum masuk lagi.`
            );
          }
          if (user.health < 80) return replytolak('❤️ HP minimal 80 untuk masuk. Istirahat/heal dulu.');

          if (new Date() - user.lastdungeon <= cooldown) {
            let timers = cooldown - (new Date() - user.lastdungeon);
            return replytolak(`⏳ Dungeon masih tertutup kabut. Tunggu *${(timers / 60000).toFixed(1)} menit* lagi.`);
          }

          alya.dungeon[m.sender] = {
            floor: 0,
            winChance: 0.92,
            accumulatedExp: 0,
            accumulatedLoot: {},
            monstersDefeated: [],
            weaponId: weapon.id,
          };

          const rarityColor = W.RARITY?.[weapon.rarity]?.color || '⚪';

          return replyalya(
            `*\`⚔️ DUNGEON: THE ABYSS ⚔️\`*\n\n` +
            `Gerbang batu kuno terbuka perlahan... bau amis darah dan hawa dingin menyambutmu dari dalam.\n\n` +
            `${rarityColor} *${weapon.name}* (${weapon.rarity}, Lv.${weapon.level}) bergetar pelan di genggamanmu, ` +
            `seolah sudah tidak sabar mencicipi pertarungan.\n\n` +
            `Konon di lantai terdalam Abyss, tersimpan *Pet Token* legendaris yang menunggu ksatria yang cukup gila untuk mengambilnya.\n\n` +
            `🔹 *Lantai 1-5:* Material Dasar (Batu, Sampah)\n` +
            `🔹 *Lantai 6-12:* Logam (Besi, Emas)\n` +
            `🔹 *Lantai 13+:* Permata Langka (Diamond, Emerald)\n` +
            `🔹 *Lantai 25+:* Sarang monster kuno & Pet Token\n\n` +
            `*Ketik:* \`${prefix}dungeon serang\`\n` +
            `*Ketik:* \`${prefix}dungeon keluar\``
          );
        }

        // ═══════════════════════════════════════════════════════
        case 'serang': {
          let session = alya.dungeon[m.sender];
          if (!session) return replyalya(`*Mulai dulu!* Ketik \`${prefix}dungeon start\`.`);

          if (!weapon) {
            delete alya.dungeon[m.sender];
            return replyalya('❌ Weapon-mu terlepas entah kenapa! Kamu terpaksa mundur dari Abyss. Equip weapon lagi lalu `.dungeon start`.');
          }

          let monster = getMonster(session.floor + 1);
          const narration = getFloorNarration(session.floor + 1);

          const roleSynergy = W.getRoleSynergyMultiplier
            ? W.getRoleSynergyMultiplier(user.class, weapon.role)
            : 1;
          const weaponWinBonus = Math.min(0.12, (weapon.effectiveDmg / 500) + (weapon.critBonus || 0) * 0.2) * roleSynergy;
          const effectiveWinChance = Math.min(0.97, session.winChance + weaponWinBonus);

          if (Math.random() < effectiveWinChance) {
            session.floor++;
            session.monstersDefeated.push(monster.name);

            let mult = 1 + (session.floor * 0.7);
            let expGained = Math.floor((Math.random() * 800) * mult);
            expGained += Math.round(weapon.effectiveDmg * 2);

            let items = {
              iron: session.floor > 4 ? Math.floor(Math.random() * 6) : 0,
              gold: session.floor > 9 ? Math.floor(Math.random() * 4) : 0,
              diamond: session.floor > 15 ? [0, 1, 0, 0].getRandom() : 0,
              pet: 0,
            };
            if (session.floor >= 10 && session.floor < 25) {
              if (Math.random() < 0.20) items.pet = 1;
            } else if (session.floor >= 25 && session.floor < 50) {
              if (Math.random() < 0.50) items.pet = 1;
            } else if (session.floor >= 50) {
              items.pet = 2;
            }

            session.accumulatedExp += expGained;
            let lootText = `✨ Exp: +${expGained}`;

            for (let it in items) {
              if (items[it] > 0) {
                let total = (it === 'pet') ? items[it] : Math.floor(items[it] * (1 + session.floor * 0.25));
                session.accumulatedLoot[it] = (session.accumulatedLoot[it] || 0) + total;
                let emot = (it === 'pet') ? '🔖' : (global.rpg && global.rpg.emoticon) ? global.rpg.emoticon(it) : '📦';
                lootText += `\n${emot} ${it}: +${total}`;
              }
            }

            let procLine = '';
            if (weapon.proc && Math.random() < weapon.proc.chance) {
              procLine = `\n\n💥 *${weapon.name}* bereaksi! ${weapon.proc.desc}, membantumu menuntaskan pertarungan lebih cepat.`;
            }

            session.winChance = Math.max(0.12, session.winChance - 0.06);

            await replyalya(
              `*\`⚔️ LANTAI ${session.floor}: VICTORY!\`*\n\n` +
              `📖 _${narration}_\n\n` +
              `👾 *Monster:* ${monster.name}\n` +
              `${monster.name} ${monster.msg}\n` +
              `Namun *${weapon.name}* di tanganmu menjawabnya dengan tebasan telak — pertarungan berakhir untukmu!${procLine}\n\n` +
              `*Loot Ditemukan:*\n${lootText}\n\n` +
              `🔥 *Peluang Menang Lantai ${session.floor + 1}:* **${Math.round(effectiveWinChance * 100)}%**\n` +
              `Lanjut serang atau keluar?`
            );
          } else {
            user.health -= 65;
            if (weapon.id && user.weapons?.[weapon.id]) {
              user.weapons[weapon.id].durability = Math.max(
                0,
                (user.weapons[weapon.id].durability !== undefined ? user.weapons[weapon.id].durability : 100) - 30
              );
            }
            user.lastdungeon = new Date() * 1;
            delete alya.dungeon[m.sender];

            await replyalya(
              `*KAU DIKALAHKAN!* 💀\n\n` +
              `📖 _${narration}_\n\n` +
              `${monster.name} ${monster.msg}\n` +
              `*${weapon.name}*-mu terpental dari tanganmu, retak akibat benturan dahsyat itu.\n\n` +
              `Semua jarahan di tas Dungeon-mu hilang, terkubur runtuhan Abyss.`
            );
          }
          return;
        }

        // ═══════════════════════════════════════════════════════
        case 'keluar': {
          let res = alya.dungeon[m.sender];
          if (!res) return replyalya('*Kamu tidak sedang di Dungeon.*');

          let finalReport = `*\`🏁 EKSPEDISI SELESAI\`*\n\n`;
          finalReport += `🏰 Lantai Terakhir: ${res.floor}\n`;
          finalReport += `👾 Monster Terbunuh: ${res.monstersDefeated.length}\n`;
          finalReport += `✨ Total Exp: ${res.accumulatedExp}\n`;

          userAlt.exp = (userAlt.exp || 0) + res.accumulatedExp;
          for (let item in res.accumulatedLoot) {
            let qty = res.accumulatedLoot[item];
            user[item] = (user[item] || 0) + qty;
            let emot = (item === 'pet') ? '🔖' : (global.rpg && global.rpg.emoticon) ? global.rpg.emoticon(item) : '📦';
            finalReport += `${emot} ${item}: ${qty}\n`;
          }

          let weaponLine = '';
          if (res.weaponId && user.weapons?.[res.weaponId] && W.xpNeeded) {
            const wData = user.weapons[res.weaponId];
            const wBase = W.getWeaponById(res.weaponId);
            const gainXp = res.floor * 5;
            wData.xp = (wData.xp || 0) + gainXp;
            const curLvl = wData.level || 1;
            const needed = W.xpNeeded(curLvl);
            let upLine = '';
            if (wData.xp >= needed) {
              wData.xp -= needed;
              wData.level = curLvl + 1;
              upLine = ` 🆙 *LEVEL UP!* ➜ Lv.${wData.level}`;
            }
            weaponLine = `\n🗡️ *${wBase?.name || res.weaponId}* +${gainXp} XP tempur.${upLine}`;

            const durLoss = res.floor * 3;
            wData.durability = Math.max(0, (wData.durability !== undefined ? wData.durability : 100) - durLoss);
            weaponLine += `\n⚙️ Durability tersisa: ${wData.durability}`;
          }

          user.health -= (res.floor * 2);
          user.lastdungeon = new Date() * 1;

          delete alya.dungeon[m.sender];
          await replyalya(
            `${finalReport}${weaponLine}\n\n` +
            `📖 _Kamu melangkah mundur perlahan, membawa jarahanmu keluar dari kegelapan Abyss._\n\n` +
            `*Status:* Kamu berhasil membawa pulang jarahan dengan selamat!`
          );
          return replyalya(
            `*「 DUNGEON ABYSS 」*\n\n` +
            `1. \`${prefix}dungeon start\`\n` +
            `2. \`${prefix}dungeon serang\`\n` +
            `3. \`${prefix}dungeon keluar\`\n\n` +
            `_Syarat masuk: weapon ter-equip (${prefix}equipweapon), bukan lagi craft sword manual._`
          );
        }

        default:
          return replyalya(
            `*「 DUNGEON ABYSS 」*\n\n` +
            `1. \`${prefix}dungeon start\` — masuk ke Abyss (butuh weapon ter-equip)\n` +
            `2. \`${prefix}dungeon serang\` — lawan monster di depanmu\n` +
            `3. \`${prefix}dungeon keluar\` — bawa pulang jarahan dengan selamat\n\n` +
            `_Belum punya weapon? ${prefix}gachaweapon / ${prefix}pilihweapon, lalu ${prefix}equipweapon <id>_`
          );
      }
    } catch (e) {
      console.log(e);
      replyalya('❌ Dungeon Runtuh! (terjadi error internal)');
    }
  }
};
