// Plugin: virtusim
// Auto-generated from Alya V12
// Commands: virtusim

const path = require('path')

module.exports = {
  command: ["virtusim"],
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

      if (!Ryuu) return replytolak(mess.only.owner)
      const axios = require('axios')
      const API_KEY = global.virtuSimApiKey
      const BASE_URL = 'https://virtusim.com/api/v2/json.php'

      if (!args.length) {
        return m.reply(`Gunakan format:
    - *virtusim saldo*
    - *virtusim deposit <nominal min 5k>*
    - *virtusim listnegara*
    - *virtusim listlayanan <negara>*
    - *virtusim buynokos <negara> <layanan>*
    - *virtusim cekotp <id>*
    - *virtusim cancelotp <id>*
    - *virtusim historyotp*`);
      }

      const pilihan = args[0].toLowerCase();
      const arg = args.slice(1);

      try {
        switch (pilihan) {
          case 'saldo': {
          if (!Ryuu) return replytolak(mess.only.owner)
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=balance`)
            const data = res.data
            if (!data?.status) return m.reply(`🚩 Gagal mengambil data saldo.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            return m.reply(`👤 *Akun VirtuSim*

    🪪 Nama: ${data.full_name}
    🔑 Username: ${data.username}
    💰 Saldo: ${data.balance} (USD ${data.usd_balance})
    📱 WhatsApp: ${data.whatsapp}`)
          }
          case 'deposit': {
          if (!Ryuu) return replytolak(mess.only.owner)
            if (!arg[0] || isNaN(arg[0])) return m.reply('🚩 Contoh: virtusim deposit 5000')
            const amount = parseInt(arg[0])
            if (amount < 5000) return m.reply('🚩 Minimal deposit 5000.')
            const phone = '85187063723'
            const method = 20
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=deposit&method=${method}&amount=${amount}&phone=${phone}`)
            const data = res.data?.data
            if (!data?.id || !data?.qr) return m.reply(`🚩 Gagal membuat deposit.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            return alya.sendMessage(m.chat, {
              image: { url: data.qr },
              caption: `🧾 *DEPOSIT DIBUAT*

    🆔 ID: ${data.id}
    💳 Metode: ${data.method}
    💰 Ditransfer: Rp${data.balance_pay.toLocaleString('id-ID')}
    📥 Masuk ke saldo: Rp${data.balance_receive.toLocaleString('id-ID')}

    📌 Note: ${data.note}`
            }, { quoted: m })
          }
          case 'listnegara': {
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=list_country`)
            if (!res.data?.status) return m.reply(`🚩 Gagal memuat negara.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            const seen = new Set()
            const list = res.data.data.filter(c => !seen.has(c.country_name) && seen.add(c.country_name)).map(c => `🌍 ${c.country_name}`).join('\n')
            return m.reply(`📡 Daftar Negara:\n\n${list}`)
          }
          case 'listlayanan': {
            if (!arg[0]) return m.reply('🚩 Contoh: virtusim listlayanan Indonesia')
            const negara = arg.join(' ')
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=list_operator&country=${negara}`)
            if (!res.data?.status) return m.reply(`🚩 Gagal memuat layanan.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            const layanan = res.data.data.map(o => `• ${o}`).join('\n')
            return m.reply(`📶 Layanan di ${negara}:\n\n${layanan}`)
          }
          case 'buynokos': case 'buy': {
      if (!Ryuu) return replytolak(mess.only.owner)
      if (arg.length < 2) return m.reply('🚩 Contoh: virtusim buynokos indonesia whatsapp')
      const negara = arg[0]
      const keyword = arg.slice(1).join(' ').toLowerCase()

      const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=services&country=${negara}`)
      const layananList = Array.isArray(res.data?.data) ? res.data.data : []
      if (!layananList.length) return m.reply(`🚩 Tidak ada layanan ditemukan.\n💬 ${res.data?.message || 'Tidak diketahui'}`)

      const layananData = layananList.find(s => keyword.split(' ').every(k => s.name?.toLowerCase().includes(k)))
      if (!layananData) return m.reply('🚩 Layanan tidak ditemukan.')
      if (parseInt(layananData.stock) <= 0) return m.reply('🚩 Stok nomor untuk layanan ini sedang habis.')

      const harga = Math.ceil(parseInt(layananData.price))
      const saldoRes = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=balance`)
      const saldoVirtu = parseInt(saldoRes.data?.balance || 0)
      if (saldoVirtu < harga) return m.reply(`🚩 Saldo tidak cukup.\n💰 Dibutuhkan: ${harga}\n💳 Saldo saat ini: ${saldoVirtu}`)

      const order = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=order&service=${layananData.id}&operator=any`)
      if (!order.data?.data?.id) return m.reply(`🚩 Gagal membeli nomor.\n💬 ${order.data?.message || 'Tidak diketahui'}`)
      const data = order.data.data

      // Push ke DB
      global.db.users[m.sender].nokos_orders = global.db.users[m.sender].nokos_orders || []
      global.db.users[m.sender].nokos_orders.push({
        id: data.id,
        number: data.number,
        service: layananData.name,
        status: 'waiting',
        created: Date.now()
      })

      m.reply(`✅ Nomor Berhasil Dibeli\n\n📱 Nomor: ${data.number}\n🆔 ID: ${data.id}\n📡 Layanan: ${layananData.name}\n🌍 Negara: ${negara}\n\nMenunggu OTP...`)

      // Aktifkan nomor otomatis
      await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=set_status&id=${data.id}&status=1`) // 1 = Ready

      // Cek OTP otomatis
      let statusChecked = false
      let polling = setInterval(async () => {
        try {
          const status = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=status&id=${data.id}`)
          const sms = status.data?.data?.sms
          if (sms && typeof sms === 'string' && sms !== '-' && !statusChecked) {
            clearInterval(polling)
            statusChecked = true
            await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=set_status&id=${data.id}&status=4`) // 4 = Finish
            return m.reply(`📬 OTP Masuk:\n\n📩 ${sms}`)
          }
        } catch (e) {
          console.error('Polling error:', e)
        }
      }, 5000)

      // Auto cancel setelah 10 menit jika tidak ada OTP
      setTimeout(async () => {
        if (!statusChecked) {
          clearInterval(polling)
          await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=set_status&id=${data.id}&status=2`) // 2 = Cancel
          global.db.users[m.sender].nokos_orders = global.db.users[m.sender].nokos_orders.map(o =>
            o.id == data.id ? { ...o, status: 'cancelled' } : o
          )
          return m.reply('⏱️ OTP tidak masuk dalam 10 menit. Order dibatalkan otomatis.')
        }
      }, 10 * 60 * 1000)

    }
          case 'cekotp': {
          if (!Ryuu) return replytolak(mess.only.owner)
            if (!arg[0]) return m.reply('🚩 Contoh: virtusim cekotp 123456')
            const id = arg[0]
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=status&id=${id}`)
            const sms = res.data?.data?.sms
            if (!sms || sms === '-' || sms.length === 0) return m.reply(`📭 Belum ada OTP masuk.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            return m.reply(`📬 OTP Masuk:\n\n📩 ${sms}`)
          }
          case 'cancelotp': {
          if (!Ryuu) return replytolak(mess.only.owner)
            if (!arg[0]) return m.reply('🚩 Contoh: virtusim batalkanotp 123456')
            const id = arg[0]
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=set_status&id=${id}&status=2`)
            if (res.data.status) {
              global.db.users[m.sender].nokos_orders = global.db.users[m.sender].nokos_orders.map(o => o.id == id ? { ...o, status: 'cancelled' } : o)
              return m.reply('✅ Order berhasil dibatalkan.')
            } else return m.reply(`🚩 Gagal membatalkan order.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
          }
          case 'historyotp': {
          if (!Ryuu) return replytolak(mess.only.owner)
            const res = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=order_history`)
            const list = Array.isArray(res.data?.data) ? res.data.data : []
            if (!list.length) return m.reply(`🚩 Tidak ada riwayat ditemukan.
    💬 ${res.data?.message || 'Tidak diketahui'}`)
            const history = list.map(o => `Id: ${o.id}\nOrder: ${o.service_name}\nNomor: ${o.data}\nHarga: ${o.price}\nSMS: ${o.sms && o.sms !== '-' ? o.sms : 'Belum ada'}\nStatus: ${o.status}\nRefund: ${o.is_refund === '1' ? 'Refund' : 'No Refund'}\nWaktu: ${o.created_at}`).join('\n\n──────────────────\n\n')
            return m.reply(`📜 *Riwayat OTP:*\n\n${history}`)
          }
          default: {
            return m.reply('🚩 Pilihan tidak dikenal. Ketik *virtusim* untuk bantuan.');
          }
        }
      } catch (e) {
        console.error(e)
        return m.reply(`🚩 Error:\n${e.message}`)
      }
  }
}
