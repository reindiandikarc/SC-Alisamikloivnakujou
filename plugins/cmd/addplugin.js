'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['addplugin'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, from, pushname,
      reply, replyalya, replytolak, replyprem,
      Ryuu, isAly, isAlya
    } = ctx;

    if (!Ryuu) return replytolak('❌ Khusus owner saja!');

    const usage = `✨━━━〔 🔌 *Add Plugin* 〕━━━✨

📌 *Cara Pakai:*
\`${prefix + command} nama_command\`
Lalu tambahkan code plugin di bawah command

💡 *Format:*
\`\`\`
${prefix + command} namacommand
module.exports = {
  command: ['namacommand'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { reply } = ctx;
    reply('Halo dari plugin baru!');
  }
};
\`\`\`

⚡ Dibuat oleh Alya`;

    if (!text) return replyalya(usage);

    const lines = text.split('\n');
    const firstLine = lines[0].trim();
    const codeLines = lines.slice(1);
    const code = codeLines.join('\n').trim();

    if (!code) {
      return replyalya(usage + '\n\n❌ *Code plugin tidak ditemukan!* Tulis nama command di baris pertama, lalu code di baris berikutnya.');
    }

    const pluginName = firstLine.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!pluginName) return replyalya('❌ Nama plugin tidak valid! Gunakan hanya huruf, angka, dan underscore.');

    const pluginFile = `plugins/cmd/${pluginName}.js`;
    const pluginFullPath = path.join(process.cwd(), pluginFile);
    const registryPath = path.join(process.cwd(), 'plugins', 'cmd_registry.json');

    let testedModule;
    try {
      const tmpFile = path.join(process.cwd(), 'plugins', 'cmd', `_tmp_test_${Date.now()}.js`);
      fs.writeFileSync(tmpFile, code, 'utf8');
      try {
        testedModule = require(tmpFile);
        delete require.cache[require.resolve(tmpFile)];
      } catch (e) {
        fs.unlinkSync(tmpFile);
        return replyalya(`❌ *Syntax Error pada code plugin:*\n\n\`\`\`${e.message}\`\`\`\n\nPerbaiki dulu sebelum disimpan.`);
      }
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch (e) {
      return replyalya(`❌ Gagal test plugin: ${e.message}`);
    }

    const pluginCommands = Array.isArray(testedModule?.command)
      ? testedModule.command
      : (typeof testedModule?.command === 'string' ? [testedModule.command] : [pluginName]);

    if (fs.existsSync(pluginFullPath)) {
      const backup = pluginFullPath.replace('.js', `_backup_${Date.now()}.js`);
      fs.copyFileSync(pluginFullPath, backup);
    }

    fs.writeFileSync(pluginFullPath, code, 'utf8');

    let registry = {};
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch {}

    for (const cmd of pluginCommands) {
      registry[cmd] = pluginFile;
    }

    const sorted = {};
    Object.keys(registry).sort().forEach(k => { sorted[k] = registry[k]; });
    fs.writeFileSync(registryPath, JSON.stringify(sorted, null, 2), 'utf8');

    if (global._cmdRegistry) {
      for (const cmd of pluginCommands) {
        global._cmdRegistry[cmd] = pluginFile;
      }
    }

    if (global._cmdPluginCache) {
      delete global._cmdPluginCache[pluginFile];
    }

    try {
      const absPath = path.resolve(process.cwd(), pluginFile);
      if (require.cache[absPath]) {
        delete require.cache[absPath];
      }
      global._cmdPluginCache = global._cmdPluginCache || {};
      global._cmdPluginCache[pluginFile] = require(absPath);
    } catch (e) {
      return replyalya(`⚠️ Plugin disimpan tapi gagal di-load live: ${e.message}\n\nPlugin akan aktif setelah bot restart.`);
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    replyalya(
      `✅━━━〔 🔌 *Plugin Berhasil Ditambahkan* 〕━━━✅\n\n` +
      `📁 *File*: \`${pluginFile}\`\n` +
      `⚡ *Commands*: ${pluginCommands.map(c => `\`.${c}\``).join(', ')}\n` +
      `🔄 *Status*: Live aktif (tanpa restart!)\n\n` +
      `💡 Test sekarang dengan: \`${prefix}${pluginCommands[0]}\``
    );
  }
};
