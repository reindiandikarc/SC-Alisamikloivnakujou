import { CHAT, logger, sendError } from '../../../_runtime/core-shim.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'removebg',
  command: ['removebg', 'rmbg', 'nobg'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  isPremium: false,
  category: 'tools',
  description: 'Menghapus background gambar menggunakan AI. Reply gambar atau kirim URL.',

  async handle(ctx) {
    try {
      await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key: ctx.msg.key } });

      const validModes = ['general_v1', 'general_v2', 'logo', 'text', 'anime', 'custom'];
      let mode = 'general_v1';
      let imageUrl = '';

      for (const arg of ctx.args) {
        if (arg.startsWith('http')) {
          imageUrl = arg;
        } else if (validModes.includes(arg.toLowerCase())) {
          mode = arg.toLowerCase();
        }
      }

      const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo;
      let targetMsg = ctx.msg;

      if (quoted?.quotedMessage?.imageMessage) {
        targetMsg = {
          key: {
            remoteJid: ctx.chat,
            fromMe: false,
            id: quoted.stanzaId,
            participant: quoted.participant
          },
          message: quoted.quotedMessage
        };
      }

      let imageBytes, contentType, fileName;

      if (targetMsg.message?.imageMessage) {
        const buffer = await downloadMediaMessage(targetMsg, 'buffer');
        imageBytes = new Uint8Array(buffer);
        contentType = 'image/jpeg';
        fileName = 'input.jpg';
      } else if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
          throw new Error(`Gagal mengunduh gambar: HTTP ${imgRes.status}`);
        }
        const ab = await imgRes.arrayBuffer();
        imageBytes = new Uint8Array(ab);
        contentType = imgRes.headers.get('content-type') || 'image/png';
        try {
          const u = new URL(imageUrl);
          fileName = u.pathname.split('/').filter(Boolean).pop() || 'input.png';
        } catch {
          fileName = 'input.png';
        }
      } else {
        await ctx.sock.sendMessage(ctx.chat, {
          text: `❌ Format salah!\n\n*Cara penggunaan:*\n1. Reply gambar dengan caption: ${ctx.prefix}removebg [mode]\n2. Atau kirim: ${ctx.prefix}removebg [url_gambar] [mode]\n\n*Mode tersedia:* ${validModes.join(', ')}`,
          quoted: ctx.msg
        });
        await ctx.sock.sendMessage(ctx.chat, { react: { text: '❌', key: ctx.msg.key } });
        return;
      }

      if (!imageBytes || imageBytes.length < 100) {
        throw new Error('Gambar terlalu kecil atau tidak valid.');
      }

      const API_BASE = 'https://api.ezremove.ai/api/ez-remove/v3/background-remove';

      function randomSerial() {
        let s = '';
        for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
        return s;
      }

      const serial = randomSerial();
      const baseHeaders = {
        'Product-Serial': serial,
        Origin: 'https://ezremove.ai',
        Referer: 'https://ezremove.ai/'
      };

      const form = new FormData();
      form.append('image_file', new Blob([imageBytes], { type: contentType }), fileName);
      form.append('mode', mode);

      const createRes = await fetch(`${API_BASE}/create-job`, {
        method: 'POST',
        headers: baseHeaders,
        body: form
      });

      const createData = await createRes.json();
      if (createRes.status !== 200 || !createData?.result?.job_id) {
        throw new Error(`Create job gagal: ${JSON.stringify(createData).slice(0, 250)}`);
      }

      const jobId = createData.result.job_id;

      let pollResult = null;
      let lastStatus = null;
      const startedAt = Date.now();
      const MAX_POLL_MS = 40_000;
      let delay = 1000;

      while (Date.now() - startedAt < MAX_POLL_MS) {
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay + 500, 3000);
        
        try {
          const pollRes = await fetch(`${API_BASE}/get-job/${jobId}`, { headers: baseHeaders });
          if (!pollRes.ok) continue;
          
          const pollData = await pollRes.json();
          const status = pollData?.result?.status;
          lastStatus = status;
          
          if (status === 2) {
            pollResult = pollData.result;
            break;
          }
          if (status === 3) {
            throw new Error(`Processing error: ${pollData?.result?.error ?? 'unknown'}`);
          }
        } catch (_) {
        }
      }

      if (!pollResult) {
        throw new Error(`Polling timeout (>40s). lastStatus=${lastStatus}. Server sedang lambat.`);
      }

      const previews = Array.isArray(pollResult.output?.preview) ? pollResult.output.preview : [];
      const maxQuality = Array.isArray(pollResult.output?.max) ? pollResult.output.max : [];
      const resultUrl = maxQuality[0] || previews[0];

      if (!resultUrl) {
        throw new Error('Gagal mendapatkan URL hasil dari server.');
      }

      const finalImgRes = await fetch(resultUrl);
      const finalImgBuffer = await finalImgRes.arrayBuffer();

      await ctx.sock.sendMessage(ctx.chat, {
        image: Buffer.from(finalImgBuffer),
        caption: `✅ Background berhasil dihapus!\nMode: \`${mode}\`\nJob ID: \`${jobId}\``,
        quoted: ctx.msg
      });

      await ctx.sock.sendMessage(ctx.chat, { react: { text: '✅', key: ctx.msg.key } });

    } catch (error) {
      logger.error('removebg error', error);
      await sendError(ctx.sock, ctx.chat, ctx.msg, error, { module: 'utility/removebg', command: 'removebg' });
    }
  }
};