// Plugin: createadmin
// Auto-generated from Alya V12
// Commands: createadmin

const path = require('path')

module.exports = {
  command: ["createadmin"],
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

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isPT && !isOwn && !Ryuu) return replyhigh(mess.high)
    let s = q.split(',')
    let email = s[0];
    let username = s[0]
    let nomor = s[1]
    if (s.length < 2) return reply(`*Format salah!*
    Penggunaan:
    ${prefix + command} user,nomer`)
    if (!username) return reply(`Ex : ${prefix+command} Username,@tag/nomor\n\nContoh :\n${prefix+command} example,@user`)
    if (!nomor) return reply(`Ex : ${prefix+command} Username,@tag/nomor\n\nContoh :\n${prefix+command} example,@user`)
    let password = username + crypto.randomBytes(3).toString("hex").slice(0, 5);
    let nomornya = nomor.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
    let f = await fetch(domain + "/api/application/users", {
    "method": "POST",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey
    },
    "body": JSON.stringify({
    "email": username + "@Ryuuakbar.biz.id",
    "username": username,
    "first_name": username,
    "last_name": "Memb",
    "language": "en",
     "root_admin" : true,
    "password": password.toString()
    })

    })

    let data = await f.json();

    if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));

    let userAlt = data.attributes

    let tks = `
    TYPE: user

    📡ID: ${userAlt.id}
    🌷UUID: ${userAlt.uuid}
    👤USERNAME: ${userAlt.username}
    📬EMAIL: ${userAlt.email}
    🦖NAME: ${userAlt.first_name} ${userAlt.last_name}
    🔥LANGUAGE: ${userAlt.language}
    📊ADMIN: ${userAlt.root_admin}
    ☢️CREATED AT: ${userAlt.created_at}

    🖥️LOGIN: ${domain}
    `
        const listMessage = {

            text: tks,

        }



        await alya.sendMessage(m.chat, listMessage)

        await alya.sendMessage(nomornya, {

            text: `*📦 Paket kamu sudah sampai! 📦*

    ⎙─➤ *👤USERNAME* : *${username}*
    ⎙─➤ *🔐PASSWORD* : *${password}*
    ⎙─➤ *🌐LOGIN* : *${domain}*

    *Terima kasih telah membeli di store.alyahost.web.id / +62 831-6657-0663*

    *Syarat & Ketentuan :*
    * Dilarang menggunakan sc *DDoS*
    * Dilarang menambahkan *egg* tanpa izin pemilik
    * Dilarang menghidupkan *a2f / rusuh*
    * Dilarang menghapus *akun admin*
    * Dilarang *mengintip/nyolong/ganti sc*
    * Jika salah satu tersebut dilanggar akan *diblacklist dan hukuman lainnya*
    * Simpan data ini sebaik mungkin`,

        })

//             case 'listadm': {
      if (!Ryuu) return replytolak(`Maaf, Anda tidak dapat melihat daftar pengguna.`);
      let page = args[0] ? args[0] : '1';
      let f_local = await fetch(domain + "/api/application/users?page=" + page, {
        "method": "GET",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apikey
        }
      });
      let res = await f_local.json();
      let users = res.data;
      let messageText = "Berikut list admin:\n\n";

      for (let user of users) {
        let u = userAlt.attributes;
        if (u.root_admin) {
          messageText += `ID: ${u.id} - Status: ${u.attributes?.user?.server_limit === null ? 'Inactive' : 'Active'}\n`;
          messageText += `${u.username}\n`;
          messageText += `${u.first_name} ${u.last_name}\n\n`;
        }
      }

      messageText += `Page: ${res.meta.pagination.current_page}/${res.meta.pagination.total_pages}\n`;
      messageText += `Total Admin: ${res.meta.pagination.count}`;

      await alya.sendMessage(m.chat, { text: messageText }, { quoted: m });

      if (res.meta.pagination.current_page < res.meta.pagination.total_pages) {
        m.reply(`Gunakan perintah ${prefix}listusr ${res.meta.pagination.current_page + 1} untuk melihat halaman selanjutnya.`);
      }
  }
}
