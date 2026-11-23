// Jembatan config: plugin hasil port Rimuru memakai bentuk config yang sama dengan Ourin,
// jadi cukup pakai ulang ourin/config.js (identitas bot, APIkey proxy, isOwner/isPremium, dll).
import config, { isOwner, isPremium, isPartner, isBanned, isSelf, getOwnerName, getConfig } from '../nimbus/config.js'
export default config
export { config, isOwner, isPremium, isPartner, isBanned, isSelf, getOwnerName, getConfig }
// nama lama yang dipakai beberapa fitur Rimuru (sebelumnya tidak diekspor -> fitur gagal dimuat)
export const RIMURU_CORE_CONFIG = config
export const RIMURU_DEVELOPER = (config && config.bot && (config.bot.developer || config.bot.author)) || 'vanXone'
