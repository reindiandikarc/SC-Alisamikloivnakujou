'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-test-'))
const fakeBin = path.join(tmpDir, 'agy')
const logFile = path.join(tmpDir, 'agy.log')
const chatsFile = path.join(tmpDir, 'agy-chats.json')
process.env.AGY_HOME = tmpDir
process.env.AGY_CHATS_FILE = chatsFile



const fakeScript = `#!/bin/sh
printf 'start:%s\\n' "$2" >> "$AGY_LOG"
case "$2" in
  SLOW*) sleep 0.25 ;;
esac
printf '%s\\n' "$2"
printf 'end:%s\\n' "$2" >> "$AGY_LOG"
`
fs.writeFileSync(fakeBin, fakeScript, { mode: 0o755 })
fs.chmodSync(fakeBin, 0o755)
process.env.AGY_BIN = fakeBin
process.env.AGY_LOG = logFile

global.mess = { only: { owner: 'TEST_OWNER_ONLY' } }
delete global.Ryuu
delete global.rein

const plugin = require('../plugins/cmd/antigravity.js')

function makeCtx({ text, sender, isOwner }) {
  const replies = []
  const rejections = []
  const ctx = {
    text,
    prefix: '.',
    command: 'agy',
    sender,
    replyalya: async (t) => { replies.push(String(t)); return t },
    replytolak: async (t) => { rejections.push(String(t)); return t },
  }
  if (isOwner !== undefined) ctx.isOwner = isOwner
  return { ctx, replies, rejections }
}

async function waitFor(fn, label, timeout = 4000) {
  const started = Date.now()
  while (!fn()) {
    if (Date.now() - started > timeout) throw new Error(`Timeout waiting for ${label}`)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

function logLines() {
  if (!fs.existsSync(logFile)) return []
  return fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean)
}

async function main() {
  
  const longPrompt = 'A'.repeat(7200)
  const owner = makeCtx({ text: longPrompt, sender: 'owner1@s.whatsapp.net', isOwner: true })
  await plugin.run({}, {}, owner.ctx)
  await waitFor(() => owner.replies.length >= 3, 'chunked owner replies')
  assert.strictEqual(owner.rejections.length, 0)
  assert.ok(owner.replies.length >= 3, 'expected more than one chunk')
  assert.ok(owner.replies.every((p) => p.length <= 3500), 'chunk larger than 3500')
  assert.strictEqual(owner.replies.join(''), longPrompt)
  console.log('✓ owner allowed → chunked replies')

  
  const outsider = makeCtx({ text: 'hello', sender: 'outsider@s.whatsapp.net', isOwner: false })
  await plugin.run({}, {}, outsider.ctx)
  assert.deepStrictEqual(outsider.rejections, ['TEST_OWNER_ONLY'])
  assert.strictEqual(outsider.replies.length, 0)
  console.log('✓ non-owner rejected')

  
  const empty = makeCtx({ text: '', sender: 'owner2@s.whatsapp.net', isOwner: true })
  const beforeEmpty = logLines().length
  await plugin.run({}, {}, empty.ctx)
  assert.deepStrictEqual(empty.replies, ['Contoh: .agy apa itu git rebase?'])
  assert.strictEqual(logLines().length, beforeEmpty)
  console.log('✓ empty text → example reply')

  
  const sameSender = makeCtx({ text: 'again', sender: 'owner1@s.whatsapp.net', isOwner: true })
  const beforeCooldown = logLines().length
  await plugin.run({}, {}, sameSender.ctx)
  assert.strictEqual(sameSender.replies.length, 1)
  assert.match(sameSender.replies[0], /^Tunggu \d+ detik lagi\.$/)
  assert.strictEqual(logLines().length, beforeCooldown, 'cooldown must not spawn agy')
  console.log('✓ cooldown second call → "Tunggu ... detik"')

  
  const first = makeCtx({ text: 'SLOW1', sender: 'queue1@s.whatsapp.net', isOwner: true })
  const second = makeCtx({ text: 'FAST2', sender: 'queue2@s.whatsapp.net', isOwner: true })
  const beforeQueue = logLines().length
  await plugin.run({}, {}, first.ctx)
  await plugin.run({}, {}, second.ctx)
  await waitFor(
    () => first.replies.includes('SLOW1') && second.replies.includes('FAST2'),
    'queued replies'
  )
  assert.deepStrictEqual(logLines().slice(beforeQueue), [
    'start:SLOW1',
    'end:SLOW1',
    'start:FAST2',
    'end:FAST2',
  ])
  console.log('✓ queue serializes two calls')

  
  const overrideBin = path.join(tmpDir, 'agy-override')
  fs.writeFileSync(overrideBin, `#!/bin/sh\nprintf 'OVERRIDE:%s\\n' "$2"\n`, { mode: 0o755 })
  fs.chmodSync(overrideBin, 0o755)
  const savedBin = process.env.AGY_BIN
  try {
    process.env.AGY_BIN = overrideBin
    const override = makeCtx({ text: 'PING', sender: 'override@s.whatsapp.net', isOwner: true })
    await plugin.run({}, {}, override.ctx)
    await waitFor(() => override.replies.length > 0, 'override reply')
    assert.deepStrictEqual(override.replies, ['OVERRIDE:PING'])
    console.log('✓ AGY_BIN override selects alternate binary')
  } finally {
    process.env.AGY_BIN = savedBin
  }

  
  const pathDir = path.join(tmpDir, 'path-bin')
  fs.mkdirSync(pathDir)
  const pathFake = path.join(pathDir, 'agy')
  fs.writeFileSync(pathFake, `#!/bin/sh\nprintf 'PATHFOUND:%s\\n' "$2"\n`, { mode: 0o755 })
  fs.chmodSync(pathFake, 0o755)
  const savedPath = process.env.PATH
  try {
    delete process.env.AGY_BIN
    process.env.PATH = pathDir + path.delimiter + savedPath
    const fromPath = makeCtx({ text: 'PING2', sender: 'path@s.whatsapp.net', isOwner: true })
    await plugin.run({}, {}, fromPath.ctx)
    await waitFor(() => fromPath.replies.length > 0, 'PATH-discovered reply')
    assert.deepStrictEqual(fromPath.replies, ['PATHFOUND:PING2'])
    console.log('✓ agy discovered from PATH')
  } finally {
    process.env.PATH = savedPath
    process.env.AGY_BIN = savedBin
  }

  
  try {
    process.env.AGY_BIN = path.join(tmpDir, 'not-installed-agy')
    const missing = makeCtx({ text: 'halo', sender: 'missing@s.whatsapp.net', isOwner: true })
    await plugin.run({}, {}, missing.ctx)
    await waitFor(() => missing.replies.length > 0, 'missing-binary reply')
    assert.strictEqual(missing.replies.length, 1)
    assert.doesNotMatch(missing.replies[0], /ENOENT/)
    assert.match(missing.replies[0], /Antigravity|agy/i)
    assert.match(missing.replies[0], /belum terpasang|tidak ditemukan/i)
    assert.match(missing.replies[0], /install\.sh/)
    assert.match(missing.replies[0], /AGY_BIN/)
    console.log('✓ missing binary → actionable Indonesian error')
  } finally {
    process.env.AGY_BIN = savedBin
  }

  
  const authBin = path.join(tmpDir, 'agy-auth')
  fs.writeFileSync(authBin, `#!/bin/sh\nprintf 'authentication required: sign in with Google\\n' >&2\nexit 1\n`, { mode: 0o755 })
  fs.chmodSync(authBin, 0o755)
  try {
    process.env.AGY_BIN = authBin
    const auth = makeCtx({ text: 'halo', sender: 'auth@s.whatsapp.net', isOwner: true })
    await plugin.run({}, {}, auth.ctx)
    await waitFor(() => auth.replies.length > 0, 'auth reply')
    assert.match(auth.replies[0], /login|autentikasi|akun Google/i)
    console.log('✓ auth failure → owner login guidance')
  } finally {
    process.env.AGY_BIN = savedBin
  }

  const settingsPath = path.join(tmpDir, '.gemini', 'antigravity-cli', 'settings.json')
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify({ theme: 'dark', permissions: { deny: ['keep-me'] } }))
  assert.strictEqual(typeof plugin.ensureAgySettings, 'function', 'ensureAgySettings harus diekspor')
  plugin.ensureAgySettings()
  let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  assert.strictEqual(settings.theme, 'dark')
  assert.deepStrictEqual(settings.permissions.deny, ['keep-me'])
  assert.ok(settings.permissions.allow.includes('read_file(*)'))
  assert.ok(settings.permissions.allow.includes('command(*)'))
  plugin.ensureAgySettings()
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  assert.strictEqual(settings.permissions.allow.filter(x => x === 'command(*)').length, 1)
  console.log('✓ settings.json permission allow-rules ditambah tanpa menghapus key lain')

  const jsonBin = path.join(tmpDir, 'agy-json')
  fs.writeFileSync(jsonBin, `#!/bin/sh
printf 'args:%s\\n' "$*" >> "$AGY_LOG"
printf '%s\\n' '{"conversation_id":"CID-NEW","status":"SUCCESS","response":"JSON ANSWER"}'
`, { mode: 0o755 })
  fs.chmodSync(jsonBin, 0o755)
  process.env.AGY_BIN = jsonBin
  const jsonCtx = makeCtx({ text: 'judul', sender: 'json1@s.whatsapp.net', isOwner: true })
  await plugin.run({}, {}, jsonCtx.ctx)
  await waitFor(() => jsonCtx.replies.length > 0, 'json reply')
  assert.deepStrictEqual(jsonCtx.replies, ['JSON ANSWER'])
  const stored = JSON.parse(fs.readFileSync(chatsFile, 'utf8'))
  assert.strictEqual(stored['json1@s.whatsapp.net'], 'CID-NEW')
  console.log('✓ output json → response dipakai, conversation_id disimpan per pengirim')

  const chats = JSON.parse(fs.readFileSync(chatsFile, 'utf8'))
  chats['follow@s.whatsapp.net'] = 'CID-OLD'
  chats['reset@s.whatsapp.net'] = 'CID-OLD'
  fs.writeFileSync(chatsFile, JSON.stringify(chats))
  const beforeFollow = logLines().length
  const follow = makeCtx({ text: 'lanjut', sender: 'follow@s.whatsapp.net', isOwner: true })
  await plugin.run({}, {}, follow.ctx)
  await waitFor(() => follow.replies.length > 0, 'follow-up reply')
  assert.ok(logLines().slice(beforeFollow).some(l => /--conversation CID-OLD/.test(l)),
    'follow-up harus mengirim --conversation CID-OLD')
  console.log('✓ follow-up memakai conversation id tersimpan')

  const beforeReset = logLines().length
  const reset = makeCtx({ text: 'reset halo', sender: 'reset@s.whatsapp.net', isOwner: true })
  await plugin.run({}, {}, reset.ctx)
  await waitFor(() => reset.replies.length > 0, 'reset reply')
  assert.ok(!logLines().slice(beforeReset).some(l => /--conversation CID-OLD/.test(l)),
    'reset harus menghapus conversation id lama')
  console.log('✓ .agy reset membersihkan conversation id')

  console.log('All antigravity tests passed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })
