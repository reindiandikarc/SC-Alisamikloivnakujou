import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

async function getStickerLyPack(url, needRelation = true) {
    const stickerId = url.match(/sticker\.ly\/s\/([A-Z0-9]+)/i) || url.match(/sticker\.ly\/([A-Z0-9]+)/i);    
    if (!stickerId) {
        throw new Error('Invalid sticker.ly URL. Could not extract ID.');
    }
    
    try {
        const response = await fetch(`https://api.sticker.ly/v4/stickerPack/${stickerId[1]}?needRelation=${needRelation}`, {
            headers: {
                'User-Agent': 'androidapp.stickerly/3.31.0 (M2006C3LG; U; Android 29; in-ID; id;)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to fetch sticker pack: ${error.message}`);
    }
}

async function getSearchStickerLy(keyword = 'jokowi') {
    try {
        const response = await fetch('https://api.sticker.ly/v4/stickerPack/smartSearch', {
            method: 'POST',
            headers: {
                'User-Agent': 'androidapp.stickerly/3.31.0 (M2006C3LG; U; Android 29; in-ID; id;)',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keyword,
                enabledKeywordSearch: true,
                filter: {
                    extendSearchResult: false,
                    sortBy: 'RECOMMENDED',
                    languages: ['ALL'],
                    minStickerCount: 5,
                    searchBy: 'ALL',
                    stickerType: 'ALL'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
}

export default {
    name: 'stickerly',
    command: ['stickerly', 'stickersearch', 'stsearch', 'stickpack'],
    event: [],
    allow: CHAT.BOTH,
    roleRequired: 10,
    category: 'search',
    description: 'Search and download sticker packs from Sticker.ly',

    async handle(ctx) {
        const { sock, msg, args, chat } = ctx
        const command = ctx.trigger.toLowerCase()

        const input = args.join(' ').trim()

        if (!input) {
            return sock.sendMessage(chat, {
                text: `*Sticker.ly Search*\n\n` +
                      `*Usage:*\n` +
                      `!stickerly search <keyword> - Search sticker packs\n` +
                      `!stickerly <url> - Get sticker pack info\n\n` +
                      `*Example:*\n` +
                      `!stickerly search jokowi\n` +
                      `!stickerly https://sticker.ly/s/ABC123`
            }, { quoted: msg })
        }

        await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

        try {
            if (input.startsWith('http') || input.includes('sticker.ly')) {
                const result = await getStickerLyPack(input)
                
                const pack = result.result?.stickerPacks?.[0]
                if (!pack) {
                    throw new Error('Sticker pack not found')
                }

                const message = `*Sticker Pack Info*\n\n` +
                    `*Name:* ${pack.name}\n` +
                    `*Author:* ${pack.authorName || pack.user?.userName || 'Unknown'}\n` +
                    `*Stickers:* ${pack.resourceFiles?.length || 0}\n` +
                    `*Views:* ${pack.viewCount?.toLocaleString() || 0}\n` +
                    `*Exports:* ${pack.exportCount?.toLocaleString() || 0}\n` +
                    `*Link:* ${pack.shareUrl}\n` +
                    `*Animated:* ${pack.isAnimated || pack.animated ? 'Yes' : 'No'}\n` +
                    `*Official:* ${pack.isOfficial || pack.user?.isOfficial ? 'Yes' : 'No'}`

                await sock.sendMessage(chat, { text: message }, { quoted: msg })
                await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

            } else {
                const result = await getSearchStickerLy(input)
                
                const packs = result.result?.stickerPacks || []
                if (packs.length === 0) {
                    throw new Error('No sticker packs found')
                }

                let message = ` *Search Results for "${input}"*\n\n` +
                    `Found ${packs.length} packs. Showing top 5:\n\n`

                packs.slice(0, 5).forEach((pack, index) => {
                    message += `*${index + 1}. ${pack.name}*\n` +
                        `   ${pack.authorName || pack.user?.userName || 'Unknown'}\n` +
                        `   ${pack.resourceFiles?.length || 0} stickers | ${pack.viewCount?.toLocaleString() || 0} views\n` +
                        `   ${pack.shareUrl}\n\n`
                })

                message += `\n*Tip:* Use !stickerly <url> to get detailed info about a pack`

                await sock.sendMessage(chat, { text: message }, { quoted: msg })
                await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
            }

        } catch (error) {
            logger.error('stickerly error', error)
            await sock.sendMessage(chat, {
                text: `❌ Error: ${error.message}`
            }, { quoted: msg })
            await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        }
    }
}