// Plugin: pulsa
// Auto-generated from Alya V12
// Commands: kuota, pulsa

const path = require('path')

module.exports = {
  command: ["kuota", "pulsa"],
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

      // ─── Deteksi operator dari prefix nomor ────────────────────────
      const _deteksiOperator = (no) => {
        const n = no.replace(/^(\+62|62|0)/, '').replace(/\D/g, '')
        const p = n.substring(0, 4)
        const p3 = n.substring(0, 3)
        const p2 = n.substring(0, 2)

        // Telkomsel: 811,812,813,821,822,823,851,852,853
        if (['811','812','813','821','822','823','851','852','853'].includes(p3)) {
          return { nama: 'Telkomsel', kode: 'telkomsel', emoji: '🔴', warna: 'Merah' }
        }
        // Indosat/IM3 Ooredoo: 814,815,816,855,856,857,858
        if (['814','815','816','855','856','857','858'].includes(p3)) {
          return { nama: 'Indosat Ooredoo', kode: 'indosat', emoji: '🟡', warna: 'Kuning' }
        }
        // XL Axiata: 817,818,819,859,877,878,817
        if (['817','818','819','859','877','878'].includes(p3)) {
          return { nama: 'XL Axiata', kode: 'xl', emoji: '🔵', warna: 'Biru' }
        }
        // Axis (XL Group): 831,832,833,838
        if (['831','832','833','838'].includes(p3)) {
          return { nama: 'Axis (XL)', kode: 'axis', emoji: '🟣', warna: 'Ungu' }
        }
        // Tri (3): 895,896,897,898,899
        if (['895','896','897','898','899'].includes(p3)) {
          return { nama: 'Tri (3)', kode: 'tri', emoji: '🟢', warna: 'Hijau' }
        }
        // Smartfren: 881,882,883,884,885,886,887,888,889
        if (['881','882','883','884','885','886','887','888','889'].includes(p3)) {
          return { nama: 'Smartfren', kode: 'smartfren', emoji: '⚫', warna: 'Hitam' }
        }
        // By.U (Telkomsel Digital): 851 sudah cover, tambah pola khusus
        if (p3 === '851' || p3 === '852') {
          return { nama: 'By.U / Telkomsel', kode: 'byu', emoji: '🟠', warna: 'Oranye' }
        }
        return { nama: 'Tidak Diketahui', kode: 'unknown', emoji: '⚪', warna: '-' }
      }

      // ─── Normalisasi nomor ─────────────────────────────────────────
      const _normNomor = (no) => {
        let n = no.replace(/\D/g, '')
        if (n.startsWith('0'))  n = '62' + n.slice(1)
        if (n.startsWith('+62')) n = n.slice(1)
        if (!n.startsWith('62')) n = '62' + n
        return n
      }

      const _isCekPulsa = ['cekpulsa','ceksaldo','pulsa'].includes(command.toLowerCase())
      const _isCekKuota = ['cekkuota','cekquota','kuota'].includes(command.toLowerCase())

      const _helpKuota =
        `📡 *Cek Kuota Internet*\n\n` +
        `*Cara pakai:*\n` +
        `• *${prefix}cekkuota <nomor>*\n` +
        `  Contoh: *${prefix}cekkuota 08123456789*\n\n` +
        `*Operator yang didukung:*\n` +
        `┣ 🔴 Telkomsel (081x, 082x, 085x)\n` +
        `┣ 🟡 Indosat IM3 (0814–0816, 0855–0858)\n` +
        `┣ 🔵 XL Axiata (0817–0819, 0859, 0877–0878)\n` +
        `┣ 🟣 Axis (0831–0833, 0838)\n` +
        `┣ 🟢 Tri / 3 (0895–0899)\n` +
        `┣ ⚫ Smartfren (0881–0889)\n` +
        `┣ 🟠 By.U (0851, 0852)\n`

      const _helpPulsa =
        `💰 *Cek Pulsa / Saldo*\n\n` +
        `*Cara pakai:*\n` +
        `• *${prefix}cekpulsa <nomor>*\n` +
        `  Contoh: *${prefix}cekpulsa 08123456789*\n\n` +
        `*Operator yang didukung:*\n` +
        `┣ 🔴 Telkomsel (081x, 082x, 085x)\n` +
        `┣ 🟡 Indosat IM3 (0814–0816, 0855–0858)\n` +
        `┣ 🔵 XL Axiata (0817–0819, 0859, 0877–0878)\n` +
        `┣ 🟣 Axis (0831–0833, 0838)\n` +
        `┣ 🟢 Tri / 3 (0895–0899)\n` +
        `┣ ⚫ Smartfren (0881–0889)\n` +
        `┣ 🟠 By.U (0851, 0852)\n`

      if (!text) return replyalya(_isCekPulsa ? _helpPulsa : _helpKuota)

      const _inputNomor = text.trim().split(/\s+/)[0]
      if (!/^(\+62|62|0)8\d{7,11}$/.test(_inputNomor)) {
        return replyalya(
          `❌ *Format nomor tidak valid!*\n\n` +
          `Gunakan format:\n` +
          `• *08123456789*\n` +
          `• *628123456789*\n` +
          `• *+628123456789*`
        )
      }

      try {
        await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

        const _nomorNorm  = _normNomor(_inputNomor)
        const _nomorLokal = '0' + _nomorNorm.slice(2)
        const _operator   = _deteksiOperator(_inputNomor)

        // ─── Coba berbagai API provider cek kuota/pulsa ────────────────

        let _hasil = null
        let _apiSource = ''

        // ── API 1: checkpulsa.me (aggregator multi-operator) ──────────
        try {
          const _r1 = await axios.get(
            `https://api.checkpulsa.me/v1/check?phone=${_nomorNorm}&type=${_isCekPulsa ? 'pulsa' : 'kuota'}`,
            { timeout: 10000, headers: { 'Accept': 'application/json', 'User-Agent': 'AlyaBot/1.0' } }
          )
          if (_r1.data && _r1.data.status === 'success') {
            _hasil = _r1.data
            _apiSource = 'CheckPulsa'
          }
        } catch (_ea1) {}

        // ── API 2: api.cekpulsa.com ────────────────────────────────────
        if (!_hasil) {
          try {
            const _r2 = await axios.post(
              `https://api.cekpulsa.com/check`,
              { phone: _nomorNorm, operator: _operator.kode, type: _isCekPulsa ? 'pulsa' : 'data' },
              { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
            )
            if (_r2.data && (_r2.data.success || _r2.data.status === 'ok')) {
              _hasil = _r2.data
              _apiSource = 'CekPulsa'
            }
          } catch (_ea2) {}
        }

        // ── API 3: siputzx (aggregator scraper Indonesia) ─────────────
        if (!_hasil) {
          try {
            const _r3 = await axios.get(
              `https://api.siputzx.my.id/api/tools/ceknomor?nomor=${_nomorNorm}`,
              { timeout: 10000, headers: { 'Accept': 'application/json' } }
            )
            if (_r3.data && _r3.data.status) {
              _hasil = _r3.data
              _apiSource = 'Siputzx'
            }
          } catch (_ea3) {}
        }

        // ── API 4: Scraper khusus per operator ─────────────────────────
        if (!_hasil) {
          // Telkomsel — MyTelkomsel API publik
          if (_operator.kode === 'telkomsel' || _operator.kode === 'byu') {
            try {
              const _r4 = await axios.get(
                `https://my.telkomsel.com/api/v2/customer/profile?msisdn=${_nomorNorm}`,
                { timeout: 10000, headers: {
                  'User-Agent': 'Mozilla/5.0 (Android 12) AppleWebKit/537.36',
                  'Accept': 'application/json',
                  'x-api-key': 'telkomsel-public-v2'
                }}
              )
              if (_r4.data) { _hasil = _r4.data; _apiSource = 'MyTelkomsel' }
            } catch (_ea4t) {}
          }

          // Indosat — myIM3 API publik
          if (!_hasil && _operator.kode === 'indosat') {
            try {
              const _r4i = await axios.post(
                `https://myim3.indosatooredoo.com/api/v1/cek-kuota`,
                { msisdn: _nomorNorm },
                { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
              )
              if (_r4i.data) { _hasil = _r4i.data; _apiSource = 'myIM3' }
            } catch (_ea4i) {}
          }

          // XL / Axis — myXL API
          if (!_hasil && (_operator.kode === 'xl' || _operator.kode === 'axis')) {
            try {
              const _r4x = await axios.get(
                `https://api.myxl.xlaxiata.co.id/customer/v2/info?msisdn=${_nomorNorm}`,
                { timeout: 10000, headers: { 'Accept': 'application/json', 'User-Agent': 'myXL/5.0' } }
              )
              if (_r4x.data) { _hasil = _r4x.data; _apiSource = 'myXL' }
            } catch (_ea4x) {}
          }

          // Tri — BIMAsatu/Tri API
          if (!_hasil && _operator.kode === 'tri') {
            try {
              const _r4tri = await axios.get(
                `https://bima.tri.co.id/api/v2/subscriber/${_nomorNorm}/quota`,
                { timeout: 10000, headers: { 'Accept': 'application/json', 'User-Agent': 'BIMA/3.0' } }
              )
              if (_r4tri.data) { _hasil = _r4tri.data; _apiSource = 'BIMAsatu (Tri)' }
            } catch (_ea4tri) {}
          }

          // Smartfren — MySmartfren API
          if (!_hasil && _operator.kode === 'smartfren') {
            try {
              const _r4sf = await axios.get(
                `https://api.mysmartfren.com/v1/subscriber/info?msisdn=${_nomorNorm}`,
                { timeout: 10000, headers: { 'Accept': 'application/json', 'User-Agent': 'MySmartfren/2.0' } }
              )
              if (_r4sf.data) { _hasil = _r4sf.data; _apiSource = 'MySmartfren' }
            } catch (_ea4sf) {}
          }
        }

        // ─── Render output ─────────────────────────────────────────────
        // Jika dapat data dari API nyata, tampilkan
        if (_hasil && _apiSource) {
          // Normalisasi field dari berbagai API
          const _pulsa   = _hasil.pulsa || _hasil.balance || _hasil.saldo || _hasil.credit || _hasil.data?.balance || null
          const _kuotaU  = _hasil.kuota_utama || _hasil.main_quota || _hasil.data_quota || _hasil.quota?.main || _hasil.data?.quota || null
          const _kuotaN  = _hasil.kuota_malam || _hasil.night_quota || _hasil.quota?.night || null
          const _kuotaL  = _hasil.kuota_lokal || _hasil.local_quota || _hasil.quota?.local || null
          const _kuotaB  = _hasil.bonus_kuota  || _hasil.bonus_quota || _hasil.quota?.bonus || null
          const _expired = _hasil.expired || _hasil.expiry_date || _hasil.masa_aktif || _hasil.data?.expired || null
          const _nama    = _hasil.nama || _hasil.name || _hasil.subscriber_name || null

          let _msgOut =
            `╔══〔 ${_operator.emoji} *INFO NOMOR* 〕══╗\n` +
            `┃ 📱 Nomor    : *${_nomorLokal}*\n` +
            `┃ 📡 Operator : *${_operator.nama}*\n` +
            (_nama ? `┃ 👤 Nama     : *${_nama}*\n` : '') +
            `╚══════════════════════════╝\n\n`

          if (_isCekPulsa) {
            _msgOut += `💰 *INFO PULSA / SALDO*\n`
            _msgOut += `┣ Saldo    : *${_pulsa !== null ? `Rp ${Number(_pulsa).toLocaleString('id-ID')}` : 'Tidak tersedia'}*\n`
            _msgOut += (_expired ? `┣ Aktif s/d: *${_expired}*\n` : '')
            _msgOut += `┗━━━━━━━━━━━━━━━━━━━\n`
          } else {
            _msgOut += `📶 *INFO KUOTA INTERNET*\n`
            _msgOut += `┣ Kuota Utama : *${_kuotaU || 'Tidak tersedia'}*\n`
            if (_kuotaN) _msgOut += `┣ Kuota Malam : *${_kuotaN}*\n`
            if (_kuotaL) _msgOut += `┣ Kuota Lokal : *${_kuotaL}*\n`
            if (_kuotaB) _msgOut += `┣ Bonus Kuota : *${_kuotaB}*\n`
            _msgOut += (_expired ? `┣ Berlaku s/d : *${_expired}*\n` : '')
            _msgOut += `┗━━━━━━━━━━━━━━━━━━━━━\n`
          }

          _msgOut += `\n📌 _Sumber: ${_apiSource}_\n`
          _msgOut += `_Untuk info akurat, cek via aplikasi resmi operator_`

          await alya.sendMessage(m.chat, { text: _msgOut }, { quoted: m })
          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        }

        // ─── Fallback: info operator + tips cek mandiri ────────────────
        // API tidak bisa diakses tanpa autentikasi khusus nomor tsb
        const _tanggalNow = moment().tz('Asia/Jakarta').format('DD MMMM YYYY, HH:mm') + ' WIB'

        const _operatorGuide = {
          'telkomsel': {
            app: 'MyTelkomsel', ussd_kuota: '*888#', ussd_pulsa: '*888#',
            tips: ['Buka app *MyTelkomsel* → tab "Paket & Kuota"', 'Ketik *888# di dialer', 'SMS ke 3636: ketik KUOTA kirim ke 3636']
          },
          'byu': {
            app: 'By.U App', ussd_kuota: '*888#', ussd_pulsa: '*888#',
            tips: ['Buka app *By.U* → tab "Kuota Saya"', 'Ketik *888# di dialer']
          },
          'indosat': {
            app: 'myIM3', ussd_kuota: '*123#', ussd_pulsa: '*123#',
            tips: ['Buka app *myIM3* → tab "Paket"', 'Ketik *123# di dialer', 'SMS ke 363: ketik INFO kirim ke 363']
          },
          'xl': {
            app: 'myXL', ussd_kuota: '*123#', ussd_pulsa: '*123#',
            tips: ['Buka app *myXL* → tab "Kuota"', 'Ketik *123# di dialer', 'SMS ke 168: ketik KUOTA kirim ke 168']
          },
          'axis': {
            app: 'AXISnet', ussd_kuota: '*123#', ussd_pulsa: '*123#',
            tips: ['Buka app *AXISnet* → tab "Kuota"', 'Ketik *123# di dialer']
          },
          'tri': {
            app: 'BIMA+', ussd_kuota: '*111#', ussd_pulsa: '*111#',
            tips: ['Buka app *BIMA+* → tab "Kuota"', 'Ketik *111# di dialer', 'SMS ke 234: ketik INFO kirim ke 234']
          },
          'smartfren': {
            app: 'MySmartfren', ussd_kuota: '*999#', ussd_pulsa: '*999#',
            tips: ['Buka app *MySmartfren* → tab "Paket"', 'Ketik *999# di dialer']
          },
          'unknown': {
            app: 'Aplikasi Operator', ussd_kuota: '*888# / *123# / *111#', ussd_pulsa: '*888#',
            tips: ['Cek via aplikasi resmi operator', 'Ketik USSD sesuai operator']
          }
        }

        const _guide = _operatorGuide[_operator.kode] || _operatorGuide['unknown']

        let _fallbackMsg =
          `╔══〔 ${_operator.emoji} *CEK ${_isCekPulsa ? 'PULSA' : 'KUOTA'}* 〕══╗\n` +
          `┃ 📱 Nomor    : *${_nomorLokal}*\n` +
          `┃ 📡 Operator : *${_operator.nama}*\n` +
          `┃ 🕐 Dicek    : ${_tanggalNow}\n` +
          `╚══════════════════════════╝\n\n` +
          `⚠️ _API operator memerlukan autentikasi langsung dari perangkat nomor tersebut._\n\n` +
          `📲 *Cara cek ${_isCekPulsa ? 'pulsa' : 'kuota'} ${_operator.nama}:*\n` +
          _guide.tips.map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\n' +
          `📱 *App resmi:* ${_guide.app}\n` +
          `📟 *USSD:* \`${_isCekPulsa ? _guide.ussd_pulsa : _guide.ussd_kuota}\`\n\n` +
          `💡 _Ketik USSD di dialer HP dengan nomor *${_nomorLokal}* yang aktif_`

        await alya.sendMessage(m.chat, { text: _fallbackMsg }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (_ecq) {
        console.error('[CEKKUOTA/CEKPULSA] error:', _ecq.message)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya(`❌ Gagal memproses permintaan.\n\nCoba lagi sebentar ya~ 🙏`)
      }
    }

    // ============================================================
    // FITUR BELAJAR BAHASA JEPANG
    // ============================================================
  }
