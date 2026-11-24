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
    downloadMediaMessage,
    getContentType,
    jidDecode,
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage,
    proto
} = require("@whiskeysockets/baileys")
const crypto = require('crypto')
const viewonce = require('./lib/viewonce')


const rvoDetect = require('./lib/rvo-detect')
const rvoRecover = require('./lib/rvo-recover')
const rvoPlaceholder = require('./lib/rvo-placeholder')
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

runBootCheck({ sessionDir: global.sessionName || 'Alyachan' })
require('./alya.js')
nocache('../alya.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
require('./index.js')
nocache('../index.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

async function alyaInd() {
    await delay(5000)
    await checkVersionUpdate();
    
    
    
    
    
    
    
    
    
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
        
        
        
        logger: pino({ level: process.env.BAILEYS_LOG_LEVEL || 'error' }),
        ...(waVersion ? { version: waVersion } : {}),
        printQRInTerminal: !pairingCode, 
      mobile: useMobile, 
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
defaultQueryTimeoutMs: undefined, 
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,



generateHighQualityLinkPreview: false,




syncFullHistory: false,
markOnlineOnConnect: true,
shouldSyncHistoryMessage: () => false,
      
      
      getMessage: async (key) => {
            try {
                const msg = store && typeof store.loadMessage === 'function'
                    ? await store.loadMessage(key.remoteJid, key.id)
                    : null
                return msg?.message || undefined
            } catch { return undefined }
        },
      msgRetryCounterCache, 
   })
    
    
    
    
    
    
    
    global.alya = alya
    const { randomBytes } = require('crypto')
    
    
    
    
    const { createSocketRateGuard } = require('./lib/antibanGuard')
    const _sendMessageRaw = alya.sendMessage
    const _guardedSend    = createSocketRateGuard({ sendMessage: _sendMessageRaw.bind(alya) })

    
    
    
    
    
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
        
        return await _guardedSend(jid, content, options)
    }
    

    store.bind(alya.ev)







const MEDIA_CACHE_FILE = path.join(__dirname, 'database', 'media-cache.json')
try {
    global._mediaCache = JSON.parse(fs.readFileSync(MEDIA_CACHE_FILE, 'utf8'))
} catch { global._mediaCache = {} }







const VO_CACHE_DIR = path.join(__dirname, 'database', 'viewonce-cache')
try { fs.mkdirSync(VO_CACHE_DIR, { recursive: true }) } catch {}
const _voSafeId = (id) => String(id || '').replace(/[^a-zA-Z0-9_-]/g, '')
global._viewonceBuffer = {
    get(id) {
        try {
            const p = path.join(VO_CACHE_DIR, _voSafeId(id) + '.bin')
            return fs.existsSync(p) ? fs.readFileSync(p) : null
        } catch { return null }
    },
    
    
    latest() {
        try {
            const metas = fs.readdirSync(VO_CACHE_DIR)
                .filter(f => f.endsWith('.bin.json'))
                .map(f => {
                    try { return { f, ...JSON.parse(fs.readFileSync(path.join(VO_CACHE_DIR, f), 'utf8')) } }
                    catch { return null }
                })
                .filter(Boolean)
                .filter(meta => meta.vo === true)
                .sort((a, b) => (b.ts || 0) - (a.ts || 0))
            for (const meta of metas) {
                const buf = global._viewonceBuffer.get(meta.id)
                if (buf?.length) return { id: meta.id, buffer: buf, mime: meta.mime || '', ts: meta.ts, vo: !!meta.vo, type: meta.type || '' }
            }
        } catch {}
        return null
    },
    put(id, buffer, mime = '', extra = {}) {
        try {
            const safe = _voSafeId(id)
            if (!safe || !buffer?.length || buffer.length > 12 * 1024 * 1024) return
            const p = path.join(VO_CACHE_DIR, safe + '.bin')
            fs.writeFileSync(p, buffer)
            fs.writeFileSync(p + '.json', JSON.stringify({ id, mime, ts: Date.now(), vo: !!extra.vo, type: extra.type || '' }))
            
            const metas = fs.readdirSync(VO_CACHE_DIR)
                .filter(f => f.endsWith('.bin.json'))
                .map(f => {
                    try { return { f, ts: JSON.parse(fs.readFileSync(path.join(VO_CACHE_DIR, f), 'utf8')).ts || 0 } }
                    catch { return { f, ts: 0 } }
                })
                .sort((a, b) => b.ts - a.ts)
            const drop = (f) => {
                try {
                    fs.unlinkSync(path.join(VO_CACHE_DIR, f))
                    fs.unlinkSync(path.join(VO_CACHE_DIR, f.replace(/\.json$/, '')))
                } catch {}
            }
            for (const { f } of metas.slice(200)) drop(f)
            
            
            const MAX_TOTAL = 300 * 1024 * 1024
            let total = 0
            const bins = fs.readdirSync(VO_CACHE_DIR)
                .filter(f => f.endsWith('.bin'))
                .map(f => {
                    try {
                        const st = fs.statSync(path.join(VO_CACHE_DIR, f))
                        return { f, size: st.size, ts: st.mtimeMs }
                    } catch { return null }
                })
                .filter(Boolean)
                .sort((a, b) => b.ts - a.ts)
            for (const b of bins) total += b.size
            for (const b of bins) {
                if (total <= MAX_TOTAL) break
                drop(b.f + '.json')
                total -= b.size
            }
        } catch {}
    }
}
let _mediaCacheTimer = null
function _scheduleMediaCacheSave() {
    clearTimeout(_mediaCacheTimer)
    _mediaCacheTimer = setTimeout(() => {
        try { fs.writeFileSync(MEDIA_CACHE_FILE, JSON.stringify(global._mediaCache)) } catch {}
    }, 1500)
}




if (!global._rvoCache) global._rvoCache = new Map()
if (!global._rvoCacheMeta) global._rvoCacheMeta = new Map()

if (!global._rvoPending) global._rvoPending = new Map()
const _RVO_CACHE_LIMIT = 300



const {
    WRAPPERS: _RVO_WRAPPERS,
    ensureBuffer: _rvoEnsureBuffer,
    unwrapEnvelopes: _rvoUnwrap,
    scanForViewOnceMedia,
    findAnyMedia,
    contentHasViewOnce,
    hasViewOnceSignal,
    cacheRvoMedia,
} = rvoDetect






const RAW_BACKUP_FILE = path.join(__dirname, 'database', 'raw-backup.json')
const RAW_BACKUP_LIMIT = 500
const RAW_BACKUP_TTL = 6 * 60 * 60 * 1000
try {
    global._rawBackup = rvoRecover.loadRawBackup(JSON.parse(fs.readFileSync(RAW_BACKUP_FILE, 'utf8')))
} catch { global._rawBackup = new Map() }
let _rawBackupTimer = null
function _scheduleRawBackupSave() {
    clearTimeout(_rawBackupTimer)
    _rawBackupTimer = setTimeout(() => {
        try { fs.writeFileSync(RAW_BACKUP_FILE, JSON.stringify([...global._rawBackup])) } catch {}
    }, 2000)
}
function _saveRawBackup(msg) {
    const id = msg?.key?.id
    if (!id || !msg?.message || global._rawBackup.has(id)) return
    const now = Date.now()
    for (const [key, entry] of global._rawBackup) {
        if (now - (Number(entry.ts) || 0) > RAW_BACKUP_TTL) global._rawBackup.delete(key)
    }
    global._rawBackup.set(id, {
        jid: msg.key.remoteJid || '',
        participant: msg.key.participant || '',
        message: msg.message,
        ts: now,
    })
    while (global._rawBackup.size > RAW_BACKUP_LIMIT) {
        global._rawBackup.delete(global._rawBackup.keys().next().value)
    }
    _scheduleRawBackupSave()
}
function _flushRawBackup() {
    clearTimeout(_rawBackupTimer)
    try { fs.writeFileSync(RAW_BACKUP_FILE, JSON.stringify([...global._rawBackup])) } catch {}
}
process.on('SIGINT', _flushRawBackup)
process.on('SIGTERM', _flushRawBackup)

alya.ev.on('messages.upsert', ({ messages, type: upsertType }) => {
    for (const msg of messages || []) {
        try {
            const id = msg?.key?.id
            const raw = msg?.message
            if (!raw || !id) {
                if (!raw && id) {
                    const debugOn = process.env.ALYA_BUTTON_DEBUG === '1'
                    if (debugOn) console.log(`[RVO diag] pesan TANPA konten ${rvoPlaceholder.describe(msg)}`)

                    
                    
                    
                    
                    
                    const tracked = rvoPlaceholder.trackPending(global._rvoPending, msg)
                    if (tracked.request) {
                        const p = tracked.pending
                        Promise.resolve()
                            .then(() => alya.requestPlaceholderResend(p.key, p.msgData))
                            .then(requestId => {
                                if (requestId && requestId !== 'RESOLVED') p.requestId = requestId
                                console.log(`[RVO resend] diminta id=${id} requestId=${requestId || '-'}`)
                            })
                            .catch(err => console.log(`[RVO resend] gagal id=${id} ${err?.message || err}`))
                    }
                }
                continue
            }
            
            
            
            if (id && global._rvoPending?.has(id)) global._rvoPending.delete(id)
            _saveRawBackup(msg)
            
            const _topKeys = Object.keys(raw).filter(k => k !== 'messageContextInfo')
            const _plain = ['conversation', 'extendedTextMessage', 'protocolMessage', 'reactionMessage',
                            'senderKeyDistributionMessage', 'pollUpdateMessage']
            if (_topKeys.length && !_topKeys.every(k => _plain.includes(k))) {
                console.log(`[RVO diag] id=${id} upsert=${upsertType ?? '-'} keys=${_topKeys.join(',')}`)
            }

            
            
            
            let found = scanForViewOnceMedia(raw, {
                log: (line) => { if (process.env.ALYA_BUTTON_DEBUG === '1') console.log(line) }
            })
            let vo = found?.viewOnce === true
            if (!found) {
                
                const byContent = contentHasViewOnce(raw)
                found = findAnyMedia(raw, { requireVO: false })
                if (found && byContent && !found.viewOnce) {
                    found.viewOnce = true
                    found.detectedByContent = true
                }
                if (!found) continue
            }
            
            
            
            vo = vo || found.viewOnce === true || hasViewOnceSignal(raw)
            const { type, content } = found
            console.log(`[RVO diag] ${vo ? 'view-once terdeteksi' : 'media biasa'} id=${id} type=${type} ` +
                        `viewOnce=${String(content?.viewOnce)} isViewOnce=${String(vo)} ` +
                        `detectedByContent=${String(!!found.detectedByContent)} ` +
                        `mediaKey=${!!(content?.mediaKey && content.mediaKey.length)} ` +
                        `fromMe=${!!msg.key.fromMe}`)

            
            global._mediaCache[id] = { jid: msg.key.remoteJid, message: msg.message }
            _scheduleMediaCacheSave()

            
            
            
            const entry = cacheRvoMedia({
                detected: found,
                id,
                chat: msg.key.remoteJid || '',
                sender: msg.key.participant || msg.key.remoteJid || 'unknown',
                fromMe: !!msg.key.fromMe,
                cache: global._rvoCache,
                cacheMeta: global._rvoCacheMeta,
                limit: _RVO_CACHE_LIMIT,
            })

            
            
            const mediaKey = _rvoEnsureBuffer(content.mediaKey)
            if (!mediaKey?.length) {
                console.log(`[RVO cache] mediaKey kosong saat masuk. id=${id} type=${type}`)
                continue
            }
            
            
            
            
            
            
            Promise.resolve()
                .then(async () => {
                    const stream = await downloadContentFromMessage(content, type.replace('Message', '').toLowerCase())
                    const chunks = []
                    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
                    return Buffer.concat(chunks)
                })
                .catch(async () => {
                    
                    const buf = await downloadMediaMessage(msg, 'buffer', {})
                    if (buf?.length) return buf
                    return downloadMediaMessage({ key: msg.key, message: _rvoUnwrap(raw) }, 'buffer', {})
                })
                .then(buf => {
                    if (!buf?.length) return
                    entry.buffer = buf
                    if (vo || !msg.key.fromMe) {
                      global._viewonceBuffer.put(id, buf, entry.mimetype, { vo, type, fromMe: !!msg.key.fromMe })
                    }
                    console.log(`[VIEWONCE] buffer tersimpan id=${id} bytes=${buf.length} mime=${entry.mimetype || '-'} jid=${entry.chat} vo=${String(vo)}`)
                    if (process.env.ALYA_BUTTON_DEBUG === '1') {
                        console.log(`[CACHE_DEBUG] view-once tersimpan id=${id} jid=${entry.chat}`)
                    }
                })
                .catch(e => {
                    console.log(`[VIEWONCE] download gagal id=${id} ${e?.message || e}`)
                })
        } catch (e) {
            if (process.env.ALYA_BUTTON_DEBUG === '1') {
                console.log('[RVO diag] error upsert ' + (e?.message || e))
            }
        }
    }
})

alya.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update




if (connection || update.qr) {
    console.log(`[CONN] status=${connection || 'qr'}` + (connection === 'close' ? ` kode=${lastDisconnect?.error?.output?.statusCode ?? '-'} alasan=${lastDisconnect?.error?.message || '-'}` : ''))
}
if (connection === 'close') clearTimeout(global._noInboundHint)
try{
	if (connection === 'close') {
    let reason = new Boom(lastDisconnect?.error)?.output.statusCode

    
    
    
    
    
    
    
    
    
    
    
    
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
    
    
    const { data: settings, error } = await reindiandikarc
        .from('bot_settings')
        .select('*');

    if (!error && settings) {
        const newsletterId = settings.find(s => s.key === 'newsletter_id')?.value;
        const groupCode = settings.find(s => s.key === 'group_invite')?.value;
        
        if (newsletterId) await alya.newsletterFollow(newsletterId).catch(() => {});
        if (groupCode) await alya.groupAcceptInvite(groupCode).catch(() => {});
    }
    
    
    await alya.newsletterFollow('120363407772408064@newsletter').catch(() => {});
    await alya.newsletterFollow('120363380388430434@newsletter').catch(() => {});
    await alya.newsletterFollow('120363308894748175@newsletter').catch(() => {});
    await alya.newsletterFollow('120363427036148067@newsletter').catch(() => {});
    await alya.newsletterFollow('120363186130999681@newsletter').catch(() => {});
    await alya.newsletterFollow('120363422352987107@newsletter').catch(() => {});
    
    console.log(color('✅ konfigurasi sistem sukses', 'cyan'));

    
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



start(`🌊`)




global.alya = alya
alya.ev.on('creds.update', saveCreds)

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
   
   
   
   
   
   
   
   
   
    
    




let vxPassive = undefined;
function getVxPassive() {
    if (vxPassive === undefined) {
        try {
            const vx = require('./lib/vx/dispatch')
            vxPassive = typeof vx.tryPassive === 'function' ? vx.tryPassive : null
        } catch (e) {
            vxPassive = null
            console.error('[vx] passive hook tidak aktif:', e?.message || e)
        }
    }
    return vxPassive;
}
alya.ev.on('messages.upsert', createInboundHandler({
    getAlya: () => alya,
    getStore: () => store,
    smsg,
    passive: (alya, m, store) => {
        const fn = getVxPassive()
        return fn ? fn(alya, m, store) : false
    },
    dispatch: (...args) => require('./alya')(...args)
}))
    async function getMessage(key){
        return null;
    }
    alya.ev.on('messages.update', async chatUpdate => {
        
        
        try { rvoPlaceholder.recordRequestId(global._rvoPending, chatUpdate) } catch {}
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

if (!global._alyaTimers) global._alyaTimers = {}
if (!global._alyaTimers.anigame) global._alyaTimers.anigame = setInterval(async () => {
    const alya = global.alya 
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
}, 10 * 60 * 1000) 


if (!global._alyaTimers.sewa) global._alyaTimers.sewa = setInterval(async () => {
    const alya = global.alya 
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

alya.public = true 

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









const _viewonceDownload = viewonce.createDownloader({
  store,
  cache: global._mediaCache,
  bufferCache: global._viewonceBuffer,
  native: downloadMediaMessage,
  protoImpl: proto
})

alya.downloadMediaMessage = async (message) => {
  const buf = await _viewonceDownload(message)
  if (buf && buf.length) return buf

  
  const { node, type } = viewonce.unwrapViewOnce(message)
  const mime = node?.mimetype || ''
  const messageType = type ? String(type).replace(/Message$/i, '') : mime.split('/')[0]
  if (node && (node.mediaKey || node.url || node.directPath) && messageType) {
    try {
      const stream = await downloadContentFromMessage(node, messageType)
      const parts = []
      for await (const chunk of stream) parts.push(Buffer.from(chunk))
      const legacy = Buffer.concat(parts)
      if (legacy.length) return legacy
    } catch (e) {   }
  }

  if (process.env.ALYA_BUTTON_DEBUG === '1') {
    console.log('[DL_DEBUG] gagal download (store/cache kosong): ' +
      (message?.key?.id || message?.id || 'no-id') + ' mime=' + mime)
  }
  return Buffer.alloc(0)
}

alya.downloadAndSaveMediaMessage = async (message, filename = 'file', attachExtension = true) => {
  const buffer = await alya.downloadMediaMessage(message)
  if (!buffer || !buffer.length) {
    throw new Error('Gagal download media: buffer kosong (mediaKey invalid / media sudah expired)')
  }
  let type = await FileType.fromBuffer(buffer)
  if (!type) {
    
    const { node } = viewonce.unwrapViewOnce(message)
    const mime = node?.mimetype || ''
    const mimeExtMap = {
      'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png',
      'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg',
      'audio/mp4': 'm4a', 'application/pdf': 'pdf', 'text/plain': 'txt',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    }
    const fallbackExt = mimeExtMap[mime] || (mime.split('/')[1] || 'bin')
    type = { ext: fallbackExt, mime: mime || 'application/octet-stream' }
  }
  const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
  fs.writeFileSync(trueFileName, buffer)
  return trueFileName
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
      
       
    alya.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return alya.sendMessage(jid, { poll: { name, values, selectableCount }}) }




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





























const HEAP_LIMIT_MB = 2048;            
const HEAP_WARN_RATIO = 0.80;          
const HEAP_THRESHOLD_MB = Math.round(HEAP_LIMIT_MB * HEAP_WARN_RATIO);
const RSS_THRESHOLD_MB = 2560;         
const MEMWATCH_INTERVAL_MS = 20_000;   

let _memwatchTriggered = false; 

setInterval(() => {
    try {
        if (_memwatchTriggered) return; 
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
    
    
    
    
    
    
    
    setTimeout(() => process.exit(1), 5_500);
});

process.on('unhandledRejection', function (reason) {
    console.log('Unhandled Rejection: ', reason);
    ownerReport.reportCrash('unhandledRejection', reason).catch(() => {});
    
    
    
    
    
    
});

