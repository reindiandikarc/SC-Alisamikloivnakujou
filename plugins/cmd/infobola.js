// Plugin: infobola
// Auto-generated from Alya V12
// Commands: infobola

const path = require('path')

module.exports = {
  command: ["infobola"],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

        try {
            if (!q) {
                const buttons = [
                    { buttonId: `${prefix}infobola epl`, buttonText: { displayText: "🏴 EPL" }, type: 1 },
                    { buttonId: `${prefix}infobola laliga`, buttonText: { displayText: "🇪🇸 La Liga" }, type: 1 },
                    { buttonId: `${prefix}infobola serie-a`, buttonText: { displayText: "🇮🇹 Serie A" }, type: 1 },
                    { buttonId: `${prefix}infobola bundesliga`, buttonText: { displayText: "🇩🇪 Bundesliga" }, type: 1 },
                    { buttonId: `${prefix}infobola ligue1`, buttonText: { displayText: "🇫🇷 Ligue 1" }, type: 1 },
                    { buttonId: `${prefix}infobola matches`, buttonText: { displayText: "⚽ Matches Today" }, type: 1 },
                ]

                const buttonMessage = {
                    text: "⚽ Silahkan pilih liga yang ingin kamu lihat:",
                    footer: "📊 Info Bola - Real Time",
                    buttons: buttons,
                    headerType: 2
                }

                return alya.sendMessage(m.chat, buttonMessage, { quoted: m })
            }

            // kalau user pilih, lanjutkan ke kode yang sebelumnya
            let liga = q.toLowerCase();
            let apiURL;
            let titleLiga;

            if (liga === 'epl' || liga === 'premierleague') {
                apiURL = 'https://api.dreaded.site/api/standings/PL';
                titleLiga = '🏆 ENGLISH PREMIER LEAGUE STANDINGS';
            } else if (liga === 'laliga' || liga === 'll') {
                apiURL = 'https://api.dreaded.site/api/standings/PD';
                titleLiga = '🏆 LA LIGA STANDINGS';
            } else if (liga === 'serie-a' || liga === 'sa') {
                apiURL = 'https://api.dreaded.site/api/standings/SA';
                titleLiga = '🏆 SERIE A STANDINGS';
            } else if (liga === 'bundesliga' || liga === 'bl1') {
                apiURL = 'https://api.dreaded.site/api/standings/BL1';
                titleLiga = '🏆 BUNDESLIGA STANDINGS';
            } else if (liga === 'ligue1' || liga === 'fl1') {
                apiURL = 'https://api.dreaded.site/api/standings/FL1';
                titleLiga = '🏆 LIGUE 1 STANDINGS';
            } else if (liga === 'matches' || liga === 'jadwal') {
                const leagues = {
                    '🇬🇧 Premier League': 'PL',
                    '🇪🇸 La Liga': 'PD',
                    '🇩🇪 Bundesliga': 'BL1',
                    '🇮🇹 Serie A': 'SA',
                    '🇫🇷 Ligue 1': 'FR'
                }

                const convertEATtoWIB = (timeStr) => {
                    try {
                        const [h, m, s] = timeStr.split(':').map(Number)
                        let date = new Date()
                        date.setHours(h, m, s || 0)
                        date.setHours(date.getHours() + 4) // EAT → WIB (+4 jam)
                        return date.toTimeString().split(' ')[0]
                    } catch {
                        return timeStr
                    }
                }

                let message = `⚽ *Today's Football Matches*\n\n`

                for (const [leagueName, code] of Object.entries(leagues)) {
                    let res = await axios.get(`https://api.dreaded.site/api/matches/${code}`)
                    let matches = res.data.data

                    if (Array.isArray(matches) && matches.length > 0) {
                        message += `${leagueName}:\n${matches.map(match => {
                            let timeWIB = convertEATtoWIB(match.time)
                            return `${match.game}\n📅 Date: ${match.date}\n⏰ Time: ${timeWIB} (WIB)\n`
                        }).join('\n')}\n\n`
                    } else {
                        message += `${leagueName}: No matches scheduled\n\n`
                    }
                }

                message += '🕒 *Times are in WIB (UTC+7).*'
                return replyalya(message.trim())
            } else {
                return replyalya("❌ Liga tidak dikenal!")
            }

            // === FETCH STANDINGS ===
            const res = await axios.get(apiURL)
            const standings = res.data.data

            let table = `${titleLiga}\n\n`

            if (Array.isArray(standings)) {
                standings.forEach((team, index) => {
                    table += `*${index + 1}. ${team.team}*\n`
                    table += `   📊 Pts: ${team.points} | P: ${team.played} | W: ${team.win} | D: ${team.draw} | L: ${team.lose} | GD: ${team.goalsDiff}\n\n`
                })
            } else {
                table += standings
            }

            replyalya(table.trim())

        } catch (err) {
            console.error('[INFOBOLA ERROR]', err)
            replyalya("⚠️ Gagal mengambil data bola.")
        }
  }
}
