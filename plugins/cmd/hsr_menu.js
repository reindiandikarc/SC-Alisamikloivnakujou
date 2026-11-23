// ═══════════════════════════════════════════════════════
//  hsr_menu.js — Honkai: Star Rail | Help Menu
//  Alya V13 Plugin System
//  Commands: hsrmenu, hsrhelp
// ═══════════════════════════════════════════════════════
'use strict';

const path = require('path');
const { getUser, regenTP } = require(path.join(__dirname, 'hsr_db'));

module.exports = {
  command: ['hsrmenu', 'hsrhelp'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { sender, prefix, replyalya, listbut3 } = ctx;
    const user = getUser(sender);

    let msg = `╔══════════════════════════════╗\n`;
    msg += `║  🚂 HONKAI: STAR RAIL BOT    ║\n`;
    msg += `╚══════════════════════════════╝\n\n`;

    if (user) {
      regenTP(user);
      msg += `👤 *${user.trailblazerName || user.displayName}*\n`;
      msg += `🎓 TL Lv.${user.trailblazeLv} | 💎 ${(user.stellarJade||0).toLocaleString('id-ID')} Jade | 🔵 ${(user.credits||0).toLocaleString('id-ID')} Credits\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📌 *Mulai / Profil:*\n`;
    msg += `  !hsrstart     — Daftar sebagai Trailblazer\n`;
    msg += `  !hsrprofile   — Lihat profil & statistik\n\n`;

    msg += `⚔️ *Battle:*\n`;
    msg += `  !hsrbattle    — Mulai pertarungan\n`;
    msg += `  !hsratk       — Basic Attack (+1 SP)\n`;
    msg += `  !hsrskill     — Gunakan Skill (-1 SP)\n`;
    msg += `  !hsrult       — Ultimate (butuh Energy penuh)\n`;
    msg += `  !hsrescape    — Kabur dari pertarungan\n`;
    msg += `  !hsrenemy     — Daftar musuh tersedia\n\n`;

    msg += `🎰 *Gacha / Warp:*\n`;
    msg += `  !hsrwarp      — 1x Character Banner\n`;
    msg += `  !hsrwarp10    — 10x Character Banner\n`;
    msg += `  !hsrwarpstd   — 1x Standard Banner\n`;
    msg += `  !hsrwarp10std — 10x Standard Banner\n`;
    msg += `  !hsrbanner    — Info banner aktif\n`;
    msg += `  !hsrpity      — Cek pity saat ini\n\n`;

    msg += `👥 *Party:*\n`;
    msg += `  !hsrparty     — Lihat party aktif\n`;
    msg += `  !hsrsetparty  — Atur party (max 4)\n`;
    msg += `  !hsrswap      — Ganti 1 slot party\n`;
    msg += `  !hsrheal      — Pulihkan HP party\n`;
    msg += `  !hsrpartystats— Statistik detail party\n\n`;

    msg += `🧑 *Karakter:*\n`;
    msg += `  !hsrchars     — Koleksi karaktermu\n`;
    msg += `  !hsrcharinfo  — Info detail karakter\n`;
    msg += `  !hsrallchars  — Semua karakter di game\n\n`;

    msg += `⬆️ *Upgrade:*\n`;
    msg += `  !hsrupgrade   — Menu upgrade lengkap\n`;
    msg += `  !hsrlevelup   — Level up karakter\n`;
    msg += `  !hsrascend    — Ascension karakter\n`;
    msg += `  !hsrskillup   — Upgrade level skill\n`;
    msg += `  !hsrstatchar  — Stat & progress karakter\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (!user) {
      msg += `⚠️ Belum terdaftar? Ketik *!hsrstart*!`;
    } else {
      msg += `💡 Ketik *!hsrbattle* untuk mulai bertarung!`;
    }

    const sections = [
      {
        title: '🚂 HSR COMMANDS',
        rows: [
          { title: '🚂 HSR START', description: 'Daftar sebagai Trailblazer', id: `!hsrstart` },
          { title: '👤 HSR PROFILE', description: 'Lihat profil & statistik', id: `!hsrprofile` },
          { title: '⚔️ HSR BATTLE', description: 'Mulai pertarungan', id: `!hsrbattle` },
          { title: '🎰 HSR WARP', description: '1x Character Banner pull', id: `!hsrwarp` },
          { title: '👥 HSR PARTY', description: 'Lihat party aktif', id: `!hsrparty` },
          { title: '🎒 HSR INVENTORY', description: 'Lihat inventory & karakter', id: `!hsrinventory` }
        ]
      },
      {
        title: '🌟 NAVIGASI',
        rows: [
          { title: '🏠 MENU UTAMA', description: 'Kembali ke menu utama', id: `${prefix}menu` },
          { title: '🕹️ GAME MENU', description: 'Kumpulan game seru', id: `${prefix}gamemenu` }
        ]
      }
    ];

    const listnye = { title: 'HSR NAVIGASI', sections };
    return listbut3(m.chat, msg, listnye, m);
  }
};
