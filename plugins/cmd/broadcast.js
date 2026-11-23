// ════════════════════════════════════════════════════════════════
// Plugin  : broadcast.js — Alya V20 Broadcast Hub
// Author  : reindiandikarc
// Commands: bc, broadcast, bcimg, bcimage, broadcastimg,
//           bcvideo, bcaudio, bcsticker, bcforward,
//           bcgc, bcdm, bcall, bcstatus, bcscheduled,
//           bcstop, bcstatus2, bcinfo
// Akses   : Owner only
// ════════════════════════════════════════════════════════════════

'use strict';

const fs   = require('fs');
const path = require('path');

// ── State broadcast aktif (untuk .bcstop) ───────────────────────
if (!global._bcRunning) global._bcRunning = false;
if (!global._bcSession) global._bcSession = null;

// ── DB terjadwal ────────────────────────────────────────────────
const BC_SCHEDULE_PATH = './database/bc_scheduled.json';
function readScheduled() {
  try {
    if (!fs.existsSync(BC_SCHEDULE_PATH)) return [];
    return JSON.parse(fs.readFileSync(BC_SCHEDULE_PATH, 'utf-8')) || [];
  } catch { return []; }
}
function saveScheduled(data) {
  fs.writeFileSync(BC_SCHEDULE_PATH, JSON.stringify(data, null, 2));
}

// ── Statistik broadcast ─────────────────────────────────────────
const BC_STAT_PATH = './database/bc_stats.json';
function readStats() {
  try {
    if (!fs.existsSync(BC_STAT_PATH)) return { total: 0, sukses: 0, gagal: 0, last: null };
    return JSON.parse(fs.readFileSync(BC_STAT_PATH, 'utf-8'));
  } catch { return { total: 0, sukses: 0, gagal: 0, last: null }; }
}
function saveStats(s) {
  fs.writeFileSync(BC_STAT_PATH, JSON.stringify(s, null, 2));
}

// ── Helper: Ambil list grup & kontak dari store ─────────────────
// (logic dipusatkan di lib/bctargets.js agar konsisten di semua plugin bc*)
const { getTargetList } = require('../../lib/bctargets');
const { bcSafeDelay }   = require('../../lib/antibanGuard');

// ── Helper: delay (legacy fallback) ────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Helper: kirim interactiveMessage button menu ────────────────
async function sendBcMenu(alya, m, prefix, store) {
  try {
    const gcCount = (await getTargetList(alya, store, 'gc')).length;
    const dmCount = (await getTargetList(alya, store, 'dm')).length;
    const msg = {
      text:
        `╭─「 📡 *BROADCAST CENTER* 」\n` +
        `│\n` +
        `│ 👋 Halo Owner! Pilih jenis\n` +
        `│ broadcast yang ingin dikirim.\n` +
        `│\n` +
        `│ 📌 *Pilihan Target:*\n` +
        `│ • Semua Grup  (${gcCount} grup)\n` +
        `│ • Semua DM    (${dmCount} kontak)\n` +
        `│ • Semua Chat  (gabungan)\n` +
        `│\n` +
        `│ 📌 *Pilihan Tipe:*\n` +
        `│ Teks • Gambar • Video\n` +
        `│ Audio • Stiker • Forward\n` +
        `╰──────────────────`,
      footer: `© ${global.botname || 'Alya Bot'} — Broadcast Center`,
      buttons: [
        {
          buttonId: `${prefix}bc`,
          buttonText: { displayText: '📝 Broadcast Teks' },
          type: 1,
        },
        {
          buttonId: `${prefix}bcimg`,
          buttonText: { displayText: '🖼️ Broadcast Gambar' },
          type: 1,
        },
        {
          buttonId: `${prefix}bcvideo`,
          buttonText: { displayText: '🎥 Broadcast Video' },
          type: 1,
        },
      ],
      headerType: 1,
    };
    return await alya.sendMessage(m.chat, msg, { quoted: m });
  } catch {
    // fallback teks
    return null;
  }
}

// ── Helper: kirim nativeFlow list (selector target) ────────────
async function sendTargetSelector(alya, m, prefix, cmdType) {
  try {
    await alya.sendMessage(m.chat, {
      text: `╭─「 🎯 *PILIH TARGET BROADCAST* 」\n│\n│ Kirim ke mana pesan ini?\n│ Pilih salah satu di bawah.\n╰──────────────────`,
      footer: `© ${global.botname || 'Alya Bot'}`,
      buttons: [
        {
          buttonId: `${prefix}${cmdType} --gc`,
          buttonText: { displayText: '📢 Semua Grup Saja' },
          type: 1,
        },
        {
          buttonId: `${prefix}${cmdType} --dm`,
          buttonText: { displayText: '👤 Semua Kontak / DM' },
          type: 1,
        },
        {
          buttonId: `${prefix}${cmdType} --all`,
          buttonText: { displayText: '🌐 Semua (Grup + Kontak)' },
          type: 1,
        },
      ],
      headerType: 1,
    }, { quoted: m });
    return true;
  } catch {
    return false;
  }
}

// ── Helper: parse flag target dari teks ────────────────────────
function parseTarget(text) {
  if (!text) return { target: null, content: '' };
  const flags = ['--gc', '--dm', '--all'];
  let target = null;
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

// ── Core broadcast engine ───────────────────────────────────────
async function runBroadcast(alya, m, store, mode, buildPayload, replyalya) {
  const targets = await getTargetList(alya, store, mode);
  if (targets.length === 0) {
    return await replyalya(`❌ Tidak ada target ditemukan untuk mode *${mode.toUpperCase()}*!`);
  }

  global._bcRunning = true;
  const sessionId = Date.now();
  global._bcSession = sessionId;

  const modeLabel = mode === 'gc' ? '📢 Semua Grup' : mode === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
  await replyalya(
    `╭─「 📡 *BROADCAST DIMULAI* 」\n` +
    `│\n` +
    `│ 🎯 Target : ${modeLabel}\n` +
    `│ 📊 Total  : ${targets.length} chat\n` +
    `│\n` +
    `│ ⏳ Sedang mengirim...\n` +
    `│ Ketik *${(global.prefix || '.') + 'bcstop'}* untuk hentikan.\n` +
    `╰──────────────────`
  );

  let sukses = 0, gagal = 0, skip = 0;
  const gagalList = [];

  for (const chatId of targets) {
    // Cek apakah broadcast di-stop
    if (!global._bcRunning || global._bcSession !== sessionId) {
      skip = targets.length - sukses - gagal;
      break;
    }
    try {
      const payload = await buildPayload(chatId);
      await alya.sendMessage(chatId, payload);
      sukses++;
    } catch (e) {
      gagal++;
      gagalList.push(chatId.split('@')[0]);
    }
    // ✅ Anti-ban: delay dengan jitter agar pola tidak mekanis
    await bcSafeDelay(sukses + gagal);
  }

  // Update statistik
  const stats = readStats();
  stats.total   += targets.length;
  stats.sukses  += sukses;
  stats.gagal   += gagal;
  stats.last     = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  saveStats(stats);

  global._bcRunning = false;
  global._bcSession = null;

  const stopped = skip > 0;
  await replyalya(
    `╭─「 ${stopped ? '🛑 BROADCAST DIHENTIKAN' : '✅ BROADCAST SELESAI'} 」\n` +
    `│\n` +
    `│ 🎯 Target : ${modeLabel}\n` +
    `│ 📤 Terkirim: *${sukses}* chat\n` +
    `│ ❌ Gagal  : *${gagal}* chat\n` +
    (skip > 0 ? `│ ⏭️ Dilewati: *${skip}* chat\n` : '') +
    `│ 📊 Total  : *${targets.length}* chat\n` +
    (gagalList.length > 0 && gagalList.length <= 5
      ? `│\n│ ⚠️ Gagal: ${gagalList.slice(0,5).join(', ')}\n`
      : '') +
    `╰──────────────────`
  );
}

// ════════════════════════════════════════════════════════════════
// MODULE EXPORT
// ════════════════════════════════════════════════════════════════
module.exports = {
  command: [
    'bc', 'broadcast',
    'bcimg', 'bcimage', 'broadcastimg',
    'bcvideo', 'bcaudio', 'bcsticker',
    'bcforward',
    'bcgc', 'bcdm', 'bcall',
    'bcstop', 'bcstatus2', 'bcinfo',
    'bcmenu',
  ],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, text, prefix, store,
      isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedAudio, isQuotedSticker,
      quoted,
      Ryuu, replyalya, replytolak,
    } = ctx;

    // ── Auth ─────────────────────────────────────────────────────
    if (!Ryuu) return replytolak(`❌ Fitur broadcast hanya untuk *Owner* bot!`);

    const pfx = prefix || '.';

    // ════════════════════════════════════════════════════════════
    // .bcmenu — tampilkan menu broadcast interaktif
    // ════════════════════════════════════════════════════════════
    if (command === 'bcmenu') {
      return await sendBcMenu(alya, m, pfx, store);
    }

    // ════════════════════════════════════════════════════════════
    // .bcstop — hentikan broadcast yang sedang berjalan
    // ════════════════════════════════════════════════════════════
    if (command === 'bcstop') {
      if (!global._bcRunning) return replyalya(`ℹ️ Tidak ada broadcast yang sedang berjalan.`);
      global._bcRunning = false;
      return replyalya(`🛑 *Broadcast dihentikan!*\nProses akan berhenti setelah pesan saat ini selesai dikirim.`);
    }

    // ════════════════════════════════════════════════════════════
    // .bcinfo / .bcstatus2 — statistik broadcast
    // ════════════════════════════════════════════════════════════
    if (command === 'bcinfo' || command === 'bcstatus2') {
      const s = readStats();
      const gcCount = (await getTargetList(alya, store, 'gc')).length;
      const dmCount = (await getTargetList(alya, store, 'dm')).length;
      return replyalya(
        `╭─「 📊 *INFO BROADCAST* 」\n` +
        `│\n` +
        `│ 🟢 Status  : ${global._bcRunning ? '*Sedang berjalan*' : 'Idle'}\n` +
        `│\n` +
        `│ ─ 「 Target Tersedia 」\n` +
        `│ 📢 Grup    : ${gcCount} grup\n` +
        `│ 👤 Kontak  : ${dmCount} kontak\n` +
        `│ 🌐 Total   : ${gcCount + dmCount} chat\n` +
        `│\n` +
        `│ ─ 「 Statistik Kumulatif 」\n` +
        `│ 📤 Terkirim: ${s.sukses}\n` +
        `│ ❌ Gagal   : ${s.gagal}\n` +
        `│ 📦 Total   : ${s.total}\n` +
        `│ 🕒 Terakhir: ${s.last || '-'}\n` +
        `│\n` +
        `│ ─ 「 Perintah 」\n` +
        `│ ${pfx}bc [--gc/--dm/--all] <teks>\n` +
        `│ ${pfx}bcimg [--gc/--dm/--all] <cap>\n` +
        `│ ${pfx}bcvideo [--gc/--dm/--all] <cap>\n` +
        `│ ${pfx}bcaudio [--gc/--dm/--all]\n` +
        `│ ${pfx}bcsticker [--gc/--dm/--all]\n` +
        `│ ${pfx}bcforward [--gc/--dm/--all]\n` +
        `│ ${pfx}bcstop\n` +
        `╰──────────────────`
      );
    }

    // ════════════════════════════════════════════════════════════
    // Guard: jangan jalankan 2 broadcast sekaligus
    // ════════════════════════════════════════════════════════════
    if (global._bcRunning) {
      return replyalya(
        `⚠️ *Broadcast sedang berjalan!*\n` +
        `Hentikan dulu dengan *${pfx}bcstop* sebelum mulai yang baru.`
      );
    }

    // ════════════════════════════════════════════════════════════
    // .bcgc, .bcdm, .bcall — shortcut langsung teks ke target fix
    // ════════════════════════════════════════════════════════════
    if (['bcgc', 'bcdm', 'bcall'].includes(command)) {
      const modeMap = { bcgc: 'gc', bcdm: 'dm', bcall: 'all' };
      const mode = modeMap[command];
      if (!text) {
        return replyalya(
          `╭─「 📢 *BROADCAST ${mode.toUpperCase()}* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ ${pfx}${command} <teks pesan>\n│\n` +
          `│ *Keterangan:*\n` +
          `│ ${command === 'bcgc' ? '📢 Kirim ke semua GRUP' : command === 'bcdm' ? '👤 Kirim ke semua KONTAK' : '🌐 Kirim ke SEMUA chat'}\n` +
          `╰──────────────────`
        );
      }
      return runBroadcast(alya, m, store, mode, async () => ({ text }), replyalya);
    }

    // ════════════════════════════════════════════════════════════
    // .bc / .broadcast — broadcast TEKS dengan pilihan target
    // ════════════════════════════════════════════════════════════
    if (['bc', 'broadcast'].includes(command)) {
      if (!text) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bc');
        if (!sent) return replyalya(
          `╭─「 📢 *BROADCAST TEKS* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ ${pfx}bc --gc <teks>    → Semua Grup\n` +
          `│ ${pfx}bc --dm <teks>    → Semua Kontak\n` +
          `│ ${pfx}bc --all <teks>   → Semua Chat\n│\n` +
          `│ *Contoh:*\n` +
          `│ ${pfx}bc --gc Bot lagi maintenance 🙏\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target, content } = parseTarget(text);
      const mode = target || 'all';
      if (!content) return replyalya(`❌ Teks pesan tidak boleh kosong!`);
      return runBroadcast(alya, m, store, mode, async () => ({ text: content }), replyalya);
    }

    // ════════════════════════════════════════════════════════════
    // .bcimg / .bcimage / .broadcastimg — broadcast GAMBAR
    // ════════════════════════════════════════════════════════════
    if (['bcimg', 'bcimage', 'broadcastimg'].includes(command)) {
      const hasImage = isImage || isQuotedImage;
      if (!hasImage) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bcimg');
        if (!sent) return replyalya(
          `╭─「 🖼️ *BROADCAST GAMBAR* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ Kirim/Reply gambar dengan caption:\n` +
          `│ ${pfx}${command} [--gc/--dm/--all] <caption>\n│\n` +
          `│ *Contoh:*\n` +
          `│ Kirim gambar, caption:\n` +
          `│ ${pfx}${command} --gc Selamat malam semua! 🌙\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target, content: caption } = parseTarget(text || '');
      const mode = target || 'all';

      let tempFile = null;
      try {
        await replyalya(`⏳ Mengunduh gambar...`);
        const mediaMsg = isQuotedImage ? (quoted?.msg || quoted) : m;
        tempFile = await alya.downloadAndSaveMediaMessage(mediaMsg, `alya_bc_img_${Date.now()}`);

        await runBroadcast(alya, m, store, mode, async () => ({
          image  : { url: tempFile },
          caption: caption || '',
        }), replyalya);
      } catch (e) {
        replyalya(`❌ Gagal broadcast gambar!\n_Error: ${e.message}_`);
      } finally {
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
      }
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bcvideo — broadcast VIDEO
    // ════════════════════════════════════════════════════════════
    if (command === 'bcvideo') {
      const hasVideo = isVideo || isQuotedVideo;
      if (!hasVideo) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bcvideo');
        if (!sent) return replyalya(
          `╭─「 🎥 *BROADCAST VIDEO* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ Kirim/Reply video dengan caption:\n` +
          `│ ${pfx}${command} [--gc/--dm/--all] <caption>\n│\n` +
          `│ *Contoh:*\n` +
          `│ ${pfx}${command} --all Cek update terbaru! 🎬\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target, content: caption } = parseTarget(text || '');
      const mode = target || 'all';

      let tempFile = null;
      try {
        await replyalya(`⏳ Mengunduh video...`);
        const mediaMsg = isQuotedVideo ? (quoted?.msg || quoted) : m;
        tempFile = await alya.downloadAndSaveMediaMessage(mediaMsg, `alya_bc_vid_${Date.now()}`);

        await runBroadcast(alya, m, store, mode, async () => ({
          video  : { url: tempFile },
          caption: caption || '',
        }), replyalya);
      } catch (e) {
        replyalya(`❌ Gagal broadcast video!\n_Error: ${e.message}_`);
      } finally {
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
      }
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bcaudio — broadcast AUDIO / PTT
    // ════════════════════════════════════════════════════════════
    if (command === 'bcaudio') {
      const hasAudio = isAudio || isQuotedAudio;
      if (!hasAudio) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bcaudio');
        if (!sent) return replyalya(
          `╭─「 🎵 *BROADCAST AUDIO* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ Kirim/Reply audio/voice note dengan:\n` +
          `│ ${pfx}${command} [--gc/--dm/--all]\n│\n` +
          `│ *Contoh:*\n` +
          `│ ${pfx}${command} --gc\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target } = parseTarget(text || '');
      const mode = target || 'all';

      let tempFile = null;
      try {
        await replyalya(`⏳ Mengunduh audio...`);
        const mediaMsg = isQuotedAudio ? (quoted?.msg || quoted) : m;
        tempFile = await alya.downloadAndSaveMediaMessage(mediaMsg, `alya_bc_aud_${Date.now()}`);

        const isPtt = m.mtype === 'audioMessage' && m.message?.audioMessage?.ptt;
        await runBroadcast(alya, m, store, mode, async () => ({
          audio: { url: tempFile },
          mimetype: isPtt ? 'audio/ogg; codecs=opus' : 'audio/mp4',
          ptt: isPtt,
        }), replyalya);
      } catch (e) {
        replyalya(`❌ Gagal broadcast audio!\n_Error: ${e.message}_`);
      } finally {
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
      }
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bcsticker — broadcast STIKER
    // ════════════════════════════════════════════════════════════
    if (command === 'bcsticker') {
      const hasSticker = isSticker || isQuotedSticker;
      if (!hasSticker) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bcsticker');
        if (!sent) return replyalya(
          `╭─「 🎭 *BROADCAST STIKER* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ Kirim/Reply stiker dengan:\n` +
          `│ ${pfx}${command} [--gc/--dm/--all]\n│\n` +
          `│ *Contoh:*\n` +
          `│ ${pfx}${command} --all\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target } = parseTarget(text || '');
      const mode = target || 'all';

      let tempFile = null;
      try {
        await replyalya(`⏳ Mengunduh stiker...`);
        const mediaMsg = isQuotedSticker ? (quoted?.msg || quoted) : m;
        tempFile = await alya.downloadAndSaveMediaMessage(mediaMsg, `alya_bc_stk_${Date.now()}`);

        await runBroadcast(alya, m, store, mode, async () => ({
          sticker: { url: tempFile },
        }), replyalya);
      } catch (e) {
        replyalya(`❌ Gagal broadcast stiker!\n_Error: ${e.message}_`);
      } finally {
        try { if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch {}
      }
      return;
    }

    // ════════════════════════════════════════════════════════════
    // .bcforward — forward pesan yang direply ke semua target
    // ════════════════════════════════════════════════════════════
    if (command === 'bcforward') {
      if (!quoted) {
        const sent = await sendTargetSelector(alya, m, pfx, 'bcforward');
        if (!sent) return replyalya(
          `╭─「 📨 *BROADCAST FORWARD* 」\n│\n` +
          `│ *Cara pakai:*\n` +
          `│ Reply pesan yang ingin di-forward,\n` +
          `│ lalu ketik:\n` +
          `│ ${pfx}${command} [--gc/--dm/--all]\n│\n` +
          `│ *Contoh:*\n` +
          `│ Reply pesan, lalu: ${pfx}${command} --gc\n` +
          `╰──────────────────`
        );
        return;
      }

      const { target } = parseTarget(text || '');
      const mode = target || 'all';

      try {
        const targets = await getTargetList(alya, store, mode);
        if (targets.length === 0) return replyalya(`❌ Tidak ada target!`);

        global._bcRunning = true;
        const sessionId = Date.now();
        global._bcSession = sessionId;

        const modeLabel = mode === 'gc' ? '📢 Semua Grup' : mode === 'dm' ? '👤 Semua Kontak' : '🌐 Semua Chat';
        await replyalya(
          `╭─「 📨 *BROADCAST FORWARD* 」\n│\n` +
          `│ 🎯 Target: ${modeLabel}\n│ 📊 Total : ${targets.length} chat\n│\n` +
          `│ ⏳ Memulai forward...\n` +
          `╰──────────────────`
        );

        let sukses = 0, gagal = 0;
        const fwdMsg = quoted?.message || quoted?.msg;
        const fwdContent = { forward: quoted };

        for (const chatId of targets) {
          if (!global._bcRunning || global._bcSession !== sessionId) break;
          try {
            await alya.sendMessage(chatId, { forward: quoted }, { quoted: null });
            sukses++;
          } catch {
            try {
              // fallback: kirim sebagai teks jika forward gagal
              const txt = quoted?.text || quoted?.caption || '';
              if (txt) await alya.sendMessage(chatId, { text: txt });
              sukses++;
            } catch { gagal++; }
          }
          // ✅ Anti-ban: delay dengan jitter agar pola tidak mekanis
          await bcSafeDelay(sukses + gagal);
        }

        global._bcRunning = false;
        global._bcSession = null;

        await replyalya(
          `╭─「 ✅ *FORWARD SELESAI* 」\n│\n` +
          `│ 🎯 Target  : ${modeLabel}\n` +
          `│ 📤 Terkirim: *${sukses}* chat\n` +
          `│ ❌ Gagal   : *${gagal}* chat\n` +
          `╰──────────────────`
        );
      } catch (e) {
        global._bcRunning = false;
        replyalya(`❌ Gagal broadcast forward!\n_Error: ${e.message}_`);
      }
      return;
    }

    // Fallback — jika command tidak dikenali (tidak mungkin tapi jaga-jaga)
    return sendBcMenu(alya, m, pfx, store);
  },
};
