import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const API = "https://api.rifkyshre.biz.id"
const ROUTE = "/scrape/comix"

function isMangaDexLink(str) {
    return str.includes('mangadex.org/title/') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

async function fetchComix(input) {
    try {
        const res = await fetch(`${API}${ROUTE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://code.rifkyshre.biz.id',
                'Referer': 'https://code.rifkyshre.biz.id/'
            },
            body: JSON.stringify(input)
        })

        const body = await res.json()
        if (!body?.status) {
            return { ok: false, error: body?.error || 'Unknown error', code: body?.code || res.status }
        }

        return { ok: true, data: body.data }
    } catch (e) {
        return { ok: false, error: e.message, code: 500 }
    }
}

export default {
    name: 'mangadex',
    command: ['mangadex', 'comix', 'manga'],
    event: [],
    allow: CHAT.BOTH,
    roleRequired: 10,
    category: 'search',
    description: 'Search manga or get detailed manga info from MangaDex',

    async handle(ctx) {
        const { sock, msg, args, chat } = ctx
        const query = args.join(' ').trim()

        if (!query) {
            return sock.sendMessage(chat, {
                text: `*MangaDex Search*\n\n` +
                      `*Usage:*\n` +
                      `!mangadex <title> (Search)\n` +
                      `!mangadex <url or uuid> (Get Details)\n\n` +
                      `*Example:*\n` +
                      `!mangadex Naruto\n` +
                      `!mangadex https://mangadex.org/title/6b1eb93e-473a-4ab3-9922-1a66d2a29a4a`
            }, { quoted: msg })
        }

        await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

        try {
            let input = {}
            let isDetail = false

            if (isMangaDexLink(query)) {
                isDetail = true
                input = { url: query }
            } else {
                input = { query: query, limit: 5, contentRating: 'safe' } // Limit to 5 for clean WhatsApp UI
            }

            const result = await fetchComix(input)

            if (!result.ok) {
                await sock.sendMessage(chat, { text: `❌ Failed to fetch data: ${result.error}` }, { quoted: msg })
                await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
                return
            }

            const data = result.data

            if (isDetail) {
                const caption = `*${data.title}*\n\n` +
                    `*Status:* ${data.statusManga || 'Unknown'}\n` +
                    `*Rating:* ${data.rating || 'N/A'}\n` +
                    `*Year:* ${data.releaseYear || 'Unknown'}\n` +
                    `*Genres:* ${data.genres?.join(', ') || 'N/A'}\n` +
                    `*Author:* ${data.author?.join(', ') || 'N/A'}\n` +
                    `*Latest Ch.:* ${data.latestChapter || 'N/A'}\n` +
                    `*Latest URL:* ${data.latestChapterUrl || 'N/A'}\n\n` +
                    `*Synopsis:*\n${(data.synopsis || 'No synopsis available.').slice(0, 400)}${(data.synopsis?.length > 400) ? '...' : ''}\n\n` +
                    `*MangaDex:* ${data.url}`

                if (data.thumbnail) {
                    await sock.sendMessage(chat, {
                        image: { url: data.thumbnail },
                        caption: caption
                    }, { quoted: msg })
                } else {
                    await sock.sendMessage(chat, { text: caption }, { quoted: msg })
                }
            } else {
                let message = `*Search Results for "${query}"*\n`
                message += `Found ${data.total || 0} results.\n\n`

                if (!data.items || data.items.length === 0) {
                    message += "No results found."
                } else {
                    for (const m of data.items) {
                        message += `*${m.title}*\n`
                        message += `   Ch. ${m.latestChapter || '?'} [${m.status || '?'}] ${m.rating || '0'}\n`
                        message += `   ${m.url}\n\n`
                    }
                    if (data.hasNext) {
                        message += `_Tip: Use !mangadex <url> to get detailed info and cover art._`
                    }
                }

                await sock.sendMessage(chat, { text: message }, { quoted: msg })
            }

            await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('mangadex error', error)
            await sock.sendMessage(chat, { text: `❌ An unexpected error occurred: ${error.message}` }, { quoted: msg })
            await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        }
    }
}