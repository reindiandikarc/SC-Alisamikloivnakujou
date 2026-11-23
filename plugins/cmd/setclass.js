// Plugin: setclass
// Auto-generated from Alya V12
// Commands: setclass

const path = require('path')

module.exports = {
  command: ["setclass"],
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

    const CLASSES = {
        "warrior": { name: "Warrior", hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15, color: "⚔️", skillName: "Heavy Smash", ultiName: "Berserker Rage" },
        "mage":    { name: "Mage",    hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10, color: "🔮", skillName: "Fireball",     ultiName: "Meteor Strike" },
        "assassin":{ name: "Assassin",hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38, color: "🗡️", skillName: "Backstep Slash", ultiName: "Shadow Assassination" },
        "tank":    { name: "Tank",    hp: 850, mana: 80,  dmg: 18, skillDmg: 30, crit: 0.05, color: "🛡️", skillName: "Shield Bash",  ultiName: "Earthquake" }
    }
    // Formula bonus dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
    let _PL = {}
    try { _PL = require('../../lib/playerlevel') } catch {}
    let _Origin = {}
    try { _Origin = require('../../lib/isekaiOrigin') } catch {}
    const getBonus = (u) => { let l = parseInt(u.duelLvl)||0; return _PL.getClassBonus ? _PL.getClassBonus(l) : { hp: l*2, dmg: Math.round(l*0.4) } }

    const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys")
        let listClass = Object.keys(CLASSES);

        if (args[0] && listClass.includes(args[0].toLowerCase())) {
            const chosen = args[0].toLowerCase()
            global.db.users[m.sender].class = chosen;
            const unlocked = new Set(global.db.users[m.sender].unlockedClasses || [])
            unlocked.add(chosen)
            global.db.users[m.sender].unlockedClasses = [...unlocked]
            await replyalya(`✅ Berhasil! Kamu sekarang adalah seorang *${CLASSES[chosen].name}*.`);
            if (_Origin.checkTitleUnlockNotif) {
              const notif = _Origin.checkTitleUnlockNotif(global.db.users[m.sender].unlockedClasses, global.db.users[m.sender].duelLvl || 0)
              if (notif) {
                if (unlocked.size >= 4 && (global.db.users[m.sender].duelLvl || 0) >= _Origin.PAHLAWAN_UNLOCK_LEVEL) {
                  global.db.users[m.sender].duelLvl = _Origin.PAHLAWAN_UNLOCK_LEVEL
                }
                await replyalya(notif)
              }
            }
            return;
        }
        let rows = [];
        for (let key of listClass) {
            rows.push({
                title: CLASSES[key].name,
                description: `Pilih untuk menjadi ${CLASSES[key].name}`,
                id: `${prefix + command} ${key}`
            });
        }

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: '✨ *Pilih Class Kamu* ✨\nSilakan pilih salah satu kelas di bawah ini untuk memulai Pertarunganmu!'
                        },
                        footer: {
                            text: 'Alya-chan Assistant'
                        },
                        header: {
                            title: 'Pemilihan Class',
                            hasSubtitle: false
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Lihat Daftar Kelas",
                                    sections: [{
                                        title: "Tersedia",
                                        rows
                                    }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m });

        await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }
}
