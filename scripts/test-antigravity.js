'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-test-'))
const fakeBin = path.join(tmpDir, 'agy')
const logFile = path.join(tmpDir, 'agy.log')

// Fake agy: echoes the prompt so chunking is observable, logs start/end so
// queue serialization is observable, and sleeps for SLOW* prompts.
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
  // 1. Owner allowed → long answer split into MAX_CHUNK-sized replies.
  const longPrompt = 'A'.repeat(7200)
  const owner = makeCtx({ text: longPrompt, sender: 'owner1@s.whatsapp.net', isOwner: true })
  await plugin.run({}, {}, owner.ctx)
  await waitFor(() => owner.replies.length >= 3, 'chunked owner replies')
  assert.strictEqual(owner.rejections.length, 0)
  assert.ok(owner.replies.length >= 3, 'expected more than one chunk')
  assert.ok(owner.replies.every((p) => p.length <= 3500), 'chunk larger than 3500')
  assert.strictEqual(owner.replies.join(''), longPrompt)
  console.log('✓ owner allowed → chunked replies')

  // 2. Non-owner rejected through replytolak with global.mess.only.owner.
  const outsider = makeCtx({ text: 'hello', sender: 'outsider@s.whatsapp.net', isOwner: false })
  await plugin.run({}, {}, outsider.ctx)
  assert.deepStrictEqual(outsider.rejections, ['TEST_OWNER_ONLY'])
  assert.strictEqual(outsider.replies.length, 0)
  console.log('✓ non-owner rejected')

  // 3. Empty text → example reply, no binary call.
  const empty = makeCtx({ text: '', sender: 'owner2@s.whatsapp.net', isOwner: true })
  const beforeEmpty = logLines().length
  await plugin.run({}, {}, empty.ctx)
  assert.deepStrictEqual(empty.replies, ['Contoh: .agy apa itu git rebase?'])
  assert.strictEqual(logLines().length, beforeEmpty)
  console.log('✓ empty text → example reply')

  // 4. Second call from same sender hits the 15s cooldown.
  const sameSender = makeCtx({ text: 'again', sender: 'owner1@s.whatsapp.net', isOwner: true })
  const beforeCooldown = logLines().length
  await plugin.run({}, {}, sameSender.ctx)
  assert.strictEqual(sameSender.replies.length, 1)
  assert.match(sameSender.replies[0], /^Tunggu \d+ detik lagi\.$/)
  assert.strictEqual(logLines().length, beforeCooldown, 'cooldown must not spawn agy')
  console.log('✓ cooldown second call → "Tunggu ... detik"')

  // 5. Queue serializes two calls: slow job must fully finish before fast one starts.
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

  // 6. AGY_BIN override must be honoured at call time, not only at require time.
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

  // 7. With no override, an `agy` executable on PATH must be discovered.
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

  // 8. Missing binary must produce an actionable Indonesian preflight error.
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

  // 9. Auth failure must point the owner to an interactive Google sign-in.
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
