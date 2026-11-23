module.exports = async function (__naren_imp, __naren_meta) {

const __ni_0 = await __naren_imp("axios"); const axios = __ni_0.default;


const API = 'https://api.theresav.biz.id/tools/otp'
const APIKEY = 'hammapi'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw 'Contoh:\n.otp 628123456789 5'

  const phone = args[0].replace(/\D/g, '')
  const total = Math.min(Math.max(parseInt(args[1]) || 1, 1), 10) // maksimal 10x

  await m.reply(`⏳ Mengirim ${total} request...`)

  let sukses = 0
  let gagal = 0
  const hasil = []

  for (let i = 1; i <= total; i++) {
    try {
      const { data } = await axios.get(API, {
        params: {
          phone,
          apikey: APIKEY
        }
      })

      sukses++
      hasil.push(`✅ ${i}. ${data.message || 'Success'}`)
    } catch (e) {
      gagal++
      hasil.push(`❌ ${i}. ${e.response?.data?.message || e.message}`)
    }

    if (i < total) await delay(1000) // jeda 1 detik
  }

  await conn.reply(
    m.chat,
    `📱 Nomor: ${phone}

Total: ${total}
Berhasil: ${sukses}
Gagal: ${gagal}

${hasil.join('\n')}`,
    m
  )
}

handler.help = ['spamotp <nomor> [jumlah]']
handler.tags = ['tools']
handler.premium = true
handler.command = /^spamotp$/i

const __naren_default = handler;
;return { default: __naren_default };
}
