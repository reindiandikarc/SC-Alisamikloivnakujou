const { spawn } = require('child_process')

const fs = require('fs')
const os = require('os')
const path = require('path')
const TIMEOUT_MS = 120000
const MAX_CHUNK = 3500
const USE_SANDBOX = process.env.AGY_SANDBOX !== '0'
const COOLDOWN_MS = 15000
const lastUse = new Map()
let queue = Promise.resolve()

const INSTALL_HINT =
  'Pasang: curl -fsSL https://antigravity.google/cli/install.sh | bash\n' +
  'Lalu: export PATH="$HOME/.local/bin:$PATH"\n' +
  'Login sekali dengan menjalankan "agy" interaktif memakai akun Google owner ' +
  '(headless -p hanya memakai kredensial yang sudah tersimpan; jangan simpan token/API key di repo).\n' +
  'Alternatif: set AGY_BIN=/path/ke/agy di environment bot.'

function userError(message) {
  const e = new Error(message)
  e.userFacing = true
  return e
}

function missingBinaryError(bin) {
  return userError(
    `❌ Antigravity CLI (agy) belum terpasang atau tidak ditemukan di: ${bin}\n${INSTALL_HINT}`
  )
}

function authError(detail) {
  return userError(
    `🔑 Antigravity belum login atau sesi Google sudah kedaluwarsa. ` +
    `Jalankan "agy" sekali secara interaktif di server bot dan login dengan akun Google owner. ` +
    `Jangan menaruh token/API key di repo.\n${detail ? `Detail: ${detail}` : ''}`
  )
}

function isAuthProblem(text) {
  return /authentication required|not logged in|sign in|login|unauthori[sz]ed|credential|oauth|token expired/i.test(text)
}

function isExecutableFile(file) {
  try {
    if (!fs.statSync(file).isFile()) return false
    fs.accessSync(file, fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}

// Same semantics as `command -v agy`: first executable file on PATH wins.
function findOnPath(name) {
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue
    const candidate = path.join(dir, name)
    if (isExecutableFile(candidate)) return candidate
  }
  return null
}

function resolveAgyBinary() {
  const explicit = process.env.AGY_BIN
  if (explicit) {
    // A bare name (AGY_BIN=agy) is looked up on PATH; a path is used as-is.
    return explicit.includes('/') || explicit.includes(path.sep)
      ? path.resolve(explicit)
      : (findOnPath(explicit) || explicit)
  }

  const home = os.homedir()
  // Official installer writes ~/.local/bin/agy; the rest are common alternatives.
  const candidates = [
    path.join(home, '.local', 'bin', 'agy'),
    path.join(home, '.npm-global', 'bin', 'agy'),
    path.join(home, '.bun', 'bin', 'agy'),
    path.join(home, 'go', 'bin', 'agy'),
    '/usr/local/bin/agy',
    '/usr/bin/agy',
    '/opt/agy/bin/agy',
    '/snap/bin/agy',
  ]
  for (const candidate of candidates) {
    if (isExecutableFile(candidate)) return candidate
  }
  return findOnPath('agy') || candidates[0]
}

function preflightAgy(bin) {
  let st
  try {
    st = fs.statSync(bin)
  } catch {
    return missingBinaryError(bin)
  }
  if (!st.isFile()) {
    return userError(`❌ ${bin} bukan file agy yang bisa dieksekusi.\n${INSTALL_HINT}`)
  }
  try {
    fs.accessSync(bin, fs.constants.X_OK)
  } catch {
    return userError(`❌ agy ditemukan di ${bin} tetapi tidak bisa dieksekusi. Jalankan: chmod +x ${bin}`)
  }
  return null
}

function askAgy(prompt) {
  return new Promise((resolve, reject) => {
    const bin = resolveAgyBinary()
    const problem = preflightAgy(bin)
    if (problem) return reject(problem)

    // Official headless syntax: `agy -p "<prompt>" [--sandbox]`.
    const args = ['-p', prompt]
    if (USE_SANDBOX) args.push('--sandbox')
    const p = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = '', err = ''
    const timer = setTimeout(() => {
      p.kill('SIGKILL')
      reject(new Error('Timeout: agy terlalu lama merespons'))
    }, TIMEOUT_MS)
    p.stdout.on('data', d => (out += d))
    p.stderr.on('data', d => (err += d))
    p.on('error', e => {
      clearTimeout(timer)
      if (e.code === 'ENOENT') return reject(missingBinaryError(bin))
      if (e.code === 'EACCES') {
        return reject(userError(`❌ agy di ${bin} tidak bisa dijalankan. Jalankan: chmod +x ${bin}`))
      }
      reject(e)
    })
    p.on('close', code => {
      clearTimeout(timer)
      if (out.trim()) return resolve(out.trim())
      const detail = err.trim() || `agy keluar dengan kode ${code} tanpa output`
      if (isAuthProblem(detail)) return reject(authError(detail))
      reject(new Error(detail))
    })
  })
}

const chunk = (t, n = MAX_CHUNK) => {
  const a = []
  for (let i = 0; i < t.length; i += n) a.push(t.slice(i, i + n))
  return a
}

module.exports = {
  command: ['agy', 'antigravity'],
  tags: ['ai'],
  // Owner-only: tampil di kategori OWNER pada rich menu & .ownermenu.
  category: 'owner',
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command, replyalya, replytolak, sender,
      isOwner, Ryuu, rein, isAly, isAlya, isOwn,
    } = ctx
    const senderNum = String(sender || '').split('@')[0]
    const listedOwner =
      (Array.isArray(global.owner) && global.owner.some((o) => String(o).split('@')[0] === senderNum)) ||
      (global.ownernomer != null && String(global.ownernomer).split('@')[0] === senderNum)
    const isOwnerAllowed = !!(
      isOwner || Ryuu || rein || global.Ryuu || global.rein ||
      isAly || isAlya || isOwn || listedOwner
    )
    if (!isOwnerAllowed) {
      const denial = global.mess?.only?.owner || '❌ Khusus Owner!'
      if (typeof replytolak === 'function') return replytolak(denial)
      return replyalya(denial)
    }
    if (!text) return replyalya(`Contoh: ${prefix}${command} apa itu git rebase?`)
    const now = Date.now()
    const wait = (lastUse.get(sender) || 0) + COOLDOWN_MS - now
    if (wait > 0) return replyalya(`Tunggu ${Math.ceil(wait / 1000)} detik lagi.`)
    lastUse.set(sender, now)
    const job = queue.then(async () => {
      try {
        const answer = await askAgy(text)
        for (const part of chunk(answer)) await replyalya(part)
      } catch (e) {
        await replyalya(e?.userFacing ? e.message : `Error: ${e.message}`)
      }
    })
    queue = job.catch(() => {})
  }
}
