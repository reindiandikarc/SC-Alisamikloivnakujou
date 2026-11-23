// Plugin: inventory
// Commands: me, profil, profile, inventory
// FIXED: CLASSES, getBonus, getEffectiveRole, ROLE_LEVELS, getChatCount defined locally

'use strict'
const fs = require('fs')

let _W = {}
try { _W = require('../../lib/weapons') } catch {}

let _PL = {}
try { _PL = require('../../lib/playerlevel') } catch {}

let _Origin = {}
try { _Origin = require('../../lib/isekaiOrigin') } catch {}

// ── Local import dari interactive_ai ──────────────────────────────────────────
let _ai = {}
try { _ai = require('../../machine/interactive_ai') } catch {}
const getEffectiveRole = _ai.getEffectiveRole || (() => ({ role: 'Orang Asing', emoji: '👤', isManual: false }))
const getChatCount     = _ai.getChatCount || (() => 0)
const ROLE_LEVELS      = _ai.ROLE_LEVELS || [
  { min: 0,   role: 'Orang Asing',    emoji: '👤' },
  { min: 10,  role: 'Kenalan',        emoji: '🤝' },
  { min: 50,  role: 'Teman',          emoji: '😊' },
  { min: 150, role: 'Teman Dekat',    emoji: '🥰' },
  { min: 500, role: 'Sahabat',        emoji: '💖' },
  { min: 1000,role: 'Soulmate',       emoji: '💞' },
]

// ── CLASSES & getBonus (mirror dari alya.js) ───────────────────────────────────
const CLASSES = {
  warrior:  { name: 'Warrior',  hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15, color: '⚔️' },
  mage:     { name: 'Mage',     hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10, color: '🔮' },
  assassin: { name: 'Assassin', hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38, color: '🗡️' },
  tank:     { name: 'Tank',     hp: 850, mana:  80, dmg: 18, skillDmg: 30, crit: 0.05, color: '🛡️' },
}
// Formula bonus dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
const getBonus = (user) => {
  const lvl = parseInt(user.duelLvl) || 0
  return _PL.getClassBonus ? _PL.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) }
}

module.exports = {
  command: ['me', 'profil', 'profile', 'inventory'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix, pushname,
      Ryuu, isPrem, isAly, isAlya,
      reply, replyalya, replytolak
    } = ctx

    const isProfileCmd = ['profil', 'profile', 'inventory'].includes(command)

    if (m.isGroup || isProfileCmd || (m.mentionedJid && m.mentionedJid[0]) || m.quoted) {
      if (!m.isGroup && !isProfileCmd) return replytolak(global.mess?.only?.group || '❌ Hanya di grup!')

      let who = m.mentionedJid?.[0]
        || (m.quoted?.sender)
        || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender)

      const emojiMap = {
        bibitanggur: '🍇🌱', bibitmangga: '🥭🌱', bibitpisang: '🍌🌱', bibitapel: '🍎🌱', bibitjeruk: '🍊🌱',
        anggur: '🍇', mangga: '🥭', pisang: '🍌', apel: '🍎', jeruk: '🍊',
        potion: '🧪', trash: '🗑️', wood: '🪵', rock: '🪨', string: '🕸️',
        emerald: '💚', diamond: '💎', gold: '🔸', iron: '⛓️', umpan: '🪱',
        upgrader: '🆙', pet: '🥚', petfood: '🥩', common: '📦', uncommon: '🛍️',
        mythic: '🔮', legendary: '🔱'
      }

      const toolsMap = {
        armor: { '0': '❌', '1': 'Leather 👕', '2': 'Iron 🛡️', '3': 'Gold 🎖️', '4': 'Diamond 💎', '5': 'Emerald ❇️', '6': 'Crystal ❄️', '7': 'Obsidian 🖤', '8': 'Netherite 🛡️', '9': 'Wither 💀', '10': 'Dragon 🐉', '11': 'Hacker 💻' },
        sword: { '0': '❌', '1': 'Wood 🪵', '2': 'Stone 🪨', '3': 'Iron ⚔️', '4': 'Gold ⚡', '5': 'Copper 🛠️', '6': 'Diamond 💎', '7': 'Emerald 💚', '8': 'Obsidian 💜', '9': 'Netherite 🔥', '10': 'Slayer 👺', '11': 'Hacker ☣️' },
        pickaxe: { '0': '❌', '1': 'Wood 🪵', '2': 'Stone 🪨', '3': 'Iron ⛏️', '4': 'Gold 🟡', '5': 'Copper 🟠', '6': 'Diamond 💎', '7': 'Emerald 🟢', '8': 'Crystal 🧊', '9': 'Obsidian 🌑', '10': 'Netherite 🛠️', '11': 'Hacker 📟' },
        fishingrod: { '0': '❌', '1': 'Wood 🎣', '2': 'Stone 🎣', '3': 'Iron 🎣', '4': 'Gold 🎣', '5': 'Copper 🎣', '6': 'Diamond 🎣', '7': 'Emerald 🎣', '8': 'Crystal 🎣', '9': 'Obsidian 🎣', '10': 'God 🎣', '11': 'Hacker 🎣' }
      }
      const items  = ['bibitanggur','bibitmangga','bibitpisang','bibitapel','bibitjeruk','anggur','mangga','pisang','apel','jeruk','potion','trash','wood','rock','string','emerald','diamond','gold','iron','umpan','upgrader','pet','petfood']
      const crates = ['common','uncommon','mythic','legendary']
      const pets   = { horse: 10, cat: 10, fox: 10, dog: 10, robo: 10 }

      let userRpg = global.db?.users?.[who]
      if (!userRpg) return replyalya('❌ User tidak ditemukan di database!')

      const toRp  = (v) => 'Rp' + (v || 0).toLocaleString('id-ID')
      const toNum = (v) => (v || 0).toLocaleString('id-ID')
      const getRank = (attr) => {
        const sorted = Object.entries(global.db.users).sort((a, b) => (b[1][attr] || 0) - (a[1][attr] || 0))
        const rank = sorted.findIndex(v => v[0] === who) + 1
        return rank > 0 ? rank : 'N/A'
      }

      const userClass = (userRpg.class && CLASSES[userRpg.class]) ? CLASSES[userRpg.class] : { name: 'None', color: '👤', hp: 0, dmg: 0, mana: 0 }
      const b        = getBonus(userRpg)

      let weaponLine = '┃  🗡️ *Weapon:* _Tangan kosong_'
      if (userRpg.equippedWeapon && _W.getWeaponById) {
        const wBase = _W.getWeaponById(userRpg.equippedWeapon)
        const wData = userRpg.weapons?.[userRpg.equippedWeapon]
        if (wBase && wData) {
          const rc = _W.RARITY?.[wBase.rarity]?.color || '⚪'
          weaponLine = `┃  🗡️ *Weapon:* ${rc} ${wBase.name} (${wBase.rarity}, Lv.${wData.level || 1})`
        }
      }

      const level  = userRpg.level || 0
      const exp    = userRpg.exp || 0
      const maxExp = 100000 * (level + 1)
      const pct    = Math.min(Math.floor((exp / maxExp) * 100), 100)
      const bar    = '▰'.repeat(Math.floor(pct / 10)) + '▱'.repeat(10 - Math.floor(pct / 10))

      const _rData    = getEffectiveRole(who)
      const _chatCnt  = getChatCount(who)
      const _nextLvl  = ROLE_LEVELS.find(r => r.min > _chatCnt)
      const _chatNeed = _nextLvl ? _nextLvl.min - _chatCnt : 0

      let waifuTxt = ''
      if (userRpg.waifu?.name) {
        const w = userRpg.waifu, day = Math.floor((Date.now() - (w.marriedAt || Date.now())) / 86400000)
        waifuTxt = `\n╔━━〔 ❤️ *Waifu* 〕━━╗\n┃  🌸 ${w.name} • ${w.anime || 'Unknown'}\n┃  ⏳ ${day} Hari • 💞 ${w.affection || 0} Poin\n╚━━━━━━━━━━━━━━━━━━━╝`
      } else if (userRpg.husbu?.name) {
        const h = userRpg.husbu, day = Math.floor((Date.now() - (h.marriedAt || Date.now())) / 86400000)
        waifuTxt = `\n╔━━〔 ❤️ *Husbu* 〕━━╗\n┃  🗡️ ${h.name} • ${h.anime || 'Unknown'}\n┃  ⏳ ${day} Hari • 💞 ${h.affection || 0} Poin\n╚━━━━━━━━━━━━━━━━━━━╝`
      } else {
        waifuTxt = `\n╔━━〔 ❤️ Waifu/Husbu 〕━━╗\n┃  😔 Belum Menikah\n╚━━━━━━━━━━━━━━━━━━━━━━━╝`
      }

      const toolTxt  = Object.keys(toolsMap).map(v => userRpg[v] > 0 ? `│ ${toolsMap[v][userRpg[v]] || 'Unknown'}` : null).filter(v => v).join('\n')
      const itemTxt  = items.map(v  => userRpg[v] > 0 ? `│ ${emojiMap[v] || '📦'} ${v}: ${toNum(userRpg[v])}` : null).filter(v => v).join('\n')
      const crateTxt = crates.map(v => userRpg[v] > 0 ? `│ ${emojiMap[v] || '🎁'} ${v.toUpperCase()}: ${toNum(userRpg[v])}` : null).filter(v => v).join('\n')
      const petTxt   = Object.keys(pets).map(v => userRpg[v] > 0 ? `│ 🐾 ${v.toUpperCase()}: ${userRpg[v] >= pets[v] ? 'MAX' : 'Lv.' + userRpg[v]}` : null).filter(v => v).join('\n')

      const rankInfo = _PL.getRankInfo ? _PL.getRankInfo(userRpg.duelLvl || 0) : null
      const titleInfo = _Origin.resolveTitle ? _Origin.resolveTitle(userRpg.unlockedClasses || [], userRpg.duelLvl || 0) : null
      const rankLine = rankInfo ? `┃  ${rankInfo.emoji} *Peringkat:* ${rankInfo.label}\n` : ''
      const titleLine = titleInfo ? `┃  ${titleInfo.emoji} *Golongan:* ${titleInfo.title}\n` : ''

      const caption = `
╔═════〔 *PROFILE* 〕═════╗
┃
┃  👤 *Nama:* ${userRpg.name || alya.getName?.(who) || who.split('@')[0]}
┃  📊 *Level:* ${level}
┃  🎭 *Class:* ${userClass.name} ${userClass.color}
${weaponLine}
┃  🆙 *Duel:* LVL ${userRpg.duelLvl || 0}
${rankLine}${titleLine}┃  ❤️ *HP:* ${userClass.hp + b.hp}
┃  ⚔️ *DMG:* ${userClass.dmg + b.dmg}
┃  💧 *MP:* ${userClass.mana || 0}
┃  ✨ *Exp:* ${toNum(exp)} / ${toNum(maxExp)}
┃  └ [ ${bar} ] ${pct}%
┃
╚═════════════════════════╝
${waifuTxt}
╔━━〔 💬 *STATUS ALYA* 〕━━╗
┃  🎭 *Hubungan :* ${_rData.emoji || '👤'} ${_rData.role}${_rData.isManual ? ' _(custom)_' : ''}
┃  💬 *Total Chat:* ${_chatCnt}x
┃  📈 *Next:* ${_nextLvl ? `+${_chatNeed} chat → ${_nextLvl.role}` : '🏆 MAX!'}
╚━━━━━━━━━━━━━━━━━━━━━━━╝

╔━━〔 💳 *STATUS UANG* 〕━━╗
┃  💰 Uang : ${toRp(userRpg.money)}
┃  🏦 Bank : ${toRp(userRpg.bank)}
┃  🎰 Chips: ${toNum(userRpg.chip)}
┃  🎟️ Limit: ${userRpg.limit || 0}
╚━━━━━━━━━━━━━━━━━━━━━━━╝

╔━━〔 🏆 *GLOBAL RANKING* 〕━━╗
┃  🥇 Level: #${getRank('level')}    💰 Money: #${getRank('money')}
┃  🎰 Chips: #${getRank('chip')}    💎 Diamd: #${getRank('diamond')}
╚━━━━━━━━━━━━━━━━━━━━━━━╝
${toolTxt  ? `\n╔━━〔 ⚔️ EQUIPMENTS 〕━━╗\n${toolTxt}\n╚━━━━━━━━━━━━━━━━━━━━━╝` : ''}
${itemTxt  ? `\n╔━━〔 📦 STORAGE 〕━━╗\n${itemTxt}\n╚━━━━━━━━━━━━━━━━━━━━━╝` : ''}
${crateTxt ? `\n╔━━〔 🎁 TREASURES 〕━━╗\n${crateTxt}\n╚━━━━━━━━━━━━━━━━━━━━━╝` : ''}
${petTxt   ? `\n╔━━〔 🐾 PET KENNEL 〕━━╗\n${petTxt}\n╚━━━━━━━━━━━━━━━━━━━━━╝` : ''}
╔━━〔 🕒 COOLDOWN 〕━━╗
┃  ⛏️ Mining:  ${userRpg.lastmining === 0 ? '✅ READY' : '❌ Cooldown'}
┃  🏹 Dungeon: ${userRpg.lastdungeon === 0 ? '✅ READY' : '❌ Cooldown'}
╚━━━━━━━━━━━━━━━━━━━━━╝`.trim()

      let ppUser = global.defaultpp || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
      try { ppUser = await alya.profilePictureUrl(who, 'image') } catch {}

      return alya.sendMessage(m.chat, { image: { url: ppUser }, caption, mentions: [who] }, { quoted: m })
    }

    // ── .me di private chat → status hubungan ──
    const _rData   = getEffectiveRole(m.sender)
    const _chatCnt = getChatCount(m.sender)
    const _nextLvl = ROLE_LEVELS.find(r => r.min > _chatCnt)
    const _chatNeed = _nextLvl ? _nextLvl.min - _chatCnt : 0
    const allRoles = ROLE_LEVELS.map(r => {
      const reached  = _chatCnt >= r.min
      const current  = !_rData.isManual && r.role === _rData.role
      return `${current ? '▶️' : reached ? '✅' : '⬜'} ${r.emoji} *${r.role}* _(${r.min}+ chat)_`
    })
    const card = `╔══════════════════════╗\n║  📊 *STATUS HUBUNGAN*  ║\n╠══════════════════════╣\n║  👤 *Nama   :* ${(pushname || 'User').slice(0, 14)}\n║  💬 *Chat   :* ${_chatCnt}x\n║  🎭 *Status :* ${_rData.role}${_rData.isManual ? ' _(custom)_' : ''}\n║  📈 *Next   :* ${_nextLvl ? `+${_chatNeed} chat → ${_nextLvl.role}` : '🏆 MAX!'}\n╚══════════════════════╝\n\n*📋 Semua Level Hubungan:*\n${allRoles.join('\n')}\n\n${_rData.isManual ? `_⚙️ Role-mu saat ini di-set manual._\n_Ketik *${prefix}setrole reset* untuk kembali ke auto._` : `_💡 Ketik *${prefix}setrole* untuk melihat opsi role._`}`
    return replyalya(card)
  }
}
