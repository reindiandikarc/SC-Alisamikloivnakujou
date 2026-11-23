// Plugin: cekkuota & cekpulsa
// Ported from Alya V12 alya.js
// Commands: cekkuota, cekquota, kuota, cekpulsa, ceksaldo, pulsa

const axios = require('axios')

module.exports = {
  command: ['cekkuota', 'cekquota', 'kuota', 'cekpulsa', 'ceksaldo', 'pulsa'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, reply, replyalya } = ctx

    // ── Deteksi operator ─────────────────────────────────────────
    const deteksiOperator = (no) => {
      const n = no.replace(/^(\+62|62|0)/, '').replace(/\D/g, '')
      const p3 = n.substring(0, 3)
      if (['811','812','813','821','822','823','851','852','853'].includes(p3)) return { nama: 'Telkomsel', kode: 'telkomsel', emoji: '🔴' }
      if (['814','815','816','855','856','857','858'].includes(p3)) return { nama: 'Indosat Ooredoo', kode: 'indosat', emoji: '🟡' }
      if (['817','818','819','859','877','878'].includes(p3)) return { nama: 'XL Axiata', kode: 'xl', emoji: '🔵' }
      if (['831','832','833','838'].includes(p3)) return { nama: 'Axis (XL)', kode: 'axis', emoji: '🟣' }
      if (['895','896','897','898','899'].includes(p3)) return { nama: 'Tri (3)', kode: 'tri', emoji: '🟢' }
      if (['881','882','883','884','885','886','887','888','889'].includes(p3)) return { nama: 'Smartfren', kode: 'smartfren', emoji: '⚫' }
      return { nama: 'Tidak Diketahui', kode: 'unknown', emoji: '⚪' }
    }

    const normNomor = (no) => {
      let n = no.replace(/\D/g, '')
      if (n.startsWith('0')) n = '62' + n.slice(1)
      if (!n.startsWith('62')) n = '62' + n
      return n
    }

    const isCekPulsa = ['cekpulsa','ceksaldo','pulsa'].includes(command.toLowerCase())
    const isCekKuota = ['cekkuota','cekquota','kuota'].includes(command.toLowerCase())

    const helpKuota = `📡 *Cek Kuota Internet*\n\n*Cara pakai:*\n• *${prefix}cekkuota <nomor>*\n  Contoh: *${prefix}cekkuota 08123456789*\n\n*Operator:* Telkomsel, Indosat, XL, Axis, Tri, Smartfren`
    const helpPulsa = `💰 *Cek Pulsa / Saldo*\n\n*Cara pakai:*\n• *${prefix}cekpulsa <nomor>*\n  Contoh: *${prefix}cekpulsa 08123456789*\n\n*Operator:* Telkomsel, Indosat, XL, Axis, Tri, Smartfren`

    if (!text) return replyalya(isCekPulsa ? helpPulsa : helpKuota)

    const inputNomor = text.trim().split(/\s+/)[0]
    if (!/^(\+62|62|0)8\d{7,11}$/.test(inputNomor)) {
      return replyalya(`❌ *Format nomor tidak valid!*\n\nGunakan format:\n• *08123456789*\n• *628123456789*`)
    }

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    const nomorNorm = normNomor(inputNomor)
    const nomorLokal = '0' + nomorNorm.slice(2)
    const operator = deteksiOperator(inputNomor)

    let hasil = null, apiSource = ''

    // ── API 1: siputzx ────────────────────────────────────────────
    try {
      const r = await axios.get(`https://api.siputzx.my.id/api/tools/ceknomor?nomor=${nomorNorm}`, { timeout: 10000 })
      if (r.data && r.data.status) { hasil = r.data; apiSource = 'Siputzx' }
    } catch {}

    // ── Fallback: info cara cek manual ─────────────────────────
    const operatorGuide = {
      'telkomsel': { app: 'MyTelkomsel', ussd: '*888#', tips: ['Buka app *MyTelkomsel*', 'Ketik *888# di dialer'] },
      'indosat': { app: 'myIM3', ussd: '*123#', tips: ['Buka app *myIM3*', 'Ketik *123# di dialer'] },
      'xl': { app: 'myXL', ussd: '*123#', tips: ['Buka app *myXL*', 'Ketik *123# di dialer'] },
      'axis': { app: 'AXISnet', ussd: '*123#', tips: ['Buka app *AXISnet*', 'Ketik *123# di dialer'] },
      'tri': { app: 'BIMA+', ussd: '*111#', tips: ['Buka app *BIMA+*', 'Ketik *111# di dialer'] },
      'smartfren': { app: 'MySmartfren', ussd: '*999#', tips: ['Buka app *MySmartfren*', 'Ketik *999# di dialer'] },
      'unknown': { app: 'Aplikasi Operator', ussd: '*888# / *123#', tips: ['Cek via aplikasi resmi operator'] }
    }

    const guide = operatorGuide[operator.kode] || operatorGuide['unknown']

    if (hasil && apiSource) {
      const pulsa = hasil.pulsa || hasil.balance || hasil.saldo || null
      const kuotaU = hasil.kuota_utama || hasil.main_quota || hasil.data_quota || null
      const kuotaN = hasil.kuota_malam || hasil.night_quota || null
      const expired = hasil.expired || hasil.expiry_date || hasil.masa_aktif || null
      const nama = hasil.nama || hasil.name || null
      let msgOut =
        `╔══〔 ${operator.emoji} *INFO NOMOR* 〕══╗\n` +
        `┃ 📱 Nomor    : *${nomorLokal}*\n` +
        `┃ 📡 Operator : *${operator.nama}*\n` +
        (nama ? `┃ 👤 Nama     : *${nama}*\n` : '') +
        `╚══════════════════════════╝\n\n`
      if (isCekPulsa) {
        msgOut += `💰 *INFO PULSA*\n┣ Saldo: *${pulsa !== null ? `Rp ${Number(pulsa).toLocaleString('id-ID')}` : 'Tidak tersedia'}*\n`
        if (expired) msgOut += `┣ Aktif s/d: *${expired}*\n`
      } else {
        msgOut += `📶 *INFO KUOTA*\n┣ Kuota Utama: *${kuotaU || 'Tidak tersedia'}*\n`
        if (kuotaN) msgOut += `┣ Kuota Malam: *${kuotaN}*\n`
        if (expired) msgOut += `┣ Berlaku s/d: *${expired}*\n`
      }
      msgOut += `\n📌 _Sumber: ${apiSource}_\n_Untuk info akurat, cek via aplikasi resmi operator_`
      await alya.sendMessage(m.chat, { text: msgOut }, { quoted: m })
      return await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    // Fallback manual guide
    const fallbackMsg =
      `╔══〔 ${operator.emoji} *CEK ${isCekPulsa ? 'PULSA' : 'KUOTA'}* 〕══╗\n` +
      `┃ 📱 Nomor    : *${nomorLokal}*\n` +
      `┃ 📡 Operator : *${operator.nama}*\n` +
      `╚══════════════════════════╝\n\n` +
      `⚠️ _API memerlukan autentikasi langsung dari perangkat._\n\n` +
      `📲 *Cara cek ${operator.nama}:*\n` +
      guide.tips.map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\n' +
      `📱 *App resmi:* ${guide.app}\n` +
      `📟 *USSD:* \`${guide.ussd}\`\n\n` +
      `💡 _Ketik USSD di HP dengan nomor *${nomorLokal}* yang aktif_`
    await alya.sendMessage(m.chat, { text: fallbackMsg }, { quoted: m })
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  }
}
