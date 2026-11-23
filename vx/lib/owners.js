// Pengenal owner yang tahan ID acak WhatsApp (@lid): nomor dari settings.js + daftar tersimpan (.addowner / .claimowner)
const crypto = require('crypto')
const config = require('../config')
const { createStore } = require('./store')
const { userOf } = require('./utils')

const store = createStore('owners', { ids: [] })
const digits = (x) => String(x || '').replace(/\D/g, '')

const fixed = () => [...new Set([...(config.ownerNumbers || []), config.ownerNumber].map(digits).filter(Boolean))]
const all = () => [...new Set([...fixed(), ...store.data.ids])]

const isOwner = (jid) => !!jid && all().includes(userOf(jid))

// Cadangan: Baileys kadang menyertakan nomor asli di field alternatif saat pengirim berupa @lid
function isOwnerMsg(msg) {
  const k = msg?.key || {}
  return [k.participantPn, k.senderPn, k.remoteJidAlt, k.participantAlt, k.participant_pn].some((j) => j && isOwner(j))
}

function add(idOrJid) {
  const id = userOf(String(idOrJid).includes('@') ? idOrJid : `${digits(idOrJid)}@s.whatsapp.net`)
  if (!id || all().includes(id)) return false
  store.data.ids.push(id)
  store.save()
  return true
}
function remove(idOrJid) {
  const id = userOf(String(idOrJid).includes('@') ? idOrJid : `${digits(idOrJid)}@s.whatsapp.net`)
  if (fixed().includes(id)) return 'fixed'
  const i = store.data.ids.indexOf(id)
  if (i === -1) return false
  store.data.ids.splice(i, 1)
  store.save()
  return true
}

// ---- Kode klaim: dicetak di konsol saat bot start, dipakai lewat chat pribadi: .claimowner <kode> ----
const claim = { code: null, expires: 0, tries: new Map() }
function newClaimCode(ttlMs = 30 * 60 * 1000) {
  claim.code = crypto.randomBytes(4).toString('hex').toUpperCase()
  claim.expires = Date.now() + ttlMs
  claim.tries.clear()
  return claim.code
}
function tryClaim(jid, input) {
  const who = userOf(jid)
  const t = (claim.tries.get(who) || []).filter((x) => Date.now() - x < 10 * 60 * 1000)
  if (t.length >= 5) return { error: 'Terlalu banyak percobaan. Tunggu 10 menit.' }
  if (!claim.code || Date.now() > claim.expires) return { error: 'Tidak ada kode klaim aktif. Restart bot untuk membuat kode baru (lihat konsol).' }
  const a = Buffer.from(String(input || '').trim().toUpperCase())
  const b = Buffer.from(claim.code)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    t.push(Date.now())
    claim.tries.set(who, t)
    return { error: 'Kode salah.' }
  }
  claim.code = null // sekali pakai
  add(jid)
  return { ok: true, id: who }
}

module.exports = { isOwner, isOwnerMsg, add, remove, all, fixed, newClaimCode, tryClaim, store }
