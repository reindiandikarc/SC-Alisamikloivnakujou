// Pengganti ourin-logger asli (tanpa chalk/gradient): semua metode (info/success/error/warn/...) mencetak ke konsol bot.
const out = (lvl) => (tag, ...a) => {
  if (lvl === 'debug' && !process.env.OURIN_DEBUG) return
  try { console.log(`[OURIN:${tag}]`, ...a) } catch {}
}
export const logger = new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? out(k) : undefined) })
export default logger
