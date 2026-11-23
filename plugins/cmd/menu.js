// Plugin: menu
// Alya V20 — Menu dengan VIDEO yang bisa diputar dari file lokal
// Commands: menu
//
// Cara kerja video:
//   1. Cari file video dari daftar path prioritas (./media/menu.mp4, dll)
//   2. Kirim video sebagai pesan sendiri (gifPlayback: false → bisa di-play user)
//   3. Kirim interactive list button (dropdown) sebagai pesan terpisah
//
// Untuk ganti video: taruh file .mp4 di salah satu path berikut (prioritas atas ke bawah):
//   ./media/menu.mp4         ← rekomendasi utama
//   ./media/video/menu.mp4
//   ./data/assets/menu.mp4
//   ./data/video/menu.mp4
//
// Jika tidak ada video → fallback ke image header (alya.jpg), lalu text header.

'use strict'

const path  = require('path')
const fs    = require('fs')
const axios = require('axios')
const vxMenu = require('../../lib/vx/menu-data')

// ── Path prioritas file video lokal ───────────────────────────────────────────
const VIDEO_PATHS = [
  './media/menu.mp4',
  './media/video/menu.mp4',
  './media/video/alya.mp4',
  './data/assets/menu.mp4',
  './data/video/menu.mp4',
]

// ── Path prioritas file thumbnail (cover saat video belum diplay) ─────────────
const THUMB_PATHS = [
  './media/alya.jpg',
  './media/alya/alya1.jpg',
  './data/image/menu.jpg',
  './media/welcome_img.jpg',
]

// ── Helper: cari file pertama yang ada dari daftar path ───────────────────────
function findFile(paths) {
  for (const p of paths) {
    const abs = path.resolve(p)
    if (fs.existsSync(abs)) return abs
  }
  return null
}

// ── Ourin-style smallCaps ──────────────────────────────────────────────────────
function toSmallCaps(text) {
  const m = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',
              k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',
              u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
  return text.toLowerCase().split('').map(c => m[c] || c).join('')
}

// ── Weather helper ─────────────────────────────────────────────────────────────
function parseWMO(code) {
  const codes = {
    0: 'Cerah ☀️', 1: 'Cerah Berawan 🌤️', 2: 'Berawan ⛅', 3: 'Mendung ☁️',
    45: 'Kabut 🌫️', 61: 'Hujan Ringan 🌦️', 63: 'Hujan 🌧️', 95: 'Badai Petir ⛈️'
  }
  return codes[code] || 'Berawan ⛅'
}

async function getWeatherLocal(city = 'Jakarta') {
  try {
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=id&format=json`,
      { timeout: 4000 }
    )
    if (!geoRes.data.results?.length) throw new Error('not found')
    const { latitude, longitude, name, country } = geoRes.data.results[0]
    const wx = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: { latitude, longitude, current_weather: true, timezone: 'auto' },
      timeout: 4000
    })
    const { temperature, weathercode } = wx.data.current_weather
    return `${name}, ${country}: ${parseWMO(weathercode)} (${temperature}°C)`
  } catch {
    return 'Jakarta: Cerah ☀️ (30°C)'
  }
}

// ═════════════════════════════════════════════════════════════════════════════
module.exports = {
  command: ['menu'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      prefix, pushname,
      Ryuu, isPrem, isOwn, isPT, isAdminP, isReseller,
      reply, listbut2, alyaFitur, runtime, user
    } = ctx

    const moment = require('moment-timezone')
    const wib     = moment.tz('Asia/Jakarta')
    const time    = wib.format('HH:mm:ss')
    const date    = wib.format('DD MMMM YYYY')
    const greetHr = wib.hours()
    const greeting = greetHr < 4  ? 'Selamat Dini Hari 🌙'
                   : greetHr < 12 ? 'Selamat Pagi ☀️'
                   : greetHr < 15 ? 'Selamat Siang 🌤️'
                   : greetHr < 18 ? 'Selamat Sore 🌅'
                   : 'Selamat Malam 🌙'

    // Sapaan tsundere random — supaya tidak monoton
    const greetings = [
      `Hmph... kamu lagi sih yang minta menu. Ya sudah, aku kasih — tapi jangan senang dulu! 😤`,
      `A-aku bukan senang bantu kamu ya! Ini karena tugasku sebagai bot. Ngerti?! 💢`,
      `Kamu manggil aku? ...Sedikit senang sih. Tapi tidak aku akui! 🙈`,
      `Eh, ${pushname}~? Datang juga akhirnya! Jangan pikir aku nungguin kamu ya! 😳`,
      `H-huh, ada kamu. Baiklah, karena kamu sudah repot-repot manggil aku... 💕`,
    ]
    const tsundereGreet = greetings[Math.floor(Math.random() * greetings.length)]

    await alya.sendMessage(m.chat, { react: { text: '🌸', key: m.key } })

    // ── Cuaca ──────────────────────────────────────────────────────────────
    const cuaca = await getWeatherLocal()

    // ── User data ──────────────────────────────────────────────────────────
    const userAlt = global.db?.users?.[m.sender] || {}
    const level   = userAlt.level || 0
    const exp     = userAlt.exp   || 0
    const maxExp  = 100000 * (level + 1)
    const percent = Math.min(Math.floor((exp / maxExp) * 100), 100)
    const bar     = '▰'.repeat(Math.floor(percent / 10)) + '▱'.repeat(10 - Math.floor(percent / 10))
    const toRp    = v => 'Rp' + (v || 0).toLocaleString('id-ID')
    const toNum   = v => (v || 0).toLocaleString('id-ID')

    const rank = Ryuu       ? 'Pemilik 👑'
               : isOwn      ? 'Owner Panel 🔑'
               : isPT       ? 'PT Panel 🏢'
               : isAdminP   ? 'Admin Panel ⚙️'
               : isReseller ? 'Reseller Panel 🛒'
               : isPrem     ? 'Premium User ⭐'
               : 'User Gratisan 👤'

    const idLen     = m.key.id?.length || 0
    const deviceType = idLen === 16 ? 'Android'
                     : idLen === 20 ? 'iPhone'
                     : idLen === 22 ? 'WhatsApp Web'
                     : idLen === 32 ? 'Android (Multi-Device)' : 'Unknown'

    let totalFitur = '1.588+'
    let regData    = {}
    try {
      const regPath = path.join(__dirname, '../cmd_registry.json')
      regData    = JSON.parse(fs.readFileSync(regPath, 'utf8'))
      totalFitur = Object.keys(regData).length.toLocaleString('id-ID')
    } catch {
      try { totalFitur = String(alyaFitur()) } catch { totalFitur = '1.500+' }
    }

    const totalUsers = Object.keys(global.db?.users || {}).length
    const uptimeStr  = typeof runtime === 'function'
      ? runtime(process.uptime())
      : `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`

    // ── Readmore trick ─────────────────────────────────────────────────────
    const readmore = String.fromCharCode(8206).repeat(4001)

    // ── Category list (behind readmore) ───────────────────────────────────
    // cmd_registry.json berisi PATH STRING ("plugins/cmd/xxx.js"), bukan objek.
    // Tag tidak boleh diambil dari info.tags — harus ditebak dari path, kalau
    // tidak semua command bakal ngumpul di "general".
    const KNOWN_TAGS = [
      ['game',     /tebak|game|ultraman|blackjack|slot|catur|suit|tictactoe|truth|dare|gacha|quiz|caklontong|asahotak|susunkata|tekateki|family100|werewolf/i],
      ['rpg',      /mining|nebang|mancing|berkebon|kerja|bansos|gajian|nabung|bank|shop|craft|duel|battle|invest|guild|level|money|exp/i],
      ['ai',       /^ai|gemini|bard|gpt|blackbox|claude|dalle|prodia|bingimg|chatgpt|aichat/i],
      ['download', /dl$|downloader|^yt|^tiktok|instagram|facebook|twitter|spotify|terabox|gdrive|pinterest|snackvideo/i],
      ['sticker',  /stik|sticker|togif|tovn|toimg|toptt|toaudio/i],
      ['group',    /^(add|del|kick|promote|demote|mute|unmute|tag|hidetag|antilink|antibot|setwelcome|welcome|opentime|closetime)/i],
      ['owner',    /^(addprem|delprem|addowner|delowner|addsewa|delsewa|addredeem|delredeem|setbot|setppbot|restart|ban|unban|self|public)/i],
      ['islami',   /sholat|alquran|ayat|doa|hadis|asmaulhusna|quotesislami|islam/i],
      ['info',     /info|runtime|ping|weather|cekkhodam|imdb|cekkuota|cekpulsa/i],
    ]
    const FOLDER_TAGS = {
      game:'game', rpg:'rpg', ai:'ai', 'ai-image':'ai', download:'download',
      downloads:'download', downloader:'download', sticker:'sticker',
      group:'group', owner:'owner', panel:'owner', premium:'owner',
      tools:'tools', tool:'tools', maker:'tools', canvas:'tools',
      anime:'anime', fun:'fun', info:'info', primbon:'primbon',
      islami:'islami', islamic:'islami', religi:'islami', nsfw:'nsfw',
      ephoto:'tools', search:'tools', stalker:'group', store:'group',
      music:'fun', random:'fun', quotes:'info', tts:'tools',
      economy:'rpg', cecan:'fun', asupan:'fun', cewerandom:'fun',
    }

    function deriveTag(cmd, info) {
      // Registry lama/objek tetap didukung kalau suatu hari berubah bentuk.
      if (info && typeof info === 'object' && !Array.isArray(info)) {
        const t = (Array.isArray(info.tags) ? info.tags[0] : info.tags) || info.category
        if (t) return String(t)
      }
      const p = String(info || '').replace(/\\/g, '/')
      let folder = ''
      const vx = p.match(/(?:^|\/)vx_([^/]+)\.js$/i)
      if (vx) {
        // vx_<engine>_plugins_<folder>_<file>.js → ambil folder setelah "plugins"
        const parts = vx[1].split('_')
        const i = parts.indexOf('plugins')
        folder = (i >= 0 ? parts[i + 1] : parts[1]) || ''
        if (!folder) return 'general'
      } else {
        const m = p.match(/(?:^|\/)([^/]+)\/[^/]+\.js$/i)
        folder = m ? m[1] : ''
        if (!folder || folder === 'cmd' || folder === 'fitur') {
          for (const [tag, re] of KNOWN_TAGS) {
            if (re.test(cmd)) return tag
          }
          return 'general'
        }
      }
      const lower = folder.toLowerCase()
      return FOLDER_TAGS[lower.replace(/s$/, '')] || FOLDER_TAGS[lower] || lower
    }

    const PER_TAG = 30
    let categoryList = ''
    try {
      const tagMap = {}
      for (const [cmd, info] of Object.entries(regData)) {
        const tag = deriveTag(cmd, info)
        if (!tagMap[tag]) tagMap[tag] = []
        tagMap[tag].push(cmd)
      }
      const tagEmojis = {
        general:'🏠', game:'🎮', rpg:'⚔️', download:'📥', ai:'🤖',
        sticker:'🖼️', group:'👥', owner:'👑', fun:'🎡', nsfw:'🔞',
        stalker:'🕵️', store:'🏪', islami:'🕌', anime:'🍥', converter:'🔄',
        tools:'🛠️', berita:'📰', other:'📌', canvas:'🎨', info:'ℹ️'
      }
      for (const [tag, cmds] of Object.entries(tagMap)) {
        const em = tagEmojis[tag] || '📌'
        categoryList += `╭─☰ ${em} ${toSmallCaps(tag).toUpperCase()}\n`
        cmds.slice(0, PER_TAG).forEach(cmd => { categoryList += `> ${prefix}${cmd}\n` })
        if (cmds.length > PER_TAG) categoryList += `> ... dan ${cmds.length - PER_TAG} lainnya\n`
        categoryList += `╰─⬣\n\n`
      }
    } catch {
      categoryList = `╭─☰ 🏠 NAVIGASI\n> ${prefix}allmenu → Lihat semua fitur\n╰─⬣\n`
    }

    // ── Section plugin baru vanXone (ringkas, tetap gaya Alya) ─────────────
    try {
      const vxTotal = vxMenu.total()
      if (vxTotal > 0) {
        categoryList += `\n╭─☰ 🆕 ɴᴇᴡ ᴠᴀɴxᴏɴᴇ\n`
        vxMenu.flatten(5).forEach(v => {
          categoryList += `> ${prefix}${v.cmd} — ${v.desc}\n`
        })
        categoryList += `> ${prefix}vxmenu → daftar plugin baru (${vxTotal.toLocaleString('id-ID')} command)\n`
        categoryList += `╰─⬣\n\n`
      }
    } catch { /* helper bermasalah → section dilewati, menu tetap tampil */ }

    // ── Body teks menu (bagian sambutan baru — tsundere Alya) ──────────────
    const teks =
`╭──────────────────────────╮
│  🌸 *ALYA BOT — V20*  🌸  │
╰──────────────────────────╯

✨ *${greeting}, ${pushname}~!*

${tsundereGreet}

💌 *"Aku selalu ada di sini untukmu...*
*w-walau bukan berarti aku peduli ya!"* 💕
━━━━━━━━━━━━━━━━━━━━━━━

🌸 *INFO WAKTU & SISTEM*
┌─────────────────────
│ 🕐 Waktu    : ${time} WIB
│ 📅 Tanggal  : ${date}
│ 📱 Device   : ${deviceType}
│ 🌤️ Cuaca    : ${cuaca}
│ ✨ Fitur    : ${totalFitur} Command
│ ⏳ Uptime   : ${uptimeStr}
└─────────────────────

🌸 *ALYA V20 — AI CHATBOT INTERAKTIF*
┌─────────────────────
│ 🤖 Dilengkapi kecerdasan buatan (AI)
│ 💬 Bisa ngobrol, jawab pertanyaan & bantu
│ 🔔 AI aktif otomatis di semua chat
│ 🔄 Update: Semua command & menu V20 ✅
│
│ 📌 *Note:* Tag, reply, atau panggil aku
│    kalau ada yang mau ditanyakan~ 🙈
└─────────────────────

🌸 *INFO KAMU, ${pushname.toUpperCase()}~*
┌─────────────────────
│ 🎀 Nama   : ${pushname}
│ 🏅 Status : ${rank}
│ 📊 Level  : ${level} (${percent}%)
│ ✨ EXP    : ${toNum(exp)} / ${toNum(maxExp)}
│ 💰 Uang   : ${toRp(user?.money)}
│ 🏦 Bank   : ${toRp(user?.bank)}
│ 🎟️ Limit  : ${userAlt.limit || 0}
│ [ ${bar} ]
└─────────────────────

🌸 *INFO BOT*
┌─────────────────────
│ 🎀 Nama    : ${global.botname || 'Alya Bot'}
│ ⚙️ Versi   : V20 (AI Edition)
│ 👥 Users   : ${toNum(totalUsers)}
└─────────────────────

🌸 *DEVELOPER*
┌─────────────────────
│ 📱 WA  : wa.me/${ownernomer}
│ ✈️ TG  : t.me/${tele}
│ 📸 IG  : instagram.com/${ig}
└─────────────────────

_Pilih menu di bawah ini ya~_ 🎀

${readmore}${categoryList}`

    // ── Sections dropdown ──────────────────────────────────────────────────
    const sections = [
      {
        title: '🌟 MENU UTAMA',
        rows: [
          { title: '📦 SEMUA FITUR',   description: 'Tampilkan semua list perintah bot',    id: `${prefix}allmenu`    },
          { title: '📊 TOTAL FITUR',   description: 'Lihat jumlah total fitur & breakdown', id: `${prefix}totalfitur` },
          { title: '📜 PERATURAN',     description: 'Baca aturan penggunaan bot',           id: `${prefix}rules`      },
          { title: '🆕 FITUR BARU',    description: 'Update fitur terbaru Alya',            id: `${prefix}newfitur`   },
          { title: '🤖 INFO BOT',      description: 'Statistik, versi & developer info',    id: `${prefix}infobot`    },
          { title: '🔄 UPDATE MENU',   description: 'Lihat update terbaru Alya V20',        id: `${prefix}updatemenu` },
          { title: '💸 DONASI',        description: 'Donasi bot agar dapat berkembang',     id: `${prefix}donasi`     },
          { title: '🌟 RATING',        description: 'Rating bot ini',                       id: `${prefix}rating`     }
        ]
      },
      {
        title: '🎮 GAME & RPG',
        rows: [
          { title: '🕹️ GAME MENU',     description: 'Tebak-tebakan, RPG, & game seru',     id: `${prefix}gamemenu`  },
          { title: '🦸 ULTRAMAN GAME', description: 'Hero vs Villain, lawan Kaiju!',        id: `${prefix}ultraman`  },
          { title: '⚔️ RPG MENU',      description: 'Dungeon, Mining, & Inventory',         id: `${prefix}rpgmenu`   },
          { title: '🛍️ STORE MENU',    description: 'Menampilkan fitur jabeh/shop',         id: `${prefix}storemenu` }
        ]
      },
      {
        title: '🛠️ TOOLS & AI',
        rows: [
          { title: '🤖 AI MENU',       description: 'Fitur kecerdasan buatan',           id: `${prefix}aimenu`       },
          { title: '🎭 SET ROLE AI',   description: 'Atur hubunganmu dengan Alya',       id: `${prefix}setrole`      },
          { title: '📝 STICKER MENU',  description: 'Kumpulan fitur pembuat sticker',    id: `${prefix}stickermenu`  },
          { title: '🔍 STALKER MENU',  description: 'Fitur stalking media sosial',       id: `${prefix}stalkermenu`  },
          { title: '🖥️ DATABASE MENU', description: 'Fitur manajemen database',          id: `${prefix}databasemenu` },
          { title: '🔮 PRIMBON MENU',  description: 'Fitur ramalan & primbon',           id: `${prefix}primbonmenu`  },
          { title: '💬 QUOTES MENU',   description: 'Kumpulan kata-kata bijak',          id: `${prefix}quotesmenu`   },
          { title: '📶 CEK KUOTA',     description: 'Cek kuota internet semua operator', id: `${prefix}cekkuota`     },
          { title: '💰 CEK PULSA',     description: 'Cek saldo pulsa semua operator',   id: `${prefix}cekpulsa`     }
        ]
      },
      {
        title: '📂 DOWNLOADER & MEDIA',
        rows: [
          { title: '📂 DOWNLOADER',   description: 'Tiktok, YT, IG Downloader',     id: `${prefix}downloadmenu`    },
          { title: '🎥 RANDOM VIDEO', description: 'Menampilkan fitur random video', id: `${prefix}randomvideomenu` },
          { title: '📷 RANDOM PHOTO', description: 'Menampilkan fitur random foto',  id: `${prefix}randomphotomenu` },
          { title: '🔞 NSFW MENU',    description: 'Menampilkan fitur 18+',          id: `${prefix}nsfwmenu`        }
        ]
      },
      {
        title: '🎨 ANIME & EDIT FOTO',
        rows: [
          { title: '🍥 ANIME MENU', description: 'Kumpulan fitur anime', id: `${prefix}animemenu`     },
          { title: '🎨 EDIT FOTO',  description: 'Ephoto360 & Maker',    id: `${prefix}ephoto360menu`  }
        ]
      },
      {
        title: '🌐 PANEL & HOSTING',
        rows: [
          { title: '🛠️ CPANEL MENU',   description: 'Fitur create panel',            id: `${prefix}cpanelmenu`        },
          { title: '⚙️ PTERODACTYL',   description: 'Fitur manajemen Pterodactyl',   id: `${prefix}pyterodactylemenu` },
          { title: '🌊 DIGITAL OCEAN', description: 'Fitur manajemen Digital Ocean', id: `${prefix}digitaloceanmenu`  },
          { title: '🌐 DOMAIN MENU',   description: 'Fitur create subdomain',        id: `${prefix}domainmenu`        }
        ]
      },
      {
        title: '🥳 FUN & KOMUNITAS',
        rows: [
          { title: '🥳 FUN MENU',         description: 'Fitur menyenangkan',                id: `${prefix}funmenu`          },
          { title: '🕌 ISLAMI MENU',       description: 'Fitur religi islami',               id: `${prefix}islamimenu`       },
          { title: '👤 ANONYMOUS',         description: 'Fitur anonymous chat',              id: `${prefix}anonymousmenu`    },
          { title: '💌 MENFESS',           description: 'Kirim perasaan secara anonim',      id: `${prefix}menfessmenu`      },
          { title: '📮 BERITA MENU',       description: 'Fitur berita terkini',              id: `${prefix}beritamenu`       },
          { title: '🚆 TRANSPORTASI',      description: 'Jadwal kereta & pesawat Indonesia', id: `${prefix}transportasimenu` },
          { title: '💾 PUSH MENU',         description: 'Fitur push kontak/broadcast',       id: `${prefix}pushmenu`         },
          { title: '🐛 BUG MENU',          description: 'Fitur bug WhatsApp',                id: `${prefix}bugmenu`          },
          { title: '📪 OTHER MENU',        description: 'Fitur yang tidak dikategorikan',    id: `${prefix}othermenu`        }
        ]
      },
      {
        title: '👑 OWNER & ADMIN',
        rows: [
          { title: '👤 OWNER MENU', description: 'Khusus untuk pengembang bot', id: `${prefix}ownermenu` },
          { title: '👥 GROUP MENU', description: 'Pengaturan grup & admin',     id: `${prefix}groupmenu` }
        ]
      }
    ]

    const listnye = { title: '🎀 Pilih Menu, ' + pushname + '~', sections }

    // ══════════════════════════════════════════════════════════════════════
    //  KIRIM: satu pesan interactiveMessage (gaya Ourin 1000%)
    //
    //  listbut2() sudah otomatis:
    //    1. Cari video lokal (./media/menu.mp4, dll) → jadi HEADER video
    //       yang bisa diputar (gifPlayback:false, tombol play muncul)
    //    2. Kalau video tidak ada → fallback header image (./data/image/menu.jpg)
    //    3. Kalau image juga tidak ada → fallback header teks
    //    4. body teks (caption lengkap) + nativeFlowMessage (single_select,
    //       cta_url, quick_reply) dikirim dalam SATU pesan via relayMessage
    //
    //  Untuk menampilkan video di .menu: taruh file .mp4 di salah satu path:
    //    ./media/menu.mp4 (rekomendasi) / ./media/video/menu.mp4 /
    //    ./media/video/alya.mp4 / ./data/assets/menu.mp4 / ./data/video/menu.mp4
    // ══════════════════════════════════════════════════════════════════════
    const videoFile = findFile(VIDEO_PATHS)
    if (!videoFile) {
      console.warn('[menu] ⚠️ File video tidak ditemukan, header akan fallback ke image/teks.')
      VIDEO_PATHS.forEach(p => console.warn(`[menu]    → ${path.resolve(p)}`))
    } else {
      console.log(`[menu] ✅ Video header ditemukan: ${videoFile}`)
    }

    await listbut2(m.chat, teks, listnye, m)
  }
}
