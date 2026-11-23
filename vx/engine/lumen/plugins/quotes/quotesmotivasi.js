/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import sharp from 'sharp'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

const URL = 'https://github.com/hamm-r'
const THUMB_URL = "https://raw.githubusercontent.com/hamm-r/uploader/main/1783126493162-298.jpg"

let handler = async (m, { conn, sock }) => {
    const list = [
        "ᴊᴀɴɢᴀɴ ʙɪᴄᴀʀᴀ, ʙᴇʀᴛɪɴᴅᴀᴋ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴋᴀᴛᴀᴋᴀɴ, ᴛᴜɴᴊᴜᴋᴋᴀɴ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴊᴀɴᴊɪ, ʙᴜᴋᴛɪᴋᴀɴ ꜱᴀᴊᴀ.",
        "ᴊᴀɴɢᴀɴ ᴘᴇʀɴᴀʜ ʙᴇʀʜᴇɴᴛɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ ʏᴀɴɢ ᴛᴇʀʙᴀɪᴋ ʜᴀɴʏᴀ ᴋᴀʀᴇɴᴀ ꜱᴇꜱᴇᴏʀᴀɴɢ ᴛɪᴅᴀᴋ ᴍᴇᴍʙᴇʀɪ ᴀɴᴅᴀ ᴘᴇɴɢʜᴀʀɢᴀᴀɴ.",
        "ʙᴇᴋᴇʀᴊᴀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ᴛɪᴅᴜʀ. ʙᴇʟᴀᴊᴀʀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ʙᴇʀᴘᴇꜱᴛᴀ. ʜᴇᴍᴀᴛ ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴍᴇʀᴇᴋᴀ ᴍᴇɴɢʜᴀʙɪꜱᴋᴀɴ. ʜɪᴅᴜᴘʟᴀʜ ꜱᴇᴘᴇʀᴛɪ ᴍɪᴍᴘɪ ᴍᴇʀᴇᴋᴀ.",
        "ᴋᴜɴᴄɪ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴀᴅᴀʟᴀʜ ᴍᴇᴍᴜꜱᴀᴛᴋᴀɴ ᴘɪᴋɪʀᴀɴ ꜱᴀᴅᴀʀ ᴋɪᴛᴀ ᴘᴀᴅᴀ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ɪɴɢɪɴᴋᴀɴ, ʙᴜᴋᴀɴ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ᴛᴀᴋᴜᴛɪ.",
        "ᴊᴀɴɢᴀɴ ᴛᴀᴋᴜᴛ ɢᴀɢᴀʟ. ᴛᴀᴋᴜᴛʟᴀʜ ʙᴇʀᴀᴅᴀ ᴅɪ ᴛᴇᴍᴘᴀᴛ ʏᴀɴɢ ꜱᴀᴍᴀ ᴛᴀʜᴜɴ ᴅᴇᴘᴀɴ ꜱᴇᴘᴇʀᴛɪ ꜱᴇᴋᴀʀᴀɴɢ.",
        "ꜱᴇᴛɪᴀᴘ ʜᴀʀɪ ᴀᴅᴀʟᴀʜ ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ ʙᴀʀᴜ ᴜɴᴛᴜᴋ ᴍᴇɴᴊᴀᴅɪ ᴠᴇʀꜱɪ ᴛᴇʀʙᴀɪᴋ ᴅᴀʀɪ ᴅɪʀɪᴍᴜ.",
        "ᴅɪꜱɪᴘʟɪɴ ᴀᴅᴀʟᴀʜ ᴊᴇᴍʙᴀᴛᴀɴ ᴀɴᴛᴀʀᴀ ᴛᴜᴊᴜᴀɴ ᴅᴀɴ ᴘᴇɴᴄᴀᴘᴀɪᴀɴ.",
        "ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴛɪᴅᴀᴋ ᴅᴀᴛᴀɴɢ ᴋᴇᴘᴀᴅᴀ ᴍᴇʀᴇᴋᴀ ʏᴀɴɢ ᴍᴇɴᴜɴɢɢᴜ, ᴛᴇᴛᴀᴘɪ ᴋᴇᴘᴀᴅᴀ ᴍᴇʀᴇᴋᴀ ʏᴀɴɢ ʙᴇʀᴊᴜᴀɴɢ.",
        "ʀᴀꜱᴀ ꜱᴀᴋɪᴛ ᴋᴀʀᴇɴᴀ ᴅɪꜱɪᴘʟɪɴ ᴊᴀᴜʜ ʟᴇʙɪʜ ʀɪɴɢᴀɴ ᴅᴀʀɪᴘᴀᴅᴀ ʀᴀꜱᴀ ꜱᴀᴋɪᴛ ᴋᴀʀᴇɴᴀ ᴘᴇɴʏᴇꜱᴀʟᴀɴ.",
        "ᴊɪᴋᴀ ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ᴍᴇᴍʙᴀɴɢᴜɴ ᴍɪᴍᴘɪᴍᴜ, ᴏʀᴀɴɢ ʟᴀɪɴ ᴀᴋᴀɴ ᴍᴇɴʏᴇᴡᴀᴍᴜ ᴜɴᴛᴜᴋ ᴍᴇᴍʙᴀɴɢᴜɴ ᴍɪᴍᴘɪ ᴍᴇʀᴇᴋᴀ.",
        "Keringat yang kamu keluarkan hari ini adalah bukti perjuangan untuk masa depan yang lebih cerah.",
        "Jangan biarkan hari kemarin menghabiskan terlalu banyak waktu hari ini.",
        "Masa depan dimiliki oleh mereka yang percaya pada keindahan mimpi-mimpi mereka.",
        "Satu-satunya batasan untuk meraih mimpi kita adalah keragu-raguan kita hari ini.",
        "Jatuh tujuh kali, bangkit delapan kali. Pantang menyerah sebelum tujuan tercapai.",
        "Ketika kamu merasa ingin menyerah, ingatlah kembali alasan mengapa kamu memulainya.",
        "Fokuslah pada kemajuan, sekecil apapun itu, bukan pada kesempurnaan.",
        "Keberanian bukanlah ketiadaan rasa takut, melainkan kemampuan untuk terus melangkah meski takut.",
        "Kerja keras mengalahkan bakat ketika bakat tidak mau bekerja keras.",
        "Impian besar tidak pernah terwujud dari zona nyaman yang sempit.",
        "Setiap ahli dulunya adalah seorang pemula yang tidak pernah berhenti berlatih.",
        "Batu karang yang kokoh terbentuk dari deburan ombak yang tak henti-hentinya.",
        "Jangan takut berjalan lambat, takutlah jika kamu hanya berdiam diri.",
        "Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang.",
        "Kesuksesan berawal dari langkah pertama yang berani dan konsistensi yang terjaga.",
        "Kegagalan hanyalah kesempatan untuk memulai lagi dengan lebih cerdas.",
        "Tantangan adalah apa yang membuat hidup menarik, dan mengatasinya adalah apa yang membuat hidup bermakna.",
        "Masa sulit tidak bertahan selamanya, tetapi orang yang tangguh akan selalu bertahan.",
        "Percayalah pada prosesmu; mutiara berharga butuh waktu dan tekanan untuk tercipta indah.",
        "Jadilah pribadi yang lebih baik dari dirimu yang kemarin, bukan dari orang lain."
    ]

    const quote = list[Math.floor(Math.random() * list.length)]
    const client = conn || sock
    const thumb = await getThumbUrl(THUMB_URL)
    const highQualityThumbnail = await createHighQualityThumbnail(client, thumb)
    const invisible = '\u200B'.repeat(400)
    const caption = `乂  *M O T I V A T I O N*\n\n"${quote}"`

    await client.sendMessage(
        m.chat,
        {
            text: `${URL}${invisible}\n\n${caption}`,
            linkPreview: {
                'matched-text': URL,
                matchedText: URL,
                canonicalUrl: URL,
                title: "「 𝐐𝐔𝐎𝐓𝐄𝐒 𝐌𝐎𝐓𝐈𝐕𝐀𝐒𝐈 」",
                description: "Boost your spirits and keep moving forward",
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
        { quoted: global.fmeta || m }
    )
}

handler.help = ["quotesmotivasi"]
handler.tags = ["quotes"]
handler.command = /^(quotesmotivasi|motivasi)$/i
handler.register = true
handler.limit = true

export default handler

let cachedThumb = null
async function getThumbUrl(url) {
  if (cachedThumb) return cachedThumb
  try {
    const res = await fetch(url)
    const raw = Buffer.from(await res.arrayBuffer())

    cachedThumb = await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()
    return cachedThumb
  } catch {
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb || !thumb.length) return null

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
