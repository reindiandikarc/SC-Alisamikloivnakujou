// Objek config gaya bot asal, dibentuk dari config/settings vanXone. Kunci API diisi di settings.js -> global.apiKeys.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bot = require('../../config.js')
const here = path.dirname(fileURLToPath(import.meta.url))
const DEF = { cuki: 'cuki-x' }
const key = (k) => (global.apiKeys && global.apiKeys[k]) || DEF[k] || ''

const owners = require('../../lib/owners')
const ztowner = require('../../lib/engine/pulse-owner')
const num = (j) => String(j || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

const config = {
  bot: { name: bot.botName, developer: bot.ownerName, number: bot.ownerNumber, version: '3.4' },
  owner: { name: bot.ownerName, number: [bot.ownerNumber] },
  mode: 'public',
  command: { prefix: '.' },
  energi: { enabled: true, default: 99999, premium: 99999999, owner: -1 },
  limits: { default: 99999, premium: 99999999 },
  registration: { enabled: false, rewards: { koin: 30000, energi: 300, exp: 300000 } },
  features: { antiCall: false, blockIfCall: false, autoTyping: true, autoRead: true, logMessage: true, dailyLimitReset: true, smartTriggers: false },
  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },
  ui: { menuVariant: 1, allmenuVariant: 2, replyVariant: 1 },
  payment: {},
  donasi: {},
  store: { payment: [] },
  pterodactyl: { ownerPanels: [], sellers: [] },
  errorTemplate: '☢ Kayaknya command `{prefix}{command}` lagi ada kendala\nSilahkan coba lagi nanti, {pushName}\n\n_Jika masalah berlanjut, silahkan hubungi owner bot_',
  messages: {
    wait: '🕕 *Proses...* Mohon tunggu sebentar ya.',
    success: '✅ *Berhasil!* Permintaan kamu sudah selesai.',
    error: '❌ *Error!* Ada masalah pada sistem, coba lagi nanti.',
    ownerOnly: '*Akses Ditolak!* Fitur ini khusus untuk Owner bot.',
    premiumOnly: '💎 *Premium Only!* Fitur ini khusus member Premium.',
    groupOnly: '👥 *Group Only!* Fitur ini hanya bisa digunakan di dalam grup.',
    privateOnly: '🔒 *Private Only!* Fitur ini hanya bisa digunakan di chat pribadi bot.',
    adminOnly: '🛡️ *Admin Only!* Kamu harus jadi Admin grup untuk pakai fitur ini.',
    botAdminOnly: '🤖 *Bot Bukan Admin!* Jadikan bot sebagai Admin grup dulu biar bisa kerja.',
    cooldown: '🕕 *Tunggu Dulu!* Kamu masih dalam cooldown. Tunggu %time% detik lagi ya.',
    energiExceeded: '⚡ *Energi Habis!* Energi kamu sudah habis.',
    limitDeducted: '🔋 Limit kau berkurang sebanyak {amount}. Sisa limit: {sisa}',
    banned: '🚫 *Kamu Dibanned!* Kamu tidak bisa menggunakan bot ini.'
  },
  sticker: { packname: bot.stickerPack, author: bot.stickerAuthor },
  saluran: { id: bot.newsletter.jid, name: bot.newsletter.name, link: '' },
  APIkey: new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? key(k) : undefined), has: () => true }),
  vercel: { get token() { return key('vercel') || global.vercelToken || '' } },
  info: { website: bot.links && bot.links.wa ? 'https://' + bot.links.wa : '' },
  assets: { 'pp-kosong': './engine/nimbus/assets/pp-kosong.jpg', 'ourin-kertas': './engine/nimbus/assets/ourin-kertas.jpg', 'ourin-font': './engine/nimbus/assets/ourin-font.ttf' }
}
// ---- fungsi bantu ala config asli, memakai pemilik / premium / ban milik vanXone
config.isOwner = (n) => { try { return owners.isOwner(num(n) + '@s.whatsapp.net') || owners.isOwner(String(n)) } catch { return false } }
config.isPremium = (n) => { try { return config.isOwner(n) || ztowner.isPremium(num(n) + '@s.whatsapp.net') } catch { return false } }
config.isPartner = () => false
config.isBanned = (n) => { try { return !!require('../../lib/guard').isBanned(num(n) + '@s.whatsapp.net') } catch { return false } }
config.isSelf = () => false
config.getOwnerName = () => bot.ownerName
config.getConfig = () => config

// peta aset (nama tanpa ekstensi -> path file) dibaca dari folder ourin/assets
try {
  const top = path.join(here, '..', 'assets')
  const walk = (d, depth = 0) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (depth < 4) walk(p, depth + 1) } else {
        const k = e.name.replace(/\.[^.]+$/, '')
        if (!config.assets[k]) config.assets[k] = './' + path.relative(path.join(here, '..'), p).split(path.sep).join('/')
      }
    }
  }
  walk(path.join(here, 'assets')); walk(top)
} catch {}

export default config
export { config }
export const isOwner = config.isOwner, isPremium = config.isPremium, isPartner = config.isPartner, isBanned = config.isBanned, isSelf = config.isSelf, getOwnerName = config.getOwnerName, getConfig = config.getConfig
