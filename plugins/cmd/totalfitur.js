// Plugin: totalfitur
// Alya V19 — Tampilkan total & breakdown semua fitur bot
// Commands: totalfitur, cekfitur

'use strict';

const fs   = require('fs');
const path = require('path');

module.exports = {
  command: ['totalfitur', 'cekfitur'],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const {
      prefix, pushname, reply, replyalya, alyaFitur, runtime
    } = ctx;

    await alya.sendMessage(m.chat, { react: { text: '📊', key: m.key } });

    // ── Hitung dari cmd_registry.json (paling akurat) ───────────────────────
    let totalRegistry  = 0;
    let totalUnik      = 0;
    let totalFiles     = 0;
    const catBreakdown = {};

    try {
      const registryPath = path.join(__dirname, '../cmd_registry.json');
      const regData      = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      totalRegistry      = Object.keys(regData).length;
    } catch { totalRegistry = typeof alyaFitur === 'function' ? alyaFitur() : 1583; }

    // ── Scan folder plugins/cmd untuk breakdown per kategori ─────────────────
    try {
      const cmdDir = path.join(__dirname);
      const files  = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'));
      totalFiles   = files.length;

      const allCmds = new Set();
      for (const fname of files) {
        try {
          const src      = fs.readFileSync(path.join(cmdDir, fname), 'utf8');
          const tagM     = src.match(/tags:\s*\[([^\]]*)\]/);
          const tagRaw   = tagM ? tagM[1] : '';
          const tagArr   = tagRaw.match(/['"]([a-zA-Z0-9_-]+)['"]/g)?.map(t => t.replace(/['"]/g, '')) || ['general'];
          const tag      = tagArr[0] || 'general';

          const cmdM     = src.match(/command:\s*\[([^\]]*)\]/);
          if (cmdM) {
            const cmds = cmdM[1].match(/['"]([a-zA-Z0-9_-]+)['"]/g)?.map(c => c.replace(/['"]/g, '')) || [];
            cmds.forEach(c => allCmds.add(c));
            catBreakdown[tag] = (catBreakdown[tag] || 0) + cmds.length;
          }
        } catch { /* skip file error */ }
      }
      totalUnik = allCmds.size;
    } catch { /* fallback ke 0 */ }

    // ── Merge kategori untuk tampilan ────────────────────────────────────────
    const cats = [
      ['🤖 AI & Kecerdasan Buatan', (catBreakdown['ai']  || 0)],
      ['🎮 Game & Tebakan',          (catBreakdown['game'] || 0)],
      ['⛩️ Anime',                    (catBreakdown['anime'] || 0)],
      ['💘 Fun & Romance',            (catBreakdown['fun']  || 0) + (catBreakdown['romance'] || 0)],
      ['👥 Group & Admin',            (catBreakdown['group'] || 0) + (catBreakdown['admin']  || 0)],
      ['📥 Downloader',               (catBreakdown['downloader'] || 0) + (catBreakdown['download'] || 0)],
      ['🎨 Ephoto & Maker',           (catBreakdown['ephoto'] || 0) + (catBreakdown['maker'] || 0)],
      ['🔞 NSFW',                     (catBreakdown['nsfw'] || 0)],
      ['🎴 Sticker',                  (catBreakdown['sticker'] || 0)],
      ['👑 Owner & Panel',            (catBreakdown['owner'] || 0)],
      ['🛠️ Tools & Converter',        (catBreakdown['tools'] || 0) + (catBreakdown['converter'] || 0)],
      ['⚔️ RPG & Ekonomi',            (catBreakdown['rpg']  || 0)],
      ['ℹ️ Info & Umum',              (catBreakdown['info'] || 0) + (catBreakdown['general'] || 0)],
      ['🏪 Store',                    (catBreakdown['store'] || 0) + (catBreakdown['adminstore'] || 0)],
      ['🕌 Islami',                   (catBreakdown['islami'] || 0)],
      ['📨 Menfess',                  (catBreakdown['menfess'] || 0)],
      ['🐛 Bug Tools',                (catBreakdown['bug'] || 0)],
    ].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

    // ── Baris breakdown ──────────────────────────────────────────────────────
    const maxLen   = Math.max(...cats.map(([n]) => n.length));
    const catLines = cats.map(([name, cnt]) => {
      const pad = ' '.repeat(Math.max(0, maxLen - name.length));
      return `┃  ${name}${pad} : *${cnt}*`;
    }).join('\n');

    const uptimeStr = typeof runtime === 'function'
      ? runtime(process.uptime())
      : (() => {
          const s  = Math.floor(process.uptime());
          const d  = Math.floor(s / 86400);
          const h  = Math.floor((s % 86400) / 3600);
          const mi = Math.floor((s % 3600) / 60);
          return `${d}d ${h}h ${mi}m`;
        })();

    const teks =
`╔══════════════════════════════╗
║  📊  *TOTAL FITUR ALYA V19*  ║
╚══════════════════════════════╝

┌──『 📌 *RINGKASAN* 』──⟢
┆ 👤 *Pengguna :* ${pushname}
┆ 📁 *File Plugin :* ${totalFiles} file .js
┆ 🔑 *Command Unik :* ${totalUnik} command
┆ 📋 *Termasuk Alias :* ${totalRegistry} entry
┆ ⏳ *Uptime :* ${uptimeStr}
└────────────────────────────⟢

┏━━━━━『 📂 *BREAKDOWN PER KATEGORI* 』━━━━━⬣
┃
${catLines}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣

╔══════════════════════════════╗
║  ⚡ *GRAND TOTAL: ${totalRegistry} Fitur* ║
╚══════════════════════════════╝

💡 _Ketik *${prefix}allmenu* untuk lihat semua command_
💡 _Ketik *${prefix}menu* untuk navigasi cepat_`;

    try {
      await replyalya(teks);
    } catch {
      await reply(teks);
    }
  }
};
