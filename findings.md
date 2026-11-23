# Findings — Port plugin API vanXone → Alya

## Runtime
- Node **v22.23.3** → `require(esm)` **didukung** (teruji OK). Dynamic `import()` dari CJS OK.
- Baileys fork: `reindiandikarc-baileys@7.0.0-rc13.1`, `type: module`, dual export
  `import → ./src/index.js`, `require → ./src/index.cjs`.
- Uji ESM: `import { proto, makeWASocket, downloadMediaMessage } from '@whiskeysockets/baileys'`
  → **OK, 637 export**. CJS `require()` → OK, 636 export.
- Repo Alya `type: commonjs`.Jadi file ESM vanXone **tidak bisa** di-require langsung tanpa
  scoping `package.json` per-direktori.

## Skala
- vanXone total 4.127 file plugin; 844 punya indikator API (scope user: **ambil semua 844**).
- Closure dependensi: **941 file** (844 plugin + 97 lib engine) + 15 file root vanXone.
- Per engine: zenith 265, nimbus 249, lumen 161, aurora 111, pulse 107, orbit 17, vortex 16.
- Klasifikasi modul: **794 ESM, 141 CJS, 4 mixed, 2 plain**.
- **Hasil final scope 844** (dari `scripts/vx-map.js` + `scripts/vx-wire.js`):
  - **2.153 command** unik terdaftar di `lib/vx/commands.json`
  - **312 command timpa** (284 lewat case + 28 registry-only), **1.848 command tambah**, 94 konflik engine terselesaikan
  - 799 wrapper plugin + 1 wrapper `vxmenu`; registry **1.749 → 3.644** entri
  - Denylist infra: `welcome`, `goodbye`, `sholat`, `setmenu` + alias (`bye`, `leave`, `wc`, `autosholat`, `autoadzan`) → tetap pakai implementasi Alya (store berbeda)

## Bahaya yang harus dinetralkan (root vanXone)
| File | Side effect | Penanganan |
|---|---|---|
| `lib/integrity.js` | `process.exit(1)` bila hash `lib/autojoin.js` tidak cocok → **bot mati** | stub `check()` no-op |
| `settings.js` | `global.botname='vanXone'`, `global.owner=[]`, `global.channel`, `global.mess`, dll → identitas Alya rusak | assignment dijaga: hanya bila `undefined` + daftar PROTECTED |
| `config.js` | `Object.defineProperty(global,'owner',{writable:false,configurable:false})` → `.addowner` & `database/owner.json` mati | hapus freeze; owner tetap dari Alya |
| `lib/autojoin.js` | auto join saluran/grup vanXone | tidak disalin |

Hanya 3 file root yang benar-benar di-import plugin/lib engine:
`lib/baileys-compat.js` (16 file), `lib/engine/registry` (aurora/src/lib/plugins.js), `lib/jstore` (nimbus/src/lib/ourin-database.js).
Sisanya transitive.

## Apikey resmi vanXone (settings.js)
`global.apiKeys = { kyzz: 'kyzz87061175', azbry: '', siputzx: '' }`, `global.APIs` (base URL),
`global.ghTokens`, `global.userGh`, `global.tgToken`, `global.downloader`, `global.weather`, `global.ai`.
Alya **tidak** punya `global.APIs`/`global.apiKeys` (Alya pakai `global.apikey`, `global.api`) → aman diisi.
17 referensi `global.APIs`, 8 `global.apiKeys` di kode vanXone.

## Dependensi npm
45 bare package dipakai; 31 sudah ada di Alya. **14 hilang**:
`baileys`(5 file), `btch-downloader`(5), `jszip`(2), `@sparticuz/chromium`(1), `kyzz-canvas`(1),
`pdfkit`(2), `@elainaa/tls`(1), `node-upload-images`(2), `he`(1), `@microlink/mql`(1),
`bing-translate-api`(1), `@itsliaaa/baileys`(1), `cli-table3`(1), `gradient-string`(1).
- `baileys` & `@itsliaaa/baileys` → **alias ke fork**, bukan install.
- Registry npm **terjangkau** (uji `npm view jszip` → 3.10.2). DNS umum restricted tapi registry jalan.
- `kyzz-canvas`, `@elainaa/tls` kemungkinan tidak ada di npm → perlu shim/stub.

## Dispatch Alya
- Runtime `cmdMode = 'case'` → `Alya.js` (1.819 case) yang aktif; `default: break` (tidak ada fallback plugin).
- Mode plugin: `plugins/cmd_registry.json` → `plugins/cmd/*.js`, support 3 format export
  (`{command,run}`, array, `handler` function dengan `.command`).
- `alya.sendMedia(jid, path, fileName, caption, quoted, options)` & `alya.sendText` **signature identik** dengan vanXone `sock.sendMedia`.
- `m.reply` sudah ada (lib/myfunc.js:410). `m.react`, `m.args`, `m.isImage`, `m.prefix`, `m.pushName` perlu adapter.

## Format plugin vanXone (4 varian)
1. `export { pluginConfig as config, handler }` — nimbus, orbit, zenith (ESM)
2. `export default handler` + `handler.command/help/tags/limit` — lumen, pulse (ESM)
3. `module.exports = { config: pluginConfig, handler }` — aurora (CJS)
4. `module.exports = async function (__naren_imp, __naren_meta) { ... }` — vortex (CJS wrapper)

## Implementasi & Verifikasi (final)
- `lib/vx/bootstrap.js` — `Module.registerHooks`: resolve (alias baileys + shim vx-only) & load (sniff isi file → ESM/CJS). Idempoten.
- `lib/vx/loader.js` — normalkan 5 format modul jadi `{commands,tags,config,handler}`; `makeImp` untuk vortex.
- `lib/vx/adapter.js` — `m.*`, `sock.*`, guard pluginConfig; reply menerima payload objek & Buffer; `pluginMediaReply`, `m.raw`, `quotedType`, `sendSticker`.
- `lib/vx/globals.js` — helper `API/fetchApi/postApi/getBuffer` (verbatim core.js vanXone) + `react/fkontak/fmeta/namaBot` branding Alya.
- Jembatan `global.db.data` di bootstrap: koleksi inti by-reference, owner/premium/sewa memantul ke `global.owner`/`global.prem`, koleksi vx lazy, `db.data = {}` diabaikan, dipasang ulang saat `global.db` di-assign.
- Hasil uji: smoke **844/844**; dispatch **9/9**; interop baileys **7/7**; syntax 0 gagal; registry 0 missing.

## Deploy
- Runtime: mesin `m_agralfkf6q2p3lxe7z6jrfosv4`, repo `/data/home/SC-Alisamikloivnakujou`, commit `ee0e4c9` + 58 file dirty.
- **Aman**: `Alya.js` runtime byte-identik dengan lokal sebelum guard; `cmd_registry.json` identik dengan backup sebelum wire; `package.json` beda 1 baris (`vx-file-type`). Tiga file ini boleh ditimpa.
- Skrip `scripts/vx-deploy.sh` — bangun tarball → push → extract → `npm install` → restart → cek log + probe interop.
- `vx-file-type` belum terpasang di runtime (baru lokal); dipasang oleh skrip deploy.

## Artefak
- `/data/tmp/opencode/vx-api-inventory.json` — 844 file + command + host
- `/data/tmp/opencode/vx-closure.json` — closure 941, kinds, unresolved, bare pkgs
- `/data/tmp/opencode/vx-map.json` — peta overwrite/add/konflik final
- `/data/tmp/opencode/cmd_registry.before-vx.json` — backup registry sebelum wire
- `/data/tmp/opencode/vx-port.tar.gz` — bundle deploy (1.7 MB)
- `/data/tmp/opencode/remote-baseline/` — salinan 3 file bersama dari runtime (bukti verifikasi)
