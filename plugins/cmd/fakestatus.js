'use strict';

module.exports = {
  command: ['fakestatus'],
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

    if (!text || !text.includes('|')) {
      return replyalya(
        `✨━━━〔 📟 *Fake WhatsApp Status* 〕━━━✨\n\n` +
        `📌 *Cara Pakai:*\n` +
        `Ketik: \`${prefix + command} nama|status text\`\n\n` +
        `Atau reply gambar + \`${prefix + command} nama|caption\`\n\n` +
        `💡 *Contoh:*\n` +
        `\`${prefix + command} Reindiandikarc|Lagi nunggu yang ga pernah dateng 😔\`\n\n` +
        `⚡ Dibuat oleh Alya`
      );
    }

    const parts = text.split('|');
    const nama = parts[0].trim();
    const statusText = parts.slice(1).join('|').trim();

    if (!nama || !statusText) {
      return replyalya('❌ Format salah! Gunakan: `nama|status`');
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      const W = 1080, H = 1920;
      const canvas = createCanvas(W, H);
      const ctx2 = canvas.getContext('2d');

      let bgImage = null;
      const qAlt = m.quoted ? m.quoted : null;
      if (qAlt && qAlt.msg && /image/.test(qAlt.msg.mimetype || '')) {
        try {
          const buf = await qAlt.download();
          bgImage = await loadImage(buf);
        } catch {}
      }

      if (bgImage) {
        ctx2.drawImage(bgImage, 0, 0, W, H);
        ctx2.fillStyle = 'rgba(0,0,0,0.45)';
        ctx2.fillRect(0, 0, W, H);
      } else {
        const colors = [
          ['#1a1a2e', '#16213e'],
          ['#0d0d0d', '#1a0a2e'],
          ['#0a1a0a', '#0d2e0d'],
          ['#1a0a0a', '#2e0d0d'],
          ['#0a0a1a', '#0d0d3e'],
        ];
        const scheme = colors[Math.floor(Math.random() * colors.length)];
        const grad = ctx2.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, scheme[0]);
        grad.addColorStop(1, scheme[1]);
        ctx2.fillStyle = grad;
        ctx2.fillRect(0, 0, W, H);
      }

      let ppImg = null;
      try {
        const ppUrl = await alya.profilePictureUrl(sender, 'image');
        if (ppUrl) {
          const ppRes = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 8000 });
          ppImg = await loadImage(Buffer.from(ppRes.data));
        }
      } catch {}

      const avatarX = 80, avatarY = 60, avatarR = 55;
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(avatarX + avatarR, avatarY + avatarR, avatarR, 0, Math.PI * 2);
      ctx2.closePath();
      ctx2.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx2.lineWidth = 4;
      ctx2.stroke();
      if (ppImg) {
        ctx2.clip();
        ctx2.drawImage(ppImg, avatarX, avatarY, avatarR * 2, avatarR * 2);
      } else {
        ctx2.fillStyle = '#7B2FFF';
        ctx2.fill();
        ctx2.font = 'bold 50px Arial';
        ctx2.fillStyle = '#fff';
        ctx2.textAlign = 'center';
        ctx2.fillText(nama.charAt(0).toUpperCase(), avatarX + avatarR, avatarY + avatarR + 18);
      }
      ctx2.restore();

      ctx2.font = 'bold 42px Arial';
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'left';
      ctx2.fillText(nama, avatarX + avatarR * 2 + 20, avatarY + avatarR + 5);

      const now = new Date();
      const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      ctx2.font = '28px Arial';
      ctx2.fillStyle = 'rgba(255,255,255,0.7)';
      ctx2.fillText('Hari ini, ' + jam, avatarX + avatarR * 2 + 20, avatarY + avatarR + 45);

      const msgPadX = 80, msgPadY = 280, msgPadW = W - 160;
      ctx2.font = 'bold 58px Arial';
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'left';

      const words = statusText.split(' ');
      let lines = [];
      let currentLine = '';
      const maxW = msgPadW;

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx2.measureText(testLine).width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = 75;
      let curY = msgPadY;
      for (const line of lines) {
        ctx2.fillText(line, msgPadX, curY);
        curY += lineHeight;
      }

      const progY = H - 250;
      ctx2.fillStyle = 'rgba(255,255,255,0.3)';
      ctx2.fillRect(0, progY, W, 3);
      ctx2.fillStyle = '#ffffff';
      ctx2.fillRect(0, progY, W * 0.65, 3);

      const dotR = 8;
      ctx2.beginPath();
      ctx2.arc(W * 0.65, progY + 1, dotR, 0, Math.PI * 2);
      ctx2.fillStyle = '#ffffff';
      ctx2.fill();

      const bottomY = H - 180;
      ctx2.font = '32px Arial';
      ctx2.fillStyle = 'rgba(255,255,255,0.5)';
      ctx2.textAlign = 'right';
      ctx2.fillText('👁 ' + (Math.floor(Math.random() * 90) + 10) + ' viewers', W - 80, bottomY);

      ctx2.textAlign = 'left';
      ctx2.fillText('💬 Balas', 80, bottomY);

      ctx2.font = '24px Arial';
      ctx2.fillStyle = '#444444';
      ctx2.textAlign = 'center';
      ctx2.fillText('⚡ Alya Bot', W / 2, H - 60);

      const buffer = canvas.toBuffer('image/png');

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption:
          `✨━━━〔 📟 *Fake Status WA* 〕━━━✨\n\n` +
          `👤 *Nama*: ${nama}\n` +
          `💬 *Status*: ${statusText}\n\n` +
          `⚡ Dibuat oleh Alya`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[fakestatus]', e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal membuat Fake Status: ' + e.message);
    }
  }
};
