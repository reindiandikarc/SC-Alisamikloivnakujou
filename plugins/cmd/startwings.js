// Plugin: startwings
// Auto-generated from Alya V12
// Commands: startwings

const path = require('path')

module.exports = {
  command: ["startwings"],
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
    let t = text.split('|')
    if (t.length < 3) return m.reply(example("ipvps|pwvps|token_node"))

    let ipvps = t[0]
    let passwd = t[1]
    let token = t[2]

    const connSettings = {
     host: ipvps,
     port: '22',
     username: 'root',
     password: passwd
    }

    let commandAlt = `${token} && systemctl start wings`
    const ress = new Client();

    ress.on('ready', () => {
    ress.exec(command, (err, stream) => {
    if (err) throw err
    stream.on('close', async (code, signal) => {
    await m.reply("*Berhasil menjalankan wings ✅*\n* Status wings : *aktif*")
    ress.end()
    }).on('data', async (data) => {
    await console.log(data.toString())
    }).stderr.on('data', (data) => {
    stream.write("y\n")
    stream.write("systemctl start wings\n")
    m.reply('STDERR: ' + data);
    });
    });
    }).on('error', (err) => {
    console.log('Connection Error: ' + err);
    m.reply('Katasandi atau IP tidak valid');
    }).connect(connSettings);
    }
    //================================================================================
  }
