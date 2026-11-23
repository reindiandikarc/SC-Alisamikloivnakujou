// lib/groupguard.js — penjaga grup: anti-kudeta, antifake, dan jadwal buka-tutup otomatis.
// Dipanggil dari lib/groups.js (event member/admin berubah) dan lib/scheduler.js (jam berjalan).
const { createStore } = require('./store')
const { userOf, isBot } = require('./utils')
const owners = require('./owners')

const TZ = 'Asia/Jakarta'
const store = createStore('groupguard', { groups: {} })

const DEF = () => ({
  kudeta: { on: false, mode: 'demote', strict: false, trust: [] },
  fake: { on: false, allow: ['62'] },
  auto: { open: null, close: null, lastOpen: '', lastClose: '' }
})

// Ambil pengaturan grup (dilengkapi default). Objek yang dikembalikan boleh diubah lalu panggil save().
function cfg(gid) {
  const g = (store.data.groups[gid] ||= DEF())
  const d = DEF()
  g.kudeta = { ...d.kudeta, ...g.kudeta }
  g.fake = { ...d.fake, ...g.fake }
  g.auto = { ...d.auto, ...g.auto }
  return g
}
const save = () => store.save()

// ---------------------------------------------------------------- identitas (nomor / LID)
const aliasesOf = (p) =>
  typeof p === 'string'
    ? [userOf(p)]
    : [...new Set([p.id, p.jid, p.lid, p.phoneNumber, p.phone_number].filter(Boolean).map(userOf))]

const intersects = (a, b) => a.some((x) => b.includes(x))

// Daftar anggota grup dengan semua pengenalnya (nomor dan LID) supaya bisa dicocokkan
function membersOf(meta) {
  return (meta.participants || []).map((p) => ({ raw: p, ids: aliasesOf(p), admin: p.admin || null }))
}

function superIds(meta) {
  const ids = membersOf(meta).filter((m) => m.admin === 'superadmin').flatMap((m) => m.ids)
  return [...new Set([...ids, meta.owner, meta.ownerPn].filter(Boolean).map(userOf))]
}

// Perluas satu set pengenal dengan pengenal lain milik anggota yang sama (LID <-> nomor)
function expand(ids, members) {
  const out = new Set(ids)
  for (const m of members) if (intersects(m.ids, ids)) m.ids.forEach((x) => out.add(x))
  return [...out]
}

// Dipercaya = pembuat grup (superadmin), owner bot, atau daftar trust grup ini
function isTrusted(ids, g, meta) {
  if (!ids.length) return false
  if (intersects(ids, superIds(meta))) return true
  if (ids.some((x) => owners.isOwner(`${x}@s.whatsapp.net`))) return true
  return g.kudeta.trust.some((t) => intersects(ids, t.ids))
}

const tag = (jid) => `@${userOf(jid)}`

// Apakah bot sendiri admin di grup ini?
function botIsAdmin(sock, meta) {
  const mine = [sock.user?.id, sock.user?.lid].filter(Boolean).map(userOf)
  return membersOf(meta).some((m) => m.admin && intersects(m.ids, mine))
}

// ---------------------------------------------------------------- event member / admin berubah
async function onParticipants(sock, ev) {
  const gid = ev && ev.id
  if (!gid || !String(gid).endsWith('@g.us')) return
  const act = ev.action
  const g = cfg(gid)
  const kudetaOn = g.kudeta.on && (act === 'promote' || act === 'demote' || act === 'remove')
  const fakeOn = g.fake.on && act === 'add'
  if (!kudetaOn && !fakeOn) return

  const author = ev.author || ''
  if (author && isBot(sock, author)) return // aksi bot sendiri (mis. mengembalikan admin) jangan diproses lagi

  const meta = await sock.groupMetadata(gid)
  const members = membersOf(meta)
  const botAdmin = botIsAdmin(sock, meta)

  const actorIds = expand([author, ev.authorPn].filter(Boolean).map(userOf), members)
  const parts = (ev.participants || []).map((p) => ({
    jid: typeof p === 'string' ? p : p.id || p.jid,
    raw: p,
    ids: expand(aliasesOf(p), members)
  }))
  const say = (text, jids) => sock.sendMessage(gid, { text, mentions: jids.filter(Boolean) }).catch(() => {})

  // ---------------- ANTI KUDETA ----------------
  if (kudetaOn) {
    if (!author) return // pelaku tidak diketahui (mis. member keluar sendiri)
    if (isTrusted(actorIds, g, meta)) return // pembuat grup / owner / trust boleh mengubah admin

    // pelaku sendiri yang keluar (bukan dikeluarkan)
    if (act === 'remove' && parts.every((p) => intersects(p.ids, actorIds))) return

    const punish = async () => {
      const how = g.kudeta.mode === 'kick' ? 'remove' : 'demote'
      try {
        await sock.groupParticipantsUpdate(gid, [author], how)
        return how === 'remove' ? 'dikeluarkan dari grup' : 'dicopot dari admin'
      } catch {
        return 'gagal dihukum (bot tidak berhak)'
      }
    }

    if (act === 'demote' || act === 'remove') {
      const victims = parts.filter((p) => isTrusted(p.ids, g, meta))
      if (!victims.length) return
      if (!botAdmin) {
        return say(`⚠️ *ANTI-KUDETA*\n${tag(author)} ${act === 'demote' ? 'mencopot' : 'mengeluarkan'} ${victims.map((v) => tag(v.jid)).join(', ')}, tetapi bot bukan admin sehingga tidak bisa mengembalikan.`, [author, ...victims.map((v) => v.jid)])
      }
      const back = []
      const failed = []
      for (const v of victims) {
        try {
          const res = await sock.groupParticipantsUpdate(gid, [v.jid], act === 'demote' ? 'promote' : 'add')
          const st = String(res?.[0]?.status ?? '200')
          st === '200' ? back.push(v.jid) : failed.push(v.jid)
        } catch {
          failed.push(v.jid)
        }
      }
      const result = await punish()
      return say(
        [
          '> ―――《 ❝ ANTI-KUDETA ❞ 》―――',
          `> 🚨 ${tag(author)} mencoba ${act === 'demote' ? 'mencopot admin' : 'mengeluarkan anggota'} yang dilindungi.`,
          '',
          '> [ 🛡️ *TINDAKAN BOT* ]',
          back.length && `> ➥ Dikembalikan : ${back.map(tag).join(', ')}`,
          failed.length && `> ➥ Gagal dikembalikan : ${failed.map(tag).join(', ')}${act === 'remove' ? ' (mungkin privasi undangan, tambahkan manual)' : ''}`,
          `> ➥ Pelaku : ${tag(author)} ${result}`
        ]
          .filter(Boolean)
          .join('\n'),
        [author, ...back, ...failed]
      )
    }

    if (act === 'promote' && g.kudeta.strict) {
      const promoted = parts.filter((p) => !isTrusted(p.ids, g, meta))
      if (!promoted.length) return
      if (!botAdmin) return say(`⚠️ *ANTI-KUDETA (ketat)*\n${tag(author)} menambah admin tanpa izin, tetapi bot bukan admin sehingga tidak bisa membatalkan.`, [author])
      let ok = 0
      for (const p of promoted) {
        try {
          await sock.groupParticipantsUpdate(gid, [p.jid], 'demote')
          ok++
        } catch {}
      }
      return say(
        ['> ―――《 ❝ ANTI-KUDETA ❞ 》―――', `> 🚨 ${tag(author)} menambah admin tanpa izin pembuat grup.`, '', '> [ 🛡️ *TINDAKAN BOT* ]', `> ➥ Dibatalkan : ${ok} dari ${promoted.length} promosi`, '> ➥ Mode ketat: hanya pembuat grup / daftar trust yang boleh menambah admin'].join('\n'),
        [author]
      )
    }
    return
  }

  // ---------------- ANTIFAKE ----------------
  if (fakeOn) {
    if (!botAdmin) return console.log('[GUARD] antifake: bot bukan admin, dilewati')
    // anggota yang ditambahkan langsung oleh admin dianggap disengaja
    const authorMember = author && members.find((m) => intersects(m.ids, actorIds))
    if (authorMember?.admin && !parts.every((p) => intersects(p.ids, actorIds))) return

    const out = []
    for (const p of parts) {
      if (isBot(sock, p.jid)) continue
      const pnJid = [p.raw?.phoneNumber, p.raw?.jid, p.jid].find((j) => typeof j === 'string' && j.endsWith('@s.whatsapp.net'))
      if (!pnJid) {
        console.log('[GUARD] antifake: nomor tidak bisa dibaca (LID), dilewati')
        continue
      }
      const number = userOf(pnJid)
      if (g.fake.allow.some((pre) => number.startsWith(pre))) continue
      if (owners.isOwner(pnJid)) continue
      try {
        await sock.groupParticipantsUpdate(gid, [p.jid], 'remove')
        out.push({ jid: p.jid, number })
      } catch {}
    }
    if (out.length) {
      await say(
        ['> ―――《 ❝ ANTIFAKE ❞ 》―――', `> 🚫 ${out.length} nomor dikeluarkan otomatis.`, '', '> [ 📋 *DETAIL* ]', ...out.map((o) => `> ➥ +${o.number}`), `> ➥ Kode negara yang diizinkan : ${g.fake.allow.map((x) => '+' + x).join(', ')}`].join('\n'),
        []
      )
    }
  }
}

// ---------------------------------------------------------------- jadwal buka-tutup otomatis
let sockRef = null
let started = false

function nowWib(now = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(now)
  const v = (t) => p.find((x) => x.type === t).value
  return { date: `${v('year')}-${v('month')}-${v('day')}`, hm: `${v('hour')}:${v('minute')}` }
}
const mins = (hm) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5))

// Jalankan jadwal yang waktunya sudah tiba (toleransi 15 menit kalau bot baru menyala). now bisa diisi untuk uji.
async function tick(now = new Date(), sock = sockRef) {
  if (!sock) return
  const { date, hm } = nowWib(now)
  for (const [gid, raw] of Object.entries(store.data.groups)) {
    if (!raw.auto || (!raw.auto.open && !raw.auto.close)) continue
    const g = cfg(gid)
    for (const kind of ['close', 'open']) {
      const t = g.auto[kind]
      const last = kind === 'close' ? 'lastClose' : 'lastOpen'
      if (!t || g.auto[last] === date) continue
      const diff = mins(hm) - mins(t)
      if (diff < 0 || diff >= 15) continue
      g.auto[last] = date // tandai dulu supaya tidak mengulang kalau gagal
      save()
      try {
        await sock.groupSettingUpdate(gid, kind === 'close' ? 'announcement' : 'not_announcement')
        const other = kind === 'close' ? g.auto.open : g.auto.close
        await sock.sendMessage(gid, {
          text:
            kind === 'close'
              ? `🔒 *GRUP DITUTUP OTOMATIS*\nJadwal tutup ${t} WIB. Hanya admin yang bisa mengirim pesan.${other ? `\nDibuka lagi pukul ${other} WIB.` : ''}`
              : `🔓 *GRUP DIBUKA OTOMATIS*\nJadwal buka ${t} WIB. Semua member bisa mengirim pesan.${other ? `\nDitutup lagi pukul ${other} WIB.` : ''}`
        })
      } catch (err) {
        console.log(`[AUTOGC] gagal ${kind} ${gid}:`, err.message)
      }
    }
  }
}

// Dipanggil setiap koneksi terbuka; interval hanya dibuat sekali
function start(sock) {
  sockRef = sock
  try {
    require('./compat').logOnce(sock) // ringkasan kompatibilitas Baileys di konsol (sekali)
  } catch {}
  if (started) return
  started = true
  setInterval(() => tick().catch((e) => console.log('[AUTOGC]', e.message)), 20000)
}

module.exports = { cfg, save, botIsAdmin, onParticipants, start, tick, nowWib, aliasesOf, membersOf, superIds, expand, isTrusted, intersects, TZ }
