// Plugin: installtemanebula
// Auto-generated from Alya V12
// Commands: installtemanebula

const path = require('path')

module.exports = {
  command: ["installtemanebula"],
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

      if (!Ryuu) return replytolak(mess.only.owner)
      if (!text || !text.split("|")) return m.reply(example("ipvps|pwvps"));
      let vii = text.split("|");
      if (vii.length < 2) return m.reply(example("ipvps|pwvps"));

      global.installtema = {
        vps: vii[0],
        pwvps: vii[1]
      };
      if (!global.installtema) return m.reply("Ip / Password Vps Tidak Ditemukan");

      let ipvps = global.installtema.vps;
      let passwd = global.installtema.pwvps;

      const connSettings = {
        host: ipvps,
        port: '22',
        username: 'root',
        password: passwd
      };
      const commandDepend = `bash <(curl -s https://raw.githubusercontent.com/KiwamiXq1031/installer-premium/refs/heads/main/zero.sh)`;
      const commandNebula = `bash <(curl -s https://raw.githubusercontent.com/KiwamiXq1031/installer-premium/refs/heads/main/zero.sh)`;
      const ress = new Client();
      ress.on('ready', async () => {
        m.reply("Memproses instalasi, tunggu 1-10 menit...");
        ress.exec(commandDepend, (err, stream) => {
          if (err) throw err;
          stream.on('close', async (code, signal) => {
            ress.exec(commandNebula, (err2, stream2) => {
              if (err2) throw err2;
              stream2.on('close', async (code2, signal2) => {
                await m.reply("Berhasil install tema nebula pterodactyl ✅");
                ress.end();
              }).on('data', async (data) => {
                console.log(data.toString());
                stream2.write('2\n');
                stream2.write('\n');
                stream2.write('\n');
              }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
              });
            });
          }).on('data', async (data) => {
            console.log(data.toString());
            stream.write('11\n');
            stream.write('A\n');
            stream.write('Y\n');
            stream.write('Y\n');
          }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
          });
        });
      }).on('error', (err) => {
        console.log('Connection Error: ' + err);
        m.reply('Kata sandi atau IP tidak valid');
      }).connect(connSettings);
  }
}
