import * as crypto from 'node:crypto'
import { Buffer } from 'node:buffer'
import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const SIGNING_KEY_HEX = "792525efde6d921d6055a5d62dcebd39c8b5364e99fa87c5adf0e89391266d9c"
const TS_BASELINE = 1773148641059
const API_BASE = "https://api-wh.fastdl.app/api/v1/instagram"
const CORS_PROXY = "https://cors.siputzx.my.id/"

async function callEndpoint(endpoint, body) {
  const ts = Date.now()
  const key = Buffer.from(SIGNING_KEY_HEX, "hex")
  const _s = crypto.createHmac("sha256", key).update(JSON.stringify(body) + ts).digest("hex")
  const payload = { ...body, ts, _ts: TS_BASELINE, _tsc: 0, _sv: 2, _s }

  const res = await fetch(`${CORS_PROXY}${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "origin": "https://fastdl.app",
      "referer": "https://fastdl.app/",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${endpoint} HTTP ${res.status}: ${errText.slice(0, 100)}`)
  }
  return await res.json()
}

function cleanUsername(raw) {
  if (!raw) return null
  return String(raw)
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim()
}

async function stalkInstagram(usernameRaw) {
  const username = cleanUsername(usernameRaw)
  if (!username) throw new Error("Username kosong atau tidak valid")
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Format username tidak valid (hanya alphanumeric, titik, dan underscore)")
  }

  const [profileRes, userInfoRes, storiesRes] = await Promise.all([
    callEndpoint("profile", { username }).catch(e => ({ error: e.message })),
    callEndpoint("userInfo", { username }).catch(e => ({ error: e.message })),
    callEndpoint("stories", { username }).catch(e => ({ error: e.message }))
  ])

  const u = userInfoRes?.result?.[0]?.user || {}
  const p = profileRes?.result || {}
  const stories = Array.isArray(storiesRes?.result) ? storiesRes.result : []

  return {
    username: u.username || p.username || username,
    fullName: u.full_name || p.full_name || null,
    bio: u.biography || p.biography || null,
    isVerified: Boolean(u.is_verified ?? p.is_verified),
    isPrivate: Boolean(u.is_private ?? p.is_private),
    isBusiness: Boolean(u.is_business),
    category: u.category || p.category || null,
    followers: u.follower_count ?? p.follower_count ?? null,
    following: u.following_count ?? p.following_count ?? null,
    postsCount: u.media_count ?? p.media_count ?? null,
    profilePic: u.profile_pic_url || p.profile_pic_url || null,
    profilePicHd: u.hd_profile_pic_url_info?.url || u.profile_pic_url_hd || null,
    externalUrl: u.external_url || p.external_url || null,
    userId: u.id || u.pk || p.id || null,
    activeStoriesCount: stories.length,
    activeStories: stories.slice(0, 5).map(s => ({
      type: s.media_type === 2 ? "video" : "image",
      thumbnail: s.image_versions2?.candidates?.[0]?.url || null,
      videoUrl: s.video_versions?.[0]?.url || null
    }))
  }
}

export default {
  name: 'instagramstalk',
  command: ['instagramstalk', 'igstalk', 'stalkig'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'stalker',
  description: 'Stalk Instagram profile information and active stories',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const input = args.join(' ').trim()

    if (!input) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide an Instagram username or URL!\n\n*Examples:*\n!igstalk cristiano\n!igstalk https://instagram.com/zuck' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

    try {
      const data = await stalkInstagram(input)

      let caption = `*@${data.username}*${data.isVerified ? ' (Verified)' : ''}${data.isPrivate ? ' (Private)' : ''}\n`
      if (data.fullName) caption += `*${data.fullName}*\n`
      if (data.category) caption += `*${data.category}*${data.isBusiness ? ' (Business)' : ''}\n`
      
      caption += `\n*Followers* : ${data.followers?.toLocaleString() ?? '?'}\n`
      caption += `*Following* : ${data.following?.toLocaleString() ?? '?'}\n`
      caption += `*Posts*     : ${data.postsCount?.toLocaleString() ?? '?'}\n`
      caption += `*User ID*   : ${data.userId ?? '?'}\n`
      
      if (data.bio) {
        caption += `\n*Bio:*\n${data.bio.split('\n').map(l => '   ' + l).join('\n')}\n`
      }
      if (data.externalUrl) {
        caption += `\n*Link* : ${data.externalUrl}\n`
      }
      
      caption += `\n*Active Stories* : ${data.activeStoriesCount}`
      if (data.activeStoriesCount > 0) {
        caption += `\n   _(Showing first ${data.activeStories.length} stories)_`
      }

      const imageUrl = data.profilePicHd || data.profilePic

      if (imageUrl) {
        await sock.sendMessage(chat, {
          image: { url: imageUrl },
          caption: caption,
          mentions: data.isPrivate ? [] : [`${data.username}@s.whatsapp.net`] // Optional mention
        }, { quoted: msg })
      } else {
        await sock.sendMessage(chat, { text: caption }, { quoted: msg })
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('instagram stalk error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to stalk profile: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}