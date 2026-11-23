// settings.js vanXone — DINETRALKAN untuk Alya.
// Semua assignment global dijaga: hanya diisi bila belum ada, dan nama yang dipakai
// Alya (identitas bot, owner, sesi, mess, wm) dialihkan ke global.__vxBlocked supaya
// tidak menimpa identitas Alya. Bentuk statement tetap utuh (aman untuk objek multiline).
// Apikey resmi vanXone (global.APIs, global.apiKeys, global.ghTokens, global.tgToken,
// global.downloader, global.weather, global.ai) tetap masuk karena Alya tidak memakainya.
// Diblokir: botname, ownername, ownernumber, owner, prefix, sessionName, pairingNumber, packname, author, footer, music, channel, channeln, ig, tele, saluran, wagc, mess
global.__vxBlocked = global.__vxBlocked || {}
/*
 ┌──────────────────────────────────────────────────────────────┐
 │  SETTINGS — satu-satunya file pengaturan bot (gaya global.*) │
 │  ⚠️  Jangan kirim/screenshot file ini: berisi kunci rahasia.  │
 └──────────────────────────────────────────────────────────────┘
*/

//================= IDENTITAS =================\\
// Nomor owner TIDAK dikunci lagi: ganti langsung di sini. Kalau nomor owner diganti, cek juga database/owners.json
// (daftar owner hasil .addowner / .claimowner) dan hapus nomor lama di sana kalau tidak dipakai lagi.
global.__vxBlocked.botname = 'vanXone'                // nama bot
global.__vxBlocked.ownername = 'vanXone </>'          // nama owner
global.__vxBlocked.ownernumber = '6281220822639'      // nomor owner utama (tanpa + / spasi) -> tampil di .owner, dipakai .report, dll
global.__vxBlocked.owner = []                         // owner TAMBAHAN, mis. ['62812xxxxxxx'] (atau pakai .addowner / .claimowner)
global.__vxBlocked.prefix = '.'
global.__vxBlocked.sessionName = 'session'          // nama folder sesi login (jangan diubah kalau bot sudah login)
global.__vxBlocked.pairingNumber = ''                // nomor WA bot untuk pairing code, contoh '628123456789' (kosong = ditanya di console, cuma kalau belum login)
global.__vxBlocked.packname = 'vanXone </>'         // nama pack stiker
global.__vxBlocked.author = 'vanXone Bot'           // author stiker
global.__vxBlocked.footer = 'By vanXone </>'

//================= MENU & TAMPILAN =================\\
if (global.thumbnailvid === undefined) global.thumbnailvid = 'https://raw.githubusercontent.com/ManzzyGacor/Urlmanzzy/main/file_1790604438988_521.mp4'
                                         // .mp4 = tampil seperti GIF, .jpg/.png = gambar
global.__vxBlocked.music = 'https://c.termai.cc/a194/YMx.mp3'   // voice note setelah menu ('' = nonaktif)
global.__vxBlocked.channel = '120363424132521336@newsletter'     // jid channel untuk label "Diteruskan" ('' = nonaktif)
global.__vxBlocked.channeln = 'vanXone Official </>'
if (global.richMode === undefined) global.richMode = true                  // pesan bertombol/carousel. false = teks biasa
if (global.richHints === undefined) global.richHints = true                 // petunjuk "balas pesan ini dengan angka" di kartu bertombol
if (global.uiMode === undefined) global.uiMode = 'rich'                  // TAMPILAN: 'text' = balasan teks biasa | 'rich' = UI kartu HTML. Ganti kapan saja lewat chat: .uimode text / .uimode rich
if (global.uiCopy === undefined) global.uiCopy = 'auto'                  // tombol Salin di mode rich: 'auto' (hasil berisi data) | 'all' (semua balasan) | 'off'
if (global.uiPlain === undefined) global.uiPlain = []                     // perintah yang tetap teks biasa, mis. ['ai', 'hash']
if (global.uiBotJid === undefined) global.uiBotJid = '867051314767696@bot' // JID bot untuk pesan rich (sama seperti di ytPlayer)
if (global.uiNavButtons === undefined) global.uiNavButtons = false             // true = tampilkan lagi tombol native "Tap Here!" di bawah kartu menu
if (global.uiTapLink === undefined) global.uiTapLink = false                // true = tap perintah di kartu membuka chat bot dengan perintah terisi (wa.me)

//================= KONTAK =================\\
global.__vxBlocked.ig = 'vnzgg85'
global.__vxBlocked.tele = 'vanXone'
global.__vxBlocked.saluran = 'https://whatsapp.com/channel/0029Vb7JOvhEwEjnQgO8Ui3d'
global.__vxBlocked.wagc = 'https://chat.whatsapp.com/D7SMAUkR1hVE0oFuRSUHtW'
// Auto join Saluran & Grup resmi dikunci (lib/autojoin.js dijaga lib/integrity.js), tidak ada pengaturannya di sini.

//================= GRUP =================\\
if (global.antilink === undefined) global.antilink = { maxWarn: 3 }        // setelah N peringatan pelanggar dikeluarkan (0 = hanya hapus + peringatan)
if (global.warnLimit === undefined) global.warnLimit = 3                    // batas .warn / antibadword sebelum dikeluarkan (bot harus admin)

//================= DOWNLOADER =================\\
if (global.downloader === undefined) global.downloader = {
  maxMB: 80,            // batas ukuran file
  maxImages: 10,        // batas foto/slide per permintaan
  ytQuality: '720',     // 360 / 480 / 720 / 1080
  cobalt: { url: '', apiKey: '' },   // opsional (instance cobalt milikmu)
  scriptmind: true,     // YouTube lewat scriptmind.co
  ytultra: true,        // YouTube lewat ytultra.com
  cobaltPool: true,     // cobalt komunitas (instances.cobalt.best)
  scrapers: true,       // TikTok (mobile API, snaptik) & Instagram (savefromins, instaloadr)
  ytdlp: {
    path: '',           // kosong = otomatis
    cookies: '',        // path cookies.txt (atau kirim lewat .ytcookies)
    proxy: '',          // contoh 'http://user:pass@host:port' (atau .ytdlp proxy)
    autoInstall: true,
    maxMinutes: 30
  }
}

//================= API KEY OPSIONAL (fitur hasil porting ZeroTwo) =================\\
if (global.apiKeys === undefined) global.apiKeys = { kyzz: 'kyzz87061175', azbry: '', siputzx: '' }   // kyzz WAJIB untuk: .brat(black/green/pink/gojo/v2/vermeil/vid*) .qc .ssweb .twitstalk. azbry = .spotifydl (jika API-nya minta kunci)
// ---- API key tambahan untuk fitur hasil porting "plugin_baruuu" (kosongkan = fitur terkait menjawab 'butuh apikey') ----
Object.assign(global.apiKeys, {
  neoxr: 'wva249cmayitsulf0nqevf',     // api.neoxr.eu   -> .attp2 .emojimix .smeme-animated .text2img3 (dan .attp/.emojitoimage/.linesticker dll)
  cuki: '',      // opsional (default bawaan 'cuki-x') -> .gita .wormgpt .starboy .watercolortext .caribug .sendngl
  firefly: '',   // firefly.maiku.my.id -> .text2img .npmstalk .ytstalk
  obscura: '',   // api.obscuraworks.org -> .nikparser
  groq: '',      // console.groq.com (gratis) -> .transkrip
  vercel: '',    // token Vercel -> .deploy (owner)
  shoppanel: 'REDACTED_VX_STRIPE_LIVE_KEY'  // reseller API panel -> .produkpanel .belipanel .cekpay dst. (kategori panel)
})
if (global.APIs === undefined) global.APIs = {                         // alamat dasar API (dipakai plugin baru). Ganti kalau alamat penyedia API berubah
  kyzz: 'https://api.kyzzz.xyz',
  siputzx: 'https://api.siputzx.my.id',
  azbry: 'https://api.azbry.com',
  deline: 'https://api.deline.web.id'   // .bratcewek
}

//================= PLUGIN BARU (hasil port 'plugin baru') =================\\
if (global.ghTokens === undefined) global.ghTokens = 'REDACTED_VX_GH_TOKEN_1'                    // token GitHub (classic, scope: gist + repo) -> .gist .upgh/.url/.cdn .ubah
if (global.userGh === undefined) global.userGh = 'dkzrikyu181-ux'                      // username GitHub pemilik token (repo CDN: cdn1..cdn5 dibuat otomatis)
if (global.tgToken === undefined) global.tgToken = '8496030929:AAE7cy3uAff5E6vD2Ht4yRWP-kTY95Y1iiM'                     // token bot Telegram (dari @BotFather) -> .sticketele
if (global.thumbnail === undefined) global.thumbnail = 'https://raw.githubusercontent.com/dkzrikyu181-ux/cdn3/main/uploads/4a78c9-1792556505530.jpg'                   // URL gambar thumbnail (diganti lewat .ubah thumb)
if (global.fotoreply === undefined) global.fotoreply = 'https://raw.githubusercontent.com/dkzrikyu181-ux/cdn3/main/uploads/4a78c9-1792556505530.jpg'                   // URL gambar reply (diganti lewat .ubah reply)
// global.downloader.loaderKey = ''     // opsional: apikey savenow/loader.to untuk .ytmp3/.ytmp4 (kosong = kunci bawaan)

//================= PAYMENT GATEWAY (AutoOrder QRIS) =================\\
// Docs: https://auto-order.alxzyy.my.id/docs  -> pembayaran QRIS otomatis (order toko, topup saldo bot, premium)
if (global.autoorder === undefined) global.autoorder = {
  apiKey: 'AOC-32B4A15AFEB7511213E8CBD112D2A82A8403BE533F047184',  // X-API-Key dari dashboard AutoOrder (kosong = fitur QRIS otomatis mati)
  baseUrl: 'https://auto-order.alxzyy.my.id/api/v2',
  minTopup: 1000,        // minimal topup saldo bot (Rp). Batas API: 300
  maxTopup: 1000000,     // maksimal sekali bayar (Rp). Batas API: 10.000.000
  topupRate: 1,          // 1 Rp = N saldo bot (money). Contoh 10 -> bayar Rp1.000 dapat 10.000 money
  maxPending: 3,         // maksimal tagihan QRIS yang belum dibayar per user
  premium: { 7: 5000, 30: 15000 },  // paket premium otomatis: { hari: harga Rp }. Kosongkan {} untuk mematikan .premqris
  storageKey: '',        // key Storage (ak_live_...) bila beda dari apiKey; kosong = pakai apiKey
  nokos: true,           // jual nomor virtual OTP (.nokos). Harga dipotong dari saldo bot pembeli, modal dari saldo AutoOrder milikmu
  nokosMarkup: { percent: 10, flat: 0 }   // untung: harga jual = (harga API x (1+percent/100)) + flat, lalu x topupRate jadi saldo bot
}

//================= AI (.ai) =================\\
if (global.ai === undefined) global.ai = {
  provider: 'openai',   // 'openai' (kompatibel OpenAI/OpenRouter/Groq) atau 'anthropic' (Claude resmi)
  url: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',           // ISI DI SINI. Kosong = pakai layanan gratis (Pollinations)
  model: 'gpt-4o-mini', // untuk anthropic mis. 'claude-sonnet-5-5'
  free: { url: 'https://gen.pollinations.ai/v1/chat/completions', model: 'openai' },
  system: 'Kamu adalah vanXone, asisten WhatsApp yang ramah dan membantu. Jawab singkat, jelas, dan dalam bahasa yang dipakai pengguna.'
}

//================= LAIN-LAIN =================\\
if (global.weather === undefined) global.weather = { name: 'Jakarta, Indonesia', lat: -6.2088, lon: 106.8456 }

//================= PESAN BOT =================\\
global.__vxBlocked.mess = {
  error: {
    fitur: 'Hah?! Eror?! 💢 Ini pasti gara-gara kamu yang aneh-aneh! Sana laporin ke Vann (6281220822639) biar dia yang urus! 😤'
  },
  only: {
    group: 'Hmph! 😤 Fitur ini cuma bisa dipake di dalam grup ya! Jangan sok asik mau pake di sini!',
    owner: 'Heh! 💢 Kamu pikir kamu siapa? Cuma *Vann* yang boleh perintah-perintah aku pake fitur ini!',
    admin: 'Sadar diri dong! 😤 Fitur ini khusus buat Admin grup aja. Kamu kan bukan siapa-siapa di sini!',
    badmin: 'Gimana aku mau kerja kalau aku nggak dijadiin Admin? 💢 Cepetan jadiin aku Admin dulu, baru aku bantuin!'
  }
}
