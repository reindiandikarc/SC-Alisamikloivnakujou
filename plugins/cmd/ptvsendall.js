// Plugin: ptvsendall
// Auto-generated from Alya V12
// Commands: ptvsendall

const path = require('path')

module.exports = {
  command: ["ptvsendall"],
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

        if (!Ryuu) return replytolak(mess.only.owner);
        const fs = require("fs");
        const pathFile = decodeURIComponent(args[0]);
        if (!pathFile || !fs.existsSync(pathFile)) return m.reply("❌ File tidak ditemukan.");

        let getGroups = await alya.groupFetchAllParticipating();
        let grupList = Object.keys(getGroups);
        let videoBuffer = fs.readFileSync(pathFile);

        await alya.sendText(m.chat, `🎥 Memulai Broadcast PTV ke ${grupList.length} grup...`);

        let success = 0;
        for (let gid of grupList) {
            try {
                await alya.sendMessage(gid, { video: videoBuffer, ptv: true });
                success++;
                await new Promise(res => setTimeout(res, 2000)); // Delay 2 detik biar aman
            } catch (e) {
                console.log(`Gagal kirim ke ${gid}`);
            }
        }

        if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
        await alya.sendText(m.chat, `✅ Broadcast Selesai!\nTotal Berhasil: ${success}/${grupList.length}`);
    }
//     	case 'frch':
//     	case 'fakereactch':
//     	case 'rch':
  }
