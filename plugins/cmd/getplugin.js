'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['getplugin'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, from, pushname,
      reply, replyalya, replytolak, replyprem,
      Ryuu, isAly, isAlya
    } = ctx;

    if (!Ryuu) return replytolak('❌ Khusus owner saja!');

    if (!text) {
      return replyalya(
        `✨━━━〔 📂 *Get Plugin* 〕━━━✨\n\n` +
        `📌 *Cara Pakai:*\n` +
        `\`${prefix + command} namacommand\`\n\n` +
        `💡 *Contoh:*\n` +
        `\`${prefix + command} play\`\n` +
        `\`${prefix + command} fakengl\`\n\n` +
        `⚡ Dibuat oleh Alya`
      );
    }

    const cmdName = text.trim().toLowerCase().replace(/^\./, '');

    const registryPath = path.join(process.cwd(), 'plugins', 'cmd_registry.json');
    let registry = {};
    try {
      if (global._cmdRegistry) {
        registry = global._cmdRegistry;
      } else {
        registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      }
    } catch {
      return replyalya('❌ Gagal membaca registry plugin.');
    }

    const pluginFile = registry[cmdName];
    if (!pluginFile) {
      const suggestions = Object.keys(registry)
        .filter(k => k.includes(cmdName) || cmdName.includes(k.substring(0, 4)))
        .slice(0, 5);
      let msg = `❌ *Command \`${cmdName}\` tidak ditemukan di registry.*`;
      if (suggestions.length > 0) {
        msg += `\n\n💡 *Mungkin maksudnya:*\n${suggestions.map(s => `> \`.${s}\``).join('\n')}`;
      }
      return replyalya(msg);
    }

    const pluginFullPath = path.join(process.cwd(), pluginFile);

    if (!fs.existsSync(pluginFullPath)) {
      return replyalya(`❌ File plugin ditemukan di registry tapi tidak ada di disk:\n\`${pluginFile}\``);
    }

    let rawCode;
    try {
      rawCode = fs.readFileSync(pluginFullPath, 'utf8');
    } catch (e) {
      return replyalya(`❌ Gagal membaca file plugin: ${e.message}`);
    }

    let cleanCode = rawCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/\s+\/\/[^\n]*/gm, '')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n')
      .trim();

    const allCmds = Object.keys(registry)
      .filter(k => registry[k] === pluginFile)
      .map(k => `.${k}`)
      .join(', ');

    const stats = fs.statSync(pluginFullPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const modified = stats.mtime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    const header =
      `━━━〔 📂 *Plugin Info* 〕━━━\n` +
      `📁 *File*: \`${pluginFile}\`\n` +
      `⚡ *Commands*: ${allCmds}\n` +
      `📏 *Ukuran*: ${sizeKB} KB\n` +
      `🕒 *Modified*: ${modified}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━`;

    await replyalya(header);

    const MAX_CHUNK = 3800;

    if (cleanCode.length <= MAX_CHUNK) {
      await replyalya(`\`\`\`\n${cleanCode}\n\`\`\``);
    } else {
      const chunks = [];
      let remaining = cleanCode;
      while (remaining.length > 0) {
        let chunk = remaining.substring(0, MAX_CHUNK);
        const lastNewline = chunk.lastIndexOf('\n');
        if (lastNewline > MAX_CHUNK * 0.6) {
          chunk = chunk.substring(0, lastNewline);
        }
        chunks.push(chunk);
        remaining = remaining.substring(chunk.length);
      }

      for (let i = 0; i < chunks.length; i++) {
        await alya.sendMessage(m.chat, {
          text: `📄 *Bagian ${i + 1}/${chunks.length}*\n\`\`\`\n${chunks[i]}\n\`\`\``
        }, { quoted: m });
        await new Promise(r => setTimeout(r, 500));
      }
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
};
