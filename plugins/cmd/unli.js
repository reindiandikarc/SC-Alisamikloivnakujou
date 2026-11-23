// Plugin: unli
// Auto-generated from Alya V12
// Commands: unli

const path = require('path')

module.exports = {
  command: ["unli"],
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
    if (!isReseller && !isAdminP && !isPT && !isOwn) return replyall(mess.all)
    let t = text.split(',');
    if (t.length < 2) return reply(`*Format salah!*
    Penggunaan:
    ${prefix + command} user,nomer`)
    let username = t[0];
    let u = m.quoted ? m.quoted.sender : t[1] ? t[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.mentionedJid[0];
    let name = username
    let egg = global.eggsnya
    let loc = global.location3
    let memo = "0"
    let cpu = "0"
    let disk = "0"
    let email = username + "@Ryuuakbar.biz.id"
    try {
    if (!u) return
    let d = (await alya.onWhatsApp(u.split`@`[0]))[0] || {}
    let password = username + crypto.randomBytes(3).toString("hex").slice(0, 5);
    let f = await fetch(domain + "/api/application/users", {
    "method": "POST",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey
    },
    "body": JSON.stringify({
    "email": email,
    "username": username,
    "first_name": username,
    "last_name": username,
    "language": "en",
    "password": password
    })
    })
    let data = await f.json();
    if (data.errors) return reply(JSON.stringify(data.errors[0], null, 2));
    let user = data.attributes
    let f2 = await fetch(domain + "/api/application/nests/5/eggs/" + egg, {
    "method": "GET",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey
    }
    })

    const ctf = `*📦 Paket kamu sudah sampai! 📦*

    ⎙─➤ *👤 USERNAME* : *${user.username}*
    ⎙─➤ *🔐 PASSWORD* : *${password}*
    ⎙─➤ *🌐 LOGIN* : *${domain}*

    *Terima kasih telah membeli di store.alyahost.web.id / +62 831-6657-0663*

    *Syarat & Ketentuan :*
    * Expired akun *1 bulan*
    * Garansi *15 hari*
    * Dilarang menggunakan sc *DDoS*
    * Simpan data ini sebaik mungkin
    `
    alya.sendMessage(u, { caption: ctf, image: fs.readFileSync("./data/image/thumb.jpg") });
    let data2 = await f2.json();


    let f3 = await fetch(domain + "/api/application/servers", {
    "method": "POST",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey,
    },
    "body": JSON.stringify({
    "name": name,
    "description": " ",
    "user": user.id,
    "egg": parseInt(egg),
    "node": global.nodes,
    "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
    "startup": "if [[ -d .git ]] && [[ \${AUTO_UPDATE} == \"1\" ]]; then git pull; fi; if [[ ! -z \${NODE_PACKAGES} ]]; then /usr/local/bin/npm install \${NODE_PACKAGES}; fi; if [[ ! -z \${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall \${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/\${CMD_RUN}",
    "environment": {
    "INST": "npm",
    "USER_UPLOAD": "0",
    "AUTO_UPDATE": "0",
    "CMD_RUN": "npm start"
    },
    "limits": {
    "memory": memo,
    "swap": 0,
    "disk": disk,
    "io": 500,
    "cpu": cpu
    },
    "feature_limits": {
    "databases": 5,
    "backups": 5,
    "allocations": 1
    },
    deploy: {
    locations: [parseInt(loc)],
    dedicated_ip: false,
    port_range: [],
    },
    })
    })
    let res = await f3.json()
    if (res.errors) return reply(JSON.stringify(res.errors[0], null, 2))
    let server = res.attributes
    let p = await reply(`
    *SUCCESSFULLY ADD USER + SERVER*
    TYPE: user
    ID: ${user.id}
    NAME: ${user.first_name} ${user.last_name}
    MEMORY: ${server.limits.memory === 0 ? 'Unlimited' : server.limits.memory} MB
    DISK: ${server.limits.disk === 0 ? 'Unlimited' : server.limits.disk} MB
    CPU: ${server.limits.cpu}%

    `)
    } catch {
      reply('yah gagal om...\n_silakan cek api plta dan pltc anda_')
    }
    //==================================================================

//     case "delid": {
      if (!Ryuu) return replytolak(mess.only.owner);

      const filePath = './database/listid.json';
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));

      let daftarSaluran = JSON.parse(fs.readFileSync(filePath));
      let idTarget = text && text.trim().length > 5 ? text.trim() : m.chat;

      if (!daftarSaluran.includes(idTarget)) {
        return replyalya(`⚠️ ID tidak ada di daftar: ${idTarget}`);
      }

      daftarSaluran = daftarSaluran.filter(id => id !== idTarget);
      fs.writeFileSync(filePath, JSON.stringify(daftarSaluran, null, 2));

      replyalya(`✅ ID berhasil dihapus!\n📌 ID: ${idTarget}\n📊 Total ID: ${daftarSaluran.length}`);

// [REMOVED]     case "listid": {
      if (!Ryuu) return replytolak(mess.only.owner);

      let filePath_local = './database/listid.json';
      if (!fs.existsSync(filePath_local)) fs.writeFileSync(filePath_local, JSON.stringify([]));

      let daftarSaluran_local = JSON.parse(fs.readFileSync(filePath_local));

      if (daftarSaluran_local.length === 0) return replyalya("📭 Tidak ada ID yang terdaftar.");

      let teks = "📋 *Daftar Channel Tersimpan:*\n\n";

      for (let i = 0; i < daftarSaluran_local.length; i++) {
        let id = daftarSaluran_local[i];
        try {
          if (id.endsWith("@g.us")) {
            let metadata = await alya.groupMetadata(id);
            let nama = metadata.subject || "Unknown";
            let jumlah = metadata.participants ? metadata.participants.length : "Unknown";
            teks += `${i + 1}. 📌 *${nama}*\n👥 ${jumlah} anggota\n🆔 ${id}\n\n`;
          } else {
            let name = (await alya.onWhatsApp(id))[0]?.notify || "Unknown";
            teks += `${i + 1}. 👤 *${name}*\n🆔 ${id}\n\n`;
          }
        } catch {
          teks += `${i + 1}. 📌 *Unknown*\n👥 Unknown anggota\n🆔 ${id}\n\n`;
        }
      }

      replyalya(teks);
  }
}
