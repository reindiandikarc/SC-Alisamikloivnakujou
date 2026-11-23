# Changelog — Sinkronisasi Alya V20 dengan V13 (Fix npm install & crash startup)

## Root cause dari 3 error di screenshot

1. **`Error: Cannot find module 'socketon'`**
   60 file di V20 (`index.js`, `alya.js`, seluruh `lib/*`, 55 file `plugins/cmd/*`) meng-`require('socketon')`.
   Paket **`socketon` tidak pernah ada** — tidak terdaftar di `package.json`, tidak ada di npm registry.
   Ini adalah rename yang salah dari `ryuuxalya` (nama paket baileys asli di V13). Ditemukan juga 3 file
   memakai `require('baileys')` (polos) dan 1 file memakai `require('@queenanya/baileys')` — total ada
   **4 nama berbeda** untuk paket yang sama di V20.

2. **`Error: Cannot find module 'chalk'`**
   Terjadi sebagai efek domino: instalasi `npm install` berhenti/gagal di tengah jalan akibat konflik
   ERESOLVE (lihat poin 3), sehingga sebagian package termasuk `chalk` tidak sempat ter-install meski
   `chalk` tercantum di `package.json`.

3. **`npm error ERESOLVE could not resolve` (baileys vs jimp)**
   V20 punya dependency eksplisit `"@whiskeysockets/baileys": "^6.7.9"` yang mensyaratkan peer
   `jimp@^1.6.0`, sementara root project memakai `"jimp": "^0.16.1"` → bentrok. V13 tidak pernah
   mendeklarasikan `@whiskeysockets/baileys` secara eksplisit sama sekali — baileys hanya diakses lewat
   `ryuuxalya` (fork GitHub `yuusuke1101/ryuuxalya`) yang meng-hoist `@whiskeysockets/baileys` ke
   `node_modules` secara transitive, sehingga 4 file yang memang butuh akses langsung
   (`lib/well.js`, `lib/swgc.js`, `lib/bugs/callbug.js`, `simple.js`) tetap bisa `require` paket itu
   tanpa membuat npm memvalidasi peer-dependency-nya secara ketat.

## Perubahan yang dilakukan

### 1. Unifikasi nama modul baileys → `ryuuxalya` (sesuai V13)
- `require('socketon')` → `require('ryuuxalya')` di 60 file (termasuk `index.js`, `alya.js`, `module.js`, seluruh `lib/*`, 55 file `plugins/cmd/*`)
- `require('baileys')` → `require('ryuuxalya')` di 3 file (`plugins/cmd/crm.js`, `obfus.js`, `obfuscate.js`)
- `require('@queenanya/baileys')` → `require('ryuuxalya')` di 1 file (`plugins/cmd/delsewa.js`)
- File `Alya.js` (huruf besar, 2.3MB, backup lama yang **tidak dipanggil** oleh `index.js`) sengaja tidak diubah — tidak berdampak pada startup, sudah pakai `ryuuxalya` di sebagian besar.
- 4 file yang memang butuh `@whiskeysockets/baileys` langsung dibiarkan apa adanya (sama seperti V13).

### 2. `package.json` disinkronkan penuh ke basis V13
- **`ryuuxalya`**: dipertahankan sebagai satu-satunya dependency baileys (`github:yuusuke1101/ryuuxalya`), sesuai instruksi — nama dari V13.
- **`jimp`**: dinaikkan ke `^0.22.12` (versi V13), dari sebelumnya `^0.16.1` di V20.
- **`@whiskeysockets/baileys` dihapus** dari dependency eksplisit (sumber ERESOLVE) — tetap tersedia lewat hoisting dari `ryuuxalya`, identik pola V13.
- **`chalk`** dipastikan tetap ada (`^4.1.2`).
- Ditambahkan 15 paket yang ada di V13 tapi hilang di V20 (`puppeteer`, `puppeteer-extra*`, `pm2`, `@tensorflow/tfjs-node`, `nsfwjs`, `bycf`, `fflate`, `ffmpeg`, `got-scraping`, `skia`, `socket.io-client`, `ytmusic-api`) — tidak dipakai langsung oleh kode V20 saat ini, dipertahankan untuk full parity sesuai instruksi.
- Ditambahkan `performance-now` (`^2.2.0`) — dipakai `module.js` sebagai alias `speed`, ternyata hilang dari **kedua** versi (bug lama, bukan regresi V20), sekarang diperbaiki.
- 12 paket yang memang eksklusif untuk V20 dan **terbukti dipakai kode** (`@napi-rs/canvas`, `@zanixongroup/uploader`, `colors`, `fluent-ffmpeg`, `libphonenumber-js`, `mime-types`, `moment`, `node-forge`, `undici`, `util`, `ws`) — dipertahankan.
- `allowScripts` digabung (union V13 + V20).
- `scripts.start` tetap punya `--max-old-space-size=2048` (peningkatan V20, dipertahankan).

### 3. `.npmrc`
- Ditambahkan `allow-git=all` (dari V13) di samping `legacy-peer-deps=true`, `fund=false`, `audit=false` yang sudah ada di V20 — memastikan instalasi dependency git (`ryuuxalya`) dan resolusi peer-dependency konsisten di kedua environment.

## Validasi yang dilakukan
- `python3 -m json.tool` pada `package.json` final → **valid**
- `node --check` pada 1540 file `.js` di seluruh proyek:
  - **Semua 1309 file `plugins/cmd/*` (plugin aktif) → lolos bersih**
  - Semua file inti (`index.js`, `alya.js`, `module.js`, `settings.js`, `lib/*` yang dipakai) → lolos bersih
  - 17 "gagal": 14 di antaranya adalah file `.js` yang isinya JSON (data cache, bukan kode — wajar gagal, tidak pernah di-`require` sebagai modul), 3 sisanya (`scrape/dzscrape.js`, `lib/alyabing.js`, `lib/helper.js`) adalah dead-code yang **tidak dipanggil di manapun** dan terbukti rusak identik/lebih parah di V13 aslinya (pra-eksisting, di luar cakupan perbaikan ini)

## Update (fix ETARGET performance-now)
- Versi `performance-now` yang saya tambahkan sebelumnya (`^2.2.0`) ternyata **tidak pernah dipublish** ke npm — versi terakhir paket ini adalah `2.1.0`. Ini menyebabkan `npm error ETARGET No matching version found for performance-now@^2.2.0`, yang membuat seluruh `npm install` gagal di tengah jalan (sehingga `chalk` ikut tidak terinstall, memicu error `Cannot find module 'chalk'` lagi).
- Sudah diperbaiki: `performance-now` diturunkan ke `^2.1.0`.

## Catatan
- `npm install` sesungguhnya tidak bisa dijalankan di sandbox ini (akses jaringan npm registry diblokir), jadi tidak bisa memverifikasi hasil install secara langsung — tapi akar penyebab ERESOLVE (dependency eksplisit `@whiskeysockets/baileys` yang bentrok peer dengan `jimp` lama) sudah dihilangkan, dan `legacy-peer-deps=true` di `.npmrc` menjadi pengaman tambahan.
- Silakan jalankan `npm install` di Pterodactyl seperti biasa, lalu `Start`. Jika masih ada error module lain yang belum ketahuan di sandbox ini, kirim log terbarunya.
