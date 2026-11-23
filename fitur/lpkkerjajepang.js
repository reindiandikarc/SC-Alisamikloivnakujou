// ============================================================
// FITUR LPK KERJA JEPANG - ALYA BOT
// .lpkkerjajepang
// Menampilkan daftar LPK Indonesia terpercaya dengan dana talangan
// ============================================================

const dataLPK = [
  {
    nama: 'LPK OHM',
    lokasi: 'Bekasi, Jawa Barat',
    program: 'Magang Jepang Manufaktur, Konstruksi, Kaigo (Perawat Lansia)',
    danaTalangan: true,
    keunggulan: 'Seleksi ketat, tingkat kelulusan N4 tinggi, sudah ratusan alumni bekerja di Jepang',
    pendaftaran: 'IG @lpk_ohm',
    jadwal: 'Buka tiap bulan, wawancara tiap minggu',
    kontak: 'DM IG @lpk_ohm'
  },
  {
    nama: 'LPK Sakura JLC',
    lokasi: 'Depok & Bekasi, Jawa Barat',
    program: 'Magang Jepang & Tokutei Ginou (TG)',
    danaTalangan: true,
    keunggulan: 'Sertifikasi resmi, program intensif bahasa Jepang, alumni tersebar di berbagai prefektur',
    pendaftaran: 'https://sakurajlc.com',
    jadwal: 'Gelombang: Februari, April, Agustus, Oktober',
    kontak: 'Website resmi atau WA tercantum di web'
  },
  {
    nama: 'LPK Hinomaru',
    lokasi: 'Cikarang, Jawa Barat',
    program: 'Magang Jepang semua bidang (Manufaktur, Pertanian, Perikanan, dll)',
    danaTalangan: true,
    keunggulan: 'Bimbingan intensif, seleksi 2 minggu sekali, alumni aktif ribuan orang',
    pendaftaran: 'WA admin via IG @hinomaru_lpk',
    jadwal: 'Buka terus, seleksi tiap 2 minggu',
    kontak: 'IG @hinomaru_lpk'
  },
  {
    nama: 'LPK Mardizu',
    lokasi: 'Bekasi, Jawa Barat',
    program: 'Kapal Pesiar, Hotel, F&B (Food & Beverage), Housekeeping',
    danaTalangan: true,
    keunggulan: 'Spesialis kapal pesiar & perhotelan internasional, jaringan luas ke Jepang dan global',
    pendaftaran: 'https://lpk.mardizu.co.id',
    jadwal: 'Daftar tiap bulan',
    kontak: 'Website resmi atau email tercantum di web'
  },
  {
    nama: 'LPK Bina Insani',
    lokasi: 'Yogyakarta',
    program: 'Jepang, Korea, Kapal Pesiar (multi-destinasi)',
    danaTalangan: true,
    keunggulan: 'Lembaga terpercaya di Jogja, pengalaman 10+ tahun, alumni lulus ke berbagai negara',
    pendaftaran: 'https://binainsani.com',
    jadwal: '4x setahun: Januari, April, Juli, Oktober',
    kontak: 'Website atau telp tercantum di web'
  },
  {
    nama: 'LPK JIAEC',
    lokasi: 'Bandung, Jawa Barat',
    program: 'Magang Jepang Kaigo (Caregiver), Konstruksi',
    danaTalangan: true,
    keunggulan: 'Fokus Kaigo & Konstruksi, kurikulum terstandar, kerjasama langsung dengan perusahaan Jepang',
    pendaftaran: 'https://jiaec.co.id',
    jadwal: 'Buka Februari & Agustus setiap tahun',
    kontak: 'Website resmi'
  },
  {
    nama: 'LPK YAPMI',
    lokasi: 'Jakarta Timur, DKI Jakarta',
    program: 'Caregiver Jepang & Jerman, Perawat Lansia',
    danaTalangan: true,
    keunggulan: 'Spesialis Caregiver, sertifikasi internasional, jaringan ke Jepang dan Eropa',
    pendaftaran: 'https://yapmi.co.id',
    jadwal: 'Gelombang tiap 3 bulan',
    kontak: 'Website atau WA tercantum di web'
  },
  {
    nama: 'LPK Sumber Makmur',
    lokasi: 'Semarang, Jawa Tengah',
    program: 'Magang Jepang Manufaktur, Pertanian, Peternakan',
    danaTalangan: true,
    keunggulan: 'Basis Jawa Tengah, biaya terjangkau, dana talangan 0%, sudah ratusan alumni',
    pendaftaran: 'IG @lpk_sumbermakmur',
    jadwal: 'Buka setiap bulan, tes tiap 2 minggu',
    kontak: 'DM IG @lpk_sumbermakmur'
  },
  {
    nama: 'LPK Global Nusantara',
    lokasi: 'Surabaya, Jawa Timur',
    program: 'Magang Jepang, Tokutei Ginou bidang Manufaktur & Konstruksi',
    danaTalangan: true,
    keunggulan: 'Terbesar di Jawa Timur, fasilitas asrama, pelatihan intensif, tingkat penempatan tinggi',
    pendaftaran: 'https://globalnusantarajepang.com',
    jadwal: 'Buka tiap bulan',
    kontak: 'Website atau hubungi admin'
  },
  {
    nama: 'LPK Kairos Indonesia',
    lokasi: 'Medan, Sumatera Utara',
    program: 'Magang Jepang Manufaktur, Kaigo, Pertanian',
    danaTalangan: true,
    keunggulan: 'Pusat Sumatera, dana talangan fleksibel, bimbingan bahasa Jepang JLPT N4',
    pendaftaran: 'IG @lpk_kairosindonesia',
    jadwal: 'Gelombang tiap 3 bulan',
    kontak: 'DM IG @lpk_kairosindonesia'
  }
]

module.exports = { dataLPK }
