// Plugin: kisahnabi
// Auto-generated from Alya V12
// Commands: kisahnabi

const path = require('path')

module.exports = {
  command: ["kisahnabi"],
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

         if (!text) return replyalya(`Masukan nama nabi\nExample: kisahnabi adam`)
         let url = await fetch(`https://raw.githubusercontent.com/ZeroChanBot/Api-Freee/a9da6483809a1fbf164cdf1dfbfc6a17f2814577/data/kisahNabi/${text}.json`)
         let kisah = await url.json().catch(_ => "Error")
         if (kisah == "Error") return replyalya("*Not Found*\n*📮 ᴛɪᴘs :* coba jangan gunakan huruf capital")

        let hasil = `_*👳 Nabi :*_ ${kisah.name}
    _*📅 Tanggal Lahir :*_ ${kisah.thn_kelahiran}
    _*📍 Tempat Lahir :*_ ${kisah.tmp}
    _*📊 Usia :*_ ${kisah.usia}

    *— — — — — — — [ K I S A H ] — — — — — — —*

    ${kisah.description}`

         replyalya(`${hasil}`)

//     const contoh = `*Asmaul Husna*
    `
    // data here
    const anjuran = `
// [SYNTAX ERROR REMOVED]     Dari Abu hurarirah radhiallahu anhu, Rasulullah Saw bersabda: "إِنَّ لِلَّهِ تَعَالَى تِسْعَةً وَتِسْعِينَ اسْمًا، مِائَةٌ إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دخل الجنة، وهو وتر يُحِبُّ الْوِتْرَ"
// [SYNTAX ERROR REMOVED]     Artinya: "Sesungguhnya Allah mempunyai sembilan puluh sembilan nama, alias seratus kurang satu. Barang siapa yang menghitung-hitungnya, niscaya masuk surga; Dia Witir dan menyukai yang witir".`
  }
}
