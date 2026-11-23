import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

async function stalkTikTok(username) {
    username = username.replace(/^@/, "").trim()
    if (!username) return null

    const html = await fetch(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
        headers: {
            "authority": "www.tiktok.com",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "Android",
            "user-agent": "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
        }
    }).then(a => a.text())

    const match =
        html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/) ||
        html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/)
    
    if (!match) return null

    try {
        const json = JSON.parse(match[1])
        const scope = json.__DEFAULT_SCOPE__ || json.DEFAULT_SCOPE
        const detail = scope?.["webapp.user-detail"] || scope?.["webapp.reflow.profile.initial"]
        const userInfo = detail?.userInfo

        let u, s
        if (userInfo?.user) {
            u = userInfo.user
            s = userInfo.stats || userInfo.statsV2 || {}
        } else if (json.UserModule?.users) {
            const id = Object.keys(json.UserModule.users)[0]
            u = json.UserModule.users[id]
            s = json.UserModule.stats?.[id] || {}
        } else {
            return null
        }

        return {
            username: u.uniqueId || username,
            nickname: u.nickname || "",
            verified: !!u.verified,
            privateAccount: !!u.privateAccount,
            language: u.language || null,
            signature: u.signature || "",
            avatar: u.avatarLarger || u.avatarMedium || u.avatarThumb || null,
            stats: {
                followers: Number(s.followerCount) || 0,
                following: Number(s.followingCount) || 0,
                hearts: Number(s.heartCount ?? s.heart) || 0,
                videos: Number(s.videoCount) || 0
            },
            profileUrl: `https://www.tiktok.com/@${u.uniqueId || username}`
        }
    } catch (e) {
        return null
    }
}

export default {
    name: 'tiktokstalk',
    command: ['tiktokstalk', 'ttstalk', 'stalktt'],
    event: [],
    allow: CHAT.BOTH,
    roleRequired: 10,
    category: 'stalker',
    description: 'Stalk TikTok user profile information and statistics',

    async handle(ctx) {
        const { sock, msg, args, chat } = ctx
        const username = args.join(' ').trim()

        if (!username) {
            return sock.sendMessage(chat, { 
                text: '❌ Please provide a TikTok username.\n\n*Example:*\n!tiktokstalk rifkyshre' 
            }, { quoted: msg })
        }

        await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

        try {
            const data = await stalkTikTok(username)

            if (!data) {
                await sock.sendMessage(chat, { text: '❌ User not found, invalid username, or account is private.' }, { quoted: msg })
                await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
                return
            }

            const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)

            let message = `*TikTok Profile Stalker*\n\n`
            message += `*Nickname:* ${data.nickname}\n`
            message += `*Username:* @${data.username}\n`
            message += `*Verified:* ${data.verified ? 'Yes' : 'No'}\n`
            message += `*Private:* ${data.privateAccount ? 'Yes' : 'No'}\n`
            message += `*Language:* ${data.language || 'Unknown'}\n\n`
            
            message += `*Statistics:*\n`
            message += `   • Followers: ${formatNumber(data.stats.followers)}\n`
            message += `   • Following: ${formatNumber(data.stats.following)}\n`
            message += `   • Hearts: ${formatNumber(data.stats.hearts)}\n`
            message += `   • Videos: ${formatNumber(data.stats.videos)}\n\n`

            if (data.signature) {
                message += `*Bio:*\n${data.signature}\n\n`
            }

            message += `*Profile:* ${data.profileUrl}`

            // Send as image with caption if avatar exists, otherwise plain text
            if (data.avatar) {
                await sock.sendMessage(chat, {
                    image: { url: data.avatar },
                    caption: message
                }, { quoted: msg })
            } else {
                await sock.sendMessage(chat, { text: message }, { quoted: msg })
            }

            await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('tiktokstalk error', error)
            await sock.sendMessage(chat, { text: `❌ Failed to stalk user: ${error.message}` }, { quoted: msg })
            await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        }
    }
}