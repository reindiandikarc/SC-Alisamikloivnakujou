// Plugin: anigame
// Notifier & pencarian game/APK MOD baru dari an1.com
// Commands: anigame

'use strict';

const fs = require('fs');
const path = require('path');
const {
  getGamesList,
  searchGames,
  fetchGameDetail,
  buatCaption
} = require('../../lib/anigame');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');

function loadAnigameConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveAnigameConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

module.exports = {
  command: ['anigame'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, Ryuu, isGroup, replyalya, replytolak } = ctx;

    const sub = (text || '').trim().toLowerCase();

    // ── Panduan ──────────────────────────────────────────────────────────
    if (!sub || sub === 'help') {
      const cfg = loadAnigameConfig();
      const aktif = isGroup ? cfg?.anigame?.groups?.[m.chat]?.enabled === true : null;
      return replyalya(
        `╭─「 🎮 *AN1.COM GAME NOTIF* 」\n│\n` +
        (isGroup ? `│ Status grup ini : ${aktif ? '✅ Aktif' : '❌ Nonaktif'}\n│\n` : '') +
        `│ *🔔 Auto Notif (owner, di grup):*\n` +
        `│ • ${prefix}${command} on — aktifkan notif game baru\n` +
        `│ • ${prefix}${command} off — nonaktifkan\n│\n` +
        `│ *🔍 Cari/Lihat Game (semua user):*\n` +
        `│ • ${prefix}${command} list — daftar game terbaru\n` +
        `│ • ${prefix}${command} <judul> — cari game\n│\n` +
        `│ 💡 Bot otomatis kirim notif tiap beberapa\n` +
        `│    menit saat ada game MOD baru.\n` +
        `│ 🌐 Sumber: an1.com/games/\n` +
        `╰──────────────────────`
      );
    }

    // ── ON/OFF (owner only, di dalam grup) ──────────────────────────────
    if (sub === 'on' || sub === 'off') {
      if (!Ryuu) return replytolak('❌ Hanya owner yang bisa mengatur notif ini.');
      if (!isGroup) return replytolak('❌ Perintah ini hanya untuk dijalankan di dalam grup.');

      const cfg = loadAnigameConfig();
      if (!cfg.anigame) cfg.anigame = { groups: {} };
      if (!cfg.anigame.groups) cfg.anigame.groups = {};

      const enabled = sub === 'on';
      cfg.anigame.groups[m.chat] = { enabled, diubahPada: Date.now() };
      saveAnigameConfig(cfg);

      return replyalya(
        `✅ *Notif game AN1.COM ${enabled ? 'diaktifkan' : 'dinonaktifkan'}* untuk grup ini.`
      );
    }

    // ── LIST: daftar game terbaru ────────────────────────────────────────
    if (sub === 'list') {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      try {
        const games = await getGamesList(1);
        if (!games.length) return replyalya('❌ Tidak ada game ditemukan saat ini.');

        const teks = games.slice(0, 10).map((g, i) =>
          `${i + 1}. *${g.title}*\n   🔗 ${g.url}`
        ).join('\n\n');

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return replyalya(
          `╭─「 🎮 *GAME TERBARU AN1.COM* 」\n│\n${teks}\n│\n` +
          `╰──────────────────────`
        );
      } catch (e) {
        console.error('[anigame:list]', e?.message);
        await alya.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
        return replyalya('❌ Gagal mengambil daftar game. Coba lagi nanti.');
      }
    }

    // ── SEARCH: cari berdasarkan judul ───────────────────────────────────
    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
      const results = await searchGames(text);
      if (!results.length) {
        await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });
        return replyalya(`❌ Game "${text}" tidak ditemukan di AN1.COM.`);
      }

      const top = results[0];
      const detail = await fetchGameDetail(top.url);
      const caption = buatCaption(top, detail);

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      if (detail.image || top.image) {
        await alya.sendMessage(m.chat, {
          image: { url: detail.image || top.image },
          caption
        }, { quoted: m });
      } else {
        await replyalya(caption);
      }

      if (results.length > 1) {
        const lainnya = results.slice(1, 6).map((g, i) => `${i + 2}. ${g.title}`).join('\n');
        await replyalya(`📋 *Hasil lain yang mirip:*\n${lainnya}`);
      }
    } catch (e) {
      console.error('[anigame:search]', e?.message);
      await alya.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
      return replyalya('❌ Gagal mencari game. Coba lagi nanti.');
    }
  }
};
