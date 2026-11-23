import { CHAT, logger } from '../../_runtime/core-shim.js'

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'
const SFILE_URL_RE = /^https?:\/\/(?:www\.)?sfile\.(?:mobi|co)\//i

function decodeEntities(text) {
  return String(text || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["']`, 'i')
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return decodeEntities(match[1])
  }
  return ''
}

function matchFirst(html, patterns) {
  for (const pattern of patterns) {
    const match = String(html || '').match(pattern)
    if (match) return match[1]
  }
  return null
}

function downloadGateHref(html) {
  // sfile.co menyimpan URL gate di data-dw-url dan memakai href="#".
  // sfile.mobi memakai href biasa pada elemen #download.
  const dataUrl = matchFirst(html, [
    /<a[^>]*id=["']download["'][^>]*data-dw-url=["']([^"']+)["']/i,
    /<a[^>]*data-dw-url=["']([^"']+)["'][^>]*id=["']download["']/i
  ])
  if (dataUrl) return decodeEntities(dataUrl)

  const href = matchFirst(html, [
    /<a[^>]*id=["']download["'][^>]*href=["']([^"']+)["']/i,
    /<a[^>]*href=["']([^"']+)["'][^>]*id=["']download["']/i
  ])
  return href && href !== '#' ? decodeEntities(href) : null
}

export function parseSFileInfo(html, sourceUrl = '') {
  const pageUrl = metaContent(html, 'og:url') || sourceUrl || null
  const infoText = metaContent(html, 'og:description')
  const nameMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const sizeMatch = String(html).match(/(\d+(?:\.\d+)?\s?(?:KB|MB|GB))/i)

  let downloadCount = null
  const countMatch = String(html).match(/(?:Downloads?|Diunduh|Unduhan)\s*:?\s*(?:<[^>]+>\s*)*(\d+)/i)
  if (countMatch) downloadCount = countMatch[1]

  const spans = String(html).match(/<span[^>]*>[\s\S]*?<\/span>/gi) || []
  for (const span of spans) {
    if (downloadCount) break
    const text = stripTags(span)
    if (/download/i.test(text)) {
      const count = text.match(/\d+/)
      if (count) {
        downloadCount = count[0]
        break
      }
    }
  }

  return {
    file_name: nameMatch ? stripTags(nameMatch[1]) || null : null,
    size_from_text: sizeMatch ? sizeMatch[1] : null,
    author_name: infoText.match(/(?:uploaded by|diunggah oleh)\s+([^\s,]+)/i)?.[1] || null,
    upload_date: infoText.match(/(?:on|pada)\s+(\d+\s+[A-Za-z]+\s+\d{4})/i)?.[1] || null,
    download_count: downloadCount,
    page_url: pageUrl,
    download_gate: downloadGateHref(html)
  }
}

export function parseFinalDownloadUrl(html) {
  const scripts = String(html)
    .replace(/\\\//g, '/')
    .replace(/\\u002f/gi, '/')
  const match = scripts.match(/https:\/\/download\d+\.sfile\.(?:co|mobi)\/downloadfile\/\d+\/\d+\/[a-z0-9]+\/[^"'\s\\]+/i)
  return match ? decodeEntities(match[0]) : null
}

function headers(referer = '') {
  return {
    'user-agent': UA,
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
    ...(referer ? { referer } : {})
  }
}

async function getPage(url, referer = '', cookie = '') {
  const res = await fetch(url, {
    headers: {
      ...headers(referer),
      ...(cookie ? { cookie } : {})
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(45_000)
  })
  if (!res.ok) throw new Error(`SFile gagal diakses (HTTP ${res.status}).`)
  const cookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie().map((item) => String(item).split(';')[0]).join('; ')
    : ''
  return { html: await res.text(), cookies }
}

function withExtension(name, url) {
  const value = String(name || 'sfile-download').trim()
  if (/\.[A-Za-z0-9]{1,8}$/.test(value)) return value

  try {
    const ext = new URL(url).pathname.match(/\.([A-Za-z0-9]{1,8})$/)?.[1]
    return ext ? `${value}.${ext}` : value
  } catch {
    return value
  }
}

function infoText(info) {
  return [
    '📄 *SFILE DOWNLOADER*',
    '',
    '╭──〔 📋 *INFORMASI FILE* 〕──⬣',
    `│ 📛 Nama: ${info.file_name || 'Tidak diketahui'}`,
    `│ 📏 Ukuran: ${info.size_from_text || 'Tidak diketahui'}`,
    `│ 👤 Uploader: ${info.author_name || 'Tidak diketahui'}`,
    `│ 📅 Tanggal: ${info.upload_date || 'Tidak diketahui'}`,
    `│ 📥 Download: ${info.download_count || '-'}`,
    '╰───────────────⬣'
  ].join('\n')
}

function helpText(prefix) {
  return [
    '📄 *SFILE DOWNLOADER*',
    'Unduh file dari SFile.mobi / SFile.co.',
    '',
    '*Cara pakai*',
    `• ${prefix}sfile <link-sfile>`,
    '',
    '*Contoh*',
    `> ${prefix}sfile https://sfile.mobi/xxxxx`,
    `> ${prefix}sfile https://sfile.co/xxxxx`,
    '',
    '_File dikirim sebagai dokumen WhatsApp._'
  ].join('\n')
}

export default {
  name: 'sfile',
  command: ['sfile', 'sfiledl', 'sfiledownload'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh file dari SFile.mobi / SFile.co',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const url = String(ctx.args[0] || '').trim()

    if (!url) return ctx.reply(helpText(prefix))
    if (!SFILE_URL_RE.test(url)) {
      return ctx.reply([
        '❌ *Link bukan dari SFile.*',
        '',
        `Contoh: *${prefix}sfile https://sfile.mobi/xxxxx*`
      ].join('\n'))
    }

    await ctx.reply.react('⏳')
    await ctx.reply('⏳ *Mengambil informasi file...*')

    try {
      const first = await getPage(url)
      const cookie = first.cookies
      const info = parseSFileInfo(first.html, url)
      const pageUrl = info.page_url || url

      let pageHtml = first.html
      if (pageUrl !== url) {
        const page = await getPage(pageUrl, url, cookie)
        pageHtml = page.html
      }

      const gateFromPage = downloadGateHref(pageHtml)
      if (gateFromPage) info.download_gate = gateFromPage

      if (!info.download_gate) {
        await ctx.reply.react('❌')
        return ctx.reply(`${infoText(info)}\n\n❌ *Link download tidak ditemukan.*\n> ${pageUrl}`)
      }

      const gateUrl = new URL(info.download_gate, pageUrl).href
      const gate = await getPage(gateUrl, pageUrl, cookie)
      let downloadUrl = parseFinalDownloadUrl(gate.html)

      if (!downloadUrl) {
        const check = await fetch(gateUrl, {
          method: 'HEAD',
          headers: {
            ...headers(pageUrl),
            ...(cookie ? { cookie } : {})
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(30_000)
        }).catch(() => null)
        const disposition = check?.headers.get('content-disposition') || ''
        if (check?.ok && /attachment|filename=/i.test(disposition)) downloadUrl = gateUrl
      }

      if (!downloadUrl) {
        await ctx.reply.react('❌')
        return ctx.reply(`${infoText(info)}\n\n❌ *Link download final tidak ditemukan.*\n> ${pageUrl}`)
      }

      await ctx.reply(`${infoText(info)}\n\n✅ *File ditemukan. Mengirim dokumen...*`)

      const fileName = withExtension(info.file_name, downloadUrl)
      await ctx.sock.sendMessage(ctx.chat, {
        document: { url: downloadUrl },
        fileName,
        mimetype: 'application/octet-stream',
        caption: `📄 *${fileName}*\n📏 ${info.size_from_text || 'Ukuran tidak diketahui'}`
      }, { quoted: ctx.msg })

      await ctx.reply.react('✅')
    } catch (error) {
      logger.error('sfile: gagal mengunduh file', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengunduh file dari SFile.*',
        '',
        `> ${error.message}`,
        '',
        '> Pastikan link publik dan masih aktif.'
      ].join('\n'))
    }
  }
}

export const __test = {
  decodeEntities,
  parseSFileInfo,
  parseFinalDownloadUrl,
  downloadGateHref,
  metaContent,
  withExtension
}
