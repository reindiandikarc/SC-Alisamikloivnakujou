const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')

const { isSetWelcome, getTextSetWelcome } = require('./setwelcome')
const { isSetLeft, getTextSetLeft } = require('./setleft')
const { renderWelcomeCard } = require('./welcomeCanvas')

const { jidNormalizedUser } = require('@whiskeysockets/baileys')

const loadJsonSafe = (path, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (e) {
    return fallback
  }
}

let set_welcome_db = loadJsonSafe('./database/set_welcome.json', [])
let set_left_db = loadJsonSafe('./database/set_left.json', [])
let setting = loadJsonSafe('./config.json', {})

fs.watchFile('./database/set_welcome.json', () => {
  set_welcome_db = loadJsonSafe('./database/set_welcome.json', [])
})

fs.watchFile('./database/set_left.json', () => {
  set_left_db = loadJsonSafe('./database/set_left.json', [])
})

fs.watchFile('./config.json', () => {
  setting = loadJsonSafe('./config.json', {})
})

// ─────────────────────────────────────────────────────────────────────────────
// Helper: baca gambar lokal dengan fallback null (tidak crash kalau file hilang)
// ─────────────────────────────────────────────────────────────────────────────
function readImageSafe(imgPath) {
  try { return fs.readFileSync(imgPath) } catch (_) { return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: download foto profil jadi Buffer (node-canvas loadImage lebih stabil
// dibaca dari Buffer/local path dibanding fetch URL langsung di beberapa host)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAvatarBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    return Buffer.from(res.data)
  } catch (_) {
    return null
  }
}

module.exports.welcome = async (iswel, isleft, alya, anu) => {
  try {

    const metadata = await alya.groupMetadata(anu.id)
    const participants = anu.participants
    const groupName = metadata.subject
    const memberCount = metadata.participants.length
    const groupDesc = metadata.desc || "-"

    const fallbackImage = "https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg"

    for (let num of participants) {

      const user = jidNormalizedUser(num)

      let pp_user
      try {
        pp_user = await alya.profilePictureUrl(user, 'image')
      } catch {
        pp_user = fallbackImage
      }

      const pushName = num.split('@')[0]

      /* ================= WELCOME ================= */

      if (anu.action === 'add' && (iswel || setting.auto_welcomeMsg)) {

        if (isSetWelcome(anu.id, set_welcome_db)) {

          const get_teks = await getTextSetWelcome(anu.id, set_welcome_db)

          const replaced = get_teks
            .replace(/@user/gi, `@${pushName}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, groupDesc)

          await alya.sendMessage(anu.id, {
            text: replaced,
            mentions: [num]
          })

        } else {

          const welcomeCaption =
`╭─❖ 「 *WELCOME* 」 ❖
│ 👋 Halo @${pushName}
│
│ Selamat datang di
│ *${groupName}*
│
│ 📊 Member ke : ${memberCount}
│
│ Silahkan baca deskripsi grup
│ dan patuhi semua aturan ya!
╰───────────────`

          // ── 1. Coba render banner canvas (avatar bulat + judul WELCOME) ──
          let cardBuffer = null
          try {
            const avatarBuf = (pp_user && pp_user !== fallbackImage)
              ? await fetchAvatarBuffer(pp_user)
              : null
            cardBuffer = await renderWelcomeCard({
              type: 'welcome',
              name: pushName,
              avatarBuffer: avatarBuf,
            })
          } catch (e) {
            console.error('[welcome] Gagal render canvas, fallback ke foto statis:', e.message)
          }

          if (cardBuffer) {
            await alya.sendMessage(anu.id, {
              image: cardBuffer,
              caption: welcomeCaption,
              mentions: [num]
            })
          } else {
            // ── 2. Fallback: foto statis lama (media/welcome_img.jpg) ──
            const welcomeImg = readImageSafe('./media/welcome_img.jpg')
            if (welcomeImg) {
              await alya.sendMessage(anu.id, {
                image: welcomeImg,
                caption: welcomeCaption,
                mentions: [num]
              })
            } else {
              // ── 3. Fallback terakhir: teks biasa ──
              await alya.sendMessage(anu.id, {
                text: welcomeCaption,
                mentions: [num]
              })
            }
          }

        }

      }

      /* ================= LEAVE ================= */

      else if (anu.action === 'remove' && (isleft || setting.auto_leaveMsg)) {

        if (isSetLeft(anu.id, set_left_db)) {

          const get_teks = await getTextSetLeft(anu.id, set_left_db)

          const replaced = get_teks
            .replace(/@user/gi, `@${pushName}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, groupDesc)

          await alya.sendMessage(anu.id, {
            text: replaced,
            mentions: [num]
          })

        } else {

          const leftCaption =
`╭─❖ 「 *GOODBYE* 」 ❖
│ 👋 Sampai jumpa
│ @${pushName}
│
│ Terima kasih sudah
│ pernah berada di
│ *${groupName}*
╰───────────────`

          // ── 1. Coba render banner canvas (avatar bulat + judul GOOD BYE) ──
          let cardBuffer = null
          try {
            const avatarBuf = (pp_user && pp_user !== fallbackImage)
              ? await fetchAvatarBuffer(pp_user)
              : null
            cardBuffer = await renderWelcomeCard({
              type: 'left',
              name: pushName,
              avatarBuffer: avatarBuf,
            })
          } catch (e) {
            console.error('[left] Gagal render canvas, fallback ke foto statis:', e.message)
          }

          if (cardBuffer) {
            await alya.sendMessage(anu.id, {
              image: cardBuffer,
              caption: leftCaption,
              mentions: [num]
            })
          } else {
            // ── 2. Fallback: foto statis lama (media/welcome_img.jpg) ──
            const leftImg = readImageSafe('./media/welcome_img.jpg')
            if (leftImg) {
              await alya.sendMessage(anu.id, {
                image: leftImg,
                caption: leftCaption,
                mentions: [num]
              })
            } else {
              // ── 3. Fallback terakhir: teks biasa ──
              await alya.sendMessage(anu.id, {
                text: leftCaption,
                mentions: [num]
              })
            }
          }

        }

      }

      /* ================= PROMOTE ================= */

      else if (anu.action === 'promote') {

        await alya.sendMessage(anu.id, {
          text:
`🎉 *PROMOTE MEMBER*

Selamat kepada
@${pushName}

Sekarang kamu menjadi
*ADMIN* di grup

*${groupName}*`,
          mentions: [num]
        })

      }

      /* ================= DEMOTE ================= */

      else if (anu.action === 'demote') {

        await alya.sendMessage(anu.id, {
          text:
`⚠️ *STATUS MEMBER*

@${pushName}
sekarang kembali menjadi
*MEMBER*

di grup
*${groupName}*`,
          mentions: [num]
        })

      }

    }

  } catch (err) {
    console.error(err)
  }
}
