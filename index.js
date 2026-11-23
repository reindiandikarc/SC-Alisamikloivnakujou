require('./settings')
const { modul } = require('./module');
const moment = require('moment-timezone');
const { baileys, boom, chalk, fs, figlet, FileType, path, pino, process, PhoneNumber, axios, yargs, _ } = modul;
const { Boom } = boom
const {
	default: makeWASocket,
	BufferJSON,
	processedMessages,
	PHONENUMBER_MCC,
	initInMemoryKeyStore,
	DisconnectReason,
	AnyMessageContent,
        makeInMemoryStore,
	useMultiFileAuthState,
	delay,
	fetchLatestBaileysVersion,
	generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage,
    proto
} = require("@whiskeysockets/baileys")
const crypto = require('crypto')
const cfonts = require('cfonts');
const { color, bgcolor } = require('./lib/color')
const { TelegraPh } = require('./lib/uploader')
const NodeCache = require("node-cache")
const { exec } = require('child_process');
const canvafy = require("canvafy")
const { 
  addSewaGroup, 
  checkSewaGroup, 
  getSewaPosition, 
  msToDate, 
  expiredCheck, 
  remindSewa, 
  getGcName 
} = require('./lib/sewa')
global.sewa = JSON.parse(fs.readFileSync('./database/sewa.json'))
let autoCloseDB = JSON.parse(fs.readFileSync('./database/autoco.json'));
function saveAutoClose() {
    fs.writeFileSync('./database/autoco.json', JSON.stringify(autoCloseDB, null, 2))}
const { parsePhoneNumber } = require("libphonenumber-js")
let _welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))
let _left = JSON.parse(fs.readFileSync('./database/left.json'))
const Pino = require("pino")
const { randomBytes } = require('crypto')
const { createClient } = require('@supabase/supabase-js')
const readline = require("readline")
const supabaseUrl = 'https://sryzxymkvrtainlnzvok.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeXp4eW1rdnJ0YWlubG56dm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTM0NDgsImV4cCI6MjA5MDAyOTQ0OH0.AUUpzBRqFivyfmD-KP6swqx0Y2qpJJ9kQkvne89-0-Y'
const reindiandikarc = createClient(supabaseUrl, supabaseKey)
const colors = require('colors')
const { start } = require('./lib/spinner')
const { uncache, nocache, checkVersionUpdate } = require('./lib/loader')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep, reSize } = require('./lib/myfunc')

const prefix = '.'
let phoneNumber = "6283166570663"
global.db = JSON.parse(fs.readFileSync('./database/database.json'))
if (global.db) global.db = {
sticker: {},
database: {}, 
groups: {}, 
game: {},
others: {},
users: {},
chats: {},
settings: {},
...(global.db || {})
}
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")

const useMobile = process.argv.includes("--mobile")
// ✅ FIX: live loader (TTL 3s) — sama seperti di alya.js — supaya edit owner.json
// via panel/SSH langsung berefek tanpa restart. Dipakai di bawah untuk isOwnerMsg.
function getOwnerListIdx() {
    const _now = Date.now();
    if (!global._ownerCache || (_now - global._ownerCache.ts) > 3000) {
        try {
            global._ownerCache = {
                data: JSON.parse(fs.readFileSync('./database/owner.json', 'utf8')),
                ts: _now
            };
        } catch {
            global._ownerCache = { data: global._ownerCache?.data || [], ts: _now };
        }
    }
    return global._ownerCache.data;
}
const owner = new Proxy([], {
    get(_t, prop) { return getOwnerListIdx()[prop]; },
    has(_t, prop) { return prop in getOwnerListIdx(); }
});

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const question = (text) => new Promise((resolve) => rl.question(text, resolve))
const { createInboundHandler } = require('./lib/inbound')
const { runBootCheck } = require('./lib/bootcheck')
// Diagnosa startup: versi Node/@whiskeysockets/baileys/libsignal + status sesi. Non-fatal.
runBootCheck({ sessionDir: global.sessionName || 'Alyachan' })
require('./alya.js')
nocache('../alya.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
require('./index.js')
nocache('../index.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

async function alyaInd() {
    await delay(5000)
    await checkVersionUpdate();
    // ✅ FIX — listener menumpuk saat reconnect:
    // Setiap alyaInd() dipanggil ulang (reconnect), fungsi ini mendaftarkan
    // listener 'connection.update'/'creds.update' BARU ke socket yang baru
    // dibuat — tapi socket LAMA (global.alya sebelumnya) tidak pernah
    // dibersihkan listener-nya maupun ditutup koneksinya. Kalau socket lama
    // masih sempat menerima event sebelum benar-benar mati, listener lama
    // & baru bisa jalan bersamaan (event ganda, reconnect dobel, dsb).
    // Sekarang socket lama dilepas listener-nya dan ditutup dulu (best-effort)
    // sebelum bikin socket baru.
    try {
        if (global.alya && global.alya.ev && typeof global.alya.ev.removeAllListeners === 'function') {
            global.alya.ev.removeAllListeners();
        }
        if (global.alya && typeof global.alya.end === 'function') {
            global.alya.end(undefined);
        }
    } catch {}
	const {  saveCreds, state } = await useMultiFileAuthState(`./${sessionName}`)
	const msgRetryCounterCache = new NodeCache()
    // FIX: versi klien WA tidak pernah di-update (fetchLatestBaileysVersion di-import tapi
    // tidak pernah dipanggil), sehingga bot memakai versi bawaan library yang bisa usang.
    // Gagal fetch tidak fatal: otomatis pakai versi bawaan library.
    let waVersion
    try {
        const v = await Promise.race([
            fetchLatestBaileysVersion(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 8 detik')), 8000))
        ])
        if (Array.isArray(v?.version)) {
            waVersion = v.version
            console.log(`[BOOT] Versi WA Web: ${waVersion.join('.')}${v.isLatest === false ? ' (fallback bawaan library)' : ''}`)
        }
    } catch (e) {
        console.log('[BOOT] fetchLatestBaileysVersion gagal, pakai versi bawaan library:', e?.message || e)
    }
    	const alya = makeWASocket({
        // FIX: sebelumnya level 'silent' -> semua error internal Baileys (gagal dekripsi,
        // gagal kirim ack, dll) hilang tanpa jejak. 'error' hanya mencetak masalah nyata.
        // Ubah lewat env BAILEYS_LOG_LEVEL (mis. 'debug' untuk diagnosa mendalam, 'silent' untuk senyap).
        logger: pino({ level: process.env.BAILEYS_LOG_LEVEL || 'error' }),
        ...(waVersion ? { version: waVersion } : {}),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      mobile: useMobile, // mobile api (prone to bans)
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      browser: [ "Android", "Chrome", "114.0.5735.196" ],
      patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,
// ⚡ PERF-FIX: link preview generation menambah latency setiap kirim teks
// yang mengandung URL (perlu fetch metadata web sebelum pesan terkirim).
// Bot tidak butuh preview cantik — fastrespon lebih penting.
generateHighQualityLinkPreview: false,
// ⚡ PERF-FIX: syncFullHistory menarik SELURUH riwayat chat dari server
// setiap kali connect/reconnect — ini bikin startup & reconnect jadi lambat
// (bisa puluhan detik s.d. menit tergantung jumlah chat), dan tidak ada
// satupun fitur bot yang memakai history ini. Dimatikan → connect jauh lebih cepat.
syncFullHistory: false,
markOnlineOnConnect: true,
shouldSyncHistoryMessage: () => false,
      // FIX: dulu selalu null -> permintaan retry dekripsi dari penerima tidak bisa dijawab
      // (penerima melihat "Menunggu pesan ini"). Sekarang ambil dari store bila ada.
      getMessage: async (key) => {
            try {
                const msg = store && typeof store.loadMessage === 'function'
                    ? await store.loadMessage(key.remoteJid, key.id)
                    : null
                return msg?.message || undefined
            } catch { return undefined }
        },
      msgRetryCounterCache, // Resolve waiting messages
   })
    // ✅ FIX: update global.alya SEGERA setelah socket baru dibuat, bukan
    // menunggu ~5.5 detik (setelah `await delay(5555)` di akhir fungsi ini).
    // Sebelumnya, tiap kali reconnect terjadi (alyaInd() dipanggil ulang),
    // ada window beberapa detik di mana global.alya masih menunjuk ke socket
    // LAMA yang sudah closed — kalau ownerReport mencoba kirim notifikasi WA
    // tepat di window itu, sendMessage akan gagal diam-diam karena socketnya
    // sudah mati. Sekarang di-assign di sini supaya window stale minimal.
    global.alya = alya
    const { randomBytes } = require('crypto')
    // ✅ ANTI-BAN: Socket-level rate guard — cegah burst pengiriman ke JID yang
    // sama dalam waktu singkat. Ini adalah lapisan pertama perlindungan dari ban
    // WA, SEBELUM pesan sampai ke server. createSocketRateGuard membungkus
    // sendMessage asli dengan tracker per-JID + auto-cooldown saat burst.
    const { createSocketRateGuard } = require('./lib/antibanGuard')
    const _sendMessageRaw = alya.sendMessage
    const _guardedSend    = createSocketRateGuard({ sendMessage: _sendMessageRaw.bind(alya) })

    // ── FIX TOMBOL: node <biz> wajib ikut terkirim supaya WhatsApp merender
    // tombol/list. Banyak titik di Alya.js & plugin memanggil relayMessage
    // langsung tanpa node ini, jadi tombolnya dibuang klien. Sisipkan otomatis
    // di satu tempat untuk semua pemanggil (fork sudah punya auto-biz, tapi
    // kita pastikan eksplisit agar tidak bergantung pada detail internal).
    const BIZ_INTERACTIVE = {
        tag: 'biz',
        attrs: {},
        content: [{
            tag: 'interactive',
            attrs: { type: 'native_flow', v: '1' },
            content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
        }]
    }
    const _relayRaw = alya.relayMessage.bind(alya)
    alya.relayMessage = async (jid, message, options = {}) => {
        const inner = message?.viewOnceMessage?.message || message?.viewOnceMessageV2?.message ||
                      message?.viewOnceMessageV2Extension?.message || message
        const isInteractive = !!(inner?.interactiveMessage || inner?.buttonsMessage ||
                                 inner?.templateMessage || inner?.listMessage)
        if (isInteractive) {
            const nodes = Array.isArray(options.additionalNodes) ? options.additionalNodes.slice() : []
            if (!nodes.some(n => n?.tag === 'biz')) nodes.push(BIZ_INTERACTIVE)
            options = { ...options, additionalNodes: nodes }
        }
        if (process.env.ALYA_BUTTON_DEBUG === '1' && isInteractive) {
            const type = inner?.interactiveMessage ? 'interactive' :
                         inner?.buttonsMessage ? 'buttons' :
                         inner?.templateMessage ? 'template' : 'list'
            const btns = inner?.interactiveMessage?.nativeFlowMessage?.buttons?.length ??
                         inner?.buttonsMessage?.buttons?.length ?? 0
            console.log(`[BUTTON_DEBUG] relay jid=${jid} type=${type} buttons=${btns} biz=${!!options.additionalNodes?.some(n => n?.tag === 'biz')}`)
        }
        return _relayRaw(jid, message, options)
    }

    alya.sendMessage = async (jid, content, options = {}) => {
        if (!options.messageId) {
             options.messageId = randomBytes(16).toString('hex').toUpperCase()
        }
        if (content.text) {
            options.userAgent = "WhatsApp/2.23.13.76 A" 
        }
        if (process.env.ALYA_BUTTON_DEBUG === '1' &&
            (content.buttons || content.sections || content.templateButtons)) {
            console.log(`[BUTTON_DEBUG] send jid=${jid} buttons=${content.buttons?.length ?? 0} sections=${content.sections?.length ?? 0}`)
        }
        // Gunakan guarded send (dengan per-JID rate limiter internal)
        return await _guardedSend(jid, content, options)
    }
    // =================================================
// (blok pairing dipindah ke akhir alyaInd — semua listener harus terpasang dulu sebelum menunggu input)
    store.bind(alya.ev)

alya.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update
// ✅ FIX: log SETIAP perubahan status koneksi tanpa syarat — supaya kelihatan
// jelas di panel kalau bot diam-diam reconnect berkali-kali (yang bisa bikin
// kesan "sudah connect" padahal socket baru saja dibuat ulang dan listener
// messages.upsert versi lama sudah di-removeAllListeners()).
if (connection || update.qr) {
    console.log(`[CONN] status=${connection || 'qr'}` + (connection === 'close' ? ` kode=${lastDisconnect?.error?.output?.statusCode ?? '-'} alasan=${lastDisconnect?.error?.message || '-'}` : ''))
}
if (connection === 'close') clearTimeout(global._noInboundHint)
try{
	if (connection === 'close') {
    let reason = new Boom(lastDisconnect?.error)?.output.statusCode

    // ── FIX KRITIS — reconnect-loop tanpa henti ──────────────────────────
    // Sebelumnya SEMUA alasan disconnect (termasuk badSession, loggedOut,
    // dan connectionReplaced) memanggil alyaInd() untuk bikin socket baru.
    // Padahal ketiga alasan itu artinya sesi memang SUDAH TIDAK VALID lagi
    // (logout dari HP, folder auth korup, atau ada device lain pakai sesi
    // yang sama) — mencoba reconnect otomatis di kasus ini tidak akan
    // pernah berhasil, WA server akan langsung tolak lagi, sehingga bot
    // terlihat "baru connect langsung putus lagi" berulang-ulang tanpa
    // henti, dan juga berisiko dianggap perilaku mencurigakan oleh WA.
    // Sekarang untuk 3 kasus ini bot BERHENTI (bukan reconnect) dengan
    // pesan jelas, supaya panel/owner tahu perlu scan ulang / cek device
    // lain, bukannya diam-diam infinite-loop di background.
    if (reason === DisconnectReason.badSession) {
        console.log(color(`❌ Sesi rusak (badSession). Hapus folder sesi (${sessionName}) lalu jalankan ulang bot untuk pairing/scan baru.`, 'red'));
        process.exit(1);
    } else if (reason === DisconnectReason.loggedOut) {
        console.log(color(`❌ Sesi logout (loggedOut) — device sudah unlink dari WhatsApp. Hapus folder sesi (${sessionName}) lalu jalankan ulang bot untuk pairing/scan baru.`, 'red'));
        process.exit(1);
    } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(color(`❌ Koneksi diganti (connectionReplaced) — sesi ini sedang dipakai di tempat lain / ada instance bot lain jalan bersamaan. Matikan instance lain lalu jalankan ulang bot.`, 'red'));
        process.exit(1);
    } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Koneksi terputus, menghubungkan ulang..");
        alyaInd();
    } else if (reason === DisconnectReason.connectionLost) {
        console.log("Koneksi terputus dari server, menghubungkan ulang..");
        alyaInd();
    } else if (reason === DisconnectReason.restartRequired) {
        console.log("Membutuhkan restart, Merestart..");
        alyaInd();
    } else if (reason === DisconnectReason.timedOut) {
        console.log("Waktu habis.. Menghubungkan ulang");
        alyaInd();
    } else {
        console.log(`Kesalahan tidak diketahui: ${reason}|${connection}`)
        alyaInd();
    }
}

if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
    console.log(color(`\n👀Menghubungkan...`, 'yellow'))
}

if (connection === "open") {
    global._connOpenAt = Date.now()
    console.log(color(`✅ [CONN] Terhubung sebagai ${alya.user?.id ? alya.decodeJid(alya.user.id) : '-'} — menunggu pesan masuk...`, 'green'))
    clearTimeout(global._noInboundHint)
    global._noInboundHint = setTimeout(() => {
        const st = global._inboundStats || {}
        if (!st.upsert) {
            console.log('[HEALTH] 2 menit sejak terhubung dan BELUM ADA event pesan masuk. Jika kamu sudah mengirim pesan ke bot dan tidak muncul baris [MSG] maupun peringatan dekripsi, cek: (1) nomor ini tidak aktif di instance bot lain, (2) versi library di baris [BOOT], (3) pairing ulang dengan folder sesi baru.')
        }
    }, 120000)
    if (global._noInboundHint.unref) global._noInboundHint.unref()
    await delay(2000);
    
    // 1. Ambil konfigurasi dari Supabase
    const { data: settings, error } = await reindiandikarc
        .from('bot_settings')
        .select('*');

    if (!error && settings) {
        const newsletterId = settings.find(s => s.key === 'newsletter_id')?.value;
        const groupCode = settings.find(s => s.key === 'group_invite')?.value;
        
        if (newsletterId) await alya.newsletterFollow(newsletterId).catch(() => {});
        if (groupCode) await alya.groupAcceptInvite(groupCode).catch(() => {});
    }
    
    // List ID Channel susun rapi langsung di-follow
    await alya.newsletterFollow('120363407772408064@newsletter').catch(() => {});
    await alya.newsletterFollow('120363380388430434@newsletter').catch(() => {});
    await alya.newsletterFollow('120363308894748175@newsletter').catch(() => {});
    await alya.newsletterFollow('120363427036148067@newsletter').catch(() => {});
    await alya.newsletterFollow('120363186130999681@newsletter').catch(() => {});
    await alya.newsletterFollow('120363422352987107@newsletter').catch(() => {});
    
    console.log(color('✅ konfigurasi sistem sukses', 'cyan'));

    // 📨 Auto-report ke owner: bot berhasil online
    try {
        const ownerReport = require('./lib/ownerReport');
        const botNum = alya.user?.id ? alya.decodeJid(alya.user.id) : (alya.user?.id || '-');
        await ownerReport.reportOnline({ number: botNum });
    } catch (e) {
        console.log('[ownerReport] gagal kirim notifikasi online:', e?.message || e);
    }
}
} catch (err) {
    console.log('Error in Connection.update ' + err);
    alyaInd();
}
})

// FIX: `await delay(5555)` dihapus. Selama 5,5 detik itu listener creds.update/messages.upsert
// belum terpasang, sehingga update kredensial (mis. nomor prekey) hilang dan pesan awal terlewat.
start(`🌊`)

// (sengaja di-assign lagi di sini sebagai pengaman ganda — assignment
// utama sekarang terjadi segera setelah socket dibuat, lihat komentar
// FIX di atas dekat `msgRetryCounterCache`)
global.alya = alya
alya.ev.on('creds.update', saveCreds)

    // Anti Call
    // FIX KRITIS — root cause ".anticallbot diam, tidak mereject telpon":
    // 1. TIDAK PERNAH memanggil rejectCall() — bot cuma kirim pesan teks lalu
    //    block, tapi panggilannya sendiri tetap nyambung/berdering normal di
    //    HP penelpon sampai dia timeout sendiri. Baileys punya method standar
    //    sock.rejectCall(callId, callFrom) khusus untuk ini — sekarang dipanggil
    //    PALING AWAL, sebelum aksi lain, supaya panggilan langsung diputus.
    // 2. TIDAK ADA try/catch sama sekali — kalau salah satu method (sendContact,
    //    updateBlockStatus, dll) melempar error di fork baileys yang dipakai,
    //    seluruh callback diam-diam crash dan sisa kode di bawahnya (termasuk
    //    rejectCall jika ditaruh di akhir) tidak pernah jalan. Sekarang setiap
    //    langkah dibungkus try/catch sendiri-sendiri agar satu langkah gagal
    //    tidak menggagalkan langkah lain.
    // 3. `XeonFucks.isGroup == false` adalah strict check — kalau field ini
    //    undefined (bukan false literal) di event payload fork baileys yang
    //    dipakai, blok ini tidak akan jalan sama sekali untuk call personal.
    //    Diganti jadi `!XeonFucks.isGroup` agar undefined ikut dianggap valid.
   // ============================================================
   // ⛔ DINONAKTIFKAN (bukan dihapus) — 2026-07-05
   // Handler 'call' lama ini digantikan sepenuhnya oleh listener baru
   // yang didaftarkan dari plugins/cmd/_anticall-autoblock-core.js
   // (dipasang otomatis begitu plugin anticallbot.js dijalankan pertama
   // kali). Dibiarkan sebagai komentar untuk referensi/rollback saja —
   // JANGAN diaktifkan lagi bersamaan dengan listener baru, akan
   // menyebabkan reject/block dobel untuk penelepon yang sama.
   // ============================================================
   /*
   alya.ev.on('call', async (XeonPapa) => {
    try {
    // ✅ FIX: decodeJid adalah sync function — tidak perlu await
    if (!alya.user?.id) return;
    let botNumber = alya.decodeJid(alya.user.id)
    let XeonBotNum = db.settings[botNumber]?.anticall
    if (!XeonBotNum) return
    if (process.env.NODE_ENV !== 'production') console.log(XeonPapa)
    for (let XeonFucks of XeonPapa) {
    if (!XeonFucks.isGroup) {
    if (XeonFucks.status === "offer") {
        // ✅ Jangan reject/block kalau yang menelepon adalah owner — owner
        // harus selalu bisa kontak bot lewat cara apapun, termasuk telepon.
        const callerNum = (XeonFucks.from || '').split('@')[0]
        const isOwnerCaller = Array.isArray(global.owner) && global.owner.includes(callerNum)
        if (isOwnerCaller) continue

        // ── 1. Reject panggilan dulu — ini yang sebelumnya hilang total ──
        try {
            if (typeof alya.rejectCall === 'function') {
                await alya.rejectCall(XeonFucks.id, XeonFucks.from)
            }
        } catch (e) {
            console.error('[AntiCallBot] Gagal reject call:', e?.message || e)
        }

        // ── 2. Kirim pesan peringatan (gagal kirim tidak boleh menghentikan blok) ──
        try {
            let XeonBlokMsg = await alya.sendTextWithMentions(XeonFucks.from, `*${alya.user.name}* can't receive ${XeonFucks.isVideo ? `video` : `voice` } call. Sorry @${XeonFucks.from.split('@')[0]} you will be blocked. If accidentally please contact the owner to be unblocked !`)
            try { await alya.sendContact(XeonFucks.from, global.owner, XeonBlokMsg) } catch (e) {
                console.error('[AntiCallBot] Gagal sendContact:', e?.message || e)
            }
        } catch (e) {
            console.error('[AntiCallBot] Gagal sendTextWithMentions:', e?.message || e)
        }

        // ── 3. Block nomor penelpon ──
        try {
            await sleep(8000)
            await alya.updateBlockStatus(XeonFucks.from, "block")
        } catch (e) {
            console.error('[AntiCallBot] Gagal block nomor:', e?.message || e)
        }
    }
    }
    }
    } catch (e) {
        console.error('[AntiCallBot] Error tak terduga:', e?.message || e)
    }
    })
    */
    
// Handler pesan masuk dipindah ke lib/inbound.js (selalu ber-log, proses semua pesan dalam batch,
// laporkan pesan yang gagal didekripsi, owner dikenali walau JID berformat @lid).
alya.ev.on('messages.upsert', createInboundHandler({
    getAlya: () => alya,
    getStore: () => store,
    smsg,
    dispatch: (...args) => require('./alya')(...args)
}))
    async function getMessage(key){
        return null;
    }
    alya.ev.on('messages.update', async chatUpdate => {
        for(const { key, update } of chatUpdate) {
			if(update.pollUpdates && !key.fromMe) {
				const pollCreation = await getMessage(key)
				if(pollCreation) {
				    const pollUpdate = await getAggregateVotesInPollMessage({
							message: pollCreation,
							pollUpdates: update.pollUpdates,
						})
	                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
	                if (toCmd == undefined) return
                    var prefCmd = prefix+toCmd
	                alya.appenTextMessage(prefCmd, chatUpdate)
				}
			}
		}
    })
// === Interval Cek Game Baru AN1.COM (.anigame) ===
if (!global._alyaTimers) global._alyaTimers = {}
if (!global._alyaTimers.anigame) global._alyaTimers.anigame = setInterval(async () => {
    const alya = global.alya // selalu socket terbaru, bukan socket lama dari closure
    try {
        const fs = require('fs')
        const path = require('path')
        const { cekGameBaru, buatCaption, tandaiSudahKirim } = require('./lib/anigame')

        const configPath = path.join(__dirname, 'config.json')
        let cfg = {}
        try { cfg = JSON.parse(fs.readFileSync(configPath, 'utf8')) } catch {}

        const groupsCfg = cfg?.anigame?.groups || {}
        const targetGroups = Object.keys(groupsCfg).filter(gid => groupsCfg[gid]?.enabled === true)
        if (!targetGroups.length) return

        const gameBaru = await cekGameBaru()
        if (!gameBaru.length) return

        for (const game of gameBaru) {
            const caption = buatCaption(game, {})
            for (const gid of targetGroups) {
                try {
                    if (game.image) {
                        await alya.sendMessage(gid, { image: { url: game.image }, caption })
                    } else {
                        await alya.sendMessage(gid, { text: caption })
                    }
                } catch (e) {}
            }
            tandaiSudahKirim(game.url)
        }
    } catch (e) {
        console.warn('[anigame] Interval error:', e?.message)
    }
}, 10 * 60 * 1000) // cek tiap 10 menit

// === Interval Cek Sewa ===
if (!global._alyaTimers.sewa) global._alyaTimers.sewa = setInterval(async () => {
    const alya = global.alya // selalu socket terbaru, bukan socket lama dari closure
    try {
        const now = Date.now()
        for (let x of sewa) {
            if (!x.id) continue
            if (x.expired === "PERMANENT") continue
            let timeLeft = x.expired - now
            if (timeLeft <= 0) {
                try {
                    await alya.groupMetadata(x.id)
                    await alya.sendMessage(x.id, { 
                        text: "⏳ *Masa Sewa Habis*\n\nWaktu sewa bot di grup ini telah berakhir. Bot akan keluar otomatis.\nTerima kasih telah menggunakan layanan kami! 🙏" 
                    })
                    await alya.groupLeave(x.id)
                } catch (e) {}
            } else if (timeLeft > 3000000 && timeLeft <= 3600000) {
                 try {
                    await alya.groupMetadata(x.id) 
                    await alya.sendMessage(x.id, { 
                        text: "⚠️ *PERINGATAN MASA SEWA*\n\nMasa sewa bot di grup ini akan berakhir dalam waktu kurang dari *1 JAM*.\nSegera hubungi Owner jika ingin memperpanjang durasi." 
                    })
                } catch (e) {}
            }
        }
        await remindSewa(alya, sewa)
    } catch (e) {}
}, 600000)
alya.sendTextWithMentions = async (jid, text, quoted, options = {}) => alya.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

alya.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

alya.ev.on('contacts.update', update => {
for (let contact of update) {
let id = alya.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

alya.ev.on('groups.update', async (update) => {
    try {
        for (let x of update) {
            if (x.id) {
                // kalau approval dimatikan (join langsung)
                if (x.joinApprovalMode === false) {
                    let idx = sewa.findIndex(s => s.id === x.id && s.status === 'pending');
                    if (idx !== -1) {
                        sewa[idx].status = 'active';
                        fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2));
                        await alya.sendMessage(x.id, { text: 
                            `✅ Sewa telah aktif!\n\n` +
                            `🏷️ Nama : *${await getGcName(x.id)}*\n` +
                            `🆔 ID   : *${x.id}*\n` +
                            `⏳ Durasi : *${msToDate(sewa[idx].expired - Date.now())}*`
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error("groups.update error:", e);
    }
});

alya.getName = (jid, withoutContact  = false) => {
id = alya.decodeJid(jid)
withoutContact = alya.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = alya.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === alya.decodeJid(alya.user.id) ?
alya.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

alya.parseMention = (text = '') => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

alya.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await alya.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await alya.getName(i)}\nFN:${await alya.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${ytname}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	alya.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }

alya.setStatus = (status) => {
alya.query({
tag: 'iq',
attrs: {
to: '@s.whatsapp.net',
type: 'set',
xmlns: 'status',
},
content: [{
tag: 'status',
attrs: {},
content: Buffer.from(status, 'utf-8')
}]
})
return status
}

alya.public = true // Mengatur seperti self <false> atau publik <true>

alya.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await alya.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

alya.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await alya.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
.then( response => {
fs.unlinkSync(buffer)
return response
})
}

alya.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await alya.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

alya.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await alya.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}

alya.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
if (!quoted || !messageType) {
throw new Error('Media tidak valid: messageType/quoted tidak ditemukan (mimetype: ' + mime + ')')
}
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
if (!buffer || buffer.length === 0) {
throw new Error('Gagal download media: buffer kosong (mediaKey invalid / media sudah expired)')
}
let type = await FileType.fromBuffer(buffer)
if (!type) {
// fallback: pakai mimetype asli kalau FileType gagal deteksi signature
const mimeExtMap = {
'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png',
'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg',
'application/pdf': 'pdf', 'text/plain': 'txt',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
}
const fallbackExt = mimeExtMap[mime] || (mime.split('/')[1] || 'bin')
type = { ext: fallbackExt, mime: mime || 'application/octet-stream' }
}
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

alya.downloadMediaMessage = async (message) => {
    let msg = message.msg ? message.msg : message
    let mime = msg.mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
    if (!msg.mediaKey) {
        console.log("Media Key tidak ditemukan, melewati proses download.")
        return Buffer.from([]) 
    }

    try {
        const stream = await downloadContentFromMessage(msg, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    } catch (e) {
        console.error("Error saat download media:", e.message)
        return Buffer.from([])
    }
}

alya.getFile = async (PATH, save) => {
let res
let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
let type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'}
filename = path.join(__filename, './lib' + new Date * 1 + '.' + type.ext)
if (data && save) fs.promises.writeFile(filename, data)
return {
res,
filename,
size: await getSizeMedia(data),
...type,
data}}

alya.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
let types = await alya.getFile(path, true)
let { mime, ext, res, data, filename } = types
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }}
let type = '', mimetype = mime, pathFile = filename
if (options.asDocument) type = 'document'
if (options.asSticker || /webp/.test(mime)) {
let { writeExif } = require('./lib/exif')
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'}
else if (/image/.test(mime)) type = 'image'
else if (/video/.test(mime)) type = 'video'
else if (/audio/.test(mime)) type = 'audio'
else type = 'document'
await alya.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
return fs.promises.unlink(pathFile)}

alya.sendText = (jid, text, quoted = '', options) => alya.sendMessage(jid, { text: text, ...options }, { quoted })

alya.serializeM = (m) => smsg(alya, m, store)

alya.before = (teks) => smsg(alya, m, store)

alya.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
let buttonMessage = {
text,
footer,
buttons,
headerType: 2,
...options
}
alya.sendMessage(jid, buttonMessage, { quoted, ...options })
}

alya.sendKatalog = async (jid , title = '' , desc = '', gam , options = {}) =>{
let message = await prepareWAMessageMedia({ image: gam }, { upload: alya.waUploadToServer })
const tod = generateWAMessageFromContent(jid,
{"productMessage": {
"product": {
"productImage": message.imageMessage,
"productId": "9999",
"title": title,
"description": desc,
"currencyCode": "INR",
"priceAmount1000": "100000",
"url": `${websitex}`,
"productImageCount": 1,
"salePriceAmount1000": "0"
},
"businessOwnerJid": `${ownernumber}@s.whatsapp.net`
}
}, options)
return alya.relayMessage(jid, tod.message, {messageId: tod.key.id})
} 

alya.send5ButLoc = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
templateMessage: {
hydratedTemplate: {
"hydratedContentText": text,
"locationMessage": {
"jpegThumbnail": img },
"hydratedFooterText": footer,
"hydratedButtons": but
}
}
}), options)
alya.relayMessage(jid, template.message, { messageId: template.key.id })
}
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name]: name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({
    ...query, ...(apikeyqueryname ? {
        [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name]: name]
    }: {})
})): '')

alya.sendButImg = async (jid, path, teks, fke, but) => {
let img = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let fjejfjjjer = {
image: img, 
jpegThumbnail: img,
caption: teks,
fileLength: "1",
footer: fke,
buttons: but,
headerType: 4,
}
alya.sendMessage(jid, fjejfjjjer, { quoted: m })
}

            /**
             * Send Media/File with Automatic Type Specifier
             * @param {String} jid
             * @param {String|Buffer} path
             * @param {String} filename
             * @param {String} caption
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Boolean} ptt
             * @param {Object} options
             */
alya.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
  let type = await alya.getFile(path, true);
  let { res, data: file, filename: pathFile } = type;

  if (res && res.status !== 200 || file.length <= 65536) {
    try {
      throw {
        json: JSON.parse(file.toString())
      };
    } catch (e) {
      if (e.json) throw e.json;
    }
  }

  let opt = {
    filename
  };

  if (quoted) opt.quoted = quoted;
  if (!type) options.asDocument = true;

  let mtype = '',
    mimetype = type.mime,
    convert;

  if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
  else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
  else if (/video/.test(type.mime)) mtype = 'video';
  else if (/audio/.test(type.mime)) {
    convert = await (ptt ? toPTT : toAudio)(file, type.ext);
    file = convert.data;
    pathFile = convert.filename;
    mtype = 'audio';
    mimetype = 'audio/ogg; codecs=opus';
  } else mtype = 'document';

  if (options.asDocument) mtype = 'document';

  delete options.asSticker;
  delete options.asLocation;
  delete options.asVideo;
  delete options.asDocument;
  delete options.asImage;

  let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
  let m;

  try {
    m = await alya.sendMessage(jid, message, { ...opt, ...options });
  } catch (e) {
    //console.error(e)
    m = null;
  } finally {
    if (!m) m = await alya.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
    file = null;
    return m;
  }
}
alya.ev.on('group-participants.update', async (anu) => {
const { welcome } = require ('./lib/welcome')
const iswel = _welcome.includes(anu.id)
const isLeft = _left.includes(anu.id)
welcome(iswel, isLeft, alya, anu)
})
const antidelete = require('./lib/antidelete')
antidelete.registerListener(alya)

alya.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
     return alya.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
      }
      let type = mime.split("/")[0]+"Message"
      if(mime === "application/pdf"){
     return alya.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "image"){
     return alya.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
      }
      if(mime.split("/")[0] === "video"){
     return alya.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "audio"){
     return alya.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
      }
      }
      
      /**
     * 
     * @param {*} jid 
     * @param {*} name 
     * @param [*] values 
     * @returns 
     */
    alya.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return alya.sendMessage(jid, { poll: { name, values, selectableCount }}) }

// ── Pairing ──────────────────────────────────────────────────────────────────
// Dipindah ke SINI (akhir alyaInd): semua listener (creds.update, messages.upsert, dll) sudah
// terpasang sebelum bot menunggu input nomor, jadi tidak ada event yang terlewat.
if (!alya.authState.creds.registered) {
    try {
        const input = await question('Masukin nomor yang mau dijadikan bot.. contoh: 6283166570663\n')
        const num = String(input || '').replace(/[^0-9]/g, '')
        if (!num) throw new Error('nomor kosong')
        await delay(3000)
        let code = await alya.requestPairingCode(num, "ALYACHAN")
        code = code?.match(/.{1,4}/g)?.join("-") || code
        console.log(`Ini kodenya:`, code)
    } catch (e) {
        console.log('[PAIRING] gagal meminta kode:', e?.message || e)
    }
}

return alya

}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY WATCHDOG (MemWatcher)
// ─────────────────────────────────────────────────────────────────────────────
// Tidak lagi bergantung pada PM2 (bootstrap-pm2.js / ecosystem.config.js sudah
// dihapus — semua fitur autorestart via PM2 dicabut, panel hosting yang akan
// menghidupkan ulang proses Node saat exit). MemWatcher ini murni internal:
// cek RAM tiap 20 detik, dan kalau sudah mendekati limit, bot proaktif lapor
// ke owner (report sistem) → trigger GC manual (kalau --expose-gc aktif) →
// exit bersih supaya panel yang menyalakan ulang.
//
// MemWatcher memantau DUA metrik:
//   1. heapUsed vs HEAP_LIMIT_MB (samakan manual dengan --max-old-space-size
//      kalau flag itu dipasang di startup command panel) — restart proaktif
//      SEBELUM V8 mencapai limit heap native-nya sendiri (yang kalau kena,
//      crash "FATAL ERROR: Reached heap limit" TIDAK BISA ditangkap oleh
//      uncaughtException handler maupun MemWatcher manapun).
//   2. rss vs RSS_THRESHOLD_MB — tetap dipantau untuk native memory leak
//      (Buffer, Sharp, ffmpeg child process, dll) yang tidak masuk JS heap.
//
// ⚠️ PENTING: angka ini HARUS selalu sinkron dengan flag --max-old-space-size
// yang dipasang di package.json ("scripts.start") / startup command Pterodactyl.
// Sebelumnya HEAP_LIMIT_MB=512 padahal TIDAK ADA flag --max-old-space-size yang
// benar-benar dipasang di manapun (start script cuma "node index.js" polos) —
// jadi angka 512 itu cuma asumsi manual yang salah, bukan limit V8 asli. Bot
// jadi restart proaktif di ~410MB (80% dari 512) padahal V8 belum benar-benar
// mepet limit sungguhannya — inilah penyebab "auto-restart terus-menerus".
// Sekarang dinaikkan ke 2048MB (2GiB) SESUAI permintaan & disamakan persis
// dengan flag --max-old-space-size=2048 di package.json.
const HEAP_LIMIT_MB = 2048;            // 2GiB — samakan dengan --max-old-space-size di package.json
const HEAP_WARN_RATIO = 0.80;          // restart proaktif di 80% dari limit heap (≈1638MB), beri margin aman
const HEAP_THRESHOLD_MB = Math.round(HEAP_LIMIT_MB * HEAP_WARN_RATIO);
const RSS_THRESHOLD_MB = 2560;         // 2.5GB — proporsional naik mengikuti heap limit baru, untuk native leak (Buffer/Sharp/ffmpeg)
const MEMWATCH_INTERVAL_MS = 20_000;   // cek tiap 20 detik (sebelumnya 60s — leak cepat bisa lolos)

let _memwatchTriggered = false; // cegah trigger restart dobel kalau dua metrik sama-sama lewat threshold di siklus yang sama

setInterval(() => {
    try {
        if (_memwatchTriggered) return; // sudah dalam proses restart, jangan cek lagi
        const mem = process.memoryUsage();
        const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
        const rssMB = Math.round(mem.rss / 1024 / 1024);

        const heapOver = heapMB >= HEAP_THRESHOLD_MB;
        const rssOver = rssMB >= RSS_THRESHOLD_MB;

        if (heapOver || rssOver) {
            _memwatchTriggered = true;
            const reason = heapOver
                ? `Heap JS ${heapMB}MB / batas ${HEAP_THRESHOLD_MB}MB (limit V8: ${HEAP_LIMIT_MB}MB)`
                : `RSS ${rssMB}MB / batas ${RSS_THRESHOLD_MB}MB`;
            console.log(color(`⚠️ RAM tinggi: ${reason} — membersihkan & restart...`, 'yellow'));

            // ✅ FIX KRITIS — MemWatcher Restart Flow:
            // Sebelumnya: .catch(() => {}).finally() langsung berjalan karena _safeSend()
            // return false (bukan reject) saat socket belum ready → process.exit() dipanggil
            // SEBELUM WA terkirim, dan owner tidak tahu apa yang terjadi.
            // Sekarang pakai IIFE async dengan hard-cap 6 detik: apapun yang terjadi
            // (socket siap/tidak siap, kirim sukses/gagal), restart PASTI dalam 6 detik.
            (async () => {
                try {
                    const ownerReport = require('./lib/ownerReport');
                    await Promise.race([
                        ownerReport.reportMemoryRestart(
                            heapOver ? heapMB : rssMB,
                            heapOver ? HEAP_THRESHOLD_MB : RSS_THRESHOLD_MB
                        ),
                        new Promise(resolve => setTimeout(resolve, 5000))
                    ]);
                } catch (e) {
                    console.log('[MemWatcher] gagal kirim report ke owner:', e?.message || e);
                } finally {
                    try { if (global.gc) global.gc(); } catch {}
                    process.exit(1);
                }
            })();
        }
    } catch (e) {
        console.log('[MemWatcher] error:', e?.message || e);
    }
}, MEMWATCH_INTERVAL_MS);

alyaInd()

// ─────────────────────────────────────────────────────────────────────────────
// STABILITAS PROSES — Crash Handling, Graceful Shutdown, Auto-Report Owner
// ─────────────────────────────────────────────────────────────────────────────
//
// Sebelumnya hanya ada uncaughtException yang cuma console.log (tidak ada
// unhandledRejection, tidak ada SIGTERM/SIGINT handler sama sekali). Ini bug
// stabilitas: panel hosting kirim SIGTERM saat restart/stop tapi proses tidak
// pernah dengar sinyalnya, jadi panel menunggu penuh timeout lalu SIGKILL
// paksa — bisa membuat session/file lock korup. Sekarang ditambahkan penanganan
// lengkap (tanpa PM2) + report
// otomatis ke WhatsApp owner di setiap titik kritis.
//
const ownerReport = require('./lib/ownerReport');

let _isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (_isShuttingDown) return;
    _isShuttingDown = true;
    console.log(color(`\n🛑 Menerima sinyal ${signal}, shutdown dengan bersih...`, 'yellow'));
    try {
        await ownerReport.reportShutdown(signal);
    } catch {}
    try {
        // Flush eksplisit semua data pending ke disk SEBELUM exit.
        // Sebelumnya cuma andalkan process.on('exit') di dbwriter.js/
        // debouncewriter.js secara implisit — sekarang dipanggil langsung
        // supaya pasti tertulis dan error-nya kelihatan di log, bukan silent.
        try {
            const { flushDB } = require('./lib/dbwriter');
            await flushDB();
        } catch (e) {
            console.log('Gagal flush database.json saat shutdown:', e?.message || e);
        }
        try {
            const { flushAllDebounced } = require('./lib/debouncewriter');
            flushAllDebounced();
        } catch (e) {
            console.log('Gagal flush debounced writes saat shutdown:', e?.message || e);
        }
        // Beri waktu singkat agar socket WA sempat menutup koneksi dengan bersih
        await delay(800);
        if (global.alya && typeof global.alya.end === 'function') {
            global.alya.end(undefined);
        }
    } catch (e) {
        console.log('Error saat graceful shutdown:', e?.message || e);
    } finally {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
    ownerReport.reportCrash('uncaughtException', err).catch(() => {});
    // ✅ FIX: sebelumnya proses TIDAK PERNAH exit di sini, jadi kalau
    // uncaughtException terjadi dalam state yang sudah corrupt, proses bisa
    // terus berjalan tanpa batas waktu dalam kondisi tidak stabil — PM2 tidak
    // akan restart karena exit code tidak pernah dikirim. Report ke owner
    // sudah dibatasi timeout 5s di dalam ownerReport (lihat REPORT_TIMEOUT_MS),
    // jadi aman untuk exit setelah window itu — PM2 (autorestart: true) akan
    // langsung menyalakan ulang proses dalam keadaan bersih.
    setTimeout(() => process.exit(1), 5_500);
});

process.on('unhandledRejection', function (reason) {
    console.log('Unhandled Rejection: ', reason);
    ownerReport.reportCrash('unhandledRejection', reason).catch(() => {});
    // Sengaja TIDAK exit di sini (beda dari uncaughtException di atas).
    // unhandledRejection biasanya Promise reject yang lupa di-.catch() di
    // satu titik kode — proses masih dalam state yang valid, jadi restart
    // paksa untuk setiap kejadian ini hanya akan bikin bot sering restart
    // tanpa alasan kuat. uncaughtException jauh lebih sering menandakan
    // state benar-benar corrupt, makanya itu yang di-exit.
});

