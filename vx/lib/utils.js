const { downloadMediaMessage, normalizeMessageContent } = require('@whiskeysockets/baileys')
const pino = require('pino')

const logger = pino({ level: 'silent' })

const userOf = (jid) => String(jid || '').split('@')[0].split(':')[0]
const sameUser = (a, b) => !!a && !!b && userOf(a) === userOf(b)

function isBot(sock, jid) {
  return sameUser(jid, sock.user?.id) || sameUser(jid, sock.user?.lid)
}

function formatUptime(sec) {
  sec = Math.floor(sec)
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [d && `${d} hari`, h && `${h} jam`, m && `${m} menit`, `${s} detik`]
    .filter(Boolean)
    .join(' ')
}

async function getGroupInfo(sock, from, sender) {
  const metadata = await sock.groupMetadata(from)
  const find = (id) =>
    metadata.participants.find((p) =>
      [p.id, p.jid, p.lid].some((x) => x && sameUser(x, id))
    )
  const me = find(sock.user?.id) || find(sock.user?.lid)
  const user = find(sender)
  return { metadata, isAdmin: !!user?.admin, isBotAdmin: !!me?.admin }
}

function getContextInfo(msg) {
  const m = normalizeMessageContent(msg.message)
  if (!m) return undefined
  const type = Object.keys(m)[0]
  return m[type]?.contextInfo
}

// Teks dari pesan yang di-reply
function getQuotedText(msg) {
  const q = normalizeMessageContent(getContextInfo(msg)?.quotedMessage)
  return (
    q?.conversation ||
    q?.extendedTextMessage?.text ||
    q?.imageMessage?.caption ||
    q?.videoMessage?.caption ||
    ''
  )
}

// Ambil target dari mention, reply, atau nomor di argumen
function getTargets(msg, args = []) {
  const ci = getContextInfo(msg) || {}
  const set = new Set(ci.mentionedJid || [])
  if (ci.quotedMessage && ci.participant) set.add(ci.participant)
  for (const a of args) {
    if (a.startsWith('@')) continue
    const n = a.replace(/[^0-9]/g, '')
    if (n.length >= 8 && n.length <= 15) set.add(`${n}@s.whatsapp.net`)
  }
  return [...set]
}

// Ambil media dari pesan itu sendiri atau dari pesan yang di-reply
async function getMedia(sock, msg, types) {
  const content = normalizeMessageContent(msg.message)
  let type = types.find((t) => content?.[t])
  let target = msg
  let info = type ? content[type] : null

  if (!type) {
    const ci = getContextInfo(msg)
    const quoted = normalizeMessageContent(ci?.quotedMessage)
    type = types.find((t) => quoted?.[t])
    if (!type) return null
    info = quoted[type]
    target = {
      key: {
        remoteJid: msg.key.remoteJid,
        id: ci.stanzaId,
        participant: ci.participant
      },
      message: ci.quotedMessage
    }
  }

  const buffer = await downloadMediaMessage(
    target,
    'buffer',
    {},
    { logger, reuploadRequest: sock.updateMediaMessage }
  )
  return { type, info, buffer }
}

module.exports = {
  userOf,
  sameUser,
  isBot,
  formatUptime,
  getGroupInfo,
  getContextInfo,
  getQuotedText,
  getTargets,
  getMedia
}
