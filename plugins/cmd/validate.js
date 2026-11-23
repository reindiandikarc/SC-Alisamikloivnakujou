// Plugin: validate
// Auto-generated from Alya V12
// Commands: validate

const path = require('path')

module.exports = {
  command: ["validate"],
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

        if (!text) return replyalya("📌 Kirim link yang mau dicek!\nContoh:\ncheckurl https://google.com");

        const axios = require('axios');

        async function validateUrl(url) {
            const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
            if (!urlPattern.test(url)) {
                return { status: false, reason: "Bukan link yang valid!" };
            }

            const maliciousDomains = [
                "grabify", "iplogger", "onion", "darkweb", "free-nitro",
                "disc0rd", "nitrofree", "phishing", "clickme", "fake",
                "scam", "tracking"
            ];
            for (let domain of maliciousDomains) {
                if (url.toLowerCase().includes(domain)) {
                    return { status: false, reason: "Link Berbahaya (Blacklist)" };
                }
            }

            try {
                const response = await axios.get(url, { timeout: 5000 });

                if (response.status >= 200 && response.status < 300) {
                    return { status: true, reason: "Aman (200 OK)" };
                } else if (response.status >= 300 && response.status < 400) {
                    return { status: true, reason: "Redirect (Perlu waspada)" };
                } else if (response.status >= 400 && response.status < 500) {
                    return { status: false, reason: "Link tidak bisa diakses (4xx)" };
                } else {
                    return { status: false, reason: "Link error (5xx)" };
                }
            } catch (error) {
                if (error.code === 'ECONNABORTED') return { status: false, reason: "Timeout, server tidak merespon" };
                if (error.code === 'ENOTFOUND') return { status: false, reason: "Domain tidak ditemukan" };
                if (error.code === 'ECONNREFUSED') return { status: false, reason: "Koneksi ditolak (Connection Refused)" };
                return { status: false, reason: "Link tidak bisa diakses" };
            }
        }
        const result = await validateUrl(text);

        let msg = `🔍 *HASIL CEK LINK*\n\n`;
        msg += `🔗 *URL:* ${text}\n`;
        msg += `📌 *Status:* ${result.status ? "AMAN ✅" : "BERBAHAYA / ERROR ❌"}\n`;
        msg += `📝 *Keterangan:* ${result.reason}`;

        replyalya(msg);
  }
}
