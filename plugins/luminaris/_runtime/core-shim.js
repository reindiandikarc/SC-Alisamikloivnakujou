/*!-======[ Luminaris → Alisa : pengganti `#core` ]======-!
  !- Modul Luminaris meng-import `#core` (alias ke core.js yang ter-obfuscate).
  !- Di Alisa alias itu diarahkan ke file ini: hanya berisi API yang benar-benar
  !- dipakai modul yang di-port, ditulis ulang di atas infrastruktur Alisa.
*/
import { jidNormalizedUser } from '@whiskeysockets/baileys';

export const CHAT = Object.freeze({ BOTH: 'both', GROUP: 'group', PRIVATE: 'private' });
export const READMORE = String.fromCharCode(8206).repeat(4001);
export const PREVIEW_URL = '';
export const PREVIEW_WIDTH = 1280;
export const PREVIEW_HEIGHT = 720;
export const FONT_STYLES = {};

/*!-======[ Logger ]======-!*/
const mk = (lvl) => (...a) => console[lvl === 'debug' ? 'log' : lvl](`[luminaris:${lvl}]`, ...a);
export const logger = {
  info: mk('info'), warn: mk('warn'), error: mk('error'),
  debug: (...a) => process.env.LUMINARIS_DEBUG && mk('debug')(...a),
  child() { return logger; },
};

/*!-======[ Config (diambil dari konfigurasi Alya) ]======-!*/
export const config = {
  get botName() { return globalThis.botnickname || globalThis.botname || 'Alya'; },
  get ownerJid() { const o = globalThis.owner?.[0]; return o ? (o.includes('@') ? o : `${o}@s.whatsapp.net`) : ''; },
  get ownerBio() { return ''; },
  newsletterJid: '', github: '', storeUrl: '', dbPath: '', info: {}, submenuImages: [], version: '2.2.6-alisa',
};

/*!-======[ JID helpers ]======-!*/
export const jidNum = (j = '') => String(j).split('@')[0].split(':')[0].replace(/\D/g, '');
export const toJid = (x = '') => {
  const s = String(x).trim();
  if (!s) return '';
  if (s.includes('@')) return jidNormalizedUser(s);
  const n = s.replace(/\D/g, '');
  return n ? `${n}@s.whatsapp.net` : '';
};
export const senderJid = (msg) =>
  jidNormalizedUser(msg?.sender || msg?.key?.participant || msg?.key?.remoteJidAlt || msg?.key?.remoteJid || '');

export function getTargetJid(msgOrCtx) {
  const msg = msgOrCtx?.msg || msgOrCtx;
  const m = msg?.message || {};
  const ci = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || {};
  return ci.mentionedJid?.[0] || ci.participant || msg?.mention?.[0] || msg?.quoted?.sender || null;
}

const names = new Map();
export const peekName = (jids = []) => { for (const j of jids) if (names.has(j)) return names.get(j); return null; };
export const rememberName = (jid, n) => n && names.set(jid, n);
// SINKRON (leveling memanggilnya tanpa await)
export const resolveSenderName = (msgOrCtx, sender) => {
  const n = msgOrCtx?.pushName || msgOrCtx?.msg?.pushName || msgOrCtx?.senderName;
  const jid = sender || msgOrCtx?.sender;
  if (n && jid) names.set(jid, n);
  return n || (jid && names.get(jid)) || jidNum(jid);
};

/*!-======[ Media ]======-!*/
export async function extractMedia(arg, chat) {
  const msg = arg?.msg || arg;
  const q = msg?.quoted;
  const src = q?.download ? q : msg;
  const buffer = await (src?.download?.() ?? Promise.reject(new Error('Tidak ada media')));
  const mimetype = src?.mimetype || src?.msg?.mimetype || src?.type || '';
  return { buffer, mimetype, isAnimated: Boolean(src?.isAnimated || src?.msg?.isAnimated) };
}

export async function sendError(sock, chat, msg, error) {
  const text = `❌ ${error?.message || error || 'Terjadi kesalahan'}`;
  return sock.sendMessage(chat, { text }, { quoted: msg });
}
export const sendLinkPreview = (sock, { chat, text }) => sock.sendMessage(chat, { text });

/*!-======[ Session manager (namespace:chat:sender) ]======-!*/
const sessions = new Map();
const key = (ns, chat, sender) => `${ns}|${chat}|${sender ?? '*'}`;
export const sessionManager = {
  createSession(ns, chat, sender, data = {}, timeout = 60000) {
    this.endSession(ns, chat, sender);
    const s = { ...data, ns, chat, sender, startTime: Date.now(), endTime: Date.now() + timeout, timeout };
    sessions.set(key(ns, chat, sender), s);
    return s;
  },
  getSession(ns, chat, sender) {
    const s = sessions.get(key(ns, chat, sender));
    if (s && Date.now() > s.endTime + 1000) { this.endSession(ns, chat, sender); return null; }
    return s || null;
  },
  setSession(ns, chat, s) { sessions.set(key(ns, chat, s.sender), s); return s; },
  setSessionTimer(ns, chat, cb, sender) {
    const s = sessions.get(key(ns, chat, sender));
    if (!s) return;
    clearTimeout(s.timer);
    s.timer = setTimeout(async () => {
      if (sessions.get(key(ns, chat, s.sender)) !== s) return;
      sessions.delete(key(ns, chat, s.sender));
      try { await cb(s); } catch (e) { logger.warn('session timer:', e?.message); }
    }, Math.max(0, s.endTime - Date.now()));
    s.timer.unref?.();
  },
  endSession(ns, chat, sender) {
    const k = key(ns, chat, sender);
    const s = sessions.get(k);
    if (s) { clearTimeout(s.timer); sessions.delete(k); }
    return s || null;
  },
  hasActiveSession(ns, chat, sender) { return Boolean(this.getSession(ns, chat, sender)); },
};

/*!-======[ Quota harian: Alisa memakai sistem energy, jadi tidak dibatasi ]======-!*/
export const getUsage = async () => ({ max: 0, used: 0, left: 0 });

/*!-======[ Bot settings (sederhana, in-memory + Data.luminaris) ]======-!*/
export const getBotSettings = async () => (globalThis.Data?.luminaris?.settings ?? {});
export const setBotSettings = async (patch) => {
  const D = (globalThis.Data.luminaris ??= {});
  D.settings = { ...(D.settings || {}), ...patch };
  return D.settings;
};
