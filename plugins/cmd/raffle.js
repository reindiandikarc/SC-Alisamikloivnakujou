// Plugin: raffle
// Auto-generated from Alya V12
// Commands: raffle

const path = require('path')

module.exports = {
  command: ["raffle"],
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

        alya.raffle = alya.raffle || {};
        let [aksi, jumlah] = args;
        let userAlt = global.db.users[m.sender];
        const fmt = (v) => "Rp" + v.toLocaleString("id-ID");

        if (!alya.raffle[m.chat]) {
            alya.raffle[m.chat] = {
                status: 'closed',
                players: [],
                totalPool: 0,
                ticketPrice: 5000,
                timer: null
            };
        }

        let game = alya.raffle[m.chat];

        switch (aksi) {
            case 'open': {
                if (!m.isGroup) return replyalya("Fitur ini khusus grup!");
                if (!isAdmins && !Ryuu) return replyalya('❌ Khusus admin dan owner!');
                if (game.status === 'open') return replyalya("Lotre sedang berlangsung!");

                let price = parseInt(jumlah) || 5000;
                let durasi = 5 * 60 * 1000;

                game.status = 'open';
                game.ticketPrice = price;
                game.totalPool = 0;
                game.players = [];

                game.timer = setTimeout(async () => {
                    let currentGame = alya.raffle[m.chat];
                    if (currentGame && currentGame.status === 'open') {
                        if (currentGame.players.length > 0) {
                            let winner = currentGame.players[Math.floor(Math.random() * currentGame.players.length)];
                            global.db.users[winner.id].money += currentGame.totalPool;

                            let txt = `*── 「 🎊 RAFFLE WINNER 🎊 」 ──*\n\n`;
                            txt += `🏆 *Selamat kepada:* @${winner.id.split('@')[0]}\n`;
                            txt += `💰 *Mendapatkan:* ${fmt(currentGame.totalPool)}\n`;
                            txt += `🎫 *Total Tiket diundi:* ${currentGame.players.length}\n\n`;
                            txt += `Hadiah sudah otomatis dikirim ke Bank. Selamat menikmati hasil rampokan massal!`;

                            await alya.sendMessage(m.chat, { text: txt, mentions: [winner.id] });
                        } else {
                            await alya.sendMessage(m.chat, { text: "⚠️ *RAFFLE CLOSED:* Tidak ada peserta yang ikut, lotre dibatalkan." });
                        }
                        currentGame.status = 'closed';
                        currentGame.players = [];
                        currentGame.timer = null;
                    }
                }, durasi);

                return replyalya(`*── 「 🎟️ RAFFLE OPENED 」 ──*\n\n` +
                    `Lotre telah dibuka oleh Admin!\nPengumuman otomatis dalam *5 Menit*.\n\n` +
                    `🎫 *Harga Tiket:* ${fmt(price)}\n` +
                    `⏳ *Status:* AKTIF\n\n` +
                    `Ketik: \`${prefix + command} buy <jumlah>\` untuk ikut serta!`);
            }

            case 'buy': {
                if (game.status !== 'open') return replyalya("Lotre sedang tidak aktif.");

                let count = parseInt(jumlah) || 1;
                if (count < 1) return replyalya("Minimal beli 1 tiket!");
                let totalCost = count * game.ticketPrice;

                if (user.money < totalCost) return replyalya(`Uangmu kurang! Butuh ${fmt(totalCost)}.`);

                user.money -= totalCost;
                game.totalPool += totalCost;

                for (let i = 0; i < count; i++) {
                    game.players.push({ id: m.sender, name: m.pushName });
                }

                return replyalya(`✅ *BERHASIL!* Membeli ${count} tiket.\n` +
                    `💰 *Total Pool Saat Ini:* ${fmt(game.totalPool)}\n` +
                    `📈 *Peluangmu:* ${((game.players.filter(p => p.id === m.sender).length / game.players.length) * 100).toFixed(1)}%`);
            }

            case 'cancel': {
                if (!isAdmins && !Ryuu) return replyalya('❌ Khusus admin dan owner!');
                if (game.status !== 'open') return replyalya("Tidak ada lotre yang bisa dibatalkan.");

                clearTimeout(game.timer);
                game.status = 'closed';
                game.players = [];
                game.timer = null;
                return replyalya("🚫 *RAFFLE CANCELLED:* Lotre telah dibatalkan oleh admin/owner.");
            }

            case 'status': {
                if (game.status !== 'open') return replyalya("Lotre sedang tidak aktif.");
                return replyalya(`*── 「 🎟️ RAFFLE STATUS 」 ──*\n\n` +
                    `💰 *Total Hadiah:* ${fmt(game.totalPool)}\n` +
                    `👥 *Total Tiket Terjual:* ${game.players.length}\n` +
                    `🎫 *Harga per Tiket:* ${fmt(game.ticketPrice)}\n\n` +
                    `_Tunggu 5 menit sejak dibuka untuk pengumuman otomatis._`);
            }
                replyalya(`*── 「 🎟️ RAFFLE MENU 」 ──*\n\n` +
                    `- \`${prefix + command} open <harga>\` (Admin/Owner Only)\n` +
                    `- \`${prefix + command} buy <jumlah>\` (Beli tiket)\n` +
                    `- \`${prefix + command} status\` (Cek total hadiah)\n` +
                    `- \`${prefix + command} cancel\` (Admin/Owner Only)`);
        }
  }
}
