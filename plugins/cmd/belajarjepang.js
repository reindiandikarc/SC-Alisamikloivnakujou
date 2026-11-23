// ============================================================
// Plugin: belajarjepang — Kursus Bahasa Jepang Berjenjang
// Commands: belajarjepang, bjp, bjpsoal, bjpjawab, bjpstatus,
//           bjpstop, bjpleaderboard, bjpmateri
// Author  : Alya Bot V20
// Access  : PREMIUM ONLY
// ============================================================
//
// Alur:
//  1. User ketik .belajarjepang [level] → pilih N5/N4/N3/N2/N1
//  2. Bot kirim materi (teks edukatif lengkap)
//  3. Jeda 5 menit (timer) → bot otomatis kirim soal
//     OR user ketik .bjpsoal → langsung minta soal tanpa nunggu
//  4. User jawab dengan .bjpjawab [jawaban]
//  5. Nilai, exp, progress tersimpan di JSON
//  6. Setelah X soal benar → naik ke materi berikutnya
// ============================================================

'use strict'

const fs   = require('fs')
const path = require('path')

// ── Path DB ────────────────────────────────────────────────────────────────────
const DB_PATH = './database/belajarjepang.json'

// ── Konstanta ──────────────────────────────────────────────────────────────────
const MATERI_TIMER_MS  = 5 * 60 * 1000   // 5 menit jeda setelah materi
const SOAL_TIMEOUT_MS  = 3 * 60 * 1000   // 3 menit untuk jawab soal
const SOAL_BENAR_NAIK  = 3               // soal benar berturut → naik materi
const EXP_BENAR        = 50
const EXP_SALAH        = 0
const MONEY_BENAR      = 200

// ── Kurikulum Lengkap N5→N1 (materi berurutan, bukan acak) ───────────────────
// Setiap level punya array materi, masing-masing punya: judul, penjelasan, soal[]
// soal = { q, hint, choices, answer, explain }
const KURIKULUM = {
  N5: [
    // ── UNIT 1: Hiragana ──────────────────────────────────────────────────────
    {
      id: 'N5-U1-01',
      judul: '📖 Hiragana — Baris A (あ行)',
      materi: `
╔══════════════════════════════╗
║  🇯🇵 N5 • Unit 1 — Hiragana  ║
╚══════════════════════════════╝

*Hiragana* adalah aksara dasar bahasa Jepang.
Ada 46 karakter utama. Kita mulai dari baris pertama!

┌─────────────────────────────
│ あ (a)   い (i)   う (u)
│ え (e)   お (o)
└─────────────────────────────

💡 *Tips Hafal:*
› あ (a)   — seperti huruf "A" terbalik
› い (i)   — dua garis vertikal, bunyi "i"
› う (u)   — seperti kepala burung hantu
› え (e)   — ada garpu di tengahnya
› お (o)   — ada titik tambahan di kanan

📝 *Contoh Kata:*
› あおい (aoi)   = biru
› いえ (ie)      = rumah
› うえ (ue)      = atas
› えき (eki)     = stasiun
› おかあさん (okaasan) = ibu

🔊 *Cara Baca:*
Hiragana dibaca persis seperti romaji-nya.
"あいうえお" → "a-i-u-e-o"
`.trim(),
      soal: [
        {
          q: 'Hiragana manakah yang berbunyi *"u"*?',
          choices: ['あ', 'い', 'う', 'え'],
          answer: 'う',
          explain: 'う dibaca "u". Ingat bentuknya seperti kepala burung hantu kecil! 🦉'
        },
        {
          q: 'Apa arti kata *"いえ"* (ie)?',
          choices: ['Sekolah', 'Rumah', 'Stasiun', 'Biru'],
          answer: 'Rumah',
          explain: 'いえ (ie) = rumah. Contoh: 「わたしのいえ」= rumah saya.'
        },
        {
          q: 'Hiragana *"え"* dibaca?',
          choices: ['a', 'i', 'u', 'e'],
          answer: 'e',
          explain: 'え = "e". Ada 5 vokal hiragana: あいうえお (a-i-u-e-o).'
        }
      ]
    },
    {
      id: 'N5-U1-02',
      judul: '📖 Hiragana — Baris KA & SA (か行・さ行)',
      materi: `
╔══════════════════════════════╗
║  🇯🇵 N5 • Unit 1 — Hiragana  ║
╚══════════════════════════════╝

Lanjut belajar hiragana! Kali ini baris *KA* dan *SA*.

┌──── Baris KA (か行) ─────────
│ か (ka)  き (ki)  く (ku)
│ け (ke)  こ (ko)
└─────────────────────────────

┌──── Baris SA (さ行) ─────────
│ さ (sa)  し (shi) す (su)
│ せ (se)  そ (so)
└─────────────────────────────

📝 *Contoh Kata:*
› かさ (kasa)   = payung
› きく (kiku)   = mendengar / bunga krisan
› くさ (kusa)   = rumput
› さかな (sakana) = ikan
› しごと (shigoto) = pekerjaan
› すし (sushi)  = sushi 🍣

💡 *Catatan:*
› し dibaca "shi" (bukan "si")
› Ini penting karena "si" tidak ada dalam bahasa Jepang!
`.trim(),
      soal: [
        {
          q: 'Apa bunyi dari hiragana *"き"*?',
          choices: ['ka', 'ki', 'ku', 'ke'],
          answer: 'ki',
          explain: 'き = "ki". Baris KA: か(ka) き(ki) く(ku) け(ke) こ(ko).'
        },
        {
          q: '*"さかな"* (sakana) artinya?',
          choices: ['Sayur', 'Ikan', 'Daging', 'Buah'],
          answer: 'Ikan',
          explain: 'さかな (sakana) = ikan. Sering muncul di percakapan dan soal N5!'
        },
        {
          q: 'Hiragana *"し"* dibaca?',
          choices: ['si', 'shi', 'chi', 'su'],
          answer: 'shi',
          explain: 'し = "shi", bukan "si". Ini perbedaan penting dalam fonetik Jepang!'
        }
      ]
    },
    {
      id: 'N5-U1-03',
      judul: '📖 Hiragana — Baris TA, NA, HA (た・な・は行)',
      materi: `
╔══════════════════════════════╗
║  🇯🇵 N5 • Unit 1 — Hiragana  ║
╚══════════════════════════════╝

┌──── Baris TA (た行) ─────────
│ た (ta)  ち (chi) つ (tsu)
│ て (te)  と (to)
└─────────────────────────────

┌──── Baris NA (な行) ─────────
│ な (na)  に (ni)  ぬ (nu)
│ ね (ne)  の (no)
└─────────────────────────────

┌──── Baris HA (は行) ─────────
│ は (ha/wa*) ひ (hi) ふ (fu)
│ へ (he/e*)  ほ (ho)
└─────────────────────────────

⚠️ *Perhatian Khusus:*
› ち = "chi" (bukan "ti")
› つ = "tsu" (bukan "tu")  
› ふ = "fu" (bukan "hu")
› は = biasanya "ha", tapi sebagai partikel dibaca "wa"
› へ = biasanya "he", tapi sebagai partikel dibaca "e"

📝 *Contoh Kata:*
› たべる (taberu) = makan
› ちかてつ (chikatetsu) = kereta bawah tanah
› なまえ (namae) = nama
› にほん (nihon) = Jepang 🇯🇵
› はな (hana) = bunga / hidung
`.trim(),
      soal: [
        {
          q: 'Hiragana *"ち"* dibaca?',
          choices: ['ti', 'chi', 'tchi', 'ci'],
          answer: 'chi',
          explain: 'ち = "chi". Bersama つ (tsu) dan ふ (fu), ini pengecualian pelafalan penting!'
        },
        {
          q: '*"にほん"* (nihon) artinya?',
          choices: ['Korea', 'China', 'Jepang', 'Amerika'],
          answer: 'Jepang',
          explain: 'にほん (nihon) = Jepang. Nama resminya 日本 (Nihon/Nippon).'
        },
        {
          q: 'Kata *"たべる"* (taberu) artinya?',
          choices: ['Tidur', 'Minum', 'Makan', 'Jalan'],
          answer: 'Makan',
          explain: 'たべる (taberu) = makan. Bentuk kamus (dictionary form) dari kata kerja makan.'
        }
      ]
    },
    // ── UNIT 2: Katakana Dasar ────────────────────────────────────────────────
    {
      id: 'N5-U2-01',
      judul: '📖 Katakana — Pengenalan & Baris A/KA',
      materi: `
╔════════════════════════════════╗
║  🇯🇵 N5 • Unit 2 — Katakana   ║
╚════════════════════════════════╝

*Katakana* dipakai untuk:
› Kata serapan asing (gairaigo)
› Nama orang / tempat asing
› Onomatope / efek suara

┌──── Vokal (ア行) ────────────
│ ア (a)  イ (i)  ウ (u)
│ エ (e)  オ (o)
└─────────────────────────────

┌──── Baris KA (カ行) ─────────
│ カ (ka)  キ (ki)  ク (ku)
│ ケ (ke)  コ (ko)
└─────────────────────────────

📝 *Contoh Kata Serapan:*
› アイスクリーム (aisu kuriimu) = ice cream 🍦
› カメラ (kamera) = camera 📷
› コーヒー (koohii) = coffee ☕
› インターネット (intaanetto) = internet

💡 *Tips:*
ー (garis panjang) = memanjangkan vokal sebelumnya
コーヒー = ko-o-hi-i = "koohii" (coffee)
`.trim(),
      soal: [
        {
          q: 'Katakana *"コーヒー"* artinya?',
          choices: ['Cola', 'Coffee', 'Cake', 'Cookie'],
          answer: 'Coffee',
          explain: 'コーヒー (koohii) = coffee. Simbol ー memanjangkan bunyi vokal sebelumnya.'
        },
        {
          q: 'Katakana digunakan untuk menulis?',
          choices: ['Kata asli Jepang', 'Kata serapan asing', 'Kalimat formal', 'Angka'],
          answer: 'Kata serapan asing',
          explain: 'Katakana dipakai untuk gairaigo (kata serapan), nama asing, dan onomatope.'
        },
        {
          q: 'Bunyi katakana *"ウ"* adalah?',
          choices: ['a', 'i', 'u', 'e'],
          answer: 'u',
          explain: 'ウ = "u". Bunyi vokal katakana sama dengan hiragana: ア(a) イ(i) ウ(u) エ(e) オ(o).'
        }
      ]
    },
    // ── UNIT 3: Angka & Waktu ─────────────────────────────────────────────────
    {
      id: 'N5-U3-01',
      judul: '📖 Angka Jepang (数字 - Suuji)',
      materi: `
╔══════════════════════════════╗
║  🇯🇵 N5 • Unit 3 — Angka     ║
╚══════════════════════════════╝

Mengenal angka adalah fondasi penting!

┌──── Angka 1-10 ──────────────
│ 1  いち (ichi)
│ 2  に   (ni)
│ 3  さん (san)
│ 4  し/よん (shi / yon)
│ 5  ご   (go)
│ 6  ろく (roku)
│ 7  しち/なな (shichi / nana)
│ 8  はち (hachi)
│ 9  く/きゅう (ku / kyuu)
│ 10 じゅう (juu)
└─────────────────────────────

┌──── Angka Besar ─────────────
│ 100  ひゃく (hyaku)
│ 1000 せん  (sen)
│ 10000 まん (man)
└─────────────────────────────

⚠️ *Catatan:*
› 4 = し (shi) atau よん (yon)
  → yon lebih umum (shi = kematian dalam budaya Jepang)
› 7 = しち (shichi) atau なな (nana)
  → nana sering dipakai agar tidak bingung dengan いち (ichi)

📝 *Contoh:*
› いくらですか？ (ikura desu ka?) = Berapa harganya?
› さんぜんえん (sanzen en) = 3000 yen
`.trim(),
      soal: [
        {
          q: 'Angka *5* dalam bahasa Jepang adalah?',
          choices: ['し', 'ご', 'ろく', 'に'],
          answer: 'ご',
          explain: 'ご (go) = 5. Urutan: いち(1) に(2) さん(3) し/よん(4) ご(5).'
        },
        {
          q: 'Mengapa angka 4 sering disebut *"yon"* bukan *"shi"*?',
          choices: [
            'Karena shi susah diucapkan',
            'Karena shi sama dengan kata "kematian"',
            'Karena yon lebih modern',
            'Karena shi hanya untuk matematika'
          ],
          answer: 'Karena shi sama dengan kata "kematian"',
          explain: 'し (shi) homofon dengan 死 (shi = kematian), sehingga よん (yon) lebih sering dipakai dalam kehidupan sehari-hari.'
        },
        {
          q: '*"さんぜんえん"* artinya?',
          choices: ['300 yen', '3000 yen', '30 yen', '3 yen'],
          answer: '3000 yen',
          explain: 'さん (3) + ぜん (sen = 1000) = 3000. さんぜんえん = 3000 yen.'
        }
      ]
    },
    // ── UNIT 4: Sapaan & Ekspresi Dasar ──────────────────────────────────────
    {
      id: 'N5-U4-01',
      judul: '📖 Sapaan & Ekspresi Sehari-hari',
      materi: `
╔══════════════════════════════════╗
║  🇯🇵 N5 • Unit 4 — Sapaan Dasar ║
╚══════════════════════════════════╝

Ekspresi ini *wajib* dihafalkan!

┌──── Sapaan Waktu ────────────
│ おはようございます (ohayou gozaimasu)
│   = Selamat pagi (formal)
│ おはよう (ohayou) = Selamat pagi (casual)
│
│ こんにちは (konnichiwa) = Halo / Siang
│ こんばんは (konbanwa) = Selamat malam
│ おやすみなさい (oyasumi nasai) = Selamat tidur
└─────────────────────────────

┌──── Ekspresi Penting ────────
│ ありがとう (arigatou) = Terima kasih
│ すみません (sumimasen) = Maaf / Permisi
│ ごめんなさい (gomen nasai) = Saya minta maaf
│ はい (hai) = Ya
│ いいえ (iie) = Tidak
│ わかります (wakarimasu) = Saya mengerti
│ わかりません (wakarimasen) = Saya tidak mengerti
└─────────────────────────────

💡 *Perbedaan Maaf:*
› すみません = minta maaf ringan / permisi (gangguin orang)
› ごめんなさい = minta maaf serius / menyesal

📝 *Dialog Contoh:*
A: こんにちは！
B: こんにちは！おげんきですか？(apa kabar?)
A: はい、げんきです。ありがとう！(baik, terima kasih!)
`.trim(),
      soal: [
        {
          q: '*"すみません"* digunakan untuk?',
          choices: ['Ucapan terima kasih', 'Permisi / maaf ringan', 'Selamat pagi', 'Sampai jumpa'],
          answer: 'Permisi / maaf ringan',
          explain: 'すみません (sumimasen) = permisi atau maaf ringan. Contoh: memanggil pelayan restoran atau minta maaf karena gangguin seseorang.'
        },
        {
          q: 'Cara mengucapkan selamat malam yang benar?',
          choices: ['おはよう', 'こんにちは', 'こんばんは', 'さようなら'],
          answer: 'こんばんは',
          explain: 'こんばんは (konbanwa) = selamat malam. こんにちは = siang/halo, おはよう = pagi, さようなら = sampai jumpa.'
        },
        {
          q: '*"わかりません"* artinya?',
          choices: ['Saya mengerti', 'Saya tidak mengerti', 'Saya suka', 'Saya tidak suka'],
          answer: 'Saya tidak mengerti',
          explain: 'わかりません (wakarimasen) = tidak mengerti. Bentuk negatif dari わかります (wakarimasu = mengerti). Akhiran -masen = bentuk negatif sopan.'
        }
      ]
    },
    // ── UNIT 5: Pola Kalimat Dasar ────────────────────────────────────────────
    {
      id: 'N5-U5-01',
      judul: '📖 Pola Kalimat: は～です (wa ~ desu)',
      materi: `
╔══════════════════════════════════╗
║  🇯🇵 N5 • Unit 5 — Pola Kalimat ║
╚══════════════════════════════════╝

Pola paling dasar bahasa Jepang!

┌──── Rumus ──────────────────
│ [Subjek] は [Predikat] です
│ (wa)               (desu)
│
│ → "Subjek adalah Predikat"
└─────────────────────────────

📝 *Contoh:*
› わたしは がくせいです。
  (Watashi wa gakusei desu.)
  = Saya adalah pelajar.

› これは ほんです。
  (Kore wa hon desu.)
  = Ini adalah buku.

› かれは せんせいです。
  (Kare wa sensei desu.)
  = Dia (laki-laki) adalah guru.

┌──── Negatif ────────────────
│ [Subjek] は [Predikat] ではありません
│ (wa)               (dewa arimasen)
│
│ → "Subjek bukan Predikat"
└─────────────────────────────

📝 *Contoh Negatif:*
› わたしは せんせいではありません。
  = Saya bukan guru.

┌──── Kosakata Baru ──────────
│ わたし (watashi) = saya
│ がくせい (gakusei) = pelajar
│ せんせい (sensei) = guru
│ これ (kore) = ini
│ ほん (hon) = buku
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: 'Partikel *"は"* dalam pola は～です berfungsi sebagai?',
          choices: ['Objek', 'Penanda topik/subjek', 'Penanda waktu', 'Penanda tempat'],
          answer: 'Penanda topik/subjek',
          explain: 'は (wa) adalah partikel topik. Menandai subjek yang sedang dibicarakan. "わたしは" = "saya (topiknya adalah)".'
        },
        {
          q: 'Terjemahan *"これは ほんです"* adalah?',
          choices: ['Ini bukan buku', 'Itu adalah buku', 'Ini adalah buku', 'Buku ini mahal'],
          answer: 'Ini adalah buku',
          explain: 'これ(kore) = ini (dekat pembicara), は(wa) = partikel topik, ほん(hon) = buku, です(desu) = adalah.'
        },
        {
          q: 'Bentuk negatif dari *"です"* adalah?',
          choices: ['ではない', 'じゃない', 'ではありません', 'Semua benar (tergantung formalitas)'],
          answer: 'Semua benar (tergantung formalitas)',
          explain: 'ではありません = formal/sopan. じゃない atau ではない = kasual. Semuanya benar tergantung konteks.'
        }
      ]
    }
  ],

  // ── N4 ────────────────────────────────────────────────────────────────────────
  N4: [
    {
      id: 'N4-U1-01',
      judul: '📖 N4 — Kata Kerja Bentuk Te (て形)',
      materi: `
╔════════════════════════════════╗
║  🇯🇵 N4 • Unit 1 — Bentuk Te   ║
╚════════════════════════════════╝

Bentuk *て (te)* adalah salah satu bentuk paling penting di N4!
Digunakan untuk: menghubungkan kalimat, meminta tolong,
menyatakan sedang melakukan sesuatu, dan banyak lagi.

┌──── Aturan Konjugasi ────────
│ Grup 1 (う-verb): akhiran berubah
│  → く → いて  (例: かく → かいて)
│  → ぐ → いで  (例: およぐ → およいで)
│  → す → して  (例: はなす → はなして)
│  → つ/る/う → って (例: かつ → かって)
│  → む/ぶ/ぬ → んで (例: のむ → のんで)
│
│ Grup 2 (る-verb): る → て
│  (例: たべる → たべて)
│
│ Tidak Beraturan:
│  する → して
│  くる → きて
└─────────────────────────────

📝 *Penggunaan Utama:*
› 〜てください = tolong lakukan ~
  たべてください = Tolong makan.
› 〜ています = sedang melakukan ~
  たべています = Sedang makan.
› 〜てから = setelah melakukan ~
  たべてから、ねます = Setelah makan, tidur.

┌──── Kosakata ───────────────
│ かく (kaku) = menulis
│ のむ (nomu) = minum
│ たべる (taberu) = makan
│ する (suru) = melakukan
│ くる (kuru) = datang
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: 'Bentuk て dari *"たべる"* (taberu = makan) adalah?',
          choices: ['たべって', 'たべて', 'たべいて', 'たべんで'],
          answer: 'たべて',
          explain: 'たべる adalah る-verb (Grup 2). Aturannya sederhana: る → て. Jadi たべる → たべて.'
        },
        {
          q: '*"のんで"* adalah bentuk て dari kata apa?',
          choices: ['のむ', 'のぶ', 'のぬ', 'のる'],
          answer: 'のむ',
          explain: 'のむ (nomu = minum) → む berubah ke んで → のんで. Aturan: む/ぶ/ぬ → んで.'
        },
        {
          q: '*"〜ています"* digunakan untuk menyatakan?',
          choices: ['Aksi yang sudah selesai', 'Aksi yang sedang berlangsung', 'Aksi di masa depan', 'Permintaan'],
          answer: 'Aksi yang sedang berlangsung',
          explain: '〜ています = sedang melakukan. Contoh: "たべています" = sedang makan. Mirip -ing dalam bahasa Inggris.'
        }
      ]
    },
    {
      id: 'N4-U2-01',
      judul: '📖 N4 — Partikel に, で, を, が (Penggunaan Lanjut)',
      materi: `
╔══════════════════════════════════╗
║  🇯🇵 N4 • Unit 2 — Partikel     ║
╚══════════════════════════════════╝

Partikel adalah "lem" kalimat bahasa Jepang!
Di N4, kamu harus kuasai nuansa lebih dalam.

┌──── に (ni) ────────────────
│ ① Tujuan: がっこうに いきます
│   (Pergi ke sekolah)
│ ② Waktu: しちじに おきます
│   (Bangun jam 7)
│ ③ Keberadaan: つくえのうえに あります
│   (Ada di atas meja)
└─────────────────────────────

┌──── で (de) ────────────────
│ ① Tempat aksi: としょかんで べんきょうします
│   (Belajar di perpustakaan)
│ ② Alat/cara: でんしゃで いきます
│   (Pergi dengan kereta)
└─────────────────────────────

┌──── を (wo/o) ──────────────
│ Menandai objek langsung:
│ ほんを よみます = membaca buku
│ みずを のみます = minum air
└─────────────────────────────

┌──── が (ga) ────────────────
│ ① Subjek yang ditekankan
│ ② Setelah わかる, すき, できる
│ にほんごが すきです = Suka bahasa Jepang
│ にほんごが わかります = Mengerti bahasa Jepang
└─────────────────────────────

⚠️ *Beda に vs で untuk tempat:*
› に = lokasi KEBERADAAN (ada di mana)
› で = lokasi AKSI (melakukan sesuatu di mana)
`.trim(),
      soal: [
        {
          q: '"Belajar di perpustakaan" — partikel yang tepat untuk *perpustakaan* adalah?',
          choices: ['に', 'で', 'を', 'が'],
          answer: 'で',
          explain: 'で (de) menandai tempat melakukan aksi. "としょかんで べんきょうします" = belajar DI perpustakaan. Berbeda dengan に yang menandai keberadaan.'
        },
        {
          q: '"にほんごが すきです" artinya?',
          choices: ['Bisa bahasa Jepang', 'Belajar bahasa Jepang', 'Suka bahasa Jepang', 'Mengerti bahasa Jepang'],
          answer: 'Suka bahasa Jepang',
          explain: 'すき (suki) = suka. が di sini menandai objek dari perasaan. "にほんごが すきです" = suka (akan) bahasa Jepang.'
        },
        {
          q: 'Partikel *"を"* berfungsi sebagai?',
          choices: ['Penanda subjek', 'Penanda objek langsung', 'Penanda tempat', 'Penanda tujuan'],
          answer: 'Penanda objek langsung',
          explain: 'を (wo/o) menandai objek langsung dari kata kerja. "ほんを よむ" = membaca (objek) buku.'
        }
      ]
    },
    {
      id: 'N4-U3-01',
      judul: '📖 N4 — Kata Sifat い-形容詞 & な-形容詞',
      materi: `
╔════════════════════════════════════╗
║  🇯🇵 N4 • Unit 3 — Kata Sifat     ║
╚════════════════════════════════════╝

Ada dua jenis kata sifat (形容詞) di Jepang:

┌──── い-Adjective (い形容詞) ─────
│ Selalu berakhiran い
│ 
│ Positif: おおきい = besar
│ Negatif: おおきくない = tidak besar
│ Lampau:  おおきかった = dulu besar
│ Neg.Lam: おおきくなかった = dulu tidak besar
│
│ Contoh kata:
│ たかい (takai) = tinggi / mahal
│ やすい (yasui) = murah
│ おいしい (oishii) = enak
│ むずかしい (muzukashii) = sulit
└──────────────────────────────────

┌──── な-Adjective (な形容詞) ─────
│ Ditambah な sebelum kata benda
│
│ Positif: きれいな = cantik/bersih
│ Negatif: きれいじゃない = tidak cantik
│ Lampau:  きれいだった = dulu cantik
│
│ Contoh kata:
│ しずか (shizuka) = tenang/sepi
│ げんき (genki) = sehat/semangat
│ すき (suki) = suka (dianggap な-adj)
│ きれい (kirei) = cantik / bersih
└──────────────────────────────────

📝 *Penting:*
› きれい berakhiran い tapi BUKAN い-adjective!
› Ia adalah な-adjective: きれいなはな = bunga yang cantik
`.trim(),
      soal: [
        {
          q: 'Bentuk negatif dari *"たかい"* (mahal) adalah?',
          choices: ['たかじゃない', 'たかくない', 'たかないです', 'たかではない'],
          answer: 'たかくない',
          explain: 'い-adjective: い → くない untuk negatif. たかい → たかくない = tidak mahal/tinggi.'
        },
        {
          q: '"きれい" (kirei = cantik) termasuk jenis kata sifat apa?',
          choices: ['い-adjective', 'な-adjective', 'Kata kerja', 'Kata benda'],
          answer: 'な-adjective',
          explain: 'Meski berakhiran い, きれい adalah な-adjective. Buktinya: きれいな (bukan きれいい). Selalu cek di kamus!'
        },
        {
          q: 'Cara menyatakan "dulu enak" (lampau dari おいしい) adalah?',
          choices: ['おいしいでした', 'おいしかった', 'おいしくなかった', 'おいしいだった'],
          answer: 'おいしかった',
          explain: 'い-adjective bentuk lampau: い → かった. おいしい → おいしかった = dulu enak.'
        }
      ]
    }
  ],

  // ── N3 ────────────────────────────────────────────────────────────────────────
  N3: [
    {
      id: 'N3-U1-01',
      judul: '📖 N3 — Ekspresi Kausatif (〜させる / させます)',
      materi: `
╔══════════════════════════════════════╗
║  🇯🇵 N3 • Unit 1 — Bentuk Kausatif  ║
╚══════════════════════════════════════╝

Bentuk *kausatif* = menyuruh atau membiarkan seseorang melakukan sesuatu.

┌──── Rumus ──────────────────
│ う-verb: ない形 + せる
│  のむ → のま + せる → のませる
│
│ る-verb: る → させる
│  たべる → たべ + させる → たべさせる
│
│ Tidak beraturan:
│  する → させる
│  くる → こさせる
└─────────────────────────────

📝 *Penggunaan:*

① *Menyuruh* (atasan ke bawahan):
 せんせいは がくせいを よませました。
 (Guru menyuruh murid membaca.)

② *Membiarkan / mengizinkan*:
 こどもに あそばせました。
 (Membiarkan anak bermain.)

③ *〜させてください* = Tolong izinkan saya ~
 はなさせてください = Tolong izinkan saya bicara.
 やらせてください = Tolong izinkan saya mencoba.

┌──── Kosakata ───────────────
│ よむ (yomu) = membaca
│ あそぶ (asobu) = bermain
│ はなす (hanasu) = berbicara
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: 'Bentuk kausatif dari *"のむ"* (minum) adalah?',
          choices: ['のめる', 'のませる', 'のまれる', 'のもせる'],
          answer: 'のませる',
          explain: 'のむ (u-verb): bentuk ない = のまない → のま + せる = のませる. Artinya: menyuruh/membiarkan minum.'
        },
        {
          q: '*"やらせてください"* artinya?',
          choices: ['Izinkan saya melakukan itu', 'Saya ingin melakukan itu', 'Saya sudah melakukan itu', 'Saya tidak mau melakukan itu'],
          answer: 'Izinkan saya melakukan itu',
          explain: 'やらせてください = tolong izinkan saya mencoba/melakukan. Pola 〜させてください = permintaan sopan untuk diizinkan melakukan sesuatu.'
        },
        {
          q: 'Bentuk kausatif digunakan untuk menyatakan?',
          choices: [
            'Kemampuan melakukan sesuatu',
            'Menyuruh atau mengizinkan orang lain melakukan sesuatu',
            'Sesuatu yang terjadi secara alami',
            'Aksi yang dilakukan karena orang lain'
          ],
          answer: 'Menyuruh atau mengizinkan orang lain melakukan sesuatu',
          explain: 'Kausatif (〜させる) = menyuruh atau membiarkan/mengizinkan. Konteks menentukan makna mana yang tepat.'
        }
      ]
    },
    {
      id: 'N3-U2-01',
      judul: '📖 N3 — Ekspresi Kondisional (〜たら、〜ば、〜と)',
      materi: `
╔══════════════════════════════════════╗
║  🇯🇵 N3 • Unit 2 — Kondisional      ║
╚══════════════════════════════════════╝

Ada 4 cara menyatakan "jika/kalau" dalam bahasa Jepang!

┌──── ① 〜たら ───────────────
│ = "Kalau ~ (sudah terjadi)"
│ Paling umum & fleksibel!
│
│ あめがふったら、いえにいます。
│ = Kalau hujan, saya di rumah.
│
│ にほんにいったら、ずしをたべます。
│ = Kalau (sudah) pergi ke Jepang, makan sushi.
└─────────────────────────────

┌──── ② 〜ば ─────────────────
│ = "Jika ~ (kondisi)"
│ Lebih formal, sering untuk kondisi ideal
│
│ はやくおきれば、まにあいます。
│ = Kalau bangun lebih cepat, bisa tepat waktu.
└─────────────────────────────

┌──── ③ 〜と ─────────────────
│ = "Jika ~, maka selalu/otomatis ~"
│ Untuk fakta / hasil otomatis
│
│ はるになると、さくらがさきます。
│ = Kalau musim semi datang, bunga sakura mekar.
└─────────────────────────────

┌──── ④ 〜なら ──────────────
│ = "Kalau memang ~ (dari info yang diterima)"
│
│ にほんごをならうなら、ひらがなからはじめて。
│ = Kalau mau belajar Jepang, mulai dari hiragana.
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: 'Untuk menyatakan hasil *otomatis / alami* (musim → bunga mekar), kondisional yang tepat adalah?',
          choices: ['〜たら', '〜ば', '〜と', '〜なら'],
          answer: '〜と',
          explain: '〜と digunakan untuk hasil yang terjadi otomatis/natural. "はるになると、さくらがさきます" = Kalau musim semi, otomatis sakura mekar.'
        },
        {
          q: '〜たら paling tepat digunakan untuk situasi?',
          choices: [
            'Fakta ilmiah yang selalu benar',
            'Kondisi umum yang fleksibel, termasuk masa depan',
            'Kondisi yang sudah pasti terjadi',
            'Saran berdasarkan info dari lawan bicara'
          ],
          answer: 'Kondisi umum yang fleksibel, termasuk masa depan',
          explain: '〜たら adalah kondisional paling fleksibel dan paling sering dipakai dalam percakapan sehari-hari.'
        },
        {
          q: '*"〜なら"* lebih menekankan pada?',
          choices: [
            'Kondisi alam',
            'Kondisi berdasarkan informasi yang diterima dari lawan bicara',
            'Kondisi ideal',
            'Hasil yang pasti'
          ],
          answer: 'Kondisi berdasarkan informasi yang diterima dari lawan bicara',
          explain: '〜なら dipakai saat merespons info dari lawan bicara. "にほんにいくなら..." = "Kalau (katanya) mau ke Jepang..."'
        }
      ]
    }
  ],

  // ── N2 ────────────────────────────────────────────────────────────────────────
  N2: [
    {
      id: 'N2-U1-01',
      judul: '📖 N2 — Ekspresi Formal & Keigo (敬語)',
      materi: `
╔════════════════════════════════╗
║  🇯🇵 N2 • Unit 1 — Keigo       ║
╚════════════════════════════════╝

*Keigo* (敬語) = bahasa sopan/hormat Jepang.
Wajib di lingkungan kerja dan situasi formal!

┌──── Tiga Jenis Keigo ────────
│ ① 尊敬語 (Sonkeigo)
│   = Memuliakan aksi ORANG LAIN
│   いく → いらっしゃる
│   いる → いらっしゃる
│   くる → いらっしゃる
│   たべる → めしあがる
│   いう → おっしゃる
│   する → なさる
│
│ ② 謙譲語 (Kenjougo)
│   = Merendahkan aksi DIRI SENDIRI
│   いく → まいる
│   くる → まいる
│   いる → おる
│   たべる・のむ → いただく
│   いう → もうす
│   する → いたす
│
│ ③ 丁寧語 (Teineigo)
│   = Bahasa sopan biasa (〜ます/〜です)
└─────────────────────────────

📝 *Contoh Nyata:*
› 先生はどちらへ行かれますか？
  (Sensei, Anda mau ke mana?)
  → 行かれますか = Sonkeigo dari いく

› わたくしがまいります。
  (Saya yang akan pergi.)
  → まいります = Kenjougo dari いく

⚠️ *Penting:* Jangan campur Sonkeigo untuk diri sendiri!
`.trim(),
      soal: [
        {
          q: 'Kata *"めしあがる"* adalah Sonkeigo dari kata apa?',
          choices: ['いく', 'たべる・のむ', 'いる', 'する'],
          answer: 'たべる・のむ',
          explain: 'めしあがる = Sonkeigo (memuliakan) dari たべる (makan) dan のむ (minum). Digunakan saat berbicara tentang aksi orang yang dihormati.'
        },
        {
          q: 'Dalam Kenjougo, *"いただく"* digunakan sebagai pengganti?',
          choices: ['いく', 'いう', 'たべる・のむ', 'する'],
          answer: 'たべる・のむ',
          explain: 'いただく = Kenjougo dari たべる/のむ. Dipakai saat merendahkan aksi diri sendiri. "いただきます" sebelum makan adalah bentuk ini!'
        },
        {
          q: 'Jenis Keigo yang digunakan untuk *merendahkan aksi diri sendiri* adalah?',
          choices: ['Sonkeigo (尊敬語)', 'Kenjougo (謙譲語)', 'Teineigo (丁寧語)', 'Fukugo (複合語)'],
          answer: 'Kenjougo (謙譲語)',
          explain: 'Kenjougo = merendahkan diri sendiri untuk menghormati lawan bicara. Sonkeigo = memuliakan orang lain. Teineigo = bahasa sopan biasa.'
        }
      ]
    },
    {
      id: 'N2-U2-01',
      judul: '📖 N2 — Pola Tata Bahasa Kompleks',
      materi: `
╔════════════════════════════════════╗
║  🇯🇵 N2 • Unit 2 — Grammar Lanjut ║
╚════════════════════════════════════╝

Pola-pola N2 yang sering muncul di ujian!

┌──── 〜にもかかわらず ─────────
│ = Meskipun ~, namun ~
│ (lebih formal dari のに)
│
│ あめにもかかわらず、でかけた。
│ = Meskipun hujan, tetap pergi.
└─────────────────────────────

┌──── 〜をはじめ(として) ───────
│ = Termasuk ~, dimulai dari ~
│
│ にほんをはじめ、アジアの国々
│ = Dimulai dari Jepang, negara-negara Asia
└─────────────────────────────

┌──── 〜に反して ────────────
│ = Bertentangan dengan ~
│
│ きたいにはんして、しけんにおちた。
│ = Berlawanan dengan harapan, gagal ujian.
└─────────────────────────────

┌──── 〜ざるを得ない ─────────
│ = Tidak bisa tidak ~ / terpaksa ~
│ (formal, tekanan kuat)
│
│ いかざるをえない。
│ = Tidak bisa tidak pergi. / Terpaksa harus pergi.
└─────────────────────────────

┌──── 〜に過ぎない ──────────
│ = Hanyalah ~ / tidak lebih dari ~
│
│ これはすいそくにすぎない。
│ = Ini hanyalah dugaan.
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: '"Meskipun sudah belajar keras, nilainya jelek" — pola yang tepat?',
          choices: ['〜をはじめ', '〜にもかかわらず', '〜ざるを得ない', '〜に過ぎない'],
          answer: '〜にもかかわらず',
          explain: '〜にもかかわらず = meskipun ~. Digunakan saat hasil berlawanan dari yang diharapkan. "一生懸命勉強したにもかかわらず、成績が悪かった。"'
        },
        {
          q: '*"〜ざるを得ない"* mengekspresikan nuansa?',
          choices: ['Pilihan bebas', 'Keterpaksaan / tidak ada pilihan lain', 'Kemungkinan', 'Larangan'],
          answer: 'Keterpaksaan / tidak ada pilihan lain',
          explain: '〜ざるを得ない = terpaksa, tidak ada pilihan selain. Lebih kuat dari しなければならない dan lebih formal.'
        },
        {
          q: '"これはすいそくにすぎない" artinya?',
          choices: [
            'Ini adalah kesimpulan yang pasti',
            'Ini hanyalah dugaan/spekulasi',
            'Ini lebih dari sekadar dugaan',
            'Ini bertentangan dengan dugaan'
          ],
          answer: 'Ini hanyalah dugaan/spekulasi',
          explain: '〜に過ぎない = tidak lebih dari ~, hanyalah ~. すいそく = dugaan/spekulasi. Mengecilkan/meremehkan sesuatu.'
        }
      ]
    }
  ],

  // ── N1 ────────────────────────────────────────────────────────────────────────
  N1: [
    {
      id: 'N1-U1-01',
      judul: '📖 N1 — Pola Tata Bahasa Tingkat Tinggi',
      materi: `
╔══════════════════════════════════════╗
║  🇯🇵 N1 • Unit 1 — Grammar Ahli     ║
╚══════════════════════════════════════╝

Selamat datang di level tertinggi! N1 menguji kemampuan
memahami bahasa Jepang setara penutur asli.

┌──── 〜いかんにかかわらず ────
│ = Terlepas dari ~, apapun ~ nya
│ (sangat formal, tulisan resmi)
│
│ けっかのいかんにかかわらず、
│ さいぜんをつくします。
│ = Terlepas dari hasilnya, saya akan berusaha sebaik-baiknya.
└─────────────────────────────

┌──── 〜をおいて(ほかに)ない ──
│ = Tidak ada yang lain selain ~
│ (menekankan keunikan/ketidakgantian)
│
│ このしごとは、かれをおいてほかにいない。
│ = Tidak ada orang lain yang bisa mengerjakan ini selain dia.
└─────────────────────────────

┌──── 〜んがために ───────────
│ = Demi / untuk tujuan ~
│ (sangat formal/sastra)
│
│ かつるためにきびしくれんしゅうした。
│ Catatan: んがため = ため dengan nuansa tekad kuat
└─────────────────────────────

┌──── 〜てやまない ──────────
│ = Tidak bisa berhenti ~ / sangat/terus-menerus ~
│ Ekspresi perasaan yang tak tergoyahkan
│
│ あなたのかつやくをきたいしてやまない。
│ = Saya terus berharap akan aktivitasmu yang gemilang.
└─────────────────────────────

┌──── 〜ならではの ──────────
│ = Yang khas ~, yang hanya ada di ~
│
│ にほんならではのぶんか。
│ = Budaya yang khas hanya ada di Jepang.
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: '"Budaya yang hanya bisa ditemukan di Kyoto" — pola yang tepat?',
          choices: ['〜をおいてほかにない', '〜ならではの', '〜てやまない', '〜いかんにかかわらず'],
          answer: '〜ならではの',
          explain: '〜ならではの = yang khas, yang hanya ada di ~. "きょうとならではのぶんか" = budaya khas Kyoto yang tidak ditemukan di tempat lain.'
        },
        {
          q: '*"〜てやまない"* digunakan untuk mengekspresikan?',
          choices: [
            'Sesuatu yang selalu terjadi',
            'Perasaan yang sangat kuat dan terus-menerus',
            'Tindakan yang tidak bisa dihentikan secara fisik',
            'Kondisi yang tidak dapat diubah'
          ],
          answer: 'Perasaan yang sangat kuat dan terus-menerus',
          explain: '〜てやまない = tidak bisa berhenti merasakan ~. Sering dipakai untuk harapan, kekaguman, atau perasaan mendalam: 「愛してやまない」= mencintai dengan tulus sepenuhnya.'
        },
        {
          q: '*"いかんにかかわらず"* bermakna?',
          choices: [
            'Tergantung pada ~',
            'Hanya jika ~ terjadi',
            'Terlepas dari / apapun ~-nya',
            'Setelah ~ terjadi'
          ],
          answer: 'Terlepas dari / apapun ~-nya',
          explain: '〜いかんにかかわらず = regardless of ~, terlepas dari apapun hasilnya. Sangat formal, sering muncul di dokumen resmi dan N1.'
        }
      ]
    },
    {
      id: 'N1-U2-01',
      judul: '📖 N1 — Kosakata & Kanji Tingkat Tinggi',
      materi: `
╔══════════════════════════════════════╗
║  🇯🇵 N1 • Unit 2 — Kanji & Kosakata ║
╚══════════════════════════════════════╝

N1 membutuhkan ~2000 kanji dan ~10.000 kosakata!

┌──── Kanji Penting N1 ───────
│ 懸念 (kenen) = kekhawatiran
│ 顕著 (kencho) = menonjol, nyata
│ 概念 (gainen) = konsep, ide
│ 把握 (haaku) = memahami, menguasai
│ 醸成 (jousei) = memupuk, menumbuhkan
│ 齟齬 (sogo) = ketidaksesuaian, konflik
│ 逡巡 (shunjun) = ragu-ragu, bimbang
│ 蔑ろ (naigashiro) = meremehkan, mengabaikan
└─────────────────────────────

┌──── Kosakata Idiomatis ─────
│ 一石二鳥 (isseki nichou)
│ = Sekali dayung, dua tiga pulau terlampaui
│
│ 七転び八起き (nana korobi ya oki)
│ = Jatuh tujuh kali, bangkit delapan kali
│
│ 馬の耳に念仏 (uma no mimi ni nenbutsu)
│ = Masuk telinga kiri, keluar telinga kanan
└─────────────────────────────

┌──── Ekspresi Sastra ────────
│ 春暁 (shungyou) = fajar musim semi
│ 物の哀れ (mono no aware)
│   = Keindahan yang menyentuh hati akan
│     kefanaan segala sesuatu (konsep Jepang)
└─────────────────────────────
`.trim(),
      soal: [
        {
          q: '七転び八起き (nana korobi ya oki) artinya?',
          choices: [
            'Sekali dayung dua pulau terlampaui',
            'Jatuh tujuh kali, bangkit delapan kali',
            'Bersatu kita teguh, bercerai kita runtuh',
            'Masuk telinga kiri, keluar telinga kanan'
          ],
          answer: 'Jatuh tujuh kali, bangkit delapan kali',
          explain: '七転び八起き = jatuh berkali-kali tapi selalu bangkit. Ungkapan semangat pantang menyerah. Mirip "fall seven times, stand up eight" dalam bahasa Inggris.'
        },
        {
          q: '把握 (haaku) artinya?',
          choices: ['Kekhawatiran', 'Menonjol/nyata', 'Memahami/menguasai', 'Ragu-ragu'],
          answer: 'Memahami/menguasai',
          explain: '把握 (haaku) = memahami sepenuhnya, menguasai situasi. Contoh: "状況を把握する" = memahami situasi.'
        },
        {
          q: 'Konsep Jepang *"物の哀れ"* (mono no aware) mengacu pada?',
          choices: [
            'Kebahagiaan yang abadi',
            'Kekuatan alam Jepang',
            'Keindahan yang menyentuh hati akan kefanaan segala sesuatu',
            'Tradisi matsuri (festival)'
          ],
          answer: 'Keindahan yang menyentuh hati akan kefanaan segala sesuatu',
          explain: '物の哀れ adalah konsep estetika Jepang — perasaan haru dan indah yang lahir dari kesadaran akan kefanaan. Sering dikaitkan dengan bunga sakura yang gugur.'
        }
      ]
    }
  ]
}

// ── DB Functions ───────────────────────────────────────────────────────────────
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2))
      return { users: {} }
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch { return { users: {} } }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
  } catch (e) { console.error('[BelajarJepang] DB save error:', e.message) }
}

function getUser(db, sender) {
  if (!db.users[sender]) {
    db.users[sender] = {
      level: 'N5',
      unitIndex: 0,
      materiIndex: 0,
      benarBerturut: 0,
      totalBenar: 0,
      totalSalah: 0,
      exp: 0,
      active: false,
      waitingAnswer: false,
      soalIndex: 0,
      lastActivity: null
    }
  }
  return db.users[sender]
}

// ── Active session tracking (in-memory) ───────────────────────────────────────
// key: sender → { timerMateri, timerSoal, db }
const sessions = {}

function clearTimers(sender) {
  if (sessions[sender]) {
    if (sessions[sender].timerMateri) clearTimeout(sessions[sender].timerMateri)
    if (sessions[sender].timerSoal) clearTimeout(sessions[sender].timerSoal)
    sessions[sender].timerMateri = null
    sessions[sender].timerSoal = null
  }
}

// ── Build soal message ─────────────────────────────────────────────────────────
function buildSoalMsg(soal, idx, total, prefix) {
  const pilihan = soal.choices
    .map((c, i) => `│ ${String.fromCharCode(65 + i)}. ${c}`)
    .join('\n')
  return (
    `╔══════════════════════════════╗\n` +
    `║  ❓ SOAL ${idx + 1}/${total}              ║\n` +
    `╚══════════════════════════════╝\n\n` +
    `*${soal.q}*\n\n` +
    `┌──── Pilihan ────────────────\n` +
    `${pilihan}\n` +
    `└─────────────────────────────\n\n` +
    `⏳ Waktu: 3 menit\n` +
    `📝 Jawab: *${prefix}bjpjawab [A/B/C/D]*\n` +
    `_contoh: ${prefix}bjpjawab A_`
  )
}

// ── MODULE EXPORT ──────────────────────────────────────────────────────────────
module.exports = {
  command: ['belajarjepang', 'bjp', 'bjpsoal', 'bjpjawab', 'bjpstatus', 'bjpstop', 'bjpleaderboard', 'bjpmateri'],
  tags: ['edukasi', 'premium'],

  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      sender, pushname,
      isPrem, Ryuu,
      reply, replyalya, replytolak, replyprem,
      db: globalDb
    } = ctx

    // ── Cek premium ───────────────────────────────────────────────────────────
    if (!isPrem && !Ryuu) {
      return replyalya(
        `╔══════════════════════════════╗\n` +
        `║  🎌 *BELAJAR BAHASA JEPANG*   ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `✨ Fitur ini khusus untuk pengguna *Premium*!\n\n` +
        `🌸 Dengan akses Premium, kamu bisa:\n` +
        `│ 📚 Belajar Jepang N5 → N1\n` +
        `│ 🎯 Soal terstruktur & berurutan\n` +
        `│ 📊 Tracking progress & EXP\n` +
        `│ 🏆 Leaderboard global\n` +
        `│ ⏱️ Sistem materi + soal otomatis\n\n` +
        `💎 Hubungi owner untuk upgrade Premium!`
      )
    }

    const db = loadDB()
    const user = getUser(db, sender)

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpleaderboard — Top learners
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpleaderboard') {
      const sorted = Object.entries(db.users)
        .filter(([, u]) => u.totalBenar > 0)
        .sort((a, b) => b[1].exp - a[1].exp)
        .slice(0, 10)

      if (!sorted.length) {
        return replyalya('📊 Belum ada data leaderboard. Mulai belajar dengan *' + prefix + 'belajarjepang*!')
      }

      const medals = ['🥇', '🥈', '🥉']
      const rows = sorted.map(([jid, u], i) => {
        const medal = medals[i] || `${i + 1}.`
        const name = jid.split('@')[0]
        return `│ ${medal} ${name} — EXP: ${u.exp} | ✅${u.totalBenar} ❌${u.totalSalah} | ${u.level}`
      }).join('\n')

      return replyalya(
        `╔══════════════════════════════╗\n` +
        `║  🏆 LEADERBOARD BELAJAR 🇯🇵  ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `${rows}\n\n` +
        `_EXP = total pengalaman belajar_\n` +
        `_Level = JLPT tertinggi yang sedang dipelajari_`
      )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpstatus — Status user
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpstatus') {
      const kurikLevel = KURIKULUM[user.level] || []
      const unitNow = kurikLevel[user.unitIndex]
      const judulMateri = unitNow ? unitNow.judul : '—'
      const totalUnit = kurikLevel.length
      const pct = totalUnit > 0 ? Math.round((user.unitIndex / totalUnit) * 100) : 0
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))

      return replyalya(
        `╔══════════════════════════════╗\n` +
        `║  📊 STATUS BELAJAR JEPANG    ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `│ 👤 Nama    : ${pushname || 'User'}\n` +
        `│ 🎌 Level   : ${user.level}\n` +
        `│ 📖 Materi  : ${judulMateri}\n` +
        `│ ✅ Benar   : ${user.totalBenar}x\n` +
        `│ ❌ Salah   : ${user.totalSalah}x\n` +
        `│ ⭐ EXP     : ${user.exp}\n` +
        `│ 📈 Progress: [${bar}] ${pct}%\n\n` +
        `_Ketik *${prefix}belajarjepang* untuk lanjut belajar!_`
      )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpstop — Hentikan sesi
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpstop') {
      clearTimers(sender)
      user.active = false
      user.waitingAnswer = false
      saveDB(db)
      return replyalya(
        `🛑 *Sesi belajar dihentikan.*\n\n` +
        `Progress kamu tersimpan ya!\n` +
        `Mulai lagi kapan saja dengan *${prefix}belajarjepang*~ 🌸`
      )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpmateri — Tampilkan ulang materi sesi ini
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpmateri') {
      const kurik = KURIKULUM[user.level]
      if (!kurik) return replytolak('Level tidak valid.')
      const unit = kurik[user.unitIndex]
      if (!unit) return replyalya('Semua materi di level ini sudah selesai! 🎉')
      return replyalya(unit.materi + `\n\n_Ketik *${prefix}bjpsoal* jika sudah siap latihan soal!_`)
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpsoal — Minta soal sekarang (skip jeda 5 menit)
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpsoal') {
      if (!user.active) {
        return replyalya(
          `Kamu belum dalam sesi belajar!\n\nMulai dulu dengan *${prefix}belajarjepang [level]*\n` +
          `_Contoh: ${prefix}belajarjepang N5_`
        )
      }
      if (user.waitingAnswer) {
        const kurik = KURIKULUM[user.level]
        const unit = kurik?.[user.unitIndex]
        if (!unit) return
        const soal = unit.soal[user.soalIndex]
        if (!soal) return
        return replyalya(
          `⚠️ Masih ada soal yang belum dijawab!\n\n` +
          buildSoalMsg(soal, user.soalIndex, unit.soal.length, prefix)
        )
      }

      // Kirim soal berikutnya
      await sendSoal(alya, m, sender, user, db, prefix, replyalya)
      return
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .bjpjawab [jawaban] — Jawab soal
    // ══════════════════════════════════════════════════════════════════════════
    if (command === 'bjpjawab') {
      if (!user.active || !user.waitingAnswer) {
        return replyalya(
          `Tidak ada soal yang sedang aktif!\n` +
          `Mulai belajar: *${prefix}belajarjepang*`
        )
      }

      const jawaban = (args[0] || '').toUpperCase().trim()
      if (!jawaban || !['A', 'B', 'C', 'D'].includes(jawaban)) {
        return replytolak(`Jawab dengan huruf A, B, C, atau D.\nContoh: *${prefix}bjpjawab A*`)
      }

      const kurik = KURIKULUM[user.level]
      const unit = kurik?.[user.unitIndex]
      if (!unit) return

      const soal = unit.soal[user.soalIndex]
      if (!soal) return

      // Cek jawaban
      const pilihanIdx = jawaban.charCodeAt(0) - 65
      const jawabanUser = soal.choices[pilihanIdx]
      const benar = jawabanUser === soal.answer

      // Stop timer soal
      clearTimers(sender)
      user.waitingAnswer = false

      if (benar) {
        user.totalBenar++
        user.benarBerturut++
        user.exp += EXP_BENAR

        // Update money via globalDb jika ada
        try {
          if (globalDb?.users?.[sender]) {
            globalDb.users[sender].money = (globalDb.users[sender].money || 0) + MONEY_BENAR
          }
        } catch {}

        const semangatArr = [
          'Sugoi! すごい！ 🎉',
          'Yoshi! よし！ ✨',
          'Sou desu ne~! そうですね！ 🌸',
          'Kanpeki! かんぺき！ 💯',
          'Hontou ni jouzu! 本当に上手！ 🏆'
        ]
        const semangat = semangatArr[Math.floor(Math.random() * semangatArr.length)]

        await replyalya(
          `✅ *BENAR!* ${semangat}\n\n` +
          `📖 *Penjelasan:*\n${soal.explain}\n\n` +
          `│ +${EXP_BENAR} EXP | +${MONEY_BENAR} Money\n` +
          `│ Streak: ${user.benarBerturut}x berturut ✨`
        )

        // Cek apakah sudah selesai semua soal unit ini
        const soalBerikutnya = user.soalIndex + 1
        if (soalBerikutnya >= unit.soal.length) {
          // Semua soal unit ini selesai → cek naik materi
          user.soalIndex = 0
          if (user.benarBerturut >= SOAL_BENAR_NAIK) {
            user.unitIndex++
            user.benarBerturut = 0

            // Cek apakah level selesai
            const nextKurik = KURIKULUM[user.level]
            if (!nextKurik || user.unitIndex >= nextKurik.length) {
              // Naik level JLPT
              const levels = ['N5', 'N4', 'N3', 'N2', 'N1']
              const currIdx = levels.indexOf(user.level)
              if (currIdx < levels.length - 1) {
                user.level = levels[currIdx + 1]
                user.unitIndex = 0
                saveDB(db)
                return replyalya(
                  `🎊 *LEVEL UP! Selamat!*\n\n` +
                  `Kamu telah menyelesaikan *${levels[currIdx]}* dan naik ke *${user.level}*!\n\n` +
                  `⭐ Total EXP: ${user.exp}\n\n` +
                  `_Ketik *${prefix}belajarjepang ${user.level}* untuk lanjut ke level baru!_\n` +
                  `_Hmph... kamu memang tidak buruk ya! 😤💕_`
                )
              } else {
                saveDB(db)
                return replyalya(
                  `🏆 *LUAR BIASA!*\n\n` +
                  `Kamu telah menyelesaikan *SEMUA LEVEL N1-N5*!\n` +
                  `⭐ Total EXP: ${user.exp}\n\n` +
                  `_Selamat! Kamu sudah setara native speaker! 🎌_`
                )
              }
            }

            // Kirim materi berikutnya
            const nextUnit = KURIKULUM[user.level][user.unitIndex]
            saveDB(db)
            await replyalya(
              `🎯 *Unit selesai! Naik ke materi berikutnya!*\n\n` +
              `Berikutnya: *${nextUnit.judul}*\n\n` +
              `─────────────────────────\n` +
              nextUnit.materi +
              `\n─────────────────────────\n\n` +
              `⏳ Soal akan dikirim dalam *5 menit*.\n` +
              `Atau ketik *${prefix}bjpsoal* jika sudah siap! 🌸`
            )

            // Set timer 5 menit
            clearTimers(sender)
            sessions[sender] = sessions[sender] || {}
            sessions[sender].timerMateri = setTimeout(async () => {
              const dbNew = loadDB()
              const uNew = dbNew.users[sender]
              if (uNew?.active && !uNew?.waitingAnswer) {
                await alya.sendMessage(m.chat, {
                  text: `⏰ *Waktunya latihan soal!* Yuk uji pemahaman materi tadi~\n\n` +
                        await buildSoalAutoMsg(uNew, prefix)
                })
                uNew.waitingAnswer = true
                saveDB(dbNew)
              }
            }, MATERI_TIMER_MS)
          } else {
            // Belum cukup benar berturut, ulangi soal dari awal unit ini
            saveDB(db)
            return replyalya(
              `📝 *Soal unit selesai!*\n\n` +
              `Benar berturut: ${user.benarBerturut}/${SOAL_BENAR_NAIK}\n` +
              `Ulangi soal untuk mencapai ${SOAL_BENAR_NAIK} jawaban benar! 💪\n\n` +
              `Ketik *${prefix}bjpsoal* untuk soal berikutnya.`
            )
          }
        } else {
          user.soalIndex = soalBerikutnya
          saveDB(db)
          await replyalya(
            `Soal berikutnya siap! Ketik *${prefix}bjpsoal* atau tunggu otomatis~ 🌸`
          )
          // Auto kirim soal berikutnya setelah 10 detik
          sessions[sender] = sessions[sender] || {}
          sessions[sender].timerSoal = setTimeout(async () => {
            const dbN = loadDB()
            const uN = dbN.users[sender]
            if (uN?.active && !uN?.waitingAnswer) {
              await sendSoal(alya, m, sender, uN, dbN, prefix, async (txt) => {
                await alya.sendMessage(m.chat, { text: txt })
              })
            }
          }, 10000)
        }
      } else {
        // Salah
        user.totalSalah++
        user.benarBerturut = 0
        saveDB(db)

        await replyalya(
          `❌ *Salah!*\n\n` +
          `Jawaban kamu: *${jawaban}. ${jawabanUser || '?'}*\n` +
          `Jawaban benar: *${soal.answer}*\n\n` +
          `📖 *Penjelasan:*\n${soal.explain}\n\n` +
          `_Jangan menyerah! Coba lagi ya~ 💪_\n` +
          `Ketik *${prefix}bjpsoal* untuk soal berikutnya.`
        )
      }

      saveDB(db)
      return
    }

    // ══════════════════════════════════════════════════════════════════════════
    // .belajarjepang [level] / .bjp [level] — Mulai / Lanjut sesi
    // ══════════════════════════════════════════════════════════════════════════
    if (['belajarjepang', 'bjp'].includes(command)) {
      const argLevel = (args[0] || '').toUpperCase()
      const validLevels = ['N5', 'N4', 'N3', 'N2', 'N1']

      // Jika tidak ada arg, tampilkan menu level
      if (!argLevel || !validLevels.includes(argLevel)) {
        return replyalya(
          `╔══════════════════════════════╗\n` +
          `║  🎌 BELAJAR BAHASA JEPANG    ║\n` +
          `╚══════════════════════════════╝\n\n` +
          `Pilih level JLPT yang ingin kamu pelajari:\n\n` +
          `│ 🟢 *N5* — Pemula (Hiragana, Katakana, Kosakata Dasar)\n` +
          `│ 🔵 *N4* — Dasar (Tata Bahasa Dasar, Pola Kalimat)\n` +
          `│ 🟡 *N3* — Menengah (Grammar Lanjut, Bacaan Pendek)\n` +
          `│ 🟠 *N2* — Lanjut (Keigo, Bacaan Kompleks)\n` +
          `│ 🔴 *N1* — Mahir (Native Level, Kanji & Idiom)\n\n` +
          `📌 *Cara mulai:*\n` +
          `_${prefix}belajarjepang N5_\n\n` +
          `💡 *Kamu saat ini di level: ${user.level}*\n` +
          `_Lanjut dari progress: ${prefix}belajarjepang ${user.level}_\n\n` +
          `📊 Status: *${prefix}bjpstatus* | Stop: *${prefix}bjpstop*`
        )
      }

      // Set/ganti level
      if (user.level !== argLevel || !user.active) {
        if (user.level !== argLevel) {
          user.level = argLevel
          user.unitIndex = 0
          user.soalIndex = 0
          user.benarBerturut = 0
        }
      }

      user.active = true
      user.waitingAnswer = false
      user.lastActivity = Date.now()

      const kurik = KURIKULUM[user.level]
      if (!kurik || kurik.length === 0) {
        return replytolak(`Materi untuk level ${user.level} belum tersedia.`)
      }

      // Cek apakah sudah selesai semua materi level ini
      if (user.unitIndex >= kurik.length) {
        user.unitIndex = kurik.length - 1
      }

      const unit = kurik[user.unitIndex]
      clearTimers(sender)
      sessions[sender] = sessions[sender] || {}

      saveDB(db)

      // Kirim materi
      await replyalya(
        `🎌 *Sesi Belajar Dimulai!*\n\n` +
        `│ 📚 Level  : *${user.level}*\n` +
        `│ 📖 Materi : ${unit.judul}\n` +
        `│ ⭐ EXP    : ${user.exp}\n\n` +
        `─────────────────────────\n\n` +
        unit.materi +
        `\n\n─────────────────────────\n\n` +
        `⏳ Soal akan otomatis dikirim *5 menit* lagi.\n` +
        `Atau ketik *${prefix}bjpsoal* jika sudah siap! 💪\n\n` +
        `_${prefix}bjpstop untuk berhenti | ${prefix}bjpstatus untuk cek progress_`
      )

      // Timer 5 menit → kirim soal otomatis
      sessions[sender].timerMateri = setTimeout(async () => {
        const dbNew = loadDB()
        const uNew = dbNew.users[sender]
        if (!uNew?.active || uNew?.waitingAnswer) return

        await alya.sendMessage(m.chat, {
          text:
            `⏰ *Sudah 5 menit berlalu!* Saatnya tes pemahaman~ 📝\n\n` +
            buildSoalMsg(kurik[uNew.unitIndex]?.soal?.[0] || kurik[0].soal[0], 0, kurik[uNew.unitIndex]?.soal?.length || 1, prefix)
        })
        uNew.waitingAnswer = true
        uNew.soalIndex = 0
        saveDB(dbNew)
      }, MATERI_TIMER_MS)
    }
  }
}

// ── Helper: Send soal ──────────────────────────────────────────────────────────
async function sendSoal(alya, m, sender, user, db, prefix, replyFn) {
  const kurik = KURIKULUM[user.level]
  if (!kurik) return

  const unit = kurik[user.unitIndex]
  if (!unit) {
    await replyFn(`Semua materi di level ${user.level} sudah selesai! 🎉 Ketik *${prefix}belajarjepang* untuk pilih level.`)
    return
  }

  if (user.soalIndex >= unit.soal.length) {
    user.soalIndex = 0
  }

  const soal = unit.soal[user.soalIndex]
  user.waitingAnswer = true
  saveDB(db)

  await replyFn(buildSoalMsg(soal, user.soalIndex, unit.soal.length, prefix))
}

async function buildSoalAutoMsg(user, prefix) {
  const kurik = KURIKULUM[user.level]
  if (!kurik) return 'Materi tidak ditemukan.'
  const unit = kurik[user.unitIndex]
  if (!unit) return 'Soal tidak ditemukan.'
  const soal = unit.soal[user.soalIndex || 0]
  return buildSoalMsg(soal, user.soalIndex || 0, unit.soal.length, prefix)
}
