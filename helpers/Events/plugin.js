/*!-======[ Plugin Ecosystem Commands ]======-!*/
const { listPlugins, getPlugin, addPlugin, delPlugin } = await (
  fol[0] + 'pluginManager.js'
).r();

const usageAdd =
  '*Cara pakai .addplugin:*\n\n' +
  '1️⃣ Reply file .js lalu ketik: `.addplugin namaplugin`\n' +
  '2️⃣ Dari URL: `.addplugin namaplugin https://link-ke-file.js`\n' +
  '3️⃣ Tempel kode langsung:\n`.addplugin namaplugin`\n```export default async function on({ cht, ev }) {\n  ev.on({ cmd: [\'contoh\'] }, async () => {\n    cht.reply(\'Halo!\');\n  });\n}```';

export default async function on({ cht, Exp, ev }) {
  ev.on(
    {
      cmd: ['addplugin'],
      listmenu: ['addplugin'],
      isOwner: true,
      tag: 'owner',
    },
    async () => {
      let raw = (cht.q || '').trim();
      if (!raw) return cht.reply(usageAdd);

      let spaceIdx = raw.search(/\s/);
      let name = spaceIdx === -1 ? raw : raw.slice(0, spaceIdx);
      let rest = spaceIdx === -1 ? '' : raw.slice(spaceIdx + 1).trim();

      let code = null;

      if (cht.quoted?.document) {
        code = (await cht.quoted.download()).toString('utf8');
      } else if (/^https?:\/\/\S+/i.test(rest)) {
        let url = rest.split(/\s+/)[0];
        try {
          let res = await fetch(url);
          if (!res.ok)
            return cht.reply(
              `❌ Gagal mengambil kode dari URL (status ${res.status}).`
            );
          code = await res.text();
        } catch (error) {
          return cht.reply(`❌ Gagal fetch URL:\n${error.message || error}`);
        }
      } else if (rest) {
        code = rest;
      } else {
        return cht.reply(usageAdd);
      }

      let result = await addPlugin({ name, code });
      if (!result.ok) return cht.reply(`❌ Gagal menambahkan plugin:\n${result.error}`);

      await ev.reloadEventHandlers();

      let meta = result.meta || {};
      let metaText =
        `\n*Nama:* ${meta.name || result.file}` +
        (meta.desc ? `\n*Deskripsi:* ${meta.desc}` : '') +
        (meta.version ? `\n*Versi:* ${meta.version}` : '');
      let cmdText = result.cmds?.length
        ? `\n*Command:* ${result.cmds.map((c) => `.${c}`).join(', ')}`
        : '';

      cht.reply(
        `✅ Plugin *${result.file}* berhasil ditambahkan & event sudah di-reload!${metaText}${cmdText}`
      );
    }
  );

  ev.on(
    {
      cmd: ['delplugin', 'removeplugin'],
      listmenu: ['delplugin'],
      isOwner: true,
      tag: 'owner',
      args: 'Masukkan nama plugin yang ingin dihapus.\nContoh: .delplugin ping',
    },
    async ({ args }) => {
      let result = delPlugin(args.trim());
      if (!result.ok) return cht.reply(`❌ ${result.error}`);
      await ev.reloadEventHandlers();
      cht.reply(
        `🗑️ Plugin *${result.file}* berhasil dihapus & event sudah di-reload.`
      );
    }
  );

  ev.on(
    {
      cmd: ['getplugin', 'plugininfo'],
      listmenu: ['getplugin'],
      isOwner: true,
      tag: 'owner',
      args: 'Masukkan nama plugin.\nContoh: .getplugin ping',
    },
    async ({ args }) => {
      let info = getPlugin(args.trim());
      if (!info)
        return cht.reply(
          '❌ Plugin tidak ditemukan. Gunakan .listplugin untuk melihat daftar plugin.'
        );

      let meta = info.meta || {};
      let caption =
        `📦 *${meta.name || info.file}*\n` +
        `*File:* ${info.file}\n` +
        (meta.desc ? `*Deskripsi:* ${meta.desc}\n` : '') +
        (meta.version ? `*Versi:* ${meta.version}\n` : '') +
        (meta.author ? `*Author:* ${meta.author}\n` : '') +
        (info.cmds?.length
          ? `*Command:* ${info.cmds.map((c) => `.${c}`).join(', ')}\n`
          : '') +
        `*Ukuran:* ${(info.size / 1024).toFixed(2)} KB`;

      await Exp.sendMessage(
        cht.id,
        {
          document: Buffer.from(info.source, 'utf8'),
          mimetype: 'application/javascript',
          fileName: info.file,
          caption,
        },
        { quoted: cht }
      );
    }
  );

  ev.on(
    {
      cmd: ['listplugin', 'listplugins', 'plugins'],
      listmenu: ['listplugin'],
      isOwner: true,
      tag: 'owner',
    },
    async () => {
      let list = listPlugins();
      if (!list.length)
        return cht.reply(
          'Belum ada plugin yang terpasang.\nGunakan .addplugin untuk menambahkan plugin baru.'
        );

      let text = `📦 *Daftar Plugin (${list.length})*\n\n`;
      list.forEach((p, i) => {
        let meta = p.meta || {};
        text += `${i + 1}. *${meta.name || p.file}* (${p.file})\n`;
        if (meta.desc) text += `   ${meta.desc}\n`;
        if (p.cmds?.length)
          text += `   Command: ${p.cmds.map((c) => `.${c}`).join(', ')}\n`;
      });

      cht.reply(text.trim());
    }
  );
}
