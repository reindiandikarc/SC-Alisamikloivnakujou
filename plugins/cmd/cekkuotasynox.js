// Plugin: cekkuotasynox
// Sumber: Synox Cloud API
// Endpoint: https://api.synoxcloud.xyz/provider/cekkuota?msisdn=<nomor>
// Commands: cekkuotasynox
//
// Catatan: codebase ini SUDAH punya plugin "cekkuota.js" (commands: cekkuota,
// cekquota, kuota, cekpulsa, ceksaldo, pulsa) yang memakai API berbeda
// (Siputzx). Supaya tidak bertabrakan, plugin ini dipasang dengan nama
// command terpisah: cekkuotasynox.
//
// Catatan implementasi:
// - Parameter query yang benar (msisdn / nomor / phone / number) belum
//   berhasil divalidasi langsung dari sandbox dev (network diblokir).
//   Request di bawah mengirim msisdn sebagai parameter utama, dengan
//   fallback otomatis mencoba nama parameter lain kalau yang pertama
//   ditolak server (error 400 dengan pesan "parameter").
// - Parsing response defensif, mengecek banyak kemungkinan nama field.

const axios = require('axios')

const BASE_URL = 'https://api.synoxcloud.xyz/provider/cekkuota'
const PARAM_CANDIDATES = ['msisdn', 'nomor', 'phone', 'number', 'no']

function normNomor(no) {
  let n = no.replace(/\D/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  if (!n.startsWith('62')) n = '62' + n
  return n
}

function deteksiOperator(no) {
  const n = no.replace(/^(\+62|62|0)/, '').replace(/\D/g, '')
  const p3 = n.substring(0, 3)
  if (['811', '812', '813', '821', '822', '823', '851', '852', '853'].includes(p3)) return { nama: 'Telkomsel', emoji: '🔴' }
  if (['814', '815', '816', '855', '856', '857', '858'].includes(p3)) return { nama: 'Indosat Ooredoo', emoji: '🟡' }
  if (['817', '818', '819', '859', '877', '878'].includes(p3)) return { nama: 'XL Axiata', emoji: '🔵' }
  if (['831', '832', '833', '838'].includes(p3)) return { nama: 'Axis (XL)', emoji: '🟣' }
  if (['895', '896', '897', '898', '899'].includes(p3)) return { nama: 'Tri (3)', emoji: '🟢' }
  if (['881', '882', '883', '884', '885', '886', '887', '888', '889'].includes(p3)) return { nama: 'Smartfren', emoji: '⚫' }
  return { nama: 'Tidak Diketahui', emoji: '⚪' }
}

// Coba beberapa nama parameter via GET dulu; kalau semua ditolak karena
// parameter/method, baru coba POST dengan tiap kandidat nama field juga.
async function cekKuotaSynox(nomorNorm) {
  let lastErr = null

  // 1) Lapis GET — coba tiap kemungkinan nama parameter
  for (const paramName of PARAM_CANDIDATES) {
    try {
      const { data } = await axios.get(BASE_URL, {
        params: { [paramName]: nomorNorm },
        timeout: 20000,
        validateStatus: () => true // tangani manual, jangan throw di status non-2xx
      })
      // Kalau server menolak karena parameter salah, biasanya ngasih pesan
      // yang menyebut "parameter" — coba nama param berikutnya.
      const msg = (data?.message || data?.msg || '').toString().toLowerCase()
      if (data && (data.status === false || data.success === false) && (msg.includes('parameter') || msg.includes('method') || msg.includes('not allowed'))) {
        lastErr = data
        continue
      }
      return data
    } catch (e) {
      lastErr = { message: e?.message }
    }
  }

  // 2) Lapis POST — kalau GET sama sekali tidak diterima, coba body JSON
  for (const paramName of PARAM_CANDIDATES) {
    try {
      const { data } = await axios.post(BASE_URL, { [paramName]: nomorNorm }, {
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      })
      const msg = (data?.message || data?.msg || '').toString().toLowerCase()
      if (data && (data.status === false || data.success === false) && (msg.includes('parameter') || msg.includes('method') || msg.includes('not allowed'))) {
        lastErr = data
        continue
      }
      return data
    } catch (e) {
      lastErr = { message: e?.message }
    }
  }

  throw new Error(lastErr?.message || 'Semua kandidat parameter ditolak server (GET & POST)')
}

function extractKuotaInfo(raw) {
  if (!raw) return null
  const ok = raw.status === true || raw.status === 'true' || raw.success === true
  if (!ok) return { ok: false, message: raw.message || raw.msg || null }

  const d = raw.result ?? raw.data ?? raw

  return {
    ok: true,
    operator: d.operator || d.provider || null,
    masaAktif: d.expired || d.expiry_date || d.masa_aktif || d.active_until || null,
    kuotaUtama: d.kuota_utama || d.main_quota || d.data_quota || d.quota || null,
    kuotaDetail: Array.isArray(d.detail) ? d.detail : Array.isArray(d.kuota_detail) ? d.kuota_detail : null,
    pulsa: d.pulsa || d.balance || d.saldo || null,
    raw: d
  }
}

module.exports = {
  command: ['cekkuotasynox'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { text, prefix, reply, replyalya } = ctx

    if (!text) {
      return reply(
        `📡 *Cek Kuota (Synox Cloud)*\n\n` +
        `Cara pakai:\n` +
        `• *${prefix}cekkuotasynox <nomor>*\n` +
        `  Contoh: *${prefix}cekkuotasynox 08123456789*\n\n` +
        `_Sumber: Synox Cloud API_`
      )
    }

    const inputNomor = text.trim().split(/\s+/)[0]
    if (!/^(\+62|62|0)8\d{7,11}$/.test(inputNomor)) {
      return replyalya(`❌ *Format nomor tidak valid!*\n\nGunakan format:\n• *08123456789*\n• *628123456789*`)
    }

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    const nomorNorm = normNomor(inputNomor)
    const nomorLokal = '0' + nomorNorm.slice(2)
    const operator = deteksiOperator(inputNomor)

    let raw
    try {
      raw = await cekKuotaSynox(nomorNorm)
    } catch (e) {
      console.error('[cekkuotasynox] request error:', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(`❌ Gagal menghubungi Synox Cloud.\n_${e?.message || 'Unknown error'}_`)
    }

    const info = extractKuotaInfo(raw)

    if (!info || !info.ok) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return replyalya(
        `❌ *Gagal mengambil data kuota untuk ${nomorLokal}*\n` +
        (info?.message ? `_${info.message}_` : '_Nomor mungkin tidak aktif atau provider tidak didukung_')
      )
    }

    let msgOut =
      `╔══〔 ${operator.emoji} *CEK KUOTA* 〕══╗\n` +
      `┃ 📱 Nomor    : *${nomorLokal}*\n` +
      `┃ 📡 Operator : *${info.operator || operator.nama}*\n` +
      `╚══════════════════════════╝\n\n`

    msgOut += `📶 *INFO KUOTA*\n`
    msgOut += `┣ Kuota Utama : *${info.kuotaUtama || 'Tidak tersedia'}*\n`
    if (info.pulsa) msgOut += `┣ Pulsa       : *Rp ${Number(info.pulsa).toLocaleString('id-ID')}*\n`
    if (info.masaAktif) msgOut += `┣ Aktif s/d   : *${info.masaAktif}*\n`

    if (Array.isArray(info.kuotaDetail) && info.kuotaDetail.length) {
      msgOut += `\n📋 *Detail Paket*\n`
      info.kuotaDetail.slice(0, 8).forEach((d, i) => {
        const nama = d.name || d.nama || d.title || `Paket ${i + 1}`
        const sisa = d.remaining || d.sisa || d.value || ''
        msgOut += `┣ ${nama}${sisa ? `: *${sisa}*` : ''}\n`
      })
    }

    msgOut += `\n📌 _Sumber: Synox Cloud_`

    await alya.sendMessage(m.chat, { text: msgOut }, { quoted: m })
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  }
}
