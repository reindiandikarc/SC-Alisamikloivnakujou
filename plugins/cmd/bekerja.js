// Plugin: bekerja
// Ported from Alya V10
// Commands: kerja, bekerja

const path = require('path')

module.exports = {
  command: ["kerja", "bekerja"],
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

    const { generateWAMessageFromContent } = require("@whiskeysockets/baileys")
        if (!m.isGroup) return replytolak(mess.only.group)

        function clockString(ms) {
            let h = Math.floor(ms / 3600000)
            let mnt = Math.floor(ms / 60000) % 60
            let s = Math.floor(ms / 1000) % 60
            return [h, mnt, s].map(v => v.toString().padStart(2, 0)).join(':')
        }

        let userData = global.db.users[m.sender]
        if (!userData) return replyalya("User tidak ditemukan!")

        userData.money = userData.money || 0
        userData.stamina = userData.stamina || 100
        userData.lastkerja = userData.lastkerja || 0
        userData.level = userData.level || 0
        userData.exp = userData.exp || 0
        userData.role = userData.role || "Pemula"
        userData.pingsan = userData.pingsan || false

        let cooldown = 300000
        let jobType = (args[0] || '').toLowerCase()

        function random(list) {
            return list[Math.floor(Math.random() * list.length)]
        }

    let jobs = {
        ojek:{min:15000,max:90000,action:["🛵 Mengantar penumpang","📦 Mengirim paket","🌧️ Tetap narik saat hujan","💵 Mendapat tip dari pelanggan"]},
        pedagang:{min:30000,max:150000,action:["🛒 Dagangan laris manis","🌶️ Menjual cabai","🍗 Menjual ayam","🐟 Menjual ikan segar"]},
        dokter:{min:80000,max:250000,action:["🩺 Memeriksa pasien","💉 Melakukan tindakan medis","🚑 Menangani pasien IGD","🦴 Mengobati cedera"]},
        petani:{min:20000,max:120000,action:["🌾 Memanen padi","🍉 Memanen buah","🚜 Menggarap sawah","🌦️ Cuaca mendukung panen"]},
        montir:{min:40000,max:160000,action:["🚗 Memperbaiki mobil","🏍️ Servis motor","🛢️ Mengganti oli","⚡ Tune up kendaraan"]},
        kuli:{min:50000,max:170000,action:["🏗️ Membangun rumah","🛣️ Mengecor jalan","🏢 Proyek gedung","🔨 Kerja lapangan"]},
        programmer:{min:60000,max:250000,action:["💻 Mengerjakan coding","🐛 Memperbaiki bug","🌐 Deploy ke server","⚙️ Maintenance sistem"]},
        youtuber:{min:20000,max:300000,action:["🎥 Upload video","🔥 Video trending","💎 Mendapat sponsor","📱 Konten viral"]},
        polisi:{min:40000,max:180000,action:["🚔 Patroli wilayah","🔎 Menyelidiki kasus","🛡️ Menjaga keamanan","🚨 Menangkap pelaku"]},
        guru:{min:30000,max:140000,action:["📚 Mengajar di kelas","📝 Mengadakan ujian","🎓 Mengajar bimbel","📖 Menyiapkan materi"]},
        chef:{min:35000,max:160000,action:["👨‍🍳 Memasak pesanan","🍽️ Menangani catering","🍜 Membuat menu baru","📈 Restoran ramai"]},
        nelayan:{min:20000,max:110000,action:["🎣 Menangkap ikan","🌊 Laut sedang tenang","🐟 Hasil tangkapan banyak","🦐 Mendapat udang"]},
        driver:{min:25000,max:120000,action:["🚗 Mengantar penumpang","📦 Mengirim barang","💵 Mendapat tip besar","🛣️ Perjalanan jauh"]},
        cyber_security:{min:60000,max:220000,action:["🔐 Mengamankan sistem","🛡️ Mencegah serangan","💻 Audit keamanan","⚡ Menutup celah sistem"]},
        streamer:{min:20000,max:280000,action:["🎮 Live streaming","💸 Mendapat donasi","🔥 Banyak penonton","🌟 Masuk trending"]},
        desainer:{min:30000,max:180000,action:["🎨 Mendesain logo","📱 Mendesain UI/UX","💼 Mengerjakan project client","🏆 Menang lomba desain"]},
        barista:{min:20000,max:100000,action:["☕ Meracik kopi","🥤 Membuat minuman viral","🏪 Cafe ramai","💵 Mendapat tip"]},
        kurir:{min:25000,max:130000,action:["📦 Mengantar paket","🏃 Pengiriman cepat","📍 Orderan banyak","💸 Mendapat bonus"]},
        fotografer:{min:40000,max:200000,action:["📸 Memotret event","💼 Project client","🌄 Hunting foto","🏆 Ikut lomba"]},
        satpam:{min:20000,max:90000,action:["🛡️ Menjaga keamanan","📹 Memantau CCTV","🌙 Jaga malam","🚨 Mencegah pencurian"]},
        pilot:{min:100000,max:400000,action:["✈️ Menerbangkan pesawat","🌍 Rute penerbangan jauh","🛫 Landing dengan aman","💼 Jadwal padat"]},
        penulis:{min:20000,max:150000,action:["📖 Menulis buku","📝 Menulis artikel","💡 Mendapat ide baru","📚 Menyelesaikan naskah"]},
        atlet:{min:50000,max:250000,action:["🏆 Bertanding","🥇 Meraih kemenangan","🔥 Latihan intens","💸 Bonus sponsor"]},
        mekanik:{min:35000,max:140000,action:["🔧 Memperbaiki mesin","⚙️ Servis rutin","🚗 Overhaul mesin","💵 Mendapat bonus"]},
        peternak:{min:25000,max:130000,action:["🐄 Merawat ternak","🐔 Panen ayam","🥛 Menghasilkan susu","💰 Menjual hasil ternak"]},
        gamer:{min:20000,max:200000,action:["🎮 Main ranked","🏆 Ikut turnamen","🔥 Jadi MVP","💸 Mendapat hadiah"]},
        tukang_listrik:{min:30000,max:150000,action:["💡 Memperbaiki listrik","🔌 Instalasi kabel","🏠 Service rumah","⚡ Pemasangan listrik"]},
        tukang_kayu:{min:30000,max:140000,action:["🪵 Membuat furniture","🪑 Membuat kursi custom","🏠 Pengerjaan rumah","💼 Orderan meningkat"]},
        kasir:{min:20000,max:90000,action:["🧾 Melayani pembeli","💵 Menghitung uang","🏪 Toko ramai","📦 Mengatur stok"]},
        admin_kantor:{min:30000,max:120000,action:["📂 Input data","📧 Membalas email","📊 Membuat laporan","🖨️ Cetak dokumen"]},
        sales:{min:30000,max:200000,action:["📞 Mencari pelanggan","💼 Closing deal","🔥 Target tercapai","💸 Mendapat komisi"]},
        sopir_truk:{min:40000,max:180000,action:["🚚 Mengantar barang","🛣️ Perjalanan jauh","📦 Memuat barang","⛽ Mengisi BBM"]},
        penjaga_toko:{min:20000,max:100000,action:["🏪 Menjaga toko","📦 Menata barang","💵 Melayani pembeli","🧹 Membersihkan toko"]},
        cleaning_service:{min:20000,max:90000,action:["🧹 Membersihkan ruangan","🧼 Mengepel lantai","🪟 Membersihkan kaca","🏢 Gedung jadi bersih"]},
        security_it:{min:50000,max:200000,action:["🛡️ Monitoring server","⚠️ Mendeteksi ancaman","💻 Analisis log","🔐 Melindungi data"]},
        content_creator:{min:30000,max:220000,action:["📱 Membuat konten","🔥 Konten viral","💼 Mendapat endorse","📈 Followers meningkat"]},
        teknisi_hp:{min:30000,max:150000,action:["📱 Servis HP","🔋 Mengganti baterai","💻 Flash sistem","🛠️ Memperbaiki layar"]},
        apoteker:{min:40000,max:160000,action:["💊 Meracik obat","🧾 Melayani resep","🏥 Apotek ramai","📦 Mengatur stok obat"]},
        perawat:{min:30000,max:140000,action:["🩺 Merawat pasien","💉 Memberikan suntikan","🏥 Menjaga ruang","❤️ Membantu dokter"]},
        tukang_bangunan:{min:40000,max:170000,action:["🏗️ Membangun rumah","🔨 Memasang bata","🧱 Plester dinding","🏠 Finishing bangunan"]},
        operator_pabrik:{min:30000,max:130000,action:["🏭 Mengoperasikan mesin","⚙️ Proses produksi","📦 Packing barang","⏱️ Kerja shift"]},
        petugas_parkir:{min:15000,max:80000,action:["🅿️ Mengatur kendaraan","🚗 Parkir rapi","💵 Mendapat tip","🛵 Menjaga area"]},
        penjaga_warnet:{min:20000,max:90000,action:["💻 Menjaga warnet","🎮 Ramai pengunjung","💵 Mendapat bayaran","🌙 Jaga malam"]},
        tutor_online:{min:35000,max:150000,action:["💻 Mengajar via Zoom","📝 Membuat modul kursus","🎓 Membantu tugas siswa","🌟 Rating bintang 5"]},
        editor_video:{min:45000,max:190000,action:["🎬 Color grading","✂️ Memotong footage","🎥 Render project","🔥 Klien puas"]},
        arsitek:{min:70000,max:240000,action:["📐 Menggambar denah","🏢 Survey lokasi","🏠 Presentasi desain","🏗️ Meninjau proyek"]},
        penerjemah:{min:30000,max:130000,action:["🈂️ Menerjemahkan dokumen","🗣️ Menjadi interpreter","📖 Translate novel","🌍 Proyek internasional"]},
        makeup_artist:{min:40000,max:180000,action:["💄 Merias pengantin","🎨 Melakukan face paint","📸 Sesi photoshoot","✨ Hasil riasan cantik"]},
        penjahit:{min:25000,max:110000,action:["🪡 Mengukur baju","👗 Menjahit gaun","🧵 Memperbaiki pakaian","📏 Pola baju rapi"]},
        tukang_taman:{min:20000,max:95000,action:["🌳 Menata taman","🌻 Menanam bunga","✂️ Memangkas rumput","💧 Menyiram tanaman"]},
        akuntan:{min:50000,max:170000,action:["📊 Audit keuangan","🧾 Menghitung pajak","📁 Menyusun laporan","🔍 Menyeimbangkan buku"]},
        pengacara:{min:90000,max:300000,action:["⚖️ Memenangkan kasus","📂 Menyiapkan dokumen hukum","🏛️ Sidang di pengadilan","🤝 Mediasi klien"]},
        arsiparis:{min:25000,max:100000,action:["📁 Menyusun dokumen","🗄️ Menata gudang arsip","🔍 Mencari data lama","📦 Digitalisasi dokumen"]},
        moderator_discord:{min:15000,max:70000,action:["🛡️ Menjaga komunitas","🚫 Banned spammer","💬 Ngobrol dengan member","🎉 Mengadakan event"]},
        dropshipper:{min:10000,max:120000,action:["📱 Mencari supplier","🛒 Upload produk","📦 Pesanan diteruskan","💵 Selisih harga"]}
    }

    let vipJobs = {
        ceo:{min:300000,max:800000,action:["🏢 Mengelola perusahaan","💼 Menjalin kerja sama","📈 Meningkatkan profit"]},
        investor:{min:250000,max:700000,action:["📈 Menanam investasi","💎 Mendapat keuntungan","🏦 Menerima dividen"]},
        sultan:{min:500000,max:1200000,action:["💎 Mengelola bisnis besar","🏎️ Mengoleksi aset mewah","🏝️ Ekspansi investasi"]},
        pengusaha_properti:{min:400000,max:1000000,action:["🏢 Mengembangkan properti","💰 Menjual aset","📈 Nilai properti meningkat"]},
        konglomerat:{min:450000,max:1100000,action:["🌐 Menguasai pasar","🏢 Akuisisi perusahaan","💼 Mengembangkan bisnis"]},
        crypto_investor:{min:400000,max:1200000,action:["🪙 Trading crypto","📈 Mendapat profit","💎 Menahan aset (hold)"]},
        direktur_bank:{min:400000,max:1000000,action:["🏦 Mengelola bank","💰 Menyetujui kredit","📊 Evaluasi keuangan"]},
        pengusaha_startup:{min:350000,max:900000,action:["🚀 Mengembangkan produk startup","💼 Pitching ke investor","📈 Meningkatkan jumlah pengguna"]},
        manajer_investasi:{min:380000,max:950000,action:["📊 Mengelola portofolio","📈 Analisis pasar global","💰 Memaksimalkan profit"]},
        pemilik_tambang:{min:600000,max:1500000,action:["💎 Eksplorasi mineral","🚜 Operasi alat berat","🚢 Ekspor sumber daya"]},
        pemilik_maskapai:{min:700000,max:1800000,action:["✈️ Penambahan armada","🌍 Membuka rute baru","🎟️ Tiket sold out"]},
        aktor_internasional:{min:500000,max:1400000,action:["🎬 Syuting film box office","🎞️ Premiere di red carpet","🏆 Menang penghargaan"]},
        pemilik_klub_bola:{min:550000,max:1350000,action:["⚽ Transfer pemain bintang","🏟️ Menang liga utama","👕 Penjualan jersey melonjak"]}
    }

        if (jobType) {

            if (userData.pingsan)
            return replyalya("💀 Kamu pingsan! Gunakan .rumahsakit")

            let job = jobs[jobType]

            if (!job && vipJobs[jobType]) {
                if (!isPrem) {
                    return replyprem("💎 Pekerjaan ini khusus untuk user premium")
                }
                job = vipJobs[jobType]
            }

            if (!job) return replyalya("Pekerjaan tidak tersedia.")

            if (Date.now() - userData.lastkerja < cooldown)
            return replyalya(`⏳ Tunggu ${clockString(cooldown - (Date.now() - userData.lastkerja))}`)

            if (userData.stamina < 20)
            return replyalya("😩 Stamina kurang! Gunakan .istirahat")

            if (Math.random() < 0.05) {
                userData.stamina = 0
                userData.pingsan = true
                userData.lastkerja = Date.now()
                return replyalya(`💥 Kecelakaan kerja!\nKamu pingsan.\nGunakan .rumahsakit`)
            }

            if (Math.random() < 0.15) {
                userData.stamina -= 20
                userData.lastkerja = Date.now()
                return replyalya(`⚠️ Kamu gagal bekerja!\nStamina -20\nSisa: ${userData.stamina}`)
            }

            let actionText = random(job.action)

            let baseSalary = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min
            let levelBonus = Math.floor(baseSalary * (userData.level * 0.03))
            let totalSalary = baseSalary + levelBonus

            let rareText = ""
            if (Math.random() < 0.05) {
                let rare = Math.floor(totalSalary * 0.5)
                totalSalary += rare
                rareText = `\n🌟 BONUS LANGKA +Rp ${rare}`
            }

            let pajakPersen = Math.floor(Math.random() * 11) + 5
            let pajak = Math.floor(totalSalary * pajakPersen / 100)
            totalSalary -= pajak

            userData.money += totalSalary

            let xpGain = Math.floor(Math.random()*25)+15
            userData.exp += xpGain

            const xpRequired = (lvl) => 100 * Math.pow(2, lvl)
            const getRole = (lvl) => {
                if (lvl >= 100) return "Legenda"
                if (lvl >= 75) return "Master"
                if (lvl >= 50) return "Expert"
                if (lvl >= 30) return "Senior"
                if (lvl >= 15) return "Junior"
                if (lvl >= 5) return "Magang"
                return "Pemula"
            }

            let levelUp = false
            while (userData.exp >= xpRequired(userData.level)) {
                userData.exp -= xpRequired(userData.level)
                userData.level++
                userData.role = getRole(userData.level)
                levelUp = true
            }

            let levelText = levelUp
                ? `\n🎉 LEVEL UP!\nLevel sekarang ${userData.level}`
                : ""

            let staminaUsed = 15
            userData.stamina -= staminaUsed
            if (userData.stamina <= 0) {
                userData.stamina = 0
                userData.pingsan = true
            }

            userData.lastkerja = Date.now()

            return replyalya(
`💼 *${jobType.toUpperCase()}*
${actionText}

🎖 ROLE : ${userData.role}
⭐ LEVEL : ${userData.level}

💰 Gaji : Rp ${baseSalary}
🎯 Bonus Level : Rp ${levelBonus}
${rareText}

🧾 Pajak ${pajakPersen}% : -Rp ${pajak}

━━━━━━━━━━━━━━━
💵 TOTAL : Rp ${totalSalary}

⭐ EXP +${xpGain}
💪 Stamina -${staminaUsed}
🔋 Sisa Stamina : ${userData.stamina}
${levelText}`
            )
        }

        let list = Object.keys(jobs).map(v => ({
            header: "",
            title: v.toUpperCase(),
            description: `Rp ${jobs[v].min} - Rp ${jobs[v].max}`,
            id: `.kerja ${v}`
        }))

        Object.keys(vipJobs).forEach(v => {
            list.push({
                header: "VIP JOB 💎",
                title: v.toUpperCase(),
                description: isPrem
                    ? `Rp ${vipJobs[v].min} - Rp ${vipJobs[v].max}`
                    : "🔒 Khusus Premium",
                id: `.kerja ${v}`
            })
        })

        let msg = generateWAMessageFromContent(m.chat,{
            viewOnceMessage:{
                message:{
                    interactiveMessage:{
                        body:{
                            text:`💼 *PILIH PEKERJAAN*

🎖 Role : ${userData.role}
⭐ Level : ${userData.level}
🔋 Stamina : ${userData.stamina}

💎 VIP job hanya untuk user premium`
                        },
                        nativeFlowMessage:{
                            buttons:[{
                                name:"single_select",
                                buttonParamsJson:JSON.stringify({
                                    title:"DAFTAR PEKERJAAN",
                                    sections:[{title:"Job List",rows:list}]
                                })
                            }]
                        }
                    }
                }
            }
        },{quoted:m})

        await alya.relayMessage(msg.key.remoteJid,msg.message,{messageId:msg.key.id})
  }
}
