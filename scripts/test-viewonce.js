// Test isolated untuk jalur download media sekali lihat (view-once).
// Tidak menyalakan bot; native Baileys di-stub supaya yang diuji adalah routing-nya.
'use strict'
const assert = require('assert')
const viewonce = require('../lib/viewonce')

const EXPECTED = Buffer.from('media-bytes-dari-pesan-asli')
const JID = '120363425735076548@g.us'
const ID = 'VO_TEST_1'

const mediaNode = {
  mimetype: 'video/mp4',
  fileSha256: Buffer.from('sha'),
  viewOnce: true,
  interactiveAnnotations: [],
  annotations: [],
  processedVideos: []
}
const rawMessage = {
  key: { id: ID, remoteJid: JID },
  message: {
    viewOnceMessageV2: {
      message: { videoMessage: { ...mediaNode, mediaKey: Buffer.from('kunci-asli') } }
    }
  }
}
// Salinan quoted yang dikirim WhatsApp: mediaKey/url/directPath sudah dibuang.
const quotedNode = { ...mediaNode, mtype: 'videoMessage', id: ID, chat: JID }

async function main() {
  // 1) unwrap pembungkus view-once V2 sampai ke node medianya.
  const unwrapped = viewonce.unwrapViewOnce(rawMessage.message)
  assert.strictEqual(unwrapped.type, 'videoMessage', 'tipe media harus terbuka dari viewOnceMessageV2')
  assert.ok(unwrapped.node.mediaKey, 'node asli masih punya mediaKey')

  // 2) quoted tanpa mediaKey harus diambil dari pesan asli di cache.
  let nativeCalls = 0
  const store = { loadMessage: async () => null } // store kosong (mis. bot baru restart)
  const cache = { [ID]: { jid: JID, message: rawMessage.message } }
  const download = viewonce.createDownloader({
    store,
    cache,
    native: async () => { nativeCalls++; return EXPECTED }
  })
  assert.strictEqual(await download(quotedNode), EXPECTED, 'cache harus menyelamatkan quote view-once')
  assert.strictEqual(nativeCalls, 1, 'native dipanggil tepat sekali lewat cache')

  // 3) custom download() (dari smsg) lebih diprioritaskan.
  let custom = 0
  const withCustom = {
    ...quotedNode,
    download: async () => { custom++; return EXPECTED }
  }
  assert.strictEqual(await download(withCustom), EXPECTED)
  assert.strictEqual(custom, 1, 'message.download() harus dipakai lebih dulu')
  assert.strictEqual(nativeCalls, 1, 'native tidak boleh dipanggil ulang setelah download() sukses')

  // 4) download() yang gagal/empty harus jatuh ke cache, bukan buntu.
  let fallbackCustom = 0
  const brokenCustom = {
    ...quotedNode,
    download: async () => { fallbackCustom++; return Buffer.from([]) }
  }
  assert.strictEqual(await download(brokenCustom), EXPECTED)
  assert.strictEqual(fallbackCustom, 1)

  // 5) store (bukan cache) juga harus bisa dipakai.
  let storeCalls = 0
  const storeOnly = {
    loadMessage: async (jid, id) => {
      storeCalls++
      return jid === JID && id === ID ? rawMessage : null
    }
  }
  const dlStore = viewonce.createDownloader({
    store: storeOnly,
    cache: {},
    native: async () => EXPECTED
  })
  assert.strictEqual(await dlStore(quotedNode), EXPECTED, 'store harus dipakai saat cache kosong')
  assert.ok(storeCalls >= 1)

  // 7) buffer hasil pre-download saat pesan tiba (pola vanXone) diprioritaskan.
  const PREDOWNLOADED = Buffer.from('BUFFER_DARI_MESSAGES_UPSERT')
  let nativeAfterBuffer = 0
  const dlBuffer = viewonce.createDownloader({
    store, cache: {},
    bufferCache: { get: async (key) => key === ID ? PREDOWNLOADED : null },
    native: async () => { nativeAfterBuffer++; return EXPECTED }
  })
  assert.strictEqual(await dlBuffer(quotedNode), PREDOWNLOADED, 'buffer pre-download harus dipakai lebih dulu')
  assert.strictEqual(nativeAfterBuffer, 0, 'native tidak boleh dipanggil kalau buffer sudah ada')

  // 8) wiring di file produksi.
  const fs = require('fs')
  const root = require('path').join(__dirname, '..')
  const indexSrc = fs.readFileSync(root + '/index.js', 'utf8')
  const myfuncSrc = fs.readFileSync(root + '/lib/myfunc.js', 'utf8')
  const rvoSrc = fs.readFileSync(root + '/plugins/cmd/readviewonce.js', 'utf8')
  const caseSrc = fs.readFileSync(root + '/Alya.js', 'utf8')
  assert.ok(indexSrc.includes("require('./lib/viewonce')"), 'index.js belum pakai helper viewonce')
  assert.ok(indexSrc.includes('viewonce.createDownloader'), 'index.js belum pasang downloader sentral')
  assert.ok(indexSrc.includes('global._viewonceBuffer.put'), 'index.js belum menyimpan buffer view-once saat pesan tiba')
  assert.ok(indexSrc.includes('latest()'), 'index.js belum menyediakan fallback latest()')
  assert.ok(indexSrc.includes('viewOnceMessageV2Extension'), 'index.js belum deteksi wrapper V2Extension')
  assert.ok(rvoSrc.includes('_viewonceBuffer?.latest?.()'), 'plugin rvo belum pakai fallback media terakhir')
  assert.ok(myfuncSrc.includes("global._viewonceBuffer?.get?.(m.quoted.id)"), 'm.quoted.download belum cek buffer view-once')
  assert.ok(myfuncSrc.includes('viewOnceMessageV2Extension'), 'myfunc belum membuka wrapper V2Extension')
  assert.ok(/m\.body = [\s\S]{0,200}rawMsg\?\.caption/.test(myfuncSrc), 'm.body belum dibaca dari node view-once yang sudah dibuka')
  assert.ok(!/conn\.downloadMediaMessage\(m\.quoted\)/.test(myfuncSrc), 'fallback rekursif di m.quoted.download masih ada')
  assert.ok(/downloadMediaMessage\(source\)/.test(rvoSrc), 'rvo belum lewat downloader sentral')
  assert.ok(/require\('\.\/plugins\/cmd\/readviewonce'\)/.test(caseSrc), 'case rvo belum disamakan dengan plugin')

  console.log('VIEWONCE_TEST_OK 8/8')
}

main().catch(e => { console.error('VIEWONCE_TEST_FAIL:', e.message); process.exit(1) })
