import { CHAT, logger, sendError, sessionManager, extractMedia } from '../../_runtime/core-shim.js'
import sharp from 'sharp'
import { buildPdf, PAGE_SIZE_NAMES } from './lib/pdf.js'
import { MAX_BYTES } from './lib/formats.js'

const NS = 'topdf'
const TIMEOUT = 10 * 60 * 1000 // 10 menit
const MAX_PAGES = 20
const MAX_PAGES_DIM = 20000

// ─── MEDIA ───────────────────────────────────────────────────

async function toJpeg(buffer) {
  const out = await sharp(buffer, { animated: false })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .toBuffer({ resolveWithObject: true })
  return { data: out.data, width: out.info.width, height: out.info.height }
}

/** Media apa pun pada pesan/reply; `collect()` yang menyaring hanya gambar. */
function mediaSource(msg) {
  const m = msg?.message || {}
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage
  return (
    m.imageMessage ||
    m.videoMessage ||
    m.audioMessage ||
    m.pttMessage ||
    m.stickerMessage ||
    m.documentMessage ||
    quoted?.imageMessage ||
    quoted?.videoMessage ||
    quoted?.audioMessage ||
    quoted?.pttMessage ||
    quoted?.stickerMessage ||
    quoted?.documentMessage ||
    null
  )
}

function hasMedia(msg) {
  return Boolean(mediaSource(msg))
}

function mediaLabel(msg) {
  const m = msg?.message || {}
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage
  const isSticker = Boolean(m.stickerMessage || quoted?.stickerMessage)
  const source = mediaSource(msg)

  if (isSticker) return 'sticker'
  if (source?.fileName) {
    return String(source.fileName).replace(/[`\r\n]/g, '').slice(0, 40) || 'gambar'
  }
  if (source?.mimetype?.startsWith('image/')) {
    const ext = source.mimetype.split('/')[1]?.split(';')[0]
    return ext ? `gambar.${ext === 'jpeg' ? 'jpg' : ext}` : 'gambar'
  }
  return 'gambar'
}

// ─── UKURAN ──────────────────────────────────────────────────

function parsePageSize(arg) {
  const raw = String(arg || '').trim().toLowerCase()
  if (!raw) return null
  if (PAGE_SIZE_NAMES.includes(raw)) return { size: raw }

  const custom = /^(\d{2,5})x(\d{2,5})$/.exec(raw)
  if (!custom) return null
  return { width: Number(custom[1]), height: Number(custom[2]) }
}

function sizeLabel(opts) {
  if (opts?.size) return opts.size.toUpperCase()
  return `${opts?.width}×${opts?.height}`
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// ─── SESI ────────────────────────────────────────────────────
// Namespace sendiri supaya sesi topdf tidak bentrok dengan game/quiz.
// Timer diperpanjang setiap kali halaman ditambah/dihapus.

function createSession(chat, sender, opts) {
  return sessionManager.createSession(NS, chat, sender, {
    status: 'collecting',
    items: [],
    opts,
    nextId: 1
  }, TIMEOUT)
}

function armTimeout(session, sock, chat) {
  // Jangan hidupkan lagi sesi yang sudah dibatalkan modul lain selama
  // proses async (mis. unduh gambar) berjalan.
  if (sessionManager.getSession(NS, chat, session.sender) !== session) return

  if (session.timer) clearTimeout(session.timer)
  session.endTime = Date.now() + TIMEOUT
  sessionManager.setSession(NS, chat, session)
  sessionManager.setSessionTimer(NS, chat, async () => {
    try {
      await sock.sendMessage(chat, {
        text: `⏱️ Sesi *topdf* berakhir. \`${session.items.length}\` halaman dibuang.`
      })
    } catch (error) {
      logger.debug(`[topdf] notifikasi timeout gagal: ${error?.message || error}`)
    }
  }, session.sender)
}

function remaining(session) {
  const seconds = Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))
  if (seconds < 60) return `${seconds} detik`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

// ─── TEKS ────────────────────────────────────────────────────

function usageText(prefix) {
  return [
    '*⌁ TOPDF*',
    'Gabungkan beberapa gambar menjadi satu PDF.',
    '',
    '*Mulai sesi*',
    `▸ \`${prefix}topdf\`  sesi kosong`,
    `▸ \`${prefix}topdf\` + gambar/reply  sesi + halaman pertama`,
    `▸ \`${prefix}topdf a4\`  ukuran: \`a4\` · \`letter\` · \`legal\` · \`800x1200\``,
    '',
    '*Di dalam sesi*',
    `▸ \`${prefix}topdf add\`  tambah gambar (kirim/reply media)`,
    `▸ \`${prefix}topdf remove <n|all>\`  hapus halaman`,
    `▸ \`${prefix}topdf list\`  lihat daftar halaman`,
    `▸ \`${prefix}topdf confirm\`  buat PDF`,
    `▸ \`${prefix}topdf cancel\`  batalkan sesi`,
    '',
    `_Sesi berakhir otomatis setelah \`${TIMEOUT / 60000}\` menit._`
  ].join('\n')
}

function listText(session, prefix) {
  const lines = [
    '*⌁ TOPDF · DAFTAR HALAMAN*',
    `▸ *Total*  \`${session.items.length}/${MAX_PAGES}\``,
    `▸ *Ukuran*  \`${sizeLabel(session.opts)}\``,
    `▸ *Sisa waktu*  \`${remaining(session)}\``,
    ''
  ]

  if (!session.items.length) {
    lines.push('_Belum ada halaman._', '', `Tambah dengan \`${prefix}topdf add\`.`)
    return lines.join('\n')
  }

  for (const [i, item] of session.items.entries()) {
    lines.push(
      `\`${String(i + 1).padStart(2, '0')}\`  *${item.label}*  _${item.width}×${item.height}_`
    )
  }

  lines.push(
    '',
    `_Hapus: \`${prefix}topdf remove <n>\` · Buat: \`${prefix}topdf confirm\`_`
  )
  return lines.join('\n')
}

function startedText(session, prefix, result, replaced = false) {
  const lines = [
    '*⌁ TOPDF · SESI DIMULAI*',
    '',
    `▸ *Halaman*  \`${session.items.length}/${MAX_PAGES}\``,
    `▸ *Ukuran*  \`${sizeLabel(session.opts)}\``,
    `▸ *Batas*  \`${TIMEOUT / 60000}\` menit`
  ]

  if (replaced) lines.push('▸ *Sesi lama*  `dibatalkan`')

  if (result?.ok) {
    lines.push(
      `▸ *Ditambahkan*  \`${result.item.label}\` · \`${result.item.width}×${result.item.height}\``
    )
  } else if (result?.error) {
    lines.push(`✕ *Gagal menambah media*  ${result.error}`)
  }

  lines.push(
    '',
    '*Perintah sesi*',
    `▸ \`${prefix}topdf add\`  tambah gambar`,
    `▸ \`${prefix}topdf remove <n|all>\`  hapus halaman`,
    `▸ \`${prefix}topdf list\`  lihat halaman`,
    `▸ \`${prefix}topdf confirm\`  buat PDF`,
    `▸ \`${prefix}topdf cancel\`  batalkan`,
    '',
    session.items.length
      ? `_Ketik \`${prefix}topdf confirm\` untuk membuat PDF._`
      : `_Kirim/reply gambar lalu ketik \`${prefix}topdf add\`._`
  )

  return lines.join('\n')
}

// ─── AKSI ────────────────────────────────────────────────────

async function noSession(sock, chat, msg, prefix) {
  return sock.sendMessage(chat, {
    text: [
      '✕ *Tidak ada sesi topdf aktif.*',
      '',
      `Mulai dengan \`${prefix}topdf\` atau \`${prefix}topdf\` + gambar.`,
      `Bantuan: \`${prefix}topdf help\``
    ].join('\n')
  }, { quoted: msg })
}

/**
 * Ambil media dari pesan/reply, konversi ke halaman JPEG, lalu simpan di sesi.
 * `announce: false` dipakai saat memulai sesi — hasilnya dilaporkan lewat
 * pesan "sesi dimulai" supaya tidak ada dua balasan beruntun.
 */
async function collect({ sock, chat, msg, session, prefix, announce = true }) {
  const source = mediaSource(msg)

  if (!source) {
    if (announce) {
      await sock.sendMessage(chat, {
        text: [
          '⚠️ *Tidak ada gambar pada pesan ini.*',
          '',
          `Kirim gambar dengan caption \`${prefix}topdf add\`, atau reply gambar dengan \`${prefix}topdf add\`.`
        ].join('\n')
      }, { quoted: msg })
    }
    return { ok: false, error: 'Tidak ada media pada pesan ini.' }
  }

  if (session.items.length >= MAX_PAGES) {
    const error = `Batas ${MAX_PAGES} halaman sudah tercapai. Buat PDF dulu dengan ${prefix}topdf confirm.`
    if (announce) {
      await sock.sendMessage(chat, { text: `✕ ${error}` }, { quoted: msg })
    }
    return { ok: false, error }
  }

  if (/^(video|audio)\/|^application\/pdf$/i.test(source.mimetype || '')) {
    const error = 'Media harus berupa gambar, bukan video/audio/PDF.'
    if (announce) {
      await sock.sendMessage(chat, { text: `✕ ${error}` }, { quoted: msg })
    }
    return { ok: false, error }
  }

  try {
    const used = session.items.reduce((sum, item) => sum + (item.bytes || 0), 0)
    const { buffer } = await extractMedia(msg, chat)
    if (!buffer?.length) throw new Error('Media gagal diunduh.')
    if (used + buffer.length > MAX_BYTES) {
      throw new Error(`Total melebihi batas ${formatSize(MAX_BYTES)}.`)
    }

    const page = await toJpeg(buffer)
    if (page.width > MAX_PAGES_DIM || page.height > MAX_PAGES_DIM) {
      throw new Error('Resolusi gambar terlalu besar untuk PDF.')
    }

    // Sesi bisa saja dibatalkan modul lain selama unduh/konversi berjalan.
    if (sessionManager.getSession(NS, chat, session.sender) !== session) {
      return { ok: false, error: 'Sesi sudah dibatalkan.' }
    }

    const item = {
      id: session.nextId++,
      label: mediaLabel(msg),
      data: page.data,
      width: page.width,
      height: page.height,
      bytes: buffer.length
    }
    session.items.push(item)
    armTimeout(session, sock, chat)

    if (announce) {
      await sock.sendMessage(chat, {
        text: [
          `✓ *Halaman ${session.items.length} ditambahkan*`,
          `▸ \`${item.label}\` · \`${item.width}×${item.height}\``,
          '',
          `_Total \`${session.items.length}/${MAX_PAGES}\` halaman · ukuran \`${sizeLabel(session.opts)}\`_`,
          `_Ketik \`${prefix}topdf list\` atau \`${prefix}topdf confirm\`._`
        ].join('\n')
      }, { quoted: msg })
    }

    return { ok: true, item }
  } catch (error) {
    logger.warn(`[topdf] gagal menambah media: ${error?.message || error}`)
    if (announce) {
      await sock.sendMessage(chat, {
        text: `✕ Gagal menambah media: ${error?.message || error}`
      }, { quoted: msg })
    }
    return { ok: false, error: error?.message || String(error) }
  }
}

async function removePage({ sock, chat, msg, session, prefix, raw }) {
  const target = String(raw || '').trim().toLowerCase()

  if (!target) {
    return sock.sendMessage(chat, {
      text: [
        '*⌁ TOPDF · HAPUS HALAMAN*',
        `▸ \`${prefix}topdf remove <n>\`  hapus satu halaman`,
        `▸ \`${prefix}topdf remove all\`  hapus semua`,
        '',
        listText(session, prefix)
      ].join('\n')
    }, { quoted: msg })
  }

  if (target === 'all' || target === 'semua') {
    session.items = []
    armTimeout(session, sock, chat)
    return sock.sendMessage(chat, {
      text: `✓ Semua halaman dihapus. Tambah lagi dengan \`${prefix}topdf add\`.`
    }, { quoted: msg })
  }

  const index = Number.parseInt(target, 10)
  if (!Number.isInteger(index) || index < 1 || index > session.items.length) {
    return sock.sendMessage(chat, {
      text: `✕ Nomor \`${target}\` tidak valid. Lihat \`${prefix}topdf list\`.`
    }, { quoted: msg })
  }

  const [removed] = session.items.splice(index - 1, 1)
  armTimeout(session, sock, chat)
  return sock.sendMessage(chat, {
    text: [
      `✓ Halaman \`${index}\` dihapus  \`${removed.label}\``,
      `_Sisa \`${session.items.length}\` halaman._`
    ].join('\n')
  }, { quoted: msg })
}

async function confirm({ sock, chat, msg, session, prefix }) {
  if (!session.items.length) {
    return sock.sendMessage(chat, {
      text: `✕ Belum ada halaman. Tambah dengan \`${prefix}topdf add\`.`
    }, { quoted: msg })
  }

  try {
    const pages = session.items.map(({ data, width, height }) => ({ data, width, height }))
    const pdf = buildPdf(pages, session.opts)
    const count = pages.length

    await sock.sendMessage(chat, {
      document: pdf,
      mimetype: 'application/pdf',
      fileName: count === 1 ? 'gambar.pdf' : 'topdf.pdf',
      caption: [
        '*⌁ TOPDF · SELESAI*',
        `▸ *Halaman*  \`${count}\``,
        `▸ *Ukuran*  \`${sizeLabel(session.opts)}\``,
        `▸ *File*  \`${formatSize(pdf.length)}\``
      ].join('\n'),
      quoted: msg
    })

    // Hanya akhiri sesi ini jika belum digantikan modul lain selama kirim.
    if (sessionManager.getSession(NS, chat, session.sender) === session) {
      sessionManager.endSession(NS, chat, session.sender)
    }
    logger.info(`[topdf] ${count} halaman, ${pdf.length} byte`)
  } catch (error) {
    logger.error('[topdf] gagal membuat PDF', error)
    await sendError(sock, chat, msg, error, { module: 'converter/topdf', command: 'topdf' })
  }
}

// ─── PLUGIN ──────────────────────────────────────────────────

export default {
  name: 'topdf',
  command: ['topdf', 'img2pdf', 'imagepdf', 'gambartopdf'],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Convert images into one PDF (session: add, remove, list, confirm)',

  async handle(ctx) {
    const { sock, chat, msg, args = [], sender, prefix = '!' } = ctx
    const sub = String(args[0] || '').trim().toLowerCase()

    if (sub === 'help' || sub === 'cara' || sub === 'usage') {
      return sock.sendMessage(chat, { text: usageText(prefix) }, { quoted: msg })
    }

    const session = sessionManager.getSession(NS, chat, sender)

    if (sub === 'cancel' || sub === 'batal') {
      if (!session) return noSession(sock, chat, msg, prefix)
      sessionManager.endSession(NS, chat, sender)
      return sock.sendMessage(chat, {
        text: `✓ Sesi *topdf* dibatalkan. \`${session.items.length}\` halaman dibuang.`
      }, { quoted: msg })
    }

    if (sub === 'add' || sub === 'tambah') {
      if (!session) return noSession(sock, chat, msg, prefix)
      return collect({ sock, chat, msg, session, prefix, announce: true })
    }

    if (sub === 'remove' || sub === 'rm' || sub === 'delete' || sub === 'del' || sub === 'hapus') {
      if (!session) return noSession(sock, chat, msg, prefix)
      return removePage({ sock, chat, msg, session, prefix, raw: args[1] })
    }

    if (sub === 'list' || sub === 'ls' || sub === 'daftar') {
      if (!session) return noSession(sock, chat, msg, prefix)
      return sock.sendMessage(chat, { text: listText(session, prefix) }, { quoted: msg })
    }

    if (sub === 'confirm' || sub === 'done' || sub === 'selesai' || sub === 'buat') {
      if (!session) return noSession(sock, chat, msg, prefix)
      return confirm({ sock, chat, msg, session, prefix })
    }

    // ── Mulai sesi baru ──
    // createSession() otomatis membatalkan sesi lama user ini, termasuk
    // sesi dari modul lain (satu user = satu sesi).
    const replaced = Boolean(session)
    const opts = parsePageSize(sub) || { size: 'a4' }
    const created = createSession(chat, sender, opts)
    armTimeout(created, sock, chat)

    const added = hasMedia(msg)
      ? await collect({ sock, chat, msg, session: created, prefix, announce: false })
      : null

    return sock.sendMessage(chat, {
      text: startedText(created, prefix, added, replaced)
    }, { quoted: msg })
  }
}
