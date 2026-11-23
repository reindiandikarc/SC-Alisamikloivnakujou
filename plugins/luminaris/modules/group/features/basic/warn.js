import { CHAT, jidNum } from '../../../../_runtime/core-shim.js'
import { isGroupAdmin } from '../moderation/shared.js'
import { botJid, isRootOwner, resolveTarget, sameUser } from './shared.js'

// Sistem warning manual per grup.
//
//   !warn @user [alasan]   — tambah warning (3x → kick)
//   !unwarn @user          — kurangi satu warning
//   !listwarn [@user]      — lihat daftar warning
//   !resetwarn [@user]     — hapus warning (semua kalau tanpa target)
//
// Disimpan di ModuleData per grup, bukan Users.warns, karena warning grup A
// tidak boleh ikut terbawa ke grup B.

const WARN_KEY = 'warnData'
const WARN_LIMIT = 3

export default {
  name: 'warn',
  command: ['warn', 'unwarn', 'listwarn', 'warnings', 'warns', 'resetwarn', 'clearwarn'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Beri / lihat / reset warning anggota grup',

  async handle(ctx) {
    const { trigger, moduleData } = ctx
    if (!moduleData) return

    const action = String(trigger || '').toLowerCase()

    if (action === 'listwarn' || action === 'warnings' || action === 'warns') {
      return listWarnings(ctx)
    }

    if (action === 'resetwarn' || action === 'clearwarn') {
      return resetWarnings(ctx)
    }

    const target = resolveTarget(ctx)
    if (!target) {
      return ctx.reply.error(
        'Mention / reply target, atau tulis nomornya. ' +
        `Contoh: ${ctx.prefix}${action} @user alasan`
      )
    }

    const data = await getWarnData(moduleData, ctx.chat)

    if (action === 'unwarn') {
      const entry = data[target]
      if (!entry) return ctx.reply(`ℹ️ ${target} tidak punya warning.`)

      entry.count = Math.max(0, Number(entry.count || 0) - 1)
      entry.reasons = (entry.reasons || []).slice(0, entry.count)
      if (entry.count <= 0) delete data[target]
      else data[target] = entry

      await saveWarnData(moduleData, ctx.chat, data)
      return ctx.reply.success(
        entry.count > 0
          ? `Warning ${target} dikurangi. Sisa: ${entry.count}/${WARN_LIMIT}.`
          : `Warning ${target} dihapus.`
      )
    }

    // warn
    if (target === ctx.sender) {
      return ctx.reply.error('Kamu tidak bisa mewarn dirimu sendiri.')
    }

    const me = botJid(ctx.sock)
    if (me && sameUser(me, target)) {
      return ctx.reply.error('Aku tidak bisa mewarn diriku sendiri.')
    }
    if (isRootOwner(target)) {
      return ctx.reply.error('Owner bot tidak bisa diwarn.')
    }

    const meta = await ctx.sock.groupMetadata(ctx.chat).catch(() => null)
    if (meta && isGroupAdmin(meta, target)) {
      return ctx.reply.error('Target adalah admin grup. Demote dulu sebelum memberi warning.')
    }

    // Buang token target dari alasan, baik itu mention maupun nomor.
    const first = String(ctx.args[0] || '')
    const targetNum = jidNum(target)
    const firstIsTarget =
      first.startsWith('@') ||
      (targetNum && first.replace(/\D/g, '').endsWith(targetNum))
    const reason = (firstIsTarget ? ctx.args.slice(1) : ctx.args).join(' ').trim()

    const entry = data[target] || { count: 0, reasons: [] }
    entry.count = Number(entry.count || 0) + 1
    entry.reasons = [...(entry.reasons || []), reason || 'tanpa alasan'].slice(-WARN_LIMIT)
    entry.updatedAt = new Date().toISOString()

    if (entry.count < WARN_LIMIT) {
      data[target] = entry
      await saveWarnData(moduleData, ctx.chat, data)
      return ctx.sock.sendMessage(ctx.chat, {
        text: [
          `⚠️ Warning ${entry.count}/${WARN_LIMIT} untuk @${jidNum(target)}`,
          `Alasan: ${reason || 'tanpa alasan'}`,
          `Warning ke-${WARN_LIMIT} akan mengeluarkan dari grup.`
        ].join('\n'),
        mentions: [target]
      }, { quoted: ctx.msg })
    }

    // Batas tercapai: coba kick. Kalau gagal, warning tetap disimpan.
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'remove')
    } catch (error) {
      data[target] = entry
      await saveWarnData(moduleData, ctx.chat, data)
      return ctx.sock.sendMessage(ctx.chat, {
        text: [
          `⚠️ @${jidNum(target)} mencapai ${WARN_LIMIT} warning tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot adalah admin grup.'
        ].join('\n'),
        mentions: [target]
      }, { quoted: ctx.msg })
    }

    delete data[target]
    await saveWarnData(moduleData, ctx.chat, data)
    return ctx.sock.sendMessage(ctx.chat, {
      text: `🚫 @${jidNum(target)} dikeluarkan dari grup setelah ${WARN_LIMIT} warning.`,
      mentions: [target]
    }, { quoted: ctx.msg })
  }
}

async function listWarnings(ctx) {
  const data = await getWarnData(ctx.moduleData, ctx.chat)
  const target = resolveTarget(ctx)
  if (!target && ctx.args.length) {
    return ctx.reply.error('Target tidak valid. Mention / reply user atau tulis nomornya.')
  }

  if (target) {
    const entry = data[target]
    if (!entry) return ctx.reply(`ℹ️ ${target} tidak punya warning.`)
    return ctx.reply([
      `*Warning ${target}*`,
      `Jumlah: ${entry.count}/${WARN_LIMIT}`,
      'Riwayat:',
      ...(entry.reasons || []).map((reason, index) => `${index + 1}. ${reason}`)
    ].join('\n'))
  }

  const entries = Object.entries(data)
    .filter(([, entry]) => entry?.count > 0)
    .sort((a, b) => b[1].count - a[1].count)

  if (!entries.length) return ctx.reply('✅ Tidak ada warning di grup ini.')

  return ctx.reply([
    `*Daftar warning* (${entries.length})`,
    '',
    ...entries.map(([jid, entry]) => {
      const last = entry.reasons?.[entry.reasons.length - 1]
      return `• ${jid} — ${entry.count}/${WARN_LIMIT}${last ? ` (${last})` : ''}`
    }),
    '',
    `${ctx.prefix}resetwarn — hapus semua warning`
  ].join('\n'))
}

async function resetWarnings(ctx) {
  const target = resolveTarget(ctx)
  if (!target && ctx.args.length) {
    return ctx.reply.error('Target tidak valid. Mention / reply user atau tulis nomornya.')
  }
  if (!target) {
    await ctx.moduleData.group.delete(ctx.chat, WARN_KEY)
    return ctx.reply.success('Semua warning di grup ini dihapus.')
  }

  const data = await getWarnData(ctx.moduleData, ctx.chat)
  if (!data[target]) return ctx.reply(`ℹ️ ${target} tidak punya warning.`)

  delete data[target]
  await saveWarnData(ctx.moduleData, ctx.chat, data)
  return ctx.reply.success(`Warning ${target} dihapus.`)
}

async function getWarnData(moduleData, chat) {
  const data = await moduleData.group.get(chat, WARN_KEY)
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
}

async function saveWarnData(moduleData, chat, data) {
  if (Object.keys(data).length) await moduleData.group.set(chat, WARN_KEY, data)
  else await moduleData.group.delete(chat, WARN_KEY)
}
