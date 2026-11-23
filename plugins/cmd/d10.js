// Plugin: d10
// Auto-generated from Alya V12
// Commands: d10

const path = require('path')

module.exports = {
  command: ["d10"],
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
               function subDomain1(host, ip) {
                 return new Promise((resolve) => {
                   let zone = "15b97d8a42af1c00a70070e577ce7301";
                   let apitoken = "RsbJAI6X7s7bPEj23R7sf28cqHibApP1EBSoF4FZ"
                   let tld = "kiospanell.my.id";
                   axios
                     .post(
                       `https://api.cloudflare.com/client/v4/zones/${zone}/dns_records`,
                       { type: "A", name: host.replace(/[^a-z0-9.-]/gi, "") + "." + tld, content: ip.replace(/[^0-9.]/gi, ""), ttl: 3600, priority: 10, proxied: false },
                       {
                         headers: {
                           Authorization: "Bearer " + apitoken,
                           "Content-Type": "application/json",
                         },
                       }
                     )
                     .then((e) => {
                       let res = e.data;
                       if (res.success) resolve({ success: true, zone: res.result?.zone_name, name: res.result?.name, ip: res.result?.content });
                     })
                     .catch((e) => {
                       let err1 = e.response?.data?.errors?.[0]?.message || e.response?.data?.errors || e.response?.data || e.response || e;
                       let err1Str = String(err1);
                       resolve({ success: false, error: err1Str });
                     });
                 });
               }

               let raw1 = args?.join(" ")?.trim();
               if (!raw1) return replyalya("mana host & ip nya?");
               let host1 = raw1
                 .split("|")[0]
                 .trim()
                 .replace(/[^a-z0-9.-]/gi, "");
               if (!host1) return replyalya("host tidak valid, pastikan host hanya mengandung huruf, angka, - (strip), dan . (titik)");
               let ip1 = raw1.split("|")[1]?.replace(/[^0-9.]/gi, "");
               if (!ip1 || ip1.split(".").length < 4) return reply(ip1 ? "ip tidak valid" : "mana ip nya");

               subDomain1(host1, ip1).then((e) => {
                              if (e['success']) reply(`┏━━━━━━━━━━━━━━━━━━━\n┣ Ip = ${e['ip']}\n┗━━━━━━━━━━━━━━━━━━━\n┣ Link = ${e['name']}\n┗━━━━━━━━━━━━━━━━━━━\n┣ 𝘾𝙧𝙚𝙖𝙩𝙚 𝙗𝙮 = 𝙒𝙞𝙣𝙙𝙖𝙃𝙤𝙩𝙨\n┗━━━━━━━━━━━━━━━━━━━`);
                 else reply(`gagal membuat subdomain\nMsg: ${e['error']}`)
               }); }
  }
