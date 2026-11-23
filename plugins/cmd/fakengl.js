'use strict';

module.exports = {
  command: ['fakengl'],
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
        `✨━━━〔 📩 *Fake NGL Message* 〕━━━✨\n\n` +
        `📌 *Cara Pakai:*\n` +
        `Ketik: \`${prefix + command} username|pesan\`\n\n` +
        `💡 *Contoh:*\n` +
        `\`${prefix + command} reindiandikarc|kamu terlalu baik ke semua orang\`\n\n` +
        `⚡ Dibuat oleh Alya`
      );
    }

    const [username, ...msgParts] = text.split('|');
    const message = msgParts.join('|').trim();
    const uname = username.trim();

    if (!uname || !message) {
      return replyalya('❌ Format salah! Gunakan: `username|pesan`');
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      const W = 1080, H = 1920;
      const canvas = createCanvas(W, H);
      const ctx2 = canvas.getContext('2d');

      ctx2.fillStyle = '#0a0a0a';
      ctx2.fillRect(0, 0, W, H);

      const gradient = ctx2.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, '#0f0f0f');
      gradient.addColorStop(0.5, '#141414');
      gradient.addColorStop(1, '#0a0a0a');
      ctx2.fillStyle = gradient;
      ctx2.fillRect(0, 0, W, H);

      for (let i = 0; i < 80; i++) {
        ctx2.beginPath();
        ctx2.arc(
          Math.random() * W,
          Math.random() * H,
          Math.random() * 2.5,
          0, Math.PI * 2
        );
        ctx2.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx2.fill();
      }

      ctx2.fillStyle = '#ffffff';
      ctx2.font = 'bold 52px Arial';
      ctx2.textAlign = 'center';
      ctx2.fillText('ngl.link/' + uname, W / 2, 200);

      ctx2.font = '34px Arial';
      ctx2.fillStyle = '#aaaaaa';
      ctx2.fillText('100% anonymous Q&A', W / 2, 265);

      const cardX = 80, cardY = 330, cardW = W - 160, cardH = 420;
      ctx2.save();
      ctx2.shadowColor = 'rgba(120,0,255,0.25)';
      ctx2.shadowBlur = 40;
      const r = 32;
      ctx2.beginPath();
      ctx2.moveTo(cardX + r, cardY);
      ctx2.lineTo(cardX + cardW - r, cardY);
      ctx2.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx2.lineTo(cardX + cardW, cardY + cardH - r);
      ctx2.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx2.lineTo(cardX + r, cardY + cardH);
      ctx2.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx2.lineTo(cardX, cardY + r);
      ctx2.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx2.closePath();
      ctx2.fillStyle = '#1a1a1a';
      ctx2.fill();
      ctx2.restore();

      ctx2.strokeStyle = 'rgba(150,80,255,0.5)';
      ctx2.lineWidth = 2;
      ctx2.save();
      ctx2.beginPath();
      ctx2.moveTo(cardX + r, cardY);
      ctx2.lineTo(cardX + cardW - r, cardY);
      ctx2.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx2.lineTo(cardX + cardW, cardY + cardH - r);
      ctx2.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx2.lineTo(cardX + r, cardY + cardH);
      ctx2.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx2.lineTo(cardX, cardY + r);
      ctx2.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx2.closePath();
      ctx2.stroke();
      ctx2.restore();

      const sendBtnX = cardX + 20, sendBtnY = cardY + 20, sendBtnW = 100, sendBtnH = 48;
      const r2 = 24;
      ctx2.beginPath();
      ctx2.moveTo(sendBtnX + r2, sendBtnY);
      ctx2.lineTo(sendBtnX + sendBtnW - r2, sendBtnY);
      ctx2.quadraticCurveTo(sendBtnX + sendBtnW, sendBtnY, sendBtnX + sendBtnW, sendBtnY + r2);
      ctx2.lineTo(sendBtnX + sendBtnW, sendBtnY + sendBtnH - r2);
      ctx2.quadraticCurveTo(sendBtnX + sendBtnW, sendBtnY + sendBtnH, sendBtnX + sendBtnW - r2, sendBtnY + sendBtnH);
      ctx2.lineTo(sendBtnX + r2, sendBtnY + sendBtnH);
      ctx2.quadraticCurveTo(sendBtnX, sendBtnY + sendBtnH, sendBtnX, sendBtnY + sendBtnH - r2);
      ctx2.lineTo(sendBtnX, sendBtnY + sendBtnH - r2 + r2);
      ctx2.quadraticCurveTo(sendBtnX, sendBtnY, sendBtnX + r2, sendBtnY);
      ctx2.closePath();
      ctx2.fillStyle = '#7B2FFF';
      ctx2.fill();

      ctx2.font = 'bold 24px Arial';
      ctx2.fillStyle = '#fff';
      ctx2.textAlign = 'center';
      ctx2.fillText('Send', sendBtnX + sendBtnW / 2, sendBtnY + 31);

      const msgText = message;
      const maxW = cardW - 60;
      ctx2.font = '36px Arial';
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'left';

      const words = msgText.split(' ');
      let lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx2.measureText(testLine).width;
        if (testWidth > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = 50;
      const totalTextH = lines.length * lineHeight;
      let textStartY = cardY + (cardH - totalTextH) / 2 + 30;
      if (textStartY < cardY + 90) textStartY = cardY + 90;

      for (const line of lines) {
        ctx2.fillText(line, cardX + 30, textStartY);
        textStartY += lineHeight;
      }

      ctx2.font = '28px Arial';
      ctx2.fillStyle = '#555555';
      ctx2.textAlign = 'left';
      ctx2.fillText('Type a message...', cardX + 30, cardY + cardH - 40);

      const tagY = cardY + cardH + 50;
      ctx2.font = 'bold 30px Arial';
      ctx2.fillStyle = '#aaaaaa';
      ctx2.textAlign = 'center';
      ctx2.fillText('send me anonymous messages 🔮', W / 2, tagY);
      ctx2.fillText('ngl.link/' + uname, W / 2, tagY + 50);

      const poweredY = H - 120;
      ctx2.font = '26px Arial';
      ctx2.fillStyle = '#444444';
      ctx2.textAlign = 'center';
      ctx2.fillText('⚡ Dibuat oleh Alya Bot', W / 2, poweredY);

      const buffer = canvas.toBuffer('image/png');

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption:
          `✨━━━〔 📩 *Fake NGL* 〕━━━✨\n\n` +
          `👤 *Username*: ${uname}\n` +
          `💬 *Pesan*: ${message}\n\n` +
          `⚡ Dibuat oleh Alya`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[fakengl]', e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal membuat Fake NGL: ' + e.message);
    }
  }
};
