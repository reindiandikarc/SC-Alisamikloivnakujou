// Plugin: wwpc
// Auto-generated from Alya V12
// Commands: ww, wwpc

const path = require('path')

module.exports = {
  command: ["ww", "wwpc"],
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

    const db = global.db
    let {
        emoji_role,
        sesi,
        playerOnGame,
        playerOnRoom,
        playerExit,
        dataPlayer,
        dataPlayerById,
        getPlayerById,
        getPlayerById2,
        killWerewolf,
        killww,
        dreamySeer,
        sorcerer,
        protectGuardian,
        roleShuffle,
        roleChanger,
        roleAmount,
        roleGenerator,
        addTimer,
        startGame,
        playerHidup,
        playerMati,
        vote,
        voteResult,
        clearAllVote,
        getWinner,
        win,
        pagi,
        malam,
        skill,
        voteStart,
        voteDone,
        voting,
        run,
        run_vote,
        run_malam,
        run_pagi
    } = require('../../lib/werewolf.js')

        const {
            senderLocal,
            chat
        } = m;
        alya.werewolf = alya.werewolf ? alya.werewolf : {};
        const ww = alya.werewolf ? alya.werewolf : {};
        const value = args[0];
        const target = args[1];

        if (playerOnGame(senderLocal, ww) === false)
            return replyalya("Kamu tidak dalam sesi game");
        if (dataPlayer(senderLocal, ww).status === true)
            return reply(
                "Skill telah digunakan, skill hanya bisa digunakan sekali setiap malam"
            );
        if (dataPlayer(senderLocal, ww).isdead === true)
            return replyalya("Kamu sudah mati");
        if (!target || target.length < 1) return replyalya("Masukan nomor player");
        if (isNaN(target)) return replyalya("Gunakan hanya nomor");
        let byId = getPlayerById2(senderLocal, parseInt(target), ww);
        if (byId.db.isdead === true) return replyalya("Player sudah mati");
        if (byId.db.id === senderLocal)
            return replyalya("Tidak bisa menggunakan skill untuk diri sendiri");
        if (byId === false) return replyalya("Player tidak terdaftar");
        if (value === "kill") {
            if (dataPlayer(senderLocal, ww).role !== "werewolf")
                return replyalya("Peran ini bukan untuk kamu");
            if (byId.db.role === "sorcerer")
                return replyalya("Tidak bisa menggunakan skill untuk teman");
            return m
                .replyalya("Berhasil membunuh player " + parseInt(target))
                .then(() => {
                    dataPlayer(senderLocal, ww).status = true;
                    killWerewolf(senderLocal, parseInt(target), ww);
                });
        } else if (value === "dreamy") {
            if (dataPlayer(senderLocal, ww).role !== "seer")
                return replyalya("Peran ini bukan untuk kamu");
            let dreamy = dreamySeer(m.senderLocal, parseInt(target), ww);
            return m
                .reply(`Berhasil membuka identitas player ${target} adalah ${dreamy}`)
                .then(() => {
                    dataPlayer(senderLocal, ww).status = true;
                });
        } else if (value === "deff") {
            if (dataPlayer(senderLocal, ww).role !== "guardian")
                return replyalya("Peran ini bukan untuk kamu");
            return reply(`Berhasil melindungi player ${target}`)
            .then(() => {
                protectGuardian(m.senderLocal, parseInt(target), ww);
                dataPlayer(senderLocal, ww).status = true;
            });
        } else if (value === "sorcerer") {
            if (dataPlayer(senderLocal, ww).role !== "sorcerer")
                return replyalya("Peran ini bukan untuk kamu");
            let sorker = sorcerer(sesi(m.senderLocal), target);
            return m
                .reply(`Berhasil membuka identitas player ${player} adalah ${sorker}`)
                .then(() => {
                    dataPlayer(senderLocal, ww).status = true;
                });
        }
    }
    //==================================================================
  }
