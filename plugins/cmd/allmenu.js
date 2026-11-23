// Plugin: allmenu
// Commands: allmenu, menu
// Alya V20 — menu lengkap, kategori rapi & logis

'use strict';

const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const moment = require('moment-timezone');
const { buildOurinSenderCtx } = require('../metacard');
const vxMenu = require('../../lib/vx/menu-data');

module.exports = {
  command: ['allmenu'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { prefix, pushname, replyalya, reply, alyaFitur, runtime, listbut3 } = ctx;

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    // ── Info sistem ─────────────────────────────────────────────────────────
    const deviceType =
      m.key.id.length === 16 ? 'Android' :
      m.key.id.length === 20 ? 'iPhone' :
      m.key.id.length === 22 ? 'WhatsApp Web' :
      m.key.id.length === 32 ? 'Android (Multi-Device)' : 'Unknown';

    const wib      = moment.tz('Asia/Jakarta').format('HH:mm:ss');
    const tgl      = moment.tz('Asia/Jakarta').format('DD/MM/YYYY');
    const ram      = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    const uptimeStr = typeof runtime === 'function'
      ? runtime(process.uptime())
      : (() => {
          const s  = Math.floor(process.uptime());
          const d  = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
                mi = Math.floor((s % 3600) / 60), sec = s % 60;
          return `${d}d ${h}h ${mi}m ${sec}s`;
        })();

    // ── Hitung total fitur dari registry (akurat) ──────────────────────────
    let totalFitur = '1.588';
    let totalFiturNum = 0;
    try {
      const regPath = path.join(__dirname, '../cmd_registry.json');
      const regData = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      totalFiturNum = Object.keys(regData).length;
      totalFitur    = totalFiturNum.toLocaleString('id-ID');
    } catch {
      // fallback: scan plugin files
      try {
        const cmdDir  = path.join(__dirname);
        const files   = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'));
        const allCmds = new Set();
        for (const fname of files) {
          try {
            const src  = fs.readFileSync(path.join(cmdDir, fname), 'utf8');
            const cmdM = src.match(/command:\s*\[([^\]]*)\]/);
            if (cmdM) {
              const cmds = cmdM[1].match(/['"]([a-zA-Z0-9_.-]+)['"]/g)?.map(c => c.replace(/['"]/g, '')) || [];
              cmds.forEach(c => allCmds.add(c));
            }
          } catch { /* skip */ }
        }
        totalFiturNum = allCmds.size;
        totalFitur    = totalFiturNum.toLocaleString('id-ID');
      } catch {
        totalFitur = typeof alyaFitur === 'function' ? String(alyaFitur()) : '1.500+';
      }
    }
    const _ownername  = global.ownername || 'Owner';
    const _botname    = global.botname   || 'Alya Bot';

    // ── Header WhatsApp ✔ (rekonstruksi dari metacard.js) ──────────────────
    const ourinCtx = buildOurinSenderCtx(_botname);

    // ── Section plugin baru vanXone (gaya Alya, tetap di dalam `teks`) ─────
    let newPluginSection = '';
    try {
      const vxTotal = vxMenu.total();
      if (vxTotal > 0) {
        const highlights = vxMenu.flatten(30);
        if (highlights.length) {
          newPluginSection = `\n┣━━〔 🆕 *PLUGIN BARU VANXONE* 〕━━⬣\n┃\n`;
          for (const v of highlights) {
            newPluginSection += `┃ ➤ *${prefix}${v.cmd}* — ${v.desc}\n`;
          }
          newPluginSection += `┃\n┃ → Lihat semua: *${prefix}vxmenu*\n`;
          newPluginSection += `┃ 📊 Total: ${vxTotal.toLocaleString('id-ID')} command baru\n┃\n`;
        }
      }
    } catch { /* helper gagal → section dilewati, menu lama tetap utuh */ }

    // ════════════════════════════════════════════════════════════════════════
    // MENU
    // ════════════════════════════════════════════════════════════════════════
    const teks = `
┏━『 *${_botname.toUpperCase()}* 』━━━━⬣
┃
┃ 👤 *Pengguna :* ${pushname}
┃ 📱 *Device   :* ${deviceType}
┃ 🕒 *Waktu    :* ${wib} WIB | ${tgl}
┃ ⏳ *Uptime   :* ${uptimeStr}
┃ 🧠 *RAM      :* ${ram}MB / ${totalRam}GB
┃ 🌐 *Mode     :* ${alya.public ? 'Public 🌍' : 'Self 🔐'}
┃ ⚡ *Total    :* ${totalFitur} Fitur
┃
┗━━━━━━━━━━━━━━━━━━━━━━━⬣

┌──『 ⚠️ *PERHATIAN* 』──⟢
┆ 🚫 Dilarang spam ke bot
┆ 🔐 Bot diawasi owner 24 jam
┆ 💡 Ketik *${prefix}help <cmd>* untuk detail
└───────────────────────⟢

╔══════════════════════════════╗
║  📋 *NAVIGASI MENU CEPAT*   ║
╚══════════════════════════════╝
┆ ${prefix}aimenu       → 🤖 Menu AI
┆ ${prefix}animemenu    → ⛩️ Menu Anime
┆ ${prefix}downloadmenu → 📥 Menu Download
┆ ${prefix}gamemenu     → 🎮 Menu Game
┆ ${prefix}rpgmenu      → ⚔️ Menu RPG
┆ ${prefix}funmenu      → 🎡 Menu Fun
┆ ${prefix}groupmenu    → 👥 Menu Group
┆ ${prefix}stickermenu  → 🎴 Menu Sticker
┆ ${prefix}nsfwmenu     → 🔞 Menu NSFW
┆ ${prefix}ownermenu    → 👑 Menu Owner
┆ ${prefix}storemenu    → 🏪 Menu Store
┆ ${prefix}beritamenu   → 📰 Menu Berita
┆ ${prefix}totalfitur   → 📊 Total Fitur Bot

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┣━━〔 🤖 *AI & TOOLS PINTAR* 〕━━⬣
┃
┃ 💬 ${prefix}ai | ${prefix}gemini | ${prefix}bard
┃ 💬 ${prefix}gpt4 | ${prefix}blackboxai | ${prefix}claude-ai
┃ 🖼️ ${prefix}aiimg | ${prefix}aimath | ${prefix}text2img
┃ 🖼️ ${prefix}dalle | ${prefix}bingimg | ${prefix}prodia
┃ 🖼️ ${prefix}realistic | ${prefix}3dmodel | ${prefix}anything
┃ 🧠 ${prefix}ocr | ${prefix}removebg | ${prefix}editimg
┃ 🧠 ${prefix}jadianime | ${prefix}tobotak | ${prefix}tohijab
┃ 🧠 ${prefix}tofigure | ${prefix}tohitam | ${prefix}tochibi
┃ 🧠 ${prefix}remini | ${prefix}faceswap | ${prefix}nulis
┃ 🎤 ${prefix}setvoice | ${prefix}alisa on/off
┃ → Lihat semua: *${prefix}aimenu*
┃
┣━━〔 📥 *DOWNLOADER* 〕━━⬣
┃
┃ 🎵 ${prefix}ytmp3 | ${prefix}ytmp4 | ${prefix}play
┃ 🎵 ${prefix}spotify | ${prefix}spdl
┃ 📱 ${prefix}tiktok | ${prefix}tiktokaudio | ${prefix}tiktokslide
┃ 📸 ${prefix}instagram | ${prefix}facebook | ${prefix}pinterest
┃ 🎥 ${prefix}snackvideo | ${prefix}capcutdl | ${prefix}threads
┃ 🎥 ${prefix}twittervid | ${prefix}telestick | ${prefix}an1
┃ 📦 ${prefix}teraboxdl | ${prefix}gdrive | ${prefix}gitclone
┃ 🔍 ${prefix}ytsearch | ${prefix}ttsearch | ${prefix}google
┃ → Lihat semua: *${prefix}downloadmenu*
┃
┣━━〔 👥 *GRUP & ADMIN* 〕━━⬣
┃
┃ ➕ ${prefix}add | ${prefix}kick | ${prefix}promote | ${prefix}demote
┃ 🔕 ${prefix}mute | ${prefix}unmute | ${prefix}mutelist
┃ 📢 ${prefix}tagall | ${prefix}hidetag | ${prefix}totag | ${prefix}tagadmin
┃ 🔗 ${prefix}antilink | ${prefix}antilinkgc | ${prefix}antilinkall
┃ 🛡️ ${prefix}antibot | ${prefix}antitoxic | ${prefix}antispam
┃ 🛡️ ${prefix}antidelete | ${prefix}antinsfw | ${prefix}antivirus
┃ 🔔 ${prefix}setwelcome | ${prefix}setleft | ${prefix}welcome
┃ ⏰ ${prefix}opentime | ${prefix}closetime | ${prefix}ephemeral
┃ ⚙️ ${prefix}setname | ${prefix}setdesc | ${prefix}setppgroup
┃ 📊 ${prefix}vote | ${prefix}poll | ${prefix}listonline | ${prefix}react
┃ → Lihat semua: *${prefix}groupmenu*
┃
┣━━〔 🎮 *GAME & TEBAKAN* 〕━━⬣
┃
┃ 🏆 ${prefix}tebakanml | ${prefix}tebakgame | ${prefix}tebaklogo
┃ 🏆 ${prefix}tebaklirik | ${prefix}tebaklagu | ${prefix}tebakgambar
┃ 🏆 ${prefix}tebakbendera | ${prefix}tebakkabupaten | ${prefix}tebaksurah
┃ 🏆 ${prefix}tebakhiragana | ${prefix}tebakkanji | ${prefix}tebakkatakana
┃ 🆕 ${prefix}tebakhewan | ${prefix}tebakfilm | ${prefix}tebakdrakor
┃ 🆕 ${prefix}tebakepep | ${prefix}tebakjkt48 | ${prefix}tebakmakanan
┃ 🆕 ${prefix}tebaknegara | ${prefix}tebakprofesi
┃ 🃏 ${prefix}blackjack | ${prefix}slot | ${prefix}catur | ${prefix}werewolf
┃ 🎯 ${prefix}truthordare | ${prefix}caklontong | ${prefix}family100
┃ 🎯 ${prefix}asahotak | ${prefix}susunkata | ${prefix}tekateki
┃ → Lihat semua: *${prefix}gamemenu*
┃
┣━━〔 ⚔️ *RPG & EKONOMI* 〕━━⬣
┃
┃ 💼 ${prefix}kerja | ${prefix}bekerja | ${prefix}bansos | ${prefix}gajian
┃ ⛏️ ${prefix}mining | ${prefix}nebang | ${prefix}berkebon | ${prefix}mancing
┃ 💰 ${prefix}nabung | ${prefix}banknabung | ${prefix}banktarik | ${prefix}bankcek
┃ 🛒 ${prefix}shop | ${prefix}transfer | ${prefix}bet | ${prefix}invest
┃ 🔨 ${prefix}craft | ${prefix}crafting | ${prefix}repair | ${prefix}upgrade
┃ ⚔️ ${prefix}duel | ${prefix}battle | ${prefix}fight | ${prefix}heist
┃ 🐉 ${prefix}fightnaga | ${prefix}fightphonix | ${prefix}fightgriffin
┃ 📊 ${prefix}mystats | ${prefix}statusopen | ${prefix}leaderboard | ${prefix}selectskill
┃ 🏰 ${prefix}guild | ${prefix}loginisekai | ${prefix}guildstats
┃ 👹 ${prefix}tantangbos
┃ → Lihat semua: *${prefix}rpgmenu*
┃
┣━━〔 ⛩️ *ANIME* 〕━━⬣
┃
┃ 🔍 ${prefix}anime | ${prefix}animefinder | ${prefix}animedl
┃ 📅 ${prefix}animeschedule | ${prefix}amv | ${prefix}otakudesu
┃ 🌸 ${prefix}waifu | ${prefix}husbu | ${prefix}loli | ${prefix}neko
┃ 🌸 ${prefix}megumin | ${prefix}nezuko | ${prefix}mikasa | ${prefix}emilia
┃ 🌸 ${prefix}naruto | ${prefix}sasuke | ${prefix}itachi | ${prefix}genshin
┃ 🎭 ${prefix}animehug | ${prefix}animekiss | ${prefix}animeslap | ${prefix}animepat
┃ 🎭 ${prefix}animebonk | ${prefix}animecry | ${prefix}animewink | ${prefix}animefeed
┃ → Lihat semua: *${prefix}animemenu*
┃
┣━━〔 🎡 *FUN & HIBURAN* 〕━━⬣
┃
┃ 😂 ${prefix}smeme | ${prefix}brat | ${prefix}bratvid | ${prefix}fitnah
┃ 😂 ${prefix}fakedev | ${prefix}fakedana | ${prefix}fakegc | ${prefix}fakeml
┃ 💘 ${prefix}gachawaifu | ${prefix}marry | ${prefix}cerai | ${prefix}couple
┃ 🎭 ${prefix}hug | ${prefix}pat | ${prefix}kiss | ${prefix}slap | ${prefix}bonk
┃ 🎭 ${prefix}lick | ${prefix}bite | ${prefix}yeet | ${prefix}poke | ${prefix}wink
┃ 🎭 ${prefix}blush | ${prefix}dance | ${prefix}cuddle | ${prefix}highfive
┃ ✅ ${prefix}hotcheck | ${prefix}gaycheck | ${prefix}cutecheck | ${prefix}waifucheck
┃ ✅ ${prefix}stupidcheck | ${prefix}handsomecheck | ${prefix}hornycheck
┃ ❓ ${prefix}truth | ${prefix}dare | ${prefix}suit | ${prefix}tictactoe
┃ → Lihat semua: *${prefix}funmenu*
┃
┣━━〔 🛠️ *TOOLS & CONVERTER* 〕━━⬣
┃
┃ 🔄 ${prefix}sticker | ${prefix}tomp4 | ${prefix}toaudio | ${prefix}tomp3
┃ 🔄 ${prefix}togif | ${prefix}tovn | ${prefix}toimg | ${prefix}toptt
┃ 🔄 ${prefix}toonce | ${prefix}stktomp4 | ${prefix}toqr | ${prefix}tinyurl
┃ 📡 ${prefix}ping | ${prefix}runtime | ${prefix}ssweb | ${prefix}myip
┃ 🔠 ${prefix}tts | ${prefix}styletext | ${prefix}fliptext | ${prefix}translate
┃ 🔠 ${prefix}ttp | ${prefix}qc | ${prefix}iqc | ${prefix}quoted
┃ 🧰 ${prefix}QR | ${prefix}cekkuota | ${prefix}cekpulsa | ${prefix}currency
┃ 🧰 ${prefix}weather | ${prefix}imdb | ${prefix}wanumber | ${prefix}web2zip
┃ 🎵 ${prefix}bass | ${prefix}nightcore | ${prefix}reverse | ${prefix}robot
┃ 📊 ${prefix}totalfitur | ${prefix}cekfitur
┃
┣━━〔 📸 *FOTO RANDOM* 〕━━⬣
┃
┃ 🖼️ ${prefix}aesthetic | ${prefix}wallpaper | ${prefix}art | ${prefix}space
┃ 🖼️ ${prefix}gamewallpaper | ${prefix}wallml | ${prefix}wallphone
┃ 🐾 ${prefix}cat | ${prefix}dog | ${prefix}goose | ${prefix}lizardpic
┃ 👤 ${prefix}ulzzangboy | ${prefix}ulzzanggirl | ${prefix}couplepic
┃ 🎮 ${prefix}pubg | ${prefix}car | ${prefix}bike | ${prefix}technology
┃
┣━━〔 🎨 *EPHOTO MAKER* 〕━━⬣
┃
┃ ✍️ ${prefix}glitchtext | ${prefix}neonglitch | ${prefix}gradienttext
┃ ✍️ ${prefix}advancedglow | ${prefix}glowingtext | ${prefix}flag3dtext
┃ ✍️ ${prefix}blackpinkstyle | ${prefix}cartoonstyle | ${prefix}1917style
┃ ✍️ ${prefix}logomaker | ${prefix}luxurygold | ${prefix}galaxystyle
┃ → Lihat semua: *${prefix}ephoto360menu*
┃
┣━━〔 🔍 *STALKER* 〕━━⬣
┃
┃ 🕵️ ${prefix}igstalk | ${prefix}ttstalk | ${prefix}ytstalk
┃ 🕵️ ${prefix}ffstalk | ${prefix}mlstalk | ${prefix}ghstalk
┃ 🕵️ ${prefix}npmstalk | ${prefix}robloxstalk | ${prefix}genshinstalk
┃
┣━━〔 📰 *BERITA* 〕━━⬣
┃
┃ 📰 ${prefix}cnn | ${prefix}kompas | ${prefix}detik | ${prefix}tempo
┃ 📰 ${prefix}tribun | ${prefix}antara | ${prefix}okezone | ${prefix}cnbc
┃ 📰 ${prefix}fajar | ${prefix}indozone | ${prefix}merdeka | ${prefix}sindo
┃
┣━━〔 🔮 *PRIMBON & INFO* 〕━━⬣
┃
┃ 🔮 ${prefix}artimimpi | ${prefix}artinama | ${prefix}weton | ${prefix}zodiak
┃ 🔮 ${prefix}ramaljodoh | ${prefix}tarot | ${prefix}fengshui | ${prefix}shio
┃ ℹ️ ${prefix}cekkhodam | ${prefix}primbon | ${prefix}primbon2
┃
┣━━〔 🕋 *ISLAMI* 〕━━⬣
┃
┃ 🌙 ${prefix}jadwalsholat | ${prefix}alquran | ${prefix}audiosurah
┃ 🌙 ${prefix}ayatkursi | ${prefix}doaharian | ${prefix}kisahnabi
┃ 🌙 ${prefix}asmaulhusna | ${prefix}quotesislami | ${prefix}bacaansholat
┃
┣━━〔 💌 *MENFESS ANONIM* 〕━━⬣
┃
┃ 📨 ${prefix}sendmenfess | ${prefix}stopmenfess
┃ ✅ ${prefix}terimamenfess | ${prefix}tolakmenfess | ${prefix}balasmenfess
┃
┣━━〔 🏪 *STORE SYSTEM* 〕━━⬣
┃
┃ 🛒 ${prefix}buylist | ${prefix}acc | ${prefix}cekorder | ${prefix}cancelorder
┃ 📋 ${prefix}listorder | ${prefix}setpayment | ${prefix}addadminstore
┃ ✅ ${prefix}doneorder | ${prefix}rejectorder
┃ → Detail: *${prefix}storemenu*
┃
┣━━〔 👑 *OWNER BOT* 〕━━⬣
┃
┃ 👤 ${prefix}addprem | ${prefix}delprem | ${prefix}addowner | ${prefix}delowner
┃ 🎫 ${prefix}addsewa | ${prefix}delsewa | ${prefix}addredeem | ${prefix}delredeem
┃ 📢 ${prefix}bctext | ${prefix}bcimage | ${prefix}bcvideo | ${prefix}poll
┃ ⚙️ ${prefix}setbotname | ${prefix}setppbot | ${prefix}setbotbio | ${prefix}restart
┃ 🔒 ${prefix}self | ${prefix}public | ${prefix}onlygc | ${prefix}onlypc
┃ 🔧 ${prefix}ban | ${prefix}unban | ${prefix}block | ${prefix}unblock
┃ 🔧 ${prefix}setlimit | ${prefix}setmoney | ${prefix}setlevel | ${prefix}setbank
┃ → Lihat semua: *${prefix}ownermenu*
┃
┣━━〔 🐛 *BUG TOOLS* 〕━━⬣
┃
┃ ⚠️ ${prefix}forcealya | ${prefix}alyacrash
┃ ⚠️ _(Owner only)_
┃
${newPluginSection}
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣

💡 _${prefix}help <command> untuk detail penggunaan_
© 2026 *${_ownername}* • Alya V20`.trim();

    // ── Kirim (format Ourin: interactiveMessage + nativeFlowMessage) ───────
    const sections = [
      {
        title: '🌟 MENU UTAMA',
        rows: [
          { title: '📜 PERATURAN',   description: 'Baca aturan penggunaan bot',        id: `${prefix}rules`      },
          { title: '🆕 FITUR BARU',  description: 'Update fitur terbaru Alya',         id: `${prefix}newfitur`   },
          { title: '🤖 INFO BOT',    description: 'Statistik, versi & developer info', id: `${prefix}infobot`    },
          { title: '🔄 UPDATE MENU', description: 'Lihat update terbaru Alya V20',     id: `${prefix}updatemenu` },
          { title: '💸 DONASI',      description: 'Donasi bot agar dapat berkembang',  id: `${prefix}donasi`     }
        ]
      },
      {
        title: '🛠️ KATEGORI MENU',
        rows: [
          { title: '🤖 AI MENU',       description: 'Fitur kecerdasan buatan',        id: `${prefix}aimenu`        },
          { title: '📂 DOWNLOAD MENU', description: 'Tiktok, YT, IG Downloader',      id: `${prefix}downloadmenu`  },
          { title: '🎮 GAME MENU',     description: 'Tebak-tebakan, RPG & game seru', id: `${prefix}gamemenu`      },
          { title: '⚔️ RPG MENU',      description: 'Dungeon, Mining, & Inventory',   id: `${prefix}rpgmenu`       },
          { title: '🥳 FUN MENU',      description: 'Fitur menyenangkan',             id: `${prefix}funmenu`       },
          { title: '👥 GROUP MENU',    description: 'Pengaturan grup & admin',        id: `${prefix}groupmenu`     },
          { title: '🎴 STICKER MENU',  description: 'Kumpulan fitur pembuat sticker', id: `${prefix}stickermenu`   },
          { title: '🔞 NSFW MENU',     description: 'Menampilkan fitur 18+',          id: `${prefix}nsfwmenu`      },
          { title: '🏪 STORE MENU',    description: 'Menampilkan fitur jabeh/shop',   id: `${prefix}storemenu`     },
          { title: '📰 BERITA MENU',   description: 'Fitur berita terkini',           id: `${prefix}beritamenu`    },
          { title: '👑 OWNER MENU',    description: 'Khusus untuk pengembang bot',    id: `${prefix}ownermenu`     }
        ]
      },
      {
        title: '📊 LAINNYA',
        rows: [
          { title: '📊 TOTAL FITUR', description: 'Lihat jumlah total fitur & breakdown', id: `${prefix}totalfitur` }
        ]
      }
    ];

    const listnye = { title: '📦 Daftar Semua Fitur, ' + pushname + '~', sections };

    try {
      await listbut3(m.chat, teks, listnye, m, { title: `🌸 ${_botname}` });
    } catch (e) {
      console.error('[allmenu] Gagal kirim listbut3:', e.message);
      await reply(teks);
    }

    // ── Musik ──────────────────────────────────────────────────────────────
    try {
      if (global.music) {
        await alya.sendMessage(m.chat, {
          audio: { url: global.music },
          mimetype: 'audio/mp4',
          ptt: true,
        }, { quoted: m });
      }
    } catch (e) {
      console.warn('[allmenu] Musik gagal:', e.message);
    }
  }
};
