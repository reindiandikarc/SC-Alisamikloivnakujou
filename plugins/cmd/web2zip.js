// Plugin: web2zip
// Commands: web2zip, saveweb2zip
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['web2zip', 'saveweb2zip'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!text) return replyalya(`🌐 *WEB2ZIP*

Kirim link website yang mau dicopy.

Contoh:
${prefix + command} https://example.com`)

    await alya.sendMessage(m.chat, { react: { text: "🌐", key: m.key } })

    const axios = require('axios')

    async function saveweb2zip(url, options = {}) {
        try {
            url = url.startsWith('http://') || url.startsWith('https://') 
                ? url 
                : `https://${url}`

            const {
                renameAssets = true,
                saveStructure = true,
                alternativeAlgorithm = false,
                mobileVersion = false
            } = options

            const { data } = await axios.post(
                'https://copier.saveweb2zip.com/api/copySite',
                {
                    url,
                    renameAssets,
                    saveStructure,
                    alternativeAlgorithm,
                    mobileVersion
                },
                {
                    headers: {
                        'accept': '*/*',
                        'content-type': 'application/json',
                        'origin': 'https://saveweb2zip.com',
                        'referer': 'https://saveweb2zip.com/',
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                    }
                }
            )

            if (!data.md5) throw new Error('Gagal memulai cloning.')

            let attempts = 0

            while (attempts < 60) {
                const { data: process } = await axios.get(
                    `https://copier.saveweb2zip.com/api/getStatus/${data.md5}`,
                    {
                        headers: {
                            'accept': '*/*',
                            'content-type': 'application/json',
                            'origin': 'https://saveweb2zip.com',
                            'referer': 'https://saveweb2zip.com/',
                            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                        }
                    }
                )

                if (process.isFinished) {
                    return {
                        url,
                        error: {
                            text: process.errorText,
                            code: process.errorCode
                        },
                        copiedFilesAmount: process.copiedFilesAmount,
                        downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${process.md5}`
                    }
                }

                attempts++
                await new Promise(res => setTimeout(res, 2000))
            }

            throw new Error('Timeout, proses terlalu lama.')
        } catch (err) {
            throw new Error(err.message)
        }
    }

    try {
        let res = await saveweb2zip(text)

        if (res.error && res.error.code !== 0) {
            return replyalya(`❌ *Gagal Copy Website*

Error: ${res.error.text}`)
        }

        let caption = `╭───┈ *WEB CLONER* ┈───
│ 🌐 *URL:* ${res.url}
│ 📂 *Total File:* ${res.copiedFilesAmount}
│ 💾 *Status:* Berhasil
╰─────────────────────
📦 _File ZIP sedang dikirim..._`

        await alya.sendMessage(m.chat, {
            document: { url: res.downloadUrl },
            mimetype: 'application/zip',
            fileName: `${res.url.replace(/https?:\/\//, '')}.zip`,
            caption
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

    } catch (e) {
        console.log(e)
        replyalya('❌ Terjadi kesalahan atau website tidak bisa diakses.')
    }
  }
};
