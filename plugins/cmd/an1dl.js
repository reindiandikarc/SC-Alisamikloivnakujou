// Plugin: an1dl
// Auto-generated from Alya V12
// Commands: an1, an1dl

const path = require('path')

module.exports = {
  command: ["an1", "an1dl"],
  tags: ['general'],
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
        let biaya = 5
        let user = global.db.users[m.sender]

        if (user.limit < biaya) {
          return replyalya(`❌ Limit kamu tidak cukup!

    💳 Dibutuhkan: ${biaya}
    📊 Limit kamu: ${user.limit}`)
        }

        if (!text) {
          return replyalya(`❌ Masukkan nama aplikasi atau link!

    📌 Contoh:
    ${prefix + command} capcut
    ${prefix + command} https://an1.com/xxx.html`)
        }

        const axios = require('axios')
        const cheerio = require('cheerio')


        async function an1Search(query) {
          let url = `https://an1.com/?story=${encodeURIComponent(query)}&do=search&subaction=search`

          const res = await axios.get(url, {
            headers: {
              "user-agent": "Mozilla/5.0 (Linux; Android 10)"
            }
          })

          const $ = cheerio.load(res.data)
          let results = []

          $('.story, .story-short, .item, article').each((i, el) => {
            let a = $(el).find('a').first()
            let title = a.text().trim()
            let link = a.attr('href')

            if (title && link && link.includes('an1.com')) {
              results.push({ title, link })
            }
          })

          if (results.length === 0) {
            $('a').each((i, el) => {
              let href = $(el).attr('href')
              let title = $(el).text().trim()

              if (href && href.includes('an1.com') && title.length > 5) {
                results.push({ title, link: href })
              }
            })
          }

          return results.slice(0, 5)
        }
        async function an1Download(link) {
          try {
            if (!link || !link.includes("an1.com")) {
              throw new Error("Salah woylah url nya");
            }

            const first = await axios.get(link, {
              headers: {
                "user-agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
                "accept": "text/html",
                "referer": "https://an1.com/"
              }
            });

            const $ = cheerio.load(first.data);
            const nextPath = $(".download_line.green").attr("href");
            if (!nextPath) throw new Error("Link download tidak ditemukan");

            const second = await axios.get("https://an1.com" + nextPath, {
              headers: {
                "user-agent": "Mozilla/5.0",
                "referer": link
              }
            });

            const $$ = cheerio.load(second.data);
            const titleRaw = $$("h1.title").text().trim();

            return {
              success: true,
              file: {
                name: titleRaw,
                version: titleRaw.match(/[\d.]+/)?.[0] || "unknown",
                icon: $$(".box-file-img img").attr("src")
              },
              download: $$("#pre_download").attr("href")
            };

          } catch (err) {
            return {
              status: false,
              message: err.message
            };
          }
        }
        let link = text

        if (!text.includes('an1.com')) {
          replyalya('🔍 Mencari aplikasi di AN1...')

          let search = await an1Search(text)

          if (!search.length) {
            return replyalya(`❌ Aplikasi tidak ditemukan!

    💡 Coba kata lain, contoh:
    ${prefix + command} capcut mod`)
          }

          let top = search[0]

          await replyalya(`📱 Ditemukan:
    *${top.title}*

    ⏳ Mengambil data APK...`)

          link = top.link
        } else {
          replyalya('⏳ Mengambil data APK...')
        }

        let res = await an1Download(link)

        if (!res.success) {
          return replyalya(`❌ Gagal:\n${res.message}`)
        }

        if (!res.download) {
          return replyalya('❌ Link download tidak ditemukan!')
        }

        user.limit -= biaya

        let caption = `📦 *AN1 DOWNLOAD*

    📱 Nama: ${res.file.name}
    🔢 Versi: ${res.file.version}

    📥 Mengirim APK...`

        if (res.file.icon) {
          await alya.sendMessage(m.chat, {
            image: { url: res.file.icon },
            caption
          }, { quoted: m })
        } else {
          replyalya(caption)
        }
        await alya.sendMessage(m.chat, {
          document: { url: res.download },
          fileName: res.file.name + ".apk",
          mimetype: "application/vnd.android.package-archive"
        }, { quoted: m })

      } catch (e) {
        console.error(e)
        replyalya('❌ Terjadi error saat proses!')
      }
  }
}
