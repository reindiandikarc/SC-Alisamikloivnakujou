/*!-======[ Plugin: Luminaris Modules ]======-!
  !- Port modul LuminarisMD ke ekosistem plugin Alisa.
  !- Semua kode modul ada di ./luminaris/modules (tidak dibaca loader Alisa
  !- karena bukan file *.js di root plugins). File ini adalah satu-satunya
  !- "pintu masuk": ia memindai modul, lalu mendaftarkannya lewat ev.on().
  !-
  !- Owner commands:  .lumods  (status)   .lumods skipped   .lumods failed
*/
export const meta = {
  name: 'Luminaris Modules',
  desc: 'Port modul LuminarisMD: converter, downloader, game, rpg, minecraft, leveling, utility',
  version: '1.0.0',
  author: 'Port by Claude',
  category: 'modules',
};

const fs = 'fs'.import();
const path = 'path'.import();
const { pathToFileURL, fileURLToPath } = await 'url'.import();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'luminaris');
const MOD_DIR = path.join(ROOT, 'modules');
const SKIP_DIRS = new Set(['lib', 'data']);
const SKIP_FILES = /^(_|manifest\.js$)/;

/* modul yang sengaja tidak dinyalakan bila bentrok/tidak relevan */
const DISABLED = new Set(
  (globalThis.cfg?.luminaris_disabled || []).map((x) => String(x).toLowerCase())
);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) && dir !== MOD_DIR) continue;
      walk(p, out);
    } else if (e.name.endsWith('.js') && !SKIP_FILES.test(e.name)) out.push(p);
  }
  return out;
}

export default async function on({ cht, ev, Exp, store, ai, is }) {
  globalThis.Data.luminaris ??= {};
  const { registerModule, registry, resetRegistry, runMessageHooks } =
    await import(pathToFileURL(path.join(ROOT, '_runtime', 'adapter.js')).href);
  resetRegistry();
  ev.Exp ??= Exp;
  globalThis.Data.luminarisHooks = { run: runMessageHooks };

  const stamp = Date.now();
  const files = fs.existsSync(MOD_DIR) ? walk(MOD_DIR).sort() : [];
  let ok = 0;
  for (const file of files) {
    const rel = path.relative(MOD_DIR, file);
    const moduleId = rel.split(path.sep)[0];
    if (DISABLED.has(moduleId)) continue;
    try {
      const mod = await import(`${pathToFileURL(file).href}?v=${stamp}`);
      const def = mod.default;
      if (!def || typeof def !== 'object') continue; // file helper/bukan plugin
      registerModule({ def, moduleId, file: rel, ev });
      ok++;
    } catch (e) {
      registry.failed.push({ file: rel, error: String(e?.message || e).split('\n')[0] });
    }
  }
  globalThis.Data.luminaris.stats = { files: files.length, loaded: ok, commands: registry.handlers.length };
  console.log(
    `[luminaris] ${registry.handlers.length} handler terdaftar, ${registry.skipped.length} modul punya command bentrok (dilewati), ${registry.failed.length} gagal load`
  );

  ev.on(
    { cmd: ['lumods', 'luminaris'], listmenu: ['lumods'], tag: 'owner', isOwner: true },
    async ({ args, cht }) => {
      const sub = String(args || '').trim().toLowerCase();
      if (sub === 'skipped') {
        const t = registry.skipped.map((s) => `• ${s.module}: ${s.cmds.join(', ')}`).join('\n');
        return cht.reply(`⏭️ *Command dilewati (sudah ada di core Alisa)*\n\n${t || '-'}`);
      }
      if (sub === 'failed') {
        const t = registry.failed.map((f) => `• ${f.file}\n  ↳ ${f.error}`).join('\n');
        return cht.reply(`⚠️ *Gagal dimuat*\n\n${t || 'Tidak ada 🎉'}`);
      }
      const byMod = {};
      for (const h of registry.handlers) { const m = h.split('/')[0]; byMod[m] = (byMod[m] || 0) + 1; }
      const lines = Object.entries(byMod).map(([m, n]) => `• ${m}: ${n}`).join('\n');
      cht.reply(
        `🧩 *Luminaris Modules*\n\nHandler aktif: ${registry.handlers.length}\nHook jawaban: ${registry.answerHooks.length}\nHook event: ${registry.eventHooks.length}\n\n${lines}\n\nGunakan: .lumods skipped | .lumods failed`
      );
    }
  );
}
