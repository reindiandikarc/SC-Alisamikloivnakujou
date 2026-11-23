/*
==========================================================
Plugins By © vanXone </> — Alight Motion Menu (HQ UI)
==========================================================
*/

import sharp from 'sharp'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

const THUMB_URL = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1785278261599-24.jpg' // Bisa diganti URL gambar lain
const URL = 'https://api.kyzzz.xyz/'

let handler = async (m, { conn, usedPrefix }) => {
  // Inisialisasi database chat jaga-jaga
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]
  let isAmMode = chat.am_mode

  let statusMode = isAmMode ? "🟢 AKTIF (Bebas Akses)" : "🔴 NONAKTIF (Khusus Premium)"

  const caption = `🎨 *───「 AM PREMIUM MENU 」───* 🎨

📊 *Status AM Mode:* ${statusMode}
📍 *Grup:* ${conn.getName(m.chat)}

Halo kak! Berikut adalah daftar layanan Alight Motion Premium. Jika salah satu server sedang error/gangguan, silakan gunakan server alternatif lainnya di bawah ini:

*🏢 SERVER 1 (Utama)*
 ◦ Kirim Link: \`${usedPrefix}ampremium <email>\`
 ◦ Verifikasi: \`${usedPrefix}amverify <email> | <link>\`

*🏢 SERVER 2 (Direct/Bypass)*
 ◦ Kirim Link: \`${usedPrefix}amprem-send <email>\`
 ◦ Verifikasi: \`${usedPrefix}amprem-verif <email> | <link>\`

*🏢 SERVER 3 (Neonode API)*
 ◦ Kirim Link: \`${usedPrefix}amprem2 <email>\`
 ◦ Verifikasi: \`${usedPrefix}ampverify <link>\`

💡 *Info:*
Jika *AM Mode* sedang **AKTIF**, maka siapapun di grup ini bisa menggunakan fitur di atas secara gratis meskipun bukan user premium di bot!

_Engine System by vanXone </>_`

  const thumb = await getThumbUrl(THUMB_URL)
  const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)
  const invisible = '\u200B'.repeat(400)

  await conn.sendMessage(
    m.chat,
    {
      text: `${URL}${invisible}\n\n${caption}`,
      linkPreview: {
        'matched-text': URL,
        matchedText: URL,
        canonicalUrl: URL,
        title: '「 𝐀𝐥𝐢𝐠𝐡𝐭 𝐌𝐨𝐭𝐢𝐨𝐧 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐕𝐈𝐏 」',
        description: 'Powered by KyzzAPI & vanXone </>',
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: THUMB_URL,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },
      favicon: {
        url: THUMB_URL
      }
    },
    {
      quoted: global.fmeta || m
    }
  )
}

handler.help = ["ammenu"]
handler.tags = ["main"]
handler.command = /^(ammenu|menuam)$/i

export default handler

// ==========================================
// KUMPULAN FUNGSI HELPER UNTUK THUMBNAIL HQ
// ==========================================

async function getThumbUrl(url) {
  try {
    const res = await fetch(url)
    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch {
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    return imageMessage
  } catch {
    return null
  }
}