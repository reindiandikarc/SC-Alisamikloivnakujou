/**
 * Total Fitur & Command
 * Type: Plugin ESM
 */

let handler = async (m, { conn }) => {
  // Hitung total fitur
  let totalFitur = Object.values(global.plugins)
    .filter(v => v?.help && v?.tags)
    .length

  // Hitung total command
  let totalCommand = Object.values(global.plugins)
    .map(v => v?.command)
    .filter(v => v)
    .map(v => Array.isArray(v) ? v.length : 1)
    .reduce((a, b) => a + b, 0)

  let text = `
Total Fitur   : ${totalFitur}
Total Command : ${totalCommand}
`.trim()

  const thumbUrl = 'https://raw.githubusercontent.com/himanackerman/Image/main/1767877404043-832.jpeg'

  let thumbnail

  try {
    const res = await fetch(thumbUrl)

    if (res.ok) {
      thumbnail = Buffer.from(await res.arrayBuffer())
    }
  } catch (e) {
    console.error('[TOTAL FITUR] Thumbnail error:', e)
  }

  await conn.sendMessage(
    m.chat,
    {
      text,
      contextInfo: {
        externalAdReply: {
          title: '✨ Total Fitur',
          body: `${totalFitur} Fitur • ${totalCommand} Command`,
          mediaType: 1,
          renderLargerThumbnail: true,
          ...(thumbnail ? { thumbnail } : {}),
          sourceUrl: 'https://github.com/himanackerman/Image'
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.limit = false

export default handler