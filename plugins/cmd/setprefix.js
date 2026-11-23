// Plugin: setprefix
// Mengatur prefix bot (mendukung multi-prefix sekaligus, mis. . / !)
// Tersimpan persisten di database/setting.json via lib/prefix.js
//
// Commands: setprefix
//
// Sub-aksi:
//   .setprefix              → tampilkan panduan + prefix aktif saat ini
//   .setprefix <p1> <p2>... → TIMPA seluruh daftar prefix dengan yang baru
//   .setprefix add <p>      → tambah satu prefix baru (prefix lama tetap aktif)
//   .setprefix del <p>      → hapus satu prefix dari daftar (minimal 1 harus tersisa)
//   .setprefix reset        → kembalikan ke default (. / !)

'use strict';

const { getPrefixes, setPrefixes, addPrefix, removePrefix, DEFAULT_PREFIXES } = require('../../lib/prefix');

module.exports = {
  command: ['setprefix'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, Ryuu, replyalya, replytolak } = ctx;

    // ── Cek permission owner ──────────────────────────────────────────────
    if (!Ryuu) return replytolak('❌ Fitur ini khusus Owner!');

    const current = getPrefixes();
    const parts = text ? text.trim().split(/\s+/).filter(Boolean) : [];

    // ── Tanpa argumen → tampilkan panduan + status prefix aktif ───────────
    if (parts.length === 0) {
      return replyalya(
        `╭━━━〔 ⚙️ *SET PREFIX* 〕━━━⬣\n` +
        `┃\n` +
        `┃ 💡 Prefix aktif saat ini:\n` +
        `┃ *${current.join('  ')}*\n` +
        `┃\n` +
        `┃ *Cara pakai:*\n` +
        `┃ ${prefix}${command} <p1> <p2> ...  → ganti semua prefix\n` +
        `┃ ${prefix}${command} add <p>        → tambah 1 prefix baru\n` +
        `┃ ${prefix}${command} del <p>        → hapus 1 prefix\n` +
        `┃ ${prefix}${command} reset          → kembalikan ke default\n` +
        `┃\n` +
        `┃ *Contoh:*\n` +
        `┃ ${prefix}${command} . ! /\n` +
        `┃ ${prefix}${command} add #\n` +
        `┃ ${prefix}${command} del !\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    const sub = parts[0].toLowerCase();

    // ── Reset ke default ────────────────────────────────────────────────
    if (sub === 'reset') {
      const result = setPrefixes(DEFAULT_PREFIXES);
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya(
        `✅ *Prefix dikembalikan ke default!*\n\n` +
        `💡 Prefix aktif sekarang: *${result.prefixes.join('  ')}*`
      );
    }

    // ── Tambah satu prefix ──────────────────────────────────────────────
    if (sub === 'add') {
      const newPrefix = parts[1];
      if (!newPrefix) {
        return replyalya(`❌ Sebutkan prefix yang ingin ditambahkan!\nContoh: ${prefix}${command} add #`);
      }
      const result = addPrefix(newPrefix);
      if (!result.ok) {
        if (result.reason === 'EXISTS') {
          return replyalya(`ℹ️ Prefix \`${newPrefix}\` sudah ada di daftar.\n\n💡 Prefix aktif: *${result.prefixes.join('  ')}*`);
        }
        if (result.reason === 'INVALID') {
          return replyalya(`❌ Prefix tidak valid! Prefix tidak boleh kosong atau mengandung spasi.`);
        }
        return replyalya(`❌ Gagal menambah prefix.`);
      }
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya(
        `✅ *Prefix \`${newPrefix}\` ditambahkan!*\n\n` +
        `💡 Prefix aktif sekarang: *${result.prefixes.join('  ')}*`
      );
    }

    // ── Hapus satu prefix ───────────────────────────────────────────────
    if (sub === 'del' || sub === 'delete' || sub === 'remove') {
      const targetPrefix = parts[1];
      if (!targetPrefix) {
        return replyalya(`❌ Sebutkan prefix yang ingin dihapus!\nContoh: ${prefix}${command} del !`);
      }
      const result = removePrefix(targetPrefix);
      if (!result.ok) {
        if (result.reason === 'NOT_FOUND') {
          return replyalya(`❌ Prefix \`${targetPrefix}\` tidak ditemukan di daftar.\n\n💡 Prefix aktif: *${result.prefixes.join('  ')}*`);
        }
        if (result.reason === 'LAST_PREFIX') {
          return replyalya(`❌ Tidak bisa menghapus prefix terakhir! Minimal harus ada 1 prefix aktif.`);
        }
        return replyalya(`❌ Gagal menghapus prefix.`);
      }
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya(
        `✅ *Prefix \`${targetPrefix}\` dihapus!*\n\n` +
        `💡 Prefix aktif sekarang: *${result.prefixes.join('  ')}*`
      );
    }

    // ── Default: timpa semua prefix dengan daftar baru dari argumen ──────
    const result = setPrefixes(parts);
    if (!result.ok) {
      return replyalya(`❌ Gagal mengatur prefix! Pastikan input tidak kosong dan tidak mengandung spasi.`);
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    return replyalya(
      `╭━━━〔 ✅ *PREFIX DIPERBARUI* 〕━━━⬣\n` +
      `┃\n` +
      `┃ 💡 Prefix aktif sekarang:\n` +
      `┃ *${result.prefixes.join('  ')}*\n` +
      `┃\n` +
      `┃ ⚠️ Mulai sekarang gunakan salah satu\n` +
      `┃    prefix di atas untuk semua command.\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
    );
  },
};
