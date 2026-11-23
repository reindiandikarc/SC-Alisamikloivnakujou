// Plugin: petualang
// Auto-generated from Alya V12
// Commands: petualang

const path = require('path')

module.exports = {
  command: ["petualang"],
  tags: ['general'],
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

        if (!m.isGroup) return reply('❌ Hanya bisa digunakan di grup!')

        function pickRandom(list) {
            return list[Math.floor(Math.random() * list.length)];
        }
        function clockString(ms) {
            let h = Math.floor(ms / 3600000);
            let m = Math.floor(ms / 60000) % 60;
            let s = Math.floor(ms / 1000) % 60;
            return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
        }

        if (!global.db.users[m.sender]) global.db.users[m.sender] = {}
        if (global.db.users[m.sender].lastadventure === undefined) global.db.users[m.sender].lastadventure = 0;
        if (global.db.users[m.sender].health === undefined) global.db.users[m.sender].health = 100;

        try {
            let user = global.db.users[m.sender];
            let __timers = new Date() - user.lastadventure;
            let _timers = 3600000 - __timers;
            let timers = clockString(_timers);
            let lokasiPetualang = [
                'Hutan Terlarang Mysticar',
                'Puncak Gunung Berapi Nether',
                'Reruntuhan Kota Kuno Atlantis',
                'Gua Kristal Abyss',
                'Kastil Iblis yang Terlupakan',
                'Gurun Pasir Waktu'
            ];

            let kejadianSeru = [
                'kamu dikepung oleh pasukan goblin!',
                'kamu harus melewati jembatan tali yang hampir putus di atas jurang!',
                'kamu memecahkan teka-teki kuno yang rumit!',
                'kamu menemukan air terjun ajaib yang menyembuhkan sedikit lukamu!',
                'kamu hampir terjebak dalam perangkap pasir hisap!',
                'kamu mengikuti peta harta karun yang sudah usang!'
            ];

            if (user.health > 79) {
                if (new Date() - user.lastadventure > 3600000) {
                    let health = Math.floor(Math.random() * 81);
                    let exp = Math.floor(Math.random() * 10000);
                    let uang = Math.floor(Math.random() * 100000);
                    let trash = Math.floor(Math.random() * 10000);
                    let emerald = Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0;
                    let potion = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
                    let diamond = Math.random() > 0.85 ? Math.floor(Math.random() * 3) + 1 : 0;

                    let common = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0;
                    let uncommon = Math.random() > 0.75 ? Math.floor(Math.random() * 2) + 1 : 0;
                    let mythic = Math.random() > 0.92 ? 1 : 0; // 8% Chance (Jarang)
                    let legendary = Math.random() > 0.97 ? 1 : 0; // 3% Chance (Sangat Jarang)

                    let rendem = "";
                    if (mythic > 0 && legendary > 0) rendem = "Peti Mistis & Legendary!";
                    else if (mythic > 0) rendem = "1 Peti Mistis Langka";
                    else if (legendary > 0) rendem = "1 Peti Legendary Langka";
                    else rendem = "Tidak ada (Zonk)";

                    let monster = pickRandom(['Raksasa', 'Beruang', 'Harimau', 'Raja Iblis Ryuu', 'Macan', 'Iblis', 'Naga Kuning', 'Prajurit Kegelapan']);
                    let tempat = pickRandom(lokasiPetualang);
                    let kejadian = pickRandom(kejadianSeru);

                    let str = `
    *⚔️ PETUALANGAN SELESAI ⚔️*

    ${pushname} baru saja kembali dari penjelajahan di *${tempat}*.

    Selama perjalanan, ${kejadian}

    Di tengah jalan, pertarungan sengit terjadi! Kamu berhadapan dengan *${monster}*. Dengan keberanian luar biasa, kamu berhasil menang, namun nyawamu berkurang sebesar *-${health} HP*.

    Setelah perjuangan panjang, inilah hasil buruanmu:
    - *🛡️ EXP:* ${exp}
    - *💰 Uang:* Rp ${uang}
    - *💎 Berlian:* ${diamond}
    - *💚 Emerald:* ${emerald}
    - *🗑️ Sampah:* ${trash}
    - *🧪 Potion:* ${potion}
    - *📦 Common crate:* ${common}
    - *🎁 Uncommon crate:* ${uncommon}
    - *🌟 Bonus:* ${rendem}

    Gunakan *${prefix}heal* untuk pulih. Siap untuk petualangan berikutnya?
                    `.trim();

                    await reply(str);

                    user.health -= health;
                    user.exp += exp;
                    user.money += uang;
                    user.potion += potion;
                    user.diamond += diamond;
                    user.emerald += emerald;
                    user.common += common;
                    user.uncommon += uncommon;
                    user.trash += trash;
                    user.mythic += mythic;
                    user.legendary += legendary;
                    user.lastadventure = new Date() * 1;
                } else {
                    reply(`❌ Kamu masih kelelahan, ${pushname}. Tunggu *${timers}* lagi untuk berpetualang lagi.`);
                }
            } else {
                reply(`🩸 Nyawa kamu terlalu rendah (@${pushname} - minimal 80 HP) untuk berpetualang.\n\nPulihkan dirimu dengan *${prefix}heal* atau beli potion dengan *${prefix}buy potion (jumlah)*.`);
            }
        } catch (e) {
            console.log(e);
            reply('Terjadi kesalahan saat memulai petualangan.');
        }
  }
}
