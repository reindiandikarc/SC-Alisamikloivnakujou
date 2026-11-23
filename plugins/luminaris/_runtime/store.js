/*!-======[ moduleData : penyimpanan per-modul ]======-!
  !- API sama seperti Luminaris:
  !-   moduleData.user.get/set/delete(jid, key)
  !-   moduleData.group.get/set/delete(chatJid, key)
  !-   moduleData.getAllByKey('user'|'group', key) -> [{ entityId, value }]
  !- Disimpan sebagai JSON di toolkit/db/luminaris.json (ditulis dengan debounce
  !- + atomic rename, jadi aman dari file korup saat proses mati mendadak).
*/
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = globalThis.fol?.[5] || path.join(process.cwd(), 'toolkit', 'db');
const FILE = path.join(DB_DIR, 'luminaris.json');

let root = {};
try { root = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { root = {}; }

let timer = null;
function flush() {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(root));
    fs.renameSync(tmp, FILE);
  } catch (e) { console.error('[luminaris:store] gagal menyimpan:', e.message); }
}
function schedule() {
  if (timer) return;
  timer = setTimeout(() => { timer = null; flush(); }, 1500);
  timer.unref?.();
}
process.once('beforeExit', () => { if (timer) { clearTimeout(timer); flush(); } });

const bucket = (mod, scope, create = false) => {
  const m = (root[mod] ??= {});
  return create ? (m[scope] ??= {}) : m[scope];
};

function scoped(mod, scope) {
  return {
    async get(id, key) { return bucket(mod, scope)?.[id]?.[key] ?? null; },
    async set(id, key, value) { (bucket(mod, scope, true)[id] ??= {})[key] = value; schedule(); return value; },
    async delete(id, key) {
      const e = bucket(mod, scope)?.[id];
      if (e && key in e) { delete e[key]; schedule(); return true; }
      return false;
    },
  };
}

export function createModuleData(moduleId) {
  return {
    user: scoped(moduleId, 'user'),
    group: scoped(moduleId, 'group'),
    async getAllByKey(scope, key) {
      const b = bucket(moduleId, scope) || {};
      return Object.entries(b)
        .filter(([, v]) => key in v)
        .map(([entityId, v]) => ({ entityId, value: v[key] }));
    },
  };
}
export const flushNow = () => { if (timer) { clearTimeout(timer); timer = null; } flush(); };
