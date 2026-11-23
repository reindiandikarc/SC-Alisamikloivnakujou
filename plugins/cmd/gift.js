// Plugin: gift
// Auto-generated from Alya V12
// Commands: transfer, gift
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["transfer", "gift"],
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

        const toNum = (v) => (v || 0).toLocaleString('id-ID');
        const toRupiah = (v) => 'Rp' + (v || 0).toLocaleString('id-ID');
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);

        if (!target && args[1]) {
            let nomor = args[1].replace(/[^0-9]/g, '');
            if (nomor.length >= 10) target = nomor + '@s.whatsapp.net';
        }

        if (!args[0]) {
            return replyalya(`╭───  「 💸 *TRANSFER MENU* 」\n` +
                `│\n` +
                `│ 💡 *Cara Penggunaan:*\n` +
                `│ ◦ Reply: \`.tf money 50000\`\n` +
                `│ ◦ Tag: \`.tf money @user 50000\`\n` +
                `│ ◦ Nomor: \`.tf money 628xxx 50000\`\n` +
                `│\n` +
                `╰───────────────────────────`);
        }

        let typeAlt = args[0].toLowerCase();
        let amount = parseInt(args.find(v => !isNaN(v) && !v.includes('@'))) || 0;

        if (!target) return replyalya('❌ *Akses Ditolak:* Mohon tag user, balas chatnya, atau masukkan nomor tujuan.');
        if (target === m.sender) return replyalya('❌ *Kesalahan:* Kamu tidak bisa mengirim ke diri sendiri!');
        if (amount <= 0) return replyalya('❌ *Jumlah Tidak Valid:* Nominal harus lebih dari 0.');
        if (!(target in global.db.users)) return replyalya('❌ *User Ghaib:* Target tidak terdaftar di database.');

        let adminFee = type === 'money' ? 10000 : 0;
        let senderData = global.db.users[m.sender];
        let targetData = global.db.users[target];
        let totalDeduct = amount + adminFee;

        if (!senderData[type] || senderData[type] < totalDeduct) {
            return replyalya(`❌ *Saldo Tidak Cukup!*\n\n` +
                `• *Dibutuhkan:* ${type === 'money' ? toRupiah(totalDeduct) : toNum(totalDeduct)} ${type}\n` +
                `• *Biaya Admin:* ${toRupiah(adminFee)}`);
        }

        senderData[type] -= totalDeduct;
        targetData[type] = (targetData[type] || 0) + amount;

        const caption = `
    ─── 「 💸 *TRANSFER SUCCESS* 」 ───

      ◦  *Penerima* : @${target.split('@')[0]}
      ◦  *Item* : ${typeAlt.toUpperCase()}
      ◦  *Nominal* : ${type === 'money' ? toRupiah(amount) : toNum(amount)}
      ◦  *Biaya* : ${toRupiah(adminFee)}

    ───────────────────────────
    *SISA SALDO:*
    👉 ${type === 'money' ? toRupiah(senderData[type]) : toNum(senderData[type])} ${type}
    ───────────────────────────`.trim();

        await alya.sendMessage(m.chat, {
            image: { url: 'https://raw.githubusercontent.com/reindiandikarc/Yuugames/refs/heads/main/alya1.jpg' },
            caption: caption,
            footer: `Alya Transfer System • Ref ID: ${Math.random().toString(36).toUpperCase().slice(2, 9)}`,
            contextInfo: {
                mentionedJid: [target, m.sender]
            }
        }, { quoted: m });
//     		case 'automaticreg': {
        const userId = m.sender;
        let user_local = registeredUsers.find(user => user.id === userId);

        if (user_local) {
            return replyalya(
    `✅ Hmph... *${user_local.nama}* ya? Kamu tuh udah terdaftar dari tadi!

    Ngapain sih daftar lagi? 😒
    Bukan berarti aku seneng kamu balik... b-baka!`
    );
    }

        const nama = pushname || `User${registeredUsers.length + 1}`;
        const kodeReg = generateKodeReg(8);
        const daftar_pada = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        const dataUser = {
            id: userId,
            nama,
            kodeReg,
            daftar_pada,
            status: 'Free',
            verified: true,
            ppuser: await alya.profilePictureUrl(userId, 'image').catch(()=>null)
        };

        registeredUsers.push(dataUser);
        fs.writeFileSync(registeredFile, JSON.stringify(registeredUsers, null, 2));

        let dbUser = global.db.users[userId];

        if (!dbUser) {
            global.db.users[userId] = {
                limit: 30,
                money: 50000
            };
        } else {
            dbUser.limit = (dbUser.limit || 0) + 30;
            dbUser.money = (dbUser.money || 0) + 50000;
        }

        const cardBuffer = await generateAnimeCard(dataUser);

        const tinyThumbnail = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgPo8MksAAAAASUVORK5CYII=',
            'base64'
        );

        await alya.sendMessage(m.chat, {
            image: cardBuffer,
            caption: `🎉 *Registrasi Berhasil!*

    👤 Nama: ${nama}
    🆔 Kode: ${kodeReg}
    📅 Tanggal: ${daftar_pada}
    💎 Status: Free User
    ✔️ Verified: True

    🎁 *Bonus User Baru*
    💳 Limit: +30
    💰 Money: +50000`,
            footer: 'Alyachan Official',
            buttons: [
                { buttonId: `${prefix}menu`, buttonText: { displayText: 'Menu' }, type: 1 }
            ],
            headerType: 4,
            jpegThumbnail: tinyThumbnail
        });

        const notifMsg = `📢 User Baru Terdaftar
    👤 Nama: ${nama}
    🆔 Kode: ${kodeReg}
    📅 Tanggal: ${daftar_pada}
    💎 Status: Free User
    ✔️ Verified: True

    🎁 Bonus:
    Limit +30
    Money +50000`;

        await alya.sendMessage("120363422956241554@newsletter", { text: notifMsg });
// [REMOVED]     		case 'deldaftar': {
    			if (!Ryuu) return replytolak(mess.only.owner);

    			const regFile = './database/registered.json';
    			if (!fs.existsSync(regFile)) return replyalya('📂 Database belum ditemukan!');

    			let registeredUsers = JSON.parse(fs.readFileSync(regFile));
    			if (registeredUsers.length === 0) return replyalya('📭 Belum ada data pendaftar.');

    			const rows = registeredUsers.map(user => ({
    				header: "",
    				title: `${user.nama} (${user.umur} th)`,
    				description: `📅 ${user.daftar_pada}\n✅ Verified: ${user.verified ? 'Ya' : 'Tidak'}`,
    				id: `.confirmdel ${user.id}`
    			}));
    			rows.push({
    				header: "",
    				title: "🧹 Hapus Semua Data Pendaftar",
    				description: "⚠️ Semua data user akan terhapus permanen!",
    				id: `.confirmdelall`
    			});
    			const msg = generateWAMessageFromContent(m.chat, {
    				viewOnceMessage: {
    					message: {
    						messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
    						interactiveMessage: {
    							body: { text: `📋 Pilih user yang ingin dihapus dari daftar pendaftar:` },
    							footer: { text: 'Alya-chan Assistant' },
    							header: { title: '🗑️ Daftar Pendaftar' },
    							nativeFlowMessage: {
    								buttons: [{
    									name: "single_select",
    									buttonParamsJson: JSON.stringify({
    										title: "Pilih User",
    										sections: [{ title: "Daftar Pendaftar", rows }]
    									})
    								}]
    							}
    						}
    					}
    				}
    			}, { quoted: m }, {});

    			await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
// [REMOVED]     		case 'confirmdel': {
    			if (!Ryuu) return replytolak(mess.only.owner);

    			let userId_local = args[0];
    			if (!userId_local) return replyalya('⚠️ Tidak ada ID user yang dipilih.');

    			let regFile_local = './database/registered.json';
    			if (!fs.existsSync(regFile_local)) return replyalya('📂 Database belum ditemukan!');

    			let registeredUsers_local = JSON.parse(fs.readFileSync(regFile_local));

    			const index = registeredUsers_local.findIndex(u => u.id === userId_local);
    			if (index === -1) return replyalya('❌ User tidak ditemukan.');

    			const deletedUser = registeredUsers_local[index];
    			registeredUsers_local.splice(index, 1);
    			fs.writeFileSync(regFile_local, JSON.stringify(registeredUsers_local, null, 2));

    			replyalya(`✅ Data user *${deletedUser.nama}* (${deletedUser.id}) berhasil dihapus dari database.`);
// [REMOVED]     		case 'confirmdelall': {
    			if (!Ryuu) return replytolak(mess.only.owner);

    			let regFile_local_local = './database/registered.json';
    			if (!fs.existsSync(regFile_local_local)) return replyalya('📂 Database belum ditemukan!');

    			fs.writeFileSync(regFile_local_local, JSON.stringify([], null, 2));
    			replyalya('⚠️ Semua data pendaftar telah dihapus dari database!');
  }
}
