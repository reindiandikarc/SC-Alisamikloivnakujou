// ════════════════════════════════════════════════════════════════
// Plugin  : bcmediapack.js — Alya V20 Broadcast Media Pack
// Author  : reindiandikarc
// Commands: bcdoc, bclocal, bcpoll
// Akses   : Owner only
// Deskripsi:
//   Broadcast dokumen, link preview, dan polling (poll)
//   ke semua grup / kontak / semua chat.
// ════════════════════════════════════════════════════════════════

'use strict';

const fs   = require('fs');

const { getTargetList } = require('../../lib/bctargets');
const { bcSafeDelay }   = require('../../lib/antibanGuard');

function parseTarget(text) {
  if (!text) return { target: 'all', content: '' };
  const flags = ['--gc', '--dm', '--all'];
  let target = 'all';
  let content = text;
  for (const f of flags) {
    if (content.includes(f)) {
      target = f.replace('--', '');
      content = content.replace(f, '').trim();
      break;
    }
  }
  return { target, content };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function doBC(alya, m, store, mode, buildPayload, label, replyalya) {
  const targets = await getTargetList(alya, store, mode);
  if (targets.length === 0) return replyalya(`❌ Tidak ada target untuk mode *${mode}*!`);
  if (global._bcRunning) return replyalya(`⚠️ Broadcast sedang berjalan! Stop dulu.`);

  global._bcRunning = true;
  const sessionId = Date.now();
  global._bcSession = sessionId;

  const modeLabel = mode === 'gc' ? '📢 Semua Grup' : mode === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
  await replyalya(`╭─「 📡 *BROADCAST ${label}* 」\n│\n│ 🎯 Target: ${modeLabel} (${targets.length})\n│ ⏳ Mengirim...\n╰──────────────────`);

  let sukses = 0, gagal = 0;
  for (const chatId of targets) {
    if (!global._bcRunning || global._bcSession !== sessionId) break;
    try {
      const payload = await buildPayload(chatId);
      await alya.sendMessage(chatId, payload);
      sukses++;
    } catch { gagal++; }
    await bcSafeDelay(sukses + gagal); // ✅ anti-ban: jitter delay
  }

  global._bcRunning = false;
  global._bcSession = null;

  return replyalya(
    `╭─「 ✅ *${label} SELESAI* 」\n│\n` +
    `│ 🎯 Target  : ${modeLabel}\n` +
    `│ 📤 Terkirim: *${sukses}*\n` +
    `│ ❌ Gagal   : *${gagal}*\n` +
    `╰──────────────────`
  );
}

module.exports = {
  command: ['bcdoc', 'bcpoll', 'bclinkpreview'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, text, prefix, store,
      isQuotedDocument,
      quoted,
      Ryuu, replyalya, replytolak,
    } = ctx;

    if (!Ryuu) return replytolak(`❌ Hanya untuk Owner!`);
    const pfx = prefix || '.';

    // ════════════════════════════════════════════════════════════
    // .bcdoc [--gc/--dm/--all] <nama file>
    // Broadcast dokumen yang di-reply
    // ════════════════════════════════════════════════════════════
    if (command === 'bcdoc') {
      if (!isQuotedDocument && m.mtype !== 'documentMessage') return replyalya(
        `╭─「 📄 *BROADCAST DOKUMEN* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ Reply dokumen/file dengan:\n` +
        `│ ${pfx}bcdoc [--gc/--dm/--all] <judul>\n│\n` +
        `│ *Contoh:*\n` +
        `│ Reply PDF, lalu: ${pfx}bcdoc --gc Baca panduan ini ya!\n` +
        `╰──────────────────`
      );

      const { target, content: judul } = parseTarget(text || '');
      let tempFile = null;
      try {
        await replyalya(`⏳ Mengunduh dokumen...`);
        const mediaMsg = isQuotedDocument ? (quoted?.msg || quoted) : m;
        tempFile = await alya.downloadAndSaveMediaMessage(mediaMsg, `alya_bc_doc_${Date.now()}`);
        const mime = quoted?.msg?.mimetype || quoted?.mimetype || 'application/octet-stream';
        const fileName = quoted?.msg?.fileName || quoted?.fileName || 'dokumen.pdf';

        await doBC(alya, m, store, target, async () => ({
          document : { url: tempFile },
          mimetype : mime,
          fileName : fileName,
          caption  : judul || '',
        }), 'DOKUMEN', replyalya);
      } catch (e) {
        replyalya(`❌ Gagal broadcast dokumen!\n_${e.message}_`);
      } finally {
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
      }
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bcpoll [--gc/--dm/--all] Pertanyaan | Opsi1 | Opsi2 | ...
    // Broadcast polling ke semua grup/kontak
    // ════════════════════════════════════════════════════════════
    if (command === 'bcpoll') {
      if (!text || !text.includes('|')) return replyalya(
        `╭─「 📊 *BROADCAST POLLING* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ ${pfx}bcpoll [--gc/--dm/--all] Pertanyaan | Opsi1 | Opsi2\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bcpoll --gc Fitur favorit kalian? | Game | Download | AI | Lainnya\n│\n` +
        `│ 💡 Maksimal 12 opsi\n` +
        `╰──────────────────`
      );

      const { target, content } = parseTarget(text);
      const parts     = content.split('|').map(s => s.trim());
      const question  = parts[0];
      const options   = parts.slice(1).filter(Boolean).slice(0, 12);

      if (!question) return replyalya(`❌ Pertanyaan tidak boleh kosong!`);
      if (options.length < 2) return replyalya(`❌ Minimal 2 pilihan jawaban!`);

      await doBC(alya, m, store, target, async () => ({
        poll: {
          name    : question,
          values  : options,
          selectableCount: 1,
        },
      }), 'POLLING', replyalya);
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bclinkpreview [--gc/--dm/--all] <teks> <URL>
    // Broadcast teks dengan link preview
    // ════════════════════════════════════════════════════════════
    if (command === 'bclinkpreview') {
      if (!text) return replyalya(
        `╭─「 🔗 *BROADCAST LINK PREVIEW* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ ${pfx}bclinkpreview [--gc/--dm/--all] <pesan+URL>\n│\n` +
        `│ *Contoh:*\n` +
        `│ ${pfx}bclinkpreview --all Cek update terbaru! https://example.com\n` +
        `╰──────────────────`
      );

      const { target, content } = parseTarget(text);
      await doBC(alya, m, store, target, async () => ({
        text             : content,
        linkPreview      : true,
        detectLinks      : true,
      }), 'LINK PREVIEW', replyalya);
      return;
    }
  },
};
