const { proto, delay, getContentType, areJidsSameUser, generateWAMessage, downloadMediaMessage: baileysDownloadMediaMessage, extractMessageContent, downloadContentFromMessage } = require("@whiskeysockets/baileys")
const chalk = require('chalk')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const Jimp = require('jimp')
const { defaultMaxListeners } = require('stream')

// ── RVO: helper pembaca global._rvoCache (contract dari index.js) ─────────
// Detektor dan normalisasi buffer dipakai BERSAMA index.js. Modul ini murni,
// jadi serializer quote tidak punya aturan deteksi yang berbeda dari upsert.
const {
    WRAPPERS: _RVO_WRAPPERS,
    MEDIA_TYPES: _RVO_MEDIA_TYPES,
    ensureBuffer: _rvoEnsureBuffer,
    hasViewOnceSignal: _rvoHasViewOnce,
    unwrapEnvelopes: _rvoUnwrap,
    scanForViewOnceMedia,
    findAnyMedia,
    cacheRvoMedia,
    inferMime: _rvoInferMime,
} = require('./rvo-detect')

const _rvoJidKey = (jid) => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

const _rvoJidMatch = (a, b) => {
    if (!a || !b) return true
    if (a === b || a === 'unknown' || b === 'unknown') return true
    const an = _rvoJidKey(a), bn = _rvoJidKey(b)
    return !!an && !!bn && an === bn
}

// Prioritaskan stanzaId; kalau tidak ada, ambil entry TERBARU (<= 30 menit)
// yang chat + pengirimnya cocok dengan quote.
const _rvoFindEntry = (id, chat, sender) => {
    const cache = global._rvoCache
    if (!cache || typeof cache.get !== 'function') return null
    if (id) {
        const exact = cache.get(id)
        if (exact) return exact
    }
    let best = null
    for (const entry of cache.values()) {
        if (!entry || typeof entry.cachedAt !== 'number') continue
        if (Date.now() - entry.cachedAt > 30 * 60 * 1000) continue
        if (chat && entry.chat && !_rvoJidMatch(entry.chat, chat)) continue
        if (sender && entry.sender && !_rvoJidMatch(entry.sender, sender)) continue
        if (!best || entry.cachedAt > best.cachedAt) best = entry
    }
    return best
}

const _rvoDownloadDetected = async (detected) => {
    if (!detected?.content) return Buffer.alloc(0)
    const content = detected.content
    if (content.mediaKey != null) content.mediaKey = _rvoEnsureBuffer(content.mediaKey) || content.mediaKey
    if (content.fileEncSha256 != null) content.fileEncSha256 = _rvoEnsureBuffer(content.fileEncSha256) || content.fileEncSha256
    const mediaKey = _rvoEnsureBuffer(content.mediaKey)
    if (!mediaKey?.length) return Buffer.alloc(0)
    const type = String(detected.type || '').replace('Message', '').toLowerCase()
    if (!['image', 'video', 'audio'].includes(type)) return Buffer.alloc(0)
    const stream = await downloadContentFromMessage(content, type)
    const chunks = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    return Buffer.concat(chunks)
}

const _rvoDownloadEntry = async (entry) => _rvoDownloadDetected(entry)

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
    let tag = (0, exports.unixTimestampSeconds)().toString();
    if (epoch)
        tag += '.--' + epoch;
    return tag;
}

exports.processTime = (timestamp, now) => {
	return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options) => {
	try {
		options = options || {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})

		const buf = Buffer.from(res.data)

		// ✅ FIX: banyak API (terutama API Indonesia gratis) balas status 200
		// dengan BODY JSON ERROR ("status":false / "message":"...") kalau
		// parameter salah, BUKAN gambar/file biner. Kalau buffer "palsu" ini
		// diteruskan ke alya.sendMessage sebagai image, Baileys gagal dengan
		// error generik yang membingungkan jauh di dalam logic-nya sendiri
		// (bukan di titik yang jelas). Deteksi di sini dan throw error yang
		// JELAS supaya plugin pemanggil bisa kasih pesan yang masuk akal.
		const looksLikeJson = buf.length > 0 && (buf[0] === 0x7b || buf[0] === 0x5b) // '{' atau '['
		if (looksLikeJson) {
			let parsed = null
			try { parsed = JSON.parse(buf.toString('utf-8')) } catch { /* bukan JSON valid, anggap buffer biasa */ }
			if (parsed && typeof parsed === 'object') {
				const jsonErr = new Error(
					`API mengembalikan JSON, bukan file biner: ` +
					(parsed.message || parsed.msg || JSON.stringify(parsed).slice(0, 200))
				)
				jsonErr.isJsonResponse = true
				jsonErr.jsonData = parsed
				throw jsonErr
			}
		}

		if (buf.length < 100) {
			const emptyErr = new Error('Response API kosong atau terlalu kecil untuk berupa file valid.')
			emptyErr.isEmptyResponse = true
			throw emptyErr
		}

		return buf
	} catch (err) {
		// ✅ FIX UTAMA: sebelumnya `return err` — caller TIDAK PERNAH masuk
		// ke catch block-nya sendiri karena Promise ini selalu resolve
		// (bukan reject), walau isinya cuma objek Error. Validasi seperti
		// `!imageBuffer || imageBuffer.length < 500` di plugin pemanggil
		// juga lolos secara salah karena objek Error itu truthy dan
		// `.length`-nya undefined (undefined < 500 === false). Sekarang
		// benar-benar di-throw supaya try/catch di plugin pemanggil bekerja
		// seperti yang seharusnya.
		throw err
	}
}

exports.fetchJson = async (url, options) => {
    try {
        options = options || {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        // ✅ FIX: sebelumnya `return err` — caller TIDAK PERNAH masuk ke
        // catch block-nya sendiri, malah dapat objek Error sebagai kalau
        // itu data JSON yang valid (lalu crash lebih jauh saat plugin
        // mencoba akses field seperti `.result`/`.url` pada objek Error
        // yang mana memang tidak ada, biasanya muncul sebagai "Cannot read
        // properties of undefined"). Sekarang benar-benar di-throw.
        throw err
    }
}

exports.getGroupAdmins = (participants) => {
	let admins = []
	for (let i of participants) {
		i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
	}
	return admins || []
};

exports.runtime = function(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

exports.clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

exports.getTime = (format, date) => {
	if (date) {
		return moment(date).locale('id').format(format)
	} else {
		return moment.tz('Asia/Jakarta').locale('id').format(format)
	}
}

exports.formatDate = (n, locale = 'id') => {
	let d = new Date(n)
	return d.toLocaleDateString(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	})
}

exports.tanggal = (numer) => {
	myMonths = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
	myDays = ['Minggu','Senin','Selasa','Rabu','Kamis','Jum’at','Sabtu']; 
	var tgl = new Date(numer);
	var day = tgl.getDate()
	bulan = tgl.getMonth()
	var thisDay = tgl.getDay(),
	thisDay = myDays[thisDay];
	var yy = tgl.getYear()
	var year = (yy < 1000) ? yy + 1900 : yy; 
	return`${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`
}

exports.formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

exports.jsonformat = (string) => {
    return JSON.stringify(string, null, 2)
}

function format(...args) {
	return util.format(...args)
}

exports.logic = (check, inp, out) => {
	if (inp.length !== out.length) throw new Error('Input and Output must have same length')
	for (let i in inp)
		if (util.isDeepStrictEqual(check, inp[i])) return out[i]
	return null
}

exports.generateProfilePicture = async (buffer) => {
	const jimp = await Jimp.read(buffer)
	const min = jimp.getWidth()
	const max = jimp.getHeight()
	const cropped = jimp.crop(0, 0, min, max)
	return {
		img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
		preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
	}
}

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
            .then((res) => {
                let length = parseInt(res.headers['content-length'])
                let size = exports.bytesToSize(length, 3)
                if(!isNaN(length)) resolve(size)
            })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if(!isNaN(length)) resolve(size)
        } else {
            reject('error')
        }
    })
}

exports.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

// ── FIX OWNER / LID ────────────────────────────────────────────────────────
// Baileys 7 mengirim pengirim dalam format @lid, sedangkan isi
// database/owner.json adalah nomor telepon (PN). Pengecekan owner di
// alya.js membandingkan JID persis, jadi owner never match dan dianggap
// user biasa. Normalisasi di smsg (satu titik sebelum dispatcher) memakai
// field PN dari Baileys bila tersedia, lalu fallback ke file lid-mapping
// sesi yang memang sudah ada di folder Alyachan.
function resolveSenderJid(conn, m) {
    const jid = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
    if (!jid || !String(jid).endsWith('@lid')) return jid
    const lidUser = String(jid).split('@')[0]
    const key = m.key || {}
    const pnField = [key.participantPn, key.senderPn, key.participantAlt]
        .map(v => String(v || '').split('@')[0])
        .find(v => /^\d{8,15}$/.test(v))
    let pnUser = pnField
    if (!pnUser) {
        try {
            const file = `./${global.sessionName || 'Alyachan'}/lid-mapping-${lidUser}_reverse.json`
            if (fs.existsSync(file)) pnUser = JSON.parse(fs.readFileSync(file, 'utf8'))
        } catch {}
    }
    return pnUser ? String(pnUser).replace(/[^0-9]/g, '') + '@s.whatsapp.net' : jid
}

exports.smsg = (conn, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = resolveSenderJid(conn, m)
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
    }
    if (m.message) {
        // [fix] Buka SEMUA bentuk wrapper view-once (V1/V2/V2Extension) via
        // extractMessageContent sebelum menentukan mtype/mime. Tanpa ini media
        // sekali lihat yang dikirim sebagai pesan utama (caption ".rvo") tidak
        // terlihat sebagai media dan caption-nya tidak pernah jadi perintah.
        m.isViewOnce = _rvoHasViewOnce(m.message)
        const opened = extractMessageContent(m.message) || m.message
        let rawMtype = getContentType(opened) || Object.keys(opened)[0]
        let rawMsg = opened?.[rawMtype]
        // Guard tambahan untuk wrapper yang belum dikenal extractMessageContent.
        const _voTypes = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension']
        let _voGuard = 0
        while (_voTypes.includes(rawMtype) && rawMsg?.message && _voGuard++ < 5) {
            const inner = extractMessageContent(rawMsg.message) || rawMsg.message
            rawMtype = getContentType(inner) || rawMtype
            rawMsg = inner?.[rawMtype] || rawMsg.message?.[rawMtype]
        }
        m.mtype = rawMtype
        m.type = m.mtype
        m.msg = rawMsg
        m.isMedia = !!(rawMsg?.mimetype || rawMsg?.thumbnailDirectPath || rawMsg?.jpegThumbnail)
        if (m.isMedia) m.mime = rawMsg.mimetype
        // [fix] body harus dibaca dari node yang SUDAH dibuka (m.msg/rawMsg),
        // bukan dari m.message yang masih berisi wrapper viewOnceMessageV2.
        // Kalau tidak, caption ".rvo" pada media sekali lihat tidak pernah
        // terdeteksi sebagai perintah.
        m.body = (m.mtype === 'conversation') ? (rawMsg?.text || rawMsg?.contentText || '') : 
                 (m.mtype == 'imageMessage' || m.mtype == 'videoMessage') ? (rawMsg?.caption || '') : 
                 (m.mtype == 'extendedTextMessage') ? (rawMsg?.text || '') : 
                 (m.mtype == 'buttonsResponseMessage') ? (rawMsg?.selectedButtonId || '') : 
                 (m.mtype == 'listResponseMessage') ? (rawMsg?.singleSelectReply?.selectedRowId || '') : 
                 (m.mtype == 'templateButtonReplyMessage') ? (rawMsg?.selectedId || '') : 
                 m.text || '';

        m.mentionedJid = m.msg?.contextInfo ? m.msg.contextInfo.mentionedJid : []
        const _ci = m.msg?.contextInfo || {}
        let quoted = m.quoted = _ci.quotedMessage || null
        
        if (m.quoted) {
            // ── FIX QUOTED VIEW-ONCE (rvo / swgc / plugin reply media lain) ──
            // extractMessageContent (Baileys) membuka viewOnceMessageV2 /
            // V2Extension / ephemeral / documentWithCaption sampai ke node media
            // asli. `quoted` (map ORIGINAL) tetap dipakai oleh fakeObj.
            const _rawQuoted = quoted
            const openedQ = extractMessageContent(_rawQuoted) || _rawQuoted
            let type = getContentType(openedQ) || Object.keys(openedQ)[0]
            m.quoted = openedQ?.[type] || _rawQuoted[type]
            // Fallback wrapper yang belum dikenal extractMessageContent
            // (questionReplyMessage / futureProof / ephemeral / dll). Guard
            // tetap dibatasi supaya quote yang melingkar tidak recursion.
            let _qGuard = 0
            while (_RVO_WRAPPERS.includes(type) && m.quoted?.message && _qGuard++ < 6) {
                const inner = extractMessageContent(m.quoted.message) || m.quoted.message
                type = getContentType(inner) || type
                m.quoted = inner?.[type] || m.quoted.message?.[type] || m.quoted
            }
            if (type === 'productMessage' && m.quoted?.message) {
                const inner = extractMessageContent(m.quoted.message) || m.quoted.message
                type = getContentType(inner) || type
                m.quoted = inner?.[type] || m.quoted.message?.[type] || m.quoted
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            if (!m.quoted || typeof m.quoted !== 'object') m.quoted = { text: String(m.quoted || '') }
            // Kalau belum terbuka sampai node media, pakai detektor yang sama
            // dengan index.js (juga membaca quotedType/messageContextInfo).
            if (!_RVO_MEDIA_TYPES.includes(type)) {
                const detectedQ = scanForViewOnceMedia(_rawQuoted) || findAnyMedia(_rawQuoted)
                if (detectedQ) {
                    type = detectedQ.type
                    m.quoted = detectedQ.content
                } else if (typeof _ci.quotedType === 'string') {
                    const fromCtx = _RVO_MEDIA_TYPES.find(x => new RegExp(x, 'i').test(_ci.quotedType))
                    const unwrapped = _rvoUnwrap(_rawQuoted)
                    if (fromCtx && unwrapped?.[fromCtx]) {
                        type = fromCtx
                        m.quoted = unwrapped[fromCtx]
                    }
                }
            }
            m.quoted.isViewOnce = _rvoHasViewOnce(_rawQuoted) || !!scanForViewOnceMedia(_rawQuoted) ||
                !!(typeof _ci.quotedType === 'string' && /viewonce/i.test(_ci.quotedType))
            m.quoted.mtype = type
            m.quoted.type = type
            m.quoted.id = _ci.stanzaId
            m.quoted.chat = _ci.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = conn.decodeJid(_ci.participant)
            m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = _ci.mentionedJid || []

            // WhatsApp sengaja mengosongkan mimetype pada quote view-once.
            // Ambil dari node mana pun di quote asli, lalu dari quotedType,
            // baru terakhir infer dari type — supaya `mime=` tidak kosong.
            let _qMime = m.quoted.mimetype || m.quoted.mime
            if (!_qMime) {
                const _findMime = (o, d = 0) => {
                    if (!o || typeof o !== 'object' || d > 6) return ''
                    if (typeof o.mimetype === 'string' && o.mimetype) return o.mimetype
                    if (typeof o.mime === 'string' && o.mime) return o.mime
                    for (const k of Object.keys(o)) {
                        if (k === 'mediaKey' || k === 'fileEncSha256' || k === 'contextInfo') continue
                        const v = o[k]
                        if (v && typeof v === 'object' && !(v instanceof Uint8Array) && !Buffer.isBuffer(v)) {
                            const r = _findMime(v, d + 1)
                            if (r) return r
                        }
                    }
                    return ''
                }
                _qMime = _findMime(_rawQuoted)
            }
            if (!_qMime && typeof _ci.quotedType === 'string') {
                const fromCtx = _RVO_MEDIA_TYPES.find(x => new RegExp(x, 'i').test(_ci.quotedType))
                if (fromCtx) _qMime = _rvoInferMime(fromCtx)
            }
            if (!_qMime && _RVO_MEDIA_TYPES.includes(type)) _qMime = _rvoInferMime(type)
            if (_qMime) {
                m.quoted.mimetype = _qMime
                m.quoted.mime = _qMime
            }
            m.quoted.isMedia = !!(m.quoted.mimetype || m.quoted.thumbnailDirectPath || m.quoted.jpegThumbnail)

            if (!m.quoted.mimetype && process.env.ALYA_BUTTON_DEBUG === '1') {
                console.log('[RVO diag] quoted tanpa mimetype stanzaId=' + (_ci.stanzaId || '-') +
                            ' contextInfoKeys=' + Object.keys(_ci).join(',') +
                            ' type=' + type + ' isViewOnce=' + m.quoted.isViewOnce)
            }
            
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                return exports.smsg(conn, q, store)
            }
            
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted, // Menggunakan objek pesan asli sebelum di-extract
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            
            m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)
            // ── FIX DOWNLOAD REPLY MEDIA (swgc / rvo / plugin reply media lain) ──
            // AKAR MASALAH: kalau user reply ke video/foto *sekali lihat* (view-once),
            // WhatsApp sengaja MENCOPLOT field `url`, `directPath`, dan `mediaKey`
            // dari objek `quotedMessage` di contextInfo. Yang dikirim cuma metadata
            // (mimetype, fileSha256, viewOnce, processedVideos, ...). Jadi tidak ada
            // jalur download pun yang bisa pakai object quote itu — baik native
            // Baileys maupun override lokal di index.js, dua-duanya menemukan
            // "No valid media URL or directPath" / "Media Key tidak ditemukan".
            // SOLUSI: pesan ASLI (yang masih punya mediaKey) ada di store, di-cache
            // saat messages.upsert. Ambil memakai stanzaId dari contextInfo, lalu
            // download dari situ memakai downloadMediaMessage native (uextract
            // viewOnceMessageV2 otomatis). Urutan:
            //   0) cache RVO dari messages.upsert (mediaKey masih menempel)
            //   1) buffer view-once yang diunduh saat pesan tiba
            //   2) native dari vM / store (quote biasa & pesan asli)
            //   (override lama index.js SENGAJA tidak dipanggil → rekursi)
            m.quoted.download = async () => {
                const dbg = (msg) => { if (process.env.ALYA_BUTTON_DEBUG === '1') console.log('[DL_DEBUG] ' + msg) }
                // 0) Cache RVO (contract global._rvoCache di index.js).
                //    Cek stanzaId dulu; kalau tidak ada, cari entry terbaru
                //    <= 30 menit dengan chat + pengirim yang sama. Entry yang
                //    sudah punya buffer langsung dipakai; kalau belum, download
                //    ulang dari entry.content memakai ensureBuffer +
                //    downloadContentFromMessage (bukan alya.downloadMediaMessage).
                try {
                    const entry = _rvoFindEntry(m.quoted.id, m.quoted.chat || m.chat, m.quoted.sender)
                    if (entry) {
                        if (entry.buffer?.length) {
                            dbg('rvo cache buffer OK ' + entry.buffer.length + ' id=' + (m.quoted.id || '-'))
                            return entry.buffer
                        }
                        const buf0 = await _rvoDownloadEntry(entry)
                        if (buf0?.length) {
                            entry.buffer = buf0
                            try {
                                if (m.quoted.id) global._viewonceBuffer?.put?.(m.quoted.id, buf0, entry.mimetype || '')
                            } catch {}
                            dbg('rvo cache redownload OK ' + buf0.length + ' id=' + (m.quoted.id || '-'))
                            return buf0
                        }
                        dbg('rvo cache entry tanpa buffer/mediaKey id=' + (m.quoted.id || '-'))
                    }
                } catch (e) { dbg('rvo cache failed: ' + (e?.message || e)) }
                // 1) Buffer view-once yang diunduh SEGERA saat pesan tiba
                //    (pola vanXone). Dipakai semua plugin yang memanggil
                //    m.quoted.download() langsung, termasuk .swgc.
                try {
                    const buffered = global._viewonceBuffer?.get?.(m.quoted.id)
                    if (buffered && buffered.length) { dbg('viewonce buffer OK ' + buffered.length); return buffered }
                } catch (e) {}
                // 1) jalur normal: quote punya URL/mediaKey sendiri
                try {
                    const buf = await baileysDownloadMediaMessage(vM, 'buffer')
                    if (buf && buf.length) { dbg('native quote OK ' + buf.length); return buf }
                } catch (e) { dbg('native quote failed: ' + e?.message) }

                // 2) view-once: quote cuma metadata → ambil pesan asli dari store.
                //    Coba dua bentuk JID: contextInfo.remoteJid (bisa @lid) dan
                //    m.chat (@g.us) — store Baileys meng-indeks memakai remoteJid
                //    pesan asli, jadi salah format bikin cache miss walaupun
                //    pesannya sebenarnya ada.
                if (m.quoted.id) {
                    const jids = [...new Set([m.quoted.chat, m.chat, m.quoted.sender].filter(Boolean)
                        .flatMap(j => [j, j.endsWith('@lid') ? j.replace(/@lid$/, '@s.whatsapp.net') : j]))]
                    for (const jid of jids) {
                        try {
                            const raw = typeof store?.loadMessage === 'function'
                                ? await store.loadMessage(jid, m.quoted.id, conn) : null
                            dbg('store try jid=' + jid + ' hit=' + !!raw?.message)
                            if (raw?.message) {
                                // Detektor dulu: tahan envelope questionReplyMessage
                                // yang tidak dibuka downloader native. Hasilnya
                                // di-cache memakai stanzaId untuk reply berikutnya.
                                const detectedRaw = scanForViewOnceMedia(raw.message) || findAnyMedia(raw.message)
                                if (detectedRaw) {
                                    const buf2 = await _rvoDownloadDetected(detectedRaw)
                                    if (buf2?.length) {
                                        try {
                                            const e2 = cacheRvoMedia({
                                                detected: detectedRaw, id: m.quoted.id,
                                                chat: m.quoted.chat || m.chat,
                                                sender: m.quoted.sender,
                                                cache: global._rvoCache,
                                                cacheMeta: global._rvoCacheMeta,
                                            })
                                            if (e2) e2.buffer = buf2
                                        } catch {}
                                        dbg('rvo-detected store OK ' + buf2.length)
                                        return buf2
                                    }
                                }
                                const buf2n = await baileysDownloadMediaMessage(raw, 'buffer')
                                if (buf2n && buf2n.length) { dbg('native store OK ' + buf2n.length); return buf2n }
                            }
                        } catch (e) { dbg('native store failed (' + jid + '): ' + e?.message) }
                    }
                    // 2b) cache media persisten (survive restart) — dipakai kalau
                    //     store in-memory sudah kehapus gara-gara restart bot.
                    try {
                        const cached = global._mediaCache?.[m.quoted.id]
                        if (cached?.message) {
                            const raw2 = { key: { id: m.quoted.id, remoteJid: cached.jid }, message: cached.message }
                            const detectedCached = scanForViewOnceMedia(cached.message) || findAnyMedia(cached.message)
                            if (detectedCached) {
                                const buf3 = await _rvoDownloadDetected(detectedCached)
                                if (buf3?.length) {
                                    dbg('rvo-detected media-cache OK ' + buf3.length)
                                    return buf3
                                }
                            }
                            const buf3n = await baileysDownloadMediaMessage(raw2, 'buffer')
                            if (buf3n && buf3n.length) { dbg('native media-cache OK ' + buf3n.length); return buf3n }
                        }
                    } catch (e) { dbg('native media-cache failed: ' + e?.message) }
                }

                // 3) Jangan memanggil ulang downloader lama di sini.
                //    Itu masuk lagi ke wrapper sentral index.js -> memanggil
                //    m.quoted.download() -> rekursi tanpa akhir. Wrapper sentral
                //    sudah mencoba store + cache, jadi cukup kembalikan kosong.
                return Buffer.alloc(0)
            }
        }
    }
    
    if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendText(chatId, text, m, { ...options })
    m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)
    
    conn.appenTextMessage = async(text, chatUpdate) => {
        let messages = await generateWAMessage(m.chat, { text: text, mentions: m.mentionedJid }, {
            userJid: conn.user.id,
            quoted: m.quoted && m.quoted.fakeObj
        })
        messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id)
        messages.key.id = m.key.id
        messages.pushName = m.pushName
        if (m.isGroup) messages.participant = m.sender
        let msg = {
            ...chatUpdate,
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'append'
        }
        conn.ev.emit('messages.upsert', msg)
    }

    return m
}

exports.reSize = (buffer, ukur1, ukur2) => {
    return new Promise(async(resolve, reject) => {
        var baper = await Jimp.read(buffer);
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
        resolve(ab)
    })
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
