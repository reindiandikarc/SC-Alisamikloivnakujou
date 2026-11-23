# Reindiandikarc SC (Alya)

## Instalasi Lengkap

Bagian ini dimulai dari terminal kosong, tanpa Node.js terpasang. Ikuti sesuai sistem yang kamu pakai.

### Kebutuhan

- Node.js 20 atau lebih baru
- Git
- ffmpeg dan ffprobe
- Python 3, `make`, dan compiler C/C++ untuk modul native
- RAM minimal 2 GB, disarankan 4 GB

Setelah instalasi, cek dengan:

```bash
node -v
npm -v
git --version
ffmpeg -version
```

### Linux Debian atau Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl ca-certificates build-essential python3 ffmpeg
```

Pasang Node.js 20 lewat NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Atau pakai nvm tanpa NodeSource:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Termux

Gunakan Termux dari F-Droid. Versi Play Store sering tertinggal dan bisa gagal membangun modul native.

```bash
pkg update -y
pkg upgrade -y
pkg install -y git nodejs ffmpeg python clang make
termux-setup-storage
```

Cek `node -v`. Jika masih di bawah 20:

```bash
pkg upgrade -y nodejs
```

Jika tetap di bawah 20, pakai Ubuntu lewat proot-distro lalu ikuti langkah Linux di atas:

```bash
pkg install -y proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
```

### Clone dan pasang dependency

Lakukan langkah ini di Linux maupun Termux:

```bash
git clone https://github.com/reindiandikarc/SC-Alisamikloivnakujou.git
cd SC-Alisamikloivnakujou
npm install
```

`npm install` akan membangun modul native seperti `better-sqlite3`, `sharp`, dan `@roamhq/wrtc`. Proses ini bisa memakan waktu beberapa menit. Kalau gagal pada tahap build native, pasang dulu build tools di atas lalu ulangi:

```bash
npm rebuild
npm install
```

### Konfigurasi

Edit `toolkit/set/config.json`:

```bash
nano toolkit/set/config.json
```

- `owner`: nomor WhatsApp kamu dengan format `62xxx`, tanpa `+` atau spasi.
- `botname`, `botfullname`, `botnickname`: bawaan `Alya`. Nama ini dipakai persona autoai.
- `mongodb.uri`: kosongkan untuk memakai penyimpanan JSON. Isi dengan URI MongoDB jika kamu memakai MongoDB.

Variabel lingkungan `MONGODB_URI` juga bisa dipakai dan prioritasnya lebih tinggi daripada `config.json`. Contoh:

```bash
export MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/alyadb'
```

### Menjalankan bot

```bash
npm start
```

atau:

```bash
node index.js
```

Akan muncul pilihan `qr` atau `pairing`.

- `qr`: ketik `qr`, lalu buka WhatsApp > titik tiga > Perangkat tertaut > Tautkan perangkat, dan pindai kode yang muncul.
- `pairing`: ketik `pairing`, masukkan nomor WhatsApp kamu, lalu salin kode yang muncul. Di WhatsApp buka titik tiga > Perangkat tertaut > Masuk dengan nomor telepon, lalu masukkan kode tersebut.

Tunggu sampai koneksi berstatus `open`. Sesi tersimpan di folder `session/`.

### Menjalankan terus-menerus

Untuk menjaga bot tetap hidup setelah terminal ditutup, pakai PM2:

```bash
npm install -g pm2
pm2 start index.js --name alya
pm2 logs alya
pm2 save
pm2 startup
```

Di Termux, `pm2 startup` mungkin tidak tersedia. Jalankan `pm2 start index.js --name alya` lagi setelah Termux dibuka.

Update bot dengan:

```bash
git pull
npm install
pm2 restart alya
```

### Masalah umum

- `node -v` di bawah 20: upgrade Node.js dulu.
- `ERR_MODULE_NOT_FOUND`: jalankan `npm install` dari dalam folder `SC-Alisamikloivnakujou`.
- Error `gyp` atau build native: pasang `build-essential python3` di Linux, atau `clang make python` di Termux, lalu jalankan `npm rebuild`.
- Error terkait ffmpeg: pastikan `ffmpeg -version` berhasil.
- Ingin ganti nomor atau sesi rusak: hapus folder `session/`, lalu jalankan ulang bot dan pilih `qr` atau `pairing`.

---

### Cara Mengimpor Modul

```javascript
const fs = 'fs'.import();
// Atau bisa gunakan await untuk mengatasi promise
//const fs = await "fs".import()
```

---

### Cara Mengimpor Fungsi

Impor fungsi selalu dimulai dari awal, jadi tidak perlu kembali mundur dengan cara `../../`. Semua dimulai dari awal!

Misalnya, jika kita ingin mengimpor `events.js` yang terletak di `./tolkit/events.js` dari `./helpers/client.js`, maka cara pengambilannya adalah:

```javascript
const events = await './tolkit/events.js'.r();
```

---

## 📜 Konvensi Koding & Gaya Penulisan Pesan (Bell Logic)

Seluruh kontributor wajib mematuhi standar koding dan gaya penulisan pesan berikut agar seragam:

### 1. Lokalisasi Terpusat (Locale)
* **Dilarang meng-hardcode teks respon** langsung di dalam file handler/event.
* Semua string pesan harus diletakkan pada:
  - `toolkit/set/locale/id.js` (Bahasa Indonesia - referensi utama)
  - `toolkit/set/locale/en.js` (Bahasa Inggris)
* Panggil teks menggunakan `infos.<modul>.<properti>` atau `Data.infos.<modul>.<properti>`.

### 2. Standar Format Pesan WhatsApp
* **Deskripsi Komando (`\n> deskripsi`)**:
  - Tulis nama komando pada baris terpisah (contoh: `• .jadibot <nomor>`).
  - Baris bawahnya diawali karakter `> ` untuk memformat quote subtext (contoh: `> Tautkan bot baru`).
  - **Dilarang keras** menggunakan simbol panah (`➔`) untuk memisahkan komando dan deskripsi dalam satu baris.
* **Menu & Seksi**:
  - Gunakan emoji dan huruf kapital tebal untuk judul seksi (contoh: `📱 *KONEKSI & MANAGEMENT*`).
  - Berikan pemisah baris kosong agar nyaman dibaca di layar HP.
* **Tanpa Footer Alay**: Jangan menambahkan footer berlebihan atau alay di bagian bawah pesan.

### 3. Native WhatsApp Footer (`footer`)
* `Exp.sendMessage` mendukung property `footer` secara langsung. Gunakan format:
  ```javascript
  Exp.sendMessage(cht.id, { text: '...isi pesan...', footer: '...teks footer...' }, { quoted: cht })
  ```
* Footer WhatsApp tidak mendukung format markup (*bold*, _italic_, > quote). Selalu tulis sebagai teks polos biasa.

### 4. Aturan Teks Jadibot
* Gunakan istilah **"bot kamu"** atau **"bot"**, jangan gunakan istilah "Sub-Bot".
* Tampilkan slot tanpa simbol `#` (contoh: `Slot 1`, bukan `Slot #1`).
* Jangan kirim pesan proaktif (PC/DM) ke user pada event background (seperti auto-reconnect, cron, dll.) untuk mencegah ban WhatsApp.

---

## ✨ Fitur Event Emitter Lanjutan

Eksperimen terbaru menambahkan kemampuan **rekayasa command** dengan memanfaatkan `ev.on()` dan `ev.emit()`.  
Fitur ini memungkinkan Anda **menjalankan event secara manual**, memodifikasi input secara dinamis, dan membuat alur **command interaktif** yang sangat berguna untuk sistem AI yang hemat code.

---

## 🚀 Menambahkan Event Baru

Berikut adalah bagian-bagian yang tersedia dalam events ini:

```javascript
ev.on(
  {
    cmd: [''], // Ini adalah cmd fitur yang digunakan sebagai pemanggil event, Anda bisa meletakkan banyak cmd
    listmenu: [''], // Bagian ini akan terlihat dalam menu
    tag: '', // Tag ini menentukan di menu bagian mana list menu akan ditempatkan
    energy: 7, // Harga penggunaan energi pada event ini
    premium: false, //Mengharuskan premium/tidak untuk menggunakan fitur ini
    args: 'Masukkan teks!', // Mengharuskan input teks/quoted teks
    badword: false, //Memblokir badword pada args
    media: {
      // Membutuhkan media
      type: ['audio'], // Membutuhkan media bertipe audio (tipe terdiri dari audio, document, video, image, sticker) bisa digunakn bersama did alam array
      msg: 'Reply audionya?', // Respon jika tidak ada audio yang di-reply
      etc: {
        // Lain-lain
        seconds: 360, // Maksimal audio 360 detik
        msg: 'Audio tidak boleh lebih dari 360 detik!', // Respon jika lebih dari 360 detik
      },
      save: false, // Jika true maka media akan disimpan dalam bentuk file audio.mp3
    },
    urls: {
      //Membutuhkan url
      formats: ['pinterest.com', 'pin.it'], //Format url
      msg: true, //respon message or msg: 'isi pesan balasan'
    },
    isMention: true, //Membutuhkan mention (tag/reply/input nomor)
    isQuoted: false, //membutuhkan quoted,
    onlyGame: ['tebakgambar', 'tebakanime'], //Jika anda menambahkan onlyGame, event ini hanya bisa digunakan saat bermain salah satu game dalam array
  },
  ({ media }) => {
    // media adalah kembalian dari media yang di-download,
    // jika save false maka media adalah buffer,
    // jika save true maka media adalah nama file yang tersimpan
  }
);
```

Tambahkan file baru di `./helpers/Events/` atau gunakan pola berikut di file mana saja:
Menambahkan atau mengubah file di dalam folder `./helpers/Events` secara otomatis terdeteksi.

```javascript
ev.on(
  {
    cmd: ['ai'], // Command pemicu
    listmenu: ['ai'], // Tampil di menu dengan nama AI
    tag: 'tools', // Kategori menu
    energy: 5, // Energi yang digunakan
  },
  async ({ cht }) => {
    await cht.reply('Hai! Ini adalah balasan dari event ai.');
  }
);
```

## ⚡ Menjalankan Emit & Memodifikasi Input

Anda bisa **memanggil event lain secara paksa** menggunakan `ev.emit()`.
Misalnya, kita ingin mengganti command dan pertanyaan (`cht.cmd` dan `cht.q`) sebelum menjalankan ulang event:

```javascript
// Ubah command & input
cht.cmd = 'ai';
cht.q = 'Hai';

// Jalankan event 'ai' dengan data yang sudah dimodifikasi
ev.emit('ai', { cht });
```

Dengan cara ini, Anda bisa:

- **Mengalihkan** user ke command lain.
- Menyusun **alur percakapan interaktif**.
- Membuat sistem **multi-step AI** atau chatbot yang fleksibel.

---

## 🧩 Contoh: AI Interactive

Berikut contoh nyata bagaimana event lain bisa memicu event tambahan:
//code ini diterapkan di ./helpers/interactive.js

```javascript
let _ai = await bell(text);
let config = _ai?.data || {};

switch (config?.cmd) {
  case 'sticker':
    await cht.reply(config?.msg || 'ok', { replyAi: false });
    return ev.emit('s');

  case 'afk':
    await cht.reply(config?.msg || 'ok', { replyAi: false });
    cht.q = config?.cfg?.reason;
    return ev.emit('afk');

  case 'bard':
    await cht.reply(config?.msg || 'ok', { replyAi: false });
    cht.q = config.cfg?.query;
    return ev.emit('bard');
}
```

Contoh di atas menunjukkan:

- **Rekayasa command**: `config.cmd` menentukan event mana yang dijalankan.
- **Pengubahan input**: `cht.q` bisa diisi ulang untuk menyesuaikan pertanyaan.

---

## 💡 Manfaat Utama

- 🔄 **Dynamic Flow**: Alihkan perintah ke event lain dengan input yang disesuaikan.
- 🕹️ **Command Engineering**: Mengatur logika kompleks (AI, game, dsb.) tanpa duplikasi kode.
- 🎯 **Interaktif**: Buat chatbot multi-tahap atau sistem cerdas.

---

## 🙌 Thanks to All Contributors

Terima kasih kepada semua yang telah berkontribusi dan mendukung pengembangan project ini.  
Setiap masukan, ide, dan bantuan sangat berarti!

[![](https://contrib.rocks/image?repo=reindiandikarc/SC-Alisamikloivnakujou)](https://github.com/reindiandikarc/SC-Alisamikloivnakujou/graphs/contributors)

Jika namamu belum tercantum, atau ingin ditambahkan, silakan ajukan issue atau hubungi kami.

---

## Kontributor

- **Reindiandikarc**  
  [GitHub](https://github.com/reindiandikarc)  
  (Maintainer)

- **Hanif skizo**  
  [Instagram](https://instagram.com/htr.ox)
  (Berkontribusi dalam: penambahan game chess.js)

- **Barr**  
  [Instagram](https://www.instagram.com/pler.curutt)
  (Berkontribusi dalam: autoBackup(detector.js))

## 📄 License

[MIT](./LICENSE) © Reindiandikarc
