// Pengaturan per grup (antilink, welcome, leave) + handler member masuk/keluar
const fs = require('fs')
const path = require('path')
const { userOf, isBot } = require('./utils')

const dir = path.join(__dirname, '..', 'database')
const file = path.join(dir, 'groups.json')

let data = {}
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch {}

let timer = null
function save() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, JSON.stringify(data, null, 2))
    } catch (err) {
      console.log('[GROUPS] gagal menyimpan:', err.message)
    }
  }, 1000)
}

const DEFAULTS = {
  antilink: 'off', // 'off' | 'wa' (link grup WhatsApp) | 'all' (semua link)
  welcome: false,
  leave: false,
  welcomeText: 'Halo @user, selamat datang di *@group*! 👋',
  leaveText: 'Selamat tinggal @user 👋'
}

const getGroup = (jid) => ({ ...DEFAULTS, ...(data[jid] || {}) })

const listGroups = () => Object.entries(data)

function setGroup(jid, patch) {
  data[jid] = { ...(data[jid] || {}), ...patch }
  save()
}

// ---------- Plugin welcome / leave (pola sama, beda label) ----------
function greetingPlugin(kind, label, desc) {
  const textKey = `${kind}Text`
  return {
    name: kind,
    command: [kind],
    category: 'group',
    desc,
    usage: 'on|off|set <teks>',
    admin: true,
    run: async ({ from, args, body, prefix, reply }) => {
      const sub = (args[0] || '').toLowerCase()
      const g = getGroup(from)

      if (sub === 'on' || sub === 'off') {
        setGroup(from, { [kind]: sub === 'on' })
        return reply(`Pesan ${label} ${sub === 'on' ? 'diaktifkan' : 'dimatikan'}.`)
      }

      if (sub === 'set') {
        const text = body.match(/^\S+\s+set\s+([\s\S]+)/i)?.[1]?.trim()
        if (!text) {
          return reply(`Isi teksnya.\nContoh: ${prefix}${kind} set ${DEFAULTS[textKey]}`)
        }
        setGroup(from, { [textKey]: text })
        return reply(`Teks ${label} diubah.`)
      }

      await reply(
        [
          `*PESAN ${label.toUpperCase()}*`,
          `Status: ${g[kind] ? 'aktif' : 'mati'}`,
          `Teks: ${g[textKey]}`,
          '',
          `${prefix}${kind} on | off`,
          `${prefix}${kind} set <teks>`,
          'Placeholder: @user, @group'
        ].join('\n')
      )
    }
  }
}

// ---------- Event member masuk / keluar ----------
async function handleParticipants(sock, ev) {
  // Penjaga grup (anti-kudeta, antifake) — berjalan lebih dulu, tidak mengganggu welcome/leave
  try {
    await require('./groupguard').onParticipants(sock, ev)
  } catch (err) {
    console.log('[GUARD] gagal:', err.message)
  }
  const { id, participants, action } = ev
  if (action !== 'add' && action !== 'remove') return
  const kind = action === 'add' ? 'welcome' : 'leave'
  const g = getGroup(id)
  if (!g[kind]) return

  let subject = ''
  try {
    subject = (await sock.groupMetadata(id)).subject
  } catch {}

  for (const p of participants) {
    const jid = typeof p === 'string' ? p : p.id || p.jid
    if (!jid || isBot(sock, jid)) continue

    const text = g[`${kind}Text`]
      .replace(/@user\b/gi, `@${userOf(jid)}`)
      .replace(/@group\b/gi, subject)

    let photo
    try {
      photo = await sock.profilePictureUrl(jid, 'image')
    } catch {}

    try {
      if (photo) {
        await sock.sendMessage(id, { image: { url: photo }, caption: text, mentions: [jid] })
        continue
      }
    } catch {}
    await sock.sendMessage(id, { text, mentions: [jid] })
  }
}

module.exports = { listGroups, getGroup, setGroup, greetingPlugin, handleParticipants }
