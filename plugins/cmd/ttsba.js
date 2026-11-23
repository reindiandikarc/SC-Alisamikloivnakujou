// Plugin: ttsba
// Auto-generated from Alya V12
// Commands: ttsba

const path = require('path')

module.exports = {
  command: ["ttsba"],
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

      if (!text) return replyalya(`Masukkan teks dan karakter!\n\nContoh: ${prefix + command} halo|momoi`);

      const translate = require('translate-google-api');
      const ws = require('ws');

      class BlueArchive {
        voice = async function voice(text, model = "Airi", speed = 1.2) {
          return new Promise(async (resolve, reject) => {
            try {
              if (!text || text.length >= 500) throw new Error(`Masukkan teks yang valid dan tidak lebih dari 500 karakter.`);
              if (speed && (speed < 0.1 || speed > 2)) speed = 2;
              model = "JP_" + model;
              const base_url = "https://ori-muchim-bluearchivetts.hf.space/";
              const session_hash = this.generateSession();
              const socket = new ws("wss://ori-muchim-bluearchivetts.hf.space/queue/join");

              socket.on("message", (data) => {
                const d = JSON.parse(data.toString("utf8"));
                switch (d.msg) {
                  case "send_hash":
                    socket.send(JSON.stringify({ fn_index: 0, session_hash }));
                  case "send_data":
                    socket.send(JSON.stringify({ fn_index: 0, session_hash, data: [text, model, speed] }));
                  case "process_completed":
                    const o = d.output;
                    const name = o.data[1]?.name;
                    socket.close();
                    return resolve({
                      result: {
                        duration: +o.duration.toFixed(2),
                        url: base_url + "file=" + name,
                      },
                    });
                }
              });
            } catch (e) {
              return reject(`Gagal memproses voice: ${e.message}`);
            }
          });
        };

        generateSession = function () {
          return Math.random().toString(36).substring(2);
        };
      }

      try {
        let [teks, char, sped] = text.split('|');
        if (!teks || !char) return replyalya(`Contoh: ${prefix + command} halo dunia|momoi`);

        const suppVoice = [ 'airi','akane','akari','ako','aris','arona','aru','asuna','atsuko','ayane','azusa','cherino','chihiro','chinatsu','chise','eimi','erica','fubuki','fuuka','hanae','hanako','hare','haruka','haruna','hasumi','hibiki','hihumi','himari','hina','hinata','hiyori','hoshino','iori','iroha','izumi','izuna','juri','kaede','karin','kayoko','kazusa','kirino','koharu','kokona','kotama','kotori','main','maki','mari','marina','mashiro','michiru','midori','miku','mimori','misaki','miyako','miyu','moe','momoi','momoka','mutsuki','NP0013','natsu','neru','noa','nodoka','nonomi','pina','rin','saki','saori','saya','sena','serika','serina','shigure','shimiko','shiroko','shizuko','shun','ShunBaby','sora','sumire','suzumi','tomoe','tsubaki','tsurugi','ui','utaha','wakamo','yoshimi','yuuka','yuzu','zunko' ];

        if (!suppVoice.includes(char.toLowerCase())) {
          const txtVoice = suppVoice.map(v => `> - ${v}`).join('\n');
          return replyalya(`*Karakter tidak ditemukan!*\nBerikut list char yang didukung:\n${txtVoice}`);
        }

        replyalya('⏳ Sedang memproses suara...');
        const pedo = new BlueArchive();
        const translated = await translate(teks, { to: 'ja', autoCorrect: false });
        const ba = await pedo.voice(translated[0], char.charAt(0).toUpperCase() + char.slice(1).toLowerCase(), sped || 1);

        alya.sendMessage(m.chat, {
          audio: { url: ba.result.url },
          mimetype: 'audio/mpeg',
          ptt: true
        }, { quoted: m });

      } catch (e) {
        console.error(e);
        replyalya('Terjadi kesalahan saat mengubah teks menjadi suara.');
      }
  }
}
