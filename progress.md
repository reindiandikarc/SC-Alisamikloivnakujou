# Progress Log

## Session: 2026-11-23

### Current Status
- **Phase:** 5 — Deployed & verified on runtime
- **Started:** 2026-11-23

### Actions Taken
- Rebrand + `.swgc` + AIRich + plugin cleanup (commits `e08c2b1`, `485ddd6`) — sudah pushed.
- Audit 844 plugin ber-indikator API; salin closure 945 file ke sandbox `vx/` (root dinetralkan, 0 hazard).
- Bangun `lib/vx/`: bootstrap (Module hooks + alias + shim), loader (5 format modul), adapter (m/sock/guard), dispatch, globals, 4 shim.
- `scripts/vx-map.js` (acorn AST) → 2.153 command; denylist infra 9 command.
- `scripts/vx-wire.js` → commands.json + 799 wrapper + vxmenu + registry 1.749→3.644.
- Sisipkan guard tunggal di `Alya.js` (11 baris require + 11 baris guard, try/catch aman).
- Tambah jembatan `global.db.data` & helper globals (core.js vanXone) setelah uji mendeteksi `db.data.chats`.
- Bersihkan artefak smoke; siapkan `scripts/vx-deploy.sh` + bundle 1.7 MB.
- Verifikasi baseline runtime: 3 file bersama aman ditimpa.
- 4 audit adapter per-engine selesai (zenith, nimbus, aurora+lumen, pulse+orbit+vortex); temuan crash-level ditutup.
- Tambah `uncaughtException` neutralization, init 3 engine DB ke `vx/.data`, shim `lowdb/node` + `cheerio`, gating legacy `handler.limit/register/owner/...`, dan arg `reply(jid, teks, ...)` lumen.
- Pasang hook pasif `handler.all`/`handler.before` (20 plugin) lewat `lib/inbound.js` → `index.js` → `tryPassive`; state game disimpan di socket pasif stabil (WeakMap).
- Curam 3 tulisan plugin zenith ke `vx/.data` / `vx/.writable` (path traversal `gantiapi.js` ditutup).
- Deploy tarball berhasil 2x ke runtime; `vx-file-type@19.6.0` terpasang, service `alya-bot` active, marker online muncul.

### Test Results
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| `node --check` Alya.js + dispatch + 800 wrapper | 0 gagal | 0 gagal | PASS |
| Registry target exists | 3644/3644 | 3644/3644 | PASS |
| `scripts/vx-smoke.js` | 844/844 load | 844/844, 0 failure | PASS |
| `scripts/vx-dispatch-test.js` | semua PASS | 10/10 PASS | PASS |
| `scripts/vx-baileys-test.js` | semua PASS | 8/8 PASS | PASS |
| `scripts/vx-hook-test.js` | semua PASS | 6/6 PASS (lokal + runtime) | PASS |
| Shim `cheerio` default (9 plugin) | load OK | 9/9 load, 0 hook load error | PASS |
| Runtime service `alya-bot` | active | active, marker online muncul | PASS |
| Deploy ke runtime | — | 2x tarball, 973 file vx, 800 wrapper | PASS |
| Log runtime sejak restart terakhir | 0 error vx | 0 error | PASS |

### Errors
| Error | Resolution |
|-------|------------|
| `vx-wire.js` SyntaxError template literal bersarang | vxmenu jadi file statis, wire hanya daftarkan |
| `group-autogpt.js` reading 'chats' | jembatan `global.db.data` |
| Test AIRich awalnya FAIL | assertion salah level; interop OK, test diperbaiki |
| API key instabox tidak terbaca di tool MCP | pakai CLI `instabox` dengan key dari `/data/home/.instabox_key` |
| Free-plan cooldown / mesin suspended | `instabox wake` lalu deploy normal |
| Engine DB `getDatabase()` gagal (lowdb subpath) | shim scoped `lowdb/node` → lowdb@2 + init ke `vx/.data` |
| 3 hook gagal load: cheerio tanpa `default` | shim scoped `cheerio.mjs` (default + named), test #8 ditambahkan |
| `conn.reply(jid, teks, ...)` lumen tertukar | deteksi JID pada argumen pertama di adapter |
