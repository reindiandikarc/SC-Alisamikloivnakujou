# Fix "Bot Hening" V3 — pesan masuk tidak muncul di log & tidak dibalas

## Temuan
1. Semua log diagnosa di-gate `global.DEBUG_DIAG` (default false) dan log chat di `alya.js`
   di-gate `NODE_ENV !== 'production'` → di panel, pesan yang masuk tidak pernah tercetak.
2. Pesan gagal dekripsi (stub CIPHERTEXT) langsung di-`return` tanpa log; logger Baileys `silent`.
3. Hanya `messages[0]` yang diproses (batch dibuang).
4. `await delay(5555)` membuat `creds.update` & `messages.upsert` telat terpasang; pairing
   (menunggu input) terjadi sebelum listener terpasang.
5. Owner berformat `@lid` tidak dikenali di mode SELF.
6. `setInterval` (anigame, sewa) menumpuk tiap reconnect dan memakai socket lama.
7. KEAMANAN: `alya.js` menganggap JID dari tabel Supabase eksternal sebagai OWNER (bisa `.getsession`).

## Perubahan
- BARU `lib/inbound.js`: handler pesan masuk, selalu log `[MSG]`, proses semua pesan batch,
  peringatan jelas untuk pesan gagal dekripsi, owner LID-aware, error ter-log penuh.
- BARU `lib/bootcheck.js`: cetak `[BOOT]` versi Node/ryuuxalya/libsignal, deteksi libsignal ganda,
  paket libsignal tiruan berbahaya, status sesi.
- `index.js`: listener dipasang segera; pairing dipindah ke akhir; `[CONN]` selalu log; versi WA
  di-fetch (fallback aman); logger Baileys `error` (env `BAILEYS_LOG_LEVEL`); `getMessage` via store;
  timer tidak menumpuk; hint `[HEALTH]` bila 2 menit tanpa event pesan.
- `alya.js`: `[CMD]` selalu log; owner dari Supabase jadi opt-in.
- `settings.js`: `global.allowRemoteOwners = false`.

## Env opsional
- `LOG_MESSAGES=false` matikan log `[MSG]`  |  `BAILEYS_LOG_LEVEL=debug|error|silent`
