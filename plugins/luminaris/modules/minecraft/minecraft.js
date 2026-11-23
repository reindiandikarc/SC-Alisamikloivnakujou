import { CHAT } from '../../_runtime/core-shim.js'
import { reply } from './lib/shared.js'
import { mine, collect, sell } from './commands/mine.js'
import { me, stats, orebook, top } from './commands/profile.js'
import { travel } from './commands/travel.js'
import { shop, buy, equip, picks } from './commands/pickaxe.js'
import { enchant, enchants, pickup } from './commands/enchant.js'
import { fight, heal } from './commands/combat.js'
import { smelt, craft, inv } from './commands/craft.js'
import { daily } from './commands/daily.js'
import { gacha } from './commands/gacha.js'
import { upgrade, prestige, tokens } from './commands/prestige.js'
import { jackpot } from './commands/jackpot.js'

async function handler(ctx) {
  const { chat, args, isGroup, isOwner, moduleData } = ctx
  const sa = args || []
  const sub = (sa[0] || '').toLowerCase()
  const subArgs = sa.slice(1)

  if (sub === 'on' || sub === 'off') {
    if (!isGroup) return reply(ctx, '_Toggle hanya di grup_')
    if (!isOwner) return reply(ctx, '_Hanya owner yang bisa mengatur toggle_')
    await moduleData.group.set(chat, 'mcEnabled', sub === 'on')
    return reply(ctx, sub === 'on'
      ? '*🧱 MINECRAFT ENABLED*\n\n🎮 Semua member wajib main Minecraft!\n🪧 Ketik `.mct help` untuk mulai'
      : '*🧱 MINECRAFT DISABLED*')
  }

  if (isGroup && sub !== 'on' && sub !== 'off' && (await moduleData.group.get(chat, 'mcEnabled')) === false && !isOwner) {
    return reply(ctx, '_🧱 Minecraft sedang dimatikan oleh owner._')
  }

  if (!sub || sub === 'help' || sub === 'menu') {
    return reply(ctx, [
      '*🧱 MINECRAFT GAME*',
      '_⛏️ Sistem pertambangan & 🛠️ crafting terlengkap_',
      '',
      '*⛏️ MINING*',
      '`.mct mine` _⛏️ Mulai menambang_',
      '`.mct collect` _📦 Ambil hasil_',
      '`.mct sell` _💸 Jual ore_',
      '`.mct orebook` _📚 Koleksi ore_',
      '`.mct top` _🏆 Leaderboard_',
      '',
      '*⚔️ COMBAT*',
      '`.mct fight` _👹 Daftar mob_',
      '`.mct fight <mob>` _⚔️ Lawan mob_',
      '`.mct heal` _❤️ Sembuhkan HP_',
      '`.mct stats` _📊 Stats detail_',
      '',
      '*👤 PROFILE*',
      '`.mct me` _🪪 Profil kamu_',
      '`.mct daily` _🎁 Daily reward_',
      '',
      '*🗺️ BIOME & PICKAXE*',
      '`.mct travel` _🗺️ Daftar biome_',
      '`.mct travel <biome>` _🚪 Pindah biome_',
      '`.mct shop` _🛒 Toko pickaxe_',
      '`.mct buy <pick>` _💰 Beli pickaxe_',
      '`.mct equip <pick>` _🪓 Pasang pickaxe_',
      '`.mct picks` _🎒 Koleksi pickaxe_',
      '`.mct enchant <key>` _✨ Enchant pickaxe_',
      '`.mct enchants` _📜 Daftar enchant_',
      '`.mct pickup` _⬆️ Upgrade pickaxe_',
      '',
      '*🔥 CRAFTING & SMELTING*',
      '`.mct smelt` _🔥 Smelt semua ore_',
      '`.mct craft` _🛠️ Daftar resep_',
      '`.mct craft <id>` _🧪 Craft item_',
      '`.mct inv` _🎒 Inventory_',
      '',
      '*👑 PRESTIGE*',
      '`.mct prestige` _👑 Info prestige_',
      '`.mct tokens` _🪙 Token store_',
      '`.mct upgrade` _📈 Upgrade stats_',
      '`.mct gacha` _🎰 Gacha_',
      '`.mct gacha ticket` _🎟️ Gacha pakai tiket_',
      '',
      '*🎰 JACKPOT*',
      '`.mct jackpot` _🎰 Daftar jackpot_',
      '`.mct jackpot <tier>` _💎 Main jackpot_',
    ].join('\n'))
  }

  switch (sub) {
    case 'mine': return mine(ctx)
    case 'collect': return collect(ctx)
    case 'sell': return sell(ctx)
    case 'me': return me(ctx)
    case 'stats': return stats(ctx)
    case 'orebook': return orebook(ctx)
    case 'travel': return travel(ctx, subArgs)
    case 'shop': return shop(ctx)
    case 'buy': return buy(ctx, subArgs)
    case 'equip': return equip(ctx, subArgs)
    case 'picks': return picks(ctx)
    case 'enchant': return enchant(ctx, subArgs)
    case 'enchants': return enchants(ctx)
    case 'pickup': return pickup(ctx)
    case 'fight': return fight(ctx, subArgs)
    case 'heal': return heal(ctx)
    case 'smelt': return smelt(ctx)
    case 'craft': return craft(ctx, subArgs)
    case 'inv':
    case 'inventory': return inv(ctx)
    case 'daily': return daily(ctx)
    case 'gacha': return gacha(ctx, subArgs)
    case 'upgrade': return upgrade(ctx, subArgs)
    case 'prestige': return prestige(ctx, subArgs)
    case 'tokens': return tokens(ctx, subArgs)
    case 'jackpot': return jackpot(ctx, subArgs)
    case 'top': return top(ctx)
    default: return reply(ctx, '_Sub-command tidak dikenal!_ Ketik `.mct help`')
  }
}

export default {
  name: 'minecraft',
  command: ['mct', 'minecraft'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'game',
  description: 'Minecraft - Mining & Crafting Game',
  handle: handler,
}
