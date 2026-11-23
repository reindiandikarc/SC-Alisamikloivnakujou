# Changelog — Fix "Bot Hening Saat Diberi Command" (V20)

## Root cause

Bot **berhasil connect** karena proses koneksi WhatsApp terjadi di `index.js`,
sepenuhnya terpisah dari alur pemrosesan command. Tapi begitu ada pesan
command masuk (`.daftar`, dll), pesan itu diproses oleh `alya.js`, dan **kalau
terjadi error di titik manapun sebelum plugin sempat benar-benar dijalankan**
(saat membangun objek `ctx` yang sangat besar, saat `require('./Alya.js')`
untuk mode case, atau di logic lain di sepanjang dispatcher), error tersebut
tertangkap oleh `catch` paling luar di `alya.js` — dan **dibungkam total**
kalau environment `NODE_ENV=production` (umum di Pterodactyl/produksi).

Perbandingan langsung dengan V13 di titik kode yang identik (fungsi
`module.exports = alya = async (...) => { ... }`):

**V13** (baris ~68612, selalu log):
```js
} catch (err) {
console.log(util.format(err))
let e = String(err)
}
```

**V20 sebelum fix** (baris ~7491, di-gate NODE_ENV):
```js
} catch (err) {
if (process.env.NODE_ENV !== 'production') console.error('[Alya Handler Error]', err?.message || util.format(err))
let e = String(err)
}
```

Kalau panel Pterodactyl set `NODE_ENV=production` (baik lewat konfigurasi egg
maupun default Node), maka:
1. Command masuk → error terjadi di suatu tempat di dispatcher.
2. Error ditangkap `catch`, tapi `console.error` di dalamnya tidak pernah
   jalan → **tidak ada apapun di log panel**.
3. Karena error terjadi sebelum `alya.sendMessage(...)` balasan sempat
   dipanggil → **bot tidak membalas apapun ke user**.
4. Bot sendiri tidak crash (exception sudah tertangkap try/catch) → proses
   tetap hidup, koneksi WhatsApp tetap "connected" — persis gejala yang
   dilaporkan: connect normal, tapi hening total begitu diberi command,
   tanpa jejak log sama sekali.

Ditemukan **3 titik** dengan pola sama di `alya.js` (semuanya tidak ada di
V13, murni ditambahkan di V20):
- Baris ~1453 — `catch` inisialisasi `db.data` per-pesan
- Baris ~7493 — `catch` paling luar yang membungkus **seluruh** isi
  dispatcher (**ini yang paling kritis** — cakupannya dari awal parsing
  pesan sampai plugin selesai jalan)
- Baris ~7501 — handler global `process.on('uncaughtException', ...)`

Satu tempat yang **sudah benar** sebelumnya dan jadi rujukan pola fix (baris
~7382, komentarnya sendiri bilang "Selalu log error terlepas dari NODE_ENV"):
error di dalam eksekusi plugin individual (`p.run(alya, m, ctx)`) memang
sudah tidak di-gate — menunjukkan ini inkonsistensi yang luput saat menambah
lapisan pelindung baru (sewa enforcement, mode switch case/plugin, dll) di
V20, bukan kesalahan desain yang disengaja.

## Perubahan yang dilakukan

### 1. `alya.js` baris ~1453 (DB Init Error)
`console.error` dibuka dari gate `NODE_ENV` → selalu log. Error inisialisasi
`db.data`/`db.data.chats` di sini bisa membuat pesan berikutnya diproses
dengan state tidak lengkap, jadi harus selalu kelihatan di log.

### 2. `alya.js` baris ~7491 (catch handler utama dispatcher)
- `console.error` dibuka dari gate `NODE_ENV` → selalu log, plus sekarang
  menyertakan `command` yang sedang diproses dan `err.stack` supaya lokasi
  error di kode bisa langsung ditemukan dari log (sebelumnya cuma
  `err.message`, sering kurang untuk melacak baris mana yang error).
- **Baru:** kalau error terjadi saat memproses sebuah command (`isCmd` true),
  bot sekarang mengirim balasan singkat ke user (`❌ Terjadi kesalahan
  internal...`) alih-alih diam total — konsisten dengan pola yang sudah
  dipakai di plugin runner (baris ~7379-7392) dan di mode case `Alya.js`.
  Ini murni fallback pengaman; begitu root cause error yang sebenarnya sudah
  kelihatan di log dan diperbaiki, pesan ini seharusnya jarang muncul.

### 3. `alya.js` baris ~7498 (uncaughtException)
`console.error` dibuka dari gate `NODE_ENV` → selalu log, plus `err.stack`.

## Yang TIDAK diubah (sudah dicek dan aman)
- `plugins/cmd_registry.json` — 1744 command terdaftar, `.daftar` →
  `plugins/cmd/daftar.js`, valid.
- `plugins/cmd/daftar.js` — sintaks valid, tidak ada masalah.
- `lib/prefix.js` (multi-prefix `.`/`/`/`!`) — logic matching aman, `.` tetap
  jadi default.
- `database/setting.json` — valid, `prefix: "."`, tidak ada `cmdMode`
  tersimpan (berarti default mode = **plugin**, bukan case — sesuai
  ekspektasi kalau belum pernah `.switchcase`).
- Mekanisme `.switchcase` / `.switchplugin` sendiri (baris ~7301-7337) —
  logic toggle-nya benar, dan `Alya.js` (case handler) sudah diekspor dengan
  signature yang cocok (`async function AlyaCaseHandler(alya, m, ctx)`) serta
  sudah punya log error tanpa gate `NODE_ENV` sejak awal.
- Semua 90+ file JSON di `database/` — divalidasi, tidak ada yang corrupt.

## Update Kedua — "Menunggu pesan baru" saja, tidak ada log SAMA SEKALI

Laporan lanjutan: setelah fix pertama, command masih hening — dan yang lebih
penting, **panel tidak menampilkan log apapun** untuk pesan yang masuk dari
WA, bukan cuma tidak ada balasan. Ini mengubah diagnosis: masalahnya
kemungkinan besar bukan lagi di dalam `alya.js` (dispatcher command), karena
DIAG log paling awal di `index.js` (`pesan lolos gate, diteruskan ke alya.js
dispatcher`) pun tidak muncul. Artinya salah satu dari ini yang terjadi:

1. Pesan **memang belum sampai** ke listener `messages.upsert` (masalah level
   socket/koneksi Baileys), ATAU
2. Pesan sampai, tapi ter-`return` diam-diam oleh salah satu dari **32+ titik
   `return`** di sepanjang `alya.js` yang berada **sebelum** DIAG log lama
   (yang letaknya jauh di bawah, setelah semua blok fitur non-command seperti
   duel, kuis, sewa enforcement, dll).

Sudah diperiksa dan **dipastikan BUKAN penyebabnya** (identik dengan V13 atau
terbukti dead-code/tidak pernah dipanggil):
- Fungsi `smsg()` — identik byte-per-byte dengan V13.
- Struktur listener `messages.upsert` di `index.js` — logika inti (parse
  `kay.message`, gate `status@broadcast`, gate `903D`) identik dengan V13.
- `lib/msgqueue.js` dan `lib/perfguard.js` — dua modul baru di V20 yang
  awalnya dicurigai me-reroute pesan, ternyata **tidak pernah di-`require`**
  di `index.js` maupun `alya.js` sama sekali (dead code, tidak berdampak).
- Urutan `store.bind(alya.ev)` → `connection.update` → `await delay(5555)` →
  `creds.update` → `messages.upsert` — urutannya identik dengan V13 (jendela
  ~5.5 detik sebelum `messages.upsert` ter-daftar memang sudah ada sejak V13,
  bukan regresi baru).
- Tidak ada override global terhadap `console.log`/`console.error`/
  `process.stdout.write` di manapun dalam codebase.

### Instrumentasi baru yang ditambahkan (bukan tebakan — untuk memastikan)

Karena tidak mungkin memverifikasi socket WhatsApp yang sebenarnya dari
sandbox ini, langkah paling tepat sekarang adalah membuat **setiap titik
kritis selalu ber-log tanpa syarat**, sehingga log berikutnya akan menunjukkan
PERSIS di mana pesan berhenti:

1. **`index.js` — `connection.update`** (log baru, `[DIAG-CONN]`): mencetak
   status koneksi (`open`/`close`/`connecting`) SETIAP kali berubah. Kalau
   bot diam-diam reconnect berkali-kali (misalnya karena socket lama belum
   benar-benar mati sebelum socket baru dibuat), ini akan kelihatan sebagai
   banyak baris `[DIAG-CONN]` berturut-turut alih-alih sekali saja.

2. **`index.js` — `messages.upsert`** (log baru, `[DIAG-RAW]`, di baris
   PALING AWAL callback, sebelum `if (!kay.message) return`): mencetak setiap
   kali event ini terpanggil oleh Baileys, apapun isinya. **Ini yang paling
   penting** — kalau baris ini TIDAK PERNAH muncul walau sudah kirim pesan
   dari WA, maka masalahnya 100% di level Baileys/socket (bukan di kode
   `alya.js`/`index.js` sama sekali), dan langkah selanjutnya adalah cek
   versi `ryuuxalya` yang benar-benar ter-install serta status sesi/pairing.

3. **`alya.js`** (log baru, `[DIAG-ENTRY]`, dipindah ke titik PALING AWAL
   fungsi, tepat setelah `body`/`isCmd`/`command` selesai di-parse — jauh
   SEBELUM 32+ blok fitur lain yang masing-masing punya jalur `return`
   sendiri): mencetak setiap pesan yang sampai ke `alya.js`, terlepas dari
   fitur apapun yang mungkin `return` duluan di bawahnya. DIAG log lama
   (`[DIAG] alya.js dispatcher tercapai...`) dibiarkan tetap ada di posisi
   lamanya sebagai penanda kedua — kalau `[DIAG-ENTRY]` muncul tapi log lama
   itu TIDAK muncul, artinya salah satu dari puluhan blok fitur (duel, kuis,
   sewa enforcement, dll) itulah yang men-`return` duluan, dan tinggal dicari
   dari situ.

### Cara pakai untuk diagnosis presisi
1. Deploy ZIP ini, restart bot.
2. Perhatikan log saat startup — pastikan ada `[DIAG-CONN] connection=open`
   MUNCUL SEKALI (bukan berkali-kali berturut-turut).
3. Kirim `.daftar` dari WA.
4. Cek urutan log yang muncul:
   - **Tidak ada `[DIAG-RAW]` sama sekali** → masalah di level koneksi
     Baileys/socket, bukan di logic bot. Kirim output lengkap `npm ls
     ryuuxalya` dan log lengkap sejak startup.
   - **Ada `[DIAG-RAW]` tapi tidak ada `[DIAG-ENTRY]`** → pesan ke-filter di
     `index.js` sendiri sebelum sempat panggil `alya.js` (cek baris
     "pesan diblokir oleh gate public/self mode" atau "kay.message kosong").
   - **Ada `[DIAG-ENTRY]` tapi tidak ada `[DIAG] alya.js dispatcher
     tercapai...`** → salah satu blok fitur (duel/kuis/sewa/dll) men-`return`
     duluan. Kirim log persis di sekitar situ untuk saya telusuri blok mana.
   - **Semua muncul tapi tetap tidak ada balasan** → errornya ada di
     eksekusi plugin itu sendiri, harusnya sekarang sudah ter-log dengan
     jelas oleh fix `[Alya Handler Error]` / `[Plugin Run Error]` di atas.

