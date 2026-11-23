import { CHAT, logger } from '../../_runtime/core-shim.js'
import {
  detectPlatform,
  mediaCaption,
  platformLabel,
  resolveMedia,
  sendResolvedMedia
} from './_media-router.js'

const SUPPORTED = [
  'TikTok',
  'Facebook',
  'Twitter / X',
  'Instagram',
  'YouTube'
]

function helpText(prefix) {
  return [
    '📥 *AIO DOWNLOADER*',
    'Unduh media dari banyak platform lewat satu perintah.',
    '',
    '*Cara pakai*',
    `• ${prefix}aio <link>`,
    `• ${prefix}aio <link> audio — khusus YouTube, ambil audio`,
    '',
    '*Platform yang didukung*',
    ...SUPPORTED.map((name) => `• ${name}`),
    '',
    '*Contoh*',
    `> ${prefix}aio https://vt.tiktok.com/xxxxx`,
    `> ${prefix}aio https://youtu.be/xxxxx`,
    `> ${prefix}aio https://x.com/user/status/123`,
    '',
    '_Untuk YouTube, kualitas video default 360p supaya lebih ringan._'
  ].join('\n')
}

export default {
  name: 'aio',
  command: ['aio', 'allinone', 'alldl', 'downloadall'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh media dari banyak platform (all-in-one)',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const url = String(ctx.args[0] || '').trim()

    if (!url) return ctx.reply(helpText(prefix))

    if (!/^https?:\/\//i.test(url)) {
      return ctx.reply([
        '❌ *Link tidak valid.*',
        '',
        `Kirim link lengkap, contoh: *${prefix}aio https://vt.tiktok.com/xxxxx*`
      ].join('\n'))
    }

    const platform = detectPlatform(url)
    if (!platform) {
      return ctx.reply([
        '❌ *Platform belum didukung.*',
        '',
        'Link yang bisa dipakai:',
        ...SUPPORTED.map((name) => `• ${name}`),
        '',
        `Gunakan pengunduh khusus kalau tersedia, contoh *${prefix}tiktok*, *${prefix}instagram*, atau *${prefix}youtube*.`
      ].join('\n'))
    }

    const audio = /^(audio|mp3|musik|music)$/i.test(String(ctx.args[1] || '').trim())
    if (audio && platform !== 'youtube') {
      return ctx.reply('⚠️ Mode audio hanya tersedia untuk link YouTube.')
    }

    await ctx.reply.react('⏳')
    await ctx.reply(`⏳ *Mengambil media ${platformLabel(platform)}...*`)

    try {
      const media = await resolveMedia(url, { audio })
      const caption = mediaCaption(media)
      if (media.items.length && media.items.every((item) => item.type === 'audio')) {
        await ctx.reply(caption)
      }
      const sent = await sendResolvedMedia(ctx, media, { caption })

      await ctx.reply.react('✅')
      if (sent > 1) {
        await ctx.reply(`✅ *Selesai.* ${sent} media dikirim.`)
      }
    } catch (error) {
      logger.error('aio: gagal mengunduh media', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengunduh media.*',
        '',
        `> ${error.message}`,
        '',
        '> Pastikan link publik, bukan private, dan platformnya masih didukung.'
      ].join('\n'))
    }
  }
}

export { detectPlatform, resolveMedia }
