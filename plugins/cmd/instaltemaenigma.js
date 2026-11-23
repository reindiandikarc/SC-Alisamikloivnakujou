// Plugin: instaltemaenigma
// Auto-generated from Alya V12
// Commands: installtemaenigma, instaltemaenigma

const path = require('path')

module.exports = {
  command: ["installtemaenigma", "instaltemaenigma"],
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
    if (!text || !text.split("|")) return m.reply("ipvps|pwvps")
    let vii = text.split("|")
    if (vii.length < 2) return m.reply("ipvps|pwvps")
    global.installtema = {
    vps: vii[0],
    pwvps: vii[1]
    }

    if (global.installtema == undefined) return m.reply("Ip / Password Vps Tidak Ditemukan")

    let ipvps = global.installtema.vps
    let passwd = global.installtema.pwvps

    const connSettings = {
     host: ipvps,
     port: '22',
     username: 'root',
     password: passwd
    }

    let commandAlt = `bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/install.sh)`
    const ress = new Client();

    ress.on('ready', () => {
    m.reply("Memproses install *tema enigma* pterodactyl\nTunggu 1-10 menit hingga proses selsai")
    ress.exec(command, (err, stream) => {
    if (err) throw err
    stream.on('close', async (code, signal) => {
    await m.reply("Berhasil install *tema enigma* pterodactyl ✅")
    ress.end()
    }).on('data', async (data) => {
    console.log(data.toString())
    stream.write(`skyzodev\n`); // Key Token : skyzodev
    stream.write('1\n');
    stream.write('3\n');
    stream.write('https://wa.me/6285624297893\n');
    stream.write('https://whatsapp.com/channel/0029VaYoztA47XeAhs447Y1s\n');
    stream.write('https://chat.whatsapp.com/IP1KjO4OyM97ay2iEsSAFy\n');
    stream.write('yes\n');
    stream.write('x\n');
    }).stderr.on('data', (data) => {
    console.log('STDERR: ' + data)
    });
    });
    }).on('error', (err) => {
    console.log('Connection Error: ' + err);
    m.reply('Katasandi atau IP tidak valid');
    }).connect(connSettings);
    }
    //================================================================================
  }
