// Plugin: setlogic
// Commands: setlogic
// Fungsi: Ganti persona/logic AI Alya secara global (hanya Owner)
// Fix V13: require interactive_ai langsung — tidak bergantung pada ctx scope
//
// FIX (2026-07-05): Tambah native button preset (quick_reply) supaya owner
// bisa ganti persona secepat klik, tanpa ketik ulang logic panjang.
// Preset diambil dari machine/interactive_ai.js -> PRESET_LOGICS, jadi kalau
// mau nambah persona baru sebagai tombol, cukup tambahkan di situ (satu
// sumber kebenaran, tidak perlu duplikasi teks logic di sini).

'use strict';

const path = require('path');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

// Require langsung dari machine/interactive_ai agar fungsi pasti tersedia
// tanpa harus di-pass lewat ctx
const {
  getGlobalLogic,
  setGlobalLogic,
  resetGlobalLogic,
  DEFAULT_LOGIC,
  PRESET_LOGICS,
} = require(path.join(process.cwd(), 'machine', 'interactive_ai'));

// ── Kirim menu status + tombol preset (quick_reply) ─────────────────────
async function sendLogicMenu(alya, m, ctx, currentLogic, isDefault, prefix, command) {
  const { replyalya } = ctx;

  const bodyText =
    `🧠 *SET LOGIC AI — Alya V13*\n\n` +
    `Fitur ini untuk mengganti persona/karakter AI Alya secara global.\n\n` +
    `📊 *Status logic saat ini:*\n` +
    `${isDefault ? '✅ Default (Alya Tsundere)' : '✏️ Custom'}\n\n` +
    `📝 *Preview logic aktif:*\n` +
    `_${currentLogic.slice(0, 250)}${currentLogic.length > 250 ? '...' : ''}_\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ Tekan tombol di bawah untuk ganti cepat, atau ketik manual:\n` +
    `\`${prefix}${command} <teks logic baru>\`\n` +
    `\`${prefix}${command} reset\` — kembali ke default`;

  try {
    const buttons = Object.entries(PRESET_LOGICS).map(([key, preset]) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: preset.label,
        id: `${prefix}${command} preset ${key}`,
      }),
    }));

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: { text: bodyText },
              footer: { text: 'Alya V13 · Set Logic' },
              nativeFlowMessage: { buttons },
            }),
          },
        },
      },
      { quoted: m }
    );

    await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
  } catch (err) {
    console.error('[setlogic.js] Gagal kirim native button, fallback teks:', err.message);
    // Fallback plain text kalau native button gagal (device tidak dukung, dsb)
    const presetList = Object.entries(PRESET_LOGICS)
      .map(([key, preset]) => `• \`${prefix}${command} preset ${key}\` — ${preset.label}`)
      .join('\n');
    replyalya(`${bodyText}\n\n📋 *Preset tersedia:*\n${presetList}`);
  }
}

module.exports = {
  command: ['setlogic'],
  tags   : ['owner'],
  run    : async (alya, m, ctx) => {
    const { prefix, command, q, Ryuu, replyalya } = ctx;

    // Hanya owner
    if (!Ryuu) return replyalya('⚠️ Fitur ini hanya untuk *Owner*.');

    const currentLogic = getGlobalLogic();
    const isDefault    = currentLogic === DEFAULT_LOGIC;

    // ── Tampilkan menu + tombol preset jika tidak ada argumen ──
    if (!q || q.trim().length < 3) {
      return sendLogicMenu(alya, m, ctx, currentLogic, isDefault, prefix, command);
    }

    const trimmed = q.trim();

    // ── Reset ke default ──
    if (trimmed.toLowerCase() === 'reset') {
      resetGlobalLogic();
      return replyalya(
        `✅ *Logic AI direset ke default!*\n\n` +
        `📝 *Default logic aktif:*\n` +
        `_${DEFAULT_LOGIC.slice(0, 300)}_\n\n` +
        `Alya kembali ke persona tsundere aslinya~ [_buang muka_]`
      );
    }

    // ── Preset (dipicu tombol quick_reply ATAU diketik manual) ──
    // Format: .setlogic preset <key>
    const presetMatch = trimmed.match(/^preset\s+(\S+)$/i);
    if (presetMatch) {
      const key = presetMatch[1].toLowerCase();
      const preset = PRESET_LOGICS[key];

      if (!preset) {
        const availableKeys = Object.keys(PRESET_LOGICS).join(', ');
        return replyalya(`❌ Preset \`${key}\` tidak ditemukan.\n\nPreset tersedia: ${availableKeys}`);
      }

      setGlobalLogic(preset.logic);
      return replyalya(
        `✅ *Logic AI diganti ke preset ${preset.label}!*\n\n` +
        `🧠 *Preview logic aktif:*\n` +
        `_${preset.logic.slice(0, 300)}${preset.logic.length > 300 ? '...' : ''}_\n\n` +
        `Mulai percakapan berikutnya, AI Interaktif akan berperilaku sesuai persona ini.`
      );
    }

    // ── Set logic custom (ketik manual, bukan preset) ──
    const newLogic = trimmed;
    if (newLogic.length < 10) {
      return replyalya('❌ Logic terlalu pendek! Minimal 10 karakter.');
    }

    setGlobalLogic(newLogic);
    replyalya(
      `✅ *Logic AI berhasil diperbarui!*\n\n` +
      `🧠 *Logic baru aktif:*\n` +
      `_${newLogic.slice(0, 300)}${newLogic.length > 300 ? '...' : ''}_\n\n` +
      `Alya akan berperilaku sesuai logic baru mulai percakapan berikutnya.\n` +
      `Gunakan \`${prefix}${command} reset\` untuk kembali ke default.`
    );
  },
};
