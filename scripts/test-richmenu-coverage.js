// Regresi: rich menu harus meliput command yang hanya ada di menu teks SC.
'use strict'
const assert = require('assert')
const rich = require('../lib/richmenu')

const c = rich.collect(false)
const all = new Set(Object.values(c.groups).flat().map(x => x.c))

// Contoh dari tiga sumber yang dulu tidak ikut ter-scan.
const fromTextCase = [
  'addexp', 'alya2', 'botmode', 'bctext', 'cekfemboy', 'delmoney', 'fakeig',
  'gachajodoh', 'getotp', 'gsmarena', 'hercai-cartoon', 'hercai-animefy',
  'hercai-lexica', 'hercai-prodia', 'hercai-raava', 'hercai-shonin',
  'hercai-simurg', 'hgame', 'keluar', 'klaimdagang', 'mutegc', 'nyerah',
  'pinjol', 'playmusic', 'playmusic_process', 'scanme', 'setmenu', 'skip',
  'start', 'stop', 'txt2img', 'votekick', 'wastalk',
]
const fromListmenu = [
  'addautogc', 'addhyd', 'addid', 'addusr', 'alyacrush', 'alyavip', 'blacklist',
  'cekkode', 'cekregist', 'cheat', 'delautogc', 'doublekill', 'ioskill',
  'iosx', 'listautogc', 'loker', 'oneclickall', 'onekill', 'rank', 'systemuicrash',
  'tofurina', 'tokobo', 'toluminare', 'toplevel', 'triplekill', 'unblacklist',
  'verify', 'xandroid', 'xwaweb',
]
const fromPluginMenu = [
  'bandarajadwal', 'bass', 'blown', 'cekdomain', 'cnbc', 'createdroplet',
  'deep', 'deldomain', 'delproses', 'delsrv', 'detik', 'dog', 'done',
  'earrape', 'edit', 'fajar', 'fast', 'fat', 'getkontak', 'jpmch',
  'kaijadwal', 'listpem', 'menfess', 'nightcore', 'panel', 'primbon',
  'proses', 'reverse', 'robot', 'savekontakv', 'sertifikat',
  'sertifikatcustom', 'slow', 'smooth', 'squirrel', 'take', 'tiktoknukthy',
  'unsuspend', 'update', 'updatesrv',
]

let fail = 0
for (const [name, list] of Object.entries({ fromTextCase, fromListmenu, fromPluginMenu })) {
  const missing = list.filter(x => !all.has(x))
  if (missing.length) {
    fail++
    console.log('  FAIL ' + name + ': ' + missing.join(', '))
  } else console.log('  ok  ' + name + ' (' + list.length + ')')
}

try {
  assert.ok(c.total >= 3757, 'total rich=' + c.total)
  assert.ok(c.caseTotal >= 3639, 'caseTotal=' + c.caseTotal)
  assert.ok(c.order.length <= 27, 'kategori tak terduga: ' + c.order.join(','))
  console.log('  ok  total=' + c.total + ' kategori=' + c.order.length)
} catch (e) { fail++; console.log('  FAIL total/kategori: ' + e.message) }

if (!fail) console.log('RICHMENU_COVERAGE_OK')
else { console.log('RICHMENU_COVERAGE_FAIL'); process.exitCode = 1 }
