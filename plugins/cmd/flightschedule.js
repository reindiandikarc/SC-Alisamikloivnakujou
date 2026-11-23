// Plugin: flightschedule
// Auto-generated from Alya V12
// Commands: jadwalpesawat, flightschedule

const path = require('path')

module.exports = {
  command: ["jadwalpesawat", "flightschedule"],
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

      const _bdMap = {
        'CGK':'Soekarno-Hatta (Jakarta)','HLP':'Halim Perdanakusuma (Jakarta)',
        'DPS':'Ngurah Rai (Bali)','SUB':'Juanda (Surabaya)',
        'UPG':'Sultan Hasanuddin (Makassar)','KNO':'Kualanamu (Medan)',
        'BDO':'Husein Sastranegara (Bandung)','SOC':'Adi Soemarmo (Solo)',
        'JOG':'Adisucipto/YIA (Yogyakarta)','SRG':'Ahmad Yani (Semarang)',
        'PLM':'Sultan Mahmud Badaruddin (Palembang)','PKU':'Sultan Syarif Kasim (Pekanbaru)',
        'BPN':'Sultan Aji Muhammad (Balikpapan)','PNK':'Supadio (Pontianak)',
        'MDC':'Sam Ratulangi (Manado)','AMQ':'Pattimura (Ambon)',
        'DJJ':'Sentani (Jayapura)','BTH':'Hang Nadim (Batam)',
        'LOP':'Zainuddin Abdul Madjid (Lombok)','TIM':'Mozes Kilangin (Timika)'
      }

      const _bdHelp =
        `✈️ *Jadwal Penerbangan Indonesia*\n\n` +
        `*Cara pakai:*\n` +
        `• *${prefix}bandarajadwal [asal] [tujuan] [tanggal]*\n` +
        `  Contoh: *${prefix}bandarajadwal CGK DPS 2025-06-01*\n\n` +
        `*Kode Bandara Populer:*\n` +
        Object.entries(_bdMap).slice(0, 12).map(([k, v]) => `┣ ${k} — ${v}`).join('\n') +
        `\n\n*Format tanggal:* YYYY-MM-DD\n` +
        `_Jika tanggal tidak diisi, otomatis hari ini_`

      if (!text) return replyalya(_bdHelp)

      const _bdArgs = text.trim().split(/\s+/)
      if (_bdArgs.length < 2) return replyalya(_bdHelp)

      const _bdOri  = _bdArgs[0].toUpperCase()
      const _bdDest = _bdArgs[1].toUpperCase()
      const _bdDate = _bdArgs[2] || moment().tz('Asia/Jakarta').format('YYYY-MM-DD')

      if (!/^\d{4}-\d{2}-\d{2}$/.test(_bdDate)) {
        return replyalya(`❌ Format tanggal salah! Gunakan *YYYY-MM-DD* (contoh: 2025-06-01)`)
      }

      try {
        await alya.sendMessage(m.chat, { react: { text: '✈️', key: m.key } })

        let _bdData = null
        let _bdSource = ''

        // API 1: AviationStack (free tier)
        try {
          const _rb1 = await axios.get(
            `https://api.aviationstack.com/v1/flights?access_key=demo&dep_iata=${_bdOri}&arr_iata=${_bdDest}&flight_date=${_bdDate}&limit=10`,
            { timeout: 10000 }
          )
          if (_rb1.data && _rb1.data.data && _rb1.data.data.length > 0) {
            _bdData = _rb1.data.data
            _bdSource = 'AviationStack'
          }
        } catch (_eb1) {}

        // API 2: GoFlightLabs fallback
        if (!_bdData) {
          try {
            const _rb2 = await axios.get(
              `https://app.goflightlabs.com/flights?access_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9&dep_iata=${_bdOri}&arr_iata=${_bdDest}&flight_date=${_bdDate}`,
              { timeout: 10000 }
            )
            if (_rb2.data && _rb2.data.data && _rb2.data.data.length > 0) {
              _bdData = _rb2.data.data
              _bdSource = 'GoFlightLabs'
            }
          } catch (_eb2) {}
        }

        // Fallback statis jika semua API gagal
        if (!_bdData) {
          const _oriNameB  = _bdMap[_bdOri]  || _bdOri
          const _destNameB = _bdMap[_bdDest] || _bdDest
          const _tanggalFmtB = moment(_bdDate, 'YYYY-MM-DD').locale('id').format('dddd, D MMMM YYYY')

          const _estFlights = [
            { maskapai:'Garuda Indonesia', kode:'GA-401',  dep:'06:00', arr:'07:30', kelas:'Ekonomi',   harga:850000 },
            { maskapai:'Lion Air',         kode:'JT-015',  dep:'07:15', arr:'08:45', kelas:'Ekonomi',   harga:620000 },
            { maskapai:'Citilink',         kode:'QG-175',  dep:'09:00', arr:'10:25', kelas:'Ekonomi',   harga:590000 },
            { maskapai:'Batik Air',        kode:'ID-6383', dep:'10:40', arr:'12:10', kelas:'Bisnis',    harga:1350000 },
            { maskapai:'AirAsia',          kode:'QZ-7541', dep:'12:30', arr:'14:00', kelas:'Ekonomi',   harga:570000 },
            { maskapai:'Sriwijaya Air',    kode:'SJ-021',  dep:'14:20', arr:'15:50', kelas:'Ekonomi',   harga:680000 },
            { maskapai:'Garuda Indonesia', kode:'GA-409',  dep:'16:00', arr:'17:30', kelas:'Eksekutif', harga:2100000 },
            { maskapai:'Lion Air',         kode:'JT-023',  dep:'17:45', arr:'19:15', kelas:'Ekonomi',   harga:650000 },
            { maskapai:'Citilink',         kode:'QG-183',  dep:'19:30', arr:'21:00', kelas:'Ekonomi',   harga:610000 },
            { maskapai:'Batik Air',        kode:'ID-6391', dep:'21:00', arr:'22:30', kelas:'Ekonomi',   harga:720000 },
          ]

          let _bdMsg2 =
            `╔══〔 ✈️ *JADWAL PENERBANGAN* 〕══╗\n` +
            `┃ 🛫 Dari   : *${_oriNameB}* (${_bdOri})\n` +
            `┃ 🛬 Tujuan : *${_destNameB}* (${_bdDest})\n` +
            `┃ 📅 Tanggal: *${_tanggalFmtB}*\n` +
            `╚════════════════════════════╝\n` +
            `⚠️ _*Jadwal estimasi* — API tidak tersedia saat ini_\n\n`

          _estFlights.forEach((_f, _i) => {
            _bdMsg2 +=
              `*${_i + 1}. ${_f.maskapai}* — \`${_f.kode}\`\n` +
              `   🕐 Berangkat : *${_f.dep}*  ✈️  🏁 Tiba: *${_f.arr}*\n` +
              `   💺 Kelas     : ${_f.kelas}\n` +
              `   💰 Mulai dari: *Rp ${_f.harga.toLocaleString('id-ID')}*\n` +
              `   ─────────────────────────\n`
          })

          _bdMsg2 +=
            `\n📌 _Harga perkiraan, bukan harga final_\n` +
            `🎫 _Pesan tiket di: *Traveloka, Tiket.com, AirAsia App*_`

          await alya.sendMessage(m.chat, { text: _bdMsg2 }, { quoted: m })
          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        }

        // Output dari API nyata
        const _oriNameBR  = _bdMap[_bdOri]  || _bdOri
        const _destNameBR = _bdMap[_bdDest] || _bdDest
        const _tanggalFmtBR = moment(_bdDate, 'YYYY-MM-DD').locale('id').format('dddd, D MMMM YYYY')

        let _bdMsg =
          `╔══〔 ✈️ *JADWAL PENERBANGAN* 〕══╗\n` +
          `┃ 🛫 Dari   : *${_oriNameBR}* (${_bdOri})\n` +
          `┃ 🛬 Tujuan : *${_destNameBR}* (${_bdDest})\n` +
          `┃ 📅 Tanggal: *${_tanggalFmtBR}*\n` +
          `┃ ✈️ Tersedia: *${_bdData.length} penerbangan*\n` +
          `╚══════════════════════════════╝\n\n`

        _bdData.slice(0, 10).forEach((_f, _i) => {
          const _maskapai = _f.airline?.name || _f.airline_name || _f.carrier || `Maskapai ${_i + 1}`
          const _kode3    = _f.flight?.iata  || _f.flight_iata  || _f.flight_number || '-'
          const _dep3     = _f.departure?.scheduled || _f.dep_time || _f.departure || '-'
          const _arr3     = _f.arrival?.scheduled   || _f.arr_time || _f.arrival   || '-'
          const _status3  = _f.flight_status || _f.status || ''
          const _harga3   = _f.price || _f.fare || 0

          let _depFmt3 = _dep3, _arrFmt3 = _arr3
          if (_dep3 && _dep3.includes('T')) _depFmt3 = moment(_dep3).tz('Asia/Jakarta').format('HH:mm')
          if (_arr3 && _arr3.includes('T')) _arrFmt3 = moment(_arr3).tz('Asia/Jakarta').format('HH:mm')

          _bdMsg +=
            `*${_i + 1}. ${_maskapai}* — \`${_kode3}\`\n` +
            `   🕐 Berangkat : *${_depFmt3}*\n` +
            `   🏁 Tiba      : *${_arrFmt3}*\n` +
            (_status3 ? `   📌 Status    : ${_status3}\n` : '') +
            (_harga3 > 0 ? `   💰 Harga    : *Rp ${Number(_harga3).toLocaleString('id-ID')}*\n` : '') +
            `   ─────────────────────────\n`
        })

        _bdMsg +=
          `\n📌 _Sumber: ${_bdSource}_\n` +
          `🎫 _Pesan tiket di: Traveloka, Tiket.com, atau app maskapai_`

        await alya.sendMessage(m.chat, { text: _bdMsg }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (_ebd) {
        console.error('[BANDARAJADWAL] error:', _ebd.message)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya(
          `❌ Gagal mengambil jadwal penerbangan.\n\n` +
          `Silakan cek langsung di *Traveloka*, *Tiket.com*, atau website maskapai~ ✈️`
        )
      }
    }

    // ============================================================
    // ALYA V12 - .cekkuota & .cekpulsa
    // Cek Kuota Internet & Pulsa semua operator Indonesia
    // Support: Telkomsel, Indosat, XL, Tri (3), Smartfren, By.U
    // Penggunaan:
    //   .cekkuota <nomor>   → Info kuota internet aktif
    //   .cekpulsa <nomor>   → Info saldo pulsa
    // ============================================================
  }
