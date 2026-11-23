/*!-======[ Plugin Manager ]======-!
  !- Modul ini mengelola seluruh plugin yang ada di folder `./plugins/`.
  !- Plugin memakai API yang SAMA PERSIS dengan file di `./helpers/Events/`,
  !- jadi tidak ada API baru yang perlu dipelajari:
  !-
  !-   export const meta = {
  !-     name: 'Ping',
  !-     desc: 'Cek apakah bot aktif',
  !-     version: '1.0.0',
  !-     author: 'Owner',
  !-     category: 'tools',
  !-   };
  !-
  !-   export default async function on({ cht, ev, Exp, store, ai, is }) {
  !-     ev.on({ cmd: ['ping'], tag: 'tools' }, async () => {
  !-       cht.reply('Pong! 🏓');
  !-     });
  !-   }
  !-
  !- `meta` bersifat opsional, tapi sangat disarankan supaya .listplugin dan
  !- .getplugin bisa menampilkan informasi yang jelas ke owner.
*/
const fs = 'fs'.import();
const path = 'path'.import();
const os = await 'os'.import();
const crypto = await 'crypto'.import();

const PLUGIN_DIR = fol[10];
const CORE_DIR = fol[7];

function ensureDir() {
  if (!fs.existsSync(PLUGIN_DIR)) fs.mkdirSync(PLUGIN_DIR, { recursive: true });
}

function sanitizeName(raw) {
  let name = String(raw || '').trim();
  name = name.replace(/\.js$/i, '');
  name = name.replace(/[^a-zA-Z0-9_-]/g, '');
  return name;
}

function extractBlock(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(openBraceIdx, i + 1);
    }
  }
  return null;
}

function parseMeta(src) {
  const head = src.match(/export\s+const\s+meta\s*=\s*/);
  if (!head) return null;
  const braceIdx = src.indexOf('{', head.index + head[0].length);
  if (braceIdx === -1) return null;
  const block = extractBlock(src, braceIdx);
  if (!block) return null;
  try {
    return new Function(`return (${block});`)();
  } catch (_) {
    return null;
  }
}

function parseCommands(src) {
  const cmds = new Set();
  const re = /cmd\s*:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src))) {
    m[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"`]|['"`]$/g, ''))
      .filter(Boolean)
      .forEach((c) => cmds.add(c));
  }
  return [...cmds];
}

function readPluginRaw(file) {
  const fpath = path.join(PLUGIN_DIR, file);
  if (!fs.existsSync(fpath)) return null;
  const src = fs.readFileSync(fpath, 'utf8');
  const stat = fs.statSync(fpath);
  return {
    file,
    path: fpath,
    size: stat.size,
    mtime: stat.mtime,
    meta: parseMeta(src),
    cmds: parseCommands(src),
    source: src,
  };
}

function resolveFile(name) {
  ensureDir();
  const files = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith('.js'));
  const target = sanitizeName(name).toLowerCase();
  if (!target) return null;

  let found = files.find((f) => f.toLowerCase() === `${target}.js`);
  if (found) return found;

  for (const f of files) {
    const info = readPluginRaw(f);
    if (
      info?.meta?.name &&
      sanitizeName(info.meta.name).toLowerCase() === target
    ) {
      return f;
    }
  }
  return null;
}

export function listPlugins() {
  ensureDir();
  return fs
    .readdirSync(PLUGIN_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => readPluginRaw(f))
    .filter(Boolean)
    .sort((a, b) => a.file.localeCompare(b.file));
}

export function getPlugin(name) {
  const file = resolveFile(name);
  if (!file) return null;
  return readPluginRaw(file);
}

async function validateCode(code) {
  const tmpFile = path.join(
    os.tmpdir(),
    `plugin-check-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mjs`
  );
  try {
    fs.writeFileSync(tmpFile, code, 'utf8');
    const mod = await import(`file://${tmpFile}?u=${Date.now()}`);
    if (typeof mod.default !== 'function') {
      return {
        ok: false,
        error:
          'Plugin wajib memiliki `export default async function on({ ... }) { ... }`.',
      };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch (_) {}
  }
}

export async function addPlugin({ name, code, overwrite = false }) {
  ensureDir();
  const cleanName = sanitizeName(name);
  if (!cleanName) return { ok: false, error: 'Nama plugin tidak valid.' };
  if (!code || !code.trim())
    return { ok: false, error: 'Kode plugin kosong.' };

  const fileName = `${cleanName}.js`;

  if (fs.existsSync(path.join(CORE_DIR, fileName))) {
    return {
      ok: false,
      error: `Nama \`${fileName}\` bentrok dengan file core bawaan. Gunakan nama lain.`,
    };
  }

  const pluginPath = path.join(PLUGIN_DIR, fileName);
  if (fs.existsSync(pluginPath) && !overwrite) {
    return {
      ok: false,
      error: `Plugin \`${fileName}\` sudah ada. Hapus dulu dengan .delplugin atau pakai nama lain.`,
    };
  }

  const check = await validateCode(code);
  if (!check.ok) {
    return { ok: false, error: `Plugin gagal divalidasi:\n${check.error}` };
  }

  fs.writeFileSync(pluginPath, code, 'utf8');
  const info = readPluginRaw(fileName);
  return {
    ok: true,
    file: fileName,
    meta: info?.meta || null,
    cmds: info?.cmds || [],
  };
}

export function delPlugin(name) {
  const file = resolveFile(name);
  if (!file) return { ok: false, error: 'Plugin tidak ditemukan.' };

  const fpath = path.join(PLUGIN_DIR, file);
  try {
    fs.unlinkSync(fpath);
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }

  // Bersihkan cache & command yang sudah terdaftar supaya efeknya langsung
  // terasa tanpa perlu restart proses.
  Data.Events?.delete(file);
  if (Data.events) {
    for (const key of Object.keys(Data.events)) {
      if (Data.events[key]?.eventFile === file) delete Data.events[key];
    }
  }

  return { ok: true, file };
}
