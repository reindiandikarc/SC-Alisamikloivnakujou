'use strict';

module.exports = {
  command: ['fakelobbyff', 'fakeff'],
  tags: ['fake'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, from, pushname,
      reply, replyalya, replytolak, replyprem,
      isPrem, isAly, isAlya, Ryuu
    } = ctx;

    const { createCanvas, loadImage } = require('canvas');
    const axios = require('axios');
    const fs = require('fs');

    const qAlt = m.quoted ? m.quoted : m;
    const mimeAlt = (qAlt.msg || qAlt).mimetype || '';

    if (!text) {
      return replyalya(
        `✨━━━〔 🎮 *Fake Lobby Free Fire* 〕━━━✨\n\n` +
        `📌 *Cara Pakai:*\n` +
        `1. Reply gambar/foto yang ingin dipakai sebagai avatar\n` +
        `2. Ketik: \`${prefix + command} nick|rank\`\n\n` +
        `🏆 *Daftar Rank:*\n` +
        `> bronze | silver | gold | platinum\n` +
        `> diamond | heroic | grandmaster\n\n` +
        `💡 *Contoh:*\n` +
        `\`${prefix + command} Reindiandikarc|diamond\`\n\n` +
        `⚡ Dibuat oleh Alya`
      );
    }

    const parts = text.split('|');
    const nickname = (parts[0] || pushname).trim();
    const rankInput = (parts[1] || 'gold').trim().toLowerCase();

    const rankColors = {
      bronze:      { top: '#cd7f32', bottom: '#8B4513', label: '🥉 BRONZE' },
      silver:      { top: '#C0C0C0', bottom: '#808080', label: '🥈 SILVER' },
      gold:        { top: '#FFD700', bottom: '#B8860B', label: '🥇 GOLD' },
      platinum:    { top: '#00ffcc', bottom: '#007755', label: '💎 PLATINUM' },
      diamond:     { top: '#b9f2ff', bottom: '#00bcd4', label: '💠 DIAMOND' },
      heroic:      { top: '#ff4081', bottom: '#880e4f', label: '⚔️ HEROIC' },
      grandmaster: { top: '#ff6f00', bottom: '#bf360c', label: '👑 GRANDMASTER' },
    };

    const rank = rankColors[rankInput] || rankColors['gold'];

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      const W = 800, H = 1100;
      const canvas = createCanvas(W, H);
      const ctx2 = canvas.getContext('2d');

      const bgUrls = [
        'https://files.catbox.moe/liplnf.jpg',
        'https://i.ibb.co/twtSvQXv/image.jpg',
        'https://i.ibb.co/n80Bc1wV/image.jpg',
      ];
      let bgImg = null;
      for (const url of bgUrls) {
        try {
          const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
          bgImg = await loadImage(Buffer.from(res.data));
          break;
        } catch {}
      }

      if (bgImg) {
        ctx2.drawImage(bgImg, 0, 0, W, H);
        ctx2.fillStyle = 'rgba(0,0,0,0.55)';
        ctx2.fillRect(0, 0, W, H);
      } else {
        const bgGrad = ctx2.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0f0e17');
        bgGrad.addColorStop(0.5, '#1a1028');
        bgGrad.addColorStop(1, '#0d0d1a');
        ctx2.fillStyle = bgGrad;
        ctx2.fillRect(0, 0, W, H);
      }

      const rankGrad = ctx2.createLinearGradient(0, 0, W, 0);
      rankGrad.addColorStop(0, 'rgba(0,0,0,0)');
      rankGrad.addColorStop(0.5, rank.top + '44');
      rankGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx2.fillStyle = rankGrad;
      ctx2.fillRect(0, 0, W, H);

      ctx2.font = 'bold 28px Arial';
      ctx2.fillStyle = 'rgba(255,255,255,0.6)';
      ctx2.textAlign = 'center';
      ctx2.fillText('FREE FIRE  ·  LOBBY', W / 2, 55);

      for (let i = 0; i < 3; i++) {
        ctx2.beginPath();
        ctx2.arc(W / 2, 55, 300 - i * 8, 0, Math.PI * 2);
        ctx2.strokeStyle = `rgba(255,255,255,${0.03 + i * 0.01})`;
        ctx2.lineWidth = 1.5;
        ctx2.stroke();
      }

      const avatarR = 160;
      const avatarCX = W / 2;
      const avatarCY = 280;

      const outerGrad = ctx2.createRadialGradient(avatarCX, avatarCY, avatarR - 10, avatarCX, avatarCY, avatarR + 30);
      outerGrad.addColorStop(0, rank.top + 'aa');
      outerGrad.addColorStop(1, 'transparent');
      ctx2.beginPath();
      ctx2.arc(avatarCX, avatarCY, avatarR + 30, 0, Math.PI * 2);
      ctx2.fillStyle = outerGrad;
      ctx2.fill();

      ctx2.beginPath();
      ctx2.arc(avatarCX, avatarCY, avatarR + 10, 0, Math.PI * 2);
      ctx2.strokeStyle = rank.top;
      ctx2.lineWidth = 4;
      ctx2.stroke();

      let userImg = null;
      if (m.quoted && /image/.test(mimeAlt)) {
        try {
          const buf = await qAlt.download();
          userImg = await loadImage(buf);
        } catch {}
      }

      if (!userImg) {
        try {
          const ppUrl = await alya.profilePictureUrl(sender, 'image');
          const res = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 8000 });
          userImg = await loadImage(Buffer.from(res.data));
        } catch {}
      }

      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx2.clip();

      if (userImg) {
        const { width: iW, height: iH } = userImg;
        const minSide = Math.min(iW, iH);
        ctx2.drawImage(
          userImg,
          (iW - minSide) / 2, (iH - minSide) / 2,
          minSide, minSide,
          avatarCX - avatarR, avatarCY - avatarR,
          avatarR * 2, avatarR * 2
        );
      } else {
        ctx2.fillStyle = '#1a1a2e';
        ctx2.fillRect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
        ctx2.font = 'bold 120px Arial';
        ctx2.fillStyle = '#ffffff';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'middle';
        ctx2.fillText(nickname.charAt(0).toUpperCase(), avatarCX, avatarCY);
        ctx2.textBaseline = 'alphabetic';
      }
      ctx2.restore();

      const nickFontSize = nickname.length > 12 ? Math.max(38, 56 - (nickname.length - 12) * 3) : 56;
      ctx2.font = `bold ${nickFontSize}px Arial`;
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'center';
      ctx2.shadowColor = 'rgba(0,0,0,0.8)';
      ctx2.shadowBlur = 12;
      ctx2.fillText(nickname, W / 2, avatarCY + avatarR + 65);
      ctx2.shadowBlur = 0;

      const rankPillX = W / 2 - 130, rankPillY = avatarCY + avatarR + 85;
      const rankPillW = 260, rankPillH = 50;
      const rpR = 25;
      ctx2.beginPath();
      ctx2.moveTo(rankPillX + rpR, rankPillY);
      ctx2.lineTo(rankPillX + rankPillW - rpR, rankPillY);
      ctx2.quadraticCurveTo(rankPillX + rankPillW, rankPillY, rankPillX + rankPillW, rankPillY + rpR);
      ctx2.lineTo(rankPillX + rankPillW, rankPillY + rankPillH - rpR);
      ctx2.quadraticCurveTo(rankPillX + rankPillW, rankPillY + rankPillH, rankPillX + rankPillW - rpR, rankPillY + rankPillH);
      ctx2.lineTo(rankPillX + rpR, rankPillY + rankPillH);
      ctx2.quadraticCurveTo(rankPillX, rankPillY + rankPillH, rankPillX, rankPillY + rankPillH - rpR);
      ctx2.lineTo(rankPillX, rankPillY + rpR);
      ctx2.quadraticCurveTo(rankPillX, rankPillY, rankPillX + rpR, rankPillY);
      ctx2.closePath();
      const pillGrad = ctx2.createLinearGradient(rankPillX, 0, rankPillX + rankPillW, 0);
      pillGrad.addColorStop(0, rank.bottom);
      pillGrad.addColorStop(1, rank.top);
      ctx2.fillStyle = pillGrad;
      ctx2.fill();

      ctx2.font = 'bold 26px Arial';
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'center';
      ctx2.fillText(rank.label, rankPillX + rankPillW / 2, rankPillY + 33);

      const statsY = avatarCY + avatarR + 175;
      const stats = [
        { label: 'K/D RATIO', value: (Math.random() * 4 + 1).toFixed(2) },
        { label: 'BOOYAH!', value: Math.floor(Math.random() * 500 + 50) },
        { label: 'MATCHES', value: Math.floor(Math.random() * 3000 + 200) },
      ];
      const statW = W / 3;

      stats.forEach((stat, i) => {
        const sx = i * statW + statW / 2;

        if (i > 0) {
          ctx2.beginPath();
          ctx2.moveTo(i * statW, statsY - 20);
          ctx2.lineTo(i * statW, statsY + 60);
          ctx2.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx2.lineWidth = 1;
          ctx2.stroke();
        }

        ctx2.font = 'bold 36px Arial';
        ctx2.fillStyle = rank.top;
        ctx2.textAlign = 'center';
        ctx2.fillText(String(stat.value), sx, statsY + 10);

        ctx2.font = '22px Arial';
        ctx2.fillStyle = 'rgba(255,255,255,0.6)';
        ctx2.fillText(stat.label, sx, statsY + 45);
      });

      const divY = statsY + 80;
      const lineGrad = ctx2.createLinearGradient(80, divY, W - 80, divY);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.5, rank.top + '88');
      lineGrad.addColorStop(1, 'transparent');
      ctx2.fillStyle = lineGrad;
      ctx2.fillRect(80, divY, W - 160, 2);

      const badgeY = divY + 40;
      ctx2.font = 'bold 28px Arial';
      ctx2.fillStyle = 'rgba(255,255,255,0.5)';
      ctx2.textAlign = 'center';
      ctx2.fillText('🎮  GARENA FREE FIRE  🎮', W / 2, badgeY + 30);

      ctx2.font = '22px Arial';
      ctx2.fillStyle = '#333333';
      ctx2.fillText('⚡ Alya Bot', W / 2, H - 40);

      const buffer = canvas.toBuffer('image/png');

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption:
          `✨━━━〔 🎮 *Fake Lobby FF* 〕━━━✨\n\n` +
          `👤 *Nama*: ${nickname}\n` +
          `🏆 *Rank*: ${rank.label}\n\n` +
          `⚡ Dibuat oleh Alya`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[fakelobbyff]', e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal membuat Fake Lobby FF: ' + e.message);
    }
  }
};
