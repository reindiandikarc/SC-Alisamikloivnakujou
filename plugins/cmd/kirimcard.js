// ╔══════════════════════════════════════════════════════════════╗
// ║  KIRIMCARD — Alya V13 Plugin                                 ║
// ║  Kirim pesan bergaya "card" dengan gambar lokal custom       ║
// ║                                                              ║
// ║  Fitur:                                                      ║
// ║  • .kirimcard  — kirim card dengan gambar lokal + teks      ║
// ║  • .salamcard  — card ucapan waktu otomatis (pagi/malam)    ║
// ║  • .cardlist   — lihat daftar gambar card tersedia          ║
// ║  • .addcard    — tambah gambar card baru (owner/admin)      ║
// ║  • .delcard    — hapus gambar card (owner/admin)            ║
// ║                                                              ║
// ║  Folder gambar: ./media/cards/                              ║
// ║  Format: .kirimcard <nama_gambar> | <judul> | <teks>        ║
// ╚══════════════════════════════════════════════════════════════╝

'use strict';

const fs   = require('fs');
const path = require('path');
const axios = require('axios');

// ─── Folder penyimpanan gambar card ────────────────────────────
const CARD_DIR = path.join(process.cwd(), 'media', 'cards');
if (!fs.existsSync(CARD_DIR)) fs.mkdirSync(CARD_DIR, { recursive: true });

// ─── DB preset gambar bawaan (fallback jika folder kosong) ─────
const DEFAULT_FALLBACK_URL =
  'https://raw.githubusercontent.com/reindiandikarc/Yuugames/refs/heads/main/alya1.jpg';



// ─── Ambil buffer gambar dari nama file (lokal) atau URL ────────
async function getImageBuffer(nameOrUrl) {
  // Cek apakah URL
  if (/^https?:\/\//.test(nameOrUrl)) {
    const res = await axios.get(nameOrUrl, { responseType: 'arraybuffer', timeout: 12000 });
    return Buffer.from(res.data);
  }

  // Cek di folder cards/
  const exts = ['.jpg', '.jpeg', '.png', '.webp', ''];
  for (const ext of exts) {
    const p = path.join(CARD_DIR, nameOrUrl + ext);
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }

  // Cek di media/ root
  const rootExts = ['.jpg', '.jpeg', '.png', '.webp', ''];
  for (const ext of rootExts) {
    const p = path.join(process.cwd(), 'media', nameOrUrl + ext);
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }

  // Cek di data/image/
  for (const ext of rootExts) {
    const p = path.join(process.cwd(), 'data', 'image', nameOrUrl + ext);
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }

  return null;
}

// ─── List semua file gambar di folder cards/ ───────────────────
function listCards() {
  try {
    return fs.readdirSync(CARD_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  } catch {
    return [];
  }
}

// ─── Greeting otomatis berdasarkan waktu WIB ───────────────────
function getGreeting() {
  const hour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  ).getHours();

  if (hour >= 4  && hour < 11) return { label: 'pagi',  emoji: '🌄', text: 'Selamat Pagi'  };
  if (hour >= 11 && hour < 15) return { label: 'siang', emoji: '☀️', text: 'Selamat Siang' };
  if (hour >= 15 && hour < 18) return { label: 'sore',  emoji: '🌇', text: 'Selamat Sore'  };
  if (hour >= 18 && hour < 21) return { label: 'malam', emoji: '🌙', text: 'Selamat Malam' };
  return { label: 'tengahmalam', emoji: '🌌', text: 'Selamat Malam'  };
}

// ══════════════════════════════════════════════════════════════
//  COMMANDS
// ══════════════════════════════════════════════════════════════
module.exports = [

  // ── .kirimcard ───────────────────────────────────────────────
  // Format: .kirimcard [nama_gambar] | [judul] | [isi teks]
  // Contoh: .kirimcard malam | 🌙 Selamat Malam | Tetap semangat ya!
  //         .kirimcard       (tanpa arg → pakai gambar random dari cards/)
  {
    command: ['kirimcard', 'sendcard', 'imagecard', 'msgcard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { text, prefix, command, pushname, sender, reply, replyalya } = ctx;

      // HELP
      if (!text || text.trim() === 'help') {
        return replyalya(
`╔══[ 🖼️ *KIRIM CARD* ]══╗

📋 *Format Penggunaan:*

*1. Dengan gambar dari folder:*
\`${prefix}${command} <nama_gambar> | <judul> | <isi pesan>\`

*2. Gambar random dari folder cards/:*
\`${prefix}${command} | <judul> | <isi pesan>\`

*3. Gambar dari URL langsung:*
\`${prefix}${command} https://url.com/img.jpg | <judul> | <pesan>\`

📝 *Contoh:*
\`${prefix}${command} malam | 🌙 Selamat Malam | Istirahat yang cukup ya!\`
\`${prefix}${command} | Halo! | Semangat hari ini!\`

🗂️ *Lihat gambar tersedia:*
\`${prefix}cardlist\`

💡 *Catatan:* Simpan gambar custom di folder \`media/cards/\``
        );
      }

      // Parse argumen: gambar | judul | isi
      const parts = text.split('|').map(s => s.trim());
      const rawImg  = parts[0] || '';
      const judul   = parts[1] || `✨ ${global.botname || 'Alya Bot'}`;
      const isiPesan = parts[2] || parts[1] || `${global.botname || 'Alya Bot'} • Pesan`;

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      let imgBuf = null;

      // Coba ambil gambar sesuai input
      if (rawImg) {
        imgBuf = await getImageBuffer(rawImg).catch(() => null);
      }

      // Jika tidak ada / tidak ditemukan → ambil random dari cards/
      if (!imgBuf) {
        const cardFiles = listCards();
        if (cardFiles.length > 0) {
          const picked = cardFiles[Math.floor(Math.random() * cardFiles.length)];
          imgBuf = fs.readFileSync(path.join(CARD_DIR, picked));
        }
      }

      // Fallback terakhir → data/image/thumb.jpg atau alya.jpg
      if (!imgBuf) {
        const fallbackPaths = [
          path.join(process.cwd(), 'data', 'image', 'thumb.jpg'),
          path.join(process.cwd(), 'media', 'alya', 'alya1.jpg'),
          path.join(process.cwd(), 'media', 'alya.jpg'),
        ];
        for (const fp of fallbackPaths) {
          if (fs.existsSync(fp)) { imgBuf = fs.readFileSync(fp); break; }
        }
      }

      // Fallback URL jika semua gagal
      if (!imgBuf) {
        try {
          const res = await axios.get(DEFAULT_FALLBACK_URL, { responseType: 'arraybuffer', timeout: 10000 });
          imgBuf = Buffer.from(res.data);
        } catch (_) {}
      }

      try {
        await alya.sendMessage(m.chat, {
          image:   imgBuf,
          caption: isiPesan,
        }, { quoted: m });
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[kirimcard] Error:', err.message);
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        replyalya('❌ Gagal kirim card. Pastikan gambar valid.');
      }
    },
  },

  // ── .salamcard ───────────────────────────────────────────────
  // Kirim card ucapan waktu otomatis (Selamat Pagi/Siang/Malam)
  // Gambar dipilih dari folder cards/ berdasarkan nama file yang match
  // Contoh file: pagi.jpg, siang.png, malam.jpg, tengahmalam.jpg
  {
    command: ['salamcard', 'greetcard', 'ucapancard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { pushname, sender, replyalya } = ctx;

      const greet = getGreeting();
      const nama  = pushname || 'Kak';

      const pesanList = {
        pagi:        `☀️ Mulai hari dengan semangat ya, ${nama}! Jangan lupa sarapan dan berdoa sebelum aktivitas 🙏`,
        siang:       `🌞 Sudah makan siang belum, ${nama}? Jaga kesehatan dan tetap produktif ya! 💪`,
        sore:        `🌇 Waktunya istirahat sebentar, ${nama}. Sore yang indah buat nge-charge energi lagi ✨`,
        malam:       `🌙 Selamat malam, ${nama}! Jangan begadang ya, istirahat yang cukup biar tetap sehat 💙`,
        tengahmalam: `🌌 Masih melek, ${nama}? Sudah larut malam, yuk istirahat. Besok masih ada hari baru 🌟`,
      };

      const isiPesan = pesanList[greet.label] || `${greet.text}, ${nama}! ${greet.emoji}`;
      const judul    = `${greet.emoji} ${greet.text}`;

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      // Cari gambar yang sesuai waktu
      let imgBuf = null;
      const cardFiles = listCards();
      const matchFile = cardFiles.find(f => f.toLowerCase().startsWith(greet.label));
      if (matchFile) {
        imgBuf = fs.readFileSync(path.join(CARD_DIR, matchFile));
      } else if (cardFiles.length > 0) {
        const picked = cardFiles[Math.floor(Math.random() * cardFiles.length)];
        imgBuf = fs.readFileSync(path.join(CARD_DIR, picked));
      }

      // Fallback
      if (!imgBuf) {
        const fallbackPaths = [
          path.join(process.cwd(), 'data', 'image', 'thumb.jpg'),
          path.join(process.cwd(), 'media', 'alya', 'alya1.jpg'),
          path.join(process.cwd(), 'media', 'alya.jpg'),
        ];
        for (const fp of fallbackPaths) {
          if (fs.existsSync(fp)) { imgBuf = fs.readFileSync(fp); break; }
        }
      }
      if (!imgBuf) {
        try {
          const res = await axios.get(DEFAULT_FALLBACK_URL, { responseType: 'arraybuffer', timeout: 10000 });
          imgBuf = Buffer.from(res.data);
        } catch (_) {}
      }

      try {
        await alya.sendMessage(m.chat, {
          image:   imgBuf,
          caption: isiPesan,
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[salamcard] Error:', err.message);
        replyalya(`${greet.emoji} *${greet.text}, ${nama}!*\n\n${isiPesan}`);
      }
    },
  },

  // ── .cardlist ────────────────────────────────────────────────
  // Tampilkan daftar gambar yang tersedia di folder cards/
  {
    command: ['cardlist', 'listcard', 'daftarcard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { prefix, replyalya } = ctx;

      const files = listCards();
      if (files.length === 0) {
        return replyalya(
`🗂️ *DAFTAR CARD*

📭 Belum ada gambar card tersimpan.

💡 Cara tambah gambar:
• Kirim gambar dengan caption: *${prefix}addcard <nama>*
• Atau simpan manual ke folder \`media/cards/\`

📌 Format nama yang disarankan:
  \`pagi.jpg\` → dipakai untuk salamcard pagi
  \`siang.jpg\` → dipakai untuk salamcard siang  
  \`malam.jpg\` → dipakai untuk salamcard malam
  \`custom1.jpg\` → bebas dipakai di kirimcard`
        );
      }

      const listStr = files.map((f, i) => {
        const name = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const size = fs.statSync(path.join(CARD_DIR, f)).size;
        const sizeKb = (size / 1024).toFixed(1);
        return `${i + 1}. *${name}* (${sizeKb} KB)`;
      }).join('\n');

      replyalya(
`🗂️ *DAFTAR GAMBAR CARD*
Folder: \`media/cards/\`

${listStr}

📌 *Cara pakai:*
\`${prefix}kirimcard <nama> | <judul> | <pesan>\`

Contoh:
\`${prefix}kirimcard malam | 🌙 Selamat Malam | Istirahat ya!\``
      );
    },
  },

  // ── .addcard ─────────────────────────────────────────────────
  // Tambah gambar card baru (kirim gambar + command)
  // Hanya owner atau admin group
  {
    command: ['addcard', 'tambahcard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { text, isAdmins, Ryuu, isGroup, reply, replyalya, replytolak } = ctx;
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');

      if (!Ryuu && !isAdmins) return replytolak('Fitur ini hanya untuk owner dan admin!');

      if (!text) return replyalya(
`📸 *CARA TAMBAH CARD*

Kirim gambar dengan caption:
\`addcard <nama_file>\`

Atau reply gambar dengan:
\`${ctx.prefix}addcard <nama_file>\`

Contoh nama:
• \`pagi\` → disimpan sebagai pagi.jpg
• \`malam\` → disimpan sebagai malam.jpg
• \`custom1\` → disimpan sebagai custom1.jpg

📌 Nama *pagi/siang/sore/malam* otomatis dipilih saat \`salamcard\``
      );

      const nama = text.trim().replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase();
      if (!nama) return replyalya('❌ Nama file tidak valid. Gunakan huruf, angka, atau underscore saja.');

      // Ambil gambar dari quoted atau pesan saat ini
      const isImg = m.quoted?.message?.imageMessage || m.message?.imageMessage;
      const quotedIsImg = m.quoted?.message?.imageMessage;

      if (!isImg && !quotedIsImg) {
        return replyalya('❌ Kirim atau reply gambar terlebih dahulu!\n\nContoh: Kirim gambar, caption: `.addcard malam`');
      }

      try {
        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        const msgToDownload = quotedIsImg ? m.quoted.fakeObj : m;
        const buf = await downloadMediaMessage(msgToDownload, 'buffer', {}, { logger: alya.logger });

        const savePath = path.join(CARD_DIR, `${nama}.jpg`);
        fs.writeFileSync(savePath, buf);

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        replyalya(
`✅ *Gambar card berhasil disimpan!*

📁 Nama file : \`${nama}.jpg\`
📏 Ukuran    : ${(buf.length / 1024).toFixed(1)} KB
📂 Lokasi    : \`media/cards/${nama}.jpg\`

💡 Gunakan dengan:
\`${ctx.prefix}kirimcard ${nama} | judul | pesan\``
        );
      } catch (err) {
        console.error('[addcard]', err.message);
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        replyalya('❌ Gagal menyimpan gambar: ' + err.message);
      }
    },
  },

  // ── .delcard ─────────────────────────────────────────────────
  // Hapus gambar card dari folder
  {
    command: ['delcard', 'hapuscard', 'removecard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { text, isAdmins, Ryuu, replyalya, replytolak } = ctx;

      if (!Ryuu && !isAdmins) return replytolak('Fitur ini hanya untuk owner dan admin!');
      if (!text) return replyalya(`❌ Sebutkan nama gambar yang ingin dihapus.\nContoh: \`${ctx.prefix}delcard malam\``);

      const nama  = text.trim().replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase();
      const exts  = ['.jpg', '.jpeg', '.png', '.webp'];
      let deleted = false;

      for (const ext of exts) {
        const fp = path.join(CARD_DIR, nama + ext);
        if (fs.existsSync(fp)) {
          fs.unlinkSync(fp);
          deleted = true;
          replyalya(`✅ Gambar card *${nama}${ext}* berhasil dihapus.`);
          break;
        }
      }

      if (!deleted) {
        replyalya(`❌ Gambar card *${nama}* tidak ditemukan.\n\nCek daftar: \`${ctx.prefix}cardlist\``);
      }
    },
  },

  // ── .previewcard ─────────────────────────────────────────────
  // Preview semua gaya card yang tersedia
  {
    command: ['previewcard', 'testcard'],
    tags: ['tools'],
    run: async (alya, m, ctx) => {
      const { pushname, Ryuu, isAdmins, replyalya, replytolak } = ctx;

      if (!Ryuu && !isAdmins) return replytolak('Fitur ini hanya untuk owner dan admin!');

      const nama = pushname || 'User';
      let imgBuf = null;

      // Ambil gambar pertama dari cards/
      const files = listCards();
      if (files.length > 0) {
        imgBuf = fs.readFileSync(path.join(CARD_DIR, files[0]));
      } else {
        const fallbackPaths = [
          path.join(process.cwd(), 'data', 'image', 'thumb.jpg'),
          path.join(process.cwd(), 'media', 'alya', 'alya1.jpg'),
          path.join(process.cwd(), 'media', 'alya.jpg'),
        ];
        for (const fp of fallbackPaths) {
          if (fs.existsSync(fp)) { imgBuf = fs.readFileSync(fp); break; }
        }
      }

      if (!imgBuf) {
        try {
          const res = await axios.get(DEFAULT_FALLBACK_URL, { responseType: 'arraybuffer', timeout: 10000 });
          imgBuf = Buffer.from(res.data);
        } catch (_) {}
      }

      if (!imgBuf) return replyalya('❌ Tidak ada gambar tersedia untuk preview.');

      await replyalya('🔄 Mengirim preview card...');

      // Kirim 2 style: renderLarge=false dan renderLarge=true
      const styles = [
        { label: 'Style 1 — Thumbnail Kecil (Card)',  large: false },
        { label: 'Style 2 — Thumbnail Besar (Banner)', large: true  },
      ];

      for (const s of styles) {
        const previewCaption = `Preview: *${s.label}*\nHalo ${nama}! Ini adalah preview tampilan card bot.`;
        await alya.sendMessage(m.chat, {
          image:   imgBuf,
          caption: previewCaption,
        }, { quoted: m });
        await new Promise(r => setTimeout(r, 800));
      }
    },
  },

];
