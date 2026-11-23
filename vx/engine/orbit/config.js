// Jembatan config: plugin hasil port VEMZO memakai bentuk config yang sama dengan Ourin,
// jadi cukup pakai ulang ourin/config.js (identitas bot, APIkey proxy, isOwner/isPremium, dll).
import config, { isOwner, isPremium, isPartner, isBanned, isSelf, getOwnerName, getConfig } from '../nimbus/config.js'
export default config
export { config, isOwner, isPremium, isPartner, isBanned, isSelf, getOwnerName, getConfig }
