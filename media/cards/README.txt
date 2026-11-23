═══════════════════════════════════════════════════
  FOLDER GAMBAR CARD — Alya V13
  Plugin: kirimcard.js
═══════════════════════════════════════════════════

Simpan gambar custom kamu di folder ini!

FORMAT YANG DIDUKUNG: .jpg .jpeg .png .webp

═══ NAMA SPESIAL (untuk .salamcard) ══════════════
  pagi.jpg        → Greeting Selamat Pagi  (04:00 - 10:59)
  siang.jpg       → Greeting Selamat Siang (11:00 - 14:59)
  sore.jpg        → Greeting Selamat Sore  (15:00 - 17:59)
  malam.jpg       → Greeting Selamat Malam (18:00 - 20:59)
  tengahmalam.jpg → Greeting Tengah Malam  (21:00 - 03:59)

═══ CARA PAKAI ═══════════════════════════════════
  .kirimcard malam | 🌙 Selamat Malam | Istirahat ya!
  .kirimcard pagi  | ☀️ Selamat Pagi  | Semangat!
  .salamcard       → auto pilih gambar sesuai waktu

═══ TAMBAH GAMBAR VIA BOT ═══════════════════════
  Kirim gambar di WA dengan caption:
  .addcard <nama>
  Contoh: .addcard malam

═══ THUMBNAIL CARD REPLY (ala "Meta AI") ════════
  Simpan gambar dengan nama:
    metaai.jpg / metaai.jpeg / metaai.png / metaai.webp

  Gambar ini otomatis dipakai sebagai thumbnail kecil
  pada SEMUA balasan teks bot (replyalya/replytolak/reply),
  menggantikan gambar greeting waktu (pagi/siang/sore/malam).

  Cukup ganti file metaai.jpg ini untuk mengubah tampilan
  card reply bot secara global. Disarankan ukuran persegi
  (mis. 400x400px).

═══ THUMBNAIL REPLYSENDER (quoted bubble) ═══════
  Simpan gambar dengan nama:
    metaai_sender.jpg / .jpeg / .webp / .png

  Gambar ini dipakai KHUSUS untuk foto di "replySender"
  (bubble quoted di atas balasan bot — fdoc/buildReplySender
  di metaai.js). TERPISAH dari metaai.jpg di atas, jadi kamu
  bisa pakai foto berbeda untuk card body vs replySender.

  Kalau metaai_sender.jpg tidak ada, otomatis fallback ke
  metaai.jpg (jadi keduanya akan terlihat sama).

  File metaai_sender.jpg sudah disediakan (400x400px, hasil
  resize dari metaai.jpg) sebagai starting point — tinggal
  GANTI file ini dengan foto custom kamu sendiri.

═══════════════════════════════════════════════════
