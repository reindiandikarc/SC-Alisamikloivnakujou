// Plugin: mining
// Commands: mining (start, gali, keluar) — TIDAK BERUBAH
// Alya V20 — Versi yang benar-benar mengecek isi DB pickaxe:
// - Kalau TIDAK PUNYA pickaxe -> disuruh crafting dulu.
// - Kalau pickaxe RUSAK (durability <= 10) -> otomatis di-cek: kalau material cukup,
//   AUTO-REPAIR (pakai resep sama persis dgn .repair pickaxe: 20 rock, 20 wood, 20 iron, 1 diamond),
//   kalau material tidak cukup -> disuruh kumpulin material / pakai .repair manual dulu.
// - Kalau kondisi BAIK (durability > 10) -> lanjut mining seperti biasa via .mining start/gali/keluar.
'use strict';

const path = require('path');

// Resep repair pickaxe — HARUS identik dengan plugins/cmd/repair.js biar tidak ada 2 sumber kebenaran
const PICKAXE_REPAIR_COST = { rock: 20, wood: 20, iron: 20, diamond: 1 };

function hasEnoughForRepair(user) {
  return (
    (user.rock || 0) >= PICKAXE_REPAIR_COST.rock &&
    (user.wood || 0) >= PICKAXE_REPAIR_COST.wood &&
    (user.iron || 0) >= PICKAXE_REPAIR_COST.iron &&
    (user.diamond || 0) >= PICKAXE_REPAIR_COST.diamond
  );
}

function doAutoRepair(user) {
  user.rock -= PICKAXE_REPAIR_COST.rock;
  user.wood -= PICKAXE_REPAIR_COST.wood;
  user.iron -= PICKAXE_REPAIR_COST.iron;
  user.diamond -= PICKAXE_REPAIR_COST.diamond;
  user.pickaxedurability = 100;
}

module.exports = {
  command: ['mining'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

        if (!m.isGroup) return replytolak(mess.only.group)
        Array.prototype.getRandom = Array.prototype.getRandom || function () { return this[Math.floor(Math.random() * this.length)]; };
        Number.prototype.getRandom = Number.prototype.getRandom || function () { return Math.floor(Math.random() * this); };
        alya.mining = alya.mining || {};

        function getTieredReward(depth) {
            let rewards = {
                exp: Math.floor(Math.random() * 500) + (depth * 250),
                trash: Math.floor(Math.random() * 50),
                string: Math.floor(Math.random() * 10),
                rock: Math.floor(Math.random() * 20),
                iron: depth > 3 ? Math.floor(Math.random() * 15) : 0,
                gold: depth > 7 ? Math.floor(Math.random() * 10) : 0,
                diamond: depth > 12 ? Math.floor(Math.random() * 5) : 0,
                emerald: depth > 18 ? Math.floor(Math.random() * 3) : 0,
                mythic: depth > 20 ? [0, 0, 0, 1, 0, 0].getRandom() : 0,
                legendary: depth > 25 ? [0, 0, 0, 0, 1, 0, 0, 0].getRandom() : 0
            }
            return rewards;
        }
        let userAlt = global.db.users[m.sender];
        let [aksi] = args;
        const cooldown = 600000;

        user.pickaxe = user.pickaxe || 0;
        user.pickaxedurability = user.pickaxedurability !== undefined ? user.pickaxedurability : 0;

        try {
            switch (aksi) {
                case 'start': {
                    if (alya.mining[m.sender]) return replytolak("⚠️ *Kamu masih di dalam tambang!*\nKetik `.mining gali` untuk lanjut atau `.mining keluar` untuk pulang.");

                    // ── CEK DB PICKAXE: benar-benar tidak punya ──
                    if (!user.pickaxe || user.pickaxe == 0) {
                        return replytolak(
                            `⛏️ *Kamu belum punya Pickaxe!*\n\n` +
                            `Craft dulu: *${prefix}crafting pickaxe*`
                        );
                    }

                    // ── CEK DB PICKAXE: kondisi durability ──
                    if (user.pickaxedurability <= 10) {
                        if (hasEnoughForRepair(user)) {
                            // ── AUTO-REPAIR: material cukup, langsung diperbaiki ──
                            doAutoRepair(user);
                            await alya.sendMessage(m.chat, { react: { text: '🔧', key: m.key } });
                            await replyalya(
                                `🔧 *PICKAXE OTOMATIS DIPERBAIKI!*\n\n` +
                                `Pickaxe-mu terdeteksi rusak parah, sistem otomatis memperbaikinya pakai material di gudangmu:\n` +
                                `➖ 20 Rock, 20 Wood, 20 Iron, 1 Diamond\n` +
                                `⚙️ Durability: *100/100*\n\n` +
                                `Lanjut masuk tambang...`
                            );
                            // lanjut proses start di bawah (tidak return)
                        } else {
                            const missing = [];
                            if ((user.rock || 0) < PICKAXE_REPAIR_COST.rock) missing.push(`Rock (${user.rock || 0}/${PICKAXE_REPAIR_COST.rock})`);
                            if ((user.wood || 0) < PICKAXE_REPAIR_COST.wood) missing.push(`Wood (${user.wood || 0}/${PICKAXE_REPAIR_COST.wood})`);
                            if ((user.iron || 0) < PICKAXE_REPAIR_COST.iron) missing.push(`Iron (${user.iron || 0}/${PICKAXE_REPAIR_COST.iron})`);
                            if ((user.diamond || 0) < PICKAXE_REPAIR_COST.diamond) missing.push(`Diamond (${user.diamond || 0}/${PICKAXE_REPAIR_COST.diamond})`);

                            return replytolak(
                                `⛏️ *Pickaxe kamu sudah rusak!* (Durability: ${user.pickaxedurability}/100)\n\n` +
                                `Sistem mencoba auto-repair tapi material kurang:\n` +
                                `➖ ${missing.join('\n➖ ')}\n\n` +
                                `Kumpulkan dulu material di atas (bisa dari mining sebelumnya / dungeon), ` +
                                `atau perbaiki manual: *${prefix}repair pickaxe*`
                            );
                        }
                    }

                    if (user.health < 80) return replytolak(`⚠️ Fisikmu terlalu lemah untuk menambang! (Min. 80 ❤️Health). Gunakan *${prefix}heal* terlebih dahulu.`);
                    if (new Date() - user.lastmining <= cooldown) {
                        let timers = cooldown - (new Date() - user.lastmining);
                        return replytolak(`⏳ Tambang sedang tidak stabil.\nTunggu *${(timers / 60000).toFixed(1)} menit* lagi sebelum masuk kembali.`);
                    }

                    alya.mining[m.sender] = {
                        depth: 0,
                        safeChance: 0.95,
                        accumulatedItems: {},
                        timestamp: new Date() * 1
                    };

                    return replyalya(`*\`⛏️ EKSPLORASI TAMBANG DIMULAI\`*\n\n⚙️ Kondisi Pickaxe: ${user.pickaxedurability}/100 — siap dipakai!\n\nSemakin dalam kamu menggali, semakin mahal material yang kamu temukan. Tapi awas, risiko gas meledak semakin tinggi!\n\n🔹 *Lantai 1-5:* Material Dasar (Batu, Sampah)\n🔹 *Lantai 6-12:* Logam (Besi, Emas)\n🔹 *Lantai 13+:* Permata Langka (Diamond, Emerald)\n\n*Risiko:* Jika meledak, seluruh hasil galian hangus!\n\nKetik: \`${prefix}mining gali\``);
                }
                case 'gali': {
                    let session = alya.mining[m.sender];
                    if (!session) return replyalya(`*Kamu belum masuk ke tambang!*\nKetik \`${prefix}mining start\` untuk mulai.`);

                    // Cek ulang kondisi pickaxe tiap gali (bisa saja rusak di tengah sesi via event lain)
                    if (user.pickaxedurability <= 0) {
                        delete alya.mining[m.sender];
                        return replyalya(`⛏️ *Pickaxe-mu hancur total di tengah galian!* Kamu terpaksa naik ke permukaan dengan tangan kosong.\nPerbaiki dulu: *${prefix}repair pickaxe*`);
                    }

                    if (Math.random() < session.safeChance) {
                        session.depth++;
                        const floorRewards = getTieredReward(session.depth);

                        let floorLootText = "";
                        let multiplier = 1 + (session.depth * 0.5);

                        for (const item in floorRewards) {
                            let total = floorRewards[item];
                            if (total > 0) {
                                let finalTotal = Math.floor(total * multiplier);
                                session.accumulatedItems[item] = (session.accumulatedItems[item] || 0) + finalTotal;

                                let emot = (global.rpg && global.rpg.emoticon) ? global.rpg.emoticon(item) : "📦";
                                floorLootText += `\n- ${emot} ${item}: +${finalTotal}`;
                            }
                        }
                        let riskIncr = session.depth > 10 ? 0.12 : 0.07;
                        session.safeChance = Math.max(0.25, session.safeChance - riskIncr);

                        // Durability berkurang tipis tiap gali sukses juga (dipakai, ya wajar aus)
                        user.pickaxedurability = Math.max(0, user.pickaxedurability - 3);

                        return replyalya(`*\`🚧 LANTAI ${session.depth} AMAN!\`*\n${floorLootText || "\n- Kosong... Tidak ada material di lapisan ini."}\n\n🔥 *Bahaya Gas keluar:* **${Math.round((1 - session.safeChance) * 100)}%**\n⚙️ *Durability Pickaxe:* ${user.pickaxedurability}/100\n\nLanjut gali ke bawah? Ketik \`${prefix}mining gali\`.\nMerasa cukup? Ketik \`${prefix}mining keluar\`.`);
                    } else {
                        user.health -= 60;
                        user.pickaxedurability = Math.max(0, user.pickaxedurability - 40);
                        user.lastmining = new Date() * 1;

                        delete alya.mining[m.sender];
                        return replyalya(`*\`KABOOOOM!!!\`* 💥\n\nGas Metana meledak saat kamu mencoba menggali lantai ${session.depth + 1}!\nKamu terpental keluar dari tambang dengan luka parah.\n\n💔 Kesehatan: -60\n⛏️ Durabilitas Pickaxe: -40 (sisa ${user.pickaxedurability})\n\n*Semua hasil tambangmu tertimbun runtuhan dan hilang!*`);
                    }
                }
                case 'keluar': {
                    let res = alya.mining[m.sender];
                    if (!res) return replyalya(`*Kamu tidak sedang berada di dalam tambang.*\nKetik \`${prefix}mining start\` untuk mulai.`);

                    let finalReport = `📋 *HASIL EKSPLORASI LANTAI ${res.depth}* 📋\n`;
                    let hasItems = false;

                    for (const item in res.accumulatedItems) {
                        let amount = res.accumulatedItems[item];
                        if (amount > 0) {
                            user[item] = (user[item] || 0) + amount;
                            let emot = (global.rpg && global.rpg.emoticon) ? global.rpg.emoticon(item) : "📦";
                            finalReport += `\n*${emot} ${item}:* ${amount}`;
                            hasItems = true;
                        }
                    }

                    if (!hasItems) finalReport += "\n*(Kamu keluar dengan tangan kosong)*";

                    let damageHealth = res.depth * 2;
                    let damagePickaxe = res.depth * 1;

                    user.health -= damageHealth;
                    user.pickaxedurability = Math.max(0, user.pickaxedurability - damagePickaxe);
                    user.lastmining = new Date() * 1;

                    delete alya.mining[m.sender];
                    await replyalya(`${finalReport}\n\n*Status Pemain:*\n💔 Kesehatan: -${damageHealth}\n⛏️ Durabilitas Pickaxe: -${damagePickaxe} (sisa ${user.pickaxedurability})\n\nKamu berhasil kembali ke permukaan dengan selamat!`);
                    return replyalya(`*\`⛏️ MINING\`*\n\n1. \`${prefix}mining start\` - Masuk ke dalam tambang (auto-cek & auto-repair pickaxe kalau material cukup).\n2. \`${prefix}mining gali\` - Turun lantai (Makin dalam, hadiah & risiko naik).\n3. \`${prefix}mining keluar\` - Bawa pulang hasil dengan aman.`);
                }
                default:
                    return replyalya(`*\`⛏️ MINING\`*\n\n1. \`${prefix}mining start\` - Masuk ke dalam tambang.\n2. \`${prefix}mining gali\` - Turun lantai (Makin dalam, hadiah & risiko naik).\n3. \`${prefix}mining keluar\` - Bawa pulang hasil dengan aman.\n\n⚙️ Kondisi Pickaxe saat ini: ${user.pickaxedurability}/100`);
            }
        } catch (e) {
            console.error(e);
            replyalya(`Terjadi kesalahan pada sistem tambang: ${e.message}`);
        }
  }
}
