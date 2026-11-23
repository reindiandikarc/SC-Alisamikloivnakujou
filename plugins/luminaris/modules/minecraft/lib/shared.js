import { RARITY_EMOJI, pickaxes } from './data.js'
import { formatMoney, createMCUser } from './engine.js'

export const MC = 15
export const rc = (r) => RARITY_EMOJI[r] || '⬜'
export const encCost = (r) =>
  ({ common: 60000, rare: 600000, epic: 6e6, legendary: 6e7, mythic: 6e8, godly: 6e9, secret: 6e10 })[r] || 60000

export async function loadMC(moduleData, sender, pushName) {
  const raw = (await moduleData.user.get(sender, 'mc')) || null
  if (raw) {
    if (!raw.pickaxes) raw.pickaxes = { woodpick: { ...pickaxes.woodpick } }
    if (!raw.pickaxes.woodpick) raw.pickaxes.woodpick = { ...pickaxes.woodpick }
    if (!raw.travelFound) raw.travelFound = ['plains']
    if (!raw.achievements) raw.achievements = []
    // Leaderboard menampilkan orang LAIN yang tidak jadi pengirim perintah,
    // jadi pushName harus ikut disimpan di record - tidak ada cara mengambilnya
    // saat render. Diperbarui tiap pemakaian supaya rename di HP ikut terbaca.
    if (pushName) raw.name = pushName
    return raw
  }
  const fresh = createMCUser()
  if (pushName) fresh.name = pushName
  return fresh
}

export async function saveMC(moduleData, sender, mc) {
  try {
    await moduleData.user.set(sender, 'mc', mc)
    return true
  } catch {
    return false
  }
}

export async function reply(ctx, text) {
  return ctx.sock.sendMessage(ctx.chat, { text }, { quoted: ctx.msg })
}

export function jackpotLabel(type) {
  return { coins: 'Koin', energi: 'Energi', limit: 'Limit', tickets: 'Gacha Tickets', tokens: 'Prestige Tokens', exp_boost: 'EXP Boost', premium_7d: 'Premium 7 Hari', premium_30d: 'Premium 30 Hari', partner_7d: 'Partner 7 Hari', partner_30d: 'Partner 30 Hari', unlimited_energi: 'UNLIMITED Energi', unlimited_limit: 'UNLIMITED Limit', owner_reward: 'OWNER REWARD' }[type] || type
}

export async function applyJackpotReward(mc, result) {
  const { reward, value } = result
  const type = reward.type
  const desc = (label, amt) => ({ desc: `${label} +${amt}`, type })
  switch (type) {
    case 'coins': mc.money = (mc.money || 0) + value; return desc('💰', formatMoney(value))
    case 'energi': mc.money = (mc.money || 0) + value * 10000; return desc('⚡ (→💰)', formatMoney(value * 10000))
    case 'limit': mc.money = (mc.money || 0) + value * 15000; return desc('📌 (→💰)', formatMoney(value * 15000))
    case 'tickets': mc.gachaTickets = (mc.gachaTickets || 0) + value; return desc('🎟️', value)
    case 'tokens': mc.prestigeTokens = (mc.prestigeTokens || 0) + value; return desc('🪙', value)
    case 'exp_boost': { const boost = Math.floor(mc.expToNextLevel * value * 0.5); mc.exp = (mc.exp || 0) + boost; return desc('⭐ EXP', formatMoney(boost)) }
    case 'premium_7d': case 'premium_30d': { const v = 5000000000; mc.money = (mc.money || 0) + v; return desc('👑 Premium (→💰)', formatMoney(v)) }
    case 'partner_7d': case 'partner_30d': { const v = 5000000000; mc.money = (mc.money || 0) + v; return desc('🤝 Partner (→💰)', formatMoney(v)) }
    case 'unlimited_energi': case 'unlimited_limit': { const v = 200000000000; mc.money = (mc.money || 0) + v; return desc('♾️ UNLIMITED (→💰)', formatMoney(v)) }
    case 'owner_reward': { const v = 1000000000000; mc.money = (mc.money || 0) + v; return desc('🔥 OWNER REWARD (→💰)', formatMoney(v)) }
    default: return desc('🎁 Mystery', value)
  }
}
