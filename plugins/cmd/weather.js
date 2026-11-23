// Plugin: weather
// Auto-generated from Alya V12
// Commands: cuaca, weather

const path = require('path')

module.exports = {
  command: ["cuaca", "weather"],
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

        if (!text) return replyalya('🌍 Eh, lokasi mana nih yang mau dicek cuacanya?')

        let wdata = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`
        );

        let textw = "";
        textw += `*🌤️✨ Cuaca di ${text} Sekarang! ✨🌤️*\n\n`;
        textw += `🌡️ *Suhu:* ${wdata.data.main.temp}°C (Terasa seperti ${wdata.data.main.feels_like}°C)\n`;
        textw += `🌥️ *Kondisi Cuaca:* ${wdata.data.weather[0].main}\n`;
        textw += `📝 *Deskripsi:* ${wdata.data.weather[0].description}\n`;
        textw += `💨 *Kecepatan Angin:* ${wdata.data.wind.speed} m/s — siap-siap topi terbang! 🎩💨\n`;
        textw += `📊 *Tekanan Udara:* ${wdata.data.main.pressure} hPa\n`;
        textw += `💧 *Kelembapan:* ${wdata.data.main.humidity}%\n`;
        textw += `📍 *Koordinat Lokasi:* \n   - *Latitude:* ${wdata.data.coord.lat}°\n   - *Longitude:* ${wdata.data.coord.lon}°\n`;
        textw += `🏳️ *Negara:* ${wdata.data.sys.country}\n\n`;
        textw += `Jangan lupa bawa payung kalau cuaca lagi gak bersahabat ya! ☔\n`;

        alya.sendMessage(
            m.chat, {
                text: textw,
            }, {
                quoted: m,
            }
        );
    }
    // ============================================================
    // ALYA V12 - .kaijadwal
    // Jadwal Kereta Api Indonesia via API KAI
    // Penggunaan: .kaijadwal [stasiun_asal] [stasiun_tujuan] [tanggal]
    // Contoh: .kaijadwal GMR YK 2025-06-01
    // ============================================================
  }
