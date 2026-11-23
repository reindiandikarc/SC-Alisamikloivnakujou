// ============================================================
//  Plugin: ssweb.js
//  Fungsi : Screenshot website via Synox Cloud API
//  Author : Alya Bot V20
//  CMD    : .ssweb <url> [width]
//
//  FIX    : m.chat → ctx.from (V20 convention)
//           getBuffer diambil dari global, bukan ctx
// ============================================================

'use strict';

module.exports = {
  command: ['ssweb', 'ss', 'screenshot', 'screenshoot'],
  tags: ['tools'],
  help: ['ssweb <url>'],
  owner: false,
  admin: false,
  group: false,
  private: false,
  premium: false,
  limit: true,
  register: false,

  run: async (alya, m, ctx) => {
    const {
      args,
      reply,
      prefix,
      command,
      from,   // ✅ FIX: pakai ctx.from sebagai tujuan sendMessage
    } = ctx;

    // ── Validasi input ──────────────────────────────────────────
    const inputUrl = args[0];
    if (!inputUrl) {
      return reply(
        `╭━━━[ 📸 SCREENSHOT WEB ]━━━╮\n` +
        `┃\n` +
        `┃  Kirim URL website yang\n` +
        `┃  ingin di-screenshot!\n` +
        `┃\n` +
        `┃  📌 Format:\n` +
        `┃  ${prefix}${command} <url> [lebar]\n` +
        `┃\n` +
        `┃  📌 Contoh:\n` +
        `┃  ${prefix}${command} https://google.com\n` +
        `┃  ${prefix}${command} https://google.com 1920\n` +
        `┃\n` +
        `┃  ℹ️  Lebar default: 1280px\n` +
        `┃     Lebar tersedia: 480–1920\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // ── Validasi format URL ────────────────────────────────────
    let targetUrl = inputUrl;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch {
      return reply(`❌ URL tidak valid!\nContoh yang benar: https://google.com`);
    }

    // ── Validasi lebar (opsional, arg ke-2) ────────────────────
    let width = parseInt(args[1]) || 1280;
    if (width < 480) width = 480;
    if (width > 1920) width = 1920;

    // ── Notifikasi proses ──────────────────────────────────────
    await reply(`⏳ Mengambil screenshot...\n🌐 URL: ${targetUrl}\n📐 Lebar: ${width}px`);

    // ── Fetch screenshot ───────────────────────────────────────
    const apiUrl = `https://api.synoxcloud.biz.id/tools/ssweb?url=${encodeURIComponent(targetUrl)}&width=${width}`;

    let imageBuffer;
    try {
      imageBuffer = await getBuffer(apiUrl); // ✅ global.getBuffer (sekarang benar-benar throw saat gagal — lihat fix di lib/myfunc.js)
    } catch (err) {
      // API balas JSON error (parameter salah/website ditolak) bukan gambar
      if (err?.isJsonResponse) {
        const apiMsg = err.jsonData?.message || err.jsonData?.msg || 'Parameter tidak diterima API.';
        return reply(`❌ Gagal mengambil screenshot!\n\n_Respon API: ${apiMsg}_\n\nCoba URL lain atau cek kembali formatnya.`);
      }
      return reply(
        `❌ Gagal mengambil screenshot!\n\n` +
        `Kemungkinan penyebab:\n` +
        `• Website tidak bisa diakses\n` +
        `• API Synox sedang down\n` +
        `• URL memerlukan login\n\n` +
        `Coba lagi beberapa saat ya~ 🙏`
      );
    }

    // ── Validasi buffer (pastikan bukan error JSON) ────────────
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length < 500) {
      return reply(`❌ Screenshot gagal, API tidak mengembalikan gambar.\nCoba lagi nanti atau cek URLnya.`);
    }

    // ── Kirim hasil screenshot ─────────────────────────────────
    try {
      await alya.sendMessage(
        from,   // ✅ FIX: ctx.from, bukan m.chat
        {
          image: imageBuffer,
          caption:
            `📸 *Screenshot Berhasil!*\n\n` +
            `🌐 *URL:* ${targetUrl}\n` +
            `📐 *Lebar:* ${width}px\n\n` +
            `_Powered by Synox Cloud API_`
        },
        { quoted: m }
      );
    } catch (err) {
      return reply(`❌ Gagal mengirim gambar: ${err.message}`);
    }
  }
};
