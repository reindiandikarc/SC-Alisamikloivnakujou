// Plugin: pilihusbu
// Auto-generated from Alya V12
// Commands: pilihhusbu, pilihusbu

const path = require('path')

module.exports = {
  command: ["pilihhusbu", "pilihusbu"],
  tags: ['romance'],
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

        let users = global.global.db.users[m.sender]
        const PILIH_PRICE = 25000000

        if (!args[0]) {
            let daftar = `💌 *DAFTAR HUSBU PILIHAN* 💌\n`
            daftar += `Harga: Rp ${PILIH_PRICE.toLocaleString()} per pilihan\n`
            daftar += `Gunakan: *.pilihhusbu <nomor>*\n`
            daftar += `\n⚪ *COMMON*\n1. Kageyama Tobio - Haikyuu!!\n2. Kurosaki Ichigo - Bleach\n3. Natsu Dragneel - Fairy Tail\n4. Kirishima Eijirou - Boku no Hero Academia\n5. Yukihira Souma - Shokugeki no Souma\n6. Tanaka Ryuunosuke - Haikyuu!!\n7. Asta - Black Clover\n8. Hinata Shoyo - Haikyuu!!\n9. Okumura Rin - Ao no Exorcist\n10. Veldora Tempest - Tensei shitara Slime Datta Ken\n11. Miya Atsumu - Haikyuu!!\n12. Miya Osamu - Haikyuu!!\n13. Kageyama Shigeo - Mob Psycho 100\n14. Reigen Arataka - Mob Psycho 100\n15. Kyoji Shinkawa - Sword Art Online\n16. Eugeo - Sword Art Online: Alicization\n17. Zen Wistaria - Akagami no Shirayuki-hime\n18. Obi - Akagami no Shirayuki-hime\n19. Haru Yoshida - Tonari no Kaibutsu-kun\n20. Takeo Gouda - Ore Monogatari!!\n\n💎 *EPIC*\n21. Tomioka Giyu - Kimetsu no Yaiba\n22. Zoro Roronoa - One Piece\n23. Bakugo Katsuki - Boku no Hero Academia\n24. Killua Zoldyck - Hunter x Hunter\n25. Sano Manjirou - Tokyo Revengers\n26. Todoroki Shoto - Boku no Hero Academia\n27. Loid Forger - Spy x Family\n28. Nanami Kento - Jujutsu Kaisen\n29. Hawks - Boku no Hero Academia\n30. Osamu Dazai - Bungou Stray Dogs\n31. Karma Akabane - Ansatsu Kyoushitsu\n32. Sakusa Kiyoomi - Haikyuu!!\n33. Rengoku Kyojuro - Kimetsu no Yaiba\n34. Howl - Howl no Ugoku Shiro\n35. Yato - Noragami\n36. Saiki Kusuo - Saiki Kusuo no Psi-nan\n37. Shin-Ah - Akatsuki no Yona\n38. Hak - Akatsuki no Yona\n39. Tamaki Suoh - Ouran High School Host Club\n40. Kyoya Ootori - Ouran High School Host Club\n41. Atsushi Nakajima - Bungou Stray Dogs\n42. Chuuya Nakahara - Bungou Stray Dogs\n43. Ranpo Edogawa - Bungou Stray Dogs\n44. Fushiguro Megumi - Jujutsu Kaisen\n45. Inumaki Toge - Jujutsu Kaisen\n46. Geto Suguru - Jujutsu Kaisen 0\n47. Inosuke Hashibira - Kimetsu no Yaiba\n48. Uzui Tengen - Kimetsu no Yaiba\n49. Sanemi Shinazugawa - Kimetsu no Yaiba\n50. Sabito - Kimetsu no Yaiba\n\n🌟 *LEGENDARY*\n51. Levi Ackerman - Shingeki no Kyojin\n52. Gojo Satoru - Jujutsu Kaisen\n53. Kakashi Hatake - Naruto\n54. Itachi Uchiha - Naruto\n55. L Lawliet - Death Note\n56. Sebastian Michaelis - Kuroshitsuji\n57. Kyo Sohma - Fruits Basket\n58. Sesshomaru - Inuyasha\n59. Zeref Dragneel - Fairy Tail\n60. Sakata Gintoki - Gintama\n61. Law Trafalgar - One Piece\n62. Portgas D. Ace - One Piece\n63. Armin Arlert - Shingeki no Kyojin\n64. Tomoe - Kamisama Hajimemashita\n65. Sanji Vinsmoke - One Piece\n66. Shanks - One Piece\n67. Marco - One Piece\n68. Kisuke Urahara - Bleach\n69. Grimmjow Jaegerjaquez - Bleach\n70. Byakuya Kuchiki - Bleach\n71. Gaara - Naruto\n72. Neji Hyuga - Naruto\n73. Minato Namikaze - Naruto\n74. Shikamaru Nara - Naruto\n75. Edward Elric - Fullmetal Alchemist: Brotherhood\n76. Greed / Ling Yao - Fullmetal Alchemist: Brotherhood\n77. Spike Spiegel - Cowboy Bebop\n78. Guts - Berserk\n79. Griffith - Berserk\n\n💀 *MITOS*\n80. Sasuke Uchiha - Naruto\n81. Uchiha Madara - Naruto\n82. Vegeta - Dragon Ball Z\n83. Usui Takumi - Kaichou wa Maid-sama!\n84. Kurama - Yu Yu Hakusho\n85. Kenshin Himura - Rurouni Kenshin\n86. Roy Mustang - Fullmetal Alchemist: Brotherhood\n87. Light Yagami - Death Note\n88. Lelouch vi Britannia - Code Geass\n89. Suguru Geto - Jujutsu Kaisen\n90. Haku - Spirited Away\n91. Koyomi Araragi - Monogatari Series\n92. Kyon - Suzumiya Haruhi no Yuuutsu\n93. Tachibana Taki - Kimi no Na wa\n94. Ainz Ooal Gown - Overlord\n95. Diablo - How Not to Summon a Demon Lord\n96. Rimuru Tempest - Tensei shitara Slime Datta Ken\n97. Ciel Phantomhive - Kuroshitsuji\n98. Ichigo Kurosaki - Bleach\n99. Sung Jin-Woo - Solo Leveling`
            return replyalya(daftar)
        }

        let nomor = parseInt(args[0])
        if (isNaN(nomor) || nomor < 1 || nomor > 99) return replyalya(`❌ Nomor salah! Pilih antara 1 - 99. Ketik *.pilihhusbu* tanpa angka buat lihat daftarnya.`)
        if (users.money < PILIH_PRICE) return replyalya(`💸 Duit lu kurang! Butuh Rp ${PILIH_PRICE.toLocaleString()} buat milih husbu sendiri.`)

        let chosen = husbuList[nomor - 1]
        users.money -= PILIH_PRICE
        users.lastGachaHusbu = { ...chosen, _source: 'pilihhusbu' }

        let rarityDisplay = chosen.rarity === 'MITOS' ? '💀 MITOS' : chosen.rarity === 'LEGENDARY' ? '🌟 LEGENDARY' : chosen.rarity === 'EPIC' ? '💎 EPIC' : '⚪ COMMON'

        let caption = `✨ *PILIH HUSBU RESULT* ✨\n\n`
        caption += `Berhasil memilih Husbu dengan No ${nomor}\n`
        caption += `🗡️ *Nama:* ${chosen.name}\n`
        caption += `📺 *Anime:* ${chosen.anime}\n`
        caption += `🏆 *Rarity:* ${rarityDisplay}\n\n`
        caption += `Ketik *.marry* jika ingin menjadikan dia suamimu.\n_(Butuh 1x Cincin Nikah)_`

        replyalya(caption)
  }
}
