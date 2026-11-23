// Penjaga pesan: ban, AFK, antibadword, mute bot per grup
const { createStore } = require('./store')
const { getGroup } = require('./groups')
const { getGroupInfo, getContextInfo, userOf, formatUptime } = require('./utils')
const config = require('../config')
const warns = require('./warns')

const bans = createStore('bans', { users: {} })
const afkStore = createStore('afk', { users: {} })

// ---------- Ban ----------
const isBanned = (jid) => !!bans.data.users[userOf(jid)]
function ban(jid, reason) {
  bans.data.users[userOf(jid)] = { reason: reason || '-', time: Date.now() }
  bans.save()
}
function unban(jid) {
  const had = isBanned(jid)
  delete bans.data.users[userOf(jid)]
  bans.save()
  return had
}
const banList = () => Object.entries(bans.data.users).map(([id, v]) => ({ id, ...v }))

// ---------- AFK ----------
function setAfk(jid, reason) {
  afkStore.data.users[userOf(jid)] = { reason: reason || '', since: Date.now() }
  afkStore.save()
}

async function handleAfk(sock, msg, { from, sender, body, prefix }) {
  try {
    const users = afkStore.data.users
    if (!Object.keys(users).length) return
    const me = userOf(sender)
    const isAfkCmd = String(body || '').toLowerCase().startsWith(`${prefix}afk`)

    if (users[me] && !isAfkCmd) {
      const secs = (Date.now() - users[me].since) / 1000
      delete users[me]
      afkStore.save()
      await sock.sendMessage(
        from,
        { text: `👋 @${me} sudah tidak AFK lagi (AFK selama ${formatUptime(secs)}).`, mentions: [sender] },
        { quoted: msg }
      )
    }

    const ci = getContextInfo(msg) || {}
    const ids = new Set(
      [...(ci.mentionedJid || []), ci.quotedMessage ? ci.participant : null].filter(Boolean).map(userOf)
    )
    for (const id of ids) {
      const a = users[id]
      if (!a || id === me) continue
      await sock.sendMessage(
        from,
        {
          text: `💤 @${id} sedang AFK${a.reason ? `: ${a.reason}` : ''}\nSejak ${formatUptime((Date.now() - a.since) / 1000)} lalu.`,
          mentions: [`${id}@s.whatsapp.net`]
        },
        { quoted: msg }
      )
    }
  } catch (err) {
    console.log('[AFK]', err.message)
  }
}

// ---------- Antibadword ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function handleBadWord(sock, msg, { from, sender, body, isOwner }) {
  const g = getGroup(from)
  if (!g.badword || !g.badwords?.length || !body || isOwner) return false

  const hit = g.badwords.find((w) => new RegExp(`(^|[^a-z0-9])${esc(w)}([^a-z0-9]|$)`, 'i').test(body))
  if (!hit) return false

  const info = await getGroupInfo(sock, from, sender)
  if (info.isAdmin || !info.isBotAdmin) return false

  await sock.sendMessage(from, { delete: msg.key })
  const limit = config.warnLimit ?? 3
  const count = warns.add(from, sender, 'kata terlarang')
  const tag = `@${userOf(sender)}`

  if (count >= limit) {
    warns.clear(from, sender)
    await sock.sendMessage(from, { text: `${tag} dikeluarkan karena melanggar aturan kata ${limit}x.`, mentions: [sender] })
    await sock.groupParticipantsUpdate(from, [sender], 'remove')
  } else {
    await sock.sendMessage(from, {
      text: `⚠️ ${tag}, jaga ucapanmu! Peringatan ${count}/${limit}.`,
      mentions: [sender]
    })
  }
  return true
}

// ---------- Mute bot per grup ----------
// true kalau perintah ini harus diabaikan (grup di-mute & pengirim bukan admin)
async function isMutedFor(sock, { from, sender, command }) {
  if (!getGroup(from).muted) return false
  if (['botmute', 'mutebot'].includes(command)) return false
  try {
    return !(await getGroupInfo(sock, from, sender)).isAdmin
  } catch {
    return false
  }
}

module.exports = { isBanned, ban, unban, banList, setAfk, handleAfk, handleBadWord, isMutedFor }
