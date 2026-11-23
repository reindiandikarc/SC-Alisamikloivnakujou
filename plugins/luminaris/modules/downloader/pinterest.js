import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

async function getSession() {
    const res = await fetch("https://id.pinterest.com/", {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "accept-language": "en-US,en;q=0.9"
        }
    })
    const raw = res.headers.getSetCookie?.() || []
    const cookies = raw.map(c => c.split(";")[0]).join("; ")
    const csrf = raw.find(c => c.startsWith("csrftoken="))?.match(/csrftoken=([^;]+)/)?.[1] || ""
    return { cookies, csrf }
}

async function pinterestSearch(query, options = {}) {
    const { limit = 5, scope = "pins", bookmark = null } = options
    const session = await getSession()

    const data = {
        options: {
            query,
            scope,
            page_size: limit,
            refine_search_with_filters: true,
            ...(bookmark ? { bookmarks: [bookmark] } : {})
        },
        context: {}
    }

    const sourceUrl = `/search/${scope}/?q=${encodeURIComponent(query)}`
    const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=${encodeURIComponent(sourceUrl)}&data=${encodeURIComponent(JSON.stringify(data))}&_=${Date.now()}`

    const res = await fetch(url, {
        headers: {
            "accept": "application/json, text/javascript, */*, q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",
            "referer": `https://id.pinterest.com${sourceUrl}`,
            "x-requested-with": "XMLHttpRequest",
            "x-app-version": "6d51d5a",
            "x-pinterest-appstate": "active",
            "x-pinterest-pws-handler": "www/search/[scope].js",
            "x-pinterest-source-url": sourceUrl,
            ...(session.csrf ? { "x-csrftoken": session.csrf } : {}),
            ...(session.cookies ? { "cookie": session.cookies } : {})
        }
    })

    if (!res.ok) return { results: [], bookmark: null, error: `HTTP ${res.status}` }

    const json = await res.json().catch(() => null)
    const payload = json?.resource_response?.data
    if (!payload) return { results: [], bookmark: null, error: "no data" }

    const arr = Array.isArray(payload) ? payload : payload.results || []

    const mapPin = (pin) => ({
        title: pin.title || pin.grid_title || "",
        image: pin.images?.orig?.url || pin.images?.["736x"]?.url || null,
        video: pin.videos?.video_list?.V_HLSV4?.url
            || pin.videos?.video_list?.V_EXP7?.url
            || pin.videos?.video_list?.V_720P?.url
            || null,
        username: pin.pinner?.username || null,
        fullName: pin.pinner?.full_name || null,
        pinUrl: `https://id.pinterest.com/pin/${pin.id}/`
    })

    return {
        query,
        count: arr.length,
        bookmark: payload.bookmark || null,
        results: arr.filter(x => x?.id).map(mapPin)
    }
}

export default {
    name: 'pinterest',
    command: ['pinterest', 'pin', 'pint'],
    event: [],
    allow: CHAT.BOTH,
    roleRequired: 10,
    category: 'tools',
    description: 'Search Pinterest for images and videos',

    async handle(ctx) {
        const { sock, msg, args, chat } = ctx
        const query = args.join(' ').trim()

        if (!query) {
            return sock.sendMessage(chat, { 
                text: '❌ Please provide a search query.\n\n*Example:*\n!pinterest anime aesthetic\n!pinterest logo design' 
            }, { quoted: msg })
        }

        await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

        try {
            const result = await pinterestSearch(query, { limit: 10 })

            if (!result.results || result.results.length === 0) {
                await sock.sendMessage(chat, { 
                    text: `❌ No results found for "${query}".` 
                }, { quoted: msg })
                await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
                return
            }

            for (let i = 0; i < Math.min(5, result.results.length); i++) {
                const pin = result.results[i]
                
                try {
                    if (pin.video) {
                        await sock.sendMessage(chat, {
                            video: { url: pin.video },
                            mimetype: 'video/mp4',
                            caption: `*${pin.title || 'Pinterest Video'}*\nby @${pin.username || 'Unknown'}\n${pin.pinUrl}`
                        }, { quoted: msg })
                    } else if (pin.image) {
                        await sock.sendMessage(chat, {
                            image: { url: pin.image },
                            mimetype: 'image/jpeg',
                            caption: `*${pin.title || 'Pinterest Image'}*\nby @${pin.username || 'Unknown'}\n${pin.pinUrl}`
                        }, { quoted: msg })
                    }
                } catch (err) {
                    logger.error(`Failed to send Pinterest media ${i}`, err)
                }
                
                if (i < Math.min(5, result.results.length) - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }

            let message = `\n*Pinterest Search Results*\n`
            message += ` Query: *${query}*\n`
            message += `Found: *${result.count}* results\n\n`
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`

            result.results.forEach((pin, index) => {
                const type = pin.video ? 'Video' : 'Image'
                message += `${index + 1}. ${type} *${pin.title || 'Untitled'}*\n`
                if (pin.username) message += `   @${pin.username}\n`
                message += `   ${pin.pinUrl}\n\n`
            })

            message += `━━━━━━━━━━━━━━━━━━━━\n\n`
            message += ` *Tip:* Use *!pindl <url>* to download media`

            await sock.sendMessage(chat, { text: message }, { quoted: msg })

            if (result.bookmark) {
                await sock.sendMessage(chat, { 
                    text: `_More pages available. Search again for next results._` 
                }, { quoted: msg })
            }

            await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('pinterest search error', error)
            await sock.sendMessage(chat, { 
                text: `❌ An unexpected error occurred: ${error.message}` 
            }, { quoted: msg })
            await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        }
    }
}