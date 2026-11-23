// ════════════════════════════════════════════════════════════════
// Plugin  : bcbulk.js — Alya V20 Broadcast Bulk & Template
// Author  : reindiandikarc
// Commands: bctemplate, bcsave, bclist, bcdel, bcsend,
//           bcrotate, bcmulti
// Akses   : Owner only
// Deskripsi:
//   Sistem template broadcast — simpan pesan, broadcast
//   dengan pilihan template via button selector.
// ════════════════════════════════════════════════════════════════

'use strict';

const fs   = require('fs');

// ── DB template ─────────────────────────────────────────────────
const TPL_PATH = './database/bc_templates.json';

function readTpl() {
  try {
    if (!fs.existsSync(TPL_PATH)) return {};
    return JSON.parse(fs.readFileSync(TPL_PATH, 'utf-8')) || {};
  } catch { return {}; }
}
function saveTpl(data) {
  fs.writeFileSync(TPL_PATH, JSON.stringify(data, null, 2));
}

const { getTargetList } = require('../../lib/bctargets');
const { bcSafeDelay }   = require('../../lib/antibanGuard');

// ── Helper: delay (legacy fallback) ─────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
  command: [
    'bctemplate', 'bcsave', 'bclist', 'bcdel', 'bcsend',
    'bcrotate', 'bcmulti',
  ],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, text, args, prefix, store,
      Ryuu, replyalya, replytolak,
    } = ctx;

    if (!Ryuu) return replytolak(`❌ Hanya untuk Owner!`);
    if (global._bcRunning) return replyalya(`⚠️ Broadcast sedang berjalan! Stop dulu dengan *${prefix}bcstop*`);

    const pfx = prefix || '.';
    const tpl = readTpl();

    // ════════════════════════════════════════════════════════════
    // .bcsave <nama> | <isi pesan>
    // Simpan template pesan broadcast
    // ════════════════════════════════════════════════════════════
    if (command === 'bcsave' || command === 'bctemplate') {
      if (!text || !text.includes('|')) return replyalya(
        `╭─「 💾 *SIMPAN TEMPLATE BC* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ ${pfx}bcsave <nama> | <isi pesan>\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bcsave maintenance | Bot lagi maintenance ya guys!\n│ Maaf ganggu waktunya 🙏\n│\n` +
        `│ 💡 Bisa multi-baris, gunakan \\n\n` +
        `╰──────────────────`
      );

      const [nama, ...rest] = text.split('|');
      const isi = rest.join('|').trim();
      if (!nama.trim() || !isi) return replyalya(`❌ Nama dan isi pesan tidak boleh kosong!`);

      const key = nama.trim().toLowerCase().replace(/\s+/g, '_');
      tpl[key] = {
        nama  : nama.trim(),
        isi   : isi.replace(/\\n/g, '\n'),
        dibuat: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      };
      saveTpl(tpl);

      return replyalya(
        `✅ *Template disimpan!*\n\n` +
        `📌 Nama : *${nama.trim()}*\n` +
        `📝 Key  : \`${key}\`\n\n` +
        `Gunakan: *${pfx}bcsend ${key} --gc/--dm/--all*`
      );
    }

    // ════════════════════════════════════════════════════════════
    // .bclist — tampilkan semua template tersimpan
    // ════════════════════════════════════════════════════════════
    if (command === 'bclist') {
      const keys = Object.keys(tpl);
      if (keys.length === 0) return replyalya(
        `ℹ️ Belum ada template tersimpan.\n\nGunakan *${pfx}bcsave nama | isi* untuk menyimpan.`
      );

      let list = `╭─「 📋 *DAFTAR TEMPLATE BC* 」\n│\n`;
      keys.forEach((k, i) => {
        list += `│ ${i+1}. *${tpl[k].nama}* [\`${k}\`]\n`;
        list += `│    ${tpl[k].isi.slice(0, 40)}${tpl[k].isi.length > 40 ? '...' : ''}\n`;
      });
      list += `│\n│ Kirim: *${pfx}bcsend <key> --gc/--dm/--all*\n`;
      list += `╰──────────────────`;

      // Kirim dengan button list jika ada template
      if (keys.length <= 10) {
        try {
          return await alya.sendMessage(m.chat, {
            text: list,
            footer: `© ${global.botname || 'Alya Bot'}`,
            buttons: keys.slice(0, 3).map(k => ({
              buttonId: `${pfx}bcsend ${k} --all`,
              buttonText: { displayText: `📤 ${tpl[k].nama}` },
              type: 1,
            })),
            headerType: 1,
          }, { quoted: m });
        } catch { /* fallback ke teks */ }
      }

      return replyalya(list);
    }

    // ════════════════════════════════════════════════════════════
    // .bcdel <key> — hapus template
    // ════════════════════════════════════════════════════════════
    if (command === 'bcdel') {
      if (!text) return replyalya(`❌ Gunakan: *${pfx}bcdel <key>*\nCek daftar dengan: *${pfx}bclist*`);
      const key = text.trim().toLowerCase();
      if (!tpl[key]) return replyalya(`❌ Template *${key}* tidak ditemukan!\nCek: *${pfx}bclist*`);
      delete tpl[key];
      saveTpl(tpl);
      return replyalya(`✅ Template *${key}* berhasil dihapus.`);
    }

    // ════════════════════════════════════════════════════════════
    // .bcsend <key> [--gc/--dm/--all]
    // Kirim template yang tersimpan ke target
    // ════════════════════════════════════════════════════════════
    if (command === 'bcsend') {
      if (!text) return replyalya(
        `╭─「 📤 *KIRIM TEMPLATE BC* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ ${pfx}bcsend <key> [--gc/--dm/--all]\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bcsend maintenance --gc\n│\n` +
        `│ Cek template: *${pfx}bclist*\n` +
        `╰──────────────────`
      );

      const parts  = text.split(/\s+/);
      const key    = parts[0].toLowerCase();
      const flag   = parts.find(p => p.startsWith('--')) || '--all';
      const mode   = flag.replace('--', '') || 'all';

      if (!tpl[key]) return replyalya(`❌ Template *${key}* tidak ditemukan!\nCek: *${pfx}bclist*`);

      const pesan = tpl[key].isi;
      const targets = await getTargetList(alya, store, mode);

      if (targets.length === 0) return replyalya(`❌ Tidak ada target untuk mode *${mode}*!`);

      global._bcRunning = true;
      const sessionId = Date.now();
      global._bcSession = sessionId;

      const modeLabel = mode === 'gc' ? '📢 Semua Grup' : mode === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
      await replyalya(
        `╭─「 📤 *KIRIM TEMPLATE* 」\n│\n` +
        `│ 📌 Template: *${tpl[key].nama}*\n` +
        `│ 🎯 Target  : ${modeLabel}\n` +
        `│ 📊 Total   : ${targets.length} chat\n│\n` +
        `│ ⏳ Mengirim...\n` +
        `╰──────────────────`
      );

      let sukses = 0, gagal = 0;
      for (const chatId of targets) {
        if (!global._bcRunning || global._bcSession !== sessionId) break;
        try {
          await alya.sendMessage(chatId, { text: pesan });
          sukses++;
        } catch { gagal++; }
        await bcSafeDelay(sukses + gagal); // ✅ anti-ban: jitter delay
      }

      global._bcRunning = false;
      global._bcSession = null;

      return replyalya(
        `╭─「 ✅ *TEMPLATE TERKIRIM* 」\n│\n` +
        `│ 📌 Template: *${tpl[key].nama}*\n` +
        `│ 🎯 Target  : ${modeLabel}\n` +
        `│ 📤 Sukses  : *${sukses}*\n` +
        `│ ❌ Gagal   : *${gagal}*\n` +
        `╰──────────────────`
      );
    }

    // ════════════════════════════════════════════════════════════
    // .bcrotate [--gc/--dm/--all]
    // Rotasi broadcast: kirim template berbeda ke setiap chat
    // (setiap chat dapat template berbeda secara bergiliran)
    // ════════════════════════════════════════════════════════════
    if (command === 'bcrotate') {
      const keys = Object.keys(tpl);
      if (keys.length === 0) return replyalya(`❌ Belum ada template! Buat dulu dengan *${pfx}bcsave*`);

      const flag  = (text || '').includes('--gc') ? 'gc' : (text || '').includes('--dm') ? 'dm' : 'all';
      const targets = await getTargetList(alya, store, flag);
      if (targets.length === 0) return replyalya(`❌ Tidak ada target!`);

      global._bcRunning = true;
      const sessionId = Date.now();
      global._bcSession = sessionId;

      const modeLabel = flag === 'gc' ? '📢 Semua Grup' : flag === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
      await replyalya(
        `╭─「 🔄 *BROADCAST ROTASI* 」\n│\n` +
        `│ 🎯 Target   : ${modeLabel} (${targets.length})\n` +
        `│ 📋 Template : ${keys.length} template\n│\n` +
        `│ ⏳ Setiap chat dapat template berbeda...\n` +
        `╰──────────────────`
      );

      let sukses = 0, gagal = 0, idx = 0;
      for (const chatId of targets) {
        if (!global._bcRunning || global._bcSession !== sessionId) break;
        const key = keys[idx % keys.length];
        idx++;
        try {
          await alya.sendMessage(chatId, { text: tpl[key].isi });
          sukses++;
        } catch { gagal++; }
        await bcSafeDelay(sukses + gagal); // ✅ anti-ban: jitter delay
      }

      global._bcRunning = false;
      global._bcSession = null;

      return replyalya(
        `╭─「 ✅ *ROTASI SELESAI* 」\n│\n` +
        `│ 📤 Terkirim: *${sukses}*\n│ ❌ Gagal   : *${gagal}*\n` +
        `╰──────────────────`
      );
    }

    // ════════════════════════════════════════════════════════════
    // .bcmulti <teks1> || <teks2> || <teks3> [--gc/--dm/--all]
    // Broadcast beberapa pesan sekaligus ke semua target
    // ════════════════════════════════════════════════════════════
    if (command === 'bcmulti') {
      if (!text || !text.includes('||')) return replyalya(
        `╭─「 📩 *BROADCAST MULTI-PESAN* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ ${pfx}bcmulti pesan1 || pesan2 || pesan3 [--gc/--dm/--all]\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bcmulti Halo semua! 👋 || Bot udah online lagi ✅ || Ada promo baru nih 🎉 --gc\n│\n` +
        `│ 💡 Setiap pesan dipisah dengan ||\n` +
        `│ 💡 Semua pesan dikirim ke setiap chat\n` +
        `╰──────────────────`
      );

      const flag    = text.includes('--gc') ? 'gc' : text.includes('--dm') ? 'dm' : 'all';
      const cleaned = text.replace(/--gc|--dm|--all/g, '').trim();
      const messages = cleaned.split('||').map(s => s.trim()).filter(Boolean);

      if (messages.length === 0) return replyalya(`❌ Tidak ada pesan yang valid!`);

      const targets = await getTargetList(alya, store, flag);
      if (targets.length === 0) return replyalya(`❌ Tidak ada target!`);

      global._bcRunning = true;
      const sessionId = Date.now();
      global._bcSession = sessionId;

      const modeLabel = flag === 'gc' ? '📢 Semua Grup' : flag === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
      await replyalya(
        `╭─「 📩 *BROADCAST MULTI* 」\n│\n` +
        `│ 🎯 Target  : ${modeLabel} (${targets.length})\n` +
        `│ 📩 Pesan   : ${messages.length} pesan\n│\n` +
        `│ ⏳ Mengirim semua pesan ke setiap chat...\n` +
        `╰──────────────────`
      );

      let sukses = 0, gagal = 0;
      for (const chatId of targets) {
        if (!global._bcRunning || global._bcSession !== sessionId) break;
        let chatOk = true;
        for (const pesan of messages) {
          try {
            await alya.sendMessage(chatId, { text: pesan });
            // ✅ anti-ban: jeda antar pesan dalam 1 chat (lebih pendek tapi tetap ada jitter)
            await sleep(1000 + Math.floor(Math.random() * 800));
          } catch { chatOk = false; }
        }
        if (chatOk) sukses++; else gagal++;
        // ✅ anti-ban: jeda antar chat dengan bcSafeDelay (jitter besar)
        await bcSafeDelay(sukses + gagal);
      }

      global._bcRunning = false;
      global._bcSession = null;

      return replyalya(
        `╭─「 ✅ *MULTI BROADCAST SELESAI* 」\n│\n` +
        `│ 🎯 Target  : ${modeLabel}\n` +
        `│ 📩 Per chat: ${messages.length} pesan\n` +
        `│ 📤 Sukses  : *${sukses}* chat\n` +
        `│ ❌ Gagal   : *${gagal}* chat\n` +
        `╰──────────────────`
      );
    }
  },
};
