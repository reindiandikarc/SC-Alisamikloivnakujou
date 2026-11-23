// Plugin: confess
// Auto-generated from Alya V12
// Commands: confess

const path = require('path')

module.exports = {
  command: ["confess"],
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

        alya.menfes = alya.menfes ?? {};
        const session = Object.values(alya.menfes).find(v => v.state === 'CHATTING' && [v.a, v.b].includes(m.sender));
        if (session) {
            const target = session.a === m.sender ? session.b : session.a;
            await alya.sendMessage(target, {
                text: `📩 Pesan baru dari @${m.sender.split('@')[0]}:\n\n${m.text}`,
                mentions: [m.sender],
            });
            replyalya("Pesan diteruskan.");
            return;
        }
        const roof = Object.values(alya.menfes).find(menpes => [menpes.a, menpes.b].includes(m.sender));
        if (roof) return replyalya("Kamu masih berada dalam sesi menfess");
        if (m.isGroup) return replyalya("Fitur hanya tersedia di private chat!");
        if (!text) return reply(`Kirim perintah ${prefix + command} nama|nomor|pesan\n\nContoh:\n${prefix + command} ${pushname}|628xxx|Menfess nih`);
        if (!text.includes('|')) return replyalya("Format salah! Gunakan format: nama|nomor|pesan");

        let [namaNya, nomorNya, pesanNya] = text.split('|');
        nomorNya = nomorNya.replace(/^0/, '62');
        if (isNaN(nomorNya)) return replyalya("Nomor tidak valid! Pastikan hanya menggunakan angka.");

        const yoi = `Hi ada menfess nih buat kamu\n\nDari: ${namaNya}\nPesan: ${pesanNya}\n\nKetik:\n${prefix}balasmenfess -- Untuk menerima menfess\n${prefix}tolakmenfess -- Untuk menolak menfess\n\n_Pesan ini dikirim oleh bot._`;

        // ✅ FIX: gambar thumbnail ini cuma dekorasi, bukan inti fitur.
        // Sebelumnya kalau gagal fetch, getBuffer (bug lama) return objek
        // Error yang dikirim sebagai gambar, bikin pesan gagal terkirim
        // total. Sekarang fetch dibungkus try/catch — kalau gagal, kirim
        // tanpa gambar saja, fitur menfess intinya tetap jalan.
        let tod = null;
        try {
            tod = await getBuffer('https://telegra.ph/file/c8fdfc8426f5f60b48cca.jpg');
            if (!Buffer.isBuffer(tod)) tod = null;
        } catch (e) {
            console.error('[confess] gagal fetch thumbnail, lanjut tanpa gambar:', e?.message || e);
        }

        const id = m.sender;
        alya.menfes[id] = {
            id,
            a: m.sender,
            b: `${nomorNya}@s.whatsapp.net`,
            state: 'WAITING',
        };

        if (tod) {
            await alya.sendMessage(`${nomorNya}@s.whatsapp.net`, { image: tod, caption: yoi });
        } else {
            await alya.sendMessage(`${nomorNya}@s.whatsapp.net`, { text: yoi });
        }
        replyalya("Pesan berhasil dikirim ke nomor tujuan. Semoga dibalas ya!");
  }
}
