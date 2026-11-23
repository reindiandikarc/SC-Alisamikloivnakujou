// lib/vx/adapter.js — menjembatani ctx Alya ke bentuk yang diharapkan handler vanXone.
//
// Handler vanXone dipanggil `handler(m, extras)` dengan:
//   m.args, m.text, m.command, m.prefix, m.pushName, m.reply(), m.react(), m.download(),
//   m.isImage/isVideo/isAudio/isSticker, m.quoted.isImage, m.isOwner/isPremium/isAdmin...
//   extras = { sock, conn, text, args, q, mime, reply, usedPrefix, command, ... }
//
// Perbedaan signature PENTING (sudah diverifikasi ke sumber vanXone):
//   vanXone sock.sendMedia(jid, source, caption, quoted, options)   ← 5 argumen
//   Alya    alya.sendMedia(jid, path, fileName, caption, quoted, options) ← 6 argumen
// Jadi sock.sendMedia TIDAK boleh diteruskan mentah-mentah; diimplementasikan ulang di sini
// meniru lib/engine/nimbus.js vanXone.
'use strict'

require('./bootstrap')
const fs = require('fs')
const path = require('path')
const mimeTypes = require('mime-types')

const COOLDOWN = new Map() // `${sender}:${command}` → timestamp

function cfg() {
  return global.vxConfig || {}
}

// ── sock: proxy di atas alya dengan override signature vanXone ────────────────
function makeSock(alya, m, ctx) {
  const overrides = {
    // sendMedia(jid, sumber, caption, quoted, opsi) — sumber: Buffer|URL|path|{url}|payload
    sendMedia: async (jid, source, caption = '', quoted, options = {}) => {
      if (source instanceof ArrayBuffer || (ArrayBuffer.isView(source) && !Buffer.isBuffer(source))) {
        source = Buffer.from(source.buffer ? source.buffer : source)
      }
      if (source && typeof source === 'object' && (source.image || source.video || source.audio || source.document)) {
        return alya.sendMessage(jid, source, { quoted: quoted || m, ...options })
      }
      let data = source
      let mimeType = options.mimetype || 'application/octet-stream'
      let fileName = options.fileName || 'file'
      if (Buffer.isBuffer(source)) {
        // apa adanya
      } else if (typeof source === 'string' && /^https?:\/\//.test(source)) {
        data = { url: source }
      } else if (typeof source === 'string' && fs.existsSync(source)) {
        mimeType = mimeTypes.lookup(source) || 'application/octet-stream'
        fileName = path.basename(source)
        data = fs.readFileSync(source)
      } else if (source && typeof source === 'object' && typeof source.url === 'string') {
        data = { url: source.url }
      } else {
        throw new Error('sendMedia: sumber harus Buffer, URL, path file, { url }, atau payload media')
      }
      const mediaType = options.type || options.mediaType
      const captionField = caption != null && caption !== '' ? { caption: String(caption) } : {}
      const rest = { ...options }
      delete rest.type; delete rest.mediaType; delete rest.mimetype; delete rest.fileName
      let payload
      if (mediaType === 'image') payload = { image: data, ...captionField, ...rest }
      else if (mediaType === 'video') payload = { video: data, ...captionField, ...rest }
      else if (mediaType === 'audio') payload = { audio: data, mimetype: mimeType !== 'application/octet-stream' ? mimeType : 'audio/mpeg', ptt: options.ptt || false, ...rest }
      else payload = { document: data, mimetype: mimeType, fileName, ...captionField, ...rest }
      return alya.sendMessage(jid, payload, { quoted: quoted || m })
    },

    sendText: (jid, text, quoted, options = {}) =>
      alya.sendMessage(jid, { text: String(text), ...options }, { quoted: quoted || m }),

    // Dua signature hidup berdampingan di vanXone:
    //   nimbus/zenith: reply(teks, jid?, opsi?)
    //   lumen/pulse : reply(jid, teks, quoted?, opsi?)  ← 68+ pemanggilan
    // Bedakan dari bentuk argumen pertama (JID vs teks).
    reply: (a, b, c, d) => {
      const isJid = typeof a === 'string' && /@(g\.us|s\.whatsapp\.net|lid|newsletter)$/.test(a)
      let jid, text, quoted, options
      if (isJid) {
        jid = a; text = b
        if (c && typeof c === 'object' && (c.key || c.message)) quoted = c
        else if (c && typeof c === 'object' && !Array.isArray(c)) options = c
        if (d && typeof d === 'object') options = d
      } else {
        text = a; jid = typeof b === 'string' ? b : m.chat
        options = (typeof b === 'object' && b) || (c && typeof c === 'object' ? c : {}) || {}
        if (d && typeof d === 'object') options = d
      }
      return alya.sendMessage(jid || m.chat, { text: String(text ?? ''), ...(options || {}) },
        { quoted: quoted || m })
    },

    // Tidak ada di Alya → fallback yang aman, bukan crash.
    sendButton: async (jid, media, caption, quoted, opts = {}) => {
      const buttons = (opts.buttons || []).map(b => b.name || b.text || b.buttonText || '').filter(Boolean)
      const body = String(caption || '') + (buttons.length ? '\n\n' + buttons.map((b, i) => `${i + 1}. ${b}`).join('\n') : '')
      if (media) return overrides.sendMedia(jid, media, body, quoted || m, { type: opts.type || 'image' })
      return alya.sendMessage(jid, { text: body }, { quoted: quoted || m })
    },
    sendButtons: async (jid, caption, quoted, buttons = [], opts = {}) =>
      overrides.sendButton(jid, opts.media || null, caption, quoted, { ...opts, buttons }),
    sendPreview: async (jid, text, quoted, opts = {}) =>
      alya.sendMessage(jid, { text: String(text), ...opts }, { quoted: quoted || m }),

    // pulse/plugins/main/setmenu.js memakai bentuk lama: sendLinkPreview(jid, payload).
    // Kirim sebagai text + contextInfo; title/description dimasukkan ke text supaya
    // tidak bergantung pada externalAdReply (sudah dihapus dari Alya).
    sendLinkPreview: async (jid, payload = {}, quoted, opts = {}) => {
      const p = typeof payload === 'string' ? { text: payload } : (payload || {})
      const { url, title, description, thumbnail, text, contextInfo, ...rest } = p
      const head = [title, description, url].filter(Boolean).join('\n')
      return alya.sendMessage(jid, {
        text: [text, head].filter(Boolean).join('\n\n') || String(url || ''),
        ...(contextInfo ? { contextInfo } : {}),
        ...rest,
      }, { quoted: quoted || m, ...opts })
    },

    // zenith/plugins/owner/add.js — V4 invite tidak ada di fork. Fallback bersih:
    // kirim tautan undangan grup bila tersedia, jangan melempar TypeError.
    sendGroupV4Invite: async (jid, target, code, exp, name, msgText) => {
      try {
        const info = typeof alya.groupGetInviteInfo === 'function'
          ? await alya.groupGetInviteInfo(jid) : null
        const link = info?.invite || info?.code || (code ? `https://chat.whatsapp.com/${code}` : null)
        return alya.sendMessage(jid, {
          text: link ? `Undangan grup: ${link}` : '⚠️ Undangan grup tidak tersedia.',
        }, { quoted: m })
      } catch {
        return alya.sendMessage(jid, { text: '⚠️ Undangan grup tidak tersedia.' }, { quoted: m })
      }
    },
    sendStickerPack: async (jid, source, quoted, opts = {}) => {
      if (typeof alya.sendImageAsSticker === 'function') return alya.sendImageAsSticker(jid, source, quoted || m, opts)
      return overrides.sendMedia(jid, source, '', quoted || m, { type: 'image' })
    },
    sendSticker: async (jid, source, quoted, opts = {}) => {
      if (typeof alya.sendImageAsSticker === 'function') return alya.sendImageAsSticker(jid, source, quoted || m, opts)
      return alya.sendMessage(jid, { sticker: source }, { quoted: quoted || m })
    },
    cekIDSaluran: async (jid) => {
      try { return await alya.newsletterMetadata('jid', jid) } catch { return null }
    },
    // aurora/plugins/search/gdleaderboard.js
    sendTablehsn: async (jid, title, rows = [], quoted, opts = {}) => {
      const lines = (Array.isArray(rows) ? rows : []).map(r =>
        Array.isArray(r) ? r.join(' • ') : typeof r === 'object' ? Object.values(r).join(' • ') : String(r))
      return alya.sendMessage(jid, { text: [title, ...lines].filter(Boolean).join('\n') }, { quoted: quoted || m })
    },
    // lumen/tools/tools-togif.js — fallback saat quoted tak punya download().
    downloadM: async (msg, _type, _opts) => {
      try { return await downloadAny(alya, { ...m, quoted: msg }) }
      catch (e) { throw new Error('downloadM gagal: ' + (e?.message || e)) }
    },
    // aurora/pinsrich.js tersedia tapi tidak ada di Alya → kirim berurutan.
    sendAlbumMessage: async (jid, items = [], opts = {}) => {
      const out = []
      for (const item of items) {
        try { out.push(await alya.sendMessage(jid, item, { quoted: m })) } catch {}
      }
      return out
    },
    saveMessageToStore: (msg) => {
      try {
        const store = ctx.store || global.store
        if (store?.messages?.[msg?.key?.remoteJid]?.set) store.messages[msg.key.remoteJid].set(msg.key.id, msg)
      } catch {}
    },
    downloadAndSaveMediaMessage: async (msg, filename) => {
      if (typeof alya.downloadAndSaveMediaMessage === 'function') return alya.downloadAndSaveMediaMessage(msg, filename)
      const buf = await alya.downloadMediaMessage(msg)
      const p = filename || path.join(require('os').tmpdir(), `vx_${Date.now()}`)
      fs.writeFileSync(p, buf)
      return p
    },
  }

  // Plugin lama memakai sock.db.* (pulse setmenu) & conn.user.jid (zenith bankcek).
  const sockDb = {
    getPollCommands: () => global.vxPollCommands || {},
    saveDatabase: () => true,
    getMenuConfig: () => global.vxMenuConfig || { type: 'buttons list' },
    setMenuConfig: (d) => { global.vxMenuConfig = d || { type: 'buttons list' }; return global.vxMenuConfig },
    getLimitInfo: (jid) => ({ limit: Number(global.db?.users?.[jid]?.limit || 0) }),
  }

  return new Proxy(alya, {
    get(target, prop) {
      if (prop in overrides) return overrides[prop]
      if (prop === 'db') return sockDb
      if (prop === 'user' && target.user && !target.user.jid) {
        return { ...target.user, jid: target.user.id }
      }
      if (prop === 'waUploadToServer' && typeof target[prop] !== 'function') {
        return async () => { throw new Error('waUploadToServer tidak tersedia pada koneksi Alya.') }
      }
      const v = target[prop]
      return typeof v === 'function' ? v.bind(target) : v
    },
    has(target, prop) { return prop in overrides || prop in target || prop === 'db' },
  })
}

// ── media helper ──────────────────────────────────────────────────────────────
function mimeOf(x) {
  return (x && (x.mimetype || x.msg?.mimetype)) || ''
}

async function downloadAny(alya, m) {
  const tries = []
  if (typeof m.download === 'function') tries.push(() => m.download())
  if (m.quoted && typeof m.quoted.download === 'function') tries.push(() => m.quoted.download())
  for (const t of tries) {
    try { const b = await t(); if (b && b.length) return b } catch {}
  }
  const { downloadMediaMessage } = require('@whiskeysockets/baileys')
  const target = m.quoted?.fakeObj || m
  return downloadMediaMessage(target, 'buffer', {})
}

// ── m gaya vanXone ────────────────────────────────────────────────────────────
function makeMessage(alya, m, ctx) {
  const sock = ctx._vxSock
  const vm = Object.create(m)

  const quotedSrc = m.quoted || null
  const qmime = mimeOf(quotedSrc) || mimeOf(quotedSrc?.msg)
  const mmime = mimeOf(m) || mimeOf(m.msg)
  const mime = qmime || mmime

  vm.args = Array.isArray(ctx.args) ? ctx.args : []
  vm.fullArgs = ctx.text || vm.args.join(' ')
  vm.text = ctx.text || ''
  vm.q = ctx.q || ''
  vm.body = ctx.body || m.body || ''
  // nimbus/colongpp.js membaca m.mentions?.[0]; Alya menyimpannya sebagai mentionedJid.
  vm.mentions = m.mentionedJid || []
  vm.caption = ctx.text || quotedSrc?.text || ''
  if (m.messageTimestamp !== undefined) vm.messageTimestamp = m.messageTimestamp
  else if (m.message?.messageTimestamp !== undefined) vm.messageTimestamp = m.message.messageTimestamp
  vm.command = ctx.command
  vm.prefix = ctx.prefix
  vm.usedPrefix = ctx.prefix
  vm.pushName = ctx.pushname || m.pushName || ''
  vm.pushname = vm.pushName
  vm.name = vm.pushName
  vm.sender = ctx.sender || m.sender
  vm.chat = m.chat
  vm.isGroup = !!ctx.isGroup
  vm.isPrivate = !ctx.isGroup
  vm.isOwner = !!ctx.Ryuu
  vm.isPremium = !!ctx.isPrem
  vm.isAdmin = !!ctx.isGroupAdmins
  vm.isBotAdmin = !!ctx.isBotAdmins
  vm.isMedia = /image|video|sticker|audio/.test(mime)
  vm.mime = mime
  vm.mimetype = mime
  vm.type = m.mtype || ctx.type
  vm.mtype = vm.type
  vm.isImage = /image/.test(mime) || vm.type === 'imageMessage'
  vm.isVideo = /video/.test(mime) || vm.type === 'videoMessage'
  vm.isAudio = /audio/.test(mime) || vm.type === 'audioMessage'
  vm.isSticker = /sticker/.test(mime) || vm.type === 'stickerMessage'
  vm.isQuoted = !!quotedSrc
  vm.mentionedJid = m.mentionedJid || []

  vm.react = async (emoji) => {
    try { return await alya.sendMessage(m.chat, { react: { text: String(emoji), key: m.key } }) } catch {}
  }

  vm.reply = (text, a, b) => {
    // vanXone: m.reply(teks), m.reply(teks, opsi), m.reply({ image: ... }) (payload).
    // Alya: m.reply(teks, chatId, opsi).
    if (Buffer.isBuffer(text)) return sock.sendMedia(m.chat, text, '', m, { type: 'document' })
    let chatId = m.chat, options = {}
    if (typeof a === 'string') { chatId = a; options = b || {} }
    else if (a && typeof a === 'object') options = a
    if (text && typeof text === 'object') return alya.sendMessage(chatId, text, { quoted: m, ...options })
    return alya.sendMessage(chatId, { text: String(text), ...options }, { quoted: m })
  }

  vm.send = (text, opts = {}) => alya.sendMessage(m.chat, { text: String(text), ...opts }, { quoted: m })
  vm.download = () => downloadAny(alya, m)
  // properti tambahan yang dibaca plugin vanXone
  vm.raw = m
  vm.delete = async () => alya.sendMessage(m.chat, { delete: m.key })
  vm.conn = ctx._vxSock
  vm.client = ctx._vxSock
  vm.isCommand = true
  vm.hasQuotedMedia = /image|video|sticker|audio/.test(qmime)
  vm.groupMetadata = ctx.groupMetadata
  vm.pluginMediaReply = (url, caption) => sock.sendMedia(m.chat, url, caption || '', m, {
    type: /\.(mp4|mkv|webm)(\?|$)/i.test(String(url)) ? 'video' : 'image',
  })

  if (quotedSrc) {
    const vq = Object.create(quotedSrc)
    vq.mime = qmime
    vq.mimetype = qmime
    vq.type = quotedSrc.mtype || quotedSrc.type
    vq.mtype = vq.type
    vq.isImage = /image/.test(qmime) || vq.type === 'imageMessage'
    vq.isVideo = /video/.test(qmime) || vq.type === 'videoMessage'
    vq.isAudio = /audio/.test(qmime) || vq.type === 'audioMessage'
    vq.isSticker = /sticker/.test(qmime) || vq.type === 'stickerMessage'
    vq.isMedia = /image|video|sticker|audio/.test(qmime)
    vq.text = quotedSrc.text || quotedSrc.caption || ''
    vq.caption = vq.text
    vq.body = vq.text
    // Alya quoted = objek isi pesan; vanXone mengharapkan pesan Baileys utuh.
    vq.msg = quotedSrc.msg || quotedSrc
    vq.message = quotedSrc.message || quotedSrc.fakeObj?.message || quotedSrc.msg?.message
    vq.key = quotedSrc.key || quotedSrc.fakeObj?.key
    vq.filename = quotedSrc.fileName || quotedSrc.filename || ''
    vq.stanzaId = quotedSrc.stanzaId || quotedSrc.id
    vq.mediaType = qmime
    vm.quotedType = vq.type
    vq.download = async () => {
      if (typeof quotedSrc.download === 'function') {
        try { const b = await quotedSrc.download(); if (b && b.length) return b } catch {}
      }
      return downloadAny(alya, { ...m, download: null, quoted: quotedSrc })
    }
    vm.quoted = vq
  }

  return vm
}

// ── penjaga izin / cooldown / limit ───────────────────────────────────────────
function guard(plugin, ctx, vm) {
  const c = plugin.config || {}
  const mess = ctx.mess || global.mess || {}
  const only = mess.only || {}
  const deny = (msg) => { ctx.replytolak ? ctx.replytolak(msg) : ctx.reply(msg); return false }

  if (c.isEnabled === false) return deny('⚠️ Fitur ini sedang dinonaktifkan.')
  if (c.isOwner && !ctx.Ryuu) return deny(only.owner || '⚠️ Fitur ini hanya untuk owner.')
  if (c.isPremium && !ctx.isPrem && !ctx.Ryuu) return deny(only.premium || '⚠️ Fitur ini hanya untuk pengguna premium.')
  if (c.isGroup && !ctx.isGroup) return deny(only.group || '⚠️ Fitur ini hanya bisa dipakai di grup.')
  if (c.isPrivate && ctx.isGroup) return deny(only.private || '⚠️ Fitur ini hanya bisa dipakai di chat pribadi.')
  if (c.isBotAdmin && !ctx.isBotAdmins) return deny(only.botAdmin || '⚠️ Bot harus jadi admin grup.')
  if (c.isAdmin && !ctx.isGroupAdmins && !ctx.Ryuu) return deny(only.admin || '⚠️ Fitur ini hanya untuk admin grup.')

  const cd = Number(c.cooldown || 0)
  if (cd > 0 && !ctx.Ryuu) {
    const key = `${ctx.sender}:${ctx.command}`
    const last = COOLDOWN.get(key) || 0
    const wait = cd * 1000 - (Date.now() - last)
    if (wait > 0) return deny(`⏳ Tunggu ${Math.ceil(wait / 1000)} detik lagi sebelum memakai perintah ini.`)
    COOLDOWN.set(key, Date.now())
  }

  const energi = Number(c.energi || 0)
  if (energi > 0 && cfg().enforceLimit !== false && !ctx.Ryuu && !ctx.isPrem) {
    const u = global.db?.users?.[ctx.sender]
    if (u) {
      const have = Number(u.limit || 0)
      if (have < energi) return deny(`⚠️ Limit tidak cukup. Dibutuhkan ${energi}, sisa ${have}.`)
      u.limit = have - energi
    }
  }

  // Gating gaya engine lama: 214+ plugin memakai handler.limit, sebagian lagi
  // handler.owner/premium/group/... (bukan pluginConfig). Tanpa ini semua fitur
  // berbayar/open-source-gratis melahap limit / lolos dari pembatasan.
  const h = plugin.raw?.handler || plugin.handler || {}
  if (h.register && !ctx.Ryuu) {
    let registered = false
    try {
      registered = !!require('../userRegistration').findRegisteredUser(global.db, ctx.sender)
    } catch {}
    if (!registered) return deny(only.registration || '⚠️ Kamu harus mendaftar (`.daftar`) untuk memakai fitur ini.')
  }
  if (h.owner && !ctx.Ryuu) return deny(only.owner || '⚠️ Fitur ini hanya untuk owner.')
  if (h.premium && !ctx.isPrem && !ctx.Ryuu) return deny(only.premium || '⚠️ Fitur ini hanya untuk pengguna premium.')
  if (h.group && !ctx.isGroup) return deny(only.group || '⚠️ Fitur ini hanya bisa dipakai di grup.')
  if (h.private && ctx.isGroup) return deny(only.private || '⚠️ Fitur ini hanya bisa dipakai di chat pribadi.')
  if (h.admin && !ctx.isGroupAdmins && !ctx.Ryuu) return deny(only.admin || '⚠️ Fitur ini hanya untuk admin grup.')
  if (h.botAdmin && !ctx.isBotAdmins) return deny(only.botAdmin || '⚠️ Bot harus jadi admin grup.')

  const hCost = h.limit ? (Number(h.limit) > 1 ? Number(h.limit) : 1) : 0
  if (hCost && cfg().enforceLimit !== false && !ctx.Ryuu && !ctx.isPrem) {
    const u = global.db?.users?.[ctx.sender]
    if (u) {
      const have = Number(u.limit || 0)
      if (have < hCost) return deny(`⚠️ Limit tidak cukup (butuh ${hCost}, sisa ${have}).`)
      u.limit = have - hCost
    }
  }
  return true
}

// extras dipakai ulang oleh jalur passive hook (dispatch.tryPassive).
function makeExtras(plugin, sock, vm, alya, m, ctx) {
  return {
    // Spread Alya context dulu, lalu timpa dengan bentuk vanXone. Urutan terbalik
    // akan membuat ctx.m / ctx.quoted / ctx.reply (gaya Alya) menimpa adapter →
    // plugin yang destructures `{ m, quoted, reply }` dari argumen ke-2 salah.
    ...ctx,
    sock, conn: sock, alya, client: sock, bot: sock,
    m: vm,
    command: ctx.command, usedPrefix: ctx.prefix, prefix: ctx.prefix,
    text: ctx.text || '', args: ctx.args || [], q: ctx.q || '',
    mime: vm.mime, qmsg: ctx.qmsg, quoted: vm.quoted, content: ctx.content, type: vm.type,
    isGroup: ctx.isGroup, isPrivate: !ctx.isGroup,
    isOwner: ctx.Ryuu, isPremium: ctx.isPrem, isAdmin: ctx.isGroupAdmins, isBotAdmin: ctx.isBotAdmins,
    isImage: vm.isImage, isVideo: vm.isVideo, isAudio: vm.isAudio, isSticker: vm.isSticker,
    isMedia: vm.isMedia, isQuotedImage: ctx.isQuotedImage, isQuotedVideo: ctx.isQuotedVideo,
    isQuotedSticker: ctx.isQuotedSticker, isQuotedAudio: ctx.isQuotedAudio,
    sender: ctx.sender, from: ctx.from, chat: m.chat, pushname: ctx.pushname, pushName: ctx.pushname,
    groupMetadata: ctx.groupMetadata, groupName: ctx.groupName, groupMembers: ctx.groupMembers,
    groupAdmins: ctx.groupAdmins, participants: ctx.groupMembers || [],
    reply: (...a) => vm.reply(...a), replyalya: ctx.replyalya, replytolak: ctx.replytolak,
    db: global.db, store: ctx.store, mess: ctx.mess || global.mess,
    config: plugin.config || {}, pluginConfig: plugin.config || {},
    // pulse/bypass & convert memanggil example() pada input kosong.
    example: (s = '') => `Contoh: ${ctx.prefix || '.'}${ctx.command || ''} ${s}`.trim(),
    isBot: !!ctx.botNumber && ctx.sender === ctx.botNumber,
    isSelf: !!ctx.botNumber && ctx.sender === ctx.botNumber,
    isROwner: !!ctx.Ryuu,
    isJadiBot: false,
    getMenuConfig: () => global.vxMenuConfig || { type: 'buttons list' },
    setMenuConfig: (d) => { global.vxMenuConfig = d || { type: 'buttons list' }; return global.vxMenuConfig },
    getMenuData: () => global.vxMenuConfig || {},
    __dirname: path.dirname(plugin.file || ''),
  }
}

// Socket untuk hook pasif harus stabil antar-pesan: game vanXone menyimpan room
// di `this.tebakjkt`, `this.game`, dst. WeakMap per alya menyimpan state itu,
// sementara method selalu dibuat ulang dari pesan aktif (reply mengarah ke m).
const PASSIVE_CONNS = new WeakMap()
function makePassiveConn(alya, m, ctx) {
  let rec = PASSIVE_CONNS.get(alya)
  if (!rec) {
    rec = { state: {}, proxy: null }
    PASSIVE_CONNS.set(alya, rec)
  }
  rec.m = m
  rec.ctx = ctx
  if (!rec.proxy) {
    rec.proxy = new Proxy(rec.state, {
      get(target, prop) {
        if (prop in target) return target[prop]
        const sock = makeSock(alya, rec.m, rec.ctx)
        const v = sock[prop]
        return typeof v === 'function' ? v.bind(sock) : v
      },
      set(target, prop, value) { target[prop] = value; return true },
      has(target, prop) { return prop in target || prop in makeSock(alya, rec.m, rec.ctx) },
      ownKeys(target) { return Reflect.ownKeys(target) },
      getOwnPropertyDescriptor(target, prop) {
        const d = Reflect.getOwnPropertyDescriptor(target, prop)
        return d || { configurable: true, enumerable: true, writable: true, value: undefined }
      },
    })
  }
  return rec.proxy
}

// ── eksekusi ──────────────────────────────────────────────────────────────────
async function run(plugin, alya, m, ctx) {
  if (!plugin.handler) throw new Error('Plugin tidak punya handler: ' + plugin.rel)
  global.__vxAlya = alya // dipakai global.conn/sock/bot lazy di globals.js
  const sock = makeSock(alya, m, ctx)
  ctx._vxSock = sock
  const vm = makeMessage(alya, m, ctx)
  if (!guard(plugin, ctx, vm)) return

  const extras = makeExtras(plugin, sock, vm, alya, m, ctx)

  // Hook pasif vanXone (game answer / anti-spam). Dipanggil sebelum handler;
  // di sini hanya saat command terkait (Alya tidak punya hook global sejenis).
  const hh = plugin.raw?.handler || plugin.handler
  if (typeof hh?.before === 'function') {
    try { await hh.before(vm, extras) } catch (e) { console.error('[vx before]', plugin.rel, e?.message || e) }
  }

  // Format lama Alya: run(alya, m, ctx)
  if (plugin.raw && typeof plugin.raw.run === 'function' && !plugin.raw.handler) {
    return plugin.raw.run(alya, vm, { ...ctx, ...extras })
  }
  return plugin.handler(vm, extras)
}

module.exports = { run, makeSock, makeMessage, makeExtras, makePassiveConn, guard, downloadAny, COOLDOWN }
