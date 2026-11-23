// ════════════════════════════════════════════════════════════════
// Plugin  : bcscheduled.js — Alya V20 Scheduled Broadcast
// Author  : reindiandikarc
// Commands: bcschedule, bcschedulelist, bcscheduledel
// Akses   : Owner only
// Deskripsi:
//   Broadcast terjadwal — atur jam kirim, pesan dikirim
//   otomatis ke grup/kontak/semua sesuai waktu WIB.
// ════════════════════════════════════════════════════════════════

'use strict';

const fs     = require('fs');
const moment = require('moment-timezone') || require('moment');

// ── DB jadwal ───────────────────────────────────────────────────
const SCH_PATH = './database/bc_scheduled.json';
function readSch() {
  try {
    if (!fs.existsSync(SCH_PATH)) return [];
    return JSON.parse(fs.readFileSync(SCH_PATH, 'utf-8')) || [];
  } catch { return []; }
}
function saveSch(data) {
  fs.writeFileSync(SCH_PATH, JSON.stringify(data, null, 2));
}

const { getTargetList } = require('../../lib/bctargets');
const { bcSafeDelay }   = require('../../lib/antibanGuard');

// legacy fallback
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Jalankan cron scheduler (dipanggil sekali dari alya.js atau disini) ─
let _schInterval = null;
function startScheduler(alya, store) {
  if (_schInterval) return;
  _schInterval = setInterval(async () => {
    const now  = moment().tz('Asia/Jakarta');
    const hhMM = now.format('HH:mm');
    const day  = now.day(); // 0=Minggu ... 6=Sabtu

    const list = readSch();
    let changed = false;

    for (const item of list) {
      if (!item.active) continue;
      // Cek jam
      if (item.jam !== hhMM) continue;
      // Cek hari (jika ada filter hari)
      if (item.hari && item.hari.length > 0 && !item.hari.includes(day)) continue;
      // Cek sudah dikirim menit ini?
      const lastSent = item.lastSent || '';
      const todayKey = now.format('YYYY-MM-DD HH:mm');
      if (lastSent === todayKey) continue;

      // Kirim!
      item.lastSent = todayKey;
      changed = true;

      const targets = await getTargetList(alya, store, item.target || 'all');
      let sukses = 0, gagal = 0;

      for (const chatId of targets) {
        try {
          await alya.sendMessage(chatId, { text: item.pesan });
          sukses++;
        } catch { gagal++; }
        await bcSafeDelay(sukses + gagal); // ✅ anti-ban: jitter delay
      }

      console.log(`[BC-SCHEDULE] "${item.nama}" → ${sukses}✅ ${gagal}❌`);

      // Jika sekali pakai, nonaktifkan
      if (item.sekali) {
        item.active = false;
      }
    }

    if (changed) saveSch(list);
  }, 60000); // cek tiap 1 menit
}

module.exports = {
  command: ['bcschedule', 'bcschedulelist', 'bcscheduledel', 'bcschedulestart'],
  tags: ['owner'],

  // Expose startScheduler agar bisa dipanggil dari alya.js
  startScheduler,

  run: async (alya, m, ctx) => {
    const {
      command, text, prefix, store,
      Ryuu, replyalya, replytolak,
    } = ctx;

    if (!Ryuu) return replytolak(`❌ Hanya untuk Owner!`);
    const pfx = prefix || '.';

    // Auto-start scheduler saat plugin dijalankan
    startScheduler(alya, store);

    // ════════════════════════════════════════════════════════════
    // .bcschedule <nama> | <jam HH:mm> | <target> | <pesan>
    // Contoh: .bcschedule pagi | 07:00 | gc | Selamat pagi semua! 🌅
    // ════════════════════════════════════════════════════════════
    if (command === 'bcschedule') {
      if (!text || !text.includes('|')) return replyalya(
        `╭─「 ⏰ *JADWAL BROADCAST* 」\n│\n` +
        `│ *Format:*\n` +
        `│ ${pfx}bcschedule <nama> | <jam> | <target> | <pesan>\n│\n` +
        `│ *Target:* gc / dm / all\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bcschedule pagi | 07:00 | gc | Selamat pagi semua! ☀️\n│\n` +
        `│ *Opsi tambahan:*\n` +
        `│ Tambah --sekali agar hanya kirim sekali\n` +
        `│ Tambah --hari:1,2,3 untuk filter hari\n` +
        `│ (0=Minggu, 1=Senin, ..., 6=Sabtu)\n` +
        `╰──────────────────`
      );

      const parts = text.split('|').map(s => s.trim());
      if (parts.length < 4) return replyalya(`❌ Format kurang lengkap!\nGunakan: *${pfx}bcschedule nama | 07:00 | gc | pesan*`);

      const nama   = parts[0];
      const jam    = parts[1];
      const target = parts[2].toLowerCase();
      const pesan  = parts.slice(3).join('|').trim();

      // Validasi jam format HH:mm
      if (!/^\d{2}:\d{2}$/.test(jam)) return replyalya(`❌ Format jam salah! Gunakan HH:mm (contoh: 07:00)`);
      if (!['gc','dm','all'].includes(target)) return replyalya(`❌ Target harus: gc / dm / all`);
      if (!pesan) return replyalya(`❌ Pesan tidak boleh kosong!`);

      // Parse opsi
      const sekali = pesan.includes('--sekali');
      const hariMatch = pesan.match(/--hari:([\d,]+)/);
      const hari = hariMatch ? hariMatch[1].split(',').map(Number) : [];
      const pesanBersih = pesan.replace(/--sekali|--hari:[\d,]+/g, '').trim();

      const list = readSch();
      const id   = `sch_${Date.now()}`;
      list.push({
        id, nama, jam, target,
        pesan: pesanBersih,
        sekali, hari,
        active  : true,
        lastSent: '',
        dibuat  : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      });
      saveSch(list);

      const targetLabel = target === 'gc' ? '📢 Semua Grup' : target === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
      return replyalya(
        `╭─「 ✅ *JADWAL DISIMPAN* 」\n│\n` +
        `│ 📌 Nama   : *${nama}*\n` +
        `│ ⏰ Jam    : *${jam} WIB*\n` +
        `│ 🎯 Target : ${targetLabel}\n` +
        `│ 🔁 Mode   : ${sekali ? 'Sekali pakai' : 'Berulang harian'}\n` +
        (hari.length > 0 ? `│ 📅 Hari   : ${hari.map(d => ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d]).join(', ')}\n` : '') +
        `│ 📝 Pesan  : ${pesanBersih.slice(0, 40)}${pesanBersih.length > 40 ? '...' : ''}\n` +
        `│\n│ 🟢 Scheduler aktif!\n` +
        `╰──────────────────`
      );
    }

    // ════════════════════════════════════════════════════════════
    // .bcschedulelist — tampilkan semua jadwal
    // ════════════════════════════════════════════════════════════
    if (command === 'bcschedulelist') {
      const list = readSch();
      if (list.length === 0) return replyalya(
        `ℹ️ Belum ada jadwal broadcast.\n\nGunakan: *${pfx}bcschedule* untuk membuat jadwal.`
      );

      let txt = `╭─「 📅 *JADWAL BROADCAST* 」\n│\n`;
      list.forEach((item, i) => {
        const targetLabel = item.target === 'gc' ? 'Grup' : item.target === 'dm' ? 'Kontak' : 'Semua';
        txt += `│ ${i+1}. *${item.nama}*\n`;
        txt += `│    ⏰ ${item.jam} WIB • ${targetLabel} • ${item.active ? '🟢 Aktif' : '🔴 Nonaktif'}\n`;
        txt += `│    📝 ${item.pesan.slice(0, 35)}${item.pesan.length > 35 ? '...' : ''}\n│\n`;
      });
      txt += `│ Hapus: *${pfx}bcscheduledel <nama>*\n`;
      txt += `╰──────────────────`;
      return replyalya(txt);
    }

    // ════════════════════════════════════════════════════════════
    // .bcscheduledel <nama> — hapus jadwal
    // ════════════════════════════════════════════════════════════
    if (command === 'bcscheduledel') {
      if (!text) return replyalya(`❌ Gunakan: *${pfx}bcscheduledel <nama>*`);
      let list = readSch();
      const idx = list.findIndex(i => i.nama.toLowerCase() === text.trim().toLowerCase());
      if (idx === -1) return replyalya(`❌ Jadwal *${text.trim()}* tidak ditemukan!`);
      const nama = list[idx].nama;
      list.splice(idx, 1);
      saveSch(list);
      return replyalya(`✅ Jadwal *${nama}* berhasil dihapus.`);
    }
  },
};
