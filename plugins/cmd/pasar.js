// Plugin: pasar
// Auto-generated from Alya V12
// Commands: pasar

const path = require('path')

module.exports = {
  command: ["pasar"],
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

      if (!m.isGroup) return replytolak(mess.only.group)
    const Skepiting = 7000
    const Slobster = 7000
    const Sudang = 7000
    const Scumi = 7000
    const Sgurita = 7000
    const Sbuntal = 7000
    const Sdory = 7000
    const Sorca = 7000
    const Slumba = 7000
    const Spaus = 7000
    const Sikan = 7000
    const Shiu = 7000
    const Sbanteng = 9000
    const Sharimau = 9000
    const Sgajah = 9000
    const Skambing = 9000
    const Spanda = 9000
    const Sbuaya = 9000
    const Skerbau = 9000
    const Ssapi= 9000
    const Smonyet = 9000
    const Sbabihutan = 9000
    const Sbabi = 9000
    const Sayam = 9000
    const Sbotol = 100
    const Skardus = 100
    const Skaleng = 100
    const Sgelas = 100
    const Splastik = 100

        const _armor = global.db.users[m.sender].armor
        const armor = (_armor == 0 ? 20000 : '' || _armor == 1 ? 49999 : '' || _armor == 2 ? 99999 : '' || _armor == 3 ? 149999 : '' || _armor == 4 ? 299999 : '')
        let typeAlt = (args[0] || '').toLowerCase()
        let _type = (args[1] || '').toLowerCase()
        let jualbeli = (args[0] || '').toLowerCase()
        const Kchat = `╍╌╌╍╌╌╍╌╌╍╌╌┅═━––––––๑
    *🛒 Hewan Laut   | 💲 Harga Jual*\n═┅═━––––––━––––––๑
    🦀 Kepiting: ${Skepiting}
    🦞 Lobster: ${Slobster}
    🦐 Udang: ${Sudang}
    🦑 Cumi: ${Scumi}
    🐙 Gurita: ${Sgurita}
    🐡 Buntal: ${Sbuntal}
    🐠 Dory: ${Sdory}
    🐳 Orca: ${Sorca}
    🐬 Lumba: ${Slumba}
    🐋 Paus: ${Spaus}
    🦈 Hiu: ${Shiu}
    ╍╌╌╍╌╌╍╌╌╍╌╌┅═━––––––๑
    *🛒 Hewan Darat   | 💲 Harga Jual*\n═┅═━––––––━––––––๑
    🐃 Banteng: ${Sbanteng}
    🐅 Harimau: ${Sharimau}
    🐘 Gajah: ${Sgajah}
    🐐 Kambing: ${Skambing}
    🐼 Panda: ${Spanda}
    🐃 Kerbau: ${Skerbau}
    🐊 Buaya: ${Sbuaya}
    🐂 Sapi: ${Ssapi}
    🐒 Monyet: ${Smonyet}
    🐗 Babi Hutan: ${Sbabihutan}
    🐖 Babi: ${Sbabi}
    🐔 Ayam: ${Sayam}
    ╍╌╌╍╌╌╍╌╌╍╌╌┅═━––––––๑
    📌 *Contoh penggunaan :*\n═┅═━––––––━––––––๑
    #pasar jual ayam [Jumlah]
    `.trim()
        try {
            if (/pasar|toko/i.test(command)) {
                const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 :Math.min(1, count)
                const sampah = global.db.users[m.sender].sampah
                switch (jualbeli) {

                case 'jual':
                    switch (_type) {
                         case 'banteng':
                            if (global.db.users[m.sender].banteng >= count * 1) {
                                global.db.users[m.sender].money += Spaus * count
                                global.db.users[m.sender].banteng -= count * 1
                                reply( `Sukses Menjual ${count} Banteng Dengan Harga ${Sbanteng * count} Money `.trim())
                            } else reply( `Banteng Kamu Tidak Cukup`.trim())
                            case 'harimau':
                            if (global.db.users[m.sender].harimau >= count * 1) {
                                global.db.users[m.sender].money += Sharimau * count
                                global.db.users[m.sender].harimau -= count * 1
                                reply( `Sukses Menjual ${count} Harimau Dengan Harga ${Sharimau * count} Money `.trim())
                            } else reply( `Harimau Kamu Tidak Cukup`.trim())
                            case 'gajah':
                            if (global.db.users[m.sender].gajah >= count * 1) {
                                global.db.users[m.sender].money += Sgajah * count
                                global.db.users[m.sender].gajah -= count * 1
                                reply( `Sukses Menjual ${count} Gajah Dengan Harga ${Sgajah * count} Money `.trim())
                            } else reply( `Gajah Kamu Tidak Cukup`.trim())
                            case 'kambing':
                            if (global.db.users[m.sender].kambing >= count * 1) {
                                global.db.users[m.sender].money += Skambing * count
                                global.db.users[m.sender].kambing -= count * 1
                                reply( `Sukses Menjual ${count} Kambing Dengan Harga ${Skambing * count} Money `.trim())
                            } else reply( `Kambing Kamu Tidak Cukup`.trim())
                            case 'panda':
                            if (global.db.users[m.sender].panda >= count * 1) {
                                global.db.users[m.sender].money += Spanda * count
                                global.db.users[m.sender].panda -= count * 1
                                reply( `Sukses Menjual ${count} Panda Dengan Harga ${Sbuaya * count} Money `.trim())
                            } else reply( `Panda Kamu Tidak Cukup`.trim())
                            case 'buaya':
                            if (global.db.users[m.sender].buaya >= count * 1) {
                                global.db.users[m.sender].money += Sbuaya * count
                                global.db.users[m.sender].buaya -= count * 1
                                reply( `Sukses Menjual ${count} Buaya Dengan Harga ${Sbuaya * count} Money `.trim())
                            } else reply( `Buaya Kamu Tidak Cukup`.trim())
                            case 'kerbau':
                            if (global.db.users[m.sender].kerbau >= count * 1) {
                                global.db.users[m.sender].money += Skerbau * count
                                global.db.users[m.sender].kerbau -= count * 1
                                reply( `Sukses Menjual ${count} Kerbau Dengan Harga ${Skerbau * count} Money `.trim())
                            } else reply( `Kerbau Kamu Tidak Cukup`.trim())
                            case 'sapi':
                            if (global.db.users[m.sender].sapi >= count * 1) {
                                global.db.users[m.sender].money += Ssapi * count
                                global.db.users[m.sender].sapi -= count * 1
                                reply( `Sukses Menjual ${count} Sapi Dengan Harga ${Ssapi * count} Money `.trim())
                            } else reply( `Sapi Kamu Tidak Cukup`.trim())
                            case 'monyet':
                            if (global.db.users[m.sender].monyet >= count * 1) {
                                global.db.users[m.sender].money += Smonyet * count
                                global.db.users[m.sender].monyet -= count * 1
                                reply( `Sukses Menjual ${count} Monyet Dengan Harga ${Smonyet * count} Money `.trim())
                            } else reply( `Monyet Kamu Tidak Cukup`.trim())
                            case 'babi':
                            if (global.db.users[m.sender].babi >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].babi -= count * 1
                                reply( `Sukses Menjual ${count} Babi Dengan Harga ${Sbabi * count} Money `.trim())
                            } else reply( `Babi Kamu Tidak Cukup`.trim())
                            case 'babihutan':
                            if (global.db.users[m.sender].babihutan >= count * 1) {
                                global.db.users[m.sender].money += Sbabihutan * count
                                global.db.users[m.sender].babihutan -= count * 1
                                reply( `Sukses Menjual ${count} Babi Hutan Dengan Harga ${Sbabihutan * count} Money `.trim())
                            } else reply( `Babi Hutan Kamu Tidak Cukup`.trim())
                            case 'ayam':
                            if (global.db.users[m.sender].ayam >= count * 1) {
                                global.db.users[m.sender].money += Sayam * count
                                global.db.users[m.sender].ayam -= count * 1
                                reply( `Sukses Menjual ${count} Ayam Dengan Harga ${Sayam * count} Money `.trim())
                            } else reply( `Ayam Kamu Tidak Cukup`.trim())
                            //mancing
                            case 'kepiting':
                            if (global.db.users[m.sender].kepiting >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].kepiting -= count * 1
                                reply( `Sukses Menjual ${count} Kepiting Dengan Harga ${Skepiting * count} Money `.trim())
                            } else reply( `Kepiting Kamu Tidak Cukup`.trim())
                            case 'ikan':
                            if (global.db.users[m.sender].ikan >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].ikan -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Dengan Harga ${Sikan * count} Money `.trim())
                            } else reply( `Ikan Kamu Tidak Cukup`.trim())
                            case 'dory':
                            if (global.db.users[m.sender].dory >= count * 1) {
                                global.db.users[m.sender].money += Sdory * count
                                global.db.users[m.sender].dory -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Dory Dengan Harga ${Sdory * count} Money `.trim())
                            } else reply( `Ikan Dory Kamu Tidak Cukup`.trim())
                            case 'gurita':
                            if (global.db.users[m.sender].gurita >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].gurita -= count * 1
                                reply( `Sukses Menjual ${count} Gurita Dengan Harga ${Sgurita * count} Money `.trim())
                            } else reply( `Gurita Kamu Tidak Cukup`.trim())
                            case 'buntal':
                            if (global.db.users[m.sender].buntal >= count * 1) {
                                global.db.users[m.sender].money += Sbuntal * count
                                global.db.users[m.sender].buntal -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Buntal Dengan Harga ${Sbuntal * count} Money `.trim())
                            } else reply( `Ikan Buntal Kamu Tidak Cukup`.trim())
                            case 'hiu':
                            if (global.db.users[m.sender].hiu >= count * 1) {
                                global.db.users[m.sender].money += Shiu * count
                                global.db.users[m.sender].hiu -= count * 1
                                reply( `Sukses Menjual ${count} Hiu Dengan Harga ${Shiu * count} Money `.trim())
                            } else reply( `Hiu Kamu Tidak Cukup`.trim())
                            case 'orca':
                            if (global.db.users[m.sender].orca >= count * 1) {
                                global.db.users[m.sender].money += Sorca * count
                                global.db.users[m.sender].orca -= count * 1
                                reply( `Sukses Menjual ${count} Paus Orca Dengan Harga ${Sorca * count} Money `.trim())
                            } else reply( `Paus Orca Kamu Tidak Cukup`.trim())
                            case 'lumba':
                            if (global.db.users[m.sender].lumba >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].lumba -= count * 1
                                reply( `Sukses Menjual ${count} Lumba Lumba Dengan Harga ${Slumba * count} Money `.trim())
                            } else reply( `Lumba Lumba Kamu Tidak Cukup`.trim())
                            case 'paus':
                            if (global.db.users[m.sender].paus >= count * 1) {
                                global.db.users[m.sender].money += Spaus * count
                                global.db.users[m.sender].paus -= count * 1
                                reply( `Sukses Menjual ${count} Paus Dengan Harga ${Spaus * count} Money `.trim())
                            } else reply( `Paus Kamu Tidak Cukup`.trim())
                      case 'lobster':
                            if (global.db.users[m.sender].lobster >= count * 1) {
                                global.db.users[m.sender].money += Slobster * count
                                global.db.users[m.sender].lobster -= count * 1
                                reply( `Sukses Menjual ${count} Lobster Dengan Harga ${Slobster * count} Money `.trim())
                            } else reply( `Lobster Kamu Tidak Cukup`.trim())
                         case 'udang':
                            if (global.db.users[m.sender].udang >= count * 1) {
                                global.db.users[m.sender].money += Sudang * count
                                global.db.users[m.sender].udang -= count * 1
                                reply( `Sukses Menjual ${count} Udang Dengan Harga ${Sudang * count} Money `.trim())
                            } else reply( `Udang Kamu Tidak Cukup`.trim())
                          case 'cumi':
                            if (global.db.users[m.sender].cumi >= count * 1) {
                                global.db.users[m.sender].money += Scumi * count
                                global.db.users[m.sender].cumi -= count * 1
                                reply( `Sukses Menjual ${count} Cumi Dengan Harga ${Scumi * count} Money `.trim())
                            } else reply( `Cumi Kamu Tidak Cukup`.trim())
                            case 'botol':
                            if (global.db.users[m.sender].botol >= count * 1) {
                                global.db.users[m.sender].money += Sbotol * count
                                global.db.users[m.sender].botol -= count * 1
                                reply( `Sukses Menjual ${count} Cumi Dengan Harga ${Sbotol * count} Money `.trim())
                            } else reply( `Botol Kamu Tidak Cukup`.trim())
                            case 'kaleng':
                            if (global.db.users[m.sender].kaleng >= count * 1) {
                                global.db.users[m.sender].money += Skaleng * count
                                global.db.users[m.sender].kaleng -= count * 1
                                reply( `Sukses Menjual ${count} Kaleng Dengan Harga ${Skaleng * count} Money `.trim())
                            } else reply( `Kaleng Kamu Tidak Cukup`.trim())
                            case 'kardus':
                            if (global.db.users[m.sender].kardus >= count * 1) {
                                global.db.users[m.sender].money += Skardus * count
                                global.db.users[m.sender].kardus -= count * 1
                                reply( `Sukses Menjual ${count} Kardus Dengan Harga ${Skardus * count} Money `.trim())
                            } else reply( `Kardus Kamu Tidak Cukup`.trim())
                            case 'gelas':
                            if (global.db.users[m.sender].gelas >= count * 1) {
                                global.db.users[m.sender].money += Sgelas * count
                                global.db.users[m.sender].gelas -= count * 1
                                reply( `Sukses Menjual ${count} Gelas Dengan Harga ${Sgelas * count} Money `.trim())
                            } else reply( `Gelas Kamu Tidak Cukup`.trim())
                            case 'plastik':
                            if (global.db.users[m.sender].plastik >= count * 1) {
                                global.db.users[m.sender].money += Splastik * count
                                global.db.users[m.sender].plastik -= count * 1
                                reply( `Sukses Menjual ${count} Plastik Dengan Harga ${Splastik * count} Money `.trim())
                            } else reply( `Plastik Kamu Tidak Cukup`.trim())
                            return m.reply(Kchat)
                    }
                    return m.reply(Kchat)
                }

            } else if (/sell|jual|/i.test(command)) {
                const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
                switch (type) {
                           case 'banteng':
                            if (global.db.users[m.sender].banteng >= count * 1) {
                                global.db.users[m.sender].money += Spaus * count
                                global.db.users[m.sender].banteng -= count * 1
                                reply( `Sukses Menjual ${count} Banteng Dengan Harga ${Sbanteng * count} Money `.trim())
                            } else reply( `Banteng Kamu Tidak Cukup`.trim())
                            case 'harimau':
                            if (global.db.users[m.sender].harimau >= count * 1) {
                                global.db.users[m.sender].money += Sharimau * count
                                global.db.users[m.sender].harimau -= count * 1
                                reply( `Sukses Menjual ${count} Harimau Dengan Harga ${Sharimau * count} Money `.trim())
                            } else reply( `Harimau Kamu Tidak Cukup`.trim())
                            case 'gajah':
                            if (global.db.users[m.sender].gajah >= count * 1) {
                                global.db.users[m.sender].money += Sgajah * count
                                global.db.users[m.sender].gajah -= count * 1
                                reply( `Sukses Menjual ${count} Gajah Dengan Harga ${Sgajah * count} Money `.trim())
                            } else reply( `Gajah Kamu Tidak Cukup`.trim())
                            case 'kambing':
                            if (global.db.users[m.sender].kambing >= count * 1) {
                                global.db.users[m.sender].money += Skambing * count
                                global.db.users[m.sender].kambing -= count * 1
                                reply( `Sukses Menjual ${count} Kambing Dengan Harga ${Skambing * count} Money `.trim())
                            } else reply( `Kambing Kamu Tidak Cukup`.trim())
                            case 'panda':
                            if (global.db.users[m.sender].panda >= count * 1) {
                                global.db.users[m.sender].money += Spanda * count
                                global.db.users[m.sender].panda -= count * 1
                                reply( `Sukses Menjual ${count} Panda Dengan Harga ${Sbuaya * count} Money `.trim())
                            } else reply( `Panda Kamu Tidak Cukup`.trim())
                            case 'buaya':
                            if (global.db.users[m.sender].buaya >= count * 1) {
                                global.db.users[m.sender].money += Sbuaya * count
                                global.db.users[m.sender].buaya -= count * 1
                                reply( `Sukses Menjual ${count} Buaya Dengan Harga ${Sbuaya * count} Money `.trim())
                            } else reply( `Buaya Kamu Tidak Cukup`.trim())
                            case 'kerbau':
                            if (global.db.users[m.sender].kerbau >= count * 1) {
                                global.db.users[m.sender].money += Skerbau * count
                                global.db.users[m.sender].kerbau -= count * 1
                                reply( `Sukses Menjual ${count} Kerbau Dengan Harga ${Skerbau * count} Money `.trim())
                            } else reply( `Kerbau Kamu Tidak Cukup`.trim())
                            case 'sapi':
                            if (global.db.users[m.sender].sapi >= count * 1) {
                                global.db.users[m.sender].money += Ssapi * count
                                global.db.users[m.sender].sapi -= count * 1
                                reply( `Sukses Menjual ${count} Sapi Dengan Harga ${Ssapi * count} Money `.trim())
                            } else reply( `Sapi Kamu Tidak Cukup`.trim())
                            case 'monyet':
                            if (global.db.users[m.sender].monyet >= count * 1) {
                                global.db.users[m.sender].money += Smonyet * count
                                global.db.users[m.sender].monyet -= count * 1
                                reply( `Sukses Menjual ${count} Monyet Dengan Harga ${Smonyet * count} Money `.trim())
                            } else reply( `Monyet Kamu Tidak Cukup`.trim())
                            case 'babi':
                            if (global.db.users[m.sender].babi >= count * 1) {
                                global.db.users[m.sender].money += Sbabi * count
                                global.db.users[m.sender].babi -= count * 1
                                reply( `Sukses Menjual ${count} Babi Dengan Harga ${Sbabi * count} Money `.trim())
                            } else reply( `Babi Kamu Tidak Cukup`.trim())
                            case 'babihutan':
                            if (global.db.users[m.sender].babihutan >= count * 1) {
                                global.db.users[m.sender].money += Sbabihutan * count
                                global.db.users[m.sender].babihutan -= count * 1
                                reply( `Sukses Menjual ${count} Babi Hutan Dengan Harga ${Sbabihutan * count} Money `.trim())
                            } else reply( `Babi Hutan Kamu Tidak Cukup`.trim())
                            case 'ayam':
                            if (global.db.users[m.sender].ayam >= count * 1) {
                                global.db.users[m.sender].money += Sayam * count
                                global.db.users[m.sender].ayam -= count * 1
                                reply( `Sukses Menjual ${count} Ayam Dengan Harga ${Sayam * count} Money `.trim())
                            } else reply( `Ayam Kamu Tidak Cukup`.trim())
                            //mancing
                            case 'kepiting':
                            if (global.db.users[m.sender].kepiting >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].kepiting -= count * 1
                                reply( `Sukses Menjual ${count} Kepiting Dengan Harga ${Skepiting * count} Money `.trim())
                            } else reply( `Kepiting Kamu Tidak Cukup`.trim())
                            case 'ikan':
                            if (global.db.users[m.sender].ikan >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].ikan -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Dengan Harga ${Sikan * count} Money `.trim())
                            } else reply( `Ikan Kamu Tidak Cukup`.trim())
                            case 'dory':
                            if (global.db.users[m.sender].dory >= count * 1) {
                                global.db.users[m.sender].money += Sdory * count
                                global.db.users[m.sender].dory -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Dory Dengan Harga ${Sdory * count} Money `.trim())
                            } else reply( `Ikan Dory Kamu Tidak Cukup`.trim())
                            case 'gurita':
                            if (global.db.users[m.sender].gurita >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].gurita -= count * 1
                                reply( `Sukses Menjual ${count} Gurita Dengan Harga ${Sgurita * count} Money `.trim())
                            } else reply( `Gurita Kamu Tidak Cukup`.trim())
                            case 'buntal':
                            if (global.db.users[m.sender].buntal >= count * 1) {
                                global.db.users[m.sender].money += Sbuntal * count
                                global.db.users[m.sender].buntal -= count * 1
                                reply( `Sukses Menjual ${count} Ikan Buntal Dengan Harga ${Sbuntal * count} Money `.trim())
                            } else reply( `Ikan Buntal Kamu Tidak Cukup`.trim())
                            case 'hiu':
                            if (global.db.users[m.sender].hiu >= count * 1) {
                                global.db.users[m.sender].money += Shiu * count
                                global.db.users[m.sender].hiu -= count * 1
                                reply( `Sukses Menjual ${count} Hiu Dengan Harga ${Shiu * count} Money `.trim())
                            } else reply( `Hiu Kamu Tidak Cukup`.trim())
                            case 'orca':
                            if (global.db.users[m.sender].orca >= count * 1) {
                                global.db.users[m.sender].money += Sorca * count
                                global.db.users[m.sender].orca -= count * 1
                                reply( `Sukses Menjual ${count} Paus Orca Dengan Harga ${Sorca * count} Money `.trim())
                            } else reply( `Paus Orca Kamu Tidak Cukup`.trim())
                            case 'lumba':
                            if (global.db.users[m.sender].lumba >= count * 1) {
                                global.db.users[m.sender].money += Skepiting * count
                                global.db.users[m.sender].lumba -= count * 1
                                reply( `Sukses Menjual ${count} Lumba Lumba Dengan Harga ${Slumba * count} Money `.trim())
                            } else reply( `Lumba Lumba Kamu Tidak Cukup`.trim())
                            case 'paus':
                            if (global.db.users[m.sender].paus >= count * 1) {
                                global.db.users[m.sender].money += Spaus * count
                                global.db.users[m.sender].paus -= count * 1
                                reply( `Sukses Menjual ${count} Paus Dengan Harga ${Spaus * count} Money `.trim())
                            } else reply( `Paus Kamu Tidak Cukup`.trim())
                      case 'lobster':
                            if (global.db.users[m.sender].lobster >= count * 1) {
                                global.db.users[m.sender].money += Slobster * count
                                global.db.users[m.sender].lobster -= count * 1
                                reply( `Sukses Menjual ${count} Lobster Dengan Harga ${Slobster * count} Money `.trim())
                            } else reply( `Lobster Kamu Tidak Cukup`.trim())
                         case 'udang':
                            if (global.db.users[m.sender].udang >= count * 1) {
                                global.db.users[m.sender].money += Sudang * count
                                global.db.users[m.sender].udang -= count * 1
                                reply( `Sukses Menjual ${count} Udang Dengan Harga ${Sudang * count} Money `.trim())
                            } else reply( `Udang Kamu Tidak Cukup`.trim())
                          case 'cumi':
                            if (global.db.users[m.sender].cumi >= count * 1) {
                                global.db.users[m.sender].money += Scumi * count
                                global.db.users[m.sender].cumi -= count * 1
                                reply( `Sukses Menjual ${count} Cumi Dengan Harga ${Scumi * count} Money `.trim())
                            } else reply( `Cumi Kamu Tidak Cukup`.trim())
                            case 'botol':
                            if (global.db.users[m.sender].botol >= count * 1) {
                                global.db.users[m.sender].money += Sbotol * count
                                global.db.users[m.sender].botol -= count * 1
                                reply( `Sukses Menjual ${count} Botol Dengan Harga ${Sbotol * count} Money `.trim())
                            } else reply( `Botol Kamu Tidak Cukup`.trim())
                            case 'kaleng':
                            if (global.db.users[m.sender].kaleng >= count * 1) {
                                global.db.users[m.sender].money += Skaleng * count
                                global.db.users[m.sender].kaleng -= count * 1
                                reply( `Sukses Menjual ${count} Kaleng Dengan Harga ${Skaleng * count} Money `.trim())
                            } else reply( `Kaleng Kamu Tidak Cukup`.trim())
                            case 'kardus':
                            if (global.db.users[m.sender].kardus >= count * 1) {
                                global.db.users[m.sender].money += Skardus * count
                                global.db.users[m.sender].kardus -= count * 1
                                reply( `Sukses Menjual ${count} Kardus Dengan Harga ${Skardus * count} Money `.trim())
                            } else reply( `Kardus Kamu Tidak Cukup`.trim())
                             case 'gelas':
                            if (global.db.users[m.sender].gelas >= count * 1) {
                                global.db.users[m.sender].money += Sgelas * count
                                global.db.users[m.sender].gelas -= count * 1
                                reply( `Sukses Menjual ${count} Gelas Dengan Harga ${Sgelas * count} Money `.trim())
                            } else reply( `Gelas Kamu Tidak Cukup`.trim())
                            case 'plastik':
                            if (global.db.users[m.sender].plastik >= count * 1) {
                                global.db.users[m.sender].money += Splastik * count
                                global.db.users[m.sender].plastik -= count * 1
                                reply( `Sukses Menjual ${count} Plastik Dengan Harga ${Splastik * count} Money `.trim())
                            } else reply( `Plastik Kamu Tidak Cukup`.trim())
                        return m.reply(Kchat)
                }
            }
    } catch (err) {
    console.log(util.format(err))
    let e = String(err)
    }
    }
    //==================================================================
  }
