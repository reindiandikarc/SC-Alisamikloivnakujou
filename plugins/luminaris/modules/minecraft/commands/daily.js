import { DAILY_REWARDS } from '../lib/data.js'
import { formatMoney } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function daily(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const now = new Date()
  if (mc.lastDaily) {
    const diff = now.getTime() - new Date(mc.lastDaily).getTime()
    if (diff < 86400000)
      return reply(ctx, `_🎁 Daily sudah diambil! Tunggu *${Math.ceil((86400000 - diff) / 3600000)}* jam._`)
  }
  const ld = mc.lastDaily ? new Date(mc.lastDaily) : null
  mc.dailyStreak = ld && now.getTime() - ld.getTime() < 172800000 ? (mc.dailyStreak || 0) + 1 : 1
  let rw = DAILY_REWARDS[0]
  for (const r of DAILY_REWARDS) {
    if (mc.dailyStreak >= r.streak) rw = r
  }
  mc.money = (mc.money || 0) + rw.money
  mc.gachaTickets = (mc.gachaTickets || 0) + rw.tickets
  mc.lastDaily = now.toISOString()
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🎁 DAILY REWARD!*\n\n*🔥 Streak:* ${mc.dailyStreak} hari\n💰 +${formatMoney(rw.money)}\n🎟️ +${rw.tickets} Tiket Gacha\n*🏦 Saldo:* ${formatMoney(mc.money)}`)
}
