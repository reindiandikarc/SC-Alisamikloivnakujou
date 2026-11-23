// Plugin: addsewastore
// Fixed: tambah support format <link> <durasi>, tampilkan status sewa aktif & expiry
// Commands: addsewastore, delsewastore, listsewastore

'use strict';

const fs   = require('fs');
const path = require('path');

const SEWASTORE_DB = path.join(process.cwd(), 'database', 'sewastore.json');
const SEWA_DB      = path.join(process.cwd(), 'database', 'sewa.json');

// ── DB Helpers ─────────────────────────────────────────────────────────────

function loadSewaStore() {
  try {
    if (!fs.existsSync(SEWASTORE_DB)) fs.writeFileSync(SEWASTORE_DB, '[]', 'utf-8');
    return JSON.parse(fs.readFileSync(SEWASTORE_DB, 'utf-8')) || [];
  } catch { return []; }
}

function saveSewaStore(data) {
  fs.writeFileSync(SEWASTORE_DB, JSON.stringify(data, null, 2), 'utf-8');
  global._sewaStore = data;
}

function loadSewa() {
  try {
    if (!fs.existsSync(SEWA_DB)) fs.writeFileSync(SEWA_DB, '[]', 'utf-8');
    return JSON.parse(fs.readFileSync(SEWA_DB, 'utf-8')) || [];
  } catch { return []; }
}

function saveSewa(sewa) {
  fs.writeFileSync(SEWA_DB, JSON.stringify(sewa, null, 2), 'utf-8');
  global.sewa = sewa;
}

function isSewaStore(groupId) {
  const db = global._sewaStore || loadSewaStore();
  return db.includes(groupId);
}

// Expose global helper agar bisa dipakai alya.js
if (!global._sewaStoreHelper) {
  global._sewaStoreHelper = { isSewaStore, loadSewaStore };
  global._sewaStore = loadSewaStore();
}

// ── Durasi & Waktu Helpers ─────────────────────────────────────────────────

function toMs(str) {
  const num  = parseInt(str);
  const unit = str[str.length - 1].toLowerCase();
  if (unit === 'd') return num * 24 * 60 * 60 * 1000;
  if (unit === 'h') return num * 60 * 60 * 1000;
  if (unit === 'm') return num * 60 * 1000;
  if (unit === 's') return num * 1000;
  if (unit === 'y') return num * 365 * 24 * 60 * 60 * 1000;
  return num;
}

function msToDate(ms) {
  if (ms <= 0) return '0d 0h 0m 0s';
  const days    = Math.floor(ms / (24 * 60 * 60 * 1000));
  const daysMs  = ms % (24 * 60 * 60 * 1000);
  const hours   = Math.floor(daysMs / (60 * 60 * 1000));
  const hoursMs = ms % (60 * 60 * 1000);
  const mins    = Math.floor(hoursMs / (60 * 1000));
  const minsMs  = ms % (60 * 1000);
  const secs    = Math.floor(minsMs / 1000);
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

function getExpiredText(expired) {
  if (expired === 'PERMANENT') return '♾️ PERMANENT';
  const sisa = expired - Date.now();
  if (sisa <= 0) return '⚠️ SUDAH EXPIRED';
  return msToDate(sisa);
}

function toDateStr(expired) {
  if (expired === 'PERMANENT') return '♾️ Tidak ada batas';
  return new Date(expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

function isUrl(str) {
  return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/.test(str);
}

// ── addSewaGroup: tambah/perbarui sewa biasa ───────────────────────────────
function addSewaGroup(id, waktu) {
  let sewa    = global.sewa ? [...global.sewa] : loadSewa();
  const expired = (waktu === 'PERMANENT') ? 'PERMANENT' : (Date.now() + toMs(waktu));
  const pos   = sewa.findIndex(x => x.id === id);
  if (pos !== -1) {
    sewa[pos].expired = expired;
  } else {
    sewa.push({ id, expired });
  }
  saveSewa(sewa);
  return expired;
}

// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
  command: ['addsewastore', 'delsewastore', 'listsewastore'],
  tags   : ['owner'],
  run    : async (alya, m, ctx) => {
    const { command, text, prefix, Ryuu, replyalya, replytolak, isGroup, groupName } = ctx;

    if (!Ryuu) return replytolak('❌ Fitur ini khusus *Owner* bot!');

    const sub = command.toLowerCase();

    // ════════════════════════════════════════════════════════════════
    // .addsewastore [id_grup | link_grup | kosong=grup ini] [durasi?]
    // Format baru: .addsewastore <link/id> <durasi>
    //              → join grup + mark sewastore + set sewa duration
    // ════════════════════════════════════════════════════════════════
    if (sub === 'addsewastore') {
      const parts  = (text || '').trim().split(/\s+/);
      const arg0   = parts[0] || '';   // link / groupId / kosong
      const arg1   = parts[1] || '';   // durasi (opsional)

      // ── Case 1: Ada link WhatsApp (join grup dulu) ────────────────
      if (arg0 && isUrl(arg0) && arg0.includes('chat.whatsapp.com/')) {
        const waktu = arg1 || '30d';

        // Validasi durasi
        if (waktu !== 'PERMANENT') {
          const durNum = parseInt(waktu);
          if (isNaN(durNum) || durNum <= 0) {
            return replyalya(
              `❌ *Durasi tidak valid!* (\`${waktu}\`)\n\n` +
              `Contoh: \`7d\` \`1bulan\` \`30d\` \`PERMANENT\``
            );
          }
        }

        let inviteCode;
        try {
          inviteCode = arg0.split('chat.whatsapp.com/')[1].split('?')[0].trim();
        } catch {
          return replyalya('❌ Gagal membaca kode undangan dari link.');
        }

        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // Ambil info grup
        let infoGrup;
        try {
          infoGrup = await alya.groupGetInviteInfo(inviteCode);
        } catch (e) {
          await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return replyalya(
            `❌ *Gagal mendapatkan info grup!*\n\n` +
            `Kemungkinan link sudah di-reset atau kadaluwarsa.\n\n` +
            `Error: \`${e.message}\``
          );
        }

        const targetId   = infoGrup.id;
        const targetName = infoGrup.subject || targetId;

        // Tambah ke sewastore
        const db = loadSewaStore();
        if (!db.includes(targetId)) {
          db.push(targetId);
          saveSewaStore(db);
        }

        // Tambah ke sewa biasa (agar durasi aktif)
        const expired = addSewaGroup(targetId, waktu);

        // Join grup
        let joinStatus = '';
        try {
          await alya.groupAcceptInvite(inviteCode);
          joinStatus = '✅ Bot berhasil masuk ke dalam grup';
        } catch (joinErr) {
          if (joinErr.message?.includes('already') || joinErr.output?.statusCode === 409) {
            joinStatus = 'ℹ️ Bot sudah berada di dalam grup';
          } else {
            joinStatus = '⏳ Menunggu persetujuan admin untuk masuk grup';
          }
        }

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        return replyalya(
          `╭━━━〔 ✅ *SEWA STORE AKTIF* 〕━━━⬣\n` +
          `┃\n` +
          `┃ 🏪 Nama   : *${targetName}*\n` +
          `┃ 🆔 ID     : \`${targetId}\`\n` +
          `┃\n` +
          `┃ ⏳ Durasi : *${waktu}*\n` +
          `┃ 📅 Expired: *${getExpiredText(expired)}*\n` +
          `┃ 🗓️ Tgl     : ${toDateStr(expired)}\n` +
          `┃\n` +
          `┃ 🤖 ${joinStatus}\n` +
          `┃\n` +
          `┃ ✅ *Status sewa: AKTIF & BERJALAN*\n` +
          `┃ 🏪 Mode: *Store Only*\n` +
          `┃\n` +
          `┃ ✅ Yang aktif:\n` +
          `┃   • Menu store & list produk\n` +
          `┃   • Manajemen grup (kick, add, dll)\n` +
          `┃   • Command owner & admin\n` +
          `┃\n` +
          `┃ ❌ Yang dinonaktifkan:\n` +
          `┃   • Game & RPG, AI Chat\n` +
          `┃   • Downloader, Fun commands\n` +
          `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      // ── Case 2: Pakai ID grup atau kosong (grup saat ini) ─────────
      let targetId   = null;
      let targetName = '(tidak diketahui)';

      if (!arg0) {
        if (!isGroup) {
          return replyalya(
            `╭─「 🏪 *SEWA STORE* 」\n│\n` +
            `│ *Cara pakai:*\n` +
            `│\n` +
            `│ *1. Dari private (dengan link):*\n` +
            `│ ${prefix}addsewastore <link_gc> <durasi>\n` +
            `│ Contoh: ${prefix}addsewastore https://chat.whatsapp.com/XXX 30d\n` +
            `│\n` +
            `│ *2. Di dalam grup (grup ini):*\n` +
            `│ ${prefix}addsewastore\n` +
            `│\n` +
            `│ *3. Dengan ID grup:*\n` +
            `│ ${prefix}addsewastore 628xxx-xxx@g.us\n` +
            `╰──────────────────`
          );
        }
        targetId   = m.chat;
        targetName = groupName || m.chat;
      } else {
        targetId = arg0.includes('@g.us') ? arg0.trim() : arg0.trim() + '@g.us';
        try {
          const meta = await alya.groupMetadata(targetId);
          targetName = meta.subject;
        } catch { targetName = targetId; }
      }

      const db = loadSewaStore();
      if (db.includes(targetId)) {
        // Sudah terdaftar - tampilkan status sewa existing
        const sewa  = global.sewa ? global.sewa : loadSewa();
        const entry = sewa.find(x => x.id === targetId);
        const statusSewa = entry
          ? `✅ Sewa aktif — Expired: *${getExpiredText(entry.expired)}*`
          : '⚠️ Sewa biasa belum terdaftar';
        return replyalya(
          `⚠️ Grup *${targetName}* sudah terdaftar sebagai *Sewa Store*!\n\n` +
          `📊 ${statusSewa}\n\n` +
          `💡 Untuk update durasi, gunakan format:\n` +
          `\`.addsewa <link> <durasi>\``
        );
      }

      db.push(targetId);
      saveSewaStore(db);

      // Cek apakah ada sewa aktif
      const sewa  = global.sewa ? global.sewa : loadSewa();
      const entry = sewa.find(x => x.id === targetId);
      const statusSewa = entry
        ? `✅ Sewa aktif — Expired: *${getExpiredText(entry.expired)}*`
        : `⚠️ Belum ada sewa aktif. Gunakan \`.addsewa <link> <durasi>\` untuk aktifkan sewa.`;

      return replyalya(
        `╭─「 ✅ *SEWA STORE AKTIF* 」\n│\n` +
        `│ 🏪 Grup: *${targetName}*\n` +
        `│ 🆔 ID: \`${targetId}\`\n│\n` +
        `│ 📊 ${statusSewa}\n│\n` +
        `│ Mode: *Store Only*\n│\n` +
        `│ ✅ Yang aktif:\n` +
        `│   • Menu store & list produk\n` +
        `│   • Manajemen grup (kick, add, dll)\n` +
        `│   • Command owner & admin\n│\n` +
        `│ ❌ Yang dinonaktifkan:\n` +
        `│   • Game & RPG, AI Chat\n` +
        `│   • Downloader, Fun commands\n` +
        `╰──────────────────`
      );
    }

    // ════════════════════════════════════════════════════════════════
    // .delsewastore [id_grup / kosong=grup ini]
    // ════════════════════════════════════════════════════════════════
    if (sub === 'delsewastore') {
      let targetId   = null;
      let targetName = '(tidak diketahui)';

      if (!text) {
        if (!isGroup) return replyalya('Gunakan di dalam grup atau sertakan ID grup!');
        targetId   = m.chat;
        targetName = groupName || m.chat;
      } else {
        targetId   = text.trim().includes('@g.us') ? text.trim() : text.trim() + '@g.us';
        targetName = targetId;
      }

      let db = loadSewaStore();
      if (!db.includes(targetId)) {
        return replyalya(`⚠️ Grup *${targetName}* tidak ada di daftar Sewa Store.`);
      }

      db = db.filter(x => x !== targetId);
      saveSewaStore(db);

      return replyalya(
        `✅ Grup *${targetName}* berhasil dihapus dari Sewa Store.\n\n` +
        `Sekarang grup ini kembali ke mode sewa biasa (semua fitur aktif jika sewa valid).`
      );
    }

    // ════════════════════════════════════════════════════════════════
    // .listsewastore
    // ════════════════════════════════════════════════════════════════
    if (sub === 'listsewastore') {
      const db   = loadSewaStore();
      const sewa = global.sewa ? global.sewa : loadSewa();

      if (!db.length) return replyalya('📋 Belum ada grup yang terdaftar sebagai Sewa Store.');

      let txt =
        `╭━━━〔 🏪 *LIST SEWA STORE* 〕━━━⬣\n┃\n` +
        `┃ Total: *${db.length} grup*\n┃\n`;

      for (let i = 0; i < db.length; i++) {
        let gName = db[i];
        try {
          const meta = await alya.groupMetadata(db[i]);
          gName = meta.subject;
        } catch {}

        const entry        = sewa.find(x => x.id === db[i]);
        const expiredTxt   = entry ? getExpiredText(entry.expired) : '⚠️ Belum ada sewa';

        txt += `┃ ${i + 1}. *${gName}*\n`;
        txt += `┃    \`${db[i]}\`\n`;
        txt += `┃    ⏳ Expired: *${expiredTxt}*\n┃\n`;
      }
      txt += `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

      return replyalya(txt);
    }
  },
};

// Export helper agar bisa di-require dari alya.js
module.exports.isSewaStore  = isSewaStore;
module.exports.loadSewaStore = loadSewaStore;
