/**
 * Alight Motion Bulk Auto Verify (Satriam + Generator.email)
 * Creator: IzzXd
 * Base: https://satriam.satriadeveloperz.workers.dev
 * Saluran: https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K
 * Ported to ESM Plugin by AI
 */

const BASE_SATRIAM = 'https://satriam.satriadeveloperz.workers.dev'
const BASE_GENEMAIL = 'https://generator.email'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getGeneratorEmailSession() {
    const init = await fetch(`${BASE_GENEMAIL}/`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(10000)
    })
    const setCookies = init.headers.getSetCookie ? init.headers.getSetCookie() : [init.headers.get('set-cookie') || '']
    const hpCookie = setCookies.find(c => c && c.startsWith('__Host-ab_hp='))
    const rawCtx = setCookies.find(c => c && c.startsWith('inbox_ctx='))

    let domain = 'heyzalo.vn'
    if (rawCtx) {
        try {
            const dec = decodeURIComponent(rawCtx.split(';')[0].split('=')[1])
            const extracted = dec.split('/')[0]
            if (extracted) domain = extracted
        } catch {}
    }

    const hpCookieHeader = hpCookie ? hpCookie.split(';')[0] : ''
    return { domain, hpCookieHeader }
}

function generateRandomUser() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let user = 'am'
    for (let i = 0; i < 6; i++) {
        user += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    user += Math.floor(Math.random() * 89 + 10)
    return user
}

async function sendSatriamLink(email) {
    const res = await fetch(`${BASE_SATRIAM}/api/satriam/send-link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA
        },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(15000)
    })
    return await res.json()
}

async function verifySatriamLink(email, magicLink) {
    const res = await fetch(`${BASE_SATRIAM}/api/satriam/verify-link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA
        },
        body: JSON.stringify({ email, magicLink }),
        signal: AbortSignal.timeout(15000)
    })
    return await res.json()
}

async function fetchMagicLink(domain, user, hpCookieHeader, maxAttempts = 10) {
    const ctx = encodeURIComponent(`${domain}/${user}/`)
    const cookies = `inbox_ctx=${ctx}; ${hpCookieHeader}`

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await sleep(attempt === 1 ? 5000 : 3000)
        try {
            const res = await fetch(`${BASE_GENEMAIL}/inbox1/`, {
                headers: {
                    'User-Agent': UA,
                    'Cookie': cookies
                },
                signal: AbortSignal.timeout(10000)
            })
            const html = await res.text()

            const links = html.match(/https?:\/\/[^\s"'<>]+/gi) || []
            const magicLink = links.find(l =>
                (l.includes('alight-creative.firebaseapp.com') || l.includes('alightcreative.com')) &&
                (l.includes('signInWithEmailLink') || l.includes('auth_action') || l.includes('links?link='))
            )

            if (magicLink) {
                return magicLink.replace(/&amp;/g, '&')
            }
        } catch {}
    }

    throw new Error('Timeout menunggu email magic link dari Alight Motion')
}

async function createAndVerifySingleAccount(sessionData) {
    const { domain, hpCookieHeader } = sessionData
    const user = generateRandomUser()
    const email = `${user}@${domain}`
    const inbox = `${BASE_GENEMAIL}/${email}`

    const sendRes = await sendSatriamLink(email)
    if (!sendRes?.success) {
        throw new Error(sendRes?.message || sendRes?.error || 'Gagal mengirim link ke email')
    }

    const magicLink = await fetchMagicLink(domain, user, hpCookieHeader)
    const verifyRes = await verifySatriamLink(email, magicLink)

    if (!verifyRes?.success) {
        throw new Error(verifyRes?.message || verifyRes?.error || 'Gagal verifikasi magic link')
    }

    return {
        email,
        inbox,
        status: true,
        membershipStatus: verifyRes.membershipStatus || 'PREMIUM_ACTIVE',
        planName: verifyRes.planName || 'Alight Motion Pro / Member',
        orderId: verifyRes.orderId || null,
        validUntil: verifyRes.validUntil || null,
        features: verifyRes.features || []
    }
}

async function bulk(count = 1) {
    const num = Math.max(1, Math.min(Number(count) || 1, 50))
    const results = []

    for (let i = 0; i < num; i++) {
        try {
            const sessionData = await getGeneratorEmailSession()
            const account = await createAndVerifySingleAccount(sessionData)
            results.push(account)
        } catch (err) {
            results.push({
                status: false,
                error: err.message
            })
        }

        if (i < num - 1) {
            await sleep(1500)
        }
    }

    return results
}

// === HANDLER PLUGIN BOCHITEAM / BOCHILGAMING ===

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) {
        return m.reply(`🚩 Penggunaan:\n${usedPrefix + command} <jumlah>\n\nContoh:\n${usedPrefix + command} 3\n*(Maksimal 50)*`)
    }

    const count = parseInt(args[0], 10)
    if (count > 50) return m.reply('🚩 Maksimal pembuatan adalah 50 akun dalam satu permintaan.')
    if (count < 1) return m.reply('🚩 Minimal pembuatan adalah 1 akun.')

    m.reply(`⏳ *Processing...* Sedang membuat ${count} akun Alight Motion, mohon tunggu beberapa saat.`)

    try {
        const results = await bulk(count)
        
        let successCount = results.filter(r => r.status).length
        let failedCount = results.filter(r => !r.status).length

        let txt = `*ALIGHT MOTION BULK GENERATOR*\n`
        txt += `*Total Request:* ${count}\n`
        txt += `*Sukses:* ${successCount}\n`
        txt += `*Gagal:* ${failedCount}\n\n`
        txt += `*CREATOR:* IzzXd\n`
        txt += `*CHANNEL:* https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K\n`
        txt += `─────────────────\n\n`

        results.forEach((res, i) => {
            txt += `*Akun ${i + 1}*\n`
            if (res.status) {
                txt += `📧 Email: ${res.email}\n`
                txt += `👑 Plan: ${res.planName}\n`
                txt += `📥 Inbox: ${res.inbox}\n\n`
            } else {
                txt += `❌ Status: Gagal\n`
                txt += `⚠️ Error: ${res.error}\n\n`
            }
        })

        await m.reply(txt.trim())

    } catch (err) {
        m.reply(`🚩 Terjadi kesalahan sistem:\n${err.message}`)
    }
}

handler.help = ['ambulk <jumlah>']
handler.tags = ['tools', 'premium']
handler.command = /^(ambulk)$/i
handler.premium = true // Ubah ke true jika fitur ini hanya untuk user premium

export default handler