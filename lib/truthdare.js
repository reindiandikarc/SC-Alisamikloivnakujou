// ============================================
// TRUTHDARE.JS — Truth or Dare Game (Alya V12)
// ============================================

const truthList = [
  "Siapa orang yang paling kamu suka di grup ini?",
  "Ceritain pengalaman malu-maluin yang pernah kamu alami!",
  "Pernah bohong ke orang tua? Ceritain!",
  "Siapa crush pertama kamu? Sebutin namanya!",
  "Kapan terakhir kali kamu nangis dan kenapa?",
  "Hal apa yang paling kamu sembunyiin dari temen-temen?",
  "Pernah stalking mantan? Jujur ya!",
  "Kamu lebih pilih kaya tapi sendiri atau miskin tapi bahagia?",
  "Ceritain momen paling awkward kamu sama lawan jenis!",
  "Siapa yang paling sering kamu ghosting di kontakmu?",
  "Kalau bisa jadian sama siapa di grup ini, siapa?",
  "Pernah punya perasaan ke teman baik kamu sendiri? Jujur!",
  "Hal paling memalukan yang pernah kamu lakuin waktu kecil?",
  "Pernah nangis gara-gara game? Ceritain!",
  "Siapa yang terakhir kamu blokir dan kenapa?",
  "Kalau ada 1 hal yang bisa kamu hapus dari hidupmu, apa itu?",
  "Berapa lama waktu terlama kamu tidak mandi?",
  "Pernah pura-pura sakit biar gak masuk sekolah/kerja?",
  "Aplikasi apa yang paling sering kamu pakai tapi malu ngakuinnya?",
  "Kamu lebih takut putus cinta atau kehilangan sahabat?",
  "Ceritakan satu kebohongan terbesar yang pernah kamu buat!",
  "Siapa yang paling sering kamu curhatin masalahmu?",
  "Pernah baca chat orang lain tanpa izin? Jujur!",
  "Apa hal paling gila yang pernah kamu lakuin demi gebetan?",
  "Kalau bisa ubah satu hal dari dirimu, apa itu?",
  "Pernah jatuh cinta sama teman sendiri yang sudah punya pasangan?",
  "Rahasia terbesar kamu yang belum pernah diceritain ke siapapun?",
  "Hal apa yang bikin kamu insecure tentang dirimu sendiri?",
  "Kalau kamu hanya punya 24 jam lagi, kamu mau ngapain?",
  "Pernah screenshot percakapan orang lain buat dikirim ke orang lain?"
];

const dareList = [
  "Kirim selfie jelek (tanpa filter) di sini sekarang!",
  "Telepon teman secara acak dan bilang 'Aku kangen kamu' lalu tutup HP.",
  "Tulis status WA: 'Aku mau nembak seseorang hari ini!' selama 5 menit.",
  "Kirim voice note nyanyi lagu 'Baby Shark' di sini!",
  "Ganti nama display kamu jadi 'Aku Pemain Truth or Dare' selama 10 menit.",
  "Kirim foto telapak kakimu di sini.",
  "Kirim pesan 'Aku cinta kamu' ke kontak ke-3 di HPmu.",
  "Minum air putih 3 gelas sekarang, kirim foto buktinya!",
  "Joget 30 detik dan kirim videonya!",
  "Kirim voice note imitasi suara bebek selama 10 detik.",
  "Telepon seseorang dan ceritakan lelucon terburukmu.",
  "Tulis nama crush kamu di sini pakai huruf terbalik.",
  "Lakukan 20 jumping jack sekarang, kirim videonya!",
  "Kirim foto mukamu dengan ekspresi paling aneh di sini.",
  "Kirim voice note bilang 'Saya sangat ganteng/cantik' 5 kali.",
  "Ganti PP WA dengan foto yang sudah ditentukan pemain lain selama 1 jam.",
  "Kirim emoji yang menggambarkan perasaanmu saat ini sebanyak 30 karakter.",
  "Nyanyi 1 bait lagu favorit kamu via voice note.",
  "Kirim meme paling lucu yang ada di HPmu.",
  "Tulis kalimat 'Aku cinta truth or dare' pakai tangan kirimu dan foto hasilnya.",
  "Ceritakan lelucon terbaik kamu, kalau tidak ada yang ketawa kamu harus dare lagi!",
  "Kirim voice note tertawa jahat selama 10 detik.",
  "Lakukan push-up 10 kali dan kirim videonya!",
  "Kirim foto koleksi screenshot galau di HPmu (tanpa sensor nama).",
  "Tulis satu kalimat puisi dadakan tentang grup ini dan kirim di sini.",
  "Kirim voice note ngomong nama lengkapmu seperti announcer berita.",
  "Ubah foto profil WA kamu dengan foto bebas pilihan teman selama 30 menit.",
  "Kirim pesan ke mantan (kalau ada) cukup emoji 👋 lalu screenshot dan kirim.",
  "Buat tiktok 15 detik apapun dan kirim di sini.",
  "Ceritain sesuatu yang belum pernah kamu ceritain ke siapapun tapi gak terlalu rahasia."
];

function getRandomTruth() {
  return truthList[Math.floor(Math.random() * truthList.length)];
}

function getRandomDare() {
  return dareList[Math.floor(Math.random() * dareList.length)];
}

module.exports = { getRandomTruth, getRandomDare };
