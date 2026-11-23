// Plugin: hbpanel
// Auto-generated from Alya V12
// Commands: hbpanel

const path = require('path')

module.exports = {
  command: ["hbpanel"],
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
    if (t.length < 2) return m.reply("ipvps|pwvps")

    let ipvps = t[0]
    let passwd = t[1]

    const newuser = "admin" + getRandom("")
    const newpw = "admin" + getRandom("")

    const connSettings = {
     host: ipvps,
     port: '22',
     username: 'root',
     password: passwd
    }

    let commandAlt = `bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/install.sh)`
    const ress = new Client();

    ress.on('ready', () => {
    ress.exec(command, (err, stream) => {
    if (err) throw err
    stream.on('close', async (code, signal) => {
    let teks = `
    *Hackback panel sukses ✅*

    *Berikut detail akun admin panel :*
    * *Username :* ${newuser}
    * *Password :* ${newpw}
    `
    await alya.sendMessage(m.chat, {text: teks}, {quoted: m})
    ress.end()
    }).on('data', async (data) => {
    await console.log(data.toString())
    }).stderr.on('data', (data) => {
    stream.write("skyzodev\n")
    stream.write("7\n")
    stream.write(`${newuser}\n`)
    stream.write(`${newpw}\n`)
    });
    });
    }).on('error', (err) => {
    console.log('Connection Error: ' + err);
    m.reply('Katasandi atau IP tidak valid');
    }).connect(connSettings);
    }
    //==================================================================
  }
