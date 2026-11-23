# Task Plan: Port 844 plugin API vanXone ke Alya (adapter + kode utuh)

## Goal
Semua 844 plugin vanXone yang memakai indikator API hidup di Alya: command yang sudah ada ditimpa, sisanya ditambahkan, dengan kode sumber vanXone dipertahankan utuh dan loader universal ESM/CJS (termasuk baileys).

## Next Step
Laporkan hasil akhir ke user (termasuk pengecualian denylist + inventaris branding). Commit/push hanya setelah izin user.

## Current Phase
Phase 5 (delivery; deploy runtime sudah complete)

## Phases

### Phase 1: Requirements & Discovery — complete
- [x] Intent: approach A, scope 844, paralel, ESM/CJS baileys wajib jalan
- [x] Constraints: mode case, integrity `process.exit`, settings global overwrite
- [x] findings.md

### Phase 2: Planning & Structure — complete
- [x] Sandbox `vx/` mirror root vanXone + `lib/vx/` (bootstrap/loader/adapter/dispatch/globals/shims)
- [x] Desain wiring: SATU guard di `Alya.js`, bukan bedah 1915 case body

### Phase 3: Implementation — complete
- [x] Loader universal via `Module.registerHooks` — format diputus dari ISI file (Node 22.23.3)
- [x] Alias `baileys` / `@itsliaaa/baileys` → fork; `baileys-mbuilder` → shim AIRich
- [x] Shim berscope vx-only: `he`, `gradient-string`, `file-type` (Alya tetap v16 CJS)
- [x] Sandbox 945 file dinetralkan (HAZARDS_REMAINING=0), dynamic-import fixpoint + jembatan `.mjs`
- [x] 13 paket npm terpasang di lokal + runtime (`vx-file-type` alias masih lokal saja)
- [x] `lib/vx/globals.js`: helper core.js vanXone + branding Alya (namaBot/fkontak/fmeta/react)
- [x] Jembatan `global.db.data` (by-reference + owner/premium/sewa + reset diabaikan + pasang ulang saat db di-assign)
- [x] `scripts/vx-wire.js` → commands.json (2153), 799 wrapper + vxmenu, registry 1749→3644
- [x] `Alya.js`: require dispatch (try/catch) + guard `tryHandle` sebelum `switch (command)`
- [x] Cleanup artefak smoke (.vx-probe, database/cpanel, darling.json, ourin)

### Phase 4: Testing & Verification — complete
- [x] `node --check` Alya.js + dispatch + 800 wrapper → 0 gagal
- [x] Registry: 0 missing target dari 3644 entri
- [x] Smoke load: **844/844 OK, 0 failure** (`scripts/vx-smoke.js`)
- [x] Dispatch mock end-to-end: **10/10 PASS** (`scripts/vx-dispatch-test.js`)
- [x] Interop fokus: **8/8 PASS** (`scripts/vx-baileys-test.js`) — CJS require, ESM alias, vortex shim, AIRich, file-type scoped, he/gradient, cheerio default
- [x] Hook pasif: **6/6 PASS** (`scripts/vx-hook-test.js`) — state game stabil, jawaban benar/salah benar
- [x] Verifikasi baseline runtime: Alya.js byte-identik sebelum guard; registry identik sebelum wire; package.json cuma beda 1 baris → sync aman
- [x] Bundle deploy disiapkan: `/data/tmp/opencode/vx-port.tar.gz` (1.7 MB)
- [x] 4 agen audit adapter per-engine (zenith, nimbus, aurora+lumen, pulse+orbit+vortex)
- [x] Terapkan central fix audit: uncaughtException, lowdb/cheerio shim, 3 engine DB, gating legacy, reply lumen, hook pasif, confine path
- [x] Deploy runtime 2x + restart + marker online + `.vx-probe/` tidak ada; log 0 error sejak restart

### Phase 5: Delivery — in_progress
- [x] Review outputs
- [ ] Commit (push hanya setelah izin user)
- [x] Deliver to user

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Approach A: adapter + kode utuh | User pilih A; kode vanXone dipertahankan, diff Alya.js kecil (11 baris) |
| Scope 844 file (bukan 407) | User minta semua, termasuk ephoto360/canvas/upload-host |
| Sandbox `vx/` mirror root vanXone persis | Import relatif vanXone resolve tanpa menulis ulang kode |
| `Module.registerHooks` load hook, bukan transpile | Node 22 support; format diputus per-file dari isi → ESM & CJS sama-sama jalan |
| Guard tunggal `tryHandle` sebelum switch | Menimpa + menambah sekaligus; jauh lebih aman dari bedah 1915 case |
| Overwrite denylist: welcome, goodbye, sholat, setmenu (+ alias) | Event handler/scheduler Alya baca store Alya; versi vanXone menulis store lain → pengaturan hilang. **Dilaporkan ke user.** |
| Engine dedup: zenith > nimbus > aurora > lumen > pulse > orbit > vortex | Prioritas deterministik untuk command ganda |
| Lazy loading plugin (first use, cache) | Tidak memuat 800 plugin saat startup |
| Shim berscope di `lib/vx/shims/` (di luar vx) | Alya tetap pakai `file-type@16` CJS; vx dapat API modern; tidak rekursif |
| Shim tambahan `lowdb/node` + `cheerio` | Alya lowdb@2 & cheerio@1-rc; vanXone butuh subpath lowdb@7 & default export cheerio@0.x |
| Hook pasif lewat `lib/inbound.js` (satu pemanggilan) | `handler.all`/`before` game & notif butuh tiap pesan; wiring minimal, state di socket pasif WeakMap |
| Deploy lewat tarball, bukan `git push` | Runtime punya 58 file dirty & commit lineage berbeda → jangan timpa sembarangan |
| Jangan sentuh readme.md | Instruksi user tetap |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| `import '@whiskeysockets/baileys'` ERR_MODULE_NOT_FOUND dari /data/tmp | Probe dipindah ke dalam repo supaya node_modules resolve; ESM named export OK (637 keys) |
| `vx-wire.js` SyntaxError template literal bersarang | vxmenu dipindah ke file statis; wire hanya mendaftarkan |
| `group-autogpt.js` — reading 'chats' | Jembatan `global.db.data` ditambahkan di bootstrap |
| Audit test `fork_identity_and_exports` awalnya FAIL | Assertion salah (AIRich di top-level, bukan `.default`) — test diperbaiki, interop memang OK |
