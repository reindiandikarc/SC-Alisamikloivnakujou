import te from "../../src/lib/ourin-error.js";
import { f } from "../../src/lib/ourin-http.js";

const pluginConfig = {
  name: "pap",
  alias: ["papcewe", "papcowo", "papfemboy"],
  category: "search",
  description: "Minta pap cewe, cowo, atau femboy dari Pinterest",
  usage: ".pap <cewe/cowo/femboy>",
  example: ".pap cewe",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const arg = m.args[0]?.toLowerCase();
  const validTypes = ["cewe", "cowo", "femboy"];

  if (!arg || !validTypes.includes(arg)) {
    return m.reply("❌ Pilih salah satu tipe pap yang tersedia: `cewe`, `cowo`, atau `femboy`.\n\nContoh: `.pap cewe`");
  }

  await m.react("🕕");

  try {
    const query = arg;
    
    const data = await f(
      `https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(query)}&type=image`
    );

    const results = data?.data?.results?.filter(item => item.image_url);
    if (!results || results.length === 0) {
      await m.react("❌");
      return m.reply(`❌ Waduh, pap ${query} lagi kosong nih. Coba lagi nanti.`);
    }

    const randomItem = results[Math.floor(Math.random() * results.length)];
    const imageUrl = randomItem.image_url;

    if (!imageUrl) {
      await m.react("❌");
      return m.reply("⚠️ Gambar tidak tersedia.");
    }

    await sock.sendButtons(m.chat, {
      image: { url: imageUrl },
      text: `📸 *PAP ${arg.toUpperCase()}*`,
      footer: "Pilih menu pap lainnya di bawah ini 👇",
      buttons: [
        { displayText: "🔁 Next", id: `${m.prefix}pap ${arg}` },
        { displayText: "👧 Cewe", id: `${m.prefix}pap cewe` },
        { displayText: "👦 Cowo", id: `${m.prefix}pap cowo` },
        { displayText: "⚧ Femboy", id: `${m.prefix}pap femboy` },
      ],
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[PAP Search]", error.message);
    await m.react("☢");
    m.reply("😔 Gagal memuat PAP. Server Pinterest mungkin sedang bermasalah.");
  }
}

export { pluginConfig as config, handler };
