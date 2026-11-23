/**
 * Plugin: remini / hd
 * Commands: remini, hd
 * Tags: ai
 *
 * Handler gabungan image + video (port dari V11):
 *   ─ GAMBAR: chain 3 engine fallback otomatis
 *       Engine 1 → Supawork AI 4x     (via fitur/hd.js)
 *       Engine 2 → HD Enhancer v3     (via api-faa.my.id + catbox upload)
 *       Engine 3 → iLoveImg Upscale   (via lib/remini → scrape/iloveimg)
 *   ─ VIDEO: unblurimage.ai 4K enhancer (via fitur/hdvid.js)
 *
 * Ported V11 → V20:
 *   - Tambah branch video (V11 .hd bisa handle video juga)
 *   - Cleanup temp file di finally untuk video path
 *   - Ganti m.reply() → replyalya() / replytolak() sesuai V20 ctx
 *   - lib/remini sebelumnya pakai vyro.ai (dead) → relay ke iloveimg
 */

'use strict'

const fs       = require('fs')
const axios    = require('axios')
const FormData = require('form-data')
const { imgupscale }    = require('../../fitur/hd')
const { videoenhancer } = require('../../fitur/hdvid')
const { remini: reminiEnhance } = require('../../lib/remini')

// ── Helper: Upload buffer ke Catbox ────────────────────────────────────────
async function uploadCatbox(buffer) {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename: 'img.jpg', contentType: 'image/jpeg' })
    const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
    })
    const url = data?.trim()
    if (!url?.startsWith('https://')) throw new Error('Upload catbox gagal')
    return url
}

// ── Helper: HD Enhancer v3 via api-faa ────────────────────────────────────
async function hdv3Api(imageUrl) {
    const { data } = await axios.get(
        `https://api-faa.my.id/faa/hdv3?image=${encodeURIComponent(imageUrl)}`,
        { responseType: 'arraybuffer', timeout: 60000 }
    )
    if (!data || data.byteLength < 1000) throw new Error('Hasil kosong dari hdv3')
    return Buffer.from(data)
}

// ── Plugin ─────────────────────────────────────────────────────────────────
module.exports = {
    command: ['remini', 'hd'],
    tags: ['ai'],

    run: async (alya, m, ctx) => {
        const { prefix, command, pushname, mime, replyalya, replytolak } = ctx

        // Validasi: harus ada media yang di-quote
        if (!m.quoted) {
            return replytolak(
                `📸 *Reply gambar atau video* dengan perintah *${prefix + command}*\n\n` +
                `_Contoh: Reply foto/video lalu ketik .${command}_`
            )
        }

        const qMime = (m.quoted.msg || m.quoted).mimetype || mime || ''
        const isImage = /image/.test(qMime) || /webp/.test(qMime)
        const isVideo = /video/.test(qMime)

        if (!isImage && !isVideo) {
            return replytolak('❌ Yang di-reply harus berupa *gambar* atau *video*')
        }

        // ══════════════════════════════════════════════════════════════════
        // BRANCH: VIDEO
        // ══════════════════════════════════════════════════════════════════
        if (isVideo) {
            const COST_VID = 5
            const userData = global.db?.users?.[m.sender]
            if (!userData) return replyalya('❌ Data user tidak ditemukan.')
            if ((userData.limit || 0) < COST_VID) {
                return replyalya(
                    `❌ *Limit Tidak Cukup!*\n\n` +
                    `💳 Dibutuhkan : ${COST_VID} Limit\n` +
                    `📊 Limit Kamu : ${userData.limit || 0}`
                )
            }

            await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
            replyalya(
                `⏳ *Sedang memproses video ke HD...*\n\n` +
                `👤 User   : ${pushname}\n` +
                `🎬 Engine : unblurimage.ai 4K\n` +
                `📤 Status : Uploading & Processing\n\n` +
                `_Ini mungkin butuh beberapa menit, harap sabar ya!_`
            )

            let videoPath = null
            try {
                videoPath = await alya.downloadAndSaveMediaMessage(m.quoted)
                const result = await videoenhancer(videoPath, '4k')

                userData.limit -= COST_VID

                await alya.sendMessage(m.chat, {
                    video: { url: result.output_url },
                    caption:
                        `✅ *VIDEO HD BERHASIL!*\n\n` +
                        `👤 Request By : ${pushname}\n` +
                        `🎬 Kualitas   : *4K*\n\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `💳 Biaya  : -${COST_VID} Limit\n` +
                        `📊 Sisa   : ${userData.limit} Limit`
                }, { quoted: m })

                await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

            } catch (err) {
                console.error('[hd/video]', err.message)
                await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                replyalya(
                    `❌ *Gagal memproses video ke HD!*\n\n` +
                    `_${err.message}_\n\n` +
                    `_Coba lagi nanti atau gunakan video yang lebih kecil_`
                )
            } finally {
                try { if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath) } catch {}
            }
            return
        }

        // ══════════════════════════════════════════════════════════════════
        // BRANCH: GAMBAR (chain 3 engine)
        // ══════════════════════════════════════════════════════════════════
        const COST = 3
        const userData = global.db?.users?.[m.sender]
        if (!userData) return replyalya('❌ Data user tidak ditemukan.')
        if ((userData.limit || 0) < COST) {
            return replyalya(
                `❌ *Limit Tidak Cukup!*\n\n` +
                `💳 Dibutuhkan : ${COST} Limit\n` +
                `📊 Limit Kamu : ${userData.limit || 0}\n\n` +
                `⚠️ Silakan topup dengan *.buy*`
            )
        }

        await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } })
        replyalya(
            `⏳ *Sedang enhance gambar...*\n\n` +
            `👤 User   : ${pushname}\n` +
            `🧠 Engine : HD Enhance\n` +
            `📤 Status : Processing...\n\n` +
            `_Mohon tunggu ±15–30 detik_`
        )

        let imgPath = null
        try {
            imgPath = await alya.downloadAndSaveMediaMessage(m.quoted)
            const buffer = fs.readFileSync(imgPath)

            let resultBuffer = null
            let engineUsed   = ''

            // ── Engine 1: Supawork AI (4x) ──────────────────────────────
            try {
                const resultUrl = await imgupscale(buffer, { scale: 4 })
                const res = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 30000 })
                resultBuffer = Buffer.from(res.data)
                engineUsed   = 'Supawork AI (4x)'
            } catch (e1) {
                console.warn('[hd] Engine 1 (Supawork) gagal:', e1.message)

                // ── Engine 2: HD Enhancer v3 via Catbox ─────────────────
                try {
                    const catUrl = await uploadCatbox(buffer)
                    resultBuffer = await hdv3Api(catUrl)
                    engineUsed   = 'HD Enhancer v3'
                } catch (e2) {
                    console.warn('[hd] Engine 2 (hdv3) gagal:', e2.message)

                    // ── Engine 3: iLoveImg via lib/remini ────────────────
                    resultBuffer = await reminiEnhance(buffer, 'enhance')
                    engineUsed   = 'iLoveImg Enhance'
                }
            }

            // Potong limit
            userData.limit -= COST

            await alya.sendMessage(m.chat, {
                image: resultBuffer,
                caption:
                    `✨ *HD ENHANCE SUCCESS!*\n\n` +
                    `👤 Request By : ${pushname}\n` +
                    `🧠 Engine     : ${engineUsed}\n\n` +
                    `━━━━━━━━━━━━━━━\n` +
                    `💳 Biaya  : -${COST} Limit\n` +
                    `📊 Sisa   : ${userData.limit} Limit`
            }, { quoted: m })

            await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error('[hd/remini] Semua engine gagal:', e.message)
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            replyalya(`❌ *Gagal enhance gambar!*\n\n_${e.message}_`)
        } finally {
            try {
                if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
            } catch {}
        }
    }
}
