// Plugin: jadwalanime
// Commands: jadwal, jadwalanime
// Jadwal Anime Tayang Mingguan
// Ported 1:1 dari Alya V10 (anime jadwal subcommand)
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('@whiskeysockets/baileys')

'use strict'

const { animeSchedule } = require('../../scrape/anime')

module.exports = {
  command: ['jadwal', 'jadwalanime'],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { prefix, command, args, reply, replyalya } = ctx

    try {
      await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

      const scheduleRes = await animeSchedule()

      // Cek jika API gagal
      if (!scheduleRes || scheduleRes.status !== 'success' || !scheduleRes.data) {
        return replyalya(
          `❌ *Gagal mengambil jadwal anime!*\n\n` +
          `API sedang tidak tersedia, coba lagi nanti.\n` +
          `_Status: ${scheduleRes?.status || 'error'}_`
        )
      }

      const hariInput = args[0]

      // Jika tidak ada argumen hari → tampilkan daftar hari (list select)
      if (!hariInput) {
        const sections = [{
          title: 'Jadwal Minggu ini',
          rows: []
        }]

        scheduleRes.data.forEach((item) => {
          sections[0].rows.push({
            header: '',
            title: `Hari ${item.day}`,
            description: ``,
            id: `${prefix}${command} ${item.day}`
          })
        })

        const listMessage = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: {
                body: {
                  text: `📅 *JADWAL ANIME ONGOING*\n\nPilih hari untuk melihat daftar anime yang tayang:`
                },
                footer: {
                  text: `Powered By ${global.botname || 'Alya Bot'}`
                },
                header: {
                  title: '',
                  subtitle: '',
                  hasMediaAttachment: false
                },
                nativeFlowMessage: {
                  buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'SELECT DAYS',
                      sections: sections
                    })
                  }]
                }
              }
            }
          }
        }, { quoted: m })

        await alya.relayMessage(m.chat, listMessage.message, {
          messageId: listMessage.key.id
        })

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return
      }

      // Ada argumen hari → tampilkan anime pada hari tersebut
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      let selectedData = []

      if (hariInput.toLowerCase() === 'all') {
        scheduleRes.data.forEach(d => selectedData.push(...(d.anime_list || [])))
      } else {
        const findDay = scheduleRes.data.find(
          d => d.day && d.day.toLowerCase() === hariInput.toLowerCase()
        )
        if (findDay) {
          selectedData = findDay.anime_list || []
        }
      }

      if (!selectedData || selectedData.length === 0) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return reply(
          `❌ Tidak ditemukan jadwal anime untuk hari *${hariInput}*.\n` +
          `Pastikan nama hari benar (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu) atau ketik *all*.`
        )
      }

      const limitAnime = selectedData.slice(0, 15)
      const slides = []

      try {
        for (const anime of limitAnime) {
          let media
          try {
            media = await prepareWAMessageMedia(
              { image: { url: anime.poster } },
              { upload: alya.waUploadToServer }
            )
          } catch {
            media = {}
          }

          const animeSlug = anime.slug
            ? anime.slug
            : (anime.url ? anime.url.split('/').pop() : 'unknown')

          slides.push({
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: anime.title || 'Anime',
              hasMediaAttachment: !!media.imageMessage,
              ...media
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: `🎬 *${anime.title || 'Unknown'}*\n🔗 Slug: ${animeSlug}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: `Hari: ${hariInput}`
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📜 Detail Anime',
                    id: `${prefix}anime detail ${animeSlug}`
                  })
                },
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: '🆔 Salin ID/Slug',
                    copy_code: animeSlug
                  })
                }
              ]
            })
          })
        }

        const carouselMsg = await generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: `📺 *DAFTAR ANIME HARI ${hariInput.toUpperCase()}*\n\nMenunjukkan ${limitAnime.length} dari ${selectedData.length} anime`
                }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards: slides
                })
              })
            }
          }
        }, { quoted: m })

        await alya.relayMessage(m.chat, carouselMsg.message, {
          messageId: carouselMsg.key.id
        })

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (e) {
        console.error('[jadwalanime carousel]', e.message)

        // Fallback: kirim sebagai teks biasa jika carousel gagal
        let teks = `📅 *JADWAL ANIME - ${hariInput.toUpperCase()}*\n\n`
        limitAnime.forEach((a, i) => {
          teks += `${i + 1}. *${a.title || 'Unknown'}*\n`
          if (a.poster) teks += `   🖼️ Poster tersedia\n`
          teks += '\n'
        })
        teks += `_Total: ${selectedData.length} anime | Ditampilkan: ${limitAnime.length}_`

        await alya.sendMessage(m.chat, { text: teks }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      }

    } catch (err) {
      console.error('[jadwalanime]', err.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ *Gagal mengambil jadwal anime!*\n\n_${err.message}_`)
    }
  }
}
