import config from "../../config.js";
import te from "../../src/lib/vemzo-error.js";

const pluginConfig = {
  name: "tekss",
  alias: ["tekssticker", "stikerteks"],
  category: "sticker",
  description: "Membuat sticker Brat dari teks",
  usage: ".tekss <text>",
  example: ".tekss Hai semua",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = (m.args || []).join(" ").trim();

  if (!text) {
    return m.reply(
      `🖼️ *TEKSS STICKER*\n\n` +
      `Masukkan teks yang ingin dibuat menjadi sticker.\n\n` +
      `Contoh:\n` +
      `\`${m.prefix}tekss Hai semua\``
    );
  }

  await m.react("🕕");

  try {
    const url =
      `https://api.nexray.eu.cc/maker/brat?text=${encodeURIComponent(text)}`;

    await sock.sendImageAsSticker(
      m.chat,
      url,
      m,
      {
        packname: config.sticker.packname,
        author: config.sticker.author,
      }
    );

    await m.react("✅");
  } catch (error) {
    console.error("ERROR TEKSS:", error);
    await m.react("❌");
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
