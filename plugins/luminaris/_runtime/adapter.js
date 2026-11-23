/*!-======[ Luminaris → Alisa : adapter ]======-!
  !- Menjembatani kontrak modul Luminaris:
  !-     { name, command[], allow, role, category, handle(ctx), answerHandler(ctx), event[] }
  !- ke sistem Alisa: ev.on({ cmd, isOwner, isAdmin, isGroup, ... }, resolve)
  !-
  !- Aturan penting:
  !-  • Command yang SUDAH dimiliki file core Alisa (helpers/Events/*.js) tidak
  !-    ditimpa — hanya command bebas yang didaftarkan. Daftar bentrok disimpan
  !-    di Data.luminaris.skipped dan bisa dilihat lewat .lumods.
  !-  • role 0 → isOwner, role 5 → isAdmin (+isGroup), allow:'group' → isGroup.
*/
import fs from 'node:fs';
import path from 'node:path';
import { CHAT, jidNum, rememberName } from './core-shim.js';
import { createModuleData } from './store.js';

const EVENT_ALLOW = new Set(['leveling']);
const EXTRA_MENU = new Set(['quiz', 'minecraft', 'leaderboard', 'gitdl', 'capture', 'adventure', 'aq', 'manga']);

export const registry = { handlers: [], answerHooks: [], eventHooks: [], skipped: [], failed: [], modules: [] };

const isCoreFile = (file) => {
  try { return Boolean(file) && fs.existsSync(path.join(globalThis.fol?.[7] || '', file)); } catch { return false; }
};
const isOwnerJid = (sender) =>
  (globalThis.owner || []).some((o) => jidNum(o) === jidNum(sender));
const isPremiumUser = (sender) => {
  const t = globalThis.Data?.users?.[String(sender).split('@')[0]]?.premium?.time;
  return Boolean(t && t >= Date.now());
};

/*!-======[ UI shim ]======-!*/
const ui = {
  react: (sock, chat, key, text) => sock.sendMessage(chat, { react: { text, key } }).catch(() => {}),
  quickReply: (id, label) => ({ id, label }),
  prepareCardImage: async () => null,
  sendViewOnceCard: (sock, o) => sock.sendMessage(o.chat, { text: o.fallbackText || o.text }),
};

/*!-======[ Context builder ]======-!*/
export function buildCtx({ Exp, cht, moduleId, type = 'command', event, payload, text, selection }) {
  const chat = cht.id;
  const sender = cht.sender;
  const sock = Exp;
  const send = (content, opts = {}) => sock.sendMessage(chat, content, { quoted: cht, ...opts });
  const reply = Object.assign((t, o) => send(typeof t === 'string' ? { text: t } : t, o), {
    error: (t) => send({ text: String(t) }),
    success: (t) => send({ text: String(t) }),
    info: (t) => send({ text: String(t) }),
    react: (e) => sock.sendMessage(chat, { react: { text: e, key: cht.key } }).catch(() => {}),
  });
  const rawArgs = typeof cht.args === 'string' ? cht.args : '';
  const prefix = cht.prefix || '.';
  if (cht.pushName) rememberName(sender, cht.pushName);

  return {
    type, event, payload, selection,
    sock, msg: cht, chat, sender,
    senderName: cht.pushName || jidNum(sender),
    args: rawArgs.trim().split(/\s+/).filter(Boolean),
    text: text ?? rawArgs.trim(),
    trigger: cht.cmd, command: cht.cmd,
    prefix, prefixes: [prefix],
    isGroup: String(chat).endsWith('@g.us'),
    isOwner: isOwnerJid(sender),
    isPremium: isPremiumUser(sender),
    moduleData: createModuleData(moduleId),
    db: { write: async (fn) => fn?.(), query: async () => [], User: null },
    helpers: { ui, media: { extractMedia: null }, js: {} },
    reply,
  };
}

/*!-======[ Register satu modul ]======-!*/
export function registerModule({ def, moduleId, file, ev }) {
  const cmds = Array.isArray(def.command) ? def.command.filter(Boolean) : [];
  const hasHandle = typeof def.handle === 'function';
  const label = `${moduleId}/${def.name || file}`;

  /* Modul yang bergantung pada event bus Luminaris (antilink, antispam, welcome, ...)
     sudah punya padanan native di Alisa (helpers/Events/group.js). Hanya modul di
     EVENT_ALLOW yang dijalankan lewat hook messages.upsert; sisanya dilewati
     supaya tidak ada toggle command yang tampak aktif tapi sebenarnya mati. */
  const needsEvents = Array.isArray(def.event) && def.event.length > 0;
  if (needsEvents && !EVENT_ALLOW.has(def.name)) {
    registry.skipped.push({ module: label, cmds: ['(butuh event bus Luminaris — pakai fitur native Alisa)'] });
    return { registered: [], skipped: cmds };
  }
  /* hook non-command (jawaban game, sesi topdf, XP leveling, dst) */
  if (typeof def.answerHandler === 'function') registry.answerHooks.push({ moduleId, def });
  if (needsEvents && def.event.includes('messages.upsert') && hasHandle) {
    registry.eventHooks.push({ moduleId, def });
  }
  if (!cmds.length || !hasHandle) return { registered: [], skipped: [] };

  const D = (globalThis.Data.luminaris ??= {});
  const free = [];
  const skipped = [];
  for (const c of cmds) {
    const existing = globalThis.Data.events?.[c];
    if (existing && isCoreFile(existing.eventFile)) skipped.push(c);
    else free.push(c);
  }
  if (skipped.length) registry.skipped.push({ module: label, cmds: skipped });
  if (!free.length) return { registered: [], skipped };

  const rule = { cmd: free, listmenu: [...new Set([free[0], ...free.filter((c) => EXTRA_MENU.has(c))])], tag: def.category === 'game' ? 'game' : def.category || 'luminaris' };
  if (def.role === 0) rule.isOwner = true;
  if (def.role === 5) { rule.isAdmin = true; rule.isGroup = true; }
  if (def.allow === CHAT.GROUP) rule.isGroup = true;
  if (def.isPremium) rule.premium = true;

  ev.on(rule, async ({ cht }) => {
    const ctx = buildCtx({ Exp: ev.Exp, cht, moduleId });
    if (def.allow === CHAT.PRIVATE && ctx.isGroup) return cht.reply('❗ Command ini hanya bisa dipakai di chat pribadi.');
    try {
      await def.handle(ctx);
    } catch (e) {
      console.error(`[luminaris] ${label} error:`, e);
      await cht.reply(`❌ Terjadi kesalahan di *${free[0]}*: ${e?.message || e}`);
    }
  });
  /* ev.on menandai eventFile dari stack; kita paksa ke luminaris.js agar .delplugin/reload konsisten */
  for (const c of free) if (globalThis.Data.events[c]) globalThis.Data.events[c].eventFile = 'luminaris.js';
  registry.handlers.push(label);
  D.registered = registry.handlers.length;
  return { registered: free, skipped };
}

/*!-======[ Hook pesan non-command (dipanggil dari helpers/interactive.js) ]======-!*/
export async function runMessageHooks({ Exp, cht }) {
  if (!cht || cht.key?.fromMe) return false;
  const isCmd = Boolean(cht.cmd);
  for (const { moduleId, def } of registry.eventHooks) {
    try {
      const ctx = buildCtx({ Exp, cht, moduleId, type: 'event', event: 'messages.upsert',
        payload: { type: 'notify', messages: [cht] } });
      await def.handle(ctx);
    } catch (e) { console.error('[luminaris] event hook:', e?.message); }
  }
  if (isCmd || !cht.msg) return false;
  for (const { moduleId, def } of registry.answerHooks) {
    try {
      const ctx = buildCtx({ Exp, cht, moduleId, type: 'answer', text: cht.msg });
      if ((await def.answerHandler(ctx)) === true) return true;
    } catch (e) { console.error('[luminaris] answerHandler:', e?.message); }
  }
  return false;
}

export function resetRegistry() {
  registry.handlers = []; registry.answerHooks = []; registry.eventHooks = [];
  registry.skipped = []; registry.failed = []; registry.modules = [];
}
