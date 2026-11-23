// Plugin: tempmail
// Auto-generated from Alya V12
// Commands: tempmail

const path = require('path')

module.exports = {
  command: ["tempmail"],
  tags: ['ai'],
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

    if (!isPrem) return replyalya(mess.premium)
      const axios = require('axios')

      class TempMail {
        constructor() {
          this.cookie = null;
          this.baseUrl = 'https://tempmail.so';
        }

        async updateCookie(response) {
          if (response.headers['set-cookie']) {
            this.cookie = response.headers['set-cookie'].join('; ');
          }
        }

        async makeRequest(url) {
          const response = await axios({
            method: 'GET',
            url: url,
            headers: {
              'accept': 'application/json',
              'cookie': this.cookie || '',
              'referer': this.baseUrl + '/',
              'x-inbox-lifespan': '600',
              'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
              'sec-ch-ua-mobile': '?1'
            }
          });
          await this.updateCookie(response);
          return response;
        }

        async initialize() {
          const response = await axios.get(this.baseUrl, {
            headers: {
              'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
              'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"'
            }
          });
          await this.updateCookie(response);
          return this;
        }

        async getInbox() {
          const url = `${this.baseUrl}/us/api/inbox?requestTime=${Date.now()}&lang=us`;
          const response = await this.makeRequest(url);
          return response.data;
        }

        async getMessage(messageId) {
          const url = `${this.baseUrl}/us/api/inbox/messagehtmlbody/${messageId}?requestTime=${Date.now()}&lang=us`;
          const response = await this.makeRequest(url);
          return response.data;
        }
      }

      async function createTempMail() {
        const mail = new TempMail();
        await mail.initialize();
        return mail;
      }

      try {
        const mail = await createTempMail();
        const inbox = await mail.getInbox();

        if (!inbox.data?.name) {
          throw new Error('Gagal mendapatkan email sementara.');
        }

        const emailInfo = `📩 *Temporary Email*\n\n📧 *Email:* ${inbox.data.name}\n⏱️ *Expired:* 10 Menit\n📥 *Inbox:* ${inbox.data.inbox?.length || 0} Pesan\n\n💡 Email ini otomatis terhapus setelah 10 menit.`;
        await replyalya(emailInfo);

        const state = {
          processedMessages: new Set(),
          lastCheck: Date.now(),
          isRunning: true
        };

        const processInbox = async () => {
          if (!state.isRunning) return;

          try {
            const updatedInbox = await mail.getInbox();

            if (updatedInbox.data?.inbox?.length > 0) {
              const sortedMessages = [...updatedInbox.data.inbox].sort((a, b) =>
                new Date(b.date) - new Date(a.date)
              );

              for (const message of sortedMessages) {
                if (!state.processedMessages.has(message.id)) {
                  const messageDetail = await mail.getMessage(message.id);
                  let cleanContent = messageDetail.data?.html
                    ? messageDetail.data.html.replace(/<[^>]*>?/gm, '').trim()
                    : 'Tidak ada isi pesan';

                  const messageInfo = `📬 *Pesan Baru*\n\n👤 *From:* ${message.from || 'Anonim'}\n📌 *Subject:* ${message.subject || 'Tidak ada'}\n\n📝 *Isi Pesan:*\n${cleanContent}`;
                  await alya.sendMessage(m.chat, { text: messageInfo }, { quoted: m });
                  state.processedMessages.add(message.id);
                }
              }
            }
          } catch (err) {
            console.error('Gagal membaca inbox:', err.message);
          }
        };

        await processInbox();
        const checkInterval = setInterval(processInbox, 10000);

        setTimeout(() => {
          state.isRunning = false;
          clearInterval(checkInterval);
          m.reply('⏳ Email temporary telah kedaluwarsa dan dihapus otomatis.');
        }, 600000);

      } catch (error) {
        m.reply(`❌ *Gagal:* ${error.message}`);
      }
  }
}
