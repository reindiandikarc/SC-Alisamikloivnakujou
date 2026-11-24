// Offline test untuk deteksi & format status VPS bot.
'use strict'

const assert = require('assert')
const vps = require('../lib/vps-status')

function test(name, fn) {
  try { fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

test('deteksi pertanyaan status VPS', () => {
  const yes = [
    'status vps bot',
    'VPS kamu masih hidup?',
    'cek server bot',
    'uptime bot berapa?',
    'kamu online gak?',
    'status bot',
    'kondisi server hosting masih aktif?',
  ]
  const no = [
    'halo alisa',
    'status ai di grup',
    'cari gambar kucing',
    'ceritakan tentang mesin waktu',
    '',
  ]
  for (const t of yes) assert.strictEqual(vps.isVpsStatusQuery(t), true, 'harus terdeteksi: ' + t)
  for (const t of no) assert.strictEqual(vps.isVpsStatusQuery(t), false, 'tidak boleh terdeteksi: ' + t)
})

test('getVpsStatus memakai sumber yang di-inject (tanpa perintah asli)', () => {
  const s = vps.getVpsStatus({
    socket: { user: { id: '6285@s.whatsapp.net' }, ws: { ready: true } },
    now: Date.UTC(2026, 10, 24, 6, 30, 0),
    exec: () => 'active\n',
    statfs: () => ({ blocks: 1000, bsize: 1024, bavail: 250 }),
    platform: 'linux',
  })
  assert.strictEqual(s.service, 'active')
  assert.strictEqual(s.connected, true)
  assert.strictEqual(s.jid, '6285@s.whatsapp.net')
  assert.strictEqual(s.disk.percent, 75)
  assert.ok(s.memory.totalMB > 0)
  assert.ok(s.botUptimeSec >= 0)
})

test('format status lengkap & tidak membocorkan kredensial', () => {
  const s = vps.getVpsStatus({
    socket: { user: { id: '6285@s.whatsapp.net' }, ws: { ready: false } },
    exec: () => { const e = new Error('x'); e.stdout = 'inactive\n'; throw e },
    statfs: () => null,
  })
  const out = vps.formatVpsStatus(s, { prefix: '.' })
  for (const needle of ['STATUS VPS BOT', 'inactive', 'Putus', 'Uptime bot', 'RAM', 'Load avg']) {
    assert.ok(out.includes(needle), 'harus memuat ' + needle)
  }
  assert.ok(!/Bell409|token|password|secret|api.?key/i.test(out))
})

test('shortUptime manusiawi', () => {
  assert.strictEqual(vps.shortUptime(65), '1m 5d')
  assert.strictEqual(vps.shortUptime(3661), '1j 1m 1d')
  assert.strictEqual(vps.shortUptime(90061), '1h 1j 1m')
})

if (!process.exitCode) console.log('VPS_STATUS_TEST_OK')
else console.log('VPS_STATUS_TEST_FAIL')
