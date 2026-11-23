// Plugin: jadwalkereta
// Auto-generated from Alya V12
// Commands: jadwalkereta

const path = require('path')

module.exports = {
  command: ["jadwalkereta"],
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

      const _fmtDur = (mins) => {
        const h = Math.floor(mins / 60)
        const m2 = mins % 60
        return h > 0 ? `${h}j ${m2}m` : `${m2}m`
      }

      const _kaiHelp =
        `🚆 *Jadwal Kereta Api Indonesia*\n\n` +
        `*Cara pakai:*\n` +
        `• *${prefix}kaijadwal [asal] [tujuan] [tanggal]*\n` +
        `  Contoh: *${prefix}kaijadwal GMR YK 2025-06-01*\n\n` +
        `*Kode Stasiun Populer:*\n` +
        `┣ GMR — Gambir (Jakarta)\n` +
        `┣ PSE — Pasar Senen (Jakarta)\n` +
        `┣ BD  — Bandung\n` +
        `┣ YK  — Yogyakarta\n` +
        `┣ SLO — Solo Balapan\n` +
        `┣ SMT — Semarang Tawang\n` +
        `┣ SGU — Surabaya Gubeng\n` +
        `┣ SBI — Surabaya Turi\n` +
        `┣ MLG — Malang\n\n` +
        `*Format tanggal:* YYYY-MM-DD\n` +
        `_Jika tanggal tidak diisi, otomatis hari ini_`

      if (!text) return replyalya(_kaiHelp)

      const _kaiArgs = text.trim().split(/\s+/)
      if (_kaiArgs.length < 2) return replyalya(_kaiHelp)

      const _kaiOri  = _kaiArgs[0].toUpperCase()
      const _kaiDest = _kaiArgs[1].toUpperCase()
      const _kaiDate = _kaiArgs[2] || moment().tz('Asia/Jakarta').format('YYYY-MM-DD')

      if (!/^\d{4}-\d{2}-\d{2}$/.test(_kaiDate)) {
        return replyalya(`❌ Format tanggal salah! Gunakan format *YYYY-MM-DD*\nContoh: *2025-06-01*`)
      }

      try {
        await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

        let _kaiData = null
        let _kaiSource = ''

        // API 1: KAI Access via proxy publik
        try {
          const _r1 = await axios.get(
            `https://api-kai-access.vercel.app/api/v1/trains?origin=${_kaiOri}&destination=${_kaiDest}&departure_date=${_kaiDate}`,
            { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlyaBot/1.0)' } }
          )
          if (_r1.data && (_r1.data.data || _r1.data.trains || Array.isArray(_r1.data))) {
            _kaiData = _r1.data.data || _r1.data.trains || _r1.data
            _kaiSource = 'KAI Access'
          }
        } catch (_e1) {}

        // API 2: Fallback scraper KAI
        if (!_kaiData || (Array.isArray(_kaiData) && _kaiData.length === 0)) {
          try {
            const _r2 = await axios.get(
              `https://tiket.com/api/v2/train/schedule?origin=${_kaiOri}&destination=${_kaiDest}&date=${_kaiDate}&pax=1`,
              { timeout: 12000, headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
            )
            if (_r2.data && _r2.data.data && _r2.data.data.length > 0) {
              _kaiData = _r2.data.data
              _kaiSource = 'Tiket.com'
            }
          } catch (_e2) {}
        }

        // Fallback statis jika API tidak responsif
        if (!_kaiData || (Array.isArray(_kaiData) && _kaiData.length === 0)) {
          const _tanggalFmtK = moment(_kaiDate, 'YYYY-MM-DD').locale('id').format('dddd, D MMMM YYYY')
          const _stasiunMap = {
            'GMR':'Gambir','PSE':'Pasar Senen','BD':'Bandung','YK':'Yogyakarta',
            'SLO':'Solo Balapan','SMT':'Semarang Tawang','SGU':'Surabaya Gubeng',
            'SBI':'Surabaya Turi','MLG':'Malang','KPR':'Kiaracondong',
            'BI':'Bogor','MRI':'Manggarai','JNG':'Jatinegara'
          }
          const _oriName2  = _stasiunMap[_kaiOri]  || _kaiOri
          const _destName2 = _stasiunMap[_kaiDest] || _kaiDest

          const _estTrains = [
            { nama:'Argo Bromo Anggrek', dep:'06:00', arr:'17:30', kelas:'Eksekutif', harga:875000 },
            { nama:'Argo Wilis',          dep:'07:00', arr:'16:20', kelas:'Eksekutif', harga:790000 },
            { nama:'Gajayana',            dep:'08:15', arr:'19:45', kelas:'Eksekutif', harga:820000 },
            { nama:'Sembrani',            dep:'10:00', arr:'21:15', kelas:'Eksekutif', harga:750000 },
            { nama:'Senja Utama',         dep:'17:30', arr:'04:20', kelas:'Bisnis',    harga:420000 },
            { nama:'Brantas',             dep:'19:00', arr:'06:45', kelas:'Ekonomi',   harga:290000 },
            { nama:'Kertajaya',           dep:'20:30', arr:'07:15', kelas:'Ekonomi',   harga:280000 },
            { nama:'Mataram',             dep:'22:00', arr:'09:30', kelas:'Bisnis',    harga:395000 },
          ]

          let _kaiMsg2 =
            `╔══〔 🚆 *JADWAL KERETA API* 〕══╗\n` +
            `┃ 🛤️ Rute  : *${_oriName2}* → *${_destName2}*\n` +
            `┃ 📅 Tanggal: *${_tanggalFmtK}*\n` +
            `╚══════════════════════════════╝\n` +
            `⚠️ _*Jadwal estimasi* — API KAI tidak tersedia saat ini_\n\n`

          _estTrains.forEach((_t, _i) => {
            _kaiMsg2 +=
              `*${_i + 1}. ${_t.nama}*\n` +
              `   🕐 Berangkat : *${_t.dep}*  →  🏁 Tiba: *${_t.arr}*\n` +
              `   💺 Kelas     : ${_t.kelas}\n` +
              `   💰 Mulai dari: *Rp ${_t.harga.toLocaleString('id-ID')}*\n` +
              `   ─────────────────────────\n`
          })

          _kaiMsg2 +=
            `\n📌 _Harga estimasi, bukan harga final_\n` +
            `🎫 _Pesan tiket resmi di: *kai.id* / app *KAI Access* 🚆_`

          await alya.sendMessage(m.chat, { text: _kaiMsg2 }, { quoted: m })
          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        }

        // Output dari API nyata
        const _stasiunMapR = {
          'GMR':'Gambir','PSE':'Pasar Senen','BD':'Bandung','YK':'Yogyakarta',
          'SLO':'Solo Balapan','SMT':'Semarang Tawang','SGU':'Surabaya Gubeng',
          'SBI':'Surabaya Turi','MLG':'Malang'
        }
        const _oriNameR3  = _stasiunMapR[_kaiOri]  || _kaiOri
        const _destNameR3 = _stasiunMapR[_kaiDest] || _kaiDest
        const _tanggalFmtR = moment(_kaiDate, 'YYYY-MM-DD').locale('id').format('dddd, D MMMM YYYY')
        const _kaiList = Array.isArray(_kaiData) ? _kaiData.slice(0, 10) : []

        let _kaiMsg =
          `╔══〔 🚆 *JADWAL KERETA API* 〕══╗\n` +
          `┃ 🛤️ Rute  : *${_oriNameR3}* → *${_destNameR3}*\n` +
          `┃ 📅 Tanggal: *${_tanggalFmtR}*\n` +
          `┃ 🎫 Tersedia: *${_kaiList.length} kereta*\n` +
          `╚══════════════════════════════╝\n\n`

        _kaiList.forEach((_t, _i) => {
          const _nama  = _t.train_name || _t.trainName || _t.name || _t.train || `Kereta ${_i + 1}`
          const _kelas = _t.subclass || _t.seat_class || _t.class || _t.kelas || ''
          const _dep2  = _t.departure_time || _t.dep_time || _t.berangkat || _t.departure || '-'
          const _arr2  = _t.arrival_time   || _t.arr_time || _t.tiba     || _t.arrival   || '-'
          const _harga2 = _t.price || _t.fare || _t.tarif || 0
          const _kursi = _t.available_seats || _t.seat_available || _t.sisa || _t.available || ''
          const _dur2  = _t.duration_minutes || _t.duration || ''

          _kaiMsg +=
            `*${_i + 1}. ${_nama}*${_kelas ? ` (${_kelas})` : ''}\n` +
            `   🕐 Berangkat : *${_dep2}*\n` +
            `   🏁 Tiba      : *${_arr2}*\n` +
            (_dur2 ? `   ⏱️ Durasi   : ${typeof _dur2 === 'number' ? _fmtDur(_dur2) : _dur2}\n` : '') +
            (_harga2 > 0 ? `   💰 Harga    : *Rp ${Number(_harga2).toLocaleString('id-ID')}*\n` : '') +
            (_kursi !== '' ? `   💺 Tersedia : *${_kursi} kursi*\n` : '') +
            `   ─────────────────────\n`
        })

        _kaiMsg +=
          `\n📌 _Sumber: ${_kaiSource}_\n` +
          `🔔 _Pesan tiket resmi di kai.id atau app KAI Access_`

        await alya.sendMessage(m.chat, { text: _kaiMsg }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (_ekai) {
        console.error('[KAIJADWAL] error:', _ekai.message)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya(
          `❌ Gagal mengambil jadwal kereta.\n\n` +
          `Mungkin API KAI sedang tidak responsif.\n` +
          `Coba cek langsung di: *kai.id* atau app *KAI Access* 🚆`
        )
      }
    }

    // ============================================================
    // ALYA V12 - .bandarajadwal
    // Jadwal Penerbangan Pesawat di Indonesia
    // Penggunaan: .bandarajadwal [kode_bandara_asal] [kode_bandara_tujuan] [tanggal]
    // Contoh: .bandarajadwal CGK DPS 2025-06-01
    // ============================================================
  }
