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
const CHATS_FILE = process.env.AGY_CHATS_FILE || path.join(__dirname, '..', '..', 'database', 'agy-chats.json')
const ALLOW_RULES = ['read_file(*)', 'command(*)']

function settingsFile() {
  return path.join(process.env.AGY_HOME || os.homedir(), '.gemini', 'antigravity-cli', 'settings.json')
}

function ensureAgySettings() {
  try {
    const file = settingsFile()
    let settings = {}
    try {
      const raw = fs.readFileSync(file, 'utf8')
      if (raw.trim()) settings = JSON.parse(raw) || {}
    } catch {}
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) settings = {}
    if (!settings.permissions || typeof settings.permissions !== 'object' || Array.isArray(settings.permissions)) {
      settings.permissions = {}
    }
    if (!Array.isArray(settings.permissions.allow)) settings.permissions.allow = []
    let changed = false
    for (const rule of ALLOW_RULES) {
      if (!settings.permissions.allow.includes(rule)) {
        settings.permissions.allow.push(rule)
        changed = true
      }
    }
    if (changed || !fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n')
    }
  } catch {}
}

function loadAgyChats() {
  try {
    const parsed = JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveAgyChat(sender, conversationId) {
  if (!sender || !conversationId) return
  try {
    const chats = loadAgyChats()
    chats[sender] = conversationId
    fs.mkdirSync(path.dirname(CHATS_FILE), { recursive: true })
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2) + '\n')
  } catch {}
}

function clearAgyChat(sender) {
  if (!sender) return
  try {
    const chats = loadAgyChats()
    delete chats[sender]
    fs.mkdirSync(path.dirname(CHATS_FILE), { recursive: true })
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2) + '\n')
  } catch {}
}

function parseAgyOutput(out) {
  const text = String(out || '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1))
      const response = typeof parsed.response === 'string' ? parsed.response.trim() : ''
      const detail = parsed.error || parsed.message || parsed.details || parsed.status || ''
      return {
        response,
        conversationId: typeof parsed.conversation_id === 'string' ? parsed.conversation_id : '',
        status: typeof parsed.status === 'string' ? parsed.status : '',
        error: typeof detail === 'string' ? detail : JSON.stringify(detail),
      }
    } catch {}
  }
  return { response: text, conversationId: '', status: '', error: '' }
}

function isPermissionProblem(text) {
  return /permissions\.allow|auto-denied|required the .* permission|jetski/i.test(String(text || ''))
}

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
    
    return explicit.includes('/') || explicit.includes(path.sep)
      ? path.resolve(explicit)
      : (findOnPath(explicit) || explicit)
  }

  const home = os.homedir()
  
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

function askAgy(prompt, conversationId = '') {
  return new Promise((resolve, reject) => {
    const bin = resolveAgyBinary()
    const problem = preflightAgy(bin)
    if (problem) return reject(problem)
    ensureAgySettings()

    const args = ['-p', prompt, '--output-format', 'json']
    if (conversationId) args.push('--conversation', conversationId)
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
      const parsed = parseAgyOutput(out)
      if (parsed.response && parsed.status !== 'ERROR') {
        return resolve({ response: parsed.response, conversationId: parsed.conversationId })
      }
      const detail = parsed.error || err.trim() || `agy keluar dengan kode ${code} tanpa output`
      if (isPermissionProblem(detail) || isPermissionProblem(err)) {
        ensureAgySettings()
        return reject(userError(
          `Izin agy sudah diperbaiki di ${settingsFile()}. ` +
          `Silakan ulangi perintah ini.\nDetail: ${detail}`
        ))
      }
      if (isAuthProblem(detail) || isAuthProblem(err)) return reject(authError(detail))
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
  ensureAgySettings,
  loadAgyChats,
  command: ['agy', 'antigravity'],
  tags: ['ai'],
  
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
    const rawText = String(text || '').trim()
    const first = rawText.split(/\s+/)[0].toLowerCase()
    const fresh = first === 'new' || first === 'reset'
    if (fresh) clearAgyChat(sender)
    const prompt = fresh ? rawText.slice(first.length).trim() : rawText
    if (!prompt) return replyalya(`Contoh: ${prefix}${command} ${fresh ? 'new ' : ''}apa itu git rebase?`)
    const conversationId = fresh ? '' : (loadAgyChats()[sender] || '')
    const now = Date.now()
    const wait = (lastUse.get(sender) || 0) + COOLDOWN_MS - now
    if (wait > 0) return replyalya(`Tunggu ${Math.ceil(wait / 1000)} detik lagi.`)
    lastUse.set(sender, now)
    const job = queue.then(async () => {
      try {
        const answer = await askAgy(prompt, conversationId)
        if (answer?.conversationId) saveAgyChat(sender, answer.conversationId)
        for (const part of chunk(answer?.response || '')) await replyalya(part)
      } catch (e) {
        await replyalya(e?.userFacing ? e.message : `Error: ${e.message}`)
      }
    })
    queue = job.catch(() => {})
  }
}
