// ============================================================
// FITUR KURSUS BAHASA JEPANG TERSTRUKTUR - ALYA BOT v20
// Commands: .kursusjepang | .lanjutbelajar | .progreskuliah | .resetbelajar
// Premium Feature — hanya untuk user premium/owner
// ============================================================

const fs = require('fs')
const DB_PATH = './database/belajarjepang.json'

// ─────────────────────────────────────────────────────────────
// HELPER: baca/tulis database
// ─────────────────────────────────────────────────────────────
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { users: {} }
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function getUserData(sender) {
  const db = readDB()
  if (!db.users) db.users = {}
  if (!db.users[sender]) {
    db.users[sender] = {
      level: 'N5',
      modul: 0,
      soal: 0,
      score: 0,
      totalSoal: 0,
      benar: 0,
      salah: 0,
      status: 'belajar', // belajar | nunggu_soal | ngerjain_soal | selesai
      lastActivity: Date.now(),
      sedangBelajar: false,
    }
    writeDB(db)
  }
  return db.users[sender]
}

function saveUserData(sender, data) {
  const db = readDB()
  if (!db.users) db.users = {}
  db.users[sender] = { ...data, lastActivity: Date.now() }
  writeDB(db)
}

// ─────────────────────────────────────────────────────────────
// KURIKULUM TERSTRUKTUR (N5 → N4 → N3 → N2 → N1)
// ─────────────────────────────────────────────────────────────

// ═══════════════════════ LEVEL N5 ═══════════════════════
const KURIKULUM = {
  N5: [
    // MODUL 0 — Pengenalan Hiragana (あ～お, か～こ)
    {
      judul: '📖 Modul 1: Hiragana Dasar (Baris A & KA)',
      materi: `
╭━━━━━━━『 🇯🇵 *HIRAGANA DASAR* 』━━━━━━━╮
┃
┃  *Baris A (あ行)*
┃  あ = a  │  い = i  │  う = u
┃  え = e  │  お = o
┃
┃  *Baris KA (か行)*
┃  か = ka  │  き = ki  │  く = ku
┃  け = ke  │  こ = ko
┃
┃  💡 *Tips:*
┃  Hiragana adalah aksara dasar bahasa Jepang.
┃  Setiap karakter melambangkan satu suku kata.
┃  Pelajari bentuk dan bunyi masing-masing!
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Kamu punya *5 menit* untuk memahami ini.
Ketik *.soaljepang* kalau sudah siap, atau tunggu 5 menit!`,
      soal: [
        { pertanyaan: 'Huruf hiragana *あ* dibaca?', jawaban: 'a', pilihan: ['a','i','u','e','o'], penjelasan: 'あ dibaca "a" — huruf pertama dalam sistem hiragana.' },
        { pertanyaan: 'Huruf hiragana *い* dibaca?', jawaban: 'i', pilihan: ['a','i','u','e','o'], penjelasan: 'い dibaca "i".' },
        { pertanyaan: 'Huruf hiragana *う* dibaca?', jawaban: 'u', pilihan: ['a','i','u','e','o'], penjelasan: 'う dibaca "u".' },
        { pertanyaan: 'Huruf hiragana *か* dibaca?', jawaban: 'ka', pilihan: ['ka','ki','ku','ke','ko'], penjelasan: 'か dibaca "ka" — awal baris KA.' },
        { pertanyaan: 'Huruf hiragana *き* dibaca?', jawaban: 'ki', pilihan: ['ka','ki','ku','ke','ko'], penjelasan: 'き dibaca "ki".' },
      ],
    },
    // MODUL 1 — Hiragana sa～to
    {
      judul: '📖 Modul 2: Hiragana Baris SA & TA',
      materi: `
╭━━━━━━━『 🇯🇵 *HIRAGANA SA & TA* 』━━━━━━━╮
┃
┃  *Baris SA (さ行)*
┃  さ = sa  │  し = shi  │  す = su
┃  せ = se  │  そ = so
┃
┃  *Baris TA (た行)*
┃  た = ta  │  ち = chi  │  つ = tsu
┃  て = te  │  と = to
┃
┃  💡 *Perhatikan pengecualian:*
┃  し = "shi" (bukan "si")
┃  ち = "chi" (bukan "ti")
┃  つ = "tsu" (bukan "tu")
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang* atau tunggu!`,
      soal: [
        { pertanyaan: 'Huruf *し* dibaca?', jawaban: 'shi', pilihan: ['sa','si','shi','se','so'], penjelasan: 'し dibaca "shi", bukan "si". Ini pengecualian penting!' },
        { pertanyaan: 'Huruf *ち* dibaca?', jawaban: 'chi', pilihan: ['ta','ti','chi','te','to'], penjelasan: 'ち dibaca "chi", bukan "ti".' },
        { pertanyaan: 'Huruf *つ* dibaca?', jawaban: 'tsu', pilihan: ['ta','tu','tsu','te','to'], penjelasan: 'つ dibaca "tsu", bukan "tu".' },
        { pertanyaan: 'Huruf *さ* dibaca?', jawaban: 'sa', pilihan: ['sa','shi','su','se','so'], penjelasan: 'さ dibaca "sa".' },
        { pertanyaan: 'Huruf *た* dibaca?', jawaban: 'ta', pilihan: ['ta','chi','tsu','te','to'], penjelasan: 'た dibaca "ta".' },
      ],
    },
    // MODUL 2 — Hiragana na～ho
    {
      judul: '📖 Modul 3: Hiragana Baris NA & HA',
      materi: `
╭━━━━━━━『 🇯🇵 *HIRAGANA NA & HA* 』━━━━━━━╮
┃
┃  *Baris NA (な行)*
┃  な = na  │  に = ni  │  ぬ = nu
┃  ね = ne  │  の = no
┃
┃  *Baris HA (は行)*
┃  は = ha  │  ひ = hi  │  ふ = fu
┃  へ = he  │  ほ = ho
┃
┃  💡 *Perhatikan:*
┃  ふ = "fu" (bukan "hu")
┃  の (no) sering dipakai sebagai partikel kepemilikan!
┃  Contoh: わたしのほん = buku saya
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: 'Huruf *ふ* dibaca?', jawaban: 'fu', pilihan: ['ha','hi','fu','he','ho'], penjelasan: 'ふ dibaca "fu", bukan "hu". Pengecualian khusus baris HA.' },
        { pertanyaan: 'Huruf *の* dibaca? (juga dipakai sebagai partikel)', jawaban: 'no', pilihan: ['na','ni','nu','ne','no'], penjelasan: 'の dibaca "no". Juga digunakan sebagai partikel kepemilikan.' },
        { pertanyaan: 'Huruf *な* dibaca?', jawaban: 'na', pilihan: ['na','ni','nu','ne','no'], penjelasan: 'な dibaca "na".' },
        { pertanyaan: 'Huruf *は* dibaca?', jawaban: 'ha', pilihan: ['ha','hi','fu','he','ho'], penjelasan: 'は dibaca "ha". Saat dipakai sebagai partikel topik, dibaca "wa".' },
        { pertanyaan: 'Huruf *に* dibaca?', jawaban: 'ni', pilihan: ['na','ni','nu','ne','no'], penjelasan: 'に dibaca "ni". Juga digunakan sebagai partikel lokasi tujuan.' },
      ],
    },
    // MODUL 3 — Hiragana ma～n
    {
      judul: '📖 Modul 4: Hiragana Baris MA, YA, RA & N',
      materi: `
╭━━━━━━━『 🇯🇵 *HIRAGANA MA~N* 』━━━━━━━╮
┃
┃  *Baris MA (ま行)*
┃  ま = ma  │  み = mi  │  む = mu
┃  め = me  │  も = mo
┃
┃  *Baris YA (や行)*
┃  や = ya  │  ゆ = yu  │  よ = yo
┃
┃  *Baris RA (ら行)*
┃  ら = ra  │  り = ri  │  る = ru
┃  れ = re  │  ろ = ro
┃
┃  *Baris WA & N*
┃  わ = wa  │  を = wo (partikel objek)
┃  ん = n (konsonan tunggal)
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: 'Huruf *ん* dibaca?', jawaban: 'n', pilihan: ['n','na','nu','m','wa'], penjelasan: 'ん adalah konsonan "n" yang berdiri sendiri. Hanya ada di akhir atau tengah kata.' },
        { pertanyaan: 'Huruf *を* fungsinya adalah?', jawaban: 'wo', pilihan: ['wa','wo','nu','mo','no'], penjelasan: 'を dibaca "wo". Hampir selalu dipakai sebagai partikel objek, bukan kata biasa.' },
        { pertanyaan: 'Huruf *ゆ* dibaca?', jawaban: 'yu', pilihan: ['ya','yu','yo','wa','wo'], penjelasan: 'ゆ dibaca "yu".' },
        { pertanyaan: 'Huruf *ら* dibaca?', jawaban: 'ra', pilihan: ['ra','ri','ru','re','ro'], penjelasan: 'ら dibaca "ra".' },
        { pertanyaan: 'Huruf *も* dibaca?', jawaban: 'mo', pilihan: ['ma','mi','mu','me','mo'], penjelasan: 'も dibaca "mo". Juga berarti "juga/pun" saat dipakai sebagai partikel.' },
      ],
    },
    // MODUL 4 — Kosakata N5 Dasar
    {
      judul: '📖 Modul 5: Kosakata Dasar N5 — Salam & Ekspresi',
      materi: `
╭━━━━━━『 🇯🇵 *KOSAKATA SALAM N5* 』━━━━━━╮
┃
┃  *Salam Harian:*
┃  おはようございます = Selamat pagi (formal)
┃  こんにちは = Selamat siang/halo
┃  こんばんは = Selamat malam
┃  おやすみなさい = Selamat tidur
┃  さようなら = Selamat tinggal
┃
┃  *Ekspresi Penting:*
┃  ありがとうございます = Terima kasih (formal)
┃  すみません = Permisi / Maaf
┃  はい = Ya
┃  いいえ = Tidak
┃  わかりました = Saya mengerti
┃  わかりません = Saya tidak mengerti
┃
┃  💡 ございます membuat ucapan lebih sopan/formal!
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '"おはようございます" (ohayou gozaimasu) artinya?', jawaban: 'selamat pagi', pilihan: ['selamat pagi','selamat siang','selamat malam','selamat tinggal','halo'], penjelasan: 'おはようございます = Selamat pagi (formal). Versi kasual: おはよう.' },
        { pertanyaan: '"すみません" (sumimasen) berarti?', jawaban: 'permisi / maaf', pilihan: ['terima kasih','permisi / maaf','ya','tidak','sampai jumpa'], penjelasan: 'すみません digunakan untuk "permisi", "maaf", atau memanggil perhatian seseorang.' },
        { pertanyaan: '"わかりました" (wakarimashita) artinya?', jawaban: 'saya mengerti', pilihan: ['saya tidak mengerti','saya mau','saya mengerti','saya bisa','saya mau'], penjelasan: 'わかりました = Saya mengerti/Sudah paham. Bentuk lampau dari わかる.' },
        { pertanyaan: '"こんばんは" (konbanwa) adalah salam untuk?', jawaban: 'malam hari', pilihan: ['pagi hari','siang hari','malam hari','waktu tidur','perpisahan'], penjelasan: 'こんばんは = Selamat malam. Dipakai saat bertemu orang di malam hari.' },
        { pertanyaan: '"ありがとうございます" berarti?', jawaban: 'terima kasih', pilihan: ['maaf','permisi','terima kasih','tolong','sampai jumpa'], penjelasan: 'ありがとうございます = Terima kasih (sangat formal). Versi kasual: ありがとう.' },
      ],
    },
    // MODUL 5 — Partikel N5
    {
      judul: '📖 Modul 6: Partikel Dasar (は, が, を, に, で)',
      materi: `
╭━━━━━━『 🇯🇵 *PARTIKEL DASAR N5* 』━━━━━━╮
┃
┃  Partikel adalah "lem" dalam kalimat Jepang.
┃
┃  *は (wa)* — Penanda TOPIK
┃  わたし*は*がくせいです = Saya (topik) mahasiswa
┃
┃  *が (ga)* — Penanda SUBJEK
┃  あめ*が*ふっています = Hujan (yang) turun
┃
┃  *を (wo)* — Penanda OBJEK
┃  ほん*を*よみます = Membaca buku
┃
┃  *に (ni)* — Tujuan / Lokasi keberadaan
┃  がっこう*に*いきます = Pergi ke sekolah
┃
┃  *で (de)* — Lokasi kegiatan / Alat
┃  えき*で*まちます = Menunggu DI stasiun
┃  でんしゃ*で*いきます = Pergi DENGAN kereta
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: 'Partikel yang menandai TOPIK kalimat adalah?', jawaban: 'は', pilihan: ['は','が','を','に','で'], penjelasan: 'は (wa) adalah penanda topik. Contoh: わたし*は* = Saya (sebagai topik).' },
        { pertanyaan: 'Kalimat "ほん_よみます" — partikel yang tepat?', jawaban: 'を', pilihan: ['は','が','を','に','で'], penjelasan: 'を (wo) menandai objek langsung kata kerja. ほん*を*よみます = Membaca buku.' },
        { pertanyaan: 'Partikel untuk menunjukkan TEMPAT berlangsungnya kegiatan adalah?', jawaban: 'で', pilihan: ['は','が','を','に','で'], penjelasan: 'で menunjukkan tempat kegiatan berlangsung. Contoh: がっこう*で*べんきょうします.' },
        { pertanyaan: '"がっこう_いきます" menggunakan partikel?', jawaban: 'に', pilihan: ['は','が','を','に','で'], penjelasan: 'に digunakan untuk tujuan pergi. がっこう*に*いきます = Pergi ke sekolah.' },
        { pertanyaan: 'Perbedaan は dan が: は untuk ___, が untuk ___?', jawaban: 'topik, subjek', pilihan: ['topik, subjek','objek, topik','subjek, topik','tujuan, alat','lokasi, tujuan'], penjelasan: 'は menandai TOPIK (sesuatu yang dibicarakan), が menandai SUBJEK (pelaku aksi utama).' },
      ],
    },
  ],

  // ═══════════════════════ LEVEL N4 ═══════════════════════
  N4: [
    // MODUL 0
    {
      judul: '📖 Modul 1 N4: Kata Kerja Bentuk TE (〜て形)',
      materi: `
╭━━━━━━『 🇯🇵 *BENTUK TE (〜て形)* 』━━━━━━╮
┃
┃  Bentuk TE adalah bentuk dasar untuk:
┃  - Memberikan perintah sopan (~てください)
┃  - Menyatakan dua aksi berurutan
┃  - Pola gramatikal lainnya
┃
┃  *Aturan konjugasi:*
┃
┃  Kata kerja ~く → ~いて
┃  かく (menulis) → かいて
┃
┃  Kata kerja ~ぐ → ~いで
┃  およぐ (berenang) → およいで
┃
┃  Kata kerja ~す → ~して
┃  はなす (bicara) → はなして
┃
┃  Kata kerja ~ぬ/ぶ/む → ~んで
┃  のむ (minum) → のんで
┃
┃  Kata kerja ~る (ichidan) → ~て
┃  たべる (makan) → たべて
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: 'Bentuk TE dari "かく" (menulis) adalah?', jawaban: 'かいて', pilihan: ['かいて','かって','かして','かんで','かite'], penjelasan: 'かく → かいて. Kata kerja berakhiran く berubah menjadi いて.' },
        { pertanyaan: 'Bentuk TE dari "たべる" (makan) adalah?', jawaban: 'たべて', pilihan: ['たべて','たべいて','たべんで','たべして','たべって'], penjelasan: 'たべる adalah kata kerja Grup 2 (ichidan), cukup ganti る dengan て.' },
        { pertanyaan: 'Bentuk TE dari "のむ" (minum) adalah?', jawaban: 'のんで', pilihan: ['のんで','のいで','のして','のって','のて'], penjelasan: 'のむ → のんで. Kata kerja berakhiran む/ぶ/ぬ berubah menjadi んで.' },
        { pertanyaan: '"〜てください" digunakan untuk?', jawaban: 'meminta/perintah sopan', pilihan: ['meminta/perintah sopan','melarang','bertanya','menyetujui','menolak'], penjelasan: '〜てください berarti "Tolong lakukan...". Contoh: かいてください = Tolong tulis.' },
        { pertanyaan: 'Bentuk TE dari "はなす" (berbicara) adalah?', jawaban: 'はなして', pilihan: ['はなして','はないて','はなんで','はなって','はなkite'], penjelasan: 'はなす → はなして. Kata kerja berakhiran す berubah menjadi して.' },
      ],
    },
    // MODUL 1
    {
      judul: '📖 Modul 2 N4: Pola Kewajiban & Larangan',
      materi: `
╭━━『 🇯🇵 *KEWAJIBAN & LARANGAN N4* 』━━╮
┃
┃  *Harus (Kewajiban):*
┃  〜なければなりません
┃  = Harus melakukan...
┃  Contoh:
┃  べんきょうしなければなりません
┃  = Harus belajar
┃
┃  Versi kasual: 〜ないといけない
┃
┃  *Dilarang:*
┃  〜てはいけません
┃  = Tidak boleh melakukan...
┃  Contoh:
┃  たばこをすってはいけません
┃  = Tidak boleh merokok
┃
┃  *Boleh:*
┃  〜てもいいです
┃  = Boleh melakukan...
┃  Contoh:
┃  かえってもいいです
┃  = Boleh pulang
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜なければなりません berarti?', jawaban: 'harus melakukan', pilihan: ['harus melakukan','tidak boleh','boleh','ingin','bisa'], penjelasan: '〜nakereba narimasen = harus. Ini pola kewajiban utama di N4.' },
        { pertanyaan: '〜てはいけません berarti?', jawaban: 'tidak boleh / dilarang', pilihan: ['harus','tidak boleh / dilarang','boleh','ingin sekali','sudah selesai'], penjelasan: '〜te wa ikemasen = tidak boleh / dilarang. Dipakai untuk aturan dan larangan.' },
        { pertanyaan: '〜てもいいですか digunakan untuk?', jawaban: 'meminta izin', pilihan: ['melarang','meminta izin','menyuruh','mengajak','menolak'], penjelasan: '〜te mo ii desu ka = Bolehkah saya...? Ini pola meminta izin.' },
        { pertanyaan: 'Kalimat mana yang berarti "Harus minum obat"?', jawaban: 'くすりをのまなければなりません', pilihan: ['くすりをのんでもいいです','くすりをのんではいけません','くすりをのまなければなりません','くすりをのみたいです','くすりをのみました'], penjelasan: 'くすりをのまなければなりません = Harus minum obat.' },
        { pertanyaan: 'Versi kasual dari "harus" (〜nakereba narimasen) adalah?', jawaban: '〜ないといけない', pilihan: ['〜てもいい','〜ないといけない','〜てはいけない','〜たことがある','〜てしまう'], penjelasan: '〜nai to ikenai adalah versi kasual/informal dari 〜nakereba narimasen.' },
      ],
    },
    // MODUL 2
    {
      judul: '📖 Modul 3 N4: Pengalaman & Kemampuan',
      materi: `
╭━━『 🇯🇵 *PENGALAMAN & KEMAMPUAN N4* 』━━╮
┃
┃  *Pernah melakukan (Pengalaman):*
┃  〜たことがあります
┃  Contoh:
┃  にほんにいったことがあります
┃  = Pernah pergi ke Jepang
┃
┃  Negatif: 〜たことがありません
┃  = Belum pernah...
┃
┃  *Bisa melakukan (Kemampuan):*
┃  〜ことができます
┃  Contoh:
┃  にほんごをはなすことができます
┃  = Bisa berbicara bahasa Jepang
┃
┃  Atau pakai kata kerja potential:
┃  はなせます = bisa berbicara
┃  たべられます = bisa makan
┃  みられます = bisa melihat/menonton
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜たことがあります digunakan untuk menyatakan?', jawaban: 'pengalaman pernah melakukan', pilihan: ['keinginan','pengalaman pernah melakukan','rencana masa depan','kemampuan','kewajiban'], penjelasan: '〜ta koto ga arimasu = Pernah melakukan. Dipakai untuk berbagi pengalaman.' },
        { pertanyaan: '"にほんごをはなすことができます" artinya?', jawaban: 'bisa berbicara bahasa jepang', pilihan: ['ingin belajar bahasa jepang','pernah ke jepang','bisa berbicara bahasa jepang','harus belajar bahasa jepang','suka bahasa jepang'], penjelasan: '〜ことができます berarti "bisa/mampu melakukan". にほんごをはなす = berbicara bahasa Jepang.' },
        { pertanyaan: 'Bentuk potential dari "たべる" (makan) adalah?', jawaban: 'たべられます', pilihan: ['たべります','たべられます','たべます','たべません','たべたいです'], penjelasan: 'Bentuk potential (bisa): たべる → たべられます (bisa makan).' },
        { pertanyaan: '"まだいったことがありません" artinya?', jawaban: 'belum pernah pergi', pilihan: ['sudah pernah pergi','akan pergi','belum pernah pergi','ingin pergi','tidak mau pergi'], penjelasan: '〜たことがありません = belum pernah melakukan. まだ = belum.' },
        { pertanyaan: 'Bentuk potential dari "はなす" (berbicara) adalah?', jawaban: 'はなせます', pilihan: ['はなします','はなせます','はなされます','はなしたいです','はなしません'], penjelasan: 'はなす → はなせます (bisa berbicara). Ini bentuk potential godan verb.' },
      ],
    },
  ],

  // ═══════════════════════ LEVEL N3 ═══════════════════════
  N3: [
    {
      judul: '📖 Modul 1 N3: Ekspresi Sebab-Akibat',
      materi: `
╭━━━━━━『 🇯🇵 *SEBAB-AKIBAT N3* 』━━━━━━╮
┃
┃  *〜から / 〜ので (karena)*
┃  ので lebih sopan dari から
┃
┃  Contoh:
┃  あめがふっているから、うちにいます
┃  = Karena hujan, saya di rumah
┃
┃  びょうきなので、がっこうをやすみます
┃  = Karena sakit, saya absen sekolah
┃
┃  *〜のに (padahal / meskipun — kontras)*
┃  Mengungkapkan kekecewaan/kontras.
┃  Contoh:
┃  べんきょうしたのに、しけんにおちた
┃  = Padahal sudah belajar, tapi gagal ujian
┃
┃  *〜ために (demi / untuk tujuan)*
┃  けんこうのために、まいにちはしります
┃  = Demi kesehatan, berlari setiap hari
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜ので vs 〜から: perbedaan utamanya?', jawaban: 'ので lebih sopan', pilihan: ['ので lebih sopan','から lebih sopan','tidak ada perbedaan','ので untuk masa lalu','から untuk sebab pasti'], penjelasan: 'Keduanya berarti "karena", tapi ので lebih sopan dan cocok untuk situasi formal.' },
        { pertanyaan: '〜のに digunakan untuk menyatakan?', jawaban: 'kontras / kekecewaan', pilihan: ['tujuan','kontras / kekecewaan','kemampuan','rencana','kebiasaan'], penjelasan: '〜noni menyatakan kontras atau kekecewaan. "Padahal..., tapi..." Berbeda dari ために.' },
        { pertanyaan: '"けんこうのために" artinya?', jawaban: 'demi kesehatan', pilihan: ['karena kesehatan','demi kesehatan','setelah sehat','sebelum sakit','walaupun sehat'], penjelasan: 'ために di sini menyatakan tujuan. けんこうのために = demi/untuk kesehatan.' },
        { pertanyaan: 'Pilih yang lebih tepat untuk situasi formal (minta izin ke atasan)?', jawaban: 'びょうきなので', pilihan: ['びょうきだから','びょうきなので','びょうきで','びょうきだし','びょうきだって'], penjelasan: 'Dalam situasi formal (ke atasan, guru, dll), gunakan ので, bukan から.' },
        { pertanyaan: '"べんきょうしたのに、おちた" — nuansa kalimat ini?', jawaban: 'kecewa karena harapan tidak terpenuhi', pilihan: ['senang karena berhasil','netral menyatakan fakta','kecewa karena harapan tidak terpenuhi','bangga dengan usaha','biasa saja'], penjelasan: 'のに mengandung nuansa kekecewaan. Sudah berusaha, tapi hasilnya tidak sesuai harapan.' },
      ],
    },
    {
      judul: '📖 Modul 2 N3: Kata Benda dari Kata Kerja & Sifat',
      materi: `
╭━━━━『 🇯🇵 *NOMINALISASI N3* 』━━━━╮
┃
┃  Mengubah kata kerja/sifat jadi kata benda!
┃
┃  *〜こと (koto)*
┃  Nominalisasi abstrak / fakta.
┃  にほんごをはなすこと = (hal) berbicara Jepang
┃
┃  *〜の (no)*
┃  Nominalisasi konkret / lebih kasual.
┃  およぐのがすきです = Suka berenang
┃
┃  *Perbedaan の vs こと:*
┃  の lebih kasual dan untuk hal konkret/terasa
┃  こと lebih formal dan untuk fakta/aturan
┃
┃  Contoh perbedaan:
┃  ✅ うたうのがきこえます (mendengar nyanyian)
┃  → の: karena bisa "didengar" (konkret)
┃
┃  ✅ にほんごをはなすことができます
┃  → こと: kemampuan/fakta abstrak
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '"〜こと" digunakan untuk nominalisasi yang bersifat?', jawaban: 'abstrak / fakta formal', pilihan: ['konkret dan kasual','abstrak / fakta formal','hanya di akhir kalimat','hanya dengan kata kerja','hanya saat bertanya'], penjelasan: 'こと dipakai untuk hal abstrak, fakta, aturan, atau situasi formal.' },
        { pertanyaan: '"およぐ_がすきです" — mana yang lebih tepat?', jawaban: 'の', pilihan: ['こと','の','が','を','は'], penjelasan: 'Untuk mengungkapkan suka/tidak suka terhadap aktivitas, の atau こと bisa dipakai, tapi の lebih umum dalam percakapan kasual.' },
        { pertanyaan: '"うたうのがきこえます" menggunakan の karena?', jawaban: 'bisa dirasakan secara konkret (didengar)', pilihan: ['hanya aturan tata bahasa','bisa dirasakan secara konkret (didengar)','kata setelahnya formal','tidak bisa pakai こと di sini','lebih sopan'], penjelasan: 'の digunakan untuk hal yang bisa dirasakan secara langsung oleh indera.' },
        { pertanyaan: 'Kalimat mana yang benar untuk "Kemampuan berbicara bahasa Jepang"?', jawaban: 'にほんごをはなすことができます', pilihan: ['にほんごをはなすのができます','にほんごをはなすことができます','にほんごをはなしてできます','にほんごをはなすかできます','にほんごをはなすがができます'], penjelasan: 'Untuk pola 〜ことができます (kemampuan), wajib pakai こと, bukan の.' },
        { pertanyaan: 'Nominalisasi yang lebih formal antara の dan こと?', jawaban: 'こと', pilihan: ['の','こと','どちらも同じ','tergantung kata kerja','tergantung situasi saja'], penjelasan: 'こと lebih formal. Tapi keduanya sering bisa saling menggantikan tergantung konteks.' },
      ],
    },
  ],

  // ═══════════════════════ LEVEL N2 ═══════════════════════
  N2: [
    {
      judul: '📖 Modul 1 N2: Kalimat Kondisional (〜ば, 〜たら, 〜なら)',
      materi: `
╭━━━━『 🇯🇵 *KONDISIONAL N2* 』━━━━╮
┃
┃  Ada 4 bentuk kondisional utama:
┃
┃  1. *〜と* — kondisi alami/otomatis
┃  はるになると、さくらがさきます
┃  = Kalau musim semi, sakura mekar
┃
┃  2. *〜ば* — kondisi hipotetis
┃  もっとべんきょうすれば、うかります
┃  = Kalau lebih rajin belajar, akan lulus
┃
┃  3. *〜たら* — kondisi/urutan kejadian
┃  うちにかえったら、てをあらいます
┃  = Kalau/Setelah pulang, cuci tangan
┃
┃  4. *〜なら* — kondisi berdasar info/asumsi
┃  にほんにいくなら、パスポートがいります
┃  = Kalau (katanya) mau ke Jepang, butuh paspor
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '"はるになると" — 〜と digunakan untuk kondisi yang?', jawaban: 'alami / otomatis terjadi', pilihan: ['alami / otomatis terjadi','hipotetis','berdasarkan asumsi','urutan waktu','larangan'], penjelasan: '〜と menggambarkan kondisi yang menghasilkan akibat alami/otomatis. Tidak bisa dipakai untuk permintaan atau keputusan.' },
        { pertanyaan: '〜たら menyatakan kondisi yang?', jawaban: 'urutan kejadian / kondisi umum', pilihan: ['alami saja','hanya hipotetis','urutan kejadian / kondisi umum','asumsi dari orang lain','larangan'], penjelasan: '〜たら paling serbaguna — bisa untuk kondisi umum, urutan kejadian, dan situasi hipotetis.' },
        { pertanyaan: '〜なら cocok dipakai ketika?', jawaban: 'menanggapi informasi yang baru didengar', pilihan: ['berbicara soal alam','setelah kejadian','menanggapi informasi yang baru didengar','membuat larangan','memberi perintah'], penjelasan: '〜なら dipakai saat merespons info dari lawan bicara. "Kalau memang begitu/katanya..."' },
        { pertanyaan: 'Mana yang TIDAK bisa mengikuti 〜と?', jawaban: 'permintaan atau perintah', pilihan: ['fakta alam','kebenaran umum','permintaan atau perintah','kebiasaan rutin','akibat otomatis'], penjelasan: '〜と tidak bisa diikuti permintaan (〜てください), ajakan (〜ましょう), atau keputusan.' },
        { pertanyaan: '"もっとべんきょうすれば" menggunakan 〜ば untuk menyatakan?', jawaban: 'kondisi hipotetis', pilihan: ['kondisi hipotetis','kondisi alami','urutan kejadian','asumsi','fakta pasti'], penjelasan: '〜ば digunakan untuk kondisi hipotetis — jika X terjadi, maka Y. Sering bermakna saran.' },
      ],
    },
    {
      judul: '📖 Modul 2 N2: Keigo Dasar — Sonkeigo & Kenjougo',
      materi: `
╭━━━━━━『 🇯🇵 *KEIGO DASAR N2* 』━━━━━━╮
┃
┃  Keigo (敬語) = bahasa hormat. Ada 3 jenis:
┃  1. *丁寧語 (teineigo)* — sopan biasa (です/ます)
┃  2. *尊敬語 (sonkeigo)* — meninggikan lawan bicara
┃  3. *謙譲語 (kenjougo)* — merendahkan diri sendiri
┃
┃  *Sonkeigo (untuk org lain):*
┃  いう → おっしゃる (berkata)
┃  する → なさる (melakukan)
┃  いく/くる → いらっしゃる (pergi/datang)
┃  みる → ごらんになる (melihat)
┃
┃  *Kenjougo (untuk diri sendiri):*
┃  いう → もうす (berkata)
┃  する → いたす (melakukan)
┃  いく/くる → うかがう / まいる
┃  みる → はいけんする (melihat)
┃
┃  💡 Sonkeigo untuk atasan/tamu,
┃  kenjougo untuk diri sendiri ke atasan.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: 'Bentuk sonkeigo dari "いう" (berkata) adalah?', jawaban: 'おっしゃる', pilihan: ['もうす','おっしゃる','いたす','まいる','ごらんになる'], penjelasan: 'おっしゃる adalah bentuk sonkeigo (meninggikan lawan bicara) dari いう.' },
        { pertanyaan: 'Bentuk kenjougo dari "する" (melakukan), dipakai untuk diri sendiri, adalah?', jawaban: 'いたす', pilihan: ['なさる','いたす','おっしゃる','いらっしゃる','ごらんになる'], penjelasan: 'いたす adalah kenjougo dari する — digunakan saat membicarakan tindakan diri sendiri ke atasan.' },
        { pertanyaan: 'いらっしゃる adalah bentuk sonkeigo dari kata kerja apa?', jawaban: 'いく/くる', pilihan: ['いう','する','みる','いく/くる','たべる'], penjelasan: 'いらっしゃる menggantikan いく (pergi) dan くる (datang) dalam bentuk hormat untuk orang lain.' },
        { pertanyaan: 'Kenjougo digunakan untuk?', jawaban: 'merendahkan diri sendiri demi menghormati lawan bicara', pilihan: ['meninggikan lawan bicara','merendahkan diri sendiri demi menghormati lawan bicara','bahasa anak-anak','bahasa gaul','bahasa tulisan saja'], penjelasan: '謙譲語 (kenjougo) adalah cara berbicara yang merendahkan tindakan diri sendiri untuk menunjukkan rasa hormat.' },
        { pertanyaan: 'Bentuk sonkeigo dari "みる" (melihat) adalah?', jawaban: 'ごらんになる', pilihan: ['はいけんする','ごらんになる','うかがう','もうす','いたす'], penjelasan: 'ごらんになる = sonkeigo dari みる. はいけんする adalah kenjougo-nya (untuk diri sendiri).' },
      ],
    },
    {
      judul: '📖 Modul 3 N2: Tata Bahasa Formal — 〜にあたって, 〜うえで, 〜うえに',
      materi: `
╭━━━━『 🇯🇵 *GRAMMAR FORMAL N2* 』━━━━╮
┃
┃  *〜にあたって / にあたり*
┃  = "pada saat/menjelang (momen penting)"
┃  しけんにあたって、しっかりじゅんびする
┃  = Menjelang ujian, bersiap dengan baik
┃
┃  *〜うえで*
┃  = "dalam proses/dalam rangka melakukan"
┃  けいやくをむすぶうえで、ちゅういがひつようだ
┃  = Dalam membuat kontrak, perlu kehati-hatian
┃
┃  *〜うえに*
┃  = "selain itu / ditambah lagi" (penambahan)
┃  かれはあたまがいいうえに、しんせつだ
┃  = Dia pintar, ditambah lagi ramah
┃
┃  *〜ぬきで / 〜ぬきに*
┃  = "tanpa..." (menghilangkan sesuatu)
┃  じょうだんぬきで、はなしましょう
┃  = Mari bicara serius, tanpa basa-basi/lelucon
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜にあたって digunakan untuk menyatakan?', jawaban: 'momen penting / menjelang sesuatu', pilihan: ['kebiasaan harian','momen penting / menjelang sesuatu','larangan','permintaan izin','perbandingan'], penjelasan: '〜にあたって menandai momen penting atau krusial, sering dipakai dalam konteks formal seperti pidato atau pengumuman.' },
        { pertanyaan: '"けいやくをむすぶうえで" artinya?', jawaban: 'dalam (proses) membuat kontrak', pilihan: ['setelah membuat kontrak','dalam (proses) membuat kontrak','sebelum membuat kontrak','tanpa kontrak','karena kontrak'], penjelasan: '〜うえで menunjukkan sesuatu yang perlu diperhatikan dalam proses/konteks melakukan suatu hal.' },
        { pertanyaan: '〜うえに menambahkan nuansa makna?', jawaban: 'selain itu / ditambah lagi (penambahan)', pilihan: ['kontras','selain itu / ditambah lagi (penambahan)','sebab-akibat','dugaan','larangan'], penjelasan: '〜うえに menyatakan penambahan sifat/kondisi yang searah. "かれはあたまがいいうえに、しんせつだ" = Dia pintar, dan juga ramah.' },
        { pertanyaan: '"じょうだんぬきで" berarti?', jawaban: 'tanpa basa-basi/bercanda (serius)', pilihan: ['dengan banyak lelucon','tanpa basa-basi/bercanda (serius)','sambil bercanda','setelah bercanda','karena lelucon'], penjelasan: '〜ぬきで berarti "tanpa X". じょうだんぬきで = tanpa lelucon, alias serius.' },
        { pertanyaan: 'Pola mana yang TEPAT untuk konteks pengumuman resmi tentang "menjelang acara besar"?', jawaban: '〜にあたって', pilihan: ['〜うえに','〜にあたって','〜ぬきで','〜のに','〜ても'], penjelasan: '〜にあたって sangat umum dipakai dalam pidato/pengumuman resmi untuk momen penting seperti pembukaan acara.' },
      ],
    },
    {
      judul: '📖 Modul 4 N2: Kosakata Resmi JLPT N2 — Bisnis & Berita',
      materi: `
╭━━━━『 🇯🇵 *KOSAKATA RESMI N2* 』━━━━╮
┃
┃  *Bisnis & Kantor:*
┃  契約 (けいやく) = kontrak
┃  取引 (とりひき) = transaksi
┃  担当 (たんとう) = penanggung jawab
┃  会議 (かいぎ) = rapat
┃  締め切り (しめきり) = tenggat waktu
┃
┃  *Berita & Sosial:*
┃  影響 (えいきょう) = pengaruh/dampak
┃  対策 (たいさく) = langkah/kebijakan
┃  增加 (ぞうか) / 減少 (げんしょう) = naik / turun
┃  状況 (じょうきょう) = situasi/keadaan
┃  改善 (かいぜん) = perbaikan
┃
┃  💡 Kosakata ini sering keluar di koran,
┃  berita TV, dan dokumen JLPT N2 listening/reading.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '"契約" (けいやく) artinya?', jawaban: 'kontrak', pilihan: ['kontrak','transaksi','rapat','tenggat waktu','perbaikan'], penjelasan: '契約 (keiyaku) = kontrak/perjanjian, kata umum dalam konteks bisnis.' },
        { pertanyaan: '"締め切り" (しめきり) artinya?', jawaban: 'tenggat waktu / deadline', pilihan: ['rapat','tenggat waktu / deadline','penanggung jawab','transaksi','dampak'], penjelasan: '締め切り (shimekiri) = tenggat waktu/deadline, sering muncul dalam konteks tugas dan kerja.' },
        { pertanyaan: '"影響" (えいきょう) artinya?', jawaban: 'pengaruh / dampak', pilihan: ['pengaruh / dampak','perbaikan','situasi','peningkatan','kebijakan'], penjelasan: '影響 (eikyou) = pengaruh atau dampak, sangat umum dalam berita (misal: dampak ekonomi).' },
        { pertanyaan: '"増加" dan "減少" adalah pasangan kata yang berarti?', jawaban: 'naik dan turun', pilihan: ['naik dan turun','besar dan kecil','cepat dan lambat','baik dan buruk','awal dan akhir'], penjelasan: '増加 (zouka) = peningkatan/naik, 減少 (genshou) = penurunan/turun. Sering dipakai untuk statistik di berita.' },
        { pertanyaan: '"対策" (たいさく) artinya?', jawaban: 'langkah / kebijakan penanganan', pilihan: ['langkah / kebijakan penanganan','situasi saat ini','tenggat waktu','rapat penting','penanggung jawab'], penjelasan: '対策 (taisaku) = langkah/tindakan penanganan terhadap suatu masalah, sering dipakai dalam berita kebijakan.' },
      ],
    },
  ],

  // ═══════════════════════ LEVEL N1 ═══════════════════════
  N1: [
    {
      judul: '📖 Modul 1 N1: Pola Lanjutan — Klasik & Sastra',
      materi: `
╭━━━━『 🇯🇵 *POLA LANJUTAN N1* 』━━━━╮
┃
┃  *〜をもって (wo motte)*
┃  Berarti: "dengan / melalui / pada"
┃  Contoh: ほんじつをもって、えいぎょうをしゅうりょうします
┃  = Dengan hari ini, kegiatan bisnis berakhir
┃
┃  *〜にほかならない (ni hoka naranai)*
┃  Berarti: "tidak lain adalah / pasti"
┃  Contoh: これはひとつのちょうせんにほかならない
┃  = Ini tidak lain adalah sebuah tantangan
┃
┃  *〜いかんによらず (ikan ni yorazu)*
┃  Berarti: "terlepas dari / tanpa memandang"
┃  Contoh: りゆういかんによらず、おくれはきんしです
┃  = Terlepas dari alasan apapun, keterlambatan dilarang
┃
┃  *〜ならではの (naradewa no)*
┃  Berarti: "yang hanya bisa dari..."
┃  Contoh: にほんならではのぶんか
┃  = Budaya yang hanya ada di Jepang
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜にほかならない menyatakan?', jawaban: 'tidak lain adalah / pasti demikian', pilihan: ['mungkin saja','tidak lain adalah / pasti demikian','berbeda dengan','tidak seharusnya','seandainya'], penjelasan: '〜ni hoka naranai = tidak lain adalah. Menegaskan sesuatu dengan pasti. Register formal/tulisan.' },
        { pertanyaan: '〜ならではの berarti?', jawaban: 'yang hanya bisa/ada dari X', pilihan: ['karena X','yang hanya bisa/ada dari X','meskipun X','setelah X','bersama X'], penjelasan: '〜naradewa no menyatakan sesuatu yang khas/eksklusif hanya milik X. "Ciri khas X".' },
        { pertanyaan: '〜をもって digunakan dalam konteks?', jawaban: 'pengumuman formal / bahasa resmi', pilihan: ['percakapan kasual sehari-hari','pengumuman formal / bahasa resmi','percakapan anak muda','bahasa internet','percakapan keluarga'], penjelasan: '〜wo motte adalah ekspresi sangat formal, sering di dokumen resmi, pengumuman perusahaan, dll.' },
        { pertanyaan: '〜いかんによらず bermakna?', jawaban: 'terlepas dari / tanpa memandang', pilihan: ['tergantung','terlepas dari / tanpa memandang','sesuai dengan','karena','meskipun'], penjelasan: '〜ikan ni yorazu = terlepas dari apapun. Menunjukkan aturan yang tidak punya pengecualian.' },
        { pertanyaan: 'Register bahasa pola N1 seperti 〜をもって, 〜にほかならない cocok digunakan di?', jawaban: 'tulisan formal, dokumen, berita', pilihan: ['percakapan santai','SMS teman','tulisan formal, dokumen, berita','bahasa gaul','manga/komik'], penjelasan: 'Pola N1 kebanyakan berregister tinggi — cocok untuk tulisan ilmiah, berita, dokumen resmi, dan presentasi formal.' },
      ],
    },
    {
      judul: '📖 Modul 2 N1: Keigo Lanjutan — Bentuk Super Hormat & Ungkapan Bisnis',
      materi: `
╭━━━━『 🇯🇵 *KEIGO LANJUTAN N1* 』━━━━╮
┃
┃  *Bentuk double keigo (lebih formal lagi):*
┃  おっしゃる → おっしゃられる (sering dianggap berlebihan,
┃  tapi umum di percakapan super formal)
┃
┃  *ご〜になる / ご〜くださる (sonkeigo pola)*
┃  ごかくにんになる = (Anda) memastikan
┃  ごれんらくくださる = (Anda) menghubungi (kami)
┃
┃  *〜させていただく (kenjougo pola)*
┃  = "(dengan izin Anda) saya akan melakukan..."
┃  しつもんさせていただきます
┃  = Mengizinkan saya untuk bertanya
┃
┃  *Ungkapan bisnis baku:*
┃  おせわになっております = Terima kasih atas bantuannya
┃  (sapaan email bisnis standar)
┃  よろしくおねがいいたします
┃  = Mohon bantuannya (sangat formal)
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜させていただく digunakan untuk menyatakan?', jawaban: 'meminta izin secara halus untuk melakukan sesuatu', pilihan: ['memerintah orang lain','meminta izin secara halus untuk melakukan sesuatu','menolak permintaan','menyatakan fakta','melarang'], penjelasan: '〜させていただく adalah kenjougo yang menunjukkan tindakan dilakukan "dengan izin/berkat" pihak lain — sangat sopan.' },
        { pertanyaan: '"おせわになっております" biasa digunakan sebagai?', jawaban: 'sapaan pembuka email/percakapan bisnis', pilihan: ['ucapan perpisahan','sapaan pembuka email/percakapan bisnis','permintaan maaf berat','penolakan formal','ungkapan kemarahan'], penjelasan: 'おせわになっております adalah ungkapan baku di awal email/telepon bisnis Jepang, mirip "terima kasih atas kerja samanya selama ini".' },
        { pertanyaan: '"ごかくにんになる" menggunakan pola?', jawaban: 'ご〜になる (sonkeigo)', pilihan: ['ご〜になる (sonkeigo)','〜させていただく (kenjougo)','〜ておく','〜てしまう','〜なければならない'], penjelasan: 'ご〜になる adalah pola sonkeigo untuk meninggikan tindakan lawan bicara, contoh: ごかくにんになる = (Anda) memastikan.' },
        { pertanyaan: '"よろしくおねがいいたします" dibandingkan "よろしくおねがいします" memiliki nuansa?', jawaban: 'lebih formal/sopan (kenjougo)', pilihan: ['lebih kasar','lebih formal/sopan (kenjougo)','lebih akrab','bermakna berbeda total','hanya dipakai anak kecil'], penjelasan: 'いたします adalah kenjougo dari します, sehingga よろしくおねがいいたします terasa lebih formal daripada versi します biasa.' },
        { pertanyaan: '"しつもんさせていただきます" artinya?', jawaban: 'mengizinkan saya untuk bertanya', pilihan: ['saya melarang pertanyaan','mengizinkan saya untuk bertanya','saya akan menjawab','tolong jangan bertanya','saya sudah bertanya'], penjelasan: '〜させていただきます menambahkan nuansa "dengan izin Anda" pada tindakan しつもんする (bertanya).' },
      ],
    },
    {
      judul: '📖 Modul 3 N1: Tata Bahasa Formal Lanjutan — 〜を皮切りに, 〜と相まって, 〜を踏まえて',
      materi: `
╭━━━━『 🇯🇵 *GRAMMAR FORMAL LANJUTAN N1* 』━━━━╮
┃
┃  *〜を皮切りに (wo kawakiri ni)*
┃  = "dimulai dari... (lalu berkembang/menyebar)"
┃  とうきょうこうえんをかわきりに、ぜんこくツアーがはじまる
┃  = Dimulai dari konser di Tokyo, tur nasional dimulai
┃
┃  *〜と相まって (to aimatte)*
┃  = "bersamaan dengan / digabung dengan (faktor lain)"
┃  ぎじゅつのしんぽは、じゅようのぞうかとあいまって
┃  = Kemajuan teknologi, digabung dengan naiknya
┃    permintaan, ...
┃
┃  *〜を踏まえて (wo fumaete)*
┃  = "berdasarkan / dengan mempertimbangkan"
┃  けっかをふまえて、けいかくをみなおす
┃  = Berdasarkan hasil, meninjau ulang rencana
┃
┃  *〜を余儀なくされる (wo yogi naku sareru)*
┃  = "terpaksa harus..."
┃  けいかくのへんこうをよぎなくされた
┃  = Terpaksa harus mengubah rencana
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '〜を皮切りに digunakan untuk menyatakan?', jawaban: 'titik awal dari sesuatu yang kemudian berkembang/menyebar', pilihan: ['titik akhir suatu kejadian','titik awal dari sesuatu yang kemudian berkembang/menyebar','larangan keras','perbandingan dua hal','kondisi hipotetis'], penjelasan: '〜を皮切りに menandai momen/tempat awal yang menjadi pemicu rangkaian kejadian berikutnya (sering dipakai untuk acara/tur).' },
        { pertanyaan: '〜と相まって menghubungkan dua hal dengan makna?', jawaban: 'saling berkombinasi / bergabung memperkuat efek', pilihan: ['saling bertentangan','saling berkombinasi / bergabung memperkuat efek','salah satu meniadakan yang lain','urutan waktu saja','sebab tunggal'], penjelasan: '〜と相まって menunjukkan dua faktor yang bergabung dan memperkuat satu sama lain menghasilkan suatu efek.' },
        { pertanyaan: '"けっかをふまえて、けいかくをみなおす" artinya?', jawaban: 'meninjau ulang rencana berdasarkan hasil', pilihan: ['membuang hasil dan rencana','meninjau ulang rencana berdasarkan hasil','membuat hasil baru tanpa rencana','menunda hasil demi rencana','membandingkan dua rencana'], penjelasan: '〜を踏まえて berarti "dengan mempertimbangkan/berdasarkan X", di sini X = けっか (hasil).' },
        { pertanyaan: '〜を余儀なくされる menyatakan suatu tindakan yang?', jawaban: 'terpaksa dilakukan karena keadaan', pilihan: ['dilakukan dengan sukarela','terpaksa dilakukan karena keadaan','dilarang dilakukan','direncanakan jauh-jauh hari','dilakukan demi kesenangan'], penjelasan: '〜を余儀なくされる = "tidak ada pilihan lain selain..." — menunjukkan keterpaksaan akibat situasi di luar kendali.' },
        { pertanyaan: 'Pola mana yang paling tepat untuk kalimat "Konser di Osaka, dimulai dari sana tur akan keliling Jepang"?', jawaban: '〜を皮切りに', pilihan: ['〜を皮切りに','〜と相まって','〜を踏まえて','〜を余儀なくされる','〜にほかならない'], penjelasan: '〜を皮切りに secara spesifik dipakai untuk "dimulai dari X, kemudian meluas/berkembang ke hal lain", cocok untuk konteks tur konser.' },
      ],
    },
    {
      judul: '📖 Modul 4 N1: Kosakata Resmi JLPT N1 — Akademik & Abstrak',
      materi: `
╭━━━━『 🇯🇵 *KOSAKATA RESMI N1* 』━━━━╮
┃
┃  *Akademik & Analisis:*
┃  概念 (がいねん) = konsep
┃  傾向 (けいこう) = kecenderungan/tren
┃  要因 (よういん) = faktor penyebab
┃  検証 (けんしょう) = verifikasi/pembuktian
┃  妥当性 (だとうせい) = validitas/kelayakan
┃
┃  *Abstrak & Wacana:*
┃  矛盾 (むじゅん) = kontradiksi
┃  前提 (ぜんてい) = premis/asumsi dasar
┃  普及 (ふきゅう) = penyebaran/popularisasi
┃  顕著 (けんちょ) = mencolok/signifikan
┃  深刻 (しんこく) = serius/mendalam (masalah)
┃
┃  💡 Kosakata ini umum di esai, jurnal,
┃  editorial koran, dan bagian membaca JLPT N1.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
⏳ Pelajari 5 menit lalu ketik *.soaljepang*!`,
      soal: [
        { pertanyaan: '"傾向" (けいこう) artinya?', jawaban: 'kecenderungan / tren', pilihan: ['kecenderungan / tren','kontradiksi','validitas','premis','penyebaran'], penjelasan: '傾向 (keikou) = kecenderungan atau tren, sering muncul dalam analisis data dan esai.' },
        { pertanyaan: '"矛盾" (むじゅん) artinya?', jawaban: 'kontradiksi', pilihan: ['konsep','kontradiksi','faktor','verifikasi','tren'], penjelasan: '矛盾 (mujun) = kontradiksi, sering dipakai saat membahas argumen yang saling bertentangan.' },
        { pertanyaan: '"要因" (よういん) artinya?', jawaban: 'faktor penyebab', pilihan: ['faktor penyebab','akibat akhir','hasil penelitian','kesimpulan','metode'], penjelasan: '要因 (youin) = faktor penyebab utama dari suatu fenomena atau hasil.' },
        { pertanyaan: '"顕著" (けんちょ) menggambarkan sesuatu yang?', jawaban: 'mencolok / signifikan', pilihan: ['mencolok / signifikan','tersembunyi','tidak penting','sementara','biasa saja'], penjelasan: '顕著 (kencho) = sangat mencolok/jelas terlihat, biasa dipakai untuk perubahan atau perbedaan yang signifikan.' },
        { pertanyaan: '"前提" (ぜんてい) artinya?', jawaban: 'premis / asumsi dasar', pilihan: ['premis / asumsi dasar','kesimpulan akhir','validitas','penyebaran','kontradiksi'], penjelasan: '前提 (zentei) = premis atau dasar asumsi yang menjadi landasan suatu argumen atau diskusi.' },
      ],
    },
  ],
}

// Urutan level
const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1']

function getNextLevel(currentLevel) {
  const idx = LEVEL_ORDER.indexOf(currentLevel)
  if (idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1]
  return null
}

function getTotalModul(level) {
  return KURIKULUM[level] ? KURIKULUM[level].length : 0
}

// ─────────────────────────────────────────────────────────────
// HELPER: format progress bar
// ─────────────────────────────────────────────────────────────
function progressBar(val, max, length = 10) {
  const filled = Math.round((val / Math.max(max, 1)) * length)
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, length - filled))
}

// ─────────────────────────────────────────────────────────────
// MAIN: Kirim materi belajar
// ─────────────────────────────────────────────────────────────
async function kirimMateri(alya, m, ctx, userData, sender) {
  const { replyalya } = ctx
  const level = userData.level
  const modulIdx = userData.modul

  if (!KURIKULUM[level] || modulIdx >= KURIKULUM[level].length) {
    // Coba naik level
    const nextLevel = getNextLevel(level)
    if (!nextLevel) {
      replyalya(
        `🎊 *SELAMAT! Kamu telah menyelesaikan semua materi hingga level N1!*\n\n` +
        `🏆 Kamu adalah seorang *MASTER BAHASA JEPANG*!\n` +
        `📊 Total soal dikerjakan: *${userData.totalSoal}*\n` +
        `✅ Benar: *${userData.benar}* | ❌ Salah: *${userData.salah}*\n\n` +
        `Gunakan *.resetbelajar* jika ingin mulai dari awal lagi.`
      )
      userData.status = 'selesai'
      saveUserData(sender, userData)
      return
    }
    userData.level = nextLevel
    userData.modul = 0
    userData.soal = 0
    saveUserData(sender, userData)
    replyalya(
      `🎊 *Level ${level} SELESAI!*\n\n` +
      `🚀 Sekarang naik ke *Level ${nextLevel}*!\n` +
      `Ketik *.lanjutbelajar* untuk melanjutkan ke modul berikutnya.`
    )
    return
  }

  const modul = KURIKULUM[level][modulIdx]
  const totalModul = getTotalModul(level)

  const headerProg = (
    `╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
    `┃ 🎌 *KURSUS BAHASA JEPANG*\n` +
    `┃ Level: *${level}* │ Modul: *${modulIdx + 1}/${totalModul}*\n` +
    `┃ ${progressBar(modulIdx + 1, totalModul)} ${Math.round(((modulIdx + 1) / totalModul) * 100)}%\n` +
    `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n`
  )

  await replyalya(headerProg + modul.judul + '\n' + modul.materi)

  // Set status nunggu soal
  userData.status = 'nunggu_soal'
  userData.soal = 0
  saveUserData(sender, userData)

  // Timeout 5 menit → auto kirim soal pertama
  if (alya._belajarTimer) clearTimeout(alya._belajarTimer)
  if (!alya._belajarTimers) alya._belajarTimers = {}
  if (alya._belajarTimers[sender]) clearTimeout(alya._belajarTimers[sender])

  alya._belajarTimers[sender] = setTimeout(async () => {
    // Reload userData
    const freshData = getUserData(sender)
    if (freshData.status === 'nunggu_soal') {
      freshData.status = 'ngerjain_soal'
      freshData.soal = 0
      saveUserData(sender, freshData)
      await kirimSoal(alya, m, ctx, freshData, sender)
    }
  }, 5 * 60 * 1000)
}

// ─────────────────────────────────────────────────────────────
// MAIN: Kirim soal
// ─────────────────────────────────────────────────────────────
async function kirimSoal(alya, m, ctx, userData, sender) {
  const { replyalya } = ctx
  const level = userData.level
  const modulIdx = userData.modul
  const soalIdx = userData.soal

  if (!KURIKULUM[level] || modulIdx >= KURIKULUM[level].length) return

  const modul = KURIKULUM[level][modulIdx]
  if (soalIdx >= modul.soal.length) {
    // Semua soal modul ini selesai
    const modulSelesai = modulIdx + 1
    const totalModul = getTotalModul(level)
    const persen = Math.round((modulSelesai / totalModul) * 100)

    replyalya(
      `✅ *Modul ${modulSelesai} Selesai!*\n\n` +
      `📊 Progress Level *${level}*:\n` +
      `${progressBar(modulSelesai, totalModul)} ${persen}%\n` +
      `Modul: ${modulSelesai}/${totalModul}\n\n` +
      `Ketik *.lanjutbelajar* untuk melanjutkan ke modul berikutnya! 🚀`
    )
    userData.modul = modulIdx + 1
    userData.soal = 0
    userData.status = 'belajar'
    saveUserData(sender, userData)
    return
  }

  const s = modul.soal[soalIdx]
  const pilihanText = s.pilihan.map((p, i) => `  ${String.fromCharCode(65 + i)}. ${p}`).join('\n')

  // Simpan session soal di alya object
  if (!alya._soalSession) alya._soalSession = {}
  alya._soalSession[sender] = {
    jawaban: s.jawaban,
    pilihan: s.pilihan,
    penjelasan: s.penjelasan,
    soalIdx,
    modulIdx,
    level,
    chatId: m.chat,
    timestamp: Date.now(),
  }

  await replyalya(
    `╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
    `┃ 📝 *SOAL ${soalIdx + 1}/${modul.soal.length}* — *Level ${level}*\n` +
    `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
    `❓ ${s.pertanyaan}\n\n` +
    `${pilihanText}\n\n` +
    `_Ketik huruf jawaban (A/B/C/D/E) atau tulis jawabannya langsung!_\n` +
    `_Ketik *skip* untuk lewati soal ini._`
  )

  userData.status = 'ngerjain_soal'
  saveUserData(sender, userData)
}

// ─────────────────────────────────────────────────────────────
// ANSWER HANDLER — dipanggil dari alya.js
// ─────────────────────────────────────────────────────────────
async function handleJawaban(alya, m, ctx) {
  const { sender, replyalya, budy } = ctx
  if (!alya._soalSession || !alya._soalSession[sender]) return false
  const session = alya._soalSession[sender]
  if (session.chatId !== m.chat) return false

  const userData = getUserData(sender)
  if (userData.status !== 'ngerjain_soal') return false

  const input = budy.trim()
  if (!input) return false

  // Skip
  if (input.toLowerCase() === 'skip') {
    delete alya._soalSession[sender]
    userData.soal += 1
    userData.totalSoal += 1
    userData.salah += 1
    saveUserData(sender, userData)
    await replyalya(
      `⏭️ Soal dilewati.\n\n` +
      `💡 *Penjelasan:*\n${session.penjelasan}\n\n` +
      `Jawaban benar: *${session.jawaban}*`
    )
    await kirimSoal(alya, m, ctx, userData, sender)
    return true
  }

  // Cek jawaban: huruf (A-E) atau teks langsung
  let jawabanUser = input.toLowerCase()
  let isHuruf = false
  if (/^[a-e]$/i.test(input) && input.length === 1) {
    const idx = input.toUpperCase().charCodeAt(0) - 65
    if (session.pilihan[idx] !== undefined) {
      jawabanUser = session.pilihan[idx].toLowerCase()
      isHuruf = true
    }
  }

  const benar = jawabanUser === session.jawaban.toLowerCase() ||
    session.pilihan.some(p => p.toLowerCase() === jawabanUser && p.toLowerCase() === session.jawaban.toLowerCase())

  userData.totalSoal += 1
  delete alya._soalSession[sender]

  if (benar) {
    userData.benar += 1
    userData.score += 10
    await replyalya(
      `✅ *BENAR!* +10 poin 🎉\n\n` +
      `💡 *Penjelasan:*\n${session.penjelasan}\n\n` +
      `⭐ Total skor: *${userData.score}*`
    )
  } else {
    userData.salah += 1
    await replyalya(
      `❌ *SALAH!*\n\n` +
      `Jawabanmu: *${jawabanUser}*\n` +
      `Jawaban benar: *${session.jawaban}*\n\n` +
      `💡 *Penjelasan:*\n${session.penjelasan}`
    )
  }

  userData.soal += 1
  saveUserData(sender, userData)

  // Jeda sebentar lalu kirim soal berikutnya
  setTimeout(async () => {
    const freshData = getUserData(sender)
    await kirimSoal(alya, m, ctx, freshData, sender)
  }, 1500)

  return true
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = [

  // ── .kursusjepang — mulai / pilih level ──────────────────
  {
    command: ['kursusjepang', 'belajarjepangkursus'],
    tags: ['edukasi'],
    run: async (alya, m, ctx) => {
      const { replyalya, replytolak, isPrem, Ryuu, mess, q, sender } = ctx
      if (!isPrem && !Ryuu) return replyalya(mess.only.premium)

      let level = (q || '').trim().toUpperCase()
      if (!LEVEL_ORDER.includes(level)) {
        return replyalya(
          `╭━━━━━━━━━『 🇯🇵 *KURSUS BAHASA JEPANG* 』━━━━━━━━━╮\n` +
          `┃\n` +
          `┃  Selamat datang di *Kursus Bahasa Jepang*!\n` +
          `┃  Belajar dari 0 hingga N1 secara terstruktur 📚\n` +
          `┃\n` +
          `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╣\n` +
          `┃  Pilih level awal:\n` +
          `┃\n` +
          `┃  *.kursusjepang N5* — Pemula (huruf, kosakata dasar)\n` +
          `┃  *.kursusjepang N4* — Tata bahasa dasar\n` +
          `┃  *.kursusjepang N3* — Menengah\n` +
          `┃  *.kursusjepang N2* — Lanjutan\n` +
          `┃  *.kursusjepang N1* — Mahir/Profesional\n` +
          `┃\n` +
          `┃  💡 *Rekomendasi pemula: N5*\n` +
          `┃\n` +
          `┃  Perintah lain:\n` +
          `┃  *.lanjutbelajar* — Lanjutkan sesi belajar\n` +
          `┃  *.soaljepang* — Minta soal sekarang\n` +
          `┃  *.progreskuliah* — Lihat progres kamu\n` +
          `┃  *.resetbelajar* — Reset progress dari awal\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        )
      }

      // Set level dan mulai
      let userData = getUserData(sender)
      userData.level = level
      userData.modul = 0
      userData.soal = 0
      userData.score = 0
      userData.totalSoal = 0
      userData.benar = 0
      userData.salah = 0
      userData.status = 'belajar'
      saveUserData(sender, userData)

      await replyalya(`🚀 Memulai kursus level *${level}*...\n\n`)
      await kirimMateri(alya, m, ctx, userData, sender)
    },
  },

  // ── .lanjutbelajar — lanjut ke modul berikutnya ──────────
  {
    command: ['lanjutbelajar', 'lanjutjepang'],
    tags: ['edukasi'],
    run: async (alya, m, ctx) => {
      const { replyalya, isPrem, Ryuu, mess, sender } = ctx
      if (!isPrem && !Ryuu) return replyalya(mess.only.premium)

      const userData = getUserData(sender)
      if (userData.status === 'selesai') {
        return replyalya('🏆 Kamu sudah menyelesaikan semua materi! Ketik *.resetbelajar* untuk mulai lagi.')
      }

      userData.status = 'belajar'
      saveUserData(sender, userData)
      await kirimMateri(alya, m, ctx, userData, sender)
    },
  },

  // ── .soaljepang — minta soal sekarang ────────────────────
  {
    command: ['soaljepang', 'soalsekarang'],
    tags: ['edukasi'],
    run: async (alya, m, ctx) => {
      const { replyalya, isPrem, Ryuu, mess, sender } = ctx
      if (!isPrem && !Ryuu) return replyalya(mess.only.premium)

      const userData = getUserData(sender)

      // Batalkan timer materi jika ada
      if (alya._belajarTimers && alya._belajarTimers[sender]) {
        clearTimeout(alya._belajarTimers[sender])
        delete alya._belajarTimers[sender]
      }

      if (userData.status === 'selesai') {
        return replyalya('🏆 Kamu sudah menyelesaikan semua materi! Ketik *.resetbelajar* untuk mulai lagi.')
      }

      if (userData.status === 'belajar') {
        return replyalya('📖 Kamu belum memulai modul. Ketik *.lanjutbelajar* dulu ya!')
      }

      userData.status = 'ngerjain_soal'
      saveUserData(sender, userData)
      await kirimSoal(alya, m, ctx, userData, sender)
    },
  },

  // ── .progreskuliah — lihat progress ──────────────────────
  {
    command: ['progreskuliah', 'progresJepang', 'statusbelajar'],
    tags: ['edukasi'],
    run: async (alya, m, ctx) => {
      const { replyalya, isPrem, Ryuu, mess, sender } = ctx
      if (!isPrem && !Ryuu) return replyalya(mess.only.premium)

      const userData = getUserData(sender)
      const level = userData.level
      const modulIdx = userData.modul
      const totalModul = getTotalModul(level)
      const akurasi = userData.totalSoal > 0
        ? Math.round((userData.benar / userData.totalSoal) * 100)
        : 0

      let levelProgress = ''
      for (const lv of LEVEL_ORDER) {
        if (lv === level) {
          const persen = totalModul > 0 ? Math.round((modulIdx / totalModul) * 100) : 0
          levelProgress += `  ➤ *${lv}* (sedang) ${progressBar(modulIdx, totalModul)} ${persen}%\n`
        } else if (LEVEL_ORDER.indexOf(lv) < LEVEL_ORDER.indexOf(level)) {
          levelProgress += `  ✅ *${lv}* (selesai)\n`
        } else {
          levelProgress += `  🔒 *${lv}* (terkunci)\n`
        }
      }

      replyalya(
        `╭━━━━『 📊 *PROGRES BELAJARMU* 』━━━━╮\n` +
        `┃\n` +
        `┃  Level aktif: *${level}*\n` +
        `┃  Modul: *${modulIdx}/${totalModul}*\n` +
        `┃  Status: *${userData.status}*\n` +
        `┃\n` +
        `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╣\n` +
        `┃  📈 *Statistik:*\n` +
        `┃  Total soal: *${userData.totalSoal}*\n` +
        `┃  ✅ Benar: *${userData.benar}*\n` +
        `┃  ❌ Salah: *${userData.salah}*\n` +
        `┃  🎯 Akurasi: *${akurasi}%*\n` +
        `┃  ⭐ Skor: *${userData.score}*\n` +
        `┃\n` +
        `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╣\n` +
        `┃  🗺️ *Perjalanan Level:*\n` +
        levelProgress +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    },
  },

  // ── .resetbelajar — reset progress ───────────────────────
  {
    command: ['resetbelajar', 'resetkursus'],
    tags: ['edukasi'],
    run: async (alya, m, ctx) => {
      const { replyalya, isPrem, Ryuu, mess, sender } = ctx
      if (!isPrem && !Ryuu) return replyalya(mess.only.premium)

      // Clear session
      if (alya._soalSession) delete alya._soalSession[sender]
      if (alya._belajarTimers && alya._belajarTimers[sender]) {
        clearTimeout(alya._belajarTimers[sender])
        delete alya._belajarTimers[sender]
      }

      const db = readDB()
      if (!db.users) db.users = {}
      db.users[sender] = {
        level: 'N5',
        modul: 0,
        soal: 0,
        score: 0,
        totalSoal: 0,
        benar: 0,
        salah: 0,
        status: 'belajar',
        lastActivity: Date.now(),
      }
      writeDB(db)

      replyalya(
        `🔄 *Progress belajar direset!*\n\n` +
        `Kamu mulai lagi dari level N5.\n` +
        `Ketik *.lanjutbelajar* untuk memulai kembali! 🚀`
      )
    },
  },

  // ── Handler jawaban soal (listener) ──────────────────────
  {
    command: [],
    tags: ['edukasi'],
    isListener: true, // Flag khusus — dipanggil sebelum isCmd check
    run: async (alya, m, ctx) => {
      const { sender, isPrem, Ryuu } = ctx
      if (!isPrem && !Ryuu) return
      if (!alya._soalSession || !alya._soalSession[sender]) return
      await handleJawaban(alya, m, ctx)
    },
  },
]

// Export helper untuk dipakai alya.js
module.exports.handleJawaban = handleJawaban
module.exports.kirimSoal = kirimSoal
module.exports.kirimMateri = kirimMateri
module.exports.getUserData = getUserData
module.exports.saveUserData = saveUserData
