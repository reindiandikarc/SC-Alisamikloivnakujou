// Plugin: audiosurah
// FIX: ganti lolhuman API (expired apikey) → alquran.cloud gratis
//      + validasi nomor surah 1-114

'use strict'

const SURAH_LIST = [
  'Al-Fatihah','Al-Baqarah','Ali Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal',
  'At-Taubah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf',
  'Maryam','Ta Ha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Asy-Syuara','An-Naml',
  'Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya Sin',
  'As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Asy-Syura','Az-Zukhruf','Ad-Dukhan',
  'Al-Jasiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Az-Zariyat','At-Tur',
  'An-Najm','Al-Qamar','Ar-Rahman','Al-Waqiah','Al-Hadid','Al-Mujadilah','Al-Hasyr',
  'Al-Mumtahanah','As-Saff','Al-Jumuah','Al-Munafiqun','At-Tagabun','At-Talaq','At-Tahrim',
  'Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddassir',
  'Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar',
  'Al-Tatfif','Al-Insyiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Gasiyah','Al-Fajr','Al-Balad',
  'Asy-Syams','Al-Lail','Ad-Duha','Al-Insyirah','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah',
  'Az-Zalzalah','Al-Adiyat','Al-Qariah','At-Takasur','Al-Asr','Al-Humazah','Al-Fil','Quraisy',
  'Al-Maun','Al-Kausar','Al-Kafirun','An-Nasr','Al-Lahab','Al-Ikhlas','Al-Falaq','An-Nas'
]

module.exports = {
  command: ["audiosurah"],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { text, replyalya } = ctx

    const listText = SURAH_LIST.map((s, i) => `    ${i + 1} : ${s}`).join('\n')
    const wrong = `_*Contoh Penggunaan:*_\naudiosurah 1\n\n*List Surah (1-114):*\n${listText}`

    if (!text) return replyalya(wrong)

    const nomor = parseInt(text.trim())
    if (isNaN(nomor) || nomor < 1 || nomor > 114) {
      return replyalya(`❌ Nomor surah tidak valid!\n\nMasukkan angka 1-114.\n\n${wrong}`)
    }

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } })

    try {
      const axios = require('axios')
      // Ambil metadata surah
      const meta = await axios.get(`https://api.alquran.cloud/v1/surah/${nomor}/ar.alafasy`)
      if (meta.data?.code !== 200) throw new Error('Gagal ambil data surah')

      const surah = meta.data.data
      const surahName = surah.englishName
      const surahArabic = surah.name

      // Audio surah full tersedia di everyayah.com
      const audioUrl = `https://download.quranicaudio.com/quran/mishaari_raashid_al-3afaasee/${String(nomor).padStart(3, '0')}.mp3`

      await alya.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `Surah_${nomor}_${surahName}.mp3`
      }, { quoted: m })

      await alya.sendMessage(m.chat, {
        text: `✅ *Surah ${nomor}: ${surahArabic} (${surahName})*\n\nJumlah Ayat: ${surah.numberOfAyahs}\nTipe: ${surah.revelationType}`
      }, { quoted: m })

    } catch (e) {
      console.error('[audiosurah]', e.message)
      replyalya(`❌ Gagal mengambil audio surah.\n\n_Coba lagi nanti_`)
    }
  }
}
