// lib/inbound.js — Handler event `messages.upsert` untuk Alya V20
//
// Kenapa file ini ada:
// Sebelumnya logika ini ditulis inline di index.js dan punya 5 masalah yang
// membuat bot terlihat "hening total" tanpa jejak log:
//
//   1. Semua log diagnosa dibungkus `if (global.DEBUG_DIAG)` (default false),
//      dan log chat di alya.js dibungkus `NODE_ENV !== 'production'`. Hasilnya:
//      di panel (Pterodactyl), pesan masuk TIDAK PERNAH tercetak walau sampai.
//   2. Pesan yang gagal didekripsi (messageStubType = CIPHERTEXT, `message`
//      kosong) langsung di-`return` tanpa log sama sekali.
//   3. Hanya `messages[0]` yang diproses. Kalau Baileys mengirim batch
//      (umum setelah reconnect), pesan ke-2 dst dibuang.
//   4. `require('./alya')(...)` tidak di-await, jadi error async di dispatcher
//      menjadi unhandled rejection yang tidak terkait dengan pesan penyebabnya.
//   5. Cek owner hanya membandingkan nomor dari `remoteJid/participant`. Kalau
//      WhatsApp mengirim JID format LID (xxxx@lid), nomor tidak cocok dengan
//      owner.json, sehingga owner dianggap user biasa di mode SELF.
//
// Modul ini dependency-injected (tidak require baileys/alya langsung) supaya
// bisa dites terpisah.
'use strict'

// Kode stub CIPHERTEXT di proto WebMessageInfo.StubType (pesan gagal didekripsi)
const STUB_CIPHERTEXT = 2

const digits = (v) => String(v || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

// Kumpulkan semua kandidat nomor pengirim: JID utama + alternatif (LID <-> PN)
// yang disediakan berbagai versi Baileys.
function senderNumbers(key = {}) {
  const raw = [
    key.participant,
    key.participantPn,
    key.participantAlt,
    key.senderPn,
    key.remoteJid,
    key.remoteJidAlt
  ]
  return [...new Set(raw.map(digits).filter(Boolean))]
}

function isOwnerKey(key, ownerList) {
  if (!Array.isArray(ownerList) || !ownerList.length) return false
  const owners = ownerList.map(digits).filter(Boolean)
  return senderNumbers(key).some((n) => owners.includes(n))
}

function previewText(message) {
  if (!message || typeof message !== 'object') return ''
  const type = Object.keys(message)[0]
  const inner = message[type]
  const text =
    message.conversation ||
    inner?.text ||
    inner?.caption ||
    inner?.selectedButtonId ||
    inner?.selectedDisplayText ||
    inner?.singleSelectReply?.selectedRowId ||
    ''
  return String(text).replace(/\s+/g, ' ').slice(0, 60)
}

function createInboundHandler({
  getAlya,
  getStore,
  smsg,
  dispatch,
  getOwners = () => global.owner,
  logger = console,
  env = process.env
}) {
  const logEnabled = String(env.LOG_MESSAGES || 'true').toLowerCase() !== 'false'
  const stats = (global._inboundStats = global._inboundStats || {
    upsert: 0,
    dispatched: 0,
    undecryptable: 0,
    blocked: 0,
    errors: 0,
    lastEventAt: 0
  })

  const diag = (...a) => { if (global.DEBUG_DIAG) logger.log('[INBOUND]', ...a) }

  function warnUndecryptable(kay) {
    stats.undecryptable++
    // Tampilkan 3 kejadian pertama, lalu tiap kelipatan 20 supaya log tidak banjir.
    if (stats.undecryptable <= 3 || stats.undecryptable % 20 === 0) {
      logger.warn(
        `[MSG] ⚠️ Pesan dari ${digits(kay.key?.participant || kay.key?.remoteJid)} TIDAK BISA DIDEKRIPSI ` +
        `(total ${stats.undecryptable}x sejak start).\n` +
        `      Artinya pesan SAMPAI ke bot tapi kunci enkripsi Signal tidak cocok, bukan masalah kode command.\n` +
        `      Penyebab umum: folder sesi rusak/usang, versi libsignal tidak cocok dengan library WA,\n` +
        `      atau nomor ini juga aktif di instance bot lain. Perbaikan: stop bot → hapus folder sesi → pairing ulang.`
      )
    }
  }

  return async function onUpsert(chatUpdate) {
    stats.upsert++
    stats.lastEventAt = Date.now()

    const alya = getAlya()
    const store = getStore()
    const list = Array.isArray(chatUpdate?.messages) ? chatUpdate.messages : []
    diag(`upsert diterima type=${chatUpdate?.type} jumlah=${list.length}`)

    for (const kay of list) {
      try {
        if (!kay || !kay.key) { diag('dilewati: pesan tanpa key'); continue }

        // Pesan gagal dekripsi / stub sistem: `message` kosong.
        if (!kay.message) {
          if (kay.messageStubType === STUB_CIPHERTEXT) warnUndecryptable(kay)
          else diag('dilewati: message kosong, stubType=', kay.messageStubType)
          continue
        }

        // Unwrap ephemeral (perilaku lama dipertahankan)
        if (Object.keys(kay.message)[0] === 'ephemeralMessage' && kay.message.ephemeralMessage?.message) {
          kay.message = kay.message.ephemeralMessage.message
        }

        const jid = kay.key.remoteJid || ''

        if (jid === 'status@broadcast') {
          try { await alya.readMessages([kay.key]) } catch (e) { diag('readMessages status gagal:', e?.message) }
        }

        // Gate mode SELF: owner (termasuk yang datang sebagai @lid) dan fromMe selalu lolos.
        const ownerMsg = isOwnerKey(kay.key, getOwners())
        if (!alya.public && !kay.key.fromMe && !ownerMsg && chatUpdate.type === 'notify') {
          stats.blocked++
          if (logEnabled) logger.log(`[MSG] ⛔ diblokir mode SELF dari ${digits(kay.key.participant || jid)} (kirim .public dari nomor owner untuk membuka)`)
          continue
        }

        // Filter id internal 903D (perilaku lama dipertahankan)
        if (typeof kay.key.id === 'string' && kay.key.id.startsWith('903D') && kay.key.id.length === 14) {
          stats.blocked++
          diag('dilewati: id 903D')
          continue
        }

        if (logEnabled && jid !== 'status@broadcast') {
          const where = jid.endsWith('@g.us') ? 'grup' : 'pribadi'
          const who = digits(kay.key.participant || kay.key.participantPn || kay.key.senderPn || jid)
          const kind = Object.keys(kay.message)[0]
          const txt = previewText(kay.message)
          logger.log(`[MSG] ${chatUpdate.type || '?'} ${where} dari ${who}${kay.key.fromMe ? ' (me)' : ''} | ${kind}${txt ? ` | "${txt}"` : ''}`)
        }

        const m = smsg(alya, kay, store)
        stats.dispatched++
        await dispatch(alya, m, chatUpdate, store)
      } catch (err) {
        stats.errors++
        // SELALU log, tidak peduli NODE_ENV.
        logger.error('[MSG] ❌ Error saat memproses pesan:', err?.stack || err)
      }
    }
  }
}

module.exports = {
  createInboundHandler,
  isOwnerKey,
  senderNumbers,
  previewText,
  STUB_CIPHERTEXT
}
