// Plugin: duel
// Commands: duel, tantang
// Alya V20 — Sistem Duel antar user dengan class system + WEAPON SYSTEM
// Ported dari V13, upgraded V20: integrasi .gachaweapon / .upgradeweapon / .equipweapon
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[duel] gagal load lib/weapons.js:', e.message);
}

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[duel] gagal load lib/playerlevel.js:', e.message);
}

let Origin = {};
try { Origin = require('../../lib/isekaiOrigin'); } catch (e) {
  console.error('[duel] gagal load lib/isekaiOrigin.js:', e.message);
}

// ═══════════════════════════════════════════════════════════════
// Shared CLASSES dari selectclass.js (via global)
// Inisialisasi di sini sebagai fallback jika selectclass belum load
// ═══════════════════════════════════════════════════════════════
if (!global._ALYA_CLASSES) {
  global._ALYA_CLASSES = {
    warrior:  { name: 'Warrior',  emoji: '⚔️', hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15, skillName: 'Heavy Smash',    ultiName: 'Berserker Rage' },
    mage:     { name: 'Mage',     emoji: '🔮', hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10, skillName: 'Fireball',        ultiName: 'Meteor Strike' },
    assassin: { name: 'Assassin', emoji: '🗡️', hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38, skillName: 'Backstep Slash', ultiName: 'Shadow Assassination' },
    tank:     { name: 'Tank',     emoji: '🛡️', hp: 850, mana:  80, dmg: 18, skillDmg: 30, crit: 0.05, skillName: 'Shield Bash',    ultiName: 'Earthquake' }
  };
}

// Duel state per-group diinisialisasi di dalam run() via `if (!alya.duel) alya.duel = {}`
// (baris ini sengaja dihapus — versi lama referensi `alya` di top-level module scope,
//  padahal `alya` cuma tersedia di dalam run(alya, m, ctx), jadi bikin ReferenceError
//  begitu file ini di-require oleh loader)

const CLASSES = global._ALYA_CLASSES;

// Nama-nama heal ala anime buat command "bertahan" biar kocak
const HEAL_NAMES = [
  'Shizune no Chikara: Penyembuhan Ninja Medis',
  'Sakura Byakugou: Regenerasi Sel Kayu Seratus',
  'Unohana Style: Minazuki Penyembuh Jiwa',
  'Phoenix Down Ecchi: Bangkit dari Kubangan Nasi Padang',
  'Recovery Girl: Deku Jangan Mati Dulu!',
  'Elixir Isekai: Ramuan Warung Madam Boa',
];

// Formula bonus stat SEKARANG dipusatkan di lib/playerlevel.js (jangan duplikat lagi di sini)
const getBonus = (user) => {
  const lvl = parseInt(user.duelLvl) || 0;
  return PlayerLevel.getClassBonus ? PlayerLevel.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) };
};

const createBar = (current, max, symbol) => {
  const size = 10;
  if (isNaN(current) || isNaN(max) || max <= 0) return '┈'.repeat(size);
  const progress = Math.min(size, Math.max(0, Math.round((current / max) * size)));
  return symbol.repeat(progress) + '┈'.repeat(size - progress);
};

// Ambil data weapon yang sedang di-equip user (return null kalau ga ada / lib blm siap)
function getEquippedWeaponData(userDb) {
  if (!W.getWeaponById || !userDb?.equippedWeapon) return null;
  const wId = userDb.equippedWeapon;
  const owned = userDb.weapons?.[wId];
  if (!owned) return null;
  const eff = W.getEffectiveWeaponStats(wId, owned.level || 1);
  if (!eff) return null;
  return eff; // { ...base, effectiveDmg, level }
}

// Label tipe senjata buat flavor text
const TYPE_LABEL = {
  sword: 'pedang', bow: 'busur', spear: 'tombak', dagger: 'belati',
  staff: 'tongkat', hammer: 'palu', scythe: 'sabit', gauntlet: 'sarung tinju'
};

// ═══════════════════════════════════════════════════════════════
// DEAL DAMAGE — terapkan damage ke defender, serap Shield dulu baru HP.
// ═══════════════════════════════════════════════════════════════
function dealDamage(duel, defenderKey, rawDmg) {
  const dmg = Math.max(0, Math.round(rawDmg));
  const shieldKey = defenderKey + 'Shield';
  const hpKey = defenderKey + 'Hp';
  const currentShield = duel[shieldKey] || 0;

  if (currentShield > 0) {
    const absorbed = Math.min(currentShield, dmg);
    duel[shieldKey] = currentShield - absorbed;
    const leftover = dmg - absorbed;
    if (leftover > 0) duel[hpKey] -= leftover;
    return { dealt: dmg, shieldAbsorbed: absorbed, shieldBroken: duel[shieldKey] === 0 };
  }

  duel[hpKey] -= dmg;
  return { dealt: dmg, shieldAbsorbed: 0, shieldBroken: false };
}

// ═══════════════════════════════════════════════════════════════
// PROC EFFECT HANDLER — efek spesial weapon Legend/Mythic
// Return { extraDmg, logLine, statusApply }
// ═══════════════════════════════════════════════════════════════
function applyWeaponProc(weapon, duel, attackerKey, defenderKey, baseDmgDealt) {
  if (!weapon?.proc) return { extraDmg: 0, logLine: '', ultLine: '' };
  if (Math.random() > weapon.proc.chance) return { extraDmg: 0, logLine: '', ultLine: '' };

  const eff = weapon.proc.effect;
  let extraDmg = 0;
  let logLine = '';

  if (eff === 'bleed') {
    extraDmg = weapon.proc.value;
    logLine = `\n🩸 *EFEK ${weapon.name.toUpperCase()}:* ${weapon.proc.desc}! *-${extraDmg} HP tambahan (bleed)*`;
  } else if (eff === 'stun') {
    duel[defenderKey + 'Stunned'] = true;
    logLine = `\n⚡ *EFEK ${weapon.name.toUpperCase()}:* ${weapon.proc.desc}! Lawan *STUN*, giliran depan bakal skip!`;
  } else if (eff === 'manaburn') {
    const mKey = defenderKey + 'Mana';
    duel[mKey] = Math.max(0, (duel[mKey] || 0) - weapon.proc.value);
    logLine = `\n🔥 *EFEK ${weapon.name.toUpperCase()}:* ${weapon.proc.desc}! Mana lawan terkuras *-${weapon.proc.value} MP*`;
  } else if (eff === 'lifesteal') {
    const heal = Math.round((baseDmgDealt || 0) * weapon.proc.value);
    const hKey = attackerKey + 'Hp';
    const maxKey = attackerKey + 'MaxHp';
    duel[hKey] = Math.min(duel[maxKey], (duel[hKey] || 0) + heal);
    logLine = `\n💜 *EFEK ${weapon.name.toUpperCase()}:* ${weapon.proc.desc}! Nyerap *+${heal} HP* buat diri sendiri!`;
  }

  return { extraDmg, logLine };
}

// ═══════════════════════════════════════════════════════════════
// HANDLE DUEL END — proses reward pemenang & penalty yang kalah,
// lalu kirim statusMsg akhir. Dipakai baik saat HP lawan habis lewat
// serangan biasa MAUPUN saat salah satu pemain mengetik "nyerah".
// prefix diteruskan lewat closure (dipanggil dari dalam run()).
// ═══════════════════════════════════════════════════════════════
async function handleDuelEnd(alya, m, duel, statusMsg, p1Alive, p2Alive, W, Origin, PlayerLevel, prefix) {
  const winner = !p1Alive ? duel.p2 : duel.p1;
  const loser = !p1Alive ? duel.p1 : duel.p2;
  const xpReward = duel.xpReward || 50000;
  const moneyReward = duel.moneyReward || 100000;

  const winnerDb = global.db?.users?.[winner];
  const loserDb = global.db?.users?.[loser];

  let winnerWeaponLine = '';
  let loserWeaponLine = '';

  const isPahlawan = (db) => {
    const owned = new Set(db?.unlockedClasses || []);
    return owned.size >= 4 && (db?.duelLvl || 0) >= (PlayerLevel.MAX_LEVEL ? 999 : 999);
  };

  let winnerTitleNotif = null;

  if (winnerDb) {
    winnerDb.exp = (winnerDb.exp || 0) + xpReward;
    winnerDb.money = (winnerDb.money || 0) + moneyReward;
    if (!isPahlawan(winnerDb)) {
      const cap = PlayerLevel.MAX_LEVEL || 999;
      winnerDb.duelLvl = Math.min(cap, (winnerDb.duelLvl || 0) + 1);
    }
    winnerDb.duelTitle = 'Yang Terkuat';
    const wId = winnerDb.equippedWeapon;
    if (wId && winnerDb.weapons?.[wId]) {
      winnerDb.weapons[wId].level = (winnerDb.weapons[wId].level || 1) + 1;
      const wBase = W.getWeaponById ? W.getWeaponById(wId) : null;
      winnerWeaponLine = `\n⚔️ Weapon *${wBase?.name || wId}* naik ke Level ${winnerDb.weapons[wId].level}!`;
    }
    if (Origin.checkTitleUnlockNotif) {
      winnerTitleNotif = Origin.checkTitleUnlockNotif(winnerDb.unlockedClasses || [], winnerDb.duelLvl || 0);
      if (winnerTitleNotif && new Set(winnerDb.unlockedClasses || []).size >= 4 && (winnerDb.duelLvl || 0) >= Origin.PAHLAWAN_UNLOCK_LEVEL) {
        winnerDb.duelLvl = Origin.PAHLAWAN_UNLOCK_LEVEL;
      }
    }
  }

  if (loserDb) {
    if (!isPahlawan(loserDb)) {
      loserDb.duelLvl = Math.max(0, (loserDb.duelLvl || 0) - 1);
    }
    if (loserDb.duelTitle === 'Yang Terkuat') loserDb.duelTitle = null;
    const wId = loserDb.equippedWeapon;
    if (wId && loserDb.weapons?.[wId]) {
      const oldLvl = loserDb.weapons[wId].level || 1;
      loserDb.weapons[wId].level = Math.max(1, oldLvl - 1);
      const wBase = W.getWeaponById ? W.getWeaponById(wId) : null;
      if (oldLvl > 1) {
        loserWeaponLine = `\n💔 Weapon *${wBase?.name || wId}* turun ke Level ${loserDb.weapons[wId].level}!`;
      }
    }
  }

  statusMsg +=
    `\n\n*── 「 🏆 DUEL SELESAI! 」 ──*\n\n` +
    `🥇 *PEMENANG:* @${winner.split('@')[0]}\n` +
    `👑 Gelar: *"Yang Terkuat"*\n` +
    `✨ +${xpReward.toLocaleString('id-ID')} XP | 💰 +Rp ${moneyReward.toLocaleString('id-ID')}\n` +
    `🆙 Level naik ke ${winnerDb?.duelLvl ?? '?'}!${winnerWeaponLine}\n\n` +
    `💀 *YANG KALAH:* @${loser.split('@')[0]}\n` +
    `📉 Level turun ke ${loserDb?.duelLvl ?? '?'}!${loserWeaponLine}\n\n` +
    `_GG WP! Mau balas dendam? Tantang lagi dengan *${prefix || '.'}duel @mention*_`;

  await alya.sendMessage(m.chat, { text: statusMsg, mentions: [duel.p1, duel.p2] });
  if (winnerTitleNotif) {
    await alya.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });
    await alya.sendMessage(m.chat, { text: winnerTitleNotif, mentions: [winner] });
  }
  delete alya.duel[m.chat];
}

module.exports = {
  command: ['duel', 'tantang'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      reply, replyalya, replytolak,
      sender, pushname, isGroup,
      Ryuu, resolveTarget
    } = ctx;

    // Init duel state
    if (!alya.duel) alya.duel = {};
    const CLASSES = global._ALYA_CLASSES;

    // ── Guard: harus di grup ──────────────────────────────────────────
    if (!isGroup) return replyalya('Ajak gelut kok sendirian? Duel itu di grup, biar ada penontonnya yang sorak-sorai!');

    // ── Handle respons duel aktif (terima / tolak / serang / skill / bertahan / ulti) ──
    if (alya.duel[m.chat]) {
      const duel = alya.duel[m.chat];
      const txt = m.text?.toLowerCase().trim();

      // Status WAITING — target terima/tolak
      if (duel.status === 'waiting' && m.sender === duel.p2) {
        if (txt === 'terima') {
          clearTimeout(duel.waktu);
          duel.status = 'playing';

          const w1 = duel.p1Weapon ? `\n🗡️ Weapon: *${duel.p1Weapon.name}* (${duel.p1Weapon.rarity})` : '\n🗡️ Weapon: _Tangan kosong_';
          const w2 = duel.p2Weapon ? `\n🗡️ Weapon: *${duel.p2Weapon.name}* (${duel.p2Weapon.rarity})` : '\n🗡️ Weapon: _Tangan kosong_';

          const startMsg =
            `*── 「 🔥 ARENA BAKU HANTAM 🔥 」 ──*\n\n` +
            `🥊 *PENANTANG:* @${duel.p1.split('@')[0]} [${CLASSES[duel.p1Class]?.name}]${w1}\n\n` +
            `🛡️ *LAWAN:* @${duel.p2.split('@')[0]} [${CLASSES[duel.p2Class]?.name}]${w2}\n\n` +
            `⚔️ *YANG JALAN DULUAN:* @${duel.turn.split('@')[0]}\n` +
            `_Buruan ketik: *serang*, *skill*, *bertahan*, *ulti*, atau *nyerah*_`;

          return alya.sendMessage(m.chat, { text: startMsg, mentions: [duel.p1, duel.p2] }, { quoted: m });

        } else if (txt === 'tolak') {
          clearTimeout(duel.waktu);
          alya.sendMessage(m.chat, {
            text: `⚠️ Wkwkwk! @${duel.p2.split('@')[0]} kena mental! Langsung kabur.`,
            mentions: [duel.p2]
          });
          delete alya.duel[m.chat];
          return;
        }
      }

      // Status PLAYING — giliran yang aktif
      if (duel.status === 'playing' && m.sender === duel.turn) {
        const isP1 = m.sender === duel.p1;
        const p = isP1 ? 'p1' : 'p2';
        const opp = isP1 ? 'p2' : 'p1';

        // ⚠️ FIX PENTING: normalisasi lebih kuat dari sekadar .toLowerCase().trim().
        // Sebelumnya kalau user ketik dengan spasi ganda, huruf kapital tercampur,
        // atau ada karakter tak kasat mata dari keyboard mobile (zero-width space,
        // dsb), txt2 tidak match SATUPUN case di bawah — dan karena rantai
        // if/else-if untuk serang/skill/bertahan/ulti TIDAK PUNYA else penutup,
        // variabel `log` tidak pernah ter-assign sama sekali → ReferenceError
        // saat dipakai di statusMsg → exception → tertangkap try-catch di
        // alya.js yang HANYA console.error tanpa balas apapun → user ngerasa
        // bot "diam total" padahal sebenarnya crash di tengah proses.
        const txt2 = (m.text || '')
          .normalize('NFKC')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')  // strip zero-width chars
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');

        const VALID_ACTIONS = ['serang', 'nyerang', 'attack', 'skill', 'jurus', 'bertahan', 'defend', 'ulti', 'ultimate', 'nyerah', 'menyerah', 'surrender'];

        // Bukan aksi duel yang dikenali & bukan giliran orang lain yang nyeletuk
        // biasa di grup → diam saja SELAMA bukan aksi duel (supaya chat biasa di
        // grup tidak dianggap "aksi salah"). Tapi kalau kelihatan seperti niat
        // aksi duel (pendek, tanpa spasi berlebih) namun typo, kasih tau user.
        if (!VALID_ACTIONS.includes(txt2)) {
          return; // biarkan pesan non-aksi lewat tanpa gangguan (chat biasa di grup)
        }

        // Normalisasi alias → aksi kanonik
        const actionMap = {
          nyerang: 'serang', attack: 'serang',
          jurus: 'skill',
          defend: 'bertahan',
          ultimate: 'ulti',
          menyerah: 'nyerah', surrender: 'nyerah',
        };
        const action = actionMap[txt2] || txt2;

        // Inisialisasi log di awal — GARANSI tidak pernah undefined walau
        // ada percabangan tak terduga di bawah.
        let log = `⚠️ Aksi *${action}* diproses tapi belum ada efeknya — laporkan ke owner bot.`;

        const pClass = CLASSES[duel[p + 'Class']];
        const pBonusDmg = parseInt(duel[p + 'DmgBonus']) || 0;
        const pMaxHp = parseInt(duel[p + 'MaxHp']) || pClass.hp;
        const pManaBonus = parseInt(duel[p + 'ManaBonus']) || 0;
        const pMaxMana = (pClass.mana || 100) + pManaBonus;
        const skillCost = Math.floor(pMaxMana * 0.4);
        const ultiCost = Math.floor(pMaxMana * 0.9);
        const weapon = duel[p + 'Weapon']; // eff weapon stats atau null
        const oppWeapon = duel[opp + 'Weapon'];
        const roleMult = weapon ? W.getRoleSynergyMultiplier(duel[p + 'Class'], weapon.role) : 1;
        const weaponDmg = weapon ? Math.round(weapon.effectiveDmg * roleMult) : 0;
        const weaponCrit = weapon?.critBonus || 0;
        const weaponDef = oppWeapon?.defBonus || 0; // DEF lawan mengurangi damage yang kita berikan

        // ── NYERAH — menyerah langsung, bypass dodge/miss/selfhit (bukan serangan) ──
        // HP diri sendiri di-nol-kan supaya alur cek p1Alive/p2Alive & reward/penalty
        // di bawah (yang sudah ada, jangan diduplikasi) otomatis memproses ini sebagai
        // kekalahan wajar — lawan menang seperti biasa (dapat gelar, XP, weapon naik level).
        if (action === 'nyerah') {
          duel[p + 'Hp'] = 0;
          log = `🏳️ *MENYERAH!* @${m.sender.split('@')[0]} angkat tangan dan mengaku kalah sebelum babak belur lebih parah!`;

          const p1Alive = duel.p1Hp > 0;
          const p2Alive = duel.p2Hp > 0;
          duel.turn = isP1 ? duel.p2 : duel.p1;

          const hpBar1 = createBar(duel.p1Hp, duel.p1MaxHp, '❤️');
          const hpBar2 = createBar(duel.p2Hp, duel.p2MaxHp, '❤️');
          const shield1 = duel.p1Shield > 0 ? ` 🛡️+${duel.p1Shield}` : '';
          const shield2 = duel.p2Shield > 0 ? ` 🛡️+${duel.p2Shield}` : '';

          let statusMsg =
            `${log}\n\n` +
            `*── 「 📊 STATUS ARENA 」 ──*\n\n` +
            `🥊 @${duel.p1.split('@')[0]} [${CLASSES[duel.p1Class]?.name}]\n` +
            `   ${hpBar1} ${Math.max(0, duel.p1Hp)}/${duel.p1MaxHp} HP${shield1}\n` +
            `   💠 Mana: ${Math.max(0, duel.p1Mana)}/${(CLASSES[duel.p1Class]?.mana || 0) + (duel.p1ManaBonus || 0)}\n\n` +
            `🛡️ @${duel.p2.split('@')[0]} [${CLASSES[duel.p2Class]?.name}]\n` +
            `   ${hpBar2} ${Math.max(0, duel.p2Hp)}/${duel.p2MaxHp} HP${shield2}\n` +
            `   💠 Mana: ${Math.max(0, duel.p2Mana)}/${(CLASSES[duel.p2Class]?.mana || 0) + (duel.p2ManaBonus || 0)}`;

          return await handleDuelEnd(alya, m, duel, statusMsg, p1Alive, p2Alive, W, Origin, PlayerLevel, prefix);
        }

        // ── Cek STUN dari proc weapon lawan sebelumnya ──
        if (duel[p + 'Stunned']) {
          duel[p + 'Stunned'] = false;
          duel.turn = isP1 ? duel.p2 : duel.p1;
          const stunMsg =
            `⚡ *KESETRUM/STUN!* @${m.sender.split('@')[0]} masih pusing kena efek senjata lawan, giliran ini di-skip!\n\n` +
            `⚡ *Giliran:* @${duel.turn.split('@')[0]}\n_serang | skill | bertahan | ulti | nyerah_`;
          return alya.sendMessage(m.chat, { text: stunMsg, mentions: [duel.p1, duel.p2] });
        }

        // ── Dodge aktif dari giliran bertahan sebelumnya (dodge "terjamin" 1x) ──
        const oppDodgeActive = duel[opp + 'DodgeNext'];

        // ── Dodge murni berdasar DEX (stat kemampuan menghindar dari lib/playerlevel.js) ──
        // DEX didapat dari level duel milik LAWAN (yang jadi defender di aksi ini),
        // makin tinggi DEX-nya, makin besar peluang dia otomatis ngeles walau nggak "bertahan".
        const oppJid = duel[opp];
        const oppLiveLvl = parseInt(global.db?.users?.[oppJid]?.duelLvl) || 0;
        const oppDexDodgeChance = PlayerLevel.getDodgeChance ? PlayerLevel.getDodgeChance(oppLiveLvl) : 0;

        // ═══════════════════════════════════════════════════
        // Persentase hasil serangan (untuk serang/skill/ulti):
        // Dodge (dari DEX lawan) dicek duluan, sisa peluang dibagi:
        // 50% berhasil normal, 25% miss, 25% senjata makan tuan
        // ═══════════════════════════════════════════════════
        const roll = Math.random();
        const dexRoll = Math.random();
        const isAttackAction = ['serang', 'skill', 'ulti'].includes(action);
        let outcome = 'success';
        let dexDodge = false;
        if (isAttackAction) {
          if (oppDodgeActive) {
            outcome = 'dodged';
            duel[opp + 'DodgeNext'] = false;
          } else if (dexRoll < oppDexDodgeChance) {
            outcome = 'dodged';
            dexDodge = true;
          } else if (roll < 0.25) {
            outcome = 'miss';
          } else if (roll < 0.50) {
            outcome = 'selfhit';
          } else {
            outcome = 'success';
          }
        }

        if (outcome === 'dodged') {
          log = dexDodge
            ? `🌀 *DODGE!* @${duel[opp].split('@')[0]} punya insting tinggi (DEX) dan berhasil ngeles duluan, serangan @${m.sender.split('@')[0]} mental total!`
            : `🌀 *DIHINDARI!* @${duel[opp].split('@')[0]} kebetulan pakai ${TYPE_LABEL[oppWeapon?.type] || 'insting'} buat ngeles duluan, serangan @${m.sender.split('@')[0]} mental total!`;
        } else if (outcome === 'miss') {
          log = `💨 *WLEE MELESET!* Serangan @${m.sender.split('@')[0]} cuma kena angin, ga nyentuh apa-apa selain nyamuk lewat!`;
        } else if (outcome === 'selfhit') {
          const selfDmg = Math.floor(Math.random() * 20) + 15;
          duel[p + 'Hp'] = Math.max(0, (duel[p + 'Hp'] || 0) - selfDmg);
          const weaponFlavor = weapon ? `${weapon.name}-nya` : 'tangan kosongnya';
          log = `⚠️ *SENJATA MAKAN TUAN!* @${m.sender.split('@')[0]} kaki keseleo pas ngayun ${weaponFlavor}, malah nyosor sendiri! *-${selfDmg} HP (diri sendiri)*`;
        } else {
          // outcome === 'success' (atau action === 'bertahan', selalu success)
          if (action === 'serang') {
            let dmg = Math.floor(Math.random() * 12) + pClass.dmg + pBonusDmg + weaponDmg;
            dmg = Math.round(dmg * (1 - Math.min(0.5, weaponDef)));
            const totalCrit = pClass.crit + weaponCrit;
            let critHit = false;
            if (Math.random() < totalCrit) {
              dmg = Math.floor(dmg * 2.5);
              critHit = true;
            }
            const hit = dealDamage(duel, opp, dmg);

            const weaponTag = weapon ? ` (pakai *${weapon.name}*)` : ' (tangan kosong)';
            const shieldNote = hit.shieldAbsorbed > 0 ? ` _(🛡️${hit.shieldAbsorbed} diserap shield)_` : '';
            if (critHit) {
              log = `💥 *KOMBO MAUT!* @${m.sender.split('@')[0]} nge-crit ampe ginjal lawan mau copot${weaponTag}! *-${dmg} HP*${shieldNote}`;
            } else {
              log = `⚔️ *ATTACK!* @${m.sender.split('@')[0]} ngasih bogem mentah${weaponTag}! *-${dmg} HP*${shieldNote}`;
            }

            // Proc weapon di serangan biasa juga bisa jalan (occasional proc)
            if (weapon) {
              const procResult = applyWeaponProc(weapon, duel, p, opp, dmg);
              if (procResult.extraDmg) dealDamage(duel, opp, procResult.extraDmg);
              log += procResult.logLine || '';
            }

          } else if (action === 'skill') {
            if (duel[p + 'Mana'] < skillCost) {
              return alya.sendMessage(m.chat, { text: `⚠️ Mana lu cekak! (Butuh ${skillCost} MP)` });
            }
            let dmg = Math.floor(Math.random() * 15) + pClass.skillDmg + Math.floor((pBonusDmg + weaponDmg) * 1.2);
            dmg = Math.round(dmg * (1 - Math.min(0.5, weaponDef)));
            const hitSkill = dealDamage(duel, opp, dmg);
            duel[p + 'Mana'] -= skillCost;

            const shieldNoteSkill = hitSkill.shieldAbsorbed > 0 ? ` _(🛡️${hitSkill.shieldAbsorbed} diserap shield)_` : '';
            log = `☄️ *JURUS TERLARANG: ${pClass.skillName.toUpperCase()}!*\n@${m.sender.split('@')[0]} bantai lawan! *-${dmg} HP*${shieldNoteSkill}`;

            // Skill spesial weapon Legend/Mythic otomatis nyalain bareng skill class
            if (weapon?.skillName) {
              const weaponSkillDmg = Math.round(weapon.effectiveDmg * 0.6);
              dealDamage(duel, opp, weaponSkillDmg);
              log += `\n🌟 *KOMBO SENJATA: ${weapon.skillName.toUpperCase()}!*\n"DUARR AMBROL, DINO AJUR!!" — *-${weaponSkillDmg} HP tambahan!*`;
            }
            if (weapon) {
              const procResult = applyWeaponProc(weapon, duel, p, opp, dmg);
              if (procResult.extraDmg) dealDamage(duel, opp, procResult.extraDmg);
              log += procResult.logLine || '';
            }

          } else if (action === 'bertahan') {
            const heal = Math.floor(Math.random() * 25) + 20;
            const manaRegen = Math.floor(pMaxMana * 0.35);
            let extraLog = '';

            duel[p + 'Hp'] = Math.min(pMaxHp, (duel[p + 'Hp'] || 0) + heal);
            duel[p + 'Mana'] = Math.min(pMaxMana, (duel[p + 'Mana'] || 0) + manaRegen);

            const healName = HEAL_NAMES[Math.floor(Math.random() * HEAL_NAMES.length)];
            log = `🛡️ *BERTAHAN: ${healName.toUpperCase()}!*\n@${m.sender.split('@')[0]} minggir bentar minum es teh.\n*+${heal} HP & +${manaRegen} MP*`;

            // ── Efek weapon saat bertahan ──
            if (weapon) {
              const roll2 = Math.random();
              if (weapon.rarity === 'Mythic' && roll2 < 0.35) {
                // Extra turn (main ulang)
                duel[p + 'ExtraTurn'] = true;
                extraLog += `\n✨ *${weapon.name}* bersinar! Kamu dapat *giliran ulang* setelah ini!`;
              } else if ((weapon.rarity === 'Legend' || weapon.rarity === 'Mythic') && roll2 < 0.65) {
                // Dodge next
                duel[p + 'DodgeNext'] = true;
                extraLog += `\n🌀 *${weapon.name}* mengaktifkan naluri bertahan! Serangan lawan berikutnya bakal *DI-DODGE*!`;
              } else if (weapon.defBonus > 0) {
                // Shield
                const shieldVal = Math.round(pMaxHp * weapon.defBonus);
                duel[p + 'Shield'] = (duel[p + 'Shield'] || 0) + shieldVal;
                extraLog += `\n🛡️ *${weapon.name}* memunculkan Shield *+${shieldVal} HP* pelindung!`;
              } else {
                // Extra mana
                const extraMana = Math.floor(pMaxMana * 0.15);
                duel[p + 'Mana'] = Math.min(pMaxMana, duel[p + 'Mana'] + extraMana);
                extraLog += `\n💠 *${weapon.name}* menyalurkan Extra Mana *+${extraMana} MP*!`;
              }
              log += extraLog;
            }

          } else if (action === 'ulti') {
            if (duel[p + 'Mana'] < ultiCost) {
              return alya.sendMessage(m.chat, { text: `⚠️ Mana belum cukup buat ulti! (Butuh ${ultiCost} MP)` });
            }
            const dmg = Math.round((pClass.skillDmg + pBonusDmg + weaponDmg) * 2.5 * (1 - Math.min(0.5, weaponDef)));
            const hitUlti = dealDamage(duel, opp, dmg);
            duel[p + 'Mana'] -= ultiCost;
            const shieldNoteUlti = hitUlti.shieldAbsorbed > 0 ? ` _(🛡️${hitUlti.shieldAbsorbed} diserap shield)_` : '';
            log = `💀 *ULTI BOSS: ${pClass.ultiName.toUpperCase()}!*\n@${m.sender.split('@')[0]} ngeluarin seluruh tenaga! *-${dmg} HP*${shieldNoteUlti}`;

            if (weapon?.skillName) {
              const weaponUltiDmg = Math.round(weapon.effectiveDmg * 0.9);
              dealDamage(duel, opp, weaponUltiDmg);
              log += `\n🌟 *KOMBO ULTI SENJATA: ${weapon.skillName.toUpperCase()}!*\n"DUARR AMBROL, DINO AJUR!! GG DI TEMPAT!!" — *-${weaponUltiDmg} HP tambahan!*`;
            }
            if (weapon) {
              const procResult = applyWeaponProc(weapon, duel, p, opp, dmg);
              if (procResult.extraDmg) dealDamage(duel, opp, procResult.extraDmg);
              log += procResult.logLine || '';
            }
          }
        }

        // Cek apakah ada yang mati
        const p1Alive = duel.p1Hp > 0;
        const p2Alive = duel.p2Hp > 0;

        // Ganti giliran (kecuali dapat ExtraTurn dari weapon Mythic saat bertahan)
        if (duel[p + 'ExtraTurn']) {
          duel[p + 'ExtraTurn'] = false;
          // turn tetap sama (main ulang)
        } else {
          duel.turn = isP1 ? duel.p2 : duel.p1;
        }

        const hpBar1 = createBar(duel.p1Hp, duel.p1MaxHp, '❤️');
        const hpBar2 = createBar(duel.p2Hp, duel.p2MaxHp, '❤️');

        const shield1 = duel.p1Shield > 0 ? ` 🛡️+${duel.p1Shield}` : '';
        const shield2 = duel.p2Shield > 0 ? ` 🛡️+${duel.p2Shield}` : '';

        let statusMsg =
          `${log}\n\n` +
          `*── 「 📊 STATUS ARENA 」 ──*\n\n` +
          `🥊 @${duel.p1.split('@')[0]} [${CLASSES[duel.p1Class]?.name}]\n` +
          `   ${hpBar1} ${Math.max(0, duel.p1Hp)}/${duel.p1MaxHp} HP${shield1}\n` +
          `   💠 Mana: ${Math.max(0, duel.p1Mana)}/${(CLASSES[duel.p1Class]?.mana || 0) + (duel.p1ManaBonus || 0)}\n\n` +
          `🛡️ @${duel.p2.split('@')[0]} [${CLASSES[duel.p2Class]?.name}]\n` +
          `   ${hpBar2} ${Math.max(0, duel.p2Hp)}/${duel.p2MaxHp} HP${shield2}\n` +
          `   💠 Mana: ${Math.max(0, duel.p2Mana)}/${(CLASSES[duel.p2Class]?.mana || 0) + (duel.p2ManaBonus || 0)}`;

        if (!p1Alive || !p2Alive) {
          return await handleDuelEnd(alya, m, duel, statusMsg, p1Alive, p2Alive, W, Origin, PlayerLevel, prefix);
        }

        // Lanjut duel
        statusMsg += `\n\n⚡ *Giliran:* @${duel.turn.split('@')[0]}\n_serang | skill | bertahan | ulti | nyerah_`;
        await alya.sendMessage(m.chat, { text: statusMsg, mentions: [duel.p1, duel.p2] });
        return;
      }
      // Bukan giliran / bukan peserta, abaikan
      return;
    }

    // ── TANTANG DUEL BARU ────────────────────────────────────────────
    // ✅ FIX: pakai resolveTarget() — deteksi @mention, reply, atau nomor manual
    const target = resolveTarget ? resolveTarget(ctx) : (m.quoted?.sender || m.mentionedJid?.[0] || null);
    if (!target) return replyalya('Woy! Tag orangnya atau bales chat calon korbannya dulu kalau mau nantang!');
    if (target === sender) return replyalya('Lagi stres ya? Masa mau mukul diri sendiri? Mending tidur sana!');
    if (target === alya.user?.jid || target === alya.user?.id) return replyalya('Waduh, nyalinya gede amat nantangin Bot. 😎');

    const user = global.db?.users?.[sender] || {};
    const lawan = global.db?.users?.[target];

    if (!lawan) return replyalya('Siapa tuh? Targetnya nggak ada di database!');

    // Cek class — wajib pilih dulu via .selectclass
    if (!user.class) {
      return replyalya(
        `❌ *Lu belum punya Class!*\n\n` +
        `Pilih dulu kelasmu sebelum bisa duel:\n` +
        `➤ *${prefix}selectclass* — lihat & pilih class\n\n` +
        `_Available: warrior, mage, assassin, tank_`
      );
    }
    if (!user.class || !CLASSES[user.class]) {
      return replyalya(`❌ Class lu tidak valid! Pilih ulang: *${prefix}selectclass*`);
    }
    if (!lawan.class) {
      return replyalya(
        `❌ *@${target.split('@')[0]} belum punya Class!*\n\n` +
        `Suruh dia pilih dulu:\n➤ *${prefix}selectclass*`
      );
    }

    // ═══════════════════════════════════════════════════
    // REWARD TETAP (fix, tidak lagi custom bet dari args)
    // Menang: +DUEL_XP_REWARD & +DUEL_MONEY_REWARD, naik 1 level (diri + weapon)
    // Kalah: turun 1 level (diri + weapon, minimal level 1)
    // ═══════════════════════════════════════════════════
    const DUEL_XP_REWARD = 50000;
    const DUEL_MONEY_REWARD = 100000;

    const bonusP1 = getBonus(user);
    const bonusP2 = getBonus(lawan);

    const p1Weapon = getEquippedWeaponData(user);
    const p2Weapon = getEquippedWeaponData(lawan);

    const cls1 = CLASSES[user.class];
    const cls2 = CLASSES[lawan.class];

    // ── 「 NOTIFIKASI SISTEM 」 — dikirim duluan sebelum kartu undangan ──
    const namaLawan = pushname || sender.split('@')[0];
    const systemNotif =
      `《⚠️NOTIFIKASI SISTEM⚠️》\n` +
      `「Duel Request」\n\n` +
      `Seorang Penantang telah muncul.\n` +
      `Nama: @${sender.split('@')[0]} | Job: ${cls1.name}\n` +
      `Meninggalkan jejak niat membunuh...\n\n` +
      `《Kamu ditantang untuk Duel Kehormatan》\n` +
      `Arena akan terbuka dalam 60 detik.\n` +
      `Jika di abaikan kamu di anggap cupu melarikan diri\n\n` +
      `Kekalahan = Kehilangan Status _(turun 1 level: diri & weapon)_\n` +
      `Kemenangan = Naik Level _(diri & weapon)_ + Gelar "Yang Terkuat"\n` +
      `serta mendapatkan *${DUEL_XP_REWARD.toLocaleString('id-ID')} XP* dan *Rp ${DUEL_MONEY_REWARD.toLocaleString('id-ID')} money*\n\n` +
      `Pilih Takdirmu.`;

    await alya.sendMessage(m.chat, { text: systemNotif, mentions: [sender, target] }, { quoted: m });

    alya.duel[m.chat] = {
      p1: sender, p2: target,
      p1Class: user.class, p2Class: lawan.class,
      p1Hp: CLASSES[user.class].hp + bonusP1.hp,
      p2Hp: CLASSES[lawan.class].hp + bonusP2.hp,
      p1MaxHp: CLASSES[user.class].hp + bonusP1.hp,
      p2MaxHp: CLASSES[lawan.class].hp + bonusP2.hp,
      p1Mana: CLASSES[user.class].mana + (bonusP1.mana || 0),
      p2Mana: CLASSES[lawan.class].mana + (bonusP2.mana || 0),
      p1ManaBonus: bonusP1.mana || 0, p2ManaBonus: bonusP2.mana || 0,
      p1DmgBonus: bonusP1.dmg, p2DmgBonus: bonusP2.dmg,
      p1Weapon, p2Weapon,
      p1Shield: 0, p2Shield: 0,
      p1DodgeNext: false, p2DodgeNext: false,
      p1Stunned: false, p2Stunned: false,
      p1ExtraTurn: false, p2ExtraTurn: false,
      xpReward: DUEL_XP_REWARD, moneyReward: DUEL_MONEY_REWARD,
      status: 'waiting', turn: sender,
      waktu: setTimeout(() => {
        if (alya.duel[m.chat]?.status === 'waiting') {
          alya.sendMessage(m.chat, {
            text: `⌛ *WAKTU HABIS:* @${target.split('@')[0]} kayaknya ketiduran atau takut!`,
            mentions: [target]
          });
          delete alya.duel[m.chat];
        }
      }, 60000)
    };

    const w1Line = p1Weapon ? `\n   🗡️ Weapon: *${p1Weapon.name}* (${p1Weapon.rarity}, Lv.${p1Weapon.level}) +${p1Weapon.effectiveDmg} DMG` : `\n   🗡️ Weapon: _Tangan kosong_`;
    const w2Line = p2Weapon ? `\n   🗡️ Weapon: *${p2Weapon.name}* (${p2Weapon.rarity}, Lv.${p2Weapon.level}) +${p2Weapon.effectiveDmg} DMG` : `\n   🗡️ Weapon: _Tangan kosong_`;

    const dodgeP1 = PlayerLevel.getDodgeChance ? PlayerLevel.getDodgeChance(user.duelLvl || 0) : 0;
    const dodgeP2 = PlayerLevel.getDodgeChance ? PlayerLevel.getDodgeChance(lawan.duelLvl || 0) : 0;

    const invite =
      `《⚠️NOTIFIKASI SISTEM⚠️》\n` +
      `《Kamu ditantang untuk Duel Kehormatan》\n\n` +
      `*── 「 ⚔️ UNDANGAN GELUT ⚔️ 」 ──*\n\n` +
      `🔥 *PENANTANG:* @${sender.split('@')[0]}\n` +
      `🏅 *Level:* ${user.duelLvl || 0} | 🛡️ *Class:* ${cls1.name} ${cls1.emoji}\n` +
      `   HP: ${cls1.hp + bonusP1.hp} | DMG: ${cls1.dmg} | MP: ${cls1.mana + (bonusP1.mana || 0)} | Crit: ${(cls1.crit*100).toFixed(0)}%\n` +
      `   🎯 DEX: ${bonusP1.dex || 0} (Dodge ${(dodgeP1*100).toFixed(1)}%)${w1Line}\n\n` +
      `⚡ *YANG DITANTANG:* @${target.split('@')[0]}\n` +
      `🏅 *Level:* ${lawan.duelLvl || 0} | 🛡️ *Class:* ${cls2.name} ${cls2.emoji}\n` +
      `   HP: ${cls2.hp + bonusP2.hp} | DMG: ${cls2.dmg} | MP: ${cls2.mana + (bonusP2.mana || 0)} | Crit: ${(cls2.crit*100).toFixed(0)}%\n` +
      `   🎯 DEX: ${bonusP2.dex || 0} (Dodge ${(dodgeP2*100).toFixed(1)}%)${w2Line}\n\n` +
      `💰 *Taruhan:* ${DUEL_XP_REWARD.toLocaleString('id-ID')}xp dan Rp. ${DUEL_MONEY_REWARD.toLocaleString('id-ID')} money\n\n` +
      `_Gimana? Berani? Ketik *terima* buat baku hantam atau *tolak* kalau mau dianggap cupu!_\n` +
      `_(Otomatis batal dalam 60 detik jika tidak direspons)_\n\n` +
      `📌 _Belum punya weapon? Coba *${prefix}gachaweapon*!_`;

    await alya.sendMessage(m.chat, { text: invite, mentions: [sender, target] }, { quoted: m });
  }
};
